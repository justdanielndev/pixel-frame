"use client"

import type { Metadata } from 'next'
import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import '../styles/globals.css'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
          {children}
      </body>
    </html>
  )
}
