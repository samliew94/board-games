import axios from "axios";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import AfterCaptainAppointedNavTeam from "./AfterCaptainAppointedNavTeam";
import AfterRevealGuns from "./AfterRevealGuns";
import BeforeCaptainAppointsNavTeam from "./BeforeCaptainAppointsNavTeam";
import BeforeDrawNavCards from "./BeforeDrawNavCards";
import CaptainAppointingNavTeam from "./CaptainAppointingNavTeam";
import GameList from "./GameList";
import Identity from "./Identity";
import Loading from "./Loading";
import Lobby from "./Lobby";
import QuestionOfLoyalty from "./QuestionOfLoyalty";
import ResolveMutiny from "./ResolveMutiny";
import Settings from "./Settings";

interface Props {
  username: string;
}

export default function Game({ username: u }: Props) {
  const [wsConnected, setWsConnected] = useState(false);
  const [curData, setCurData] = useState("");
  const [tsx, setTsx] = useState(<Loading />);

  async function initWebsocket() {
    let username = "";

    try {
      const res = await axios.get("http://localhost:3000/me", {
        withCredentials: true,
      });
      console.log(res.data);
      username = res.data.username;
      console.log(`username: ${username}`);
    } catch (error) {
      username = u;
    }

    const socket = io("http://localhost:3000", {
      auth: {
        username,
      },
    });

    socket.on("games", (data: any) => {
      setTsx(<GameList socket={socket} data={data} />);
    });

    socket.on("lobby", (data: any) => {
      setTsx(<Lobby socket={socket} data={data} />);
    });

    socket.on("settings", (data: any) => {
      setTsx(<Settings socket={socket} data={data} />);
    });

    socket.on("identity", (data: any) => {
      setTsx(<Identity socket={socket} data={data} />);
    });

    socket.on("beforeCaptainAppointsNavTeam", (data:any) => {
      setTsx(<BeforeCaptainAppointsNavTeam socket={socket} data={data}/>)
    })

    socket.on("captain-appointing-nav-team", (data:any) => {
      setTsx(<CaptainAppointingNavTeam socket={socket} data={data}/>)
    })

    socket.on("after-captain-appointed-nav-team", (data:any) => {
      setTsx(<AfterCaptainAppointedNavTeam socket={socket} data={data}/>)
    })

    socket.on("question-of-loyalty", (data:any) => {
      setTsx(<QuestionOfLoyalty socket={socket} data={data}/>)
    })

    socket.on("after-reveal-guns", (data:any) => {
      setTsx(<AfterRevealGuns socket={socket} data={data}/>)
    })

    socket.on("resolve-mutiny", (data:any) => {
      setTsx(<ResolveMutiny socket={socket} data={data}/>)
    })

    socket.on("before-draw-nav-cards", (data:any) => {
      setTsx(<BeforeDrawNavCards socket={socket} data={data}/>)
    })
    
  }

  useEffect(() => {
    initWebsocket();
  }, []);

  return tsx;
}
