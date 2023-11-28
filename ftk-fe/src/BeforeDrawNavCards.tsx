import { Socket } from "socket.io-client";
import ActivatableCharacterAbility from "./ActivatableCharacterAbility";
import WorldMap, { WorldMapProps } from "./WorldMap";

interface Props {
  socket: Socket;
  data: {
    meHost: boolean;
    worldMap: WorldMapProps;
    captain: number;
    liutenant: number;
    navigator: number;
    usernames: string[];
    character: string;
  };
}

export default function BeforeDrawNavCards({ socket, data }: Props) {
  const {
    meHost,
    worldMap,
    usernames,
    captain,
    liutenant,
    navigator,
    character,
  } = data;

  function capLiuNav() {
    return (
      <>
        <div className="grid grid-cols-2 border border-neutral-500 p-1 rounded-md text-2xl gap-1">
          <div>Captain</div>
          <div className="font-bold">{usernames[captain]}</div>
          <div>Lieutenant</div>
          <div className="font-bold">{usernames[liutenant]}</div>
          <div>Navigator</div>
          <div className="font-bold">{usernames[navigator]}</div>
        </div>
      </>
    );
  }
  
  function btnNext() {
    if (!meHost) {
      return null;
    }

    return (
      <button
        onClick={() => {
          if (!meHost) {
            return;
          }
          socket.emit("draw-nav-cards", {});
        }}
        className="py-2 px-4 rounded-md text-lg bg-blue-500 active:bg-blue-800 text-white"
      >
        Next
      </button>
    );
  }

  return (
    <>
      <div>
        <WorldMap {...worldMap} />
        <div className="flex flex-col items-center justify-center gap-1 mb-10">
          <div className="text-2xl italic">
            7/X. Before Draw Navigation Cards:
          </div>
          {capLiuNav()}
          {btnNext()}
          <ActivatableCharacterAbility socket={socket} character={character} />
        </div>
      </div>
    </>
  );
}
