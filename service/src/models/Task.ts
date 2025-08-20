import mongoose, { Schema, Document } from "mongoose";

export interface ITask extends Document {
  title: string;
  userId: string;
  createdAt: Date;
}

const TaskSchema = new Schema<ITask>({
  title: { type: String, required: true },
  userId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<ITask>("Task", TaskSchema);