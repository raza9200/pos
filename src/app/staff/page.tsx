import { requireAuth } from "@/lib/auth-utils"
import StaffManagement from "@/components/StaffManagement"

export default async function StaffPage() {
  await requireAuth(["ADMIN"])

  return <StaffManagement />
}