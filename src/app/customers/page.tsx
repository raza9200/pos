import { requireAuth } from "@/lib/auth-utils"
import CustomersManagement from "@/components/CustomersManagement"

export default async function CustomersPage() {
  await requireAuth(["ADMIN", "MANAGER"])

  return <CustomersManagement />
}
