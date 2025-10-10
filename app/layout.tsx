import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Control de Reuniones - Sala Wit",
  description: "Sistema de gestión de reuniones para sala Wit y ejecutivos"
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  )
}
