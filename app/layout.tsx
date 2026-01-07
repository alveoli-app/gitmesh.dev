import type React from "react"
import type { Metadata } from "next"
import Script from "next/script"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { checkMaintenanceRedirection } from "@/lib/maintenance"
import { validateAdminAccess } from "@/lib/auth"

import "./globals.css"
import { AuthProvider } from "@/components/providers/auth-provider"
import { Toaster } from "@/components/ui/sonner"

import { Onest, Geist_Mono as V0_Font_Geist_Mono } from "next/font/google"

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Global Maintenance Check
  const isMaintenance = await checkMaintenanceRedirection()
  
  if (isMaintenance) {
    const headersList = await headers()
    const pathname = headersList.get("x-current-path") || ""

    // Allow access to maintenance page, api routes, and static assets
    const isPublicAsset = pathname.startsWith("/_next") || pathname.includes(".")
    const isAllowedRoute = pathname.startsWith("/maintenance") || pathname.startsWith("/api") || pathname.startsWith("/auth")

    if (!isPublicAsset && !isAllowedRoute) {
      // Check if user is admin
      const { isValid } = await validateAdminAccess()
      
      if (!isValid) {
        redirect("/maintenance")
      }
    }
  }

  return (
    <html lang="en">
      <body className={`${onest.variable} font-sans antialiased overflow-x-hidden`}>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster />
        {process.env.RYBBIT_SITE_ID && (
          <Script
            src="https://app.rybbit.io/api/script.js"
            data-site-id={process.env.RYBBIT_SITE_ID}
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  )
}