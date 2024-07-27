import React from "react";
import { formatTimeStamp } from "../utils";
import { useAuthContext } from "../context/AuthContextProvider";
import groupStore from "../stores/groupStore";
import conversationStore from "../stores/conversationStore";
import socketStore from "../stores/socketStore";
import { GroupChatEventEnum } from "../constants";

const GroupTabItem = ({ item }) => {
  // for selecting a group
  const selectedGroup = groupStore((state) => state.selectedGroup);
  const setSelectedGroup = groupStore((state) => state.setSelectedGroup);
  const setSelectedConversation = conversationStore(
    (state) => state.setSelectedConversation
  );
  const socket = socketStore((state) => state.socket);

  const { user } = useAuthContext();

  const onGroupSelect = (newSelectedGroup) => {
    setSelectedGroup(newSelectedGroup);
    // when the user select a group unselect the one to one conversation
    setSelectedConversation(null);

    if (
      socket &&
      newSelectedGroup?.lastMessage &&
      newSelectedGroup?.lastMessage?.senderId !== user._id &&
      newSelectedGroup._id !== selectedGroup?._id
    ) {
      // emit an event to the current user room to set unseen count
      socket.emit(GroupChatEventEnum.GROUP_MESSAGE_SEEN_EVENT, {
        selectedGroupId: newSelectedGroup._id,
        room: user._id,
      });

      // emit an event to the sender side to update lastSeen message
      socket.emit(GroupChatEventEnum.GROUP_LAST_SEEN_MESSAGE, {
        groupId: newSelectedGroup._id,
        senderId: newSelectedGroup.lastMessage.senderId,
        receiverId: user._id,
        messageId: newSelectedGroup.lastMessage._id,
      });
    }
  };

  return (
    <li
      className={`relative px-4 py-2 border border-b-gray-300 hover:bg-gray-200 cursor-pointer ${
        item._id === selectedGroup?._id ? "bg-gray-300" : ""
      }`}
      onClick={() => onGroupSelect(item)}
    >
      <div>
        <p className="text-gray-500 font-semibold text-lg">
          {item.conversationName}
        </p>
      </div>
      {item?.lastMessage && (
        <>
          <p>
            <span className="text-gray-500 font-semibold">
              {item.lastMessage.senderId === user._id ? "You:" : null}
            </span>{" "}
            <span>{item.lastMessage.content.substr(0, 8) + "..."}</span>
          </p>
          <p>
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
