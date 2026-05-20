import { useState } from 'react';
import {
  Book,
  ChevronDown,
  Headphones,
  Mail,
  MessageSquare,
  Send,
  ShieldAlert,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Card } from '@/components/ui/Card';
import { Input, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

const FAQ: Array<{ q: string; a: string }> = [
  {
    q: 'What happens when a token graduates?',
    a: 'Once the bonding curve fills with 85 SOL, the token automatically migrates to a permanent DAMM v2 pool. 20% of supply is reserved for that pool. You can keep trading on Jupiter from the token page.',
  },
  {
    q: 'What\'s the fee?',
    a: 'A flat 1% trading fee is applied to every swap on the bonding curve. Creators do not receive any of this fee in the default config — it goes to the platform.',
  },
  {
    q: 'Can I edit token metadata after launch?',
    a: 'No. Tokens are launched with immutable update authority by default. This protects buyers from rug-pull metadata swaps.',
  },
  {
    q: 'Why was my buy capped to 1 SOL?',
    a: 'For the first 60 seconds after a token launches, individual buys are capped at 1 SOL to give regular users a fair shot ahead of sniper bots.',
  },
  {
    q: 'How do I withdraw?',
    a: 'Use your wallet app (Phantom, Solflare, Backpack). PumpClone never holds custody of your SOL — your wallet is your bank.',
  },
  {
    q: 'I think a token is a scam. What do I do?',
    a: 'Click "Report" on the token page. Severe cases (impersonation, malicious links) can be sent directly to support — we review within 24h.',
  },
];

export function SupportPage(): JSX.Element {
  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div>
        <h1 className="flex items-center gap-2 text-2xl sm:text-3xl font-semibold tracking-tight">
          <Headphones className="h-6 w-6 text-primary" />
          Support
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Answers to common questions, plus a way to reach a human if you need one.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <QuickCard
          icon={<Book className="h-4 w-4" />}
          title="Docs"
          description="Curve mechanics, fees, migrations."
        />
        <QuickCard
          icon={<MessageSquare className="h-4 w-4" />}
          title="Discord"
          description="Real-time help from the community."
        />
        <QuickCard
          icon={<ShieldAlert className="h-4 w-4" />}
          title="Report a scam"
          description="We review urgent reports within 24h."
        />
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold">Frequently asked</h2>
        <div className="rounded-xl border border-border bg-surface divide-y divide-border">
          {FAQ.map((item, i) => (
            <FaqItem key={i} q={item.q} a={item.a} />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold">Contact</h2>
        <Card>
          <ContactForm />
        </Card>
      </section>
    </div>
  );
}

function QuickCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}): JSX.Element {
  return (
    <button
      type="button"
      className="text-left rounded-xl border border-border bg-surface p-4 hover:border-text-muted/40 transition-colors"
    >
      <span className="grid place-items-center h-8 w-8 rounded-lg bg-primary/15 text-primary mb-3">
        {icon}
      </span>
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-0.5 text-xs text-text-muted">{description}</p>
    </button>
  );
}

function FaqItem({ q, a }: { q: string; a: string }): JSX.Element {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-surface-elevated/40 transition-colors"
      >
        <span className="text-sm font-medium">{q}</span>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-text-muted shrink-0 transition-transform',
            open && 'rotate-180',
          )}
        />
      </button>
      {open ? (
        <div className="px-4 pb-4 text-sm text-text-muted leading-relaxed">{a}</div>
      ) : null}
    </div>
  );
}

function ContactForm(): JSX.Element {
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (!email || !subject || !message) {
      toast.error('Fill in all fields');
      return;
    }
    setSubmitting(true);
    window.setTimeout(() => {
      setSubmitting(false);
      setEmail('');
      setSubject('');
      setMessage('');
      toast.success('Got it — we\'ll get back within 24h.');
    }, 700);
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <Input
        label="Email"
        placeholder="you@example.com"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        prefix={<Mail className="h-4 w-4" />}
      />
      <Input
        label="Subject"
        placeholder="What's going on?"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
      />
      <Textarea
        label="Message"
        placeholder="Tell us what you need — include tx signatures or token mints if relevant."
        rows={5}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <div className="flex justify-end">
        <Button
          type="submit"
          variant="primary"
          loading={submitting}
          rightIcon={<Send className="h-4 w-4" />}
        >
          Send
        </Button>
      </div>
    </form>
  );
}
