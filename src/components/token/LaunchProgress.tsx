import { CheckCircle2, ExternalLink, Loader2, XCircle } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { getExplorerUrl } from '@/lib/tx';
import { cn } from '@/lib/utils';

export type LaunchStage =
  | 'idle'
  | 'uploading'
  | 'awaitingSignature'
  | 'confirming'
  | 'initialBuySigning'
  | 'initialBuyConfirming'
  | 'success'
  | 'error';

interface LaunchProgressProps {
  open: boolean;
  stage: LaunchStage;
  signature?: string | null;
  initialBuySignature?: string | null;
  errorMessage?: string | null;
  onClose: () => void;
  onRetry?: () => void;
}

const STEPS: Array<{ key: LaunchStage; label: string; description: string }> = [
  { key: 'uploading', label: 'Preparing', description: 'Uploading metadata + building transaction' },
  { key: 'awaitingSignature', label: 'Awaiting signature', description: 'Confirm the launch in your wallet' },
  { key: 'confirming', label: 'Confirming on Solana', description: 'Waiting for cluster confirmation' },
  { key: 'initialBuySigning', label: 'Initial buy', description: 'Sign the first buy in your wallet' },
  { key: 'initialBuyConfirming', label: 'Confirming buy', description: 'Waiting for cluster confirmation' },
];

const ORDER: LaunchStage[] = [
  'uploading',
  'awaitingSignature',
  'confirming',
  'initialBuySigning',
  'initialBuyConfirming',
  'success',
];

function statusFor(step: LaunchStage, current: LaunchStage): 'done' | 'active' | 'pending' {
  const i = ORDER.indexOf(step);
  const j = ORDER.indexOf(current);
  if (i < j) return 'done';
  if (i === j) return 'active';
  return 'pending';
}

/**
 * Step-by-step status modal for the create+submit flow. Shows the current
 * stage, a tx signature once available, and exposes a Retry path on error.
 */
export function LaunchProgress({
  open,
  stage,
  signature,
  initialBuySignature,
  errorMessage,
  onClose,
  onRetry,
}: LaunchProgressProps): JSX.Element | null {
  if (!open) return null;

  const isError = stage === 'error';
  const isSuccess = stage === 'success';

  return (
    <Modal
      open={open}
      onClose={isError || isSuccess ? onClose : () => undefined}
      title={isError ? 'Launch failed' : isSuccess ? 'Token launched' : 'Launching token'}
      description={
        isError
          ? 'Something went wrong — you can retry below.'
          : isSuccess
            ? 'Your token is live on Solana.'
            : 'Hold tight while we coordinate the create + sign + confirm flow.'
      }
    >
      <ol className="flex flex-col gap-3">
        {STEPS.map((step) => {
          const status = statusFor(step.key, stage);
          // Hide the optional buy steps if we never enter them
          const skipBuy =
            (step.key === 'initialBuySigning' || step.key === 'initialBuyConfirming') &&
            stage === 'success' &&
            !initialBuySignature;
          if (skipBuy) return null;
          return (
            <li key={step.key} className="flex items-start gap-3">
              <StepIcon status={status} error={isError && status === 'active'} />
              <div className="flex-1">
                <p
                  className={cn(
                    'text-sm font-medium',
                    status === 'pending' ? 'text-text-muted' : 'text-text-primary',
                  )}
                >
                  {step.label}
                </p>
                <p className="text-xs text-text-muted">{step.description}</p>
                {step.key === 'confirming' && signature ? (
                  <a
                    href={getExplorerUrl(signature)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    View on Solscan
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ) : null}
                {step.key === 'initialBuyConfirming' && initialBuySignature ? (
                  <a
                    href={getExplorerUrl(initialBuySignature)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    View buy on Solscan
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>

      {isError ? (
        <div className="mt-4 rounded-lg border border-danger/40 bg-danger/5 p-3">
          <p className="text-xs text-danger break-words">{errorMessage ?? 'Unknown error'}</p>
        </div>
      ) : null}

      {(isError || isSuccess) ? (
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          {isError && onRetry ? (
            <Button variant="primary" onClick={onRetry}>
              Retry
            </Button>
          ) : null}
        </div>
      ) : null}
    </Modal>
  );
}

function StepIcon({
  status,
  error,
}: {
  status: 'done' | 'active' | 'pending';
  error: boolean;
}): JSX.Element {
  if (error) return <XCircle className="h-5 w-5 text-danger mt-0.5" />;
  if (status === 'done') return <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />;
  if (status === 'active') return <Loader2 className="h-5 w-5 text-primary animate-spin mt-0.5" />;
  return (
    <span className="mt-1 h-3 w-3 rounded-full border border-border ml-1" aria-hidden="true" />
  );
}
