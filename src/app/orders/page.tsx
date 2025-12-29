import { auth } from "@/auth"
import { redirect } from "next/navigation"
import OrdersManagement from "@/components/OrdersManagement"

export default async function OrdersPage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect("/login")
  }

  return <OrdersManagement userRole={session.user.role} />
}
