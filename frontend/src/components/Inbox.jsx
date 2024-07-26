import conversationStore from "../stores/conversationStore";
import { useAuthContext } from "../context/AuthContextProvider.jsx";
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "../utils/axiosInstance.js";
import TextInput from "./TextInput.jsx";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import SpinnerBlock from "../assets/Spinner.jsx";
import ImagePreviewModal from "./ImagePreviewDialog.jsx";
import ChatItem from "./ChatItem.jsx";
import useFetchData from "../hooks/useFetchData.js";

const Inbox = () => {
  const selectedConversation = conversationStore(
    (state) => state.selectedConversation
  );
  const { logoutActions } = useAuthContext();
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const selectedImageUrl = useRef(null);

  // const { data, fetchNextPage, isFetchingNextPage, isLoading } =
  //   useInfiniteQuery({
  //     queryKey: ["getMessages", selectedConversation._id],
  //     queryFn: ({ pageParam }) =>
  //       axiosInstance.get(
  //         `conversation/${selectedConversation?.conversation?._id}/messages?pageNo=${pageParam}&pageSize=20`
  //       ),
  //     initialPageParam: 1,
  //     getNextPageParam: (lastPage) => {
  //       return lastPage?.data.nextPage;
  //     },
  //     enabled: !!selectedConversation?.conversation,
  //   });

  const {
    data: messages,
    isLoading,
    error,
  } = useFetchData(
    ["getMessages", selectedConversation._id],
    `conversation/${selectedConversation?.conversation?._id}/messages`,
    {
      enabled: !!selectedConversation?.conversation,
    }
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

  const { data: lastSeenMessage } = useFetchData(
    ["lastSeenMessage", selectedConversation._id],
    `conversation/${selectedConversation?.conversation?._id}/user/${selectedConversation._id}/lastmessage`,
    {
      enabled: !!(messages && selectedConversation?.conversation),
    }
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "auto",
      block: "end",
    });
  }, [messages]);

  const onImageClick = (imageUrl) => {
    selectedImageUrl.current = imageUrl;
    setIsOpen(true);
  };

  return (
    <>
      <div className="relative flex-1 max-w-[calc(100vw-25rem)] min-h-[calc(100dvh-4.45rem)] ml-4">
        {isLoading ? (
          <div className="h-full flex justify-center items-center">
            <SpinnerBlock />
          </div>
        ) : (
          <ul className="space-y-2 mt-4 h-[calc(100dvh-10rem)] overflow-y-scroll pb-2 px-10 scrollbar-custom">
            {messages?.data?.map((message) => (
              <ChatItem
                key={message._id}
                message={message}
                onImageClick={onImageClick}
                lastSeenMessageId={lastSeenMessage?.data?._id}
              />
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
        imageUrl={selectedImageUrl.current}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />
    </>
  );
};

export default Inbox;
