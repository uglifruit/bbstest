import type { Metadata } from 'next'
import { Providers } from './providers'
import './globals.css'

export const metadata: Metadata = {
  title: 'THE MATRIX BBS v2.3 — ONLINE',
  description: 'A public bulletin board system. Leave your mark.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-black">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
