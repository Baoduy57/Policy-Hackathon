import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { uploadToGridFS } from "@/lib/gridfs";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const userPayload = getUserFromRequest(request);
    if (!userPayload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Connect to MongoDB
    await dbConnect();

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const teamId = formData.get("teamId") as string;

    if (!file || !teamId) {
      return NextResponse.json(
        { error: "File and teamId are required" },
        { status: 400 }
      );
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size exceeds 10MB limit" },
        { status: 400 }
      );
    }

    // Read file as buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to GridFS (MongoDB)
    const fileId = await uploadToGridFS(buffer, file.name, {
      teamId,
      uploadedBy: userPayload.userId,
      uploadedAt: new Date(),
      contentType: file.type,
      originalSize: file.size,
    });

    console.log(
      `[Upload] File saved to MongoDB GridFS: ${file.name}, ID: ${fileId}`
    );

    return NextResponse.json({
      success: true,
      fileId, // MongoDB ObjectId
      fileName: file.name,
      fileSize: file.size,
      message: "File uploaded to MongoDB successfully",
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file", details: error.message },
      { status: 500 }
    );
  }
}
