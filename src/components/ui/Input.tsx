import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from 'react';
import { cn } from '@/lib/utils';

interface BaseProps {
  label?: string;
  helperText?: string;
  errorText?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
}

type InputProps = BaseProps & Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix' | 'suffix'>;

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, helperText, errorText, prefix, suffix, className, id, ...rest },
  ref,
) {
  const auto = useId();
  const inputId = id ?? auto;
  const hasError = Boolean(errorText);

  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <label htmlFor={inputId} className="text-xs font-medium text-text-muted">
          {label}
        </label>
      ) : null}
      <div
        className={cn(
          'flex items-center gap-2 rounded-lg border bg-surface px-3 transition-colors',
          'focus-within:border-text-muted/60',
          hasError ? 'border-danger/60' : 'border-border',
        )}
      >
        {prefix ? <span className="text-text-muted shrink-0">{prefix}</span> : null}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'flex-1 bg-transparent py-2 text-sm outline-none placeholder:text-text-muted/60',
            className,
          )}
          {...rest}
        />
        {suffix ? <span className="text-text-muted shrink-0">{suffix}</span> : null}
      </div>
      {hasError ? (
        <p className="text-xs text-danger">{errorText}</p>
      ) : helperText ? (
        <p className="text-xs text-text-muted">{helperText}</p>
      ) : null}
    </div>
  );
});

type TextareaProps = BaseProps & TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, helperText, errorText, className, id, ...rest },
  ref,
) {
  const auto = useId();
  const inputId = id ?? auto;
  const hasError = Boolean(errorText);
  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <label htmlFor={inputId} className="text-xs font-medium text-text-muted">
          {label}
        </label>
      ) : null}
      <textarea
        ref={ref}
        id={inputId}
        className={cn(
          'min-h-[80px] rounded-lg border bg-surface px-3 py-2 text-sm outline-none transition-colors',
          'placeholder:text-text-muted/60 focus:border-text-muted/60',
          hasError ? 'border-danger/60' : 'border-border',
          className,
        )}
        {...rest}
      />
      {hasError ? (
        <p className="text-xs text-danger">{errorText}</p>
      ) : helperText ? (
        <p className="text-xs text-text-muted">{helperText}</p>
      ) : null}
    </div>
  );
});
