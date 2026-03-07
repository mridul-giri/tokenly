import mongoose from "mongoose";

export const dbConnect = async () => {
  try {
    const URI = process.env.MONOGO_URL || "mongodb://mongo:27017/tokenly";
    await mongoose.connect(URI);
    console.log("Mongo db connected successfully");
  } catch (error) {
    console.error("DB Connection failed", error);
    process.exit(1);
  }
};
