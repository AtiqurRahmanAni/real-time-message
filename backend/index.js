import log from "./middlewares/logger.middleware.js";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import "dotenv/config";
import cors from "cors";
import express from "express";
import authRouter from "./routes/authRoute.js";
import userRouter from "./routes/usersRoute.js";
import errorHandler from "./middlewares/errorHandler.middleware.js";
import conversationRouter from "./routes/conversationRoute.js";
import groupConversationRouter from "./routes/groupConversationRoute.js";
import { createServer } from "http";
import { Server } from "socket.io";
import { initSocket } from "./socket/index.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3000;

mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => console.log("Connected to database"))
  .catch((err) => {
    console.log(`Error connecting to database ${err}`);
    process.exit(1);
  });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// for temporary image store
const folderName = "uploads";
try {
  if (!fs.existsSync(folderName)) {
    fs.mkdirSync(folderName);
  }
} catch (err) {
  console.error(err);
}

const io = new Server(httpServer, {
  pingTimeout: 60000,
  cors: {
    origin: process.env.ALLOWED_ORIGIN,
    credentials: true,
  },
});

app.set("io", io);
app.use(express.json());
app.use(cookieParser());
app.use(log);
app.use(
  cors({
    credentials: true,
    origin: process.env.ALLOWED_ORIGIN,
  })
);

app.get("/", (req, res) => {
  return res.status(200).json({ message: "API is working" });
});
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/conversation", conversationRouter);
app.use("/api/group-conversation", groupConversationRouter);

app.use(errorHandler);

initSocket(io);

httpServer.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

export default app;
