import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const TEXT_MIME_TYPES = new Set([
  "text/plain",
  "text/markdown",
  "application/json",
  "application/xml",
  "text/csv",
]);

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const fileValue = formData.get("file");

    if (!(fileValue instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const file = fileValue;
    const extension = file.name.split(".").pop()?.toLowerCase() || "";
    const isPdf = file.type === "application/pdf" || extension === "pdf";
    const isText = TEXT_MIME_TYPES.has(file.type) || extension === "txt";

    if (file.size === 0) {
      return NextResponse.json({ error: "Uploaded file is empty" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json({ error: "File is too large. Max size is 5MB." }, { status: 413 });
    }

    if (!isPdf && !isText) {
      return NextResponse.json({ error: "Unsupported file type. Please upload a PDF or TXT file." }, { status: 415 });
    }

    let text = "";

    // Parse depending on type
    if (isPdf) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Import parser implementation directly to avoid pdf-parse's debug entrypoint side effects.
      const pdfParseModule = await import("pdf-parse/lib/pdf-parse.js");
      const pdfParse = (pdfParseModule as any).default || pdfParseModule;
      const parsedData = await pdfParse(buffer);
      text = String(parsedData?.text || "");
    } else {
      text = await file.text();
    }

    const normalizedText = text.replace(/\u0000/g, "").trim();

    if (!normalizedText) {
      return NextResponse.json({ error: "We could not extract readable text from that file." }, { status: 422 });
    }

    return NextResponse.json({ text: normalizedText });
  } catch (err: any) {
    console.error("Error parsing CV:", err);
    const message = typeof err?.message === "string" ? err.message : "Failed to parse CV";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
