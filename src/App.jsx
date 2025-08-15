import { useState, useEffect } from "react";
import "./App.css";
import { getAuth, signInWithEmailAndPassword,signOut } from "firebase/auth";
import Login from "./components/Login.jsx";
import Home from "./components/Home.jsx";
import { ClockIcon } from "@heroicons/react/outline";
function App() {
  const [islog, setLog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(false);
  function LogC(value, user) {
    if (value === true) {
    } else {
      localStorage.removeItem("R1isLog");
      localStorage.removeItem("R1user");
      localStorage.removeItem("R1pass");
      const auth=getAuth();
      signOut(auth).then(() => {
        // Sign-out successful.
        window.location.reload();
      }).catch((error) => {
        // An error happened.
      });
    }

    setLog(value);
    setUser(user);
  }
  useEffect(() => {
    //localStorage.removeItem("R1isLog");
    let lsg = localStorage.getItem("R1isLog");
    //alert(lsg)
    if (lsg) {
      async function login() {
        console.log("Login");
        // alert("hii")
        setIsLoading(true)
        let pass = localStorage.getItem("R1pass");
        let name = localStorage.getItem("R1user");
        const auth = getAuth();
        signInWithEmailAndPassword(auth, name + "@email.com", pass)
          .then((userCredential) => {
            // Signed in
            const user = userCredential.user;
            // console.log(user);
            localStorage.setItem("R1isLog", true);
            localStorage.setItem("R1user", name);
            localStorage.setItem("R1pass", pass);
            //alert("user")
            LogC(true, user);
            setUser(user);
            setIsLoading(false);
          })
          .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            alert("No such user exist ! Please check your email and password");
            console.error(errorCode, errorMessage);
          });
      }
      login().then(() => {
      
        //  setUser(user);
      });
    }
  }, []);

  return (
    <>
      <div
        className={`${
          isLoading ? "block" : "hidden"
        } absolute top-0 left-0 w-screen min-h-screen bg-white opacity-75 z-50 flex items-center justify-center`}
      >
        <div className="spinner text-blue-600">
          <ClockIcon className="animate-spin h-6 w-6 text-current" />
        </div>
      </div>
      <div className={`${!isLoading ? "block" : "hidden"} App  `}>
        {islog ? <Home user={user} logC={LogC} /> : <Login logC={LogC} />}
      </div>
    </>
  );
}

export default App;
