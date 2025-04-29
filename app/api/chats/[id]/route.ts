import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "../../../../lib/db";

export async function GET(req: NextRequest, 
  { params }: { params: { taskId: string } }) {
  
  // Properly await the headers before using auth
  const headers = await req.headers;
  const authResult = await auth();
  const { userId } = authResult;

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const chatId = params.taskId;

  try {
    const chat = await prisma.chat.findUnique({
      where: { id: chatId }
    });

    if (!chat) {
      return new NextResponse("Chat not found", { status: 404 });
    }

    if (chat.userId !== userId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    return NextResponse.json(chat);
  } catch (error) {
    console.error("Error fetching chat:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
