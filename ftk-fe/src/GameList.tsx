interface Props {
  socket: any;
  data: Data[];
}

export type Data = {
  room: string;
  host: string;
  total: number;
  max: number;
};

export default function MainMenu({ socket, data }: Props) {
  function joinGame(room: string) {
    socket.emit("join-game", { room });
  }

  function createGame() {
    socket.emit("create-game", {});
  }

  return (
    <>
      <div className="flex flex-col justify-center items-center h-screen gap-1">
        <div className="text-4xl ">Feed The Kraken</div>
        {data.length === 0 ? (
          <div className="text-lg">No Lobbies Available</div>
        ) : (
          <>
            <div className="text-lg italic">Tap to Join Game</div>
            <div className="overflow-auto grid grid-cols-1">
              {data.map((d) => {
                return (
                  <button
                    key={d.room}
                    onClick={() => joinGame(d.room)}
                    className="

              bg-green-700 active:bg-green-800 text-white
              border py-2 px-4 rounded"
                  >
                    <div className="text-left italic ">ID: {d.room}</div>
                    <div className="text-right text-2xl">Host: {d.host}</div>
                    <div className="text-right italic text-2xl">
                      {d.total}/{d.max}
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}

        <button
          onClick={createGame}
          className="
        m-1
        text-white py-2 px-4 rounded
        text-4xl bg-blue-500 active:bg-blue-800"
        >
          Create Game
        </button>
      </div>
    </>
  );
}
