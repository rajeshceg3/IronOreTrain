import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Iron & Sand | Mauritania ore train',
  description:
    'Explore an illustrated Mauritania iron-ore railway in seven chapters, with 360-degree views.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}
