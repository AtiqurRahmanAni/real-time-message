import express from "express";
import {
  createGroupByUserIds,
  getGroupMessagesByGroupId,
  getGroupsByParticipantId,
  getLastSeenOfParticipants,
  getSeenMessagesByReceivers,
  sendGroupMessage,
  updateLastSeenOfParticipant,
} from "../controllers/groupConversationController.js";
import checkToken from "../middlewares/token.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { multerErrorHandling } from "../middlewares/multerError.middleware.js";

const router = express.Router();

router.get(
  "/group/participant/:participantId",
  checkToken,
  getGroupsByParticipantId
);
router.get("/group/:groupId/message", checkToken, getGroupMessagesByGroupId);
router.get(
  "/group/:groupId/last-seen-message-by/:senderId",
  checkToken,
  getSeenMessagesByReceivers
);
router.get(
  "/group/:groupId/participants-last-seen",
  checkToken,
  getLastSeenOfParticipants
);

router.post("/group", checkToken, createGroupByUserIds);
router.post(
  "/group/:groupId/message",
  checkToken,
  upload.fields([{ name: "attachments", maxCount: 6 }]),
  multerErrorHandling,
  sendGroupMessage
);
router.patch(
  "/group/:groupId/participant-last-seen",
  checkToken,
  updateLastSeenOfParticipant
);
export default router;
