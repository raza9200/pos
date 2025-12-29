import { requireAuth } from "@/lib/auth-utils"
import SettingsManagement from "@/components/SettingsManagement"

export default async function SettingsPage() {
  await requireAuth(["ADMIN"])

  return <SettingsManagement />
}