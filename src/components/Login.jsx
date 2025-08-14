import { useState} from "react";
import "./Login.css";
import { app, db } from "./firebase.js";
import { doc, setDoc } from "firebase/firestore";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";

const auth = getAuth();

export default function Login({ logC }) {
  const [name, setName] = useState("");
  const [pass, setPass] = useState("");
  const [mail, setMail] = useState("");
  const [fname, setFname] = useState("");
  const [isSignup, setIsSignup] = useState(false);

  function handleLogin(e) {
    e.preventDefault();
    signInWithEmailAndPassword(auth, name + "@email.com", pass)
      .then((userCredential) => {
        const user = userCredential.user;
        localStorage.setItem("R1isLog", true);
        localStorage.setItem("R1user", name);
        localStorage.setItem("R1pass", pass);
        logC(true, user);
      })
      .catch(() => {
        alert("Invalid credentials, please try again.");
      });
  }

  function handleSignup(e) {
    e.preventDefault();
    createUserWithEmailAndPassword(auth, name + "@email.com", pass)
      .then((userCredential) => {
        const user = userCredential.user;
        const avatar =
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSWSr0yXrqZ94BH71-zg845mRN3LfK3Rx2sxH-9nX3jk_vHShYlgeFuDYJ5&s=10";
        setDoc(doc(db, "users", user.uid), {
          username: name,
          mail,
          fullName: fname,
          password: pass,
          status: 1,
          avatar,
          about: "Hii!",
        });
        localStorage.setItem("R1isLog", true);
        localStorage.setItem("R1user", name);
        localStorage.setItem("R1pass", pass);
        logC(true, user);
      })
      .catch(() => {
        alert("User already exists, please choose another username.");
      });
  }

  return (
    <div className="login-page">
    <div className="login-container">
      <div className="welcome-text">
        <h1>Welcome to the App</h1>
        <p>Your secure chatting platform</p>
      </div>

      <div className="form-card glass">
        <h2>{isSignup ? "Create Account" : "Sign In"}</h2>
        <form onSubmit={isSignup ? handleSignup : handleLogin}>
          <input
            type="text"
            placeholder="Username"
            value={name}
            onChange={(e) =>
              setName(e.target.value.replace(/[@.\s]/g, "").toLowerCase())
            }
            required
          />
          {isSignup && (
            <input
              type="text"
              placeholder="Full Name"
              value={fname}
              onChange={(e) => setFname(e.target.value)}
              required
            />
          )}
          <input
            type="password"
            placeholder="Password"
            value={pass}
            onChange={(e) => setPass(e.target.value.trim())}
            minLength={8}
            required
          />
          {isSignup && (
            <input
              type="email"
              placeholder="Email"
              value={mail}
              onChange={(e) => setMail(e.target.value)}
              required
            />
          )}
          <button type="submit">{isSignup ? "Sign Up" : "Login"}</button>
        </form>
        <p className="toggle-text">
          {isSignup
            ? "Already have an account?"
            : "Don't have an account yet?"}{" "}
          <span onClick={() => setIsSignup(!isSignup)}>
            {isSignup ? "Sign In" : "Sign Up"}
          </span>
        </p>
      </div>
    </div>
    </div>
  );
}
