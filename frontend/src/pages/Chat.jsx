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
      {selectedConversation && <Inbox />}
    </div>
  );
};

export default Chat;
