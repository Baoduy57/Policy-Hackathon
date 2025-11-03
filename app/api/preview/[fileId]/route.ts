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
    const fileInfo = await getFileInfo(fileId);
    const fileBuffer = await downloadFromGridFS(fileId);

    return new NextResponse(fileBuffer as any, {
      headers: {
        "Content-Type": fileInfo.metadata?.contentType || "application/pdf",
        "Content-Disposition": `inline; filename="${encodeURIComponent(
          fileInfo.filename
        )}"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to preview", details: error.message },
      { status: 500 }
    );
  }
}
