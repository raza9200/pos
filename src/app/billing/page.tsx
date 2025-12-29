import { requireAuth } from "@/lib/auth-utils"
import BillingManagement from "@/components/BillingManagement"

export default async function BillingPage() {
  await requireAuth() // All authenticated users can access

  return <BillingManagement />
}
