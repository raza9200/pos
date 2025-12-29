import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Dashboard from "@/components/Dashboard"
import WaiterDashboard from "@/components/WaiterDashboard"

export default async function DashboardPage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect("/login")
  }

  const userRole = session.user.role

  // Show waiter dashboard for waiters and cashiers
  if (userRole === "WAITER" || userRole === "CASHIER") {
    return <WaiterDashboard />
  }

  // Show admin dashboard for admin, manager, and chef
  return <Dashboard />
}
