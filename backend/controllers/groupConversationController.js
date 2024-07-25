import asyncHandler from "../utils/asyncHandler.js";
import Conversation from "../models/conversation.js";
import mongoose from "mongoose";
import { BadRequestError, InternalServerError } from "../utils/errors.js";
import GroupMessage from "../models/groupMessage.js";

export const getGroupByParticipantId = asyncHandler(async (req, res) => {
  let { participantId } = req.params;
  participantId = new mongoose.Types.ObjectId(participantId);

  try {
    const groups = await Conversation.aggregate([
      {
        $match: {
          "participants.participantId": participantId,
          isGroupConversation: true,
        },
      },
      {
        $lookup: {
          from: "groupmessages",
          localField: "lastMessageId",
          foreignField: "_id",
          as: "lastMessage",
        },
      },
      {
        $unwind: { path: "$lastMessage", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "groupmessages",
          let: {
            groupId: "$_id",
            lastSeenTime: {
              $arrayElemAt: [
                "$conversation.participants.lastSeenTime",
                {
                  $indexOfArray: [
                    "$conversation.participants.participantId",
                    participantId,
                  ],
                },
              ],
            },
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$groupId", "$$groupId"] },
                    { $gte: ["$createdAt", "$$lastSeenTime"] },
                  ],
                },
              },
            },
          ],
          as: "groupMessages",
        },
      },
      {
        $sort: {
          "lastMessage.createdAt": -1,
          createdAt: -1,
        },
      },
      {
        $project: {
          _id: 1,
          conversationName: 1,
          lastMessage: {
            _id: 1,
            senderId: 1,
            receiverIds: 1,
            content: 1,
            attachments: 1,
            createdAt: 1,
          },
          unseenCount: { $size: "$groupMessages" },
        },
      },
    ]);

    return res.status(200).send(groups);
  } catch (err) {
    console.error(`Error fetching groups: ${err}`);
    throw new BadRequestError("Error fetching groups");
  }
});

export const createGroupByUserIds = asyncHandler(async (req, res) => {
  const { userIds, groupName } = req.body;

  try {
    const newConversation = await Conversation.create({
      conversationName: groupName,
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

export const sendGroupMessage = asyncHandler(async (req, res) => {
  let { groupId } = req.params;
  let { content, senderId, receiverIds } = req.body;
  groupId = new mongoose.Types.ObjectId(groupId);
  senderId = new mongoose.Types.ObjectId(senderId);
  receiverIds = receiverIds?.map((id) => new mongoose.Types.ObjectId(id));
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const newMessage = await GroupMessage.create(
      [
        {
          groupId,
          content,
          senderId,
          receiverIds,
        },
      ],
      { session }
    );

    console.log(newMessage);

    const group = await Conversation.findOneAndUpdate(
      {
        _id: groupId,
        isGroupConversation: true,
        "participants.participantId": senderId,
      },
      {
        $set: {
          "participants.$.lastSeenTime": new Date(),
          lastMessageId: newMessage[0]._id, //newMessage is an array
        },
      },
      { new: true, session }
    );

    await session.commitTransaction();

    return res.status(200).json({ message: "Message sent" });
  } catch (err) {
    await session.abortTransaction();
    console.error(`Error sending group message: ${err}`);
    throw new InternalServerError("Error sending group message");
  } finally {
    session.endSession();
  }
});
