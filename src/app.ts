import express from "express";
import { Tokenly } from "./core/tokenly.js";
import { prismaAdapter } from "./adapters/prismaAdapter.js";
import { prisma } from "./lib/prisma.js";
import { dbConnect } from "./lib/mongo.js";
import { mongoDBAdaptet } from "./adapters/mongoDBAdapter.js";
import UserModel from "./model/user.js";

// if using mongodb
// dbConnect();

const app = express();
app.use(express.json());

const auth = new Tokenly({
  adapter: prismaAdapter(prisma),
  // adapter: mongoDBAdaptet(UserModel),
});

app.use("/api/v1/auth", auth.router());

app.listen(3000, () => console.log("Testing tokenly on port 3000"));
