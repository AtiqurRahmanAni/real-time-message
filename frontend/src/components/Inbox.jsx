import MessageSendButton from "./MessageSendButton";
import conversationStore from "../stores/conversationStore";
import useFetchData from "../hooks/useFetchData.js";
import { useAuthContext } from "../context/AuthContextProvider.jsx";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../utils/axiosInstance.js";
import { useState } from "react";

const Inbox = () => {
  const selectedConversation = conversationStore(
    (state) => state.selectedConversation
  );
  const { user } = useAuthContext();
  const [messageContent, setMessageContent] = useState("");
  const queryClient = useQueryClient();

  const {
    isLoading,
    error,
    data: messages,
  } = useFetchData(
    ["getMessages", selectedConversation?.conversation?._id],
    `conversation/${selectedConversation?.conversation?._id}/messages`,
    { enabled: !!selectedConversation?.conversation?._id }
  );

  const mutation = useMutation({
    mutationFn: (content) =>
      axiosInstance.post("/conversation/message", {
        sender: user.username,
        receiver: selectedConversation?.username,
        content: content,
      }),
    onSuccess: (data) => {
      setMessageContent("");
      queryClient.setQueriesData(
        ["getMessages", selectedConversation?.conversation?._id],
        (oldData) => {
          if (!oldData) return;
          return {
            ...oldData,
            oldData: [...oldData.messages, data.data],
          };
        }
      );
    },
  });

  const handleSendMessage = () => {
    mutation.mutate(messageContent);
  };

  return (
    <div className="relative flex-1 h-full min-h-[calc(100dvh-4.45rem)] ml-4">
      <ul className="space-y-1 mt-4">
        {messages?.data.map((message) => (
          <li
            key={message._id}
            className={`flex ${
              message.sender === user.username ? "justify-end" : "justify-start"
            }`}
          >
            <p className="bg-blue-500 rounded-lg px-2 py-1 text-white">
              {message.content}
            </p>
          </li>
        ))}
      </ul>
      <div className="absolute bottom-0 w-full">
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
              onClick={handleSendMessage || mutation.isPending}
              disabled={messageContent.trim() === ""}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inbox;
