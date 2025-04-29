import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { ChatLayout } from "@/components/chat-layout"

export default async function Home() {
  const { userId } = await auth()

  if (!userId) {
    return redirect("/sign-in")
  }

  return <ChatLayout />
}
