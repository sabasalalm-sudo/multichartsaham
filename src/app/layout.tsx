import './globals.css';
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'BO-W | Stock Scanner & Trading Simulator',
  description: 'Lihat banyak saham. Ambil keputusan lebih cepat. Scanner, Chart Multi-Saham, Trading Simulator & Jurnal Trading.',
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  themeColor: '#080D1A',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Optimal untuk tampilan APK Capacitor & Mobile Feed
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="dark">
      <body className="bg-brand-bg text-slate-100 antialiased min-h-screen selection:bg-emerald-500/30 selection:text-emerald-300">
        {children}
      </body>
    </html>
  );
}
