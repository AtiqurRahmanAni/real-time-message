import React, { useState } from "react";
import MessageSendButton from "./MessageSendButton";

const TextInput = ({ onClick, disabled = false }) => {
  const [messageContent, setMessageContent] = useState("");
  return (
    <div className="relative">
      <div>
        <textarea
          onChange={(e) => setMessageContent(e.target.value)}
          className="pl-4 py-2 pr-14 w-full text-gray-500 bg-gray-200 rounded-md focus:outline-gray-300"
          value={messageContent}
          rows={2}
          maxLength={150}
        />
      </div>
      <div className="absolute bottom-1/2 translate-y-1/2 right-2">
        <MessageSendButton
          onClick={() => {
            onClick(messageContent);
            setMessageContent("");
          }}
          disabled={messageContent.trim() === "" || disabled}
        />
      </div>
    </div>
  );
};

export default TextInput;
