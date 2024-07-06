import conversationStore from "../stores/conversationStore";
import useFetchData from "../hooks/useFetchData.js";
import { useAuthContext } from "../context/AuthContextProvider.jsx";
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "../utils/axiosInstance.js";
import socketStore from "../stores/socketStore.js";
import TextInput from "./TextInput.jsx";

const Inbox = () => {
  const selectedConversation = conversationStore(
    (state) => state.selectedConversation
  );
  const socket = socketStore((state) => state.socket);
  const { user } = useAuthContext();

  const {
    isLoading,
    error,
    data: messages,
  } = useFetchData(
    ["getMessages", selectedConversation._id], // queryKey for messages where _id is the user id
    `conversation/${selectedConversation?.conversation?._id}/messages`,
    { enabled: !!selectedConversation?.conversation?._id } // if conversation exists between two users, then fetch data
  );

  const mutation = useMutation({
    mutationFn: (content) =>
      axiosInstance.post("/conversation/message", {
        sender: user.username,
        receiver: selectedConversation.username,
        senderId: user._id,
        receiverId: selectedConversation._id,
        content: content,
      }),
    onSuccess: (data) => {
      console.log("Message sent.");
    },
  });

  const handleSendMessage = (messageContent) => {
    mutation.mutate(messageContent);
  };

  return (
    <div className="relative flex-1 h-full min-h-[calc(100dvh-4.45rem)] ml-4">
      <ul className="space-y-1 mt-4 h-[calc(100dvh-9rem)] overflow-y-scroll pb-2 px-10">
        {messages?.data.map((message) => (
          <li
            key={message._id}
            className={`flex ${
              message.sender === user.username ? "justify-end" : "justify-start"
            }`}
          >
            <p
              className={`${
                message.sender === user.username ? "bg-blue-500" : "bg-gray-400"
              } rounded-lg px-2 py-1 text-white`}
            >
              {message.content}
            </p>
          </li>
        ))}
      </ul>
      <div className="absolute bottom-0 w-full">
        <TextInput disabled={mutation.isPending} onClick={handleSendMessage} />
      </div>
    </div>
  );
};

export default Inbox;
