import { useState, useEffect, useRef, useCallback } from "react";
import MessageSendButton from "./MessageSendButton";
import socketStore from "../stores/socketStore";
import { ChatEventEnum } from "../constants/index.js";
import conversationStore from "../stores/conversationStore.js";
import { useAuthContext } from "../context/AuthContextProvider.jsx";
import AttachmentButton from "./AttachmentButton.jsx";
import { handleDrop, handlePaste, onAttachmentSelect } from "../utils/index.js";
import PreviewAttachments from "./PreviewAttachments.jsx";

const TextInput = ({ onSendButtonClick, disabled = false }) => {
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const [messageContent, setMessageContent] = useState("");
  const { user } = useAuthContext();
  const socket = socketStore((state) => state.socket);
  const selectedConversation = conversationStore(
    (state) => state.selectedConversation
  );
  const selectedConversationRef = useRef(selectedConversation);
  const attachmentInputRef = useRef(null);
  const [attachments, setAttachments] = useState([]);
  const isTyping = useRef(false);

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

    if (!isTyping.current && socket) {
      socket.emit(ChatEventEnum.TYPING_EVENT, {
        targetUserId: selectedConversation._id,
        typingUserId: user._id,
      });
      isTyping.current = true;
    }
  };

  const handleOnBlur = () => {
    isTyping.current = false;
    socket.emit(ChatEventEnum.STOP_TYPING_EVENT, {
      targetUserId: selectedConversation._id,
      typingUserId: user._id,
    });
  };

  const handleAttachmentChange = (e) => {
    const files = onAttachmentSelect(e);
    if (files) {
      setAttachments(files);
    }
  };

  const onPaste = (e) => {
    const files = handlePaste(e);
    if (files) {
      setAttachments(files);
    }
  };

  const onDrop = (e) => {
    const files = handleDrop(e);
    if (files) {
      setAttachments(files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const onRemoveAttachment = useCallback((removeIdx) => {
    setAttachments((prev) => prev.filter((_, idx) => idx !== removeIdx));
  }, []);

  const handleSendButtonClick = () => {
    const formData = new FormData();
    formData.set("senderId", user._id);
    formData.set("receiverId", selectedConversation._id);
    formData.set("content", messageContent);

    for (let i = 0; i < attachments.length; i++) {
      formData.append("attachments", attachments[i]);
    }

    onSendButtonClick(formData);
    setAttachments([]);
    setMessageContent("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey && messageContent.trim() !== "") {
      e.preventDefault();
      handleSendButtonClick();
      handleOnBlur();
    }
  };

  return (
    <div className="relative">
      {isOtherUserTyping && (
        <div className="absolute -top-4 right-3 text-right text-sm text-gray-300">
          <span>{selectedConversation.displayName} is typing...</span>
        </div>
      )}
      <div className="bg-gray-600 rounded-xl p-2">
        {attachments.length > 0 && (
          <PreviewAttachments
            attachments={attachments}
            onRemoveAttachment={onRemoveAttachment}
          />
        )}
        <div
          className="relative"
          onPaste={onPaste}
          onDragOver={handleDragOver}
          onDrop={onDrop}
        >
          <div className="absolute top-1/2 -translate-y-1/2">
            <AttachmentButton
              onClick={() => attachmentInputRef?.current.click()}
            />
            <input
              ref={attachmentInputRef}
              hidden={true}
              type="file"
              multiple={true}
              accept="image/jpeg,image/png,image/jpg"
              onChange={handleAttachmentChange}
            />
          </div>

          <textarea
            onChange={handleTextInputChange}
            onBlur={handleOnBlur}
            className="bg-transparent pl-12 pr-14 w-full text-gray-200 focus:outline-none"
            value={messageContent}
            rows={2}
            maxLength={400}
            onKeyDown={handleKeyDown}
          />
          <div className="absolute bottom-1/2 translate-y-1/2 right-0">
            <MessageSendButton
              onClick={handleSendButtonClick}
              disabled={messageContent.trim() === "" || disabled}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextInput;
