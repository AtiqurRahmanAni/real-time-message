import React, { useState } from "react";
import { useAuthContext } from "../context/AuthContextProvider";
import { useQueryClient } from "@tanstack/react-query";

const GroupChatItem = ({
  message,
  onImageClick,
  senderUsername = null,
  isLastMessage = false,
  lastSeenTimeOfParticipants = null,
}) => {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const [showSeenBy, setShowSeenBy] = useState("hidden");

  const cachedUsers = queryClient.getQueryData(["getConversations"])?.data;
  let seenBy = "";
  if (lastSeenTimeOfParticipants && cachedUsers) {
    const createdAt = new Date(message.createdAt);
    lastSeenTimeOfParticipants.forEach((entry) => {
      const lastSeenTime = new Date(entry.lastSeenTime);

      if (createdAt <= lastSeenTime) {
        const username = cachedUsers.find(
          (cachedUser) => cachedUser._id === entry.participantId
        )?.username;

        if (username) {
          seenBy += username + ", ";
        }
      }
    });
    seenBy = seenBy.slice(0, seenBy.length - 2);
  }

  const toggleShowSeenBy = () => {
    setShowSeenBy((prev) => (prev === "hidden" ? "block" : "hidden"));
  };

  return (
    <li
      data-id={message._id}
      key={message._id}
      className={`flex ${
        message.senderId === user._id ? "justify-end text-end" : "justify-start"
      }`}
    >
      <div
        className="max-w-full xl:max-w-[60%] cursor-pointer"
        onClick={toggleShowSeenBy}
      >
        {senderUsername && <div className="text-xs">{senderUsername}</div>}
        <div
          className={`inline-block max-w-full rounded-lg ${
            message.senderId === user._id ? "bg-blue-500" : "bg-gray-400"
          }`}
        >
          {message.attachments.length > 0 && (
            <div className="flex rounded-lg overflow-hidden">
              {message.attachments.map((item, idx) => (
                <div
                  key={idx}
                  className="cursor-pointer max-w-[400px]"
                  onClick={() => onImageClick(item.url)}
                >
                  <img
                    className="w-full h-full"
                    src={item.url}
                    alt="attachment"
                  />
                </div>
              ))}
            </div>
          )}
          <div className={`px-2 py-1 text-white max-w-full`}>
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          </div>
        </div>
        {seenBy && message.senderId === user._id && (
          <div className={`text-xs ${isLastMessage ? "block" : showSeenBy}`}>
            {seenBy}
          </div>
        )}
      </div>
    </li>
  );
};

export default GroupChatItem;
