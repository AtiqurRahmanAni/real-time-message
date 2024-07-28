import React, { useEffect, useRef, useState } from "react";
import useFetchData from "../hooks/useFetchData";
import groupStore from "../stores/groupStore";
import SpinnerBlock from "../assets/Spinner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthContext } from "../context/AuthContextProvider";
import GroupMessageInput from "./GroupMessageInput";
import axiosInstance from "../utils/axiosInstance";
import GroupChatItem from "./GroupChatItem";
import toast from "react-hot-toast";
import ImagePreviewModal from "./ImagePreviewDialog";

const GroupInbox = () => {
  const selectedGroup = groupStore((state) => state.selectedGroup);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const { user } = useAuthContext();
  const selectedImageUrl = useRef(null);

  const queryClient = useQueryClient();

  const cachedUsers = queryClient.getQueryData(["getConversations"])?.data;

  const {
    data: groupMessages,
    isLoading: isGroupMessagesLoading,
    error: groupMessagesError,
  } = useFetchData(
    ["getGroupMessages", selectedGroup?._id],
    `group-conversation/group/${selectedGroup?._id}/message`,
    {
      enabled: !!selectedGroup?._id,
    }
  );

  const {
    data: lastSeenList,
    isLoading: isLastSeenListLoading,
    error: lastSeenListError,
  } = useFetchData(
    ["lastSeenOfParticipants", selectedGroup?._id],
    `group-conversation/group/${selectedGroup._id}/participants-last-seen`,
    {
      enabled: !!(groupMessages?.data?.length > 0 && selectedGroup?._id),
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
    messagesEndRef.current?.scrollIntoView({
      behavior: "auto",
      block: "end",
    });
  }, [groupMessages, lastSeenList]);

  const onImageClick = (imageUrl) => {
    selectedImageUrl.current = imageUrl;
    setIsOpen(true);
  };

  const getSenderUsername = (senderId) => {
    return cachedUsers?.find((user) => user._id === senderId)?.username;
  };

  return (
    <>
      <div className="relative flex-1 max-w-[calc(100vw-25rem)] min-h-[calc(100dvh-4.45rem)] ml-4">
        {isGroupMessagesLoading ? (
          <div className="h-full flex justify-center items-center">
            <SpinnerBlock />
          </div>
        ) : (
          <ul className="space-y-2 mt-4 h-[calc(100dvh-10rem)] overflow-y-scroll pb-2 px-10 scrollbar-custom">
            {groupMessages?.data?.map((message, idx) => (
              <GroupChatItem
                key={message._id}
                message={message}
                onImageClick={onImageClick}
                senderUsername={
                  message.senderId !== user._id
                    ? getSenderUsername(message.senderId)
                    : null
                }
                isLastMessage={idx === groupMessages.data.length - 1}
                lastSeenTimeOfParticipants={lastSeenList?.data}
              />
            ))}
            <div ref={messagesEndRef} />
          </ul>
        )}
        <div className="absolute bottom-0 w-full">
          <GroupMessageInput
            disabled={isGroupMessagesLoading || isLastSeenListLoading}
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

export default GroupInbox;
