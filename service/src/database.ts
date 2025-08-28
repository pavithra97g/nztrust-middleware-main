import mongoose, { Schema, model } from "mongoose";
import bcrypt from "bcrypt";
import { RegisterRequest, User as UserType } from "./types";
import { config } from "./config";

// MongoDB Connection
const MONGO_URI = config.MONGO_URI as string;
const DB_NAME = config.DB_NAME as string;

if (!MONGO_URI) {
  throw new Error("MONGO_URI is missing from environment variables.");
}

export const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    console.log("Using existing MongoDB connection.");
    return;
  }

  try {
    await mongoose.connect(MONGO_URI, { dbName: DB_NAME });
    console.log(`Connected to MongoDB: ${DB_NAME}`);
  } catch (error) {
        console.log(`Failed to Connect to MongoDB: ${DB_NAME}`);

    console.error("MongoDB Connection Error :", error);
    throw new Error("Failed to connect to MongoDB.");
  }
};

// Mongoose User Schema
const userSchema = new Schema<UserType>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const UserModel = model<UserType>("User", userSchema);

// CRUD operations

export const findUserByEmail = async (
  email: string
): Promise<UserType | null> => {
  return await UserModel.findOne({ email });
};

export const findUserById = async (id: string): Promise<UserType | null> => {
  return await UserModel.findById(id);
};

export const getAllUsers = async (): Promise<UserType[]> => {
  return await UserModel.find();
};

export const createUser = async (
  userData: RegisterRequest
): Promise<UserType> => {
  const hashedPassword = await bcrypt.hash(
    userData.password,
    config.BCRYPT_ROUNDS
  );

  const newUser = new UserModel({
    email: userData.email,
    password: hashedPassword,
    name: userData.name,
  });

  return await newUser.save();
};
