import mongoose, { Schema, model, models } from "mongoose";

export interface IUser {
  _id: string;
  email: string;
  password: string;
  role: "admin" | "judge" | "contestant";
  teamId?: string;
  teamName?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["admin", "judge", "contestant"],
      required: [true, "Role is required"],
    },
    teamId: {
      type: String,
    },
    teamName: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent model recompilation in development
export default models.User || model<IUser>("User", UserSchema);
