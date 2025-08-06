import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from '@/components/theme-provider';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'PageTurner',
  description: 'Transform your PDFs into immersive, interactive flipbooks with realistic page-turning animations, bookmarks, and smart reading features.',
  keywords: 'PDF reader, flipbook, interactive PDF, page turner, document viewer, PDF converter',
  authors: [{ name: 'PageTurner Team' }],
  creator: 'PageTurner',
  publisher: 'PageTurner',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    title: 'PageTurner - Interactive PDF Flipbook Reader',
    description: 'Transform your PDFs into immersive, interactive flipbooks with realistic page-turning animations.',
    url: 'https://pageturner.app',
    siteName: 'PageTurner',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'PageTurner - Interactive PDF Reader',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PageTurner - Interactive PDF Flipbook Reader',
    description: 'Transform your PDFs into immersive, interactive flipbooks.',
    images: ['/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    'max-video-preview': -1,
    'max-image-preview': 'large',
    'max-snippet': -1,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
          {children}
          <Toaster />
          
          {/* Analytics and Performance Monitoring */}
          <Script id="performance-observer" strategy="afterInteractive">
            {`
              if ('PerformanceObserver' in window) {
                const observer = new PerformanceObserver((list) => {
                  for (const entry of list.getEntries()) {
                    if (entry.entryType === 'largest-contentful-paint') {
                      console.log('LCP:', entry.startTime);
                    }
                  }
                });
                observer.observe({entryTypes: ['largest-contentful-paint']});
              }
            `}
          </Script>
        </ThemeProvider>
      </body>
    </html>
  );
}
