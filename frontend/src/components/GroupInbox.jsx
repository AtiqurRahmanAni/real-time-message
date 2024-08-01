import React, { useCallback, useEffect, useRef, useState } from "react";
import useFetchData from "../hooks/useFetchData";
import groupStore from "../stores/groupStore";
import SpinnerBlock from "../assets/Spinner";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useAuthContext } from "../context/AuthContextProvider";
import GroupMessageInput from "./GroupMessageInput";
import axiosInstance from "../utils/axiosInstance";
import GroupChatItem from "./GroupChatItem";
import toast from "react-hot-toast";
import ImagePreviewModal from "./ImagePreviewDialog";
import { useInView } from "react-intersection-observer";

const GroupInbox = () => {
  const selectedGroup = groupStore((state) => state.selectedGroup);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const { user, logoutActions } = useAuthContext();
  const selectedImageUrl = useRef(null);
  const queryClient = useQueryClient();
  const { ref, inView } = useInView();
  const isInitialLoad = useRef(true);

  const cachedUsers = queryClient.getQueryData(["getConversations"])?.data;

  const {
    data: messageResponse,
    fetchNextPage,
    isFetchingNextPage,
    isLoading: isGroupMessagesLoading,
    error,
  } = useInfiniteQuery({
    queryKey: ["getGroupMessages", selectedGroup?._id],
    queryFn: ({ pageParam }) =>
      axiosInstance.get(
        `group-conversation/group/${selectedGroup?._id}/message?pageNo=${pageParam}&pageSize=20`
      ),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage?.data.nextPage;
    },
    enabled: !!selectedGroup?._id,
  });

  useEffect(() => {
    if (error) {
      if (error.response) {
        toast.error(error.response.data.message);
        if (error.response.status === 401) {
          logoutActions();
        }
      } else {
        toast.error("Something went wrong");
      }
    }
  }, [logoutActions, error]);

  const groupMessages = messageResponse
    ? messageResponse.pages.flatMap((d) => d.data.messages)
    : [];

  const { data: lastSeenList, isLoading: isLastSeenListLoading } = useFetchData(
    ["lastSeenOfParticipants", selectedGroup?._id],
    `group-conversation/group/${selectedGroup._id}/participants-last-seen`,
    {
      enabled: !!(groupMessages.length > 0 && selectedGroup?._id && !error),
    }
  );

  const messageSendMutation = useMutation({
    mutationFn: (formData) =>
      axiosInstance.post(
        `group-conversation/group/${selectedGroup?._id}/message`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      ),
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
    if (isInitialLoad.current && groupMessages.length > 0) {
      messagesEndRef.current?.scrollIntoView({
        behavior: "auto",
      });
      isInitialLoad.current = false;
    }
  }, [groupMessages]);

  useEffect(() => {
    if (
      inView &&
      selectedGroup?._id &&
      !isFetchingNextPage &&
      !isInitialLoad.current
    ) {
      fetchNextPage();
    }
  }, [fetchNextPage, inView]);

  useEffect(() => {
    return () => {
      // keep only page 0
      queryClient.setQueryData(
        ["getGroupMessages", selectedGroup?._id],
        (oldData) => {
          if (!oldData) return;

          return {
            pages: oldData.pages.slice(0, 1),
            pageParams: oldData.pageParams.slice(0, 1),
          };
        }
      );
    };
  }, [selectedGroup?._id]);

  const onImageClick = (imageUrl) => {
    selectedImageUrl.current = imageUrl;
    setIsOpen(true);
  };

  const getSenderUsername = (senderId) => {
    return cachedUsers?.find((user) => user._id === senderId)?.username;
  };

  const sendMessage = useCallback((formData) => {
    messageSendMutation.mutate(formData);
  }, []);

  return (
    <>
      <div className="relative flex-1 max-w-[calc(100vw-25rem)] min-h-[calc(100dvh-4.45rem)] ml-4">
        {isGroupMessagesLoading ? (
          <div className="h-full flex justify-center items-center">
            <SpinnerBlock />
          </div>
        ) : (
          <ul className="flex flex-col-reverse gap-y-2 mt-4 h-[calc(100dvh-10rem)] overflow-y-scroll pb-2 px-10 scrollbar-custom">
            <div ref={messagesEndRef} />
            {groupMessages?.map((message, idx) => (
              <GroupChatItem
                key={message._id + idx}
                message={message}
                onImageClick={onImageClick}
                senderUsername={
                  message.senderId !== user._id
                    ? getSenderUsername(message.senderId)
                    : null
                }
                isLastMessage={idx === 0}
                lastSeenTimeOfParticipants={lastSeenList?.data}
              />
            ))}
            <div ref={ref} className="opacity-0">
              .
            </div>
          </ul>
        )}
        <div className="absolute bottom-0 w-full">
          <GroupMessageInput
            disabled={isGroupMessagesLoading || isLastSeenListLoading}
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

export default React.memo(GroupInbox);
