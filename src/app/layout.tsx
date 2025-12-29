import type { Metadata } from "next";
import "./globals.css";
import { auth } from "@/auth";
import { Navigation } from "@/components/Navigation";

export const metadata: Metadata = {
  title: "POS System",
  description: "Point of Sale System for Retail Store",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en">
      <body className="antialiased">
        {session?.user && (
          <Navigation userRole={session.user.role} userName={session.user.name || "User"} />
        )}
        <main className="min-h-screen bg-gray-50">
          {children}
        </main>
      </body>
    </html>
  );
}
