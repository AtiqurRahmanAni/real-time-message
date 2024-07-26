import React, { useEffect, useRef } from "react";
import useFetchData from "../hooks/useFetchData";
import groupStore from "../stores/groupStore";
import ChatItem from "./ChatItem";
import SpinnerBlock from "../assets/Spinner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthContext } from "../context/AuthContextProvider";
import GroupMessageInput from "./GroupMessageInput";
import axiosInstance from "../utils/axiosInstance";

const GroupInbox = () => {
  const selectedGroup = groupStore((state) => state.selectedGroup);
  const messagesEndRef = useRef(null);
  const { user } = useAuthContext();

  const queryClient = useQueryClient();

  const cachedUsers = queryClient.getQueryData(["getConversations"])?.data;

  const {
    data: groupMessages,
    isLoading,
    error,
  } = useFetchData(
    ["getGroupMessages", selectedGroup?._id],
    `group-conversation/group/${selectedGroup?._id}/message`,
    {
      enabled: !!selectedGroup?._id,
    }
  );

  const {
    data: messageViewers,
    isLoading: isMessageViewersLoading,
    error: messageViewersError,
  } = useFetchData(
    ["lastSeenGroupMessages", selectedGroup?._id],
    `group-conversation/group/${selectedGroup._id}/last-seen-message-by/${user._id}`,
    {
      enabled: !!(groupMessages && selectedGroup?._id),
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
  }, [groupMessages]);

  const onImageClick = (imageUrl) => {
    console.log(imageUrl);
    // selectedImageUrl.current = imageUrl;
    // setIsOpen(true);
  };

  const getSenderName = (senderId) => {
    return cachedUsers?.find((user) => user._id === senderId)?.displayName;
  };

  return (
    <div className="relative flex-1 max-w-[calc(100vw-25rem)] min-h-[calc(100dvh-4.45rem)] ml-4">
      {isLoading ? (
        <div className="h-full flex justify-center items-center">
          <SpinnerBlock />
        </div>
      ) : (
        <ul className="space-y-2 mt-4 h-[calc(100dvh-10rem)] overflow-y-scroll pb-2 px-10 scrollbar-custom">
          {groupMessages?.data?.map((message) => (
            <ChatItem
              key={message._id}
              message={message}
              onImageClick={onImageClick}
              senderName={
                message.senderId !== user._id
                  ? getSenderName(message.senderId)
                  : null
              }
              lastMessageViewersIds={
                messageViewers?.data?.find(
                  (entry) => entry.lastMessageId === message._id
                )?.viewerIds
              }
            />
          ))}
          <div ref={messagesEndRef} />
        </ul>
      )}
      <div className="absolute bottom-0 w-full">
        <GroupMessageInput
          disabled={isLoading}
          onSendButtonClick={(formData) => messageSendMutation.mutate(formData)}
        />
      </div>
    </div>
  );
};

export default GroupInbox;
