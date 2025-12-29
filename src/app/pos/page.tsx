import POSScreen from "@/components/POSScreen"
import { requireAuth } from "@/lib/auth-utils"

export default async function POSPage() {
  await requireAuth(["ADMIN", "MANAGER", "CASHIER"])

  return (
    <main>
      <POSScreen />
    </main>
  )
}
