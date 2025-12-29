import { requireAuth } from "@/lib/auth-utils"
import ExpensesManagement from "@/components/ExpensesManagement"

export default async function ExpensesPage() {
  await requireAuth(["ADMIN", "MANAGER"])

  return <ExpensesManagement />
}
