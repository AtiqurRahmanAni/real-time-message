import React from "react";
import Sidebar from "../components/Sidebar";
import Inbox from "../components/Inbox";

const Chat = () => {
  return (
    <div className="flex container">
      <Sidebar />
      <Inbox />
    </div>
  );
};

export default Chat;
