import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Submission from "@/models/Submission";
import { getUserFromRequest } from "@/lib/auth";

// GET all submissions
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const submissions = await Submission.find({}).sort({ submittedAt: -1 });

    console.log(
      `[GET /api/submissions] Found ${submissions.length} submissions in DB`
    );

    return NextResponse.json({
      success: true,
      submissions: submissions.map((sub) => ({
        teamId: sub.teamId,
        teamName: sub.teamName,
        topic: sub.topic,
        notes: sub.notes,
        fileId: sub.fileId, // MongoDB GridFS ObjectId
        fileName: sub.fileName,
        fileSize: sub.fileSize,
        file: {
          name: sub.fileName,
          url: sub.fileUrl, // Deprecated but kept for backward compatibility
          size: sub.fileSize,
        },
        submittedAt: sub.submittedAt,
      })),
    });
  } catch (error: any) {
    console.error("Get submissions error:", error);
    return NextResponse.json(
      { error: "Failed to fetch submissions" },
      { status: 500 }
    );
  }
}

// POST new submission
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user || user.role !== "contestant") {
      return NextResponse.json(
        { error: "Unauthorized. Only contestants can submit." },
        { status: 403 }
      );
    }

    await dbConnect();

    const { teamId, teamName, topic, notes, fileId, fileName, fileSize } =
      await request.json();

    if (!teamId || !teamName || !topic || !fileName || !fileId) {
      return NextResponse.json(
        { error: "Missing required fields (need fileId)" },
        { status: 400 }
      );
    }

    // Check if team already has a submission
    const existingSubmission = await Submission.findOne({ teamId });
    if (existingSubmission) {
      // Update existing submission
      existingSubmission.topic = topic;
      existingSubmission.notes = notes;
      existingSubmission.fileId = fileId; // MongoDB GridFS ObjectId
      existingSubmission.fileName = fileName;
      existingSubmission.fileSize = fileSize;
      existingSubmission.submittedAt = new Date();
      await existingSubmission.save();

      console.log(
        `[POST /api/submissions] Updated submission for team: ${teamName}, fileId: ${fileId}`
      );

      return NextResponse.json({
        success: true,
        submission: {
          teamId: existingSubmission.teamId,
          teamName: existingSubmission.teamName,
          topic: existingSubmission.topic,
          notes: existingSubmission.notes,
          fileId: existingSubmission.fileId,
          fileName: existingSubmission.fileName,
          fileSize: existingSubmission.fileSize,
          file: {
            name: existingSubmission.fileName,
            url: `/api/download/${existingSubmission.fileId}`, // Dynamic URL
            size: existingSubmission.fileSize,
          },
          submittedAt: existingSubmission.submittedAt,
        },
      });
    }

    // Create new submission
    const submission = await Submission.create({
      teamId,
      teamName,
      topic,
      notes: notes || "",
      fileId, // MongoDB GridFS ObjectId
      fileName,
      fileSize: fileSize || 0,
      submittedAt: new Date(),
    });

    console.log(
      `[POST /api/submissions] Created new submission for team: ${teamName} (${teamId}), fileId: ${fileId}`
    );

    return NextResponse.json(
      {
        success: true,
        submission: {
          teamId: submission.teamId,
          teamName: submission.teamName,
          topic: submission.topic,
          notes: submission.notes,
          fileId: submission.fileId,
          fileName: submission.fileName,
          fileSize: submission.fileSize,
          file: {
            name: submission.fileName,
            url: `/api/download/${submission.fileId}`, // Dynamic URL
            size: submission.fileSize,
          },
          submittedAt: submission.submittedAt,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create submission error:", error);
    return NextResponse.json(
      { error: "Failed to create submission" },
      { status: 500 }
    );
  }
}

// DELETE submission (for admin)
export async function DELETE(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized. Only admins can delete submissions." },
        { status: 403 }
      );
    }

    await dbConnect();

    const { teamId } = await request.json();

    await Submission.deleteOne({ teamId });

    return NextResponse.json({
      success: true,
      message: "Submission deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete submission error:", error);
    return NextResponse.json(
      { error: "Failed to delete submission" },
      { status: 500 }
    );
  }
}
