import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import { ClockIcon } from "@heroicons/react/outline";
import {
  doc,
  getDoc,
  getDocs,
  collection,
  addDoc,
  setDoc,
  onSnapshot,
} from "firebase/firestore";
const myMap = new Map();
function ChatList({ selectedUser, onSelectUser, user }) {
  //console.log("ChatList")
  const [force, setForce] = useState(false);
  const [connectionList, setConnectionList] = useState([]);
  const [usersList, setUsersList] = useState([]);

  const [isLoadingc, setIsLoadingc] = useState(true);
  const forceUpdate = () => {
    setForce(!force);
  };

  const addUser = async () => {
    getDocs(collection(db, "users"))
      .then((querySnapshot) => {
        let datau = [];
        querySnapshot.forEach((doc) => {
          //console.log(myMap,doc.id);
          if (myMap.has(doc.id)) {
          } else {
            datau.push(doc);
          }

          //setUsersList(()=>[...usersList, doc]);
          //console.log(usersList);
        });
        return datau;
        //  setUsersList(()=>querySnapshot);
      })
      .then((datau) => {
        setUsersList(() => datau);
      })
      .catch((err) => {
        console.log(err);
      });
    setForce(true);
  };
  const setUser = async (selected) => {
    let currentUser = await setDoc(
      doc(collection(doc(db, "users", user.uid), "connections"), selected.id),
      {
        username: selected.data().username,
        id: selected.id,
        avatar: selected.data().avatar,
      }
    );
    let userRef = await getDoc(doc(db, "users", user.uid));
    let selectedUser = await setDoc(
      doc(collection(doc(db, "users", selected.id), "connections"), user.uid),
      {
        username: userRef.data().username,
        id: user.uid,
        avatar: userRef.data().avatar,
      }
    );
    myMap.set(selected.id, selected);
    //setConnectionList([...connectionList, selected]);
    // console.log("done");

    setForce(false);
    onSelectUser(selected);
  };
  useEffect(() => {
    async function fetchData() {
      //console.log(user)
      let useRef = await getDoc(doc(db, "users", user.uid));
      myMap.set(useRef.id, useRef);

      let usersRef = await getDocs(
        collection(doc(db, "users", user.uid), "connections")
      );
      const querySnapshot = collection(
        doc(db, "users", user.uid),
        "connections"
      );

      // Loop through the documents
      let datau = [];
      let subs = await onSnapshot(querySnapshot, async (snapshot) => {
        await snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            //  querySnapshot.forEach(async (change.doc) => {
            //  console.log("chnge", change.doc.id, " => ", change.doc.data());
            if (myMap.has(change.doc.id)) {
            } else datau.push(change.doc);
            myMap.set(change.doc.id, change.doc.data());
            //  setForce(!force);
            //setUsersList(()=>[...usersList, doc]);
            // console.log(usersList )
            //setConnectionList(()=>[...connectionList,doc])
          }
        });
        const newArr = [...datau];
        setConnectionList(() => newArr);
        setIsLoadingc(false);
        datau.size = 0;
      });
    }
    fetchData();
    return () => {};
  }, []);

  return (
    <div className=" relative  h-full">
      <div
        className={`${
          isLoadingc ? "block" : "hidden"
        } absolute top-0 left-0 w-full h-screen bg-white opacity-75 z-50 flex items-center justify-center`}
      >
        <div className="spinner text-blue-600">
          <ClockIcon className="animate-spin h-6 w-6 text-current" />
        </div>
      </div>
      {connectionList.length > 0 ? (
        <ul className="p-1 overflow-y-auto max-h-[75%] py-2">
          {connectionList.map((connect) => (
            <li
              key={connect.id}
              className={`flex items-center p-2 py-2 m-2 rounded-md cursor-pointer ${
                selectedUser?.id === connect.id
                  ? "bg-slate-400"
                  : " bg-gray-300"
              }`}
              onClick={() => onSelectUser(connect)}
            >
              <div className="h-8 w-8 flex justify-center  items-center rounded-full">
                <img className="rounded-full" src={connect.data().avatar} />
              </div>
              <span className="ml-4 overflow-auto font-semibold">
                {connect.data().username}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="p-4">No users available.</p>
      )}
      <div
        onClick={addUser}
        className="absolute flex-1 bottom-1 bg-slate-500 cursor-pointer hover:bg-cyan-700 w-full p-2 h-15 text-3xl text-blue-300"
      >
        <button
          type="button"
          data-modal-target="crypto-modal"
          data-modal-toggle="crypto-modal"
          className="text-gray-900 hover:text-red-300 border border-gray-200  focus:outline-none focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2 text-center inline-flex items-center dark:focus:ring-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700"
        >
          +
        </button>
      </div>
      <>
        {/* Main modal */}
        <div
          id="crypto-modal"
          tabIndex={-1}
          aria-hidden="true"
          style={{ display: force ? "flex" : "none" }}
          className="fixed top-0 left-0 right-0 z-50 flex justify-center items-center w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full"
        >
          <div className="relative  w-full max-w-md max-h-full">
            {/* Modal content */}
            <div className="relative   bg-white rounded-lg shadow dark:bg-gray-700">
              <button
                type="button"
                className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-800 dark:hover:text-white"
                data-modal-hide="crypto-modal"
                onClick={forceUpdate}
              >
                <svg
                  aria-hidden="true"
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="sr-only">Close modal</span>
              </button>
              {/* Modal header */}
              <div className="px-6 py-4 border-b rounded-t dark:border-gray-600">
                <h3 className="text-base font-semibold text-gray-900 lg:text-xl dark:text-white">
                  Connect With These Users
                </h3>
              </div>
              {/* Modal body */}
              <div className="p-6 h-[50vh]  overflow-auto">
                <ul className="my-4 space-y-3">
                  {usersList.map((user) => (
                    <li
                      key={user.id}
                      className={`flex items-center p-2 m-2  hover:bg-cyan-700 rounded-md cursor-pointer ${
                        selectedUser?.id === user.id
                          ? "bg-gray-300"
                          : " bg-slate-400"
                      }`}
                      onClick={() => setUser(user)}
                    >
                      <div className="h-8 w-8 flex justify-center  items-center rounded-full">
                        <img
                          className="rounded-full"
                          src={user.data().avatar}
                        />
                      </div>
                      <span className="ml-4 overflow-auto font-semibold">
                        {user.data().username}
                      </span>
                    </li>
                  ))}
                </ul>
                <div></div>
                <a
                  href="#"
                  className="inline-flex items-center text-xs font-normal text-gray-500 hover:underline dark:text-gray-400"
                >
                  <svg
                    aria-hidden="true"
                    className="w-3 h-3 mr-2"
                    focusable="false"
                    data-prefix="far"
                    data-icon="question-circle"
                    role="img"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 512 512"
                  >
                    <path
                      fill="currentColor"
                      d="M256 8C119.043 8 8 119.083 8 256c0 136.997 111.043 248 248 248s248-111.003 248-248C504 119.083 392.957 8 256 8zm0 448c-110.532 0-200-89.431-200-200 0-110.495 89.472-200 200-200 110.491 0 200 89.471 200 200 0 110.53-89.431 200-200 200zm107.244-255.2c0 67.052-72.421 68.084-72.421 92.863V300c0 6.627-5.373 12-12 12h-45.647c-6.627 0-12-5.373-12-12v-8.659c0-35.745 27.1-50.034 47.579-61.516 17.561-9.845 28.324-16.541 28.324-29.579 0-17.246-21.999-28.693-39.784-28.693-23.189 0-33.894 10.977-48.942 29.969-4.057 5.12-11.46 6.071-16.666 2.124l-27.824-21.098c-5.107-3.872-6.251-11.066-2.644-16.363C184.846 131.491 214.94 112 261.794 112c49.071 0 101.45 38.304 101.45 88.8zM298 368c0 23.159-18.841 42-42 42s-42-18.841-42-42 18.841-42 42-42 42 18.841 42 42z"
                    />
                  </svg>
                  {/* Why do I need to connect with my wallet? */}
                </a>
              </div>
            </div>
          </div>
        </div>
      </>
    </div>
  );
}

export default ChatList;
