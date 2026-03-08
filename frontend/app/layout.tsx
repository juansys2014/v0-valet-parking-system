import React from "react"
import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { Geist, Geist_Mono } from 'next/font/google'
import { COOKIE_LANGUAGE, DEFAULT_LANGUAGE } from "@/lib/config"
import { I18nProvider } from '@/lib/i18n/context'
import { SettingsProvider } from '@/lib/settings/context'
import { ConfigProvider } from '@/lib/config/context'
import { DynamicIcon } from '@/components/dynamic-icon'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Valet Parking Control',
  description: 'Valet parking control system - Vehicle registration, photos, and delivery management',
  generator: 'v0.app',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Valet Parking',
  },
  icons: {
    icon: [{ url: '/api/config/logo', type: 'image/png', sizes: '512x512' }],
    apple: '/api/config/logo',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
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
            <ConfigProvider>
              <DynamicIcon />
              {children}
            </ConfigProvider>
          </SettingsProvider>
        </I18nProvider>
      </body>
    </html>
  )
}
