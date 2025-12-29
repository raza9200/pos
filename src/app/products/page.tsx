import { requireAuth } from "@/lib/auth-utils"
import ProductsManagement from "@/components/ProductsManagement"

export default async function ProductsPage() {
  await requireAuth(["ADMIN", "MANAGER"])

  return <ProductsManagement />
}
