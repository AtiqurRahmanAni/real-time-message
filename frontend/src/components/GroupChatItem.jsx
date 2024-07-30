import React, { useState } from "react";
import { useAuthContext } from "../context/AuthContextProvider";
import { useQueryClient } from "@tanstack/react-query";
import RenderLink from "../components/RenderLink";
import Linkify from "linkify-react";

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
      className={`flex flex-col ${
        message.senderId === user._id ? "items-end" : "items-start"
      }`}
    >
      <div
        className="xl:max-w-[60%] cursor-pointer max-w-fit"
        onClick={toggleShowSeenBy}
      >
        {senderUsername && (
          <div className="text-xs text-gray-300">{senderUsername}</div>
        )}
        <div
          className={`inline-block rounded-lg ${
            message.senderId === user._id ? "bg-blue-500" : "bg-gray-600"
          }`}
        >
          {message.attachments.length > 0 && (
            <div className="flex rounded-lg overflow-hidden">
              {message.attachments.map((item, idx) => (
                <div
                  key={idx}
                  className="cursor-pointer max-w-[400px]"
                  onClick={(e) => {
                    e.stopPropagation();
                    onImageClick(item.url);
                  }}
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
          <div className={`px-2 py-1 text-gray-100 max-w-full`}>
            <Linkify
              as="p"
              options={{ render: RenderLink }}
              className="whitespace-pre-wrap break-words"
            >
              {message.content}
            </Linkify>
          </div>
        </div>
      </div>
      {seenBy && message.senderId === user._id && (
        <div
          className={`text-xs text-gray-300 ${
            isLastMessage ? "block" : showSeenBy
          }`}
        >
          {seenBy}
        </div>
      )}
    </li>
  );
};

export default GroupChatItem;
