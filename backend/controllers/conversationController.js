import asyncHandler from "../utils/asyncHandler.js";
import Conversation from "../models/conversation.js";
import MessageDto from "../dto/messageDto.js";
import Users from "../models/user.js";
import Message from "../models/message.js";
import { InternalServerError, NotFoundError } from "../utils/errors.js";
import mongoose from "mongoose";
import { ChatEventEnum } from "../constants/index.js";
import { deleteFiles } from "../utils/index.js";
import pLimit from "p-limit";
import { v2 as cloudinary } from "cloudinary";

const limit = pLimit(10);

export const getConversationByParticipantIds = asyncHandler(
  async (req, res) => {
    const { participantIds } = req.params;
    const id1 = participantIds.split("&")[0];
    const id2 = participantIds.split("&")[1];

    return res.status(200).send("Ok");
  }
);

export const getConversationsByUserId = asyncHandler(async (req, res) => {
  let { userId } = req.params;
  userId = new mongoose.Types.ObjectId(userId);

  const conversations = await Users.aggregate([
    {
      $match: {
        _id: { $ne: userId },
      },
    },
    {
      $lookup: {
        from: "conversations",
        let: { userId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $in: ["$$userId", "$participants.participantId"] },
                  {
                    $in: [userId, "$participants.participantId"],
                  },
                  {
                    $eq: ["$isGroupConversation", false],
                  },
                ],
              },
            },
          },
        ],
        as: "conversationArray",
      },
    },
    {
      $addFields: { conversation: { $arrayElemAt: ["$conversationArray", 0] } },
    },
    {
      $unwind: { path: "$conversationArray", preserveNullAndEmptyArrays: true },
    },
    {
      $lookup: {
        from: "messages",
        localField: "conversationArray.lastMessageId",
        foreignField: "_id",
        as: "lastMessage",
      },
    },
    {
      $unwind: { path: "$lastMessage", preserveNullAndEmptyArrays: true },
    },
    {
      $lookup: {
        from: "messages",
        let: {
          conversationId: "$conversation._id",
          lastSeenTime: {
            $arrayElemAt: [
              "$conversation.participants.lastSeenTime",
              {
                $indexOfArray: [
                  "$conversation.participants.participantId",
                  userId,
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
                  { $eq: ["$conversationId", "$$conversationId"] },
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
      $sort: { "lastMessage.createdAt": -1 },
    },
    {
      $project: {
        _id: 1,
        username: 1,
        displayName: 1,
        conversation: {
          _id: 1,
        },
        lastMessage: {
          _id: 1,
          senderId: 1,
          receiverId: 1,
          content: 1,
          createdAt: 1,
        },
        unseenCount: { $size: "$messages" },
      },
    },
  ]);

  return res.status(200).send(conversations);
});

export const getMessagesByConversationId = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;

  const messages = await Message.find({ conversationId })
    .sort({ createdAt: -1 })
    .limit(20)
    .select({
      __v: false,
    });

  return res.status(200).send(messages.reverse());
});

export const getLastSeenMessageId = asyncHandler(async (req, res) => {
  let { conversationId, userId } = req.params;
  conversationId = new mongoose.Types.ObjectId(conversationId);
  userId = new mongoose.Types.ObjectId(userId);

  const result = await Conversation.aggregate([
    { $match: { _id: conversationId } },
    { $unwind: "$participants" },
    {
      $match: {
        "participants.participantId": new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "messages",
        let: {
          conversationId: "$_id",
          lastSeenTime: "$participants.lastSeenTime",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$conversationId", "$$conversationId"] },
                  { $lte: ["$createdAt", "$$lastSeenTime"] },
                  { $eq: ["$receiverId", userId] },
                ],
              },
            },
          },
          { $sort: { createdAt: -1 } },
          { $limit: 1 },
        ],
        as: "lastMessage",
      },
    },
    {
      $project: {
        _id: { $arrayElemAt: ["$lastMessage._id", 0] },
      },
    },
  ]);

  if (result.length > 0) {
    return res.status(200).send(result[0]);
  }
  throw new NotFoundError("Last seen time not found");
});

export const updateLastSeenByParticipantId = asyncHandler(async (req, res) => {
  const { conversationId, participantId } = req.body;

  try {
    const result = await Conversation.updateOne(
      {
        _id: new mongoose.Types.ObjectId(conversationId),
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
    console.error(`Error updating seen status: ${err}`);
    throw new InternalServerError("Something went wrong updating seen status");
  }
});

export const sendMessage = asyncHandler(async (req, res) => {
  const { senderId, receiverId, content } = req.body;
  const { attachments } = req.files;

  // console.log(senderId, receiverId, content, attachments);

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const attachmentsToUpload = attachments?.map((attachment) => {
      return limit(
        async () =>
          await cloudinary.uploader.upload(attachment.path, {
            folder: "attachments",
          }) // cloudinary folder where attachments are stored
      );
    });

    let attachmentsUploadResult = null;
    if (attachments) {
      attachmentsUploadResult = await Promise.all(attachmentsToUpload);
    }

    let conversation = null;
    conversation = await Conversation.findOne({
      participants: {
        $all: [
          { $elemMatch: { participantId: senderId } },
          { $elemMatch: { participantId: receiverId } },
        ],
        $size: 2,
      },
    })
      .select({ __v: false })
      .session(session);

    conversation =
      conversation ||
      (
        await Conversation.create(
          [
            {
              participants: [
                { participantId: senderId, lastSeenTime: new Date() },
                {
                  participantId: receiverId,
                  lastSeenTime: new Date("1995-12-17T00:00:00"), // if there is a new conversation, set the receiver lastSeenTime to the past so that when the messages are fetched, it will show the correct count
                },
              ],
            },
          ],
          { session }
        )
      )[0];

    const newMessage = await Message.create(
      [
        {
          conversationId: conversation._id,
          content: content,
          senderId: senderId,
          receiverId: receiverId,
          attachments: attachmentsUploadResult?.map((item) => ({
            url: item.secure_url,
            publicId: item.public_id,
          })),
        },
      ],
      { session }
    );

    const updatedConversation = await Conversation.findOneAndUpdate(
      { _id: conversation._id, "participants.participantId": senderId },
      {
        $set: {
          "participants.$.lastSeenTime": new Date(),
          lastMessageId: newMessage[0]._id, //newMessage is an array
        },
      },
      { new: true, session }
    );

    const message = new MessageDto(newMessage[0]);

    await session.commitTransaction();

    /* new message will receive through socket connection both sender and receiver, 
    this is handy if sender is logged in multiple devices. sent message will appear 
    in real time in all devices
    */
    [senderId, receiverId].forEach((recipient) =>
      req.app
        .get("io")
        .in(recipient)
        .emit(ChatEventEnum.MESSAGE_RECEIVED_EVENT, {
          conversation: { _id: updatedConversation._id },
          message,
        })
    );

    return res.status(200).json({ message: "Message sent" });
  } catch (err) {
    await session.abortTransaction();
    console.error(`Error sending message: ${err}`);
    throw new InternalServerError("Error sending message");
  } finally {
    session.endSession();
    if (attachments) {
      deleteFiles(attachments.map((item) => item.path));
    }
  }
});
