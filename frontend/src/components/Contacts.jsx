import React from "react";
import { useContacts } from "../context/ContactsContext";

const Contacts = () => {
  const { contacts } = useContacts();
  return (
    <div>
      <ul>
        {contacts.map((item) => (
          <li
            key={item.id}
            className="border border-b-gray-400 text-xl py-2 px-1 hover:bg-blue-300 cursor-pointer"
          >
            {item.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Contacts;
