import { FaArrowAltCircleDown, FaArrowAltCircleUp } from "react-icons/fa";
import { GiBootKick, GiImperialCrown } from "react-icons/gi";


interface Props {
  socket: any;
  data: {
    host: boolean;
    start: boolean;
    min: number;
    users: { username: string; isHost: boolean }[];
  };
}

export default function Lobby({ socket, data }: Props) {
  const { host, start, min, users } = data;

  function startGame() {
    if (!host) return;
    socket.emit("start-game", {});
  }

  function leaveGame() {
    socket.emit("leave-game", {});
  }

  function kick(username: string) {
    if (!host) return;
    socket.emit("kick", { username });
  }

  function move(username: string, up: boolean) {
    if (!host) return;
    socket.emit("move", { username, up });
  }

  function createIcon(icon: any, optProperties?: string) {
    return (
      <>
        <div
          className={`text-2xl flex justify-center items-center ${optProperties}`}
        >
          {icon}
        </div>
      </>
    );
  }

  function showKick(idx:number, username:string){

    if (host){

      if (idx === 0){
        return <div></div>
      }

      return <button onClick={()=>kick(username)}>
        {createIcon(<GiBootKick/>, "text-red-500")}
      </button>
    }

    return <div></div>
  }

  function showUpDown(idx:number, total:number, username:string, up:boolean){
    if (host){

      if (up){

        if (idx === 0) return <div></div>

        return <button onClick={()=>move(username,up)}>
          {createIcon(<FaArrowAltCircleUp/>, "text-green-500")}
        </button>
      } else{

        if (idx === total-1) return <div></div>

        return <button onClick={()=>move(username,up)}>
          {createIcon(<FaArrowAltCircleDown/>, "text-orange-500")}
        </button>
      }
    }

    return <div></div>
  }

  return (
    <>
      <div className="flex flex-col justify-center items-center gap-1 h-screen">
        <button
          onClick={leaveGame}
          className="text-white bg-red-500 active:bg-red-800 rounded-md py-2 px-4"
        >
          Leave Lobby
        </button>
        <div className="grid grid-cols-5 border border-black rounded-md p-2 gap-1">
          {users.map(({ username, isHost }, idx) => {
            const total = users.length;
            return (
              <>
                <div className="text-2xl">
                  {idx + 1}. {username}
                </div>
                {isHost ? (
                  createIcon(<GiImperialCrown />, "text-yellow-300")
                ) : (
                  <div></div>
                )}
                {showKick(idx, username)}
                {showUpDown(idx, total, username,true)}
                {showUpDown(idx, total, username,false)}
              </>
            );
          })}
        </div>

        {start ? (
          host ? (
            <button
              onClick={startGame}
              className="rounded-md text-2xl bg-blue-500 active:bg-blue-800 py-2 px-4 border text-white"
            >
              START
            </button>
          ) : (
            <div>Waiting for Host to start...</div>
          )
        ) : (
          <div className="italic">
            Need <span className="font-bold">{min - users.length}</span> more
            players
          </div>
        )}
      </div>
    </>
  );
}
