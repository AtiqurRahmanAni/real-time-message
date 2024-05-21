import React, { useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import Button from "./Button";

const Login = ({ onIdSubmit }) => {
  const idRef = useRef();

  const submit = (e) => {
    e.preventDefault();
    onIdSubmit(idRef.current.value);
  };

  const createNewId = () => {
    onIdSubmit(uuidv4());
  };

  return (
    <div className="flex justify-center items-center h-screen px-10">
      <form className="w-full" onSubmit={submit}>
        <label className="block mb-3 text-xl text-gray-600" htmlFor="id">
          Enter Id
        </label>
        <input
          id="id"
          ref={idRef}
          name="id"
          type="text"
          className="text-gray-600 px-3 text-lg border border-gray-300 rounded-md w-full h-10"
          required
        />
        <div className="mt-4">
          <Button type="submit" className="bg-blue-500 hover:bg-blue-600">
            Login
          </Button>
          <Button
            className="bg-gray-500 hover:bg-gray-600 ml-2"
            onClick={createNewId}
          >
            Create A New Id
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Login;
