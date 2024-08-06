import express from "express";
import {
  createGroupByUserIds,
  deleteGroupByGroupId,
  deleteMessagesByGroupId,
  getGroupMessagesByGroupId,
  getGroupsByParticipantId,
  getLastSeenOfParticipants,
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

router.delete("/group/:groupId/messages", checkToken, deleteMessagesByGroupId);
router.delete("/group/:groupId", checkToken, deleteGroupByGroupId);

export default router;
