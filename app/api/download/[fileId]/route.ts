import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { downloadFromGridFS, getFileInfo } from "@/lib/gridfs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    await dbConnect();

    const { fileId } = await params;

    if (!fileId) {
      return NextResponse.json(
        { error: "fileId is required" },
        { status: 400 }
      );
    }

    // Get file info
    const fileInfo = await getFileInfo(fileId);

    // Download file from GridFS
    const fileBuffer = await downloadFromGridFS(fileId);

    console.log(
      `[Download] File: ${fileInfo.filename}, Size: ${fileBuffer.length}`
    );

    // Return file with appropriate headers
    return new Response(fileBuffer as any, {
      headers: {
        "Content-Type":
          fileInfo.metadata?.contentType || "application/octet-stream",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(
          fileInfo.filename
        )}`,
        "Content-Length": fileBuffer.length.toString(),
      },
    });
  } catch (error: any) {
    console.error("Download error:", error);
    return NextResponse.json(
      { error: "Failed to download file", details: error.message },
      { status: 500 }
    );
  }
}
