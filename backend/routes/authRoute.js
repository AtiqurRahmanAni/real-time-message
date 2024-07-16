import express from "express";
import { login, logout, signup } from "../controllers/authController.js";
import checkToken from "../middlewares/token.middleware.js";

const authRouter = express.Router();

authRouter.post("/login", login);
authRouter.post("/logout", checkToken, logout);
authRouter.post("/signup", signup);

export default authRouter;
