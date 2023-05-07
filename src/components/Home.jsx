// Home.js
import React, { useEffect, useState } from "react";
import ChatHeader from "./ChatHeader";
import ChatList from "./ChatList";
import ChatWindow from "./ChatWindow";
import { ClockIcon } from "@heroicons/react/outline";
import { db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";

function Home({ user,logC }) {
  const [selectedUser, setSelectedUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    async function fetchData() {
      // console.log(user);
      let usersRef = await getDoc(doc(db, "users", user.uid));
      // console.log(usersRef.data());
      setUserData(usersRef.data());
      setIsLoading(false);
      // setSelectedUser(usersRef.data());
    }
    fetchData();
  }, []);
  return (
    <div>
     
        <div
          className={`${
            isLoading ? "block" : "hidden"
          } absolute top-0 left-0 w-screen h-screen bg-white opacity-75 z-50 flex items-center justify-center`}
        >
          <div className="spinner text-blue-600">
            <ClockIcon className="animate-spin h-6 w-6 text-current" />
          </div>
    
      </div>
      <ChatHeader username={userData?.username}  logC={logC}/>
      <div className="flex h-[90vh]">
        <div className="w-1/3 max-w-[250px] h-full top-0 bg-gray-200">
          <ChatList
            selectedUser={selectedUser}
            user={user}
            onSelectUser={(user) => setSelectedUser(user)}
          />
        </div>
        <div className="w-2/3 flex-1 h-full bg-gray-100">
          <ChatWindow selectedUser={selectedUser} user={user} />
        </div>
      </div>
    </div>
  );
}

export default Home;
