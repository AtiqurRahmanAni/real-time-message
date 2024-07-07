import React from "react";
import Sidebar from "../components/Sidebar";
import Inbox from "../components/Inbox";
import conversationStore from "../stores/conversationStore";

const Chat = () => {
  const selectedConversation = conversationStore(
    (state) => state.selectedConversation
  );
  return (
    <div className="flex container">
      <Sidebar />
      {selectedConversation ? (
        <Inbox />
      ) : (
        <div className="relative flex-1 min-h-[calc(100dvh-3.5rem)] flex justify-center items-center">
          <h1 className="font-semibold text-gray-500 text-2xl">
            Select a conversation to start
          </h1>
        </div>
      )}
    </div>
  );
};

export default Chat;
