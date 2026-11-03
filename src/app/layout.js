import './globals.css';
import Providers from '@/components/Providers';
import LayoutShell from '@/components/LayoutShell';

export const metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  title: {
    default: 'Revera | Next-Gen Discord Music Bot & Studio',
    template: '%s | Revera',
  },
  description:
    'Elevate your Discord server with 320kbps Lossless audio streaming, real-time Web Dashboard, 13+ studio DSP filters, and Spotify & YouTube playlist sync.',
  applicationName: 'Revera',
  keywords: [
    'Discord Music Bot',
    'Revera Music',
    'Discord Audio',
    'Lossless Audio Discord',
    '320kbps Music Bot',
    'Discord Web Dashboard',
    'DSP Filters',
    'Spotify to Discord',
    'YouTube Playlist Discord',
  ],
  authors: [{ name: 'Revera' }],
  creator: 'Revera Team',
  icons: {
    icon: '/revera-tp.png',
    apple: '/revera-tp.png',
  },
  openGraph: {
    title: 'Revera | Next-Gen Discord Music Bot & Studio',
    description:
      'Elevate your Discord server with 320kbps Lossless audio streaming, real-time Web Dashboard, 13+ studio DSP filters, and Spotify & YouTube playlist sync.',
    siteName: 'Revera',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/revera-tp.png',
        width: 512,
        height: 512,
        alt: 'Revera Music Studio',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'Revera | Next-Gen Discord Music Bot & Studio',
    description:
      'Elevate your Discord server with 320kbps Lossless audio streaming, real-time Web Dashboard, 13+ studio DSP filters, and Spotify & YouTube playlist sync.',
    images: ['/revera-tp.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased flex flex-col min-h-screen bg-[#0d0814] text-gray-100 selection:bg-pink-500 selection:text-white">
        <Providers>
          <LayoutShell>{children}</LayoutShell>
        </Providers>
      </body>
    </html>
  );
}
