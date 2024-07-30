import { useState } from "react";
import { ChatEventEnum } from "../constants";
import { useAuthContext } from "../context/AuthContextProvider";
import conversationStore from "../stores/conversationStore";
import groupStore from "../stores/groupStore";
import socketStore from "../stores/socketStore";
import { formatTimeStamp } from "../utils/index";
import { MdDelete } from "react-icons/md";
import DeleteConfirmationDialog from "./DeleteConfirmationDialog";
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "../utils/axiosInstance";
import toast from "react-hot-toast";

const ChatTabItem = ({ item }) => {
  // for selecting a conversation
  const selectedConversation = conversationStore(
    (state) => state.selectedConversation
  );
  const setSelectedConversation = conversationStore(
    (state) => state.setSelectedConversation
  );
  const setSelectedGroup = groupStore((state) => state.setSelectedGroup);

  const socket = socketStore((state) => state.socket);

  // online users state
  const onlineUsers = conversationStore((state) => state.onlineUsers);
  const { user, logoutActions } = useAuthContext();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const onConversationSelect = (item) => {
    if (selectedConversation?._id !== item._id) {
      setSelectedConversation(item);
      // when the user select a one to one conversation, unselect the group
      setSelectedGroup(null);

      // emit event to update unseenCount if the last message receiver me
      if (socket && item.conversation && item.unseenCount !== 0) {
        socket.emit(ChatEventEnum.MESSAGE_SEEN_EVENT, {
          selectedConversationId: item.conversation._id,
          room: user._id,
        });
      }
    }
  };

  const messageDeleteMutation = useMutation({
    mutationFn: () =>
      axiosInstance.delete(`conversation/${item.conversation._id}/messages`),
    onSuccess: (response) => {
      toast.success(response.data.message);
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast.error(
        error.response ? error.response.data.message : "Something went wrong"
      );
      if (error?.response.status === 401) {
        logoutActions();
      }
    },
  });

  const deleteMessages = (e) => {
    e.stopPropagation();
    setIsDeleteDialogOpen(true);
  };

  return (
    <>
      <li
        className={`relative px-4 py-2 border border-gray-700 hover:bg-gray-700/40 cursor-pointer ${
          item._id === selectedConversation?._id ? "bg-gray-700/90" : ""
        }`}
        onClick={() => onConversationSelect(item)}
      >
        <div>
          <div className="flex justify-between items-center">
            <p className="text-gray-300/85 font-semibold text-lg">
              {item.displayName}
            </p>
            {item.conversation && (
              <button
                className="pr-1 text-gray-300/85 text-2xl transition-colors duration-200 hover:text-red-600"
                onClick={deleteMessages}
              >
                <MdDelete />
              </button>
            )}
          </div>
          {onlineUsers.includes(item._id) && (
            <div className="absolute right-2 top-2 w-[8px] h-[8px] bg-green-600 rounded-full" />
          )}
        </div>
        {item?.lastMessage && (
          <>
            <p>
              <span className="text-gray-300/80 font-semibold">
                {item.lastMessage.senderId === user._id ? "You:" : null}
              </span>{" "}
              <span className="text-gray-300/75">
                {item.lastMessage.content.substr(0, 8) + "..."}
              </span>
            </p>
            <p>
              <span className="text-gray-300/75">
                {formatTimeStamp(item.lastMessage.createdAt)}
              </span>
            </p>
          </>
        )}

        {item.unseenCount > 0 && (
          <div className="absolute bottom-2 right-2 bg-green-600 px-1.5 py-0 rounded-full">
            <span className="text-white">{item.unseenCount}</span>
          </div>
        )}
      </li>
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        setIsOpen={setIsDeleteDialogOpen}
        deleteFn={() => messageDeleteMutation.mutate()}
        disableButtons={messageDeleteMutation.isPending}
      />
    </>
  );
};

export default ChatTabItem;
