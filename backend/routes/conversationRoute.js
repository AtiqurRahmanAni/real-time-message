import express from "express";
import checkToken from "../middlewares/checkToken.js";
import {
  getConversationsByUsername,
  getConversationByParticipantIds,
  sendMessage,
  getMessagesByConversationId,
  setSeenByConversationId,
  setSeenByMessageId,
} from "../controllers/conversationController.js";

const router = express.Router();

// router.get("/:participantIds", checkToken, getConversationByParticipantIds);
router.get("/:username", checkToken, getConversationsByUsername);
// router.post("/", checkToken, createOrGetConversation);
router.get(
  "/:conversationId/messages",
  checkToken,
  getMessagesByConversationId
);
router.post("/message", checkToken, sendMessage);
router.patch(
  "/:conversationId/messages/seen",
  checkToken,
  setSeenByConversationId
);
router.patch(
  "/conversation/message/:messageId/seen",
  checkToken,
  setSeenByMessageId
);

export default router;
