import React, { useEffect, useRef, useState } from "react";
import Inbox from "../components/Inbox";
import ChatTab from "../components/ChatTab";
import conversationStore from "../stores/conversationStore";
import Tab from "../components/Tab";
import GroupChatTab from "../components/GroupChatTab";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthContext } from "../context/AuthContextProvider";
import socketStore from "../stores/socketStore";
import useFetchData from "../hooks/useFetchData";
import { ChatEventEnum, GroupChatEventEnum } from "../constants";
import axiosInstance from "../utils/axiosInstance";
import groupStore from "../stores/groupStore";
import GroupInbox from "../components/GroupInbox";
import toast from "react-hot-toast";
import SpinnerBlock from "../assets/Spinner";
import { playNotification } from "../utils";
import messageSound from "../assets/message_notification.mp3";

const Chat = () => {
  const selectedConversation = conversationStore(
    (state) => state.selectedConversation
  );
  const [selectedTab, setSelectedTab] = useState(0); // 0 for chat, 1 for group chat
  const queryClient = useQueryClient();

  const { user } = useAuthContext();
  const socket = socketStore((state) => state.socket);

  const setSelectedConversation = conversationStore(
    (state) => state.setSelectedConversation
  );
  const selectedConversationRef = useRef(selectedConversation);

  const selectedGroup = groupStore((state) => state.selectedGroup);
  const selectedGroupRef = useRef(selectedGroup);

  const setOnlineUsers = conversationStore((state) => state.setOnlineUsers);
  const [unreadCount, setUnreadCount] = useState(0);

  // --------------- for one to one chat ------------------ //
  const { data: conversations, isLoading: isConversationsLoading } =
    useFetchData(["getConversations"], `/conversation/${user._id}`, {
      refetchInterval: 1000 * 60 * 5, // refetch sidebar data every 5 minutes so that timestamp updates
    });

  // socket configuration
  useEffect(() => {
    if (!socket) return;

    socket.on(ChatEventEnum.NEW_USER_CREATE_EVENT, onNewUser);
    socket.on(ChatEventEnum.USER_ONLINE_STATUS, handleUserOnlineStatus);
    socket.on(ChatEventEnum.MESSAGE_RECEIVED_EVENT, onMessageReceive);
    socket.on(ChatEventEnum.MESSAGE_SEEN_EVENT, onMessageSeen);
    socket.on(ChatEventEnum.LAST_SEEN_MESSAGE, handleLastSeen);
    socket.on(ChatEventEnum.MESSAGE_DELETE, onDeleteMessage);

    // for group chat
    socket.on(
      GroupChatEventEnum.GROUP_MESSAGE_RECEIVED_EVENT,
      onGroupMessageReceive
    );
    socket.on(GroupChatEventEnum.GROUP_MESSAGE_SEEN_EVENT, onGroupMessageSeen);
    socket.on(GroupChatEventEnum.GROUP_UPDATE_EVENT, onGroupUpdate);
    socket.on(GroupChatEventEnum.GROUP_LAST_SEEN, handleGroupMessageSeen);
    socket.on(GroupChatEventEnum.GROUP_MESSAGE_DELETE, onGroupMessagesDelete);

    return () => {
      socket.off(ChatEventEnum.NEW_USER_CREATE_EVENT, onNewUser);
      socket.off(ChatEventEnum.USER_ONLINE_STATUS, handleUserOnlineStatus);
      socket.off(ChatEventEnum.MESSAGE_RECEIVED_EVENT, onMessageReceive);
      socket.off(ChatEventEnum.MESSAGE_SEEN_EVENT, onMessageSeen);
      socket.off(ChatEventEnum.LAST_SEEN_MESSAGE, handleLastSeen);
      socket.off(ChatEventEnum.MESSAGE_DELETE, onDeleteMessage);

      // for group chat
      socket.off(
        GroupChatEventEnum.GROUP_MESSAGE_RECEIVED_EVENT,
        onGroupMessageReceive
      );
      socket.off(
        GroupChatEventEnum.GROUP_MESSAGE_SEEN_EVENT,
        onGroupMessageSeen
      );
      socket.off(GroupChatEventEnum.GROUP_UPDATE_EVENT, onGroupUpdate);
      socket.off(GroupChatEventEnum.GROUP_LAST_SEEN, handleGroupMessageSeen);
      socket.off(
        GroupChatEventEnum.GROUP_MESSAGE_DELETE,
        onGroupMessagesDelete
      );
    };
  }, [socket]);

  // for updating the last seen status of a user
  const updateUserLastSeenMutation = useMutation({
    mutationFn: (conversationId) => {
      return axiosInstance.patch(`conversation/${conversationId}/last-seen`, {
        userId: user._id,
      });
    },
    onSuccess: (response) => {
      const lastSeenTime = response.data.lastSeenTime;
      /*
      fire an event to the sender side with the
      updated lastSeen time of this user
      */
      if (socket) {
        socket.emit(ChatEventEnum.LAST_SEEN_MESSAGE, {
          lastSeenTime: lastSeenTime,
          room: selectedConversation._id,
          receiverId: user._id,
        });
      }
    },
    onError: (error) => {
      toast.error(
        error.response ? error.response.data.message : "Something went wrong"
      );
    },
  });

  // refer to the latest value of selected conversation and group
  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
    selectedGroupRef.current = selectedGroup;
  }, [selectedConversation, selectedGroup]);

  useEffect(() => {
    if (unreadCount > 0) {
      document.title = `(${unreadCount}) New messages`;
    } else {
      document.title = `Connectly`;
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

  const handleUserOnlineStatus = (onlineUsers) => {
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
    if (message.receiverId === user._id) {
      // const soundNo = generateRandomNumber(notificationSounds.length);
      // playNotification(notificationSounds[soundNo]);
      playNotification(messageSound);
    }

    if (document.visibilityState === "hidden") {
      setUnreadCount((prev) => prev + 1);
    }

    const currentSelectedConversation = selectedConversationRef.current;
    /* 
    if there is a new conversation, update the selectedConversation,
    because conversation and lastMessage is null if users do not exchange any messages 
    */
    if (
      currentSelectedConversation &&
      !currentSelectedConversation?.conversation &&
      (currentSelectedConversation._id === message.receiverId ||
        currentSelectedConversation._id === message.senderId)
    ) {
      setSelectedConversation({
        ...currentSelectedConversation,
        conversation: conversation,
        lastMessage: message,
      });
    }

    /* 
    update the sidebar last message and last message timestamp when a new message 
    is received increment the unseen count for the unselected conversations
    */
    queryClient.setQueryData(["getConversations"], (oldData) => {
      if (!oldData) return;

      let items = [];
      let latestItem = null;

      for (let i = 0; i < oldData?.data?.length; i++) {
        let item = oldData?.data[i];
        if (item._id === message.senderId || item._id === message.receiverId) {
          latestItem = {
            ...item,
            conversation: conversation,
            lastMessage: message,
            /* 
            if the message receiver is in other users' inbox, then increment 
            the count of unseen messages except the selected conversation 
            */
            unseenCount:
              currentSelectedConversation?._id !== message.senderId &&
              message.senderId !== user._id
                ? item.unseenCount + 1
                : item.unseenCount,
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

    /* 
    if there is an inbox open, only then update the cache,
    it will rerender the inbox and show new messages.
    */

    if (
      currentSelectedConversation?._id === message.senderId ||
      currentSelectedConversation?._id === message.receiverId
    ) {
      queryClient.setQueryData(["getMessages", conversation._id], (oldData) => {
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
        return { ...oldData, pages: updatedPages };
      });
    }

    // update the lastSeen of the receiver if he is in someones inbox
    if (currentSelectedConversation?._id === message.senderId) {
      updateUserLastSeenMutation.mutate(conversation._id);
    }
  };

  const onMessageSeen = (selectedConversationId) => {
    /*
    update the user lastSeenTime with the 
    current time if he select a conversation
    */
    updateUserLastSeenMutation.mutate(selectedConversationId);
    // set the unseenCount to 0
    queryClient.setQueryData(["getConversations"], (oldData) => {
      if (!oldData) return;
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
  };

  const handleLastSeen = ({ lastSeenTime, receiverId }) => {
    queryClient.setQueryData(["lastSeenTime", receiverId], (oldData) => {
      if (!oldData) return;

      return {
        ...oldData,
        data: { lastSeenTime },
      };
    });
  };

  const onDeleteMessage = (conversationId) => {
    // delete all the messages
    queryClient.setQueryData(["getMessages", conversationId], (oldData) => {
      if (!oldData) return;
      return undefined;
    });
    queryClient.invalidateQueries(["getConversations"]);
    setSelectedConversation(null);
  };

  //------------- for group conversation --------------//
  const {
    data: groups,
    isLoading: isGroupLoading,
    error: groupFetchError,
  } = useFetchData(
    ["getGroups"],
    `group-conversation/group/participant/${user._id}`,
    {
      refetchInterval: 1000 * 60 * 5, // refetch sidebar data every 5 minutes so that timestamp updates
    }
  );

  const updateUserGroupLastSeenMutation = useMutation({
    mutationFn: (groupId) => {
      return axiosInstance.patch(
        `group-conversation/group/${groupId}/participant-last-seen`,
        {
          participantId: user._id,
        }
      );
    },
    onSuccess: (response) => {
      const participantsLastSeen = response.data;

      // find me from the participant list
      const updatedParticipant = participantsLastSeen.find(
        (participant) => participant.participantId === user._id
      );
      /*
      emit an event to all the group participants
      with the updated last seen
      */
      if (socket) {
        const receiverIds = participantsLastSeen
          .filter((entry) => entry.participantId !== user._id)
          .map((entry) => entry.participantId);

        socket.emit(GroupChatEventEnum.GROUP_LAST_SEEN, {
          groupId: selectedGroup._id,
          updatedParticipant,
          receiverIds,
        });
      }
    },
    onError: (err) => {
      toast.error(
        err.response ? err.response.data.message : "Something went wrong"
      );
    },
  });

  const onGroupMessageReceive = ({ group, message }) => {
    const currentSelectedGroup = selectedGroupRef.current;

    if (message.senderId !== user._id) {
      // const soundNo = generateRandomNumber(notificationSounds.length);
      // playNotification(notificationSounds[soundNo]);
      playNotification(messageSound);
    }

    if (document.visibilityState === "hidden") {
      setUnreadCount((prev) => prev + 1);
    }

    // update the group tab last message
    queryClient.setQueryData(["getGroups"], (oldData) => {
      if (!oldData) return;

      let groups = [];
      let latestItem = null;

      for (let i = 0; i < oldData?.data?.length; i++) {
        let cachedGroup = oldData?.data[i];
        // assign the message incoming group in a separate variable
        if (group._id === cachedGroup._id) {
          latestItem = {
            ...cachedGroup,
            lastMessage: message,
            /*
            if user is not currently in the incoming message group, 
            then increment the unseen count
            */
            unseenCount:
              currentSelectedGroup?._id !== group._id &&
              message.senderId !== user._id
                ? cachedGroup.unseenCount + 1
                : cachedGroup.unseenCount,
          };
        } else {
          groups.push(cachedGroup);
        }
      }
      groups.unshift(latestItem);

      return {
        ...oldData,
        data: groups,
      };
    });

    // update the group inbox if user is in the incoming message group
    if (currentSelectedGroup?._id === group._id) {
      queryClient.setQueryData(
        ["getGroupMessages", currentSelectedGroup._id],
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
          return {
            ...oldData,
            pages: updatedPages,
          };
        }
      );
    }

    /* 
    update last seen of a user except the sender in 
    the group if he is currently in the incoming message group
    */
    if (
      currentSelectedGroup?._id === group._id &&
      message.senderId !== user._id
    ) {
      updateUserGroupLastSeenMutation.mutate(group._id);
    }
  };

  const onGroupMessageSeen = (groupId) => {
    // update last seen time of the user
    updateUserGroupLastSeenMutation.mutate(groupId);
    queryClient.setQueryData(["getGroups"], (oldData) => {
      if (!oldData) return;
      return {
        ...oldData,
        // set the unseen count to 0 if the user click on a group
        data: oldData?.data?.map((item) => {
          if (item._id === groupId) {
            return { ...item, unseenCount: 0 };
          } else {
            return item;
          }
        }),
      };
    });
  };

  // if new group is created or deleted, fetch the groups again
  const onGroupUpdate = () => {
    queryClient.invalidateQueries({ queryKey: ["getGroups"] });
  };

  const onGroupMessagesDelete = (groupId) => {
    /*
    if selected group is current group and messages are deleted,
    refetch messages again
    */
    const currentSelectedGroup = selectedGroupRef.current;
    if (currentSelectedGroup?._id === groupId) {
      queryClient.invalidateQueries(["getGroupMessages", groupId]);
    }
    queryClient.invalidateQueries(["getGroups"]);
  };

  // for updating the seen message in a group
  const handleGroupMessageSeen = ({ groupId, updatedParticipant }) => {
    queryClient.setQueryData(["lastSeenOfParticipants", groupId], (oldData) => {
      if (!oldData) return;
      const participantsLastSeen = [...oldData.data];

      const idx = participantsLastSeen.findIndex(
        (participant) =>
          participant.participantId === updatedParticipant.participantId
      );

      if (idx === -1) {
        participantsLastSeen.push(updatedParticipant);
      } else {
        participantsLastSeen[idx] = updatedParticipant;
      }

      return {
        ...oldData,
        data: participantsLastSeen,
      };
    });
  };

  return (
    <div className="container">
      <div className="flex">
        <div>
          <div className="flex">
            <Tab
              tabText="Chats"
              onClick={() => setSelectedTab(0)}
              isActive={selectedTab === 0}
            />
            <Tab
              tabText="Groups"
              onClick={() => setSelectedTab(1)}
              isActive={selectedTab === 1}
            />
          </div>
          {isGroupLoading || isConversationsLoading ? (
            <div className="min-h-[calc(100dvh-95px)] flex justify-center items-center w-56">
              <SpinnerBlock />
            </div>
          ) : selectedTab === 0 ? (
            <ChatTab conversations={conversations?.data} />
          ) : (
            <GroupChatTab groups={groups?.data} />
          )}
        </div>
        {selectedConversation ? (
          <Inbox />
        ) : selectedGroup ? (
          <GroupInbox />
        ) : (
          <div className="relative flex-1 min-h-[calc(100dvh-3.5rem)] flex justify-center items-center">
            <h1 className="font-semibold text-gray-300 text-2xl">
              Select a conversation or group to start
            </h1>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
