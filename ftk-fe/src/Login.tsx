import axios from "axios";
import { useEffect, useState } from "react";

export default function Login() {
  const [username, setUsername] = useState("");

  async function me() {
    const res = await axios.get("http://localhost:4444/me");
    setUsername(res.data.username);
  }

  async function login() {}

  useEffect(() => {
    me();
  }, []);

  return (
    <>
      <div className="flex flex-col justify-center items-center h-screen">
        <input value={username}></input>
        <button className="rounded-md py-2 px-4 bg-blue-500 active:bg-blue-800">
          Login
        </button>
      </div>
    </>
  );
}
