import type { Metadata } from 'next';
import { Nata_Sans } from 'next/font/google';
import './global.css';

const nataSans = Nata_Sans({
  subsets: ['latin'],
  variable: '--font-nata-sans',
});

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
    <html lang="en" className={nataSans.variable}>
      <body className="min-h-screen bg-white text-slate-900 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}