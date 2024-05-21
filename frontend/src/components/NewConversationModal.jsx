import { useState } from "react";
import { useContacts } from "../context/ContactsContext";
import Check from "./Check";
import Button from "./Button";

const NewConversationModal = () => {
  const { contacts } = useContacts();
  const [selected, setSelected] = useState([]);
  const submit = (e) => {
    e.preventDefault();
    console.log(e);
  };

  return (
    <form className="font-roboto" onSubmit={submit}>
      <h2 className="text-center text-2xl">Create Conversation</h2>
      <div className="h-[2px] bg-gray-200 my-4" />
      <ul>
        {contacts.map((item) => (
          <li key={item.id} className="mb-2">
            <Check
              id={item.id}
              label={item.name}
              setSelected={setSelected}
              selected={selected}
            />
          </li>
        ))}
      </ul>
      <div className="mt-4">
        <Button
          type="submit"
          className="bg-blue-500 hover:bg-blue-400"
          disabled={selected.length === 0}
        >
          Submit
        </Button>
      </div>
    </form>
  );
};

export default NewConversationModal;
