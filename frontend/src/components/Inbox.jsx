import conversationStore from "../stores/conversationStore";
import { useAuthContext } from "../context/AuthContextProvider.jsx";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import axiosInstance from "../utils/axiosInstance.js";
import TextInput from "./TextInput.jsx";
import React, { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import SpinnerBlock from "../assets/Spinner.jsx";
import ImagePreviewModal from "./ImagePreviewDialog.jsx";
import ChatItem from "./ChatItem.jsx";
import useFetchData from "../hooks/useFetchData.js";
import { useInView } from "react-intersection-observer";

const Inbox = () => {
  const selectedConversation = conversationStore(
    (state) => state.selectedConversation
  );
  const { logoutActions } = useAuthContext();
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const selectedImageUrl = useRef(null);
  const { ref, inView } = useInView();
  const isInitialLoad = useRef(true);

  const {
    data: messageResponse,
    fetchNextPage,
    isFetchingNextPage,
    isMessageLoading,
  } = useInfiniteQuery({
    queryKey: ["getMessages", selectedConversation?.conversation?._id],
    queryFn: ({ pageParam }) =>
      axiosInstance.get(
        `conversation/${selectedConversation?.conversation?._id}/messages?pageNo=${pageParam}&pageSize=20`
      ),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage?.data.nextPage;
    },
    enabled: !!selectedConversation?.conversation,
  });

  const messages = messageResponse
    ? messageResponse.pages.flatMap((d) => d.data.messages)
    : [];

  const { data: lastSeenTime } = useFetchData(
    ["lastSeenTime", selectedConversation._id],
    `conversation/${selectedConversation?.conversation?._id}/user/${selectedConversation._id}/last-seen`,
    {
      enabled: !!(messages.length > 0 && selectedConversation?.conversation),
    }
  );

  const messageSendMutation = useMutation({
    mutationFn: (formData) =>
      axiosInstance.post("/conversation/message", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }),
    onError: (error) => {
      toast.error(
        error.response ? error.response.data.message : "Something went wrong"
      );
      if (error?.response.status === 401) {
        logoutActions();
      }
    },
  });

  useEffect(() => {
    if (isInitialLoad.current && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({
        behavior: "auto",
      });
      isInitialLoad.current = false;
    }
  }, [messages]);

  useEffect(() => {
    if (inView) {
      if (
        inView &&
        selectedConversation?.conversation &&
        !isFetchingNextPage &&
        !isInitialLoad.current
      ) {
        fetchNextPage();
      }
    }
  }, [fetchNextPage, inView]);

  const onImageClick = (imageUrl) => {
    selectedImageUrl.current = imageUrl;
    setIsOpen(true);
  };

  const sendMessage = useCallback((formData) => {
    messageSendMutation.mutate(formData);
  }, []);

  return (
    <>
      <div className="relative flex-1 max-w-[calc(100vw-25rem)] min-h-[calc(100dvh-4.45rem)] ml-4">
        {isMessageLoading ? (
          <div className="h-full flex justify-center items-center">
            <SpinnerBlock />
          </div>
        ) : (
          <ul className="flex flex-col-reverse gap-y-2 mt-4 h-[calc(100dvh-10rem)] overflow-y-scroll pb-2 px-10 scrollbar-custom">
            <div ref={messagesEndRef} />
            {messages?.map((message, idx) => (
              <ChatItem
                key={message._id}
                message={message}
                onImageClick={onImageClick}
                lastSeenTimeOfReceiver={lastSeenTime?.data?.lastSeenTime}
                isLastMessage={idx === 0}
              />
            ))}
            <div ref={ref} className="opacity-0">
              .
            </div>
          </ul>
        )}

        <div className="absolute bottom-0 w-full">
          <TextInput
            disabled={messageSendMutation.isPending || isMessageLoading}
            onSendButtonClick={sendMessage}
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

export default React.memo(Inbox);
