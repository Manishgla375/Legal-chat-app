

import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { ChatLayout } from "@/components/chat-layout";

export default async function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const { id } = resolvedParams;
  const { userId } = auth();
  if (!userId) {
    return redirect("/sign-in");
  }

  return <ChatLayout initialChatId={resolvedParams.id} />;
}