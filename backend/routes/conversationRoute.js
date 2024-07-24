import express from "express";
import checkToken from "../middlewares/token.middleware.js";
import {
  getConversationsByUserId,
  sendMessage,
  getMessagesByConversationId,
  updateLastSeenByParticipantId,
  getLastSeenMessageId,
} from "../controllers/conversationController.js";
import { upload } from "../middlewares/multer.middleware.js";
import { multerErrorHandling } from "../middlewares/multerError.middleware.js";

const router = express.Router();

router.get("/:userId", checkToken, getConversationsByUserId);
router.get(
  "/:conversationId/messages",
  checkToken,
  getMessagesByConversationId
);
router.get("/:conversationId/user/:userId/lastmessage", getLastSeenMessageId);
router.post(
  "/message",
  checkToken,
  upload.fields([{ name: "attachments", maxCount: 6 }]),
  multerErrorHandling,
  sendMessage
);
router.patch("/seen", checkToken, updateLastSeenByParticipantId);

export default router;
