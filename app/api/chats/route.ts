import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "../../../lib/db";

export async function GET(req: NextRequest) {
  try {
    console.log("Starting GET /api/chats request");
    
    const headers = await req.headers;
    const authResult = await auth();
    const { userId } = authResult;
    
    if (!userId) {
      console.error("No userId found in auth result");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    console.log("Auth result:", {
      userId: authResult.userId,
      sessionId: authResult.sessionId
    });

    console.log("Fetching chats for userId:", userId);
    
    try {
      const userChats = await prisma.chat.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' }
      });

      console.log("Successfully fetched chats:", {
        count: userChats.length,
          chats: userChats.map((chat: { id: string; title: string; updatedAt: Date }) => ({

          id: chat.id,
          title: chat.title,
          updatedAt: chat.updatedAt
        }))
      });

      return NextResponse.json(userChats);
    } catch (dbError) {
      console.error("Database error:", dbError);
      if (dbError instanceof Error) {
        console.error("Database error details:", {
          message: dbError.message,
          stack: dbError.stack
        });
      }
      return NextResponse.json(
        { error: "Database error", details: dbError instanceof Error ? dbError.message : "Unknown database error" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in GET /api/chats:", error);
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
      });
    }
    return NextResponse.json(
      { error: "Internal Server Error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    console.log("Starting DELETE /api/chats request");
    
    const headers = await req.headers;
    const authResult = await auth();
    const { userId } = authResult;
    
    if (!userId) {
      console.error("No userId found in auth result");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const chatId = searchParams.get("chatId");

    if (!chatId) {
      return new NextResponse("Chat ID is required", { status: 400 });
    }

    const chat = await prisma.chat.findUnique({
      where: { id: chatId }
    });

    if (!chat) {
      return new NextResponse("Chat not found", { status: 404 });
    }

    if (chat.userId !== userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await prisma.chat.delete({
      where: { id: chatId }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error in DELETE /api/chats:", error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to delete chat" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}