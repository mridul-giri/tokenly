import express from "express";
import { Tokenly } from "./core/tokenly.js";
import { prismaAdapter } from "./adapters/prismaAdapter.js";
import { prisma } from "./lib/prisma.js";

const app = express();
app.use(express.json());

const auth = new Tokenly({
  adapter: prismaAdapter(prisma),
});

app.use("/api/v1/auth", auth.router());

app.listen(3000, () => console.log("Testing tokenly on port 3000"));
