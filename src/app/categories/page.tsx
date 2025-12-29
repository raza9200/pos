import { requireAuth } from "@/lib/auth-utils"
import CategoriesManagement from "@/components/CategoriesManagement"

export default async function CategoriesPage() {
  await requireAuth(["ADMIN", "MANAGER"])

  return <CategoriesManagement />
}
