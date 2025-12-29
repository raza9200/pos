import { auth } from "@/auth"
import { redirect } from "next/navigation"

export type UserRole = "ADMIN" | "MANAGER" | "CASHIER" | "WAITER" | "CHEF"

export async function requireAuth(allowedRoles?: UserRole[]) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  if (allowedRoles && !allowedRoles.includes(session.user.role as UserRole)) {
    throw new Error("Unauthorized")
  }

  return session
}

export function hasPermission(userRole: string, allowedRoles: UserRole[]) {
  return allowedRoles.includes(userRole as UserRole)
}
