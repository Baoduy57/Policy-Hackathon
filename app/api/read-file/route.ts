import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { readFileContent, readPDFContent, getFileInfo } from "@/lib/gridfs";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { fileId, fileName } = await request.json();

    if (!fileId) {
      return NextResponse.json(
        { error: "fileId is required" },
        { status: 400 }
      );
    }

    console.log(`[Read File] Reading from GridFS: ${fileId}`);

    // Get file info to determine type
    const fileInfo = await getFileInfo(fileId);
    let content = "";

    // Determine file type from filename or metadata
    const filename = fileInfo.filename.toLowerCase();

    if (filename.endsWith(".pdf")) {
      // Parse PDF from GridFS with triple fallback (pdf-parse → pdf2json → simple regex)
      console.log("[Read File] Attempting to parse PDF from GridFS...");
      content = await readPDFContent(fileId);

      // Check if content is the fallback message (failed parsing)
      if (content.includes("[Thông báo:")) {
        console.log(
          "[Read File] ⚠️ PDF parsing failed, using fallback message"
        );
      } else {
        console.log(
          `[Read File] ✅ PDF parsed successfully, length: ${content.length} chars`
        );
      }
    } else if (
      filename.endsWith(".txt") ||
      fileInfo.metadata?.contentType === "text/plain"
    ) {
      // Plain text from GridFS
      content = await readFileContent(fileId);
      console.log(
        `[Read File] Text file read from GridFS, length: ${content.length} chars`
      );
    } else {
      // Try to read as text
      try {
        content = await readFileContent(fileId);
      } catch {
        content = "[Error: File format not supported for text extraction]";
      }
    }

    return NextResponse.json({
      success: true,
      content: content.substring(0, 50000), // Limit to 50k chars for AI
      length: content.length,
      filename: fileInfo.filename,
    });
  } catch (error: any) {
    console.error("Read file error:", error);
    return NextResponse.json(
      { error: "Failed to read file", details: error.message },
      { status: 500 }
    );
  }
}
