import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'HunarLink — Find Local Skills. Hire with Confidence.',
  description: 'Discover trusted local workers and skilled professionals in Gilgit-Baltistan. Book electricians, plumbers, carpenters, and more.',
  keywords: ['HunarLink', 'local services', 'Gilgit-Baltistan', 'electrician', 'plumber', 'carpenter', 'skilled workers', 'home services'],
  authors: [{ name: 'HunarLink' }],
  creator: 'HunarLink',
  publisher: 'HunarLink',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://hunarlink.com',
    title: 'HunarLink — Find Local Skills. Hire with Confidence.',
    description: 'Discover trusted local workers and skilled professionals in Gilgit-Baltistan.',
    siteName: 'HunarLink',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HunarLink — Find Local Skills. Hire with Confidence.',
    description: 'Discover trusted local workers and skilled professionals in Gilgit-Baltistan.',
  },
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#153443',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
