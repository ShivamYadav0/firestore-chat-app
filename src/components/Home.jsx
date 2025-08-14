// Home.js
import React, { useEffect, useState } from "react";
import ChatHeader from "./ChatHeader";
import ChatList from "./ChatList";
import ChatWindow from "./ChatWindow";
import { ClockIcon } from "@heroicons/react/outline";
import { db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";

function Home({ user, logC }) {
  const [selectedUser, setSelectedUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const usersRef = await getDoc(doc(db, "users", user.uid));
        setUserData(usersRef.data());
      } catch (err) {
        console.error("Error fetching user data:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [user.uid]);

  return (
    <div className="flex flex-col h-screen custom-scrollbar bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="flex flex-col items-center">
            <ClockIcon className="animate-spin h-10 w-10 text-blue-400" />
            <span className="mt-3 text-sm text-gray-300">Loading your chat...</span>
          </div>
        </div>
      )}

      {/* Header */}
      <ChatHeader username={userData?.username} logC={logC} />

      {/* Main Chat Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="hidden md:flex h-full bg-gray-800 border-r border-gray-700 shadow-lg">
          <ChatList
            selectedUser={selectedUser}
            user={user}
            onSelectUser={(u) => setSelectedUser(u)}
          />
        </div>

        {/* Mobile Sidebar Toggle (optional) */}
        <div className="md:hidden absolute top-16 left-0 w-full bg-gray-800 z-40">
          {/* You could add a collapsible ChatList here for mobile */}
        </div>

        {/* Chat Window */}
        <div className="flex-1 h-full bg-gray-900">
          {selectedUser ? (
            <ChatWindow selectedUser={selectedUser} user={user} />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Select a user to start chatting
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;
