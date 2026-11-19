import { Nata_Sans } from 'next/font/google';

// next/font downloads the font at build time and serves it from this app,
// so visitors' browsers never request it from Google.
const nataSans = Nata_Sans({
  subsets: ['latin'],
  variable: '--font-nata-sans',
});

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className={nataSans.variable}>{children}</div>;
}
