import asyncHandler from "../utils/asyncHandler.js";
import Conversation from "../models/conversation.js";
import mongoose from "mongoose";
import { BadRequestError, InternalServerError } from "../utils/errors.js";
import GroupMessage from "../models/groupMessage.js";
import { GroupChatEventEnum } from "../constants/index.js";

export const getGroupsByParticipantId = asyncHandler(async (req, res) => {
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
                "$participants.lastSeenTime",
                {
                  $indexOfArray: ["$participants.participantId", participantId],
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
                    { $gt: ["$createdAt", "$$lastSeenTime"] },
                  ],
                },
              },
            },
          ],
          as: "messages",
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
          unseenCount: { $size: "$messages" },
        },
      },
    ]);

    return res.status(200).send(groups);
  } catch (err) {
    console.error(`Error fetching groups: ${err}`);
    throw new BadRequestError("Error fetching groups");
  }
});

export const getGroupMessagesByGroupId = asyncHandler(async (req, res) => {
  let { groupId } = req.params;
  groupId = new mongoose.Types.ObjectId(groupId);

  try {
    const messages = await GroupMessage.find({ groupId })
      .sort({ createdAt: -1 })
      .limit(20)
      .select({
        __v: false,
      });
    return res.status(200).send(messages.reverse());
  } catch (err) {
    console.error(`Error fetching group messages: ${err}`);
    throw new InternalServerError("Error fetching group messages");
  }
});

export const createGroupByUserIds = asyncHandler(async (req, res) => {
  let { userIds, groupName } = req.body;
  userIds = userIds.map((id) => new mongoose.Types.ObjectId(id));

  try {
    const newConversation = await Conversation.create({
      conversationName: groupName,
      participants: userIds.map((id) => ({
        participantId: id,
        lastSeenTime: new Date("1995-12-17T00:00:00"),
      })),
      isGroupConversation: true,
    });

    // emit event to the group participants
    userIds.forEach((id) => {
      req.app
        .get("io")
        .in(id.toString())
        .emit(GroupChatEventEnum.GROUP_UPDATE_EVENT);
    });

    return res.status(201).json({ message: "Group created" });
  } catch (err) {
    console.error(`Error creating group: ${err}`);
    throw new InternalServerError("Error creating group");
  }
});

export const sendGroupMessage = asyncHandler(async (req, res) => {
  let { groupId } = req.params;
  let { content, senderId } = req.body;
  groupId = new mongoose.Types.ObjectId(groupId);
  senderId = new mongoose.Types.ObjectId(senderId);
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const group = await Conversation.findOne({
      _id: groupId,
      isGroupConversation: true,
    })
      .select({ participants: true, lastMessageId: true })
      .session(session);

    let receiverIds = [];
    let indexOfSender = -1;
    for (let i = 0; i < group.participants.length; i++) {
      const participantId = group.participants[i].participantId;
      if (participantId.toString() !== senderId.toString()) {
        receiverIds.push(participantId);
      } else {
        indexOfSender = i;
      }
    }

    let newMessage = await GroupMessage.create(
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
    newMessage = newMessage[0];

    group.participants[indexOfSender].lastSeenTime = new Date();
    group.lastMessageId = newMessage._id;

    await group.save({ session });

    await session.commitTransaction();

    // emit message receive event to the group members
    group.participants.forEach((participant) => {
      req.app
        .get("io")
        .in(participant.participantId.toString())
        .emit(GroupChatEventEnum.GROUP_MESSAGE_RECEIVED_EVENT, {
          group: {
            _id: group._id,
          },
          message: {
            _id: newMessage._id,
            content: newMessage.content,
            senderId: newMessage.senderId,
            receiverIds: newMessage.receiverIds,
            attachments: newMessage.attachments,
            createdAt: newMessage.createdAt,
          },
        });
    });

    return res.status(200).json({ message: "Message sent" });
  } catch (err) {
    await session.abortTransaction();
    console.error(`Error sending group message: ${err}`);
    throw new InternalServerError("Error sending group message");
  } finally {
    session.endSession();
  }
});

export const updateLastSeenByGroupId = asyncHandler(async (req, res) => {
  const { participantId } = req.body;
  const { groupId } = req.params;
  try {
    const result = await Conversation.updateOne(
      {
        _id: new mongoose.Types.ObjectId(groupId),
        "participants.participantId": new mongoose.Types.ObjectId(
          participantId
        ),
      },
      {
        $set: { "participants.$.lastSeenTime": new Date() },
      }
    );

    return res.status(200).json({ message: "Last seen updated" });
  } catch (err) {
    console.error(`Error updating group last seen: ${err}`);
    throw new InternalServerError("Something went wrong updating seen status");
  }
});
