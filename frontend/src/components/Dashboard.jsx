import React from "react";
import Sidebar from "./Sidebar";

const Dashboard = ({ id }) => {
  return (
    <div className="flex h-screen">
      <Sidebar id={id} />
    </div>
  );
};

export default Dashboard;
