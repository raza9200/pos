"use client"

import { ReactNode } from "react"

interface SessionProviderProps {
  children: ReactNode
  session: any
}

export function SessionProvider({ children, session }: SessionProviderProps) {
  return <>{children}</>
}
