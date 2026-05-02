// app/layout.js

import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import AuthProvider from '@/components/providers/AuthProvider';
import ThemeProvider from '@/components/providers/ThemeProvider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata = {
  title: 'Silvio Gibi - Portal',
  description: 'Bodyboarder & Mentor',
};

export default function RootLayout({ children }) {
  return (
    // suppressHydrationWarning é necessário aqui por causa do next-themes
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-gray-100 min-h-screen transition-colors duration-300">
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
