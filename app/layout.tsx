import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "Emerald Coast Marketing Wave - 9x12 Postcard Marketing",
    template: "%s | ECMWave",
  },
  description:
    "Reach 5,000 local customers in Niceville, Navarre, and Gulf Breeze with shared 9x12 postcard marketing. Measurable ROI through QR code tracking.",
  generator: "v0.app",
  metadataBase: new URL("https://ecmwave.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://ecmwave.com",
    siteName: "Emerald Coast Marketing Wave",
    title: "Emerald Coast Marketing Wave - 9x12 Postcard Marketing",
    description:
      "Reach 5,000 local customers in Niceville, Navarre, and Gulf Breeze with shared 9x12 postcard marketing. Measurable ROI through QR code tracking.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Emerald Coast Marketing Wave - Shared Postcard Marketing",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Emerald Coast Marketing Wave - 9x12 Postcard Marketing",
    description:
      "Reach 5,000 local customers in Niceville, Navarre, and Gulf Breeze with shared 9x12 postcard marketing.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
