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

  const { user } = useAuthContext();
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
  const [unreadCount, setUnreadCount] = useState(0);

  const {
    isLoading,
    error,
    data: conversations,
  } = useFetchData(["getConversations"], `/conversation/${user._id}`, {
    refetchInterval: 1000 * 60 * 5, // refetch sidebar data every 5 minutes so that timestamp updates
  });

  // for updating the last seen status of a user
  const updateUserLastSeenMutation = useMutation({
    mutationFn: (conversationId, participantId = null) => {
      return axiosInstance.patch(`conversation/seen`, {
        conversationId,
        participantId: participantId || user._id,
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

  // if (error) {
  //   toast.error(error?.data?.message);
  // }

  useEffect(() => {
    if (!socket) return;

    socket.on(ChatEventEnum.NEW_USER_EVENT, onNewUser);
    socket.on(ChatEventEnum.USER_ONLINE, handleUserOnline);
    socket.on(ChatEventEnum.USER_OFFLINE, handleUserOffline);
    socket.on(ChatEventEnum.MESSAGE_RECEIVED_EVENT, onMessageReceive);
    socket.on(ChatEventEnum.MESSAGE_SEEN_EVENT, onMessageSeen);
    socket.on(ChatEventEnum.LAST_SEEN_MESSAGE, handleLastSeen);

    return () => {
      socket.off(ChatEventEnum.NEW_USER_EVENT, onNewUser);
      socket.off(ChatEventEnum.USER_ONLINE, handleUserOnline);
      socket.off(ChatEventEnum.USER_OFFLINE, handleUserOffline);
      socket.off(ChatEventEnum.MESSAGE_RECEIVED_EVENT, onMessageReceive);
      socket.off(ChatEventEnum.MESSAGE_SEEN_EVENT, onMessageSeen);
      socket.off(ChatEventEnum.LAST_SEEN_MESSAGE, handleLastSeen);
    };
  }, [socket]);

  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
  }, [selectedConversation]);

  useEffect(() => {
    if (unreadCount > 0) {
      document.title = `(${unreadCount}) New messages`;
    } else {
      document.title = `Chat app`;
    }
  }, [unreadCount]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        setUnreadCount(0);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

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

  const onMessageReceive = (data) => {
    const { conversation, message } = data;
    /*
    the conversation and the message objects are in the following format:
    "conversation": {
            "_id": ""
      },
      "lastMessage": {
          "_id": "",
          "content": "",
          "senderId": "",
          "receiverId": "",
          "createdAt": ""
      },
    */

    if (document.visibilityState === "hidden") {
      setUnreadCount((prev) => prev + 1);
    }

    const currentSelectedConversation = selectedConversationRef.current;
    /* if there is a new conversation, update the selectedConversation,
      because conversation and lastMessage is null if users do not exchange any messages 
    */
    if (
      currentSelectedConversation &&
      !currentSelectedConversation.conversation &&
      (currentSelectedConversation._id === message.receiverId ||
        currentSelectedConversation._id === message.senderId)
    ) {
      setSelectedConversation({
        ...currentSelectedConversation,
        conversation: conversation,
        lastMessage: message,
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
        if (item._id === message.senderId || item._id === message.receiverId) {
          latestItem = {
            ...item,
            /* if the message receiver is in other users' inbox, then increment 
            the count of unseen messages except the selected conversation */
            unseenCount:
              currentSelectedConversation?._id !== message.senderId &&
              message.senderId !== user._id
                ? item.unseenCount + 1
                : item.unseenCount,

            conversation: conversation,
            lastMessage: message,
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
      (currentSelectedConversation._id === message.senderId ||
        currentSelectedConversation._id === message.receiverId)
    ) {
      queryClient.setQueryData(
        ["getMessages", currentSelectedConversation._id],
        (oldData) => {
          if (!oldData) return;

          const updatedMessages = [message, ...oldData.pages[0].data.messages];

          // Create a new pages array with the first page updated with the new messages array
          const updatedPages = oldData.pages.map((page, index) => {
            if (index === 0) {
              return {
                ...page,
                data: {
                  ...page.data,
                  messages: updatedMessages,
                },
              };
            }
            return page;
          });

          // Return a new data object with the updated pages array
          return {
            ...oldData,
            pages: updatedPages,
          };
        }
      );
    }

    // update the lastSeen of the receiver if he is in someones inbox
    if (currentSelectedConversation?._id === message.senderId) {
      updateUserLastSeenMutation.mutate(conversation._id, message.receiverId);

      // emit event to the sender room to update last seen
      if (socket) {
        socket.emit(ChatEventEnum.LAST_SEEN_MESSAGE, {
          lastMessageId: message._id,
          room: message.senderId,
          receiverId: message.receiverId,
        });
      }
    }
  };

  const onMessageSeen = (selectedConversationId) => {
    // set the seen status to true for the message with this conversationId
    updateUserLastSeenMutation.mutate(selectedConversationId);

    // set the unseenCount to 0
    queryClient.setQueryData(["getConversations"], (oldData) => {
      if (!oldData) return null;
      return {
        ...oldData,
        data: oldData?.data?.map((item) => {
          if (item.conversation?._id === selectedConversationId) {
            return {
              ...item,
              unseenCount: 0,
            };
          } else {
            return item;
          }
        }),
      };
    });

    /*
    fire an event to the sender side to update the last seen 
    if the last message sender is other person
    */
    const currentSelectedConversation = selectedConversationRef.current;
    const cachedConversations = queryClient.getQueryData([
      "getConversations",
    ])?.data;
    const lastMessage = cachedConversations?.find(
      (item) => item._id === currentSelectedConversation._id
    )?.lastMessage;

    // emit event if the last message receiver is me
    if (lastMessage?.receiverId === user._id) {
      if (socket) {
        socket.emit(ChatEventEnum.LAST_SEEN_MESSAGE, {
          lastMessageId: lastMessage._id,
          room: lastMessage.senderId,
          receiverId: lastMessage.receiverId,
        });
      }
    }
  };

  const handleLastSeen = ({ lastMessageId, receiverId }) => {
    queryClient.setQueryData(["lastSeenMessage", receiverId], (oldData) => {
      if (!oldData) return;
      return {
        ...oldData,
        data: { _id: lastMessageId },
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
