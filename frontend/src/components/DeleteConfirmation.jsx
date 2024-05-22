import React from "react";
import Button from "./Button";
import deleteIcon from "../assets/delete.png";

const DeleteConfirmation = ({ setIsOpen, handleDelete }) => {
  const handleClick = () => {
    handleDelete();
    setIsOpen(false);
  };

  return (
    <div>
      <div className="w-16 h-16 m-auto my-4">
        <img src={deleteIcon} className="w-full h-full" alt="delete" />
      </div>
      <h2 className="text-xl text-center">Are you sure want to delete</h2>
      <div className="mt-4 flex justify-center gap-2">
        <Button className="bg-red-500 hover:bg-red-400" onClick={handleClick}>
          Delete
        </Button>
        <Button
          className="bg-gray-500 hover:bg-gray-400"
          onClick={() => setIsOpen(false)}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default DeleteConfirmation;
