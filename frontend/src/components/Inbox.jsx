import conversationStore from "../stores/conversationStore";
import { useAuthContext } from "../context/AuthContextProvider.jsx";
import {
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import axiosInstance from "../utils/axiosInstance.js";
import TextInput from "./TextInput.jsx";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import SpinnerBlock from "../assets/Spinner.jsx";
import ImagePreviewModal from "./ImagePreviewDialog.jsx";
import ChatItem from "./ChatItem.jsx";
import { useInView } from "react-intersection-observer";

let selectedImageUrl = null;
const Inbox = () => {
  const selectedConversation = conversationStore(
    (state) => state.selectedConversation
  );
  const { logoutActions } = useAuthContext();
  const messagesEndRef = useRef();
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const { ref, inView } = useInView();

  const cachedMessages = queryClient.getQueryData([
    "getMessages",
    selectedConversation._id,
  ])?.pages[0]?.data?.messages;

  const { data, fetchNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["getMessages", selectedConversation._id],
      queryFn: ({ pageParam }) =>
        axiosInstance.get(
          `conversation/${selectedConversation?.conversation?._id}/messages?pageNo=${pageParam}&pageSize=5`
        ),
      select: (data) => ({
        pages: [...data.pages].reverse(),
        pageParams: [...data.pageParams].reverse(),
      }),
      initialPageParam: 1,
      getNextPageParam: (lastPage) => {
        return lastPage?.data.nextPage;
      },
      enabled: !!selectedConversation?.conversation,
    });

  // console.log(data);

  // if (data) {
  //   console.log(
  //     data?.pages.map((page) =>
  //       page.data.messages.map((message) => message._id)
  //     )
  //   );
  // }
  // console.log(data?.pages.flatMap((data) => data.messages));

  // const messages = null;
  // const isLoading = true;

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
  }, [data, cachedMessages]);

  useEffect(() => {
    if (inView) {
      fetchNextPage();
    }
  }, [fetchNextPage, inView]);

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
            <div ref={ref} />
            {data?.pages.map((page) =>
              page.data.messages.map((message) => (
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
        imageUrl={selectedImageUrl}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />
    </>
  );
};

export default Inbox;
