import React, { useState } from "react";
import { formatTimeStamp } from "../utils";
import { useAuthContext } from "../context/AuthContextProvider";
import groupStore from "../stores/groupStore";
import conversationStore from "../stores/conversationStore";
import socketStore from "../stores/socketStore";
import { GroupChatEventEnum } from "../constants";
import { useQueryClient } from "@tanstack/react-query";
import GroupSettingsDropDown from "./GroupSettingsDropDown";

const GroupTabItem = ({ item }) => {
  // for selecting a group
  const selectedGroup = groupStore((state) => state.selectedGroup);
  const setSelectedGroup = groupStore((state) => state.setSelectedGroup);
  const setSelectedConversation = conversationStore(
    (state) => state.setSelectedConversation
  );
  const socket = socketStore((state) => state.socket);
  const { user } = useAuthContext();

  const queryClient = useQueryClient();
  const cachedUsers = queryClient.getQueryData(["getConversations"])?.data;

  const getMessageSenderUsername = () => {
    return cachedUsers?.find(
      (cachedUser) => cachedUser._id === item?.lastMessage.senderId
    ).username;
  };

  const onGroupSelect = (newSelectedGroup) => {
    setSelectedGroup(newSelectedGroup);
    // when the user select a group unselect the one to one conversation
    setSelectedConversation(null);

    if (
      socket &&
      newSelectedGroup?.lastMessage &&
      newSelectedGroup?.lastMessage.senderId !== user._id &&
      newSelectedGroup._id !== selectedGroup?._id
    ) {
      // emit an event to the current user room to set unseen count
      socket.emit(GroupChatEventEnum.GROUP_MESSAGE_SEEN_EVENT, {
        selectedGroupId: newSelectedGroup._id,
        room: user._id,
      });
    }
  };

  return (
    <li
      className={`relative px-4 py-2 border border-gray-700 hover:bg-gray-700/40 cursor-pointer ${
        item._id === selectedGroup?._id ? "bg-gray-700/90" : ""
      }`}
      onClick={() => onGroupSelect(item)}
    >
      <div className="text-gray-300/85 flex justify-between items-center">
        <p className="font-semibold text-lg">{item.conversationName}</p>
        <GroupSettingsDropDown groupId={item._id} />
      </div>
      {item?.lastMessage && (
        <>
          <p>
            <span className="text-gray-300/80 font-semibold">
              {item.lastMessage.senderId === user._id
                ? "You:"
                : `${getMessageSenderUsername()}: `}
            </span>{" "}
            <span className="text-gray-300/75">
              {item.lastMessage.content.substr(0, 8) + "..."}
            </span>
          </p>
          <p className="text-gray-300/75">
            <span>{formatTimeStamp(item.lastMessage.createdAt)}</span>
          </p>
        </>
      )}

      {item.unseenCount > 0 && (
        <div className="absolute bottom-2 right-2 bg-green-600 px-1.5 py-0 rounded-full">
          <span className="text-white">{item.unseenCount}</span>
        </div>
      )}
    </li>
  );
};

export default GroupTabItem;
