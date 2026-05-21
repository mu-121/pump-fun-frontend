import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@/providers/WalletModalProvider';
import { Wallet } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input, Textarea } from '@/components/ui/Input';
import { ImageDropzone } from '@/components/token/ImageDropzone';
import { TokenCard } from '@/components/token/TokenCard';
import { LaunchProgress, type LaunchStage } from '@/components/token/LaunchProgress';
import { createTokenLaunch, submitTokenLaunch, buildSwap, submitSwap } from '@/lib/api';
import { deserializeTx, explainTxError, serializeSignedTx } from '@/lib/tx';
import { env } from '@/lib/env';
import type { Token } from '@/types';

const TWITTER_HOST_RE = /^https?:\/\/(www\.)?(twitter|x)\.com\//i;
const TELEGRAM_HOST_RE = /^https?:\/\/(www\.)?t\.me\//i;

const schema = z.object({
  name: z.string().trim().min(1, 'Required').max(32, 'Max 32 characters'),
  symbol: z
    .string()
    .trim()
    .min(1, 'Required')
    .max(10, 'Max 10 characters')
    .regex(/^[A-Z0-9]+$/, 'Letters & numbers only'),
  description: z.string().trim().min(10, 'At least 10 characters').max(500, 'Max 500 characters'),
  twitter: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || TWITTER_HOST_RE.test(v), 'Must be a twitter.com or x.com URL'),
  telegram: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || TELEGRAM_HOST_RE.test(v), 'Must be a t.me URL'),
  website: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || /^https?:\/\//i.test(v), 'Must start with http:// or https://'),
  initialBuySol: z
    .number({ invalid_type_error: 'Number required' })
    .min(0, 'Must be ≥ 0')
    .max(5, 'Max 5 SOL'),
});

type FormValues = z.infer<typeof schema>;

const DEFAULT_VALUES: FormValues = {
  name: '',
  symbol: '',
  description: '',
  twitter: '',
  telegram: '',
  website: '',
  initialBuySol: 0,
};

export function CreateTokenPage(): JSX.Element {
  const navigate = useNavigate();
  const { publicKey, signTransaction } = useWallet();
  const { setVisible: setWalletModalVisible } = useWalletModal();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: DEFAULT_VALUES,
    mode: 'onTouched',
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  // Launch-progress state machine
  const [stage, setStage] = useState<LaunchStage>('idle');
  const [signature, setSignature] = useState<string | null>(null);
  const [initialBuySignature, setInitialBuySignature] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Remember the last submitted values so Retry re-runs them without losing state
  const lastSubmitRef = useRef<FormValues | null>(null);

  const values = watch();
  const previewToken = useMemo<Token>(
    () => buildPreviewToken(values, imageFile),
    [values, imageFile],
  );

  const connected = Boolean(publicKey && signTransaction);

  const closeProgress = (): void => {
    setStage('idle');
    setErrorMessage(null);
    setSignature(null);
    setInitialBuySignature(null);
  };

  async function runLaunch(form: FormValues): Promise<void> {
    if (!publicKey || !signTransaction) {
      toast.error('Connect your wallet first');
      return;
    }
    if (!imageFile) {
      setImageError('Required');
      return;
    }
    setImageError(null);
    setErrorMessage(null);
    setSignature(null);
    setInitialBuySignature(null);

    try {
      // 1. Upload + build create-pool tx
      setStage('uploading');
      const launch = await createTokenLaunch({
        name: form.name,
        symbol: form.symbol,
        description: form.description,
        ...(form.twitter ? { twitter: form.twitter } : {}),
        ...(form.telegram ? { telegram: form.telegram } : {}),
        ...(form.website ? { website: form.website } : {}),
        creatorAddress: publicKey.toBase58(),
        image: imageFile,
      });

      // 2. Wallet signature
      setStage('awaitingSignature');
      const unsigned = deserializeTx(launch.unsignedTx);
      const signed = await signTransaction(unsigned);
      const signedB64 = serializeSignedTx(signed);

      // 3. Submit + confirm via backend
      setStage('confirming');
      const result = await submitTokenLaunch({
        launchSessionId: launch.launchSessionId,
        signedTx: signedB64,
      });
      setSignature(result.signature);

      // 4. Optional initial buy
      if (form.initialBuySol > 0) {
        setStage('initialBuySigning');
        const lamports = BigInt(Math.floor(form.initialBuySol * 1e9));
        const swap = await buildSwap({
          mint: result.mintAddress,
          side: 'buy',
          amount: lamports.toString(),
          slippageBps: 500,
          user: publicKey.toBase58(),
          priorityFeeMode: 'auto',
        });
        const swapTx = deserializeTx(swap.unsignedTx);
        const signedSwap = await signTransaction(swapTx);
        const signedSwapB64 = serializeSignedTx(signedSwap);

        setStage('initialBuyConfirming');
        const swapResult = await submitSwap({
          signedTx: signedSwapB64,
          blockhash: swap.blockhash,
          lastValidBlockHeight: swap.lastValidBlockHeight,
        });
        setInitialBuySignature(swapResult.signature);
      }

      setStage('success');
      toast.success('Token launched');
      // Give the user a beat to see the success state, then navigate.
      window.setTimeout(() => {
        navigate(`/token/${result.mintAddress}`);
      }, 900);
    } catch (err) {
      const message = explainTxError(err);
      setErrorMessage(message);
      setStage('error');
      toast.error(message);
    }
  }

  const onSubmit = handleSubmit(async (form) => {
    lastSubmitRef.current = form;
    if (!imageFile) {
      setImageError('Required');
      return;
    }
    await runLaunch(form);
  });

  const retry = (): void => {
    if (lastSubmitRef.current) void runLaunch(lastSubmitRef.current);
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Launch a new token</h1>
        <p className="text-sm text-text-muted mt-1">
          Configure metadata, upload art, and sign the launch transaction.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Form column */}
        <Card>
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Name"
                placeholder="My Awesome Coin"
                maxLength={32}
                {...register('name')}
                errorText={errors.name?.message}
              />
              <Input
                label="Symbol"
                placeholder="MAC"
                maxLength={10}
                {...register('symbol', {
                  onChange: (e) => {
                    const v = String(e.target.value).toUpperCase().replace(/[^A-Z0-9]/g, '');
                    setValue('symbol', v, { shouldValidate: true });
                  },
                })}
                errorText={errors.symbol?.message}
              />
            </div>

            <Textarea
              label="Description"
              placeholder="What's this token about?"
              maxLength={500}
              rows={4}
              {...register('description')}
              errorText={errors.description?.message}
              helperText={
                errors.description
                  ? undefined
                  : `${values.description?.length ?? 0} / 500 characters`
              }
            />

            <ImageDropzone
              file={imageFile}
              onChange={(f) => {
                setImageFile(f);
                setImageError(null);
              }}
              errorText={imageError ?? undefined}
            />

            <div className="flex flex-col gap-3 border-t border-border pt-4">
              <p className="text-xs font-medium text-text-muted">Socials (optional)</p>
              <Input
                label="Twitter / X"
                placeholder="https://x.com/yourhandle"
                {...register('twitter')}
                errorText={errors.twitter?.message}
              />
              <Input
                label="Telegram"
                placeholder="https://t.me/yourgroup"
                {...register('telegram')}
                errorText={errors.telegram?.message}
              />
              <Input
                label="Website"
                placeholder="https://example.com"
                {...register('website')}
                errorText={errors.website?.message}
              />
            </div>

            <div className="border-t border-border pt-4">
              <Input
                label="Initial buy (SOL)"
                type="number"
                min={0}
                max={5}
                step="0.01"
                placeholder="0"
                {...register('initialBuySol', { valueAsNumber: true })}
                errorText={errors.initialBuySol?.message}
                helperText="Optional first buy bundled after the launch — max 5 SOL. Requires a second wallet signature."
              />
            </div>

            <div className="pt-2">
              {connected ? (
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={isSubmitting}
                  disabled={stage !== 'idle' && stage !== 'error' && stage !== 'success'}
                >
                  Launch token
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  fullWidth
                  leftIcon={<Wallet className="h-4 w-4" />}
                  onClick={() => setWalletModalVisible(true)}
                >
                  Connect wallet to launch
                </Button>
              )}
              <p className="mt-2 text-[11px] text-text-muted text-center">
                You'll be asked to sign in your wallet — make sure it's set to{' '}
                <span className="font-mono">{env.solanaNetwork}</span>.
              </p>
            </div>
          </form>
        </Card>

        {/* Preview column */}
        <div className="flex flex-col gap-3">
          <p className="text-xs text-text-muted">Live preview</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <TokenCard token={previewToken} index={0} />
          </div>
          <p className="text-[11px] text-text-muted">
            Market cap and bonding-curve progress are placeholders. Real values appear once trading starts.
          </p>
        </div>
      </div>

      <LaunchProgress
        open={stage !== 'idle'}
        stage={stage}
        signature={signature}
        initialBuySignature={initialBuySignature}
        errorMessage={errorMessage}
        onClose={() => {
          closeProgress();
          // Reset on a clean close after success, so the user can launch another.
          if (stage === 'success') {
            setImageFile(null);
            reset(DEFAULT_VALUES);
          }
        }}
        onRetry={retry}
      />
    </div>
  );
}

function buildPreviewToken(form: FormValues, image: File | null): Token {
  return {
    id: 'preview',
    mintAddress: '11111111111111111111111111111111',
    poolAddress: '22222222222222222222222222222222',
    configKey: '33333333333333333333333333333333',
    creatorAddress: '44444444444444444444444444444444',
    name: form.name || 'Your token',
    symbol: form.symbol || 'TICKER',
    description: form.description || 'Your token description appears here.',
    imageUrl: image ? URL.createObjectURL(image) : null,
    twitterUrl: form.twitter || null,
    telegramUrl: form.telegram || null,
    websiteUrl: form.website || null,
    createdAt: new Date().toISOString(),
    graduatedAt: null,
    graduatedPoolAddress: null,
    isGraduated: false,
    virtualSolReserves: '0',
    virtualTokenReserves: '0',
    realSolReserves: '0',
    realTokenReserves: '0',
    totalSupply: '1000000000000000',
    lastTradeAt: null,
    tradeCount: 0,
    holderCount: 0,
    marketCapUsd: 0,
  };
}
