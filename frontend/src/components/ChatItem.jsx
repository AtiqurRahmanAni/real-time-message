import React from "react";
import { useAuthContext } from "../context/AuthContextProvider";
import { useQueryClient } from "@tanstack/react-query";

const ChatItem = ({
  message,
  onImageClick,
  senderUsername = null,
  lastMessageViewersIds = null,
}) => {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();

  let seenBy = "";
  if (lastMessageViewersIds) {
    const cachedUsers = queryClient.getQueryData(["getConversations"])?.data;
    lastMessageViewersIds.forEach((id, idx) => {
      const username = cachedUsers.find(
        (cachedUser) => cachedUser._id === id
      ).username;

      seenBy += username;
      if (idx < lastMessageViewersIds.length - 1) {
        seenBy += ", ";
      }
    });
  }

  return (
    <li
      data-id={message._id}
      key={message._id}
      className={`flex ${
        message.senderId === user._id ? "justify-end text-end" : "justify-start"
      }`}
    >
      <div className="max-w-full xl:max-w-[60%] ">
        {senderUsername && <div className="text-xs ml-1">{senderUsername}</div>}
        <div
          className={`rounded-lg ${
            message.senderId === user._id ? "bg-blue-500" : "bg-gray-400"
          }`}
        >
          {message.attachments.length > 0 && (
            <div className="flex rounded-lg overflow-hidden">
              {message.attachments.map((item, idx) => (
                <div
                  key={idx}
                  className="cursor-pointer"
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
        {lastMessageViewersIds && <div className="text-xs">{seenBy}</div>}
      </div>
    </li>
  );
};

export default ChatItem;
