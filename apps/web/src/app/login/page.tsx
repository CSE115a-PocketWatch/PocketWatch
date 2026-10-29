import { AuthCard } from '../../components/auth-card';
import { GoogleButton } from '../../components/google-button';

// NEW: friendly messages for the error codes the backend might send
const ERROR_MESSAGES: Record<string, string> = {
  access_denied:
    'Sign-in was cancelled. If you are on the PocketWatch team, make sure you are using the Google account on the test list.',
};
const DEFAULT_ERROR = 'Something went wrong while signing in. Please try again.';

export default async function LoginPage({ // NEW: async
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>; // NEW
}) {
  const { error } = await searchParams; // NEW
  const errorMessage = error ? (ERROR_MESSAGES[error] ?? DEFAULT_ERROR) : null; // NEW

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <AuthCard title="Welcome to PocketWatch">
        <p className="mb-8 text-center text-sm text-balance text-grey-500">
          Sign in with your Google account to get started.
        </p>

        {/* NEW: only shows when there's an error in the URL */}
        {errorMessage && (
          <div
            role="alert"
            className="mb-6 rounded-md border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-accent"
          >
            {errorMessage}
          </div>
        )}

        <GoogleButton />
      </AuthCard>
    </main>
  );
}