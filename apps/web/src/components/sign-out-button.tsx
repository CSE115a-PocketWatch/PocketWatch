'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function SignOutButton() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    setIsSigningOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      router.push('/login');
      router.refresh();
    }
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={isSigningOut}
      className="rounded-md border border-grey-200 px-3 py-1.5 text-sm font-semibold text-grey-900 transition-colors hover:bg-grey-200 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isSigningOut ? 'Signing out…' : 'Sign out'}
    </button>
  );
}