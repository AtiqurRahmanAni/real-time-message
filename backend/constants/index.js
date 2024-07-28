export const ChatEventEnum = Object.freeze({
  // ? once user is ready to go
  CONNECTED_EVENT: "connected",
  // ? when user gets disconnected
  DISCONNECT_EVENT: "disconnect",
  // ? when user joins a socket room
  JOIN_CHAT_EVENT: "joinChat",
  // ? when participant gets removed from group, chat gets deleted or leaves a group
  LEAVE_CHAT_EVENT: "leaveChat",
  // ? when new message is received
  MESSAGE_RECEIVED_EVENT: "messageReceived",
  // ? when there is new one on one chat, new group chat or user gets added in the group
  NEW_CHAT_EVENT: "newChat",
  // ? when there is an error in socket
  SOCKET_ERROR_EVENT: "socketError",
  // ? when participant stops typing
  STOP_TYPING_EVENT: "stopTyping",
  // ? when participant starts typing
  TYPING_EVENT: "typing",
  // ? when a new user signup
  NEW_USER_CREATE_EVENT: "newUserCreate",
  // ? when a new user comes online
  USER_ONLINE: "userOnline",
  // ? when a new user goes offline
  USER_OFFLINE: "userOffline",
  // ? for updating sidebar information (e.g: lastMessage, lastMessageTimeStamp)
  CONVERSATION_UPDATE_EVENT: "conversationUpdate",
  // ? when a user click on an inbox
  MESSAGE_SEEN_EVENT: "messageSeen",
  // ? when a user sees a message
  LAST_SEEN_MESSAGE: "lastSeenMessage",
});

export const GroupChatEventEnum = Object.freeze({
  // ? when new message is received
  GROUP_MESSAGE_RECEIVED_EVENT: "groupMessageReceived",
  // ? when a user click on an group
  GROUP_MESSAGE_SEEN_EVENT: "groupMessageSeen",
  // ? groups update event, if a group is deleted to crated
  GROUP_UPDATE_EVENT: "groupUpdateEvent",
  // ? when participant starts typing
  GROUP_TYPING_EVENT: "groupTyping",
  // ? when participant stops typing
  STOP_GROUP_TYPING_EVENT: "stopGroupTyping",
  // ? when a user sees a message
  GROUP_LAST_SEEN: "groupLastSeen",
});
