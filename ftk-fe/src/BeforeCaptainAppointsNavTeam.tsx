import { Socket } from "socket.io-client";
import ActivatableCharacterAbility from "./ActivatableCharacterAbility";
import WorldMap, { WorldMapProps } from "./WorldMap";

interface Props {
  socket: Socket;
  data: {
    host: boolean;
    captain: string;
    worldMap: WorldMapProps;
    character?: string;
  };
}

export default function BeforeCaptainAppointsNavTeam({ socket, data }: Props) {
  const { worldMap, host, captain, character } = data;

  return (
    <>
      <div>
        <WorldMap {...worldMap} />
        <div className="flex flex-col items-center justify-center">
          <div className="text-2xl italic">
            1/6. Before Captain Appoints Nav Team
          </div>
          <div className="text-lg">
            This Turn's Captain: <span className="font-bold">{captain}</span>
          </div>
          {!host ? null : (
            <button
              onClick={() => {
                if (!host) return;
                socket.emit("captain-appointing-nav-team");
              }}
              className="py-2 px-4 rounded-md bg-blue-500 active:bg-blue-800 text-white"
            >
              Next
            </button>
          )}
        </div>
        <ActivatableCharacterAbility socket={socket} character={character} />
      </div>
    </>
  );
}
