import type { Metadata } from 'next';
import { Inter, Manrope } from 'next/font/google';
import './global.css';
import ConvexClerkProvider from '../providers/ConvexClerkProvider';
import AudioProvider from '@/providers/AudioProvider';
const manrope = Manrope({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Podcastr',
  description: 'Generated your podcasts using AI',
  icons: {
    icon: '/icons/logo.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ConvexClerkProvider>
      <AudioProvider>
        <html lang="en">
          <body className={manrope.className}>{children}</body>
        </html>
      </AudioProvider>
    </ConvexClerkProvider>
  );
}
