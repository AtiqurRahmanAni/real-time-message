import express from "express";
import checkToken from "../middlewares/token.middleware.js";
import {
  getConversationsByUserId,
  sendMessage,
  getMessagesByConversationId,
  getLastSeenByUserId,
  updateLastSeenByUserId,
  deleteMessagesByConversationId,
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
router.get(
  "/:conversationId/user/:userId/last-seen",
  checkToken,
  getLastSeenByUserId
);

router.post(
  "/message",
  checkToken,
  upload.fields([{ name: "attachments", maxCount: 6 }]),
  multerErrorHandling,
  sendMessage
);

router.patch("/:conversationId/last-seen", checkToken, updateLastSeenByUserId);

router.delete(
  "/:conversationId/messages",
  checkToken,
  deleteMessagesByConversationId
);
export default router;
