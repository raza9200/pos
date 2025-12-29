import { requireAuth } from "@/lib/auth-utils"
import SalesHistory from "@/components/SalesHistory"

export default async function SalesPage() {
  await requireAuth()

  return <SalesHistory />
}
