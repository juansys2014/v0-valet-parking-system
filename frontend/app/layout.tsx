import React from "react"
import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { COOKIE_LANGUAGE, DEFAULT_LANGUAGE } from "@/lib/config"
import { I18nProvider } from '@/lib/i18n/context'
import { SettingsProvider } from '@/lib/settings/context'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Valet Parking Control',
  description: 'Valet parking control system - Vehicle registration, photos, and delivery management',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const cookieStore = await cookies()
  const raw = cookieStore.get(COOKIE_LANGUAGE)?.value ?? DEFAULT_LANGUAGE
  const initialLanguage = raw === "en" ? "en" : DEFAULT_LANGUAGE
  return (
    <html lang={initialLanguage}>
      <body className={`font-sans antialiased`}>
        <I18nProvider initialLanguage={initialLanguage}>
          <SettingsProvider>
            {children}
          </SettingsProvider>
        </I18nProvider>
        <Analytics />
      </body>
    </html>
  )
}
