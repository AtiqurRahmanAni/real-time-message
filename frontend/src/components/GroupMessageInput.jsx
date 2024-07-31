import React, { useState, useRef, useCallback } from "react";
import MessageSendButton from "./MessageSendButton";
import { useAuthContext } from "../context/AuthContextProvider.jsx";
import AttachmentButton from "./AttachmentButton.jsx";
import toast from "react-hot-toast";
import PreviewAttachments from "./PreviewAttachments.jsx";
import { handleDrop, handlePaste } from "../utils/index.js";

const GroupMessageInput = ({ onSendButtonClick, disabled = false }) => {
  const [messageContent, setMessageContent] = useState("");
  const { user } = useAuthContext();
  // const socket = socketStore((state) => state.socket);
  // const selectedGroup = groupStore((state) => state.selectedGroup);
  const attachmentInputRef = useRef(null);
  const [attachments, setAttachments] = useState([]);
  const isTyping = useRef(false);

  // useEffect(() => {
  //   if (!socket) return;

  //   socket.on(GroupChatEventEnum.GROUP_TYPING_EVENT, onTyping);
  //   socket.on(GroupChatEventEnum.STOP_GROUP_TYPING_EVENT, onStopTyping);

  //   return () => {
  //     socket.off(GroupChatEventEnum.GROUP_TYPING_EVENT, onTyping);
  //     socket.off(GroupChatEventEnum.STOP_GROUP_TYPING_EVENT, onStopTyping);
  //   };
  // }, [socket]);

  //   useEffect(() => {
  //     selectedConversationRef.current = selectedConversation;
  //   }, [selectedConversation]);

  // const onTyping = (typingUserId) => {
  //   console.log(`${typingUserId} is typing`);
  //   // if (selectedConversationRef.current._id === typingUserId) {
  //   //   setIsOtherUserTyping(true);
  //   // } else {
  //   //   setIsOtherUserTyping(false);
  //   // }
  // };

  // const onStopTyping = (typingUserId) => {
  //   console.log(`${typingUserId} has stopped typing`);
  //   // if (selectedConversationRef.current._id === typingUserId) {
  //   //   setIsOtherUserTyping(false);
  //   // }
  // };

  const handleTextInputChange = (e) => {
    setMessageContent(e.target.value);

    // if (!isTyping.current && socket) {
    //   socket.emit(GroupChatEventEnum.GROUP_TYPING_EVENT, {
    //     targetGroupId: selectedGroup._id,
    //     typingUserId: user._id,
    //   });
    //   isTyping.current = true;
    // }
  };

  const handleOnBlur = () => {
    isTyping.current = false;
    // socket.emit(GroupChatEventEnum.STOP_GROUP_TYPING_EVENT, {
    //   targetGroupId: selectedGroup._id,
    //   typingUserId: user._id,
    // });
  };

  const onAttachmentSelect = (e) => {
    const attachments = e.target.files;

    if (attachments.length > 6) {
      toast.error("You can not add more than 6 attachments");
      return;
    }
    if (attachments.length > 0) {
      let temp = [];
      for (let i = 0; i < attachments.length; i++) {
        temp.push(attachments[i]);
      }
      setAttachments(temp);
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
    formData.set("content", messageContent.trim());

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
      {/* {isOtherUserTyping && (
        <div className="absolute -top-4 right-3 text-right text-sm text-gray-500">
          <span>{selectedConversation.displayName} is typing...</span>
        </div>
      )} */}
      <div className="bg-gray-600 rounded-xl p-2">
        {attachments.length > 0 && (
          <div className="flex gap-2.5 flex-wrap mb-2">
            <PreviewAttachments
              attachments={attachments}
              onRemoveAttachment={onRemoveAttachment}
            />
          </div>
        )}
        <div
          className="relative"
          onPaste={onPaste}
          onDrop={onDrop}
          onDragOver={handleDragOver}
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
              onChange={onAttachmentSelect}
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

export default React.memo(GroupMessageInput);
