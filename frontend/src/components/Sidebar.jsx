import React, { useState } from "react";
import { tabItems } from "../constants";
import Conversation from "./Conversation";
import Contacts from "./Contacts";
import Button from "./Button";
import Modal from "./Modal";
import NewContactModal from "./NewContactModal";
import NewConversationModal from "./NewConversationModal";

const Sidebar = ({ id }) => {
  const [tab, setTab] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <div className="relative border-r-2 border-gray-500 overflow-hidden">
        <ul className="flex gap-4 text-2xl px-4 pt-3">
          {tabItems.map((item, idx) => (
            <li
              key={idx}
              className={`${idx === tab && "text-blue-400"} cursor-pointer`}
              onClick={() => setTab(idx)}
            >
              {item}
            </li>
          ))}
        </ul>
        <div className="h-[2px] bg-gray-500 mt-4" />
        <div className="">{tab === 0 ? <Conversation /> : <Contacts />}</div>
        <div className="absolute bottom-0 left-0">
          <div className="p-2 border border-t-gray-400">
            Your Id: <span className="text-gray-500">{id}</span>
          </div>
          <Button
            className="bg-blue-500 hover:bg-blue-400 w-full rounded-b-none"
            onClick={() => setIsOpen(true)}
          >
            New {tab === 0 ? "Conversation" : "Contact"}
          </Button>
        </div>
      </div>
      <Modal isOpen={isOpen} setIsOpen={setIsOpen}>
        {tab === 0 ? (
          <NewConversationModal />
        ) : (
          <NewContactModal setIsOpen={setIsOpen} />
        )}
      </Modal>
    </>
  );
};

export default Sidebar;
