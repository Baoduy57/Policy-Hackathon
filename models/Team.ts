import mongoose, { Schema, model, models } from "mongoose";

export interface ITeam {
  _id: string;
  teamId: string;
  name: string;
  members: string[];
  score: {
    bgk: number;
    ai: number;
    final: number;
  };
  scoredBy: Array<{
    judgeId: string;
    score: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const TeamSchema = new Schema<ITeam>(
  {
    teamId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: [true, "Team name is required"],
    },
    members: {
      type: [String],
      default: [],
    },
    score: {
      bgk: { type: Number, default: 0 },
      ai: { type: Number, default: 0 },
      final: { type: Number, default: 0 },
    },
    scoredBy: [
      {
        judgeId: String,
        score: Number,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default models.Team || model<ITeam>("Team", TeamSchema);
