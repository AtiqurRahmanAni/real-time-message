import asyncHandler from "../utils/asyncHandler.js";
import Conversation from "../models/conversation.js";
import User from "../models/user.js";
import mongoose from "mongoose";
import { BadRequestError, InternalServerError } from "../utils/errors.js";

export const createGroupByUserIds = asyncHandler(async (req, res) => {
  const { userIds } = req.body;

  try {
    const newConversation = await Conversation.create({
      participants: userIds.map((id) => ({
        participantId: new mongoose.Types.ObjectId(id),
        lastSeenTime: new Date("1995-12-17T00:00:00"),
      })),
      isGroupConversation: true,
    });

    return res.status(201).json({ message: "Group created" });
  } catch (err) {
    console.error(`Error creating group: ${err}`);
    throw new BadRequestError("Error creating group");
  }
});
