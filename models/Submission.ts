import mongoose, { Schema, model, models } from "mongoose";

export interface ISubmission {
  _id: string;
  teamId: string;
  teamName: string;
  topic: string;
  notes: string;
  fileName: string;
  fileId: string; // MongoDB GridFS ObjectId
  fileUrl?: string; // Deprecated - kept for backward compatibility
  fileSize: number;
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SubmissionSchema = new Schema<ISubmission>(
  {
    teamId: {
      type: String,
      required: [true, "Team ID is required"],
    },
    teamName: {
      type: String,
      required: [true, "Team name is required"],
    },
    topic: {
      type: String,
      required: [true, "Topic is required"],
    },
    notes: {
      type: String,
      default: "",
    },
    fileName: {
      type: String,
      required: [true, "File name is required"],
    },
    fileId: {
      type: String,
      required: [true, "File ID is required"], // MongoDB GridFS ObjectId
    },
    fileUrl: {
      type: String,
      required: false, // Deprecated - kept for backward compatibility
    },
    fileSize: {
      type: Number,
      required: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default models.Submission ||
  model<ISubmission>("Submission", SubmissionSchema);
