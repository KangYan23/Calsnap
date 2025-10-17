import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function GET() {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ success: false, error: "GEMINI_API_KEY not configured" }, { status: 400 });
    }

    // Some SDK versions expose listModels; try to call it safely.
    if (typeof (genAI as any).listModels === 'function') {
      const models = await (genAI as any).listModels();
      return NextResponse.json({ success: true, models }, { status: 200 });
    }

    return NextResponse.json({ success: false, error: "listModels is not available in this SDK version" }, { status: 501 });
  } catch (error) {
    console.error('Error calling ListModels:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
