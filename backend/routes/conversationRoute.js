import express from "express";
import checkToken from "../middlewares/checkToken.js";
import {
  getConversationsByUserId,
  getConversationByParticipantIds,
  sendMessage,
  getMessagesByConversationId,
} from "../controllers/conversationController.js";

const router = express.Router();

// router.get("/:participantIds", checkToken, getConversationByParticipantIds);
router.get("/:username", checkToken, getConversationsByUserId);
// router.post("/", checkToken, createOrGetConversation);
router.get(
  "/:conversationId/messages",
  checkToken,
  getMessagesByConversationId
);
router.post("/message", checkToken, sendMessage);

export default router;
