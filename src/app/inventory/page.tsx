import { requireAuth } from "@/lib/auth-utils"
import InventoryManagement from "@/components/InventoryManagement"

export default async function InventoryPage() {
  await requireAuth()

  return <InventoryManagement />
}