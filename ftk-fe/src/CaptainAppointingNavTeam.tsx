import {
  GiAlliedStar,
  GiCaptainHatProfile,
  GiShipWheel,
  GiTombstone,
} from "react-icons/gi";

import { GoNoEntry } from "react-icons/go";
import { Socket } from "socket.io-client";
import WorldMap, { WorldMapProps } from "./WorldMap";

interface Props {
  socket: Socket;
  data: {
    worldMap: WorldMapProps;
    usernames: string[];
    captain: number;
    liutenant: number;
    navigator: number;
    offDuty: number;
    dead: number;
    isCaptain: boolean;
  };
}

export default function CaptainAppointingNavTeam({ socket, data }: Props) {
  const {
    isCaptain,
    worldMap,
    usernames,
    captain,
    liutenant,
    navigator,
    offDuty,
    dead,
  } = data;

  function loadMiniIcon(idx: number) {
    let tsx: React.ReactElement = <></>;

    if (idx === captain) {
      tsx = <GiCaptainHatProfile />;
    } else if (idx === liutenant) {
      tsx = <GiAlliedStar />;
    } else if (idx === navigator) {
      tsx = <GiShipWheel />;
    } else if (idx === dead) {
      tsx = <GiTombstone />;
    } else if (idx === offDuty) {
      tsx = <GoNoEntry />;
    }

    return (
      <div className="flex flex-col justify-center items-center pt-1.5">
        {tsx}
      </div>
    );
  }

  function dropdownUsernames() {
    function bgColorbyRole(idx: number) {
      if (idx === captain) {
        return "bg-green-600";
      } else if (idx === liutenant) {
        return "bg-orange-600";
      } else if (idx === navigator) {
        return "bg-red-600";
      }

      return "bg-neutral-500";
    }

    return (
      <>
        <div className="flex flex-col justify-center items-center m-1">
          <div className="grid grid-cols-1 text-2xl p-1">
            {usernames.map((username, idx) => {
              return (
                <>
                  <button
                    onClick={() => {
                      if (isCaptain) socket.emit("captain-chose", { targetIdx:idx });
                    }}
                    className={`${bgColorbyRole(idx)}
                     grid grid-cols-5 m-1 py-2 px-4 rounded-md text-white`}
                  >
                    <div className="col-span-1">{idx + 1}. </div>
                    <div className="col-span-3">{username}</div>
                    <div className="col-span-1">{loadMiniIcon(idx)}</div>
                  </button>
                </>
              );
            })}
          </div>
        </div>
      </>
    );
  }

  function btnTrustThisTeam() {
    if (!isCaptain) return null;
    if (captain === undefined || liutenant === undefined || navigator === undefined) return null;

    return (
      <button
        onClick={() => {
          socket.emit("i-trust-this-team", {});
        }}
        className="m-1 py-2 px-4 rounded-md bg-green-500 active:bg-green-800 text-white text-2xl"
      >
        I Trust This Team
      </button>
    );
  }

  return (
    <>
      <div>
        <WorldMap {...worldMap} />
        <div className="flex flex-col items-center justify-center">
          <div className="text-2xl italic">
            2/6. Captain is appointing Nav Team:
          </div>
          {dropdownUsernames()}
          {btnTrustThisTeam()}
        </div>
      </div>
    </>
  );

}
