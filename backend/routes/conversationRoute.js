import express from "express";
import checkToken from "../middlewares/checkToken.js";
import {
  createOrGetConversation,
  getConversationByOneParticipantId,
  getConversationByParticipantIds,
} from "../controllers/conversationController.js";

const router = express.Router();

// router.get("/:participantIds", checkToken, getConversationByParticipantIds);
router.get("/:participantId", checkToken, getConversationByOneParticipantId);
router.post("/", checkToken, createOrGetConversation);

export default router;
