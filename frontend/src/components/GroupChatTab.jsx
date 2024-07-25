import React, { useState } from "react";
import { IoMdAddCircleOutline } from "react-icons/io";
import GroupCreateDialog from "./GroupCreateDialog";

const GroupChatTab = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <div>
        <div className="">
          <button
            className="bg-sky-400 w-full py-2 text-white flex justify-center items-center gap-x-2 hover:bg-sky-500 transition-colors"
            onClick={() => setIsOpen(true)}
          >
            <IoMdAddCircleOutline className="text-xl" />
            <span>Create group</span>
          </button>
        </div>
        <ul className="border border-r-gray-300 w-56">
          <li>Hello</li>
        </ul>
      </div>
      <GroupCreateDialog isOpen={isOpen} setIsOpen={setIsOpen} />
    </>
  );
};

export default GroupChatTab;
