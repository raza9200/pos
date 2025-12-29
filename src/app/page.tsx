import { redirect } from "next/navigation"
import { auth } from "@/auth"
import POSScreen from "@/components/POSScreen"

export default async function Home() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  return <POSScreen />
}
