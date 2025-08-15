import React, { useEffect, useState, useCallback, useMemo } from "react";
import { db } from "./firebase";
import { ClockIcon, UserAddIcon, XIcon } from "@heroicons/react/outline";
import {
  doc,
  getDoc,
  getDocs,
  collection,
  setDoc,
  onSnapshot,
} from "firebase/firestore";


function ChatList({ selectedUser, onSelectUser, user }) {
const myMap = new Map();

  const [force, setForce] = useState(false);
  const [connectionList, setConnectionList] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const forceUpdate = () => setForce((prev) => !prev);

  const addUser = useCallback(async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const datau = querySnapshot.docs.filter((doc) => !myMap.has(doc.id));
      setUsersList(datau);
      setForce(true);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const setUser = useCallback(
    async (selected) => {
      try {
        const currentUserRef = doc(
          collection(doc(db, "users", user.uid), "connections"),
          selected.id
        );
        const selectedUserRef = doc(
          collection(doc(db, "users", selected.id), "connections"),
          user.uid
        );

        const userRefData = await getDoc(doc(db, "users", user.uid));

        await Promise.all([
          setDoc(currentUserRef, {
            username: selected.data().username,
            id: selected.id,
            avatar: selected.data().avatar,
          }),
          setDoc(selectedUserRef, {
            username: userRefData.data().username,
            id: user.uid,
            avatar: userRefData.data().avatar,
          }),
        ]);

        myMap.set(selected.id, selected);
        setForce(false);
        onSelectUser(selected);
      } catch (err) {
        console.error(err);
      }
    },
    [user.uid, onSelectUser]
  );

  useEffect(() => {
    const fetchData = async () => {
      const userRef = await getDoc(doc(db, "users", user.uid));
      myMap.set(userRef.id, userRef);

      const querySnapshot = collection(
        doc(db, "users", user.uid),
        "connections"
      );

      onSnapshot(querySnapshot, (snapshot) => {
        const newConnections = snapshot
          .docChanges()
          .filter(
            (change) => change.type === "added" && !myMap.has(change.doc.id)
          )
          .map((change) => {
            myMap.set(change.doc.id, change.doc.data());
            return change.doc;
          });

        if (newConnections.length > 0) {
          setConnectionList((prev) => [...prev, ...newConnections]);
        }
        setIsLoading(false);
      });
    };
    fetchData();
  }, [user.uid]);

  const renderedConnections = useMemo(
    () =>
      connectionList.map((connect) => (
        <li
          key={connect.id}
          className={`flex items-center p-3 rounded-xl shadow-lg border border-transparent backdrop-blur-md transition-all duration-300 cursor-pointer ${
            selectedUser?.id === connect.id
              ? "bg-gradient-to-r from-green-500 to-green-700 shadow-green-500/40 scale-[1.02]"
              : "bg-gray-700/60 hover:bg-gray-600/70 hover:scale-[1.02] hover:shadow-md"
          }`}
          onClick={() => onSelectUser(connect)}
        >
          <img
            className="h-10 w-10 rounded-full object-cover border-2 border-white/20 shadow-md"
            src={connect.data().avatar || "/default-avatar.png"}
            alt="Avatar"
          />
          <span className="ml-4 font-semibold text-white truncate">
            {connect.data().username}
          </span>
        </li>
      )),
    [connectionList, selectedUser, onSelectUser]
  );

  return (
    <div className="relative h-full bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 p-4 rounded-xs shadow-2xl border border-gray-700">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
          <ClockIcon className="animate-spin h-8 w-8 text-blue-400" />
        </div>
      )}

      {connectionList.length > 0 ? (
        <ul className="space-y-3 overflow-y-auto max-h-[70vh] pr-2 custom-scrollbar">
          {renderedConnections}
        </ul>
      ) : (
        <div className="text-center text-gray-400 py-8">
          <UserAddIcon className="mx-auto h-14 w-14 text-gray-500" />
          <p className="mt-2 text-sm">No users connected yet.</p>
        </div>
      )}

      <div className="mt-4">
        <button
          onClick={addUser}
          className="w-full py-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold shadow-md hover:from-indigo-500 hover:to-blue-600 transition-all"
        >
          + Connect
        </button>
      </div>

      {force && (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/60 p-4 animate-fadeIn">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform scale-95 animate-scaleIn">
            <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Connect With Users
              </h3>
              <button
                onClick={forceUpdate}
                className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <XIcon className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="p-4 max-h-[50vh] overflow-auto custom-scrollbar">
              {usersList.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-gray-800 cursor-pointer transition-all"
                  onClick={() => setUser(u)}
                >
                  <img
                    src={u.data().avatar || "/default-avatar.png"}
                    className="h-8 w-8 rounded-full object-cover border border-gray-400"
                  />
                  <span className="ml-3 font-medium text-gray-900 dark:text-white">
                    {u.data().username}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 3px;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes scaleIn {
          from {
            transform: scale(0.9);
          }
          to {
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}

export default ChatList;
