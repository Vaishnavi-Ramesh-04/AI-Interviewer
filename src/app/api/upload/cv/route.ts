import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const pdfParse = require("pdf-parse");
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let text = "";

    // Parse depending on type
    if (file.type === "application/pdf") {
      const parsedData = await pdfParse(buffer);
      text = parsedData.text;
    } else {
      // Fallback for txt or other raw text types
      text = buffer.toString("utf-8");
    }

    return NextResponse.json({ text });
  } catch (err: any) {
    console.error("Error parsing CV:", err);
    return NextResponse.json({ error: "Failed to parse CV" }, { status: 500 });
  }
}
