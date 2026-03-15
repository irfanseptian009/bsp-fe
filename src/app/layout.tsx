import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import ReduxProvider from '@/store/provider';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/shared/theme-provider';

const poppins = Poppins({
  subsets: ['latin'],
  variable: '--font-poppins',
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'BSP -  Insurance Management System',
  description: 'Sistem manajemen asuransi kebakaran - kelola polis, request, dan invoice.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${poppins.variable} font-sans antialiased`}>
        <ThemeProvider>
          <ReduxProvider>
            {children}
            <Toaster position="top-right" richColors />
          </ReduxProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
