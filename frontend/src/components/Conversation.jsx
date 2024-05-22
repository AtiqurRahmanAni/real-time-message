import React, { useState } from "react";
import { useConversation } from "../context/ConversationContext";
import deleteIcon from "../assets/delete.png";
import Modal from "./Modal";
import DeleteConfirmation from "./DeleteConfirmation.jsx";

let indexToBeDeleted = 0;
const Conversation = () => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { conversations, setSelected, deleteConversation } = useConversation();

  return (
    <div>
      <ul>
        {conversations.map((item, idx) => (
          <li
            key={idx}
            className={`relative border border-b-gray-500 text-xl py-2 px-1 hover:bg-blue-300 cursor-pointer ${
              item.selected && "bg-blue-400"
            }`}
            onClick={() => setSelected(idx)}
          >
            <div>{item.recipients.map((obj) => obj.name).join(", ")}</div>
            <div
              className="absolute right-2 top-4"
              onClick={() => {
                indexToBeDeleted = idx;
                setIsDeleteModalOpen(true);
              }}
            >
              <img src={deleteIcon} width={18} height={18} alt="delete" />
            </div>
          </li>
        ))}
      </ul>
      <Modal isOpen={isDeleteModalOpen} setIsOpen={setIsDeleteModalOpen}>
        <DeleteConfirmation
          handleDelete={() => deleteConversation(indexToBeDeleted)}
          setIsOpen={setIsDeleteModalOpen}
        />
      </Modal>
    </div>
  );
};

export default Conversation;
