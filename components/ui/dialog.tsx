'use client';

import * as React from 'react';
import { X } from 'lucide-react';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in-0">
      <div className="fixed inset-0" onClick={() => onOpenChange(false)} />
      <div className="relative z-50 w-full">{children}</div>
    </div>
  );
}

export function DialogContent({
  className = '',
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`relative mx-auto w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl text-card-foreground ${className}`}
    >
      {children}
    </div>
  );
}

export function DialogHeader({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`flex flex-col space-y-1.5 text-center sm:text-left ${className}`} {...props} />;
}

export function DialogTitle({ className = '', ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={`text-lg font-bold tracking-tight text-foreground ${className}`} {...props} />;
}

export function DialogFooter({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-4 ${className}`} {...props} />;
}
