import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'VocabForge - Word Smart & BCS Vocabulary Mastery App',
  description: 'Master Word Smart 1 & 2 vocabulary using SuperMemo SM-2 Spaced Repetition System for IBA MBA, GRE, and BCS competitive exams.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen bg-[#090d16] text-slate-100">
        {children}
      </body>
    </html>
  );
}
