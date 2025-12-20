import React from "react";
import SpinnerBlock from "../assets/Spinner";

const Loading = () => {
  return (
    <div className="bg-gray-800 min-h-dvh flex justify-center items-center">
      <SpinnerBlock />
    </div>
  );
};

export default Loading;
