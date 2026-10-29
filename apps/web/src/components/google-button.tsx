export function GoogleButton() {
    return (
      <a
        href="/api/auth/google"
        className="block w-full rounded-md border border-primary-2 py-2 text-center text-sm font-semibold text-primary-2 transition-colors hover:bg-primary-2 hover:text-grey-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-2"
      >
        Continue with Google
      </a>
    );
  }