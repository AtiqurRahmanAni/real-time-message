import express from "express";
import checkToken from "../middlewares/checkToken.js";
import {
  createOrGetConversation,
  getConversationsByUserId,
  getConversationByParticipantIds,
} from "../controllers/conversationController.js";

const router = express.Router();

// router.get("/:participantIds", checkToken, getConversationByParticipantIds);
router.get("/:username", checkToken, getConversationsByUserId);
router.post("/", checkToken, createOrGetConversation);

export default router;
