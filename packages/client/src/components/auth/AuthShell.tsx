import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface AuthShellProps {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function AuthShell({ title, description, children, footer, className }: AuthShellProps) {
  return (
    <div
      className={cn(
        'w-full mx-auto bg-card text-card-foreground border border-border rounded-2xl shadow-sm p-6 md:p-8',
        className,
      )}
    >
      <h1 className="font-semibold text-2xl tracking-tight">{title}</h1>
      <p className="text-sm text-muted-foreground mt-1">{description}</p>
      {children}
      {footer}
    </div>
  );
}

interface AuthFooterLinkProps {
  prompt: string;
  linkText: string;
  to: string;
}

export function AuthFooterLink({ prompt, linkText, to }: AuthFooterLinkProps) {
  return (
    <p className="text-sm text-muted-foreground mt-6 text-center">
      {prompt}{' '}
      <Link className="text-foreground font-medium underline underline-offset-4 hover:text-foreground/80" to={to}>
        {linkText}
      </Link>
    </p>
  );
}
