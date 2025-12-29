import { requireAuth } from "@/lib/auth-utils"
import KitchenDisplay from "@/components/KitchenDisplay"

export default async function KitchenPage() {
  await requireAuth()

  return <KitchenDisplay />
}