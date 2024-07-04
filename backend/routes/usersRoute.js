import express from "express";
import checkToken from "../middlewares/checkToken.js";
import { getAllUsers, getProfile } from "../controllers/userController.js";

const router = express.Router();

router.get("/", checkToken, getAllUsers);

router.get("/profile", checkToken, getProfile);

export default router;
