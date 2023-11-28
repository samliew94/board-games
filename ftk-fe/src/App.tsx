import { useEffect, useState } from "react";
import "./App.css";
import Game from "./Game";

export default function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState("");

  function onChanged(event: any) {
    setUsername('P'+event.target.value.toUpperCase());
  }

  function onKeyDowned(event: any) {
    if (event.key === "Enter") {
      document.getElementById("loginButton")?.click();
    }
  }

  async function login() {
    if (!username) return;
    setAuthenticated(true);
  }

  useEffect(() => {}, []);

  return (
    <>
      {authenticated ? (
        <Game username={username} />
      ) : (
        <>
          <div className="flex flex-col justify-center items-center h-screen gap-1">
            <div className="text-lg">Login</div>
            <input
              onKeyDown={onKeyDowned}
              onChange={onChanged}
              value={username}
              className="border rounded-md py-2 px-4 text-center text-4xl"
            ></input>
            <button
              id="loginButton"
              onClick={login}
              className="text-lg rounded-md bg-blue-500 active:bg-blue-800 py-2 px-4 text-white"
            >
              Login
            </button>
          </div>
        </>
      )}
    </>
  );
}
