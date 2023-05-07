import React, { useState, useRef, useEffect } from "react";
import ChatList from "./ChatList";
import { db } from "./firebase";
import { ClockIcon } from "@heroicons/react/outline";
import {
  doc,
  query,
  getDoc,
  getDocs,
  collection,
  addDoc,
  onSnapshot,
  orderBy,
  collectionGroup,
} from "firebase/firestore";
let x = 0;
function ChatWindow({ selectedUser, user }) {
  //console.log("received chat window")
  const [messages, setMessages] = useState([{}]);
  const [isLoadingc, setIsLoadingc] = useState(true);
  const [force, setForce] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const messageListRef = useRef();
  const addMessage = async (e) => {
    e.preventDefault();
    const messagesRef = collection(
      doc(
        collection(doc(db, "users", user.uid), "connections"),
        selectedUser.id
      ),
      "messages"
    );
    try {
      let usersRef = await getDoc(doc(db, "users", user.uid));
      const docRef = await addDoc(messagesRef, {
        sender: usersRef.data().username,

        text: newMessage,
        timestamp: new Date(),
      });
      // console.log("Message added with ID:", usersRef.data());
      //
      const messagesReceiverRef = collection(
        doc(
          collection(doc(db, "users", selectedUser.id), "connections"),
          user.uid
        ),
        "messages"
      );

      await addDoc(messagesReceiverRef, {
        sender: usersRef.data().username,

        text: newMessage,
        timestamp: new Date(),
      });
      //setMessages([...messages, newMessage]);
      setNewMessage("");
    } catch (err) {
      console.error("Error adding message:", err);
    }
  };
  useEffect(() => {
    if (!selectedUser) {
      setIsLoadingc(false);
      return;
    }
    //
    // // console.log("Message user selected:", selectedUser.data());
    //// console.log(isLoadingc);
    async function fetchData() {
      const messagesRef = collection(
        doc(
          collection(doc(db, "users", user.uid), "connections"),
          selectedUser.id
        ),
        "messages"
      );
      const messages_update = [];
      let subs = await onSnapshot(messagesRef, async (snapshot) => {
        setIsLoadingc(true);
        // querySnapshot.forEach((doc) => {
        //   messages_update.push({
        //     id: doc.id,
        //     ...doc.data(),
        //   });
        //     //console.log(doc);
        //     setMessages(() => [...messages, {id:doc.id,...doc.data()}]);
        // });

        await snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            messages_update.push({
              id: change.doc.id,
              ...change.doc.data(),
            });
            let obj = {
              id: change.doc.id,
              ...change.doc.data(),
            };
            // setMessages( ...messages,obj);
            // console.log("New message added:", change.doc.data(), messages);
            setForce(!force);
          }
        });
        messages_update.sort(function (x, y) {
          return x.timestamp - y.timestamp;
        });
        const newArr = [...messages_update];

        setMessages(() => newArr);

        setIsLoadingc(false);
        messages_update.size = 0;
      });

      return messages_update;
    }
    //   .orderBy("timestamp", "desc");

    // const unsubscribe = messagesRef.onSnapshot((snapshot) => {
    //   const newMessages = snapshot.docs.map((doc) => ({
    //     id: doc.id,
    //     ...doc.data(),
    //   }));
    //   setMessages(newMessages);
    // });
    fetchData().then((messages_update) => {
      //// console.log("shivam", messages_update);
      //setMessages(messages_update)
      //// console.log("shivam message", messages);
    });
    // return unsubscribe;
  }, [selectedUser]);

  function handleNewMessageSubmit(event) {
    event.preventDefault();
    if (!newMessage) return;

    const chatId = getChatId(selectedUser.id);

    db.collection("chats").doc(chatId).collection("messages").add({
      content: newMessage,
      username: selectedUser.username,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    });

    setNewMessage("");
  }

  function getChatId(userId) {
    const currentUserId = firebase.auth().currentUser.uid;
    return userId < currentUserId
      ? `${userId}-${currentUserId}`
      : `${currentUserId}-${userId}`;
  }

  return (
    <div className="h-full flex flex-col p-0 ">
      <div
        className={`${
          isLoadingc ? "block" : "hidden"
        } absolute top-0 left-0 w-screen h-screen bg-white opacity-75 z-50 flex items-center justify-center`}
      >
        <div className="spinner text-blue-600">
          <ClockIcon className="animate-spin h-6 w-6 text-current" />
        </div>
      </div>
      <div
        className="flex-1 overflow-y-auto p-1 sm:p-4 md:text-xl"
        ref={messageListRef}
      >
        {messages.length > 0 ? (
          messages.map((message) => (
            <div
              key={x++}
              className={`flex ${
                message.sender === selectedUser?.data().username
                  ? "justify-start"
                  : "justify-end"
              }`}
            >
              <div
                className={`bg-gray-200 break-all  p-2 rounded-lg m-1 sm:m-3 ${
                  message.sender === selectedUser?.data().username
                    ? "mr-4 bg-red-50"
                    : "ml-4 bg-emerald-50"
                }`}
              >
                <p className="font-semibold">{message.sender}</p>
                <p className=" ">{message.text}</p>
                <p className="text-sm  text-gray-600">
                  {message.timestamp?.toDate().toLocaleString("en-US", {
                    hour: "numeric",
                    minute: "numeric",
                    hour12: true,
                  })}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center">
            {selectedUser ? "No messages yet" : "Select a user to chat"}.
          </p>
        )}
      </div>
      {selectedUser ? (
        <></>
      ) : (
        <p className="text-center absolute top-20 left-[40%] text-2xl">Select a user to chat.</p>
      )}
      <div className="  bg-gray-200  sm:scale-100">
        <form
          id="formchat"
          onSubmit={handleNewMessageSubmit}
          className="h-16 p-2 flex items-center sm:scale-100 justify-center px-4"
        >
          <input
            type="text"
            className="flex-1  rounded-full px-4 py-2 mr-4"
            placeholder={`Message ${ selectedUser? selectedUser.data().username:"..."}`}
            value={newMessage}
            onChange={(event) => setNewMessage(event.target.value)}
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-md"
            onClick={(e) => addMessage(e)}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChatWindow;
