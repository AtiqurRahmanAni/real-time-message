import express from "express";
import {
  createGroupByUserIds,
  getGroupByParticipantId,
  sendGroupMessage,
} from "../controllers/groupConversationController.js";
import checkToken from "../middlewares/token.middleware.js";

const router = express.Router();

router.get("/group/:participantId", checkToken, getGroupByParticipantId);
router.post("/group", checkToken, createGroupByUserIds);
router.post("/group/:groupId/message", checkToken, sendGroupMessage);
export default router;
