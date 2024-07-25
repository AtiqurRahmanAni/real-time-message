import express from "express";
import { createGroupByUserIds } from "../controllers/groupConversationController.js";
import checkToken from "../middlewares/token.middleware.js";

const router = express.Router();

router.post("/group", checkToken, createGroupByUserIds);

export default router;
