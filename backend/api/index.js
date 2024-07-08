import log from "../middlewares/logger.js";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import "dotenv/config";
import cors from "cors";
import express from "express";
import authRouter from "../routes/authRoute.js";
import userRouter from "../routes/usersRoute.js";
import errorHandler from "../middlewares/errorHandler.js";
import conversationRouter from "../routes/conversationRoute.js";
import { createServer } from "http";
import { Server } from "socket.io";
import { initSocket } from "../socket/index.js";

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3000;

const connectToDatabase = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URL);
    console.log("Connected to database");
  } catch (err) {
    console.log(`Error connecting to database ${err}`);
    process.exit(1);
  }
};

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

app.use(errorHandler);

initSocket(io);

httpServer.listen(PORT, () => {
  connectToDatabase();
  console.log(`Server is listening on port ${PORT}`);
});

export default app;
