"use client"

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export function RybbitAnalytics() {
    const pathname = usePathname()

    useEffect(() => {
        // Track page view with Rybbit
        if (typeof window !== 'undefined' && (window as any).rybbit) {
            (window as any).rybbit('track', 'pageview', {
                path: pathname,
            })
        }
    }, [pathname])

    return null
}

// Hook for tracking custom events (button clicks, interactions)
export function useRybbitTracking() {
    const trackEvent = (eventName: string, properties?: Record<string, any>) => {
        if (typeof window !== 'undefined' && (window as any).rybbit) {
            (window as any).rybbit('track', eventName, properties)
        }
    }

    return { trackEvent }
}
