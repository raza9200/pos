import { requireAuth } from "@/lib/auth-utils"
import ReportsDashboard from "@/components/ReportsDashboard"

export default async function ReportsPage() {
  await requireAuth(["ADMIN", "MANAGER"])

  return <ReportsDashboard />
}
