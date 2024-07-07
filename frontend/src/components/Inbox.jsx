import conversationStore from "../stores/conversationStore";
import useFetchData from "../hooks/useFetchData.js";
import { useAuthContext } from "../context/AuthContextProvider.jsx";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../utils/axiosInstance.js";
import TextInput from "./TextInput.jsx";
import { useEffect, useRef } from "react";
import ChatItem from "./ChatItem.jsx";
import toast from "react-hot-toast";

const Inbox = () => {
  const selectedConversation = conversationStore(
    (state) => state.selectedConversation
  );
  const { user, logoutActions } = useAuthContext();
  const messagesEndRef = useRef();

  const queryClient = useQueryClient();

  const cachedMessages = queryClient.getQueryData([
    "getMessages",
    selectedConversation.username,
  ])?.data;

  const {
    isLoading,
    error,
    data: messages,
  } = useFetchData(
    ["getMessages", selectedConversation.username], // queryKey for messages where _id is the user id
    `conversation/${selectedConversation?.conversation?._id}/messages`,
    { enabled: !!selectedConversation?.conversation?._id } // if conversation exists between two users, then fetch data
  );

  const mutation = useMutation({
    mutationFn: (content) =>
      axiosInstance.post("/conversation/message", {
        sender: user.username,
        receiver: selectedConversation.username,
        content: content,
      }),
    onSuccess: (data) => {
      console.log(data);
    },
    onError: (error) => {
      toast.error(
        error.response ? error.response.data.message : "Something went wrong"
      );
      if (error?.response?.status === 401) {
        logoutActions();
      }
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "auto",
      block: "end",
    });
  }, [messages, cachedMessages]);

  const handleSendMessage = (messageContent) => {
    mutation.mutate(messageContent);
  };

  return (
    <div className="relative flex-1 min-h-[calc(100dvh-4.45rem)] ml-4">
      <ul className="space-y-1 mt-4 h-[calc(100dvh-10rem)] overflow-y-scroll pb-2 px-10 scrollbar-custom">
        {messages?.data?.map((message) => (
          <ChatItem key={message._id} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </ul>
      <div className="absolute bottom-0 w-full">
        <TextInput disabled={mutation.isPending} onClick={handleSendMessage} />
      </div>
    </div>
  );
};

export default Inbox;
