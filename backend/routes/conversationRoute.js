import express from "express";
import checkToken from "../middlewares/checkToken.js";
import {
  getConversationsByUsername,
  sendMessage,
  getMessagesByConversationId,
  setSeenByConversationId,
  setSeenByMessageId,
} from "../controllers/conversationController.js";

const router = express.Router();

router.get("/:username", checkToken, getConversationsByUsername);
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
router.patch("/message/:messageId/seen", checkToken, setSeenByMessageId);

export default router;
