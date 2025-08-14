import React, { useState, useEffect } from "react";
import { SearchIcon, LogoutIcon, XIcon } from "@heroicons/react/outline";
import { db } from "./firebase";
import {
  collection,
  query,
  orderBy,
  startAt,
  endAt,
  getDocs,
  limit,
} from "firebase/firestore";

function ChatHeader({ username, logC, onSelectChat }) {
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleLog = () => {
    localStorage.removeItem("R1isLog");
    logC(false, null);
  };

  // Firestore search
  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    const fetchSearch = async () => {
      setLoading(true);
      try {
        const chatsRef = collection(db, "users"); // Adjust collection name to your structure
        const q = query(
          chatsRef,
          orderBy("username"),
          startAt(searchTerm),
          endAt(searchTerm + "\uf8ff"),
          limit(8)
        );
        const snap = await getDocs(q);
        setResults(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error("Search error:", err);
      }
      setLoading(false);
    };

    const debounce = setTimeout(fetchSearch, 400);
    return () => clearTimeout(debounce);
  }, [searchTerm]);

  return (
    <header className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-md relative">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
        {/* Left: Avatar + Username */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-blue-300 flex items-center justify-center font-bold text-blue-900 uppercase">
              {username ? username.charAt(0) : "?"}
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-blue-600 rounded-full"></span>
          </div>
          <div>
            <h1 className="text-lg font-bold">{username || "No User Selected"}</h1>
            <p className="text-xs text-blue-200">Online</p>
          </div>
        </div>

        {/* Right: Search & Logout */}
        <div className="flex items-center space-x-4">
         

          <button
            onClick={handleLog}
            className="flex items-center px-4 py-1.5 bg-red-500 hover:bg-red-600 rounded-full font-medium text-white shadow-lg transition"
          >
            <LogoutIcon className="h-4 w-4 mr-1" />
            Logout
          </button>
        </div>
      </div>

      {/* Search results dropdown */}
      {showSearch && searchTerm && (
        <div className="absolute top-full left-0 w-full bg-white text-black shadow-lg max-h-64 overflow-y-auto z-50">
          {loading ? (
            <p className="p-3 text-gray-500">Searching...</p>
          ) : results.length > 0 ? (
            results.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelectChat(item);
                  setShowSearch(false);
                  setSearchTerm("");
                }}
                className="p-3 hover:bg-gray-100 cursor-pointer"
              >
                <p className="font-semibold">{item.username}</p>
                <p className="text-xs text-gray-500">
                  {item.email || "No details"}
                </p>
              </div>
            ))
          ) : (
            <p className="p-3 text-gray-500">No results found</p>
          )}
        </div>
      )}
    </header>
  );
}

export default ChatHeader;
