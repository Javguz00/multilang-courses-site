"use client";
import { signOut } from 'next-auth/react';

export default function SignOutButton({ label }: { label?: string }) {
  return (
    <button
      className="text-sm text-gray-700 hover:underline"
      onClick={() => signOut({ callbackUrl: '/' })}
      type="button"
    >
      {label ?? 'Sign out'}
    </button>
  );
}
