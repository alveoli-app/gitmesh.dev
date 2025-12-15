import type React from "react"
import type { Metadata } from "next"

import "./globals.css"

import { Onest, Geist_Mono as V0_Font_Geist_Mono } from "next/font/google"
import { RybbitAnalytics } from "@/components/rybbit-analytics"

// Initialize fonts
const _geistMono = V0_Font_Geist_Mono({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
})

// Initialize Onest font with weights 500 and 700
const onest = Onest({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-onest",
})

export const metadata: Metadata = {
  title: "GitMesh CE",
  description: "Community edition",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        {/* Rybbit Analytics - Cookieless Tracking */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                window.rybbit = window.rybbit || function() {
                  (window.rybbit.q = window.rybbit.q || []).push(arguments);
                };
                console.log('Rybbit Analytics initialized (demo mode)');
              })();
            `,
          }}
        />
      </head>
      <body className={`${onest.variable} font-sans antialiased overflow-x-hidden`}>
        <RybbitAnalytics />
        {children}
      </body>
    </html>
  )
}
