import { requireAuth } from "@/lib/auth-utils"
import MenuManagement from "@/components/MenuManagement"

export default async function MenuPage() {
  await requireAuth()

  return <MenuManagement />
}