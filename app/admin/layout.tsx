import React from 'react'

// Force dynamic rendering for all admin routes to avoid build-time errors 
// when calling getServerSession() or other header-dependent functions.
export const dynamic = 'force-dynamic'

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="admin-layout">
      {children}
    </div>
  )
}
