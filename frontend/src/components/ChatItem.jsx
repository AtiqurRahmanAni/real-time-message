import React from "react";
import { useAuthContext } from "../context/AuthContextProvider";

const ChatItem = ({
  message,
  onImageClick,
  isLastMessage = false,
  lastSeenTimeOfReceiver = null,
}) => {
  const { user } = useAuthContext();

  // determine seen status of this message by other user
  const isSeen = () => {
    const createdAt = new Date(message.createdAt);
    const lastSeenOfReceiver = new Date(lastSeenTimeOfReceiver);

    return createdAt <= lastSeenOfReceiver;
  };

  return (
    <li
      data-id={message._id}
      key={message._id}
      className={`flex ${
        message.senderId === user._id ? "justify-end text-end" : "justify-start"
      }`}
    >
      <div className="max-w-full xl:max-w-[60%] cursor-pointer">
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
        {/* if the message sender is me, then show "seen" if it is seen by the receiver */}
        {lastSeenTimeOfReceiver &&
          message.senderId === user._id &&
          isSeen() &&
          isLastMessage && <div className="text-xs">Seen</div>}
      </div>
    </li>
  );
};

export default ChatItem;
