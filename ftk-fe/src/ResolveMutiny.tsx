import { FaThumbsDown } from "react-icons/fa";
import { Socket } from "socket.io-client";
import WorldMap, { WorldMapProps } from "./WorldMap";

interface Props {
  socket: Socket;
  data: {
    worldMap: WorldMapProps;
    usernames: string[];
    picker: number;
    mePicker: boolean;
    candidates: number[];
  };
}

export default function ResolveMutiny({ socket, data }: Props) {
  const { worldMap, usernames, picker, mePicker, candidates } = data;

  function drawCandidates() {
    return (
      <div className="grid grid-cols-2 border border-black rounded-md p-1 gap-1 text-2xl">
        {Array.from(candidates).map((candidate, idx) => {
          return (
            <>
              <div>{usernames[candidate]}</div>
              <button
                className="text-red-500 "
                onClick={() => {
                  socket.emit("hands-down", { target: candidate });
                }}
              >
                <FaThumbsDown />
              </button>
            </>
          );
        })}
      </div>
    );
  }

  return (
    <>
      <div>
        <WorldMap {...worldMap} />
        <div className="flex flex-col items-center justify-center gap-1 mb-10">
          <div className="text-2xl italic">6/6. Resolve Mutiny:</div>
          <div className="italic">There can only be one captain</div>
          <div className="text-lg">
            "Winner": <span className="font-bold">{usernames[picker]}</span>
          </div>
          {drawCandidates()}
        </div>
      </div>
    </>
  );
}
