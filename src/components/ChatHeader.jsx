import React,{useState} from "react";
import { ClockIcon } from "@heroicons/react/outline";

function ChatHeader({ username ,logC}) {
  const [isLoading, setIsLoading] = useState(true);
  const handleLog= ()=>{
     localStorage.removeItem("R1isLog");
    logC(false,null);
    //setIsLoading(false);
  }
  return (
    <div className="flex items-center w-screen justify-between  h-15 bg-blue-500 text-white px-4 p-2">
      <h1 className="text-lg font-bold">{username || "No User Selected"}</h1>
      <button className="bg-blue-700 px-4 py-1 rounded-md" onClick={handleLog}>Logout</button>
    </div>
  );
}

export default ChatHeader;
