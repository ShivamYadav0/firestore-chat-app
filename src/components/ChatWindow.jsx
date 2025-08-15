import React, { useState, useRef, useEffect } from "react";
import { db } from "./firebase";
import { ClockIcon, PaperAirplaneIcon, ArrowLeftIcon } from "@heroicons/react/outline";
import {
  doc,
  query,
  getDoc,
  collection,
  addDoc,
  onSnapshot,
  orderBy,
  updateDoc,
} from "firebase/firestore";

function ChatWindow({ selectedUser, user, setShowChatWindow }) {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const messageListRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Send message
  const addMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const senderName = userDoc.data().username;

      const newMsg = {
        sender: senderName,
        text: newMessage,
        timestamp: new Date(),
        readBy: [user.uid], // sender has read it
      };

      // Current user's messages
      const messagesRef = collection(
        doc(collection(doc(db, "users", user.uid), "connections"), selectedUser.id),
        "messages"
      );
      await addDoc(messagesRef, newMsg);

      // Receiver's messages
      const receiverMessagesRef = collection(
        doc(collection(doc(db, "users", selectedUser.id), "connections"), user.uid),
        "messages"
      );
      const newMsgForReceiver = { ...newMsg, readBy: [] }; // receiver hasn't read
      await addDoc(receiverMessagesRef, newMsgForReceiver);

      setNewMessage("");
    } catch (err) {
      console.error("Error adding message:", err);
    }
  };

  // Scroll to bottom
  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  // Scroll input focus
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;

    const handleFocus = () => {
      setTimeout(scrollToBottom, 300); // wait for keyboard animation
    };

    el.addEventListener("focus", handleFocus);
    return () => el.removeEventListener("focus", handleFocus);
  }, []);

  // Fetch messages and mark as read
  useEffect(() => {
    if (!selectedUser) {
      setIsLoading(false);
      return;
    }

    const messagesRef = collection(
      doc(collection(doc(db, "users", user.uid), "connections"), selectedUser.id),
      "messages"
    );
    const q = query(messagesRef, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const msgs = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setMessages(msgs);
      setIsLoading(false);

      setTimeout(() => {
        messageListRef.current?.scrollTo({
          top: messageListRef.current.scrollHeight,
          behavior: "smooth",
        });
      }, 100);

      // Mark unread messages as read
      snapshot.docs.forEach(async (docSnap) => {
        const data = docSnap.data();
        if (!data.readBy?.includes(user.uid)) {
          await updateDoc(
            doc(
              db,
              "users",
              user.uid,
              "connections",
              selectedUser.id,
              "messages",
              docSnap.id
            ),
            { readBy: [...(data.readBy || []), user.uid] }
          );
        }
      });
    });

    return () => unsubscribe();
  }, [selectedUser, user.uid]);

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-gray-900 to-gray-800 text-white relative">
      {/* Loader */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center">
          <ClockIcon className="animate-spin h-8 w-8 text-blue-400" />
        </div>
      )}

      {/* Header */}
      {setShowChatWindow && (
        <div className="p-3 bg-gray-800 flex items-center border-b border-gray-700">
          <button
            onClick={() => setShowChatWindow && setShowChatWindow(false)}
            className="mr-3 p-2 rounded-full hover:bg-gray-700"
          >
            <ArrowLeftIcon className="h-5 w-5 text-white" />
          </button>
          <span className="font-semibold">{selectedUser?.data()?.username}</span>
        </div>
      )}

      {/* Messages */}
      <div
        ref={messageListRef}
        className="flex-1 overflow-y-auto p-4 mb-[70px] md:mb-[70px] space-y-3 custom-scrollbar"
      >
        {messages.length > 0 ? (
          messages.map((message) => {
            const isOwn = message.sender !== selectedUser?.data().username;
            return (
              <div
                key={message.id}
                className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl shadow-md transition-transform duration-200 hover:scale-[1.02] ${
                    isOwn
                      ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-br-none"
                      : "bg-gray-700 text-gray-100 rounded-bl-none"
                  }`}
                >
                  <p className="font-semibold text-xs opacity-80">{message.sender}</p>
                  <p className="mt-1 text-sm">{message.text}</p>
                  <p
                    className={`text-[0.7rem] mt-2 opacity-60 ${
                      isOwn ? "text-blue-200" : "text-gray-400"
                    }`}
                  >
                    {message.timestamp?.toDate().toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-center text-gray-500 mt-10">
            {selectedUser ? "No messages yet" : "Select a user to chat."}
          </p>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {selectedUser && (
        <div className="p-3 bg-gray-800 fixed bottom-0 right-0 md:left-[298px] border-t border-gray-700 shadow-inner">
          <form
            onSubmit={addMessage}
            className="flex items-center space-x-3 max-w-4xl mx-auto"
          >
            <input
              type="text"
              ref={inputRef}
              placeholder={`Message ${selectedUser.data().username}`}
              className="flex-1 px-4 py-2 rounded-full bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <button
              type="submit"
              className="flex items-center px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg transition-colors"
            >
              <PaperAirplaneIcon className="h-5 w-5 mr-1 transform rotate-45" />
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default ChatWindow;
