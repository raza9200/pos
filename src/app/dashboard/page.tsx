import { requireAuth } from "@/lib/auth-utils"
import Dashboard from "@/components/Dashboard"

export default async function DashboardPage() {
  await requireAuth(["ADMIN", "MANAGER"])

  return <Dashboard />
}
