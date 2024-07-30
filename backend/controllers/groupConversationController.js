import asyncHandler from "../utils/asyncHandler.js";
import Conversation from "../models/conversation.js";
import mongoose from "mongoose";
import { BadRequestError, InternalServerError } from "../utils/errors.js";
import GroupMessage from "../models/groupMessage.js";
import { GroupChatEventEnum } from "../constants/index.js";
import GroupMessageDto from "../dto/groupMessageDto.js";
import { v2 as cloudinary } from "cloudinary";
import "dotenv/config";
import pLimit from "p-limit";
import { deleteFiles } from "../utils/index.js";

const NODE_ENV = process.env.NODE_ENV;
const limit = pLimit(10);

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
        groupId: false,
        __v: false,
      });
    return res.status(200).send(messages.reverse());
  } catch (err) {
    console.error(`Error fetching group messages: ${err}`);
    throw new InternalServerError("Error fetching group messages");
  }
});

export const getLastSeenOfParticipants = asyncHandler(async (req, res) => {
  const { groupId } = req.params;

  try {
    const lastSeenList = await Conversation.findById(groupId).select({
      participants: true,
    });

    return res.status(200).send(lastSeenList.participants);
  } catch (err) {
    console.error(`Error fetching last seen: ${err}`);
    throw new InternalServerError(`Error fetching last seen`);
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
  const { attachments } = req.files;

  groupId = new mongoose.Types.ObjectId(groupId);
  senderId = new mongoose.Types.ObjectId(senderId);

  try {
    const attachmentsToUpload = attachments?.map((attachment) => {
      return limit(
        async () =>
          await cloudinary.uploader.upload(attachment.path, {
            folder:
              NODE_ENV === "development"
                ? "group_attachments_dev"
                : "group_attachments",
          })
      );
    });

    let attachmentsUploadResult = null;
    if (attachments) {
      attachmentsUploadResult = await Promise.all(attachmentsToUpload);
    }

    const group = await Conversation.findOne({
      _id: groupId,
      isGroupConversation: true,
    }).select({ participants: true, lastMessageId: true });

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

    let newMessage = await GroupMessage.create([
      {
        groupId,
        content,
        senderId,
        receiverIds,
        attachments: attachmentsUploadResult?.map((item) => ({
          url: item.secure_url,
          publicId: item.public_id,
        })),
      },
    ]);
    newMessage = newMessage[0];

    group.participants[indexOfSender].lastSeenTime = new Date();
    group.lastMessageId = newMessage._id;

    await group.save();

    // emit message receive event to the group members
    group.participants.forEach((participant) => {
      req.app
        .get("io")
        .in(participant.participantId.toString())
        .emit(GroupChatEventEnum.GROUP_MESSAGE_RECEIVED_EVENT, {
          group: {
            _id: group._id,
          },
          message: new GroupMessageDto(newMessage),
        });
    });

    return res.status(200).json({ message: "Message sent" });
  } catch (err) {
    console.error(`Error sending group message: ${err}`);
    throw new InternalServerError("Error sending group message");
  } finally {
    if (attachments) {
      deleteFiles(attachments.map((item) => item.path));
    }
  }
});

export const updateLastSeenOfParticipant = asyncHandler(async (req, res) => {
  const { participantId } = req.body;
  const { groupId } = req.params;

  try {
    const result = await Conversation.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(groupId),
        "participants.participantId": new mongoose.Types.ObjectId(
          participantId
        ),
      },
      {
        $set: { "participants.$.lastSeenTime": new Date() },
      },
      { new: true }
    );

    return res.status(200).send(result.participants);
  } catch (err) {
    console.error(`Error updating group last seen: ${err}`);
    throw new InternalServerError("Something went wrong updating seen status");
  }
});

export const deleteMessagesByGroupId = asyncHandler(async (req, res) => {
  let { groupId } = req.params;
  groupId = new mongoose.Types.ObjectId(groupId);

  const session = await mongoose.startSession();
  session.startTransaction({
    readConcern: { level: "snapshot" },
    writeConcern: { w: "majority" },
    maxCommitTimeMS: 3 * 60 * 1000, // 3 mins
  });

  try {
    const attachments = await GroupMessage.aggregate(
      [
        {
          $match: { groupId: groupId },
        },
        {
          $unwind: "$attachments",
        },
        {
          $project: {
            _id: false,
            publicId: "$attachments.publicId",
          },
        },
      ],
      { session }
    );

    // delete from attachments from cloudinary
    const deleteAttachmentsResult = await Promise.all(
      attachments.map((attachment) => {
        return new Promise((resolve, reject) => {
          cloudinary.uploader.destroy(attachment.publicId, (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          });
        });
      })
    );

    const messagesDeleteResult = await GroupMessage.deleteMany({
      groupId,
    }).session(session);

    const group = await Conversation.findById(groupId).session(session);
    group.lastMessageId = null;
    const participants = group.participants;

    await group.save({ session });

    await session.commitTransaction();

    participants.forEach((participant) => {
      req.app
        .get("io")
        .in(participant.participantId.toString())
        .emit(GroupChatEventEnum.GROUP_MESSAGE_DELETE, groupId.toString());
    });

    return res.status(200).json({ message: "Messages deleted" });
  } catch (err) {
    await session.abortTransaction();
    console.error(`Error deleting group messages: ${err}`);
    throw new InternalServerError("Error deleting group messages");
  } finally {
    session.endSession();
  }
});
