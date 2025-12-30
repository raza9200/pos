import type { Metadata } from "next"
import "./globals.css"
import { auth } from "@/auth"
import { Navigation } from "@/components/Navigation"
import { SessionProvider } from "@/components/SessionProvider"

export const metadata: Metadata = {
  title: "Restaurant Management System",
  description: "Complete Restaurant Management & POS System",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await auth()

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <SessionProvider session={session}>
          {session?.user && (
            <Navigation userRole={session.user.role} userName={session.user.name || "User"} />
          )}
          <main className={`min-h-screen bg-gray-50 ${session?.user ? "ml-64" : ""}`}>
            {children}
          </main>
        </SessionProvider>
      </body>
    </html>
  )
}
