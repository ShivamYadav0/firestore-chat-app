import React, { useEffect, useState } from "react";
import ChatHeader from "./ChatHeader";
import ChatList from "./ChatList";
import ChatWindow from "./ChatWindow";
import { ClockIcon, PlusIcon, ArrowLeftIcon } from "@heroicons/react/outline";
import { db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";

function Home({ user, logC }) {
  const [selectedUser, setSelectedUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showChatWindow, setShowChatWindow] = useState(false); // Mobile view control

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

  // Handle selecting user (works for mobile & desktop)
  const handleSelectUser = (u) => {
    setSelectedUser(u);
    if (window.innerWidth < 768) setShowChatWindow(true); // Mobile only
  };
useEffect(() => {
  function updateHeight() {
    const vh = window.innerHeight * 0.01; // 1% of viewport height
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }

  updateHeight();
  window.addEventListener('resize', updateHeight);

  return () => {
    window.removeEventListener('resize', updateHeight);
  };
}, []);

  return (
    <div className="flex flex-col full-height overflow-y-none  bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
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
        {/* Desktop Sidebar */}
        <div className="hidden md:flex h-full bg-gray-800 border-r border-gray-700 shadow-lg">
          <ChatList
            selectedUser={selectedUser}
            user={user}
            onSelectUser={handleSelectUser}
          />
        </div>

        {/* Mobile View */}
        <div className="flex-1 md:hidden relative">
          {!showChatWindow ? (
            <div className="h-full flex flex-col">
              {/* Chat List + Floating Add Button */}
              <ChatList
                selectedUser={selectedUser}
                user={user}
                onSelectUser={handleSelectUser}
              />
             
            </div>
          ) : (
            <div className="h-full flex flex-col">
              {/* Back Button */}
             
              <ChatWindow setShowChatWindow={setShowChatWindow}  selectedUser={selectedUser} user={user} />
            </div>
          )}
        </div>

        {/* Desktop Chat Window */}
        <div className="flex-1 h-full bg-gray-900 hidden md:block">
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
