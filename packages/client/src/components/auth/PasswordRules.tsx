import { Check, Circle } from 'lucide-react';
import { getPasswordRules } from '@/lib/validation';
import { cn } from '@/lib/utils';

const RULES = [
  { key: 'length' as const, testId: 'password-rule-length', label: 'At least 8 characters' },
  { key: 'upper' as const, testId: 'password-rule-upper', label: 'At least one capital letter' },
  { key: 'special' as const, testId: 'password-rule-special', label: 'At least one special character' },
];

interface PasswordRulesProps {
  password: string;
}

export function PasswordRules({ password }: PasswordRulesProps) {
  const rules = getPasswordRules(password);

  return (
    <ul className="mt-2.5 space-y-1.5" aria-live="polite">
      {RULES.map((rule) => {
        const met = rules[rule.key];
        return (
          <li
            key={rule.testId}
            data-testid={rule.testId}
            data-met={String(met)}
            className={cn(
              'flex items-center gap-2 text-sm transition-colors',
              met ? 'text-emerald-700' : 'text-muted-foreground',
            )}
          >
            {met ? (
              <Check className="size-4 shrink-0" aria-hidden />
            ) : (
              <Circle className="size-4 shrink-0 opacity-40" aria-hidden />
            )}
            <span>{rule.label}</span>
          </li>
        );
      })}
    </ul>
  );
}
