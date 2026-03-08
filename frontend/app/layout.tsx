import React from "react"
import type { Metadata } from 'next'
import { cookies, headers } from 'next/headers'
import { Geist, Geist_Mono } from 'next/font/google'
import { COOKIE_LANGUAGE, DEFAULT_LANGUAGE } from "@/lib/config"
import { I18nProvider } from '@/lib/i18n/context'
import { SettingsProvider } from '@/lib/settings/context'
import { ConfigProvider } from '@/lib/config/context'
import { DynamicIcon } from '@/components/dynamic-icon'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

const defaultMetadata: Metadata = {
  title: 'Valet Parking Control',
  description: 'Valet parking control system - Vehicle registration, photos, and delivery management',
  generator: 'v0.app',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Valet Parking',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
  },
}

export async function generateMetadata(): Promise<Metadata> {
  const h = await headers()
  const host = h.get("host") ?? ""
  const proto = h.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https")
  const base = host ? `${proto}://${host}` : (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000")
  let logoDataUrl: string | null = null
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)
    const res = await fetch(`${base}/api/config/settings`, { cache: "no-store", signal: controller.signal })
    clearTimeout(timeout)
    const data = await res.json()
    if (data?.logo && typeof data.logo === "string" && data.logo.startsWith("data:image/")) {
      const maxLen = 200000
      logoDataUrl = data.logo.length <= maxLen ? data.logo : null
    }
  } catch {
    // ignore
  }
  return {
    ...defaultMetadata,
    icons: logoDataUrl
      ? { icon: [{ url: logoDataUrl, type: "image/png", sizes: "512x512" }], apple: logoDataUrl }
      : { icon: [{ url: `${base}/api/config/logo`, type: "image/png", sizes: "512x512" }], apple: `${base}/api/config/logo` },
  }
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
