import { requireAuth } from "@/lib/auth-utils"
import TablesManagement from "@/components/TablesManagement"

export default async function TablesPage() {
  await requireAuth() // All authenticated users can access

  return <TablesManagement />
}
