import { useAuthContext } from "../context/AuthContextProvider";
import conversationStore from "../stores/conversationStore";
import { useEffect, useRef, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import toast from "react-hot-toast";
import { ChatEventEnum } from "../constants/index.js";
import socketStore from "../stores/socketStore.js";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useFetchData from "../hooks/useFetchData.js";
import SidebarItem from "./SidebarItem.jsx";

const Sidebar = () => {
  const queryClient = useQueryClient();

  const { user, logoutActions } = useAuthContext();
  const socket = socketStore((state) => state.socket);

  // for selecting a conversation in the sidebar
  const selectedConversation = conversationStore(
    (state) => state.selectedConversation
  );
  const setSelectedConversation = conversationStore(
    (state) => state.setSelectedConversation
  );
  const selectedConversationRef = useRef(selectedConversation);

  const setOnlineUsers = conversationStore((state) => state.setOnlineUsers);

  const {
    isLoading,
    error,
    data: conversations,
  } = useFetchData(["getConversations"], `/conversation/${user.username}`, {
    refetchInterval: 1000 * 60 * 1, // refetch sidebar data every 1 minute so that timestamp updates
  });

  // for updating the seen status of messages
  const messageSeenStatusTrueMutation = useMutation({
    mutationFn: (conversationId) => {
      return axiosInstance.patch(
        `conversation/${conversationId}/messages/seen`
      );
    },
    // onSuccess: (response) => {
    //   toast.success(response.data.message);
    // },
    onError: (error) => {
      toast.error(
        error.response ? error.response.data.message : "Something went wrong"
      );
    },
  });

  // for updating a message seen status by message id
  const messageSeenStatusByMessageIdMutation = useMutation({
    mutationFn: (messageId) => {
      return axiosInstance.patch(`/conversation/message/${messageId}/seen`, {
        seen: true,
      });
    },
    // onSuccess: (response) => {
    //   toast.success(response.data.message);
    // },
    onError: (error) => {
      toast.error(
        error.response ? error.response.data.message : "Something went wrong"
      );
    },
  });

  if (error) {
    toast.error(error?.data?.message);
  }

  useEffect(() => {
    if (!socket) return;

    socket.on(ChatEventEnum.NEW_USER_EVENT, onNewUser);
    socket.on(ChatEventEnum.CONNECTED_EVENT, onConnect);
    socket.on(ChatEventEnum.USER_ONLINE, handleUserOnline);
    socket.on(ChatEventEnum.USER_OFFLINE, handleUserOffline);
    socket.on(ChatEventEnum.MESSAGE_RECEIVED_EVENT, onMessageReceive);
    socket.on(ChatEventEnum.MESSAGE_SEEN_EVENT, onMessageSeen);

    return () => {
      socket.off(ChatEventEnum.NEW_USER_EVENT, onNewUser);
      socket.off(ChatEventEnum.CONNECTED_EVENT, onConnect);
      socket.off(ChatEventEnum.USER_ONLINE, handleUserOnline);
      socket.off(ChatEventEnum.USER_OFFLINE, handleUserOffline);
      socket.off(ChatEventEnum.MESSAGE_RECEIVED_EVENT, onMessageReceive);
      socket.off(ChatEventEnum.MESSAGE_SEEN_EVENT, onMessageSeen);
    };
  }, [socket]);

  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
  }, [selectedConversation]);

  const handleUserOnline = (onlineUsers) => {
    // onlineUsers is an array
    setOnlineUsers(onlineUsers);
  };

  const handleUserOffline = (onlineUsers) => {
    // onlineUsers is an array
    setOnlineUsers(onlineUsers);
  };

  const onNewUser = () => {
    // if a user sign in, refetch the sidebar data
    queryClient.invalidateQueries({ queryKey: ["getConversations"] });
  };

  const onConnect = () => {
    console.log("Connected");
  };

  const onMessageReceive = (data) => {
    const { conversation, message } = data;

    const currentSelectedConversation = selectedConversationRef.current;
    /* if there is a new conversation, update the selectedConversation, 
      because conversation is null if users do not exchange any messages */
    if (
      currentSelectedConversation &&
      !currentSelectedConversation.conversation &&
      (currentSelectedConversation.username === message.receiver ||
        currentSelectedConversation.username === message.sender)
    ) {
      setSelectedConversation({
        ...currentSelectedConversation,
        conversation: conversation,
      });
    }

    /* update the sidebar last message and last message timestamp when a new message is received
       increment the unseen count for the unselected conversations
    */
    queryClient.setQueryData(["getConversations"], (oldData) => {
      if (!oldData) return null;

      let items = [];
      let latestItem = null;

      for (let i = 0; i < oldData?.data?.length; i++) {
        let item = oldData?.data[i];
        if (
          item.username === message.receiver ||
          item.username === message.sender
        ) {
          latestItem = {
            ...item,
            /* if user is in other users' inbox, then increment the
              count of unseen messages except the selected conversation */
            unseenMessages:
              !currentSelectedConversation ||
              (currentSelectedConversation.username !== message.sender &&
                currentSelectedConversation.username !== message.receiver)
                ? item.unseenMessages + 1
                : item.unseenMessages,

            conversation: conversation
              ? {
                  _id: conversation._id,
                  lastMessage: conversation.lastMessage,
                  lastMessageTimestamp: conversation.lastMessageTimestamp,
                }
              : null,
          };
        } else {
          items.push(item);
        }
      }

      /* adding the latest one in front of the list so that
        it appears at the beginning of the sidebar
      */
      items.unshift(latestItem);

      return {
        ...oldData,
        data: items,
      };
    });

    /* if there is an inbox open, only then update the cache, 
      it will rerender the inbox and show new messages.
    */
    if (
      currentSelectedConversation &&
      (currentSelectedConversation.username === message.receiver ||
        currentSelectedConversation.username === message.sender)
    ) {
      queryClient.setQueryData(
        ["getMessages", currentSelectedConversation.username],
        (oldData) => {
          if (!oldData) return { data: [message] };
          return {
            ...oldData,
            data: [...oldData.data, message],
          };
        }
      );
    }

    /* update the seen status to true of new messages if user is 
     current in the incoming message inbox
    */
    if (currentSelectedConversation?.username === message.sender) {
      messageSeenStatusByMessageIdMutation.mutate(message._id);
    }
  };

  const onMessageSeen = (conversationId) => {
    // set the seen status to true for the message with this conversationId
    messageSeenStatusTrueMutation.mutate(conversationId);

    // set the unseenCount to 0
    queryClient.setQueryData(["getConversations"], (oldData) => {
      if (!oldData) return null;
      return {
        ...oldData,
        data: oldData?.data?.map((item) => {
          if (item.conversation?._id === conversationId) {
            return {
              ...item,
              unseenMessages: 0,
            };
          } else {
            return item;
          }
        }),
      };
    });
  };

  return (
    <div>
      <ul className="border border-r-gray-300 min-w-56">
        {conversations?.data?.map((item) => (
          <SidebarItem key={item._id} item={item} />
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
