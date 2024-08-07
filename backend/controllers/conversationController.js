import asyncHandler from "../utils/asyncHandler.js";
import Conversation from "../models/conversation.js";
import MessageDto from "../dto/messageDto.js";
import Users from "../models/user.js";
import Message from "../models/message.js";
import { InternalServerError } from "../utils/errors.js";
import mongoose from "mongoose";
import { ChatEventEnum } from "../constants/index.js";
import { deleteFiles } from "../utils/index.js";
import pLimit from "p-limit";
import { v2 as cloudinary } from "cloudinary";
import "dotenv/config";

const NODE_ENV = process.env.NODE_ENV;
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
  let { pageSize = 20, pageNo = 1 } = req.query;

  pageNo = parseInt(pageNo, 10);
  pageSize = parseInt(pageSize, 10);

  const totalMessages = await Message.countDocuments({ conversationId });
  const totalPages = Math.ceil(totalMessages / pageSize);

  const messages = await Message.find({ conversationId })
    .sort({ createdAt: -1 })
    .skip((pageNo - 1) * pageSize)
    .limit(pageSize)
    .select({
      __v: false,
    });

  const response = {
    messages,
    nextPage: pageNo + 1 <= totalPages ? pageNo + 1 : null,
  };
  return res.status(200).send(response);
});

export const getLastSeenByUserId = asyncHandler(async (req, res) => {
  const { conversationId, userId } = req.params;

  try {
    const lastSeen = await Conversation.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(conversationId) } },
      { $unwind: "$participants" },
      {
        $match: {
          "participants.participantId": new mongoose.Types.ObjectId(userId),
        },
      },
      { $project: { _id: 0, lastSeenTime: "$participants.lastSeenTime" } },
    ]);

    return res.status(200).send(lastSeen[0]);
  } catch (err) {
    console.error(`Error fetching last seen: ${err}`);
    throw new InternalServerError("Error fetching last seen");
  }
});

export const updateLastSeenByUserId = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  const { conversationId } = req.params;

  try {
    const result = await Conversation.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(conversationId),
        "participants.participantId": new mongoose.Types.ObjectId(userId),
        isGroupConversation: false,
      },
      {
        $set: { "participants.$.lastSeenTime": new Date() },
      },
      { new: true }
    );

    const lastSeenTime = result.participants.find(
      (participant) => participant.participantId.toString() === userId
    )?.lastSeenTime;

    return res.status(200).json({ lastSeenTime });
  } catch (err) {
    console.error(`Something went wrong updating last seen: ${err}`);
    throw new InternalServerError("Something went wrong updating last seen");
  }
});

export const sendMessage = asyncHandler(async (req, res) => {
  const { senderId, receiverId, content } = req.body;
  const { attachments } = req.files;

  try {
    const attachmentsToUpload = attachments?.map((attachment) => {
      return limit(
        async () =>
          await cloudinary.uploader.upload(attachment.path, {
            folder:
              NODE_ENV === "development" ? "attachments_dev" : "attachments",
          }) // cloudinary folder where attachments are stored
      );
    });

    let attachmentsUploadResult = null;
    if (attachments) {
      attachmentsUploadResult = await Promise.all(attachmentsToUpload);
    }

    let conversation = null;
    conversation = await Conversation.findOne({
      isGroupConversation: false,
      participants: {
        $all: [
          { $elemMatch: { participantId: senderId } },
          { $elemMatch: { participantId: receiverId } },
        ],
        $size: 2,
      },
    }).select({ __v: false });

    conversation =
      conversation ||
      (
        await Conversation.create([
          {
            participants: [
              { participantId: senderId, lastSeenTime: new Date() },
              {
                participantId: receiverId,
                lastSeenTime: new Date("1995-12-17T00:00:00"), // if there is a new conversation, set the receiver lastSeenTime to the past so that when the messages are fetched, it will show the correct count
              },
            ],
          },
        ])
      )[0];

    const newMessage = await Message.create([
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
    ]);

    const updatedConversation = await Conversation.findOneAndUpdate(
      { _id: conversation._id, "participants.participantId": senderId },
      {
        $set: {
          "participants.$.lastSeenTime": new Date(),
          lastMessageId: newMessage[0]._id, //newMessage is an array
        },
      },
      { new: true }
    );

    const message = new MessageDto(newMessage[0]);

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
    console.error(`Error sending message: ${err}`);
    throw new InternalServerError("Error sending message");
  } finally {
    if (attachments) {
      deleteFiles(attachments.map((item) => item.path));
    }
  }
});

export const deleteMessagesByConversationId = asyncHandler(async (req, res) => {
  let { conversationId } = req.params;
  conversationId = new mongoose.Types.ObjectId(conversationId);

  const session = await mongoose.startSession();
  session.startTransaction({
    readConcern: { level: "snapshot" },
    writeConcern: { w: "majority" },
    maxCommitTimeMS: 3 * 60 * 100, // 3 mins
  });

  try {
    const attachments = await Message.aggregate(
      [
        {
          $match: { conversationId },
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

    const messageDeleteResult = await Message.deleteMany({
      conversationId,
    }).session(session);

    const conversation = await Conversation.findById(conversationId)
      .select({ _id: false, "participants.participantId": true })
      .session(session);

    const conversationDeleteResult = await Conversation.findByIdAndDelete(
      conversationId
    ).session(session);

    await session.commitTransaction();

    const participants = conversation?.participants;
    participants?.forEach((participant) => {
      req.app
        .get("io")
        .in(participant.participantId.toString())
        .emit(ChatEventEnum.MESSAGE_DELETE, conversationId.toString());
    });

    return res.status(200).json({ message: "Messages deleted" });
  } catch (err) {
    await session.abortTransaction();
    console.error(`Error deleting messages: ${err}`);
    throw new InternalServerError("Error deleting messages");
  } finally {
    session.endSession();
  }
});
