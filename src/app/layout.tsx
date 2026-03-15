import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ReduxProvider from '@/store/provider';
import { Toaster } from 'sonner';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'FIMS - Fire Insurance Management System',
  description: 'Sistem manajemen asuransi kebakaran - kelola polis, request, dan invoice.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${inter.variable} font-sans antialiased`}>
        <ReduxProvider>
          {children}
          <Toaster position="top-right" richColors />
        </ReduxProvider>
      </body>
    </html>
  );
}
