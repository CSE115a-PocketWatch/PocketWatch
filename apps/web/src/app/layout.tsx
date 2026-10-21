import type { Metadata } from 'next';
import './global.css';

export const metadata: Metadata = {
  title: 'PocketWatch',
  description: 'Organize assignments and schedule study sessions.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
