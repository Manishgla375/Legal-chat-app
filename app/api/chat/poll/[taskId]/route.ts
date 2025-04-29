import { NextResponse } from "next/server";
import { getRedisClient } from "@/lib/redis";

const redis = getRedisClient();

export async function GET(req: Request, { params }: { params: { taskId: string } }) {
  const taskId = params.taskId;

  try {
    // Attempt to fetch task data from Redis
    const taskData = await redis.get(`task:${taskId}`) as string | null;

    if (!taskData) {
      return NextResponse.json({ status: "not_found" }, { status: 404 });
    }

    // Parse the Redis response safely
    const { status, result }: { status: string; result: any } = JSON.parse(taskData);

    return NextResponse.json({ status, result });
  } catch (error) {
    console.error("Error fetching task data:", error);
    return NextResponse.json({ status: "error", message: "Internal Server Error" }, { status: 500 });
  }
}
