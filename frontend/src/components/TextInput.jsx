import React, { useState, useEffect, useRef } from "react";
import MessageSendButton from "./MessageSendButton";
import socketStore from "../stores/socketStore";
import { ChatEventEnum } from "../constants/index.js";
import conversationStore from "../stores/conversationStore.js";
import { useAuthContext } from "../context/AuthContextProvider.jsx";

let isTyping = false;
const TextInput = ({ onClick, disabled = false }) => {
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const [messageContent, setMessageContent] = useState("");
  const { user } = useAuthContext();
  const socket = socketStore((state) => state.socket);
  const selectedConversation = conversationStore(
    (state) => state.selectedConversation
  );
  const selectedConversationRef = useRef(selectedConversation);

  useEffect(() => {
    if (!socket) return;

    socket.on(ChatEventEnum.TYPING_EVENT, onTyping);
    socket.on(ChatEventEnum.STOP_TYPING_EVENT, onStopTyping);
    return () => {
      socket.off(ChatEventEnum.TYPING_EVENT, onTyping);
      socket.off(ChatEventEnum.STOP_TYPING_EVENT, onStopTyping);
    };
  }, [socket]);

  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
  }, [selectedConversation]);

  const onTyping = (typingUserId) => {
    if (selectedConversationRef.current._id === typingUserId) {
      setIsOtherUserTyping(true);
    } else {
      setIsOtherUserTyping(false);
    }
  };

  const onStopTyping = (typingUserId) => {
    if (selectedConversationRef.current._id === typingUserId) {
      setIsOtherUserTyping(false);
    }
  };

  const handleTextInputChange = (e) => {
    setMessageContent(e.target.value);

    if (!isTyping && socket) {
      socket.emit(ChatEventEnum.TYPING_EVENT, {
        targetUserId: selectedConversation._id,
        typingUserId: user._id,
      });
      isTyping = true;
    }
  };

  const handleOnBlur = () => {
    isTyping = false;
    socket.emit(ChatEventEnum.STOP_TYPING_EVENT, {
      targetUserId: selectedConversation._id,
      typingUserId: user._id,
    });
  };

  return (
    <div className="relative">
      {isOtherUserTyping && (
        <div className="absolute -top-4 right-3 text-right text-sm text-gray-500">
          <span>{selectedConversation.displayName} is typing...</span>
        </div>
      )}
      <div>
        <textarea
          onChange={handleTextInputChange}
          onBlur={handleOnBlur}
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
