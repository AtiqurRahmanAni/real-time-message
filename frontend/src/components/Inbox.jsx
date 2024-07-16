import conversationStore from "../stores/conversationStore";
import useFetchData from "../hooks/useFetchData.js";
import { useAuthContext } from "../context/AuthContextProvider.jsx";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../utils/axiosInstance.js";
import TextInput from "./TextInput.jsx";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import SpinnerBlock from "../assets/Spinner.jsx";
import ImagePreviewModal from "./ImagePreviewDialog.jsx";

let selectedImageUrl = null;
const Inbox = () => {
  const selectedConversation = conversationStore(
    (state) => state.selectedConversation
  );
  const { logoutActions } = useAuthContext();
  const messagesEndRef = useRef();
  const { user } = useAuthContext();
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const cachedMessages = queryClient.getQueryData([
    "getMessages",
    selectedConversation._id,
  ])?.data;

  const {
    isLoading,
    error,
    data: messages,
  } = useFetchData(
    ["getMessages", selectedConversation._id], // queryKey for messages where _id is the user id
    `conversation/${selectedConversation?.conversation?._id}/messages`,
    { enabled: !!selectedConversation?.conversation } // if conversation exists between two users, then fetch data
  );

  const messageSendMutation = useMutation({
    mutationFn: (formData) =>
      axiosInstance.post("/conversation/message", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }),
    // onSuccess: (data) => {
    //   console.log(data);
    // },
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

  const onImageClick = (imageUrl) => {
    selectedImageUrl = imageUrl;
    setIsOpen(true);
  };

  return (
    <>
      <div className="relative flex-1 min-h-[calc(100dvh-4.45rem)] ml-4">
        {isLoading ? (
          <div className="h-full flex justify-center items-center">
            <SpinnerBlock />
          </div>
        ) : (
          <ul className="space-y-2 mt-4 h-[calc(100dvh-10rem)] overflow-y-scroll pb-2 px-10 scrollbar-custom">
            {messages?.data?.map((message) => (
              <li
                key={message._id}
                className={`flex ${
                  message.senderId === user._id
                    ? "justify-end text-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`rounded-lg lg:max-w-[50%] ${
                    message.senderId === user._id
                      ? "bg-blue-500"
                      : "bg-gray-400"
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
                  <p className={`px-2 py-1 text-white`}>{message.content}</p>
                </div>
              </li>
            ))}
            <div ref={messagesEndRef} />
          </ul>
        )}
        <div className="absolute bottom-0 w-full">
          <TextInput
            disabled={messageSendMutation.isPending || isLoading}
            onSendButtonClick={(formData) =>
              messageSendMutation.mutate(formData)
            }
          />
        </div>
      </div>
      <ImagePreviewModal
        imageUrl={selectedImageUrl}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />
    </>
  );
};

export default Inbox;
