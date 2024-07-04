import log from "./middlewares/logger.js";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import "dotenv/config";
import cors from "cors";
import express from "express";
import authRouter from "./routes/authRoute.js";
import userRouter from "./routes/usersRoute.js";
import errorHandler from "./middlewares/errorHandler.js";
import conversationRouter from "./routes/conversationRoute.js";

const app = express();
const PORT = process.env.PORT || 3000;

mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => console.log("Connected to database"))
  .catch((err) => console.log(`Error connecting to database ${err}`));

app.use(express.json());
app.use(cookieParser());
app.use(log);
app.use(
  cors({
    credentials: true,
    origin: process.env.ALLOWED_ORIGIN,
  })
);

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/conversation", conversationRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

export default app;
