import express from "express";
import checkToken from "../middlewares/checkToken.js";
import {
  getConversationsByUserId,
  sendMessage,
  getMessagesByConversationId,
  updateLastSeenByParticipantId,
} from "../controllers/conversationController.js";

const router = express.Router();

router.get("/:userId", checkToken, getConversationsByUserId);
router.get(
  "/:conversationId/messages",
  checkToken,
  getMessagesByConversationId
);
router.post("/message", checkToken, sendMessage);
router.patch("/seen", checkToken, updateLastSeenByParticipantId);

export default router;
