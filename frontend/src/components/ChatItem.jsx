import React from "react";
import { useAuthContext } from "../context/AuthContextProvider";
import Linkify from "linkify-react";
import RenderLink from "./RenderLink";

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
      className={`flex flex-col ${
        message.senderId === user._id ? "items-end" : "items-start"
      }`}
    >
      <div className="max-w-fit xl:max-w-[60%] cursor-pointer">
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
      {/* if the message sender is me, then show "seen" if it is seen by the receiver */}
      {lastSeenTimeOfReceiver &&
        message.senderId === user._id &&
        isSeen() &&
        isLastMessage && <div className="text-xs text-gray-300">Seen</div>}
    </li>
  );
};

export default ChatItem;
