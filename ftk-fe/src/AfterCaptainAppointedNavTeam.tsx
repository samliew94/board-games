import { Socket } from "socket.io-client";
import ActivatableCharacterAbility from "./ActivatableCharacterAbility";
import WorldMap, { WorldMapProps } from "./WorldMap";

interface Props {
  socket: Socket;
  data: {
    host: boolean;
    captain:string;
    liutenant:string;
    navigator:string;
    worldMap: WorldMapProps;
    character?: string;
  };
}

export default function AfterCaptainAppointedNavTeam({ socket, data }: Props) {
  const { worldMap, host, captain, liutenant, navigator, character } = data;

  return (
    <>
      <div>
        <WorldMap {...worldMap} />
        <div className="flex flex-col items-center justify-center gap-1 mb-4">
          <div className="text-2xl italic">
            3/6. After Captain Appointed Nav Team:
          </div>
          <div className="grid grid-cols-2 border border-neutral-500 p-1 rounded-md text-2xl gap-1">
            <div>Captain</div>
            <div className="font-bold">{captain}</div>
            <div>Lieutenant</div>
            <div className="font-bold">{liutenant}</div>
            <div>Navigator</div>
            <div className="font-bold">{navigator}</div>
          </div>
          {!host ? null : (
            <button
              onClick={() => {
                if (!host) return;
                socket.emit("question-of-loyalty");
              }}
              className="py-2 px-4 rounded-md bg-blue-500 active:bg-blue-800 text-white"
            >
              Next
            </button>
          )}
        </div>

        {!character ? null : (
          <ActivatableCharacterAbility socket={socket} character={character} />
        )}
      </div>
    </>
  );
}
