import { requireAuth } from "@/lib/auth-utils"
import OrdersManagement from "@/components/OrdersManagement"

export default async function OrdersPage() {
  await requireAuth() // All authenticated users can access

  return <OrdersManagement />
}
