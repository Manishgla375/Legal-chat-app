import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    console.log("Starting transcription request");
    
    if (!process.env.OPENAI_API_KEY) {
      console.error("OpenAI API key not configured");
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    console.log("Form data received:", {
      hasFile: formData.has("file"),
      hasModel: formData.has("model"),
      model: formData.get("model"),
    });

    const file = formData.get("file") as File;
    const model = formData.get("model") as string;

    if (!file) {
      console.error("No file provided in request");
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    console.log("File details:", {
      name: file.name,
      type: file.type,
      size: file.size,
    });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log("Sending request to OpenAI Whisper API");
    try {
      const transcription = await openai.audio.transcriptions.create({
        file: new File([buffer], file.name, { type: file.type }),
        model: model || "whisper-1",
      });

      console.log("Transcription successful");
      return NextResponse.json({ 
        text: transcription.text,
        status: "completed"
      });
    } catch (openaiError) {
      console.error("OpenAI API error:", openaiError);
      if (openaiError instanceof Error) {
        console.error("OpenAI error details:", {
          message: openaiError.message,
          stack: openaiError.stack,
        });
      }
      return NextResponse.json(
        { 
          error: "OpenAI API error",
          details: openaiError instanceof Error ? openaiError.message : "Unknown OpenAI error",
          status: "failed"
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in transcription:", error);
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
      });
    }
    
    return NextResponse.json(
      { 
        error: "Failed to transcribe audio",
        details: error instanceof Error ? error.message : "Unknown error",
        status: "failed"
      },
      { status: 500 }
    );
  }
} 