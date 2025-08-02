import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DiCalen - AI-Powered Calendar App',
  description: 'Intelligent scheduling with AI assistance, seamless syncing, and smart notifications.',
  keywords: ['calendar', 'AI', 'scheduling', 'productivity', 'events'],
  authors: [{ name: 'DiCalen Team' }],
  creator: 'DiCalen',
  publisher: 'DiCalen',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'DiCalen',
    title: 'DiCalen - AI-Powered Calendar App',
    description: 'Intelligent scheduling with AI assistance, seamless syncing, and smart notifications.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'DiCalen - AI-Powered Calendar App',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DiCalen - AI-Powered Calendar App',
    description: 'Intelligent scheduling with AI assistance, seamless syncing, and smart notifications.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
