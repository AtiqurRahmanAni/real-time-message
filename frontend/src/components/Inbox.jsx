import conversationStore from "../stores/conversationStore";
import { useAuthContext } from "../context/AuthContextProvider.jsx";
import { useMutation, useInfiniteQuery } from "@tanstack/react-query";
import axiosInstance from "../utils/axiosInstance.js";
import TextInput from "./TextInput.jsx";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import SpinnerBlock from "../assets/Spinner.jsx";
import ImagePreviewModal from "./ImagePreviewDialog.jsx";
import ChatItem from "./ChatItem.jsx";
import { useInView } from "react-intersection-observer";

const Inbox = () => {
  const selectedConversation = conversationStore(
    (state) => state.selectedConversation
  );
  const { logoutActions } = useAuthContext();
  const [isOpen, setIsOpen] = useState(false);
  const { ref, inView } = useInView();
  const messagesEndRef = useRef(null);
  const isInitialLoad = useRef(true);
  const selectedImageUrl = useRef(null);
  const prevScrollHeight = useRef(0);
  const prevScrollTop = useRef(0);
  const scrollContainerRef = useRef(null);

  const { data, fetchNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["getMessages", selectedConversation._id],
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
    if (isInitialLoad.current && data) {
      messagesEndRef.current?.scrollIntoView({
        behavior: "auto",
        block: "end",
      });
      isInitialLoad.current = false;
    } else if (data && !inView) {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [data, inView]);

  useEffect(() => {
    if (inView && selectedConversation?.conversation && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, inView]);

  // useEffect(() => {
  //   if (inView && selectedConversation?.conversation && !isFetchingNextPage) {
  //     if (scrollContainerRef.current) {
  //       prevScrollHeight.current = scrollContainerRef.current.scrollHeight;
  //       prevScrollTop.current = scrollContainerRef.current.scrollTop;
  //     }
  //     fetchNextPage();
  //   }
  // }, [fetchNextPage, inView]);

  // useEffect(() => {
  //   if (
  //     !isFetchingNextPage &&
  //     scrollContainerRef.current &&
  //     !isInitialLoad.current
  //   ) {
  //     const newScrollHeight = scrollContainerRef.current.scrollHeight;
  //     const heightDifference = newScrollHeight - prevScrollHeight.current;
  //     scrollContainerRef.current.scrollTop =
  //       prevScrollTop.current + heightDifference;
  //   } else if (isInitialLoad.current) {
  //     isInitialLoad.current = false;
  //     messagesEndRef.current?.scrollIntoView({
  //       behavior: "auto",
  //       block: "end",
  //     });
  //   }
  // }, [data, isFetchingNextPage]);

  const onImageClick = (imageUrl) => {
    selectedImageUrl.current = imageUrl;
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
          <ul
            ref={scrollContainerRef}
            className="space-y-2 mt-4 h-[calc(100dvh-10rem)] overflow-y-scroll pb-2 px-10 scrollbar-custom"
          >
            <div ref={ref} />
            {data?.pages
              .toReversed()
              .map((page) =>
                page.data.messages
                  .toReversed()
                  .map((message) => (
                    <ChatItem
                      key={message._id}
                      message={message}
                      onImageClick={onImageClick}
                    />
                  ))
              )}
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
