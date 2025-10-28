"use client";
import React from 'react';

type Props = {
  children: React.ReactNode;
  message: string;
};

export default function ConfirmSubmit({ children, message }: Props) {
  return (
    <span
      onClick={(e) => {
        const form = (e.target as HTMLElement).closest('form') as HTMLFormElement | null;
        if (!form) return;
        if (!confirm(message)) return;
        form.requestSubmit();
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          const form = (e.target as HTMLElement).closest('form') as HTMLFormElement | null;
          if (!form) return;
          if (!confirm(message)) return;
          form.requestSubmit();
        }
      }}
      className="inline-block"
    >
      {children}
    </span>
  );
}
