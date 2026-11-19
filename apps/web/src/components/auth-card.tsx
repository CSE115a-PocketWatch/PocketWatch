type AuthCardProps = {
    title: string;
    children: React.ReactNode;
  };
  
  export function AuthCard({ title, children }: AuthCardProps) {
    return (
      <div className="w-full max-w-sm rounded-2xl border border-grey-200 bg-grey-100 px-8 py-10 shadow-sm">
        <h1 className="mb-3 text-center text-2xl font-semibold">{title}</h1>
        {children}
      </div>
    );
  }