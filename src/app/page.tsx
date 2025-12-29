import { redirect } from "next/navigation"
import { auth } from "@/auth"
import HomePage from "@/components/HomePage"

export default async function Home() {
  const session = await auth()
  
  if (session?.user) {
    // If user is logged in, redirect to POS
    redirect("/pos")
  }

  return <HomePage />
}
