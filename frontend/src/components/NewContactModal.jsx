import React, { useRef } from "react";
import Input from "./Input";
import Button from "./Button";
import { useContacts } from "../context/ContactsContext.jsx";

const NewContactModal = ({ setIsOpen }) => {
  const idRef = useRef(null);
  const nameRef = useRef(null);
  const { createContact } = useContacts();

  const create = (e) => {
    e.preventDefault();
    createContact(idRef.current.value, nameRef.current.value);
    setIsOpen(false);
  };

  return (
    <form className="font-roboto" onSubmit={create}>
      <h2 className="text-2xl text-gray-500">Create Contact</h2>
      <div className="h-[2px] bg-gray-400 my-2" />
      <Input label="Id" ref={idRef} />
      <Input label="Name" className="my-4" ref={nameRef} />
      <div>
        <Button type="submit" className="bg-blue-500 hover:bg-blue-400">
          Create
        </Button>
      </div>
    </form>
  );
};

export default NewContactModal;
