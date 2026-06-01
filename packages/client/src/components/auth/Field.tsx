import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

const inputClassName =
  'w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20';

interface FieldProps {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
  hint?: string;
}

export function Field({ id, label, error, children, hint }: FieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5" htmlFor={id}>
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground mt-1.5">{hint}</p>}
      {error && (
        <p className="text-xs text-destructive mt-1.5" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function fieldInputClassName(isInvalid: boolean) {
  return cn(inputClassName, isInvalid && 'border-destructive');
}

export { inputClassName };
