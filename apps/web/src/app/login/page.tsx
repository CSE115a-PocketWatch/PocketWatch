import { AuthCard } from '../../components/auth-card';
import { GoogleButton } from '../../components/google-button';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <AuthCard title="Welcome to PocketWatch">
        <p className="mb-8 text-center text-sm text-balance text-grey-500">
          Sign in with your Google account to get started.
        </p>
        <GoogleButton />
      </AuthCard>
    </main>
  );
}