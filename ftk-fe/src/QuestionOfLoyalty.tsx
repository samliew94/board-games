import { useState } from "react";
import { FaMinusCircle, FaPlusCircle } from "react-icons/fa";
import { GiCheckMark, GiSawedOffShotgun } from "react-icons/gi";
import { Socket } from "socket.io-client";
import WorldMap, { WorldMapProps } from "./WorldMap";

interface Props {
  socket: Socket;
  data: {
    worldMap: WorldMapProps;
    captain: number;
    liutenant: number;
    navigator: number;
    minGuns: number;
    usernames: string[];
    guns: number[];
    gunsOnHand: number;
    dead: number;
    meDead: boolean;
    finalizedPointedGuns: boolean[];
    meFinalizedPointedGuns:boolean;
    meCaptain:boolean;
  };
}

export default function QuestionOfLoyalty({ socket, data }: Props) {
  const {
    worldMap,
    captain,
    liutenant,
    navigator,
    minGuns,
    usernames,
    guns,
    dead,
    meDead,
    finalizedPointedGuns,
    meFinalizedPointedGuns,
    meCaptain,
  } = data;

  const [selectedGuns, setSelectedGuns] = useState(
    Math.floor(Math.random() * 7) - 3
  );

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

  function loadGunsIcons(idx: number) {
    const totalGuns = guns[idx];

    const tsxes = [];
    for (let i = 0; i < 3; i++) {
      if (i + 1 > totalGuns) {
        tsxes.push(<div />);
      } else {
        tsxes.push(
          <div className="pt-1.5">
            <GiSawedOffShotgun />
          </div>
        );
      }
    }

    return (
      <div className="grid grid-cols-3">{Array.from(tsxes).map((x) => x)}</div>
    );
  }

  function loadLockedInIcon(idx: number) {
    if (finalizedPointedGuns[idx]) {
      return (
        <div className="pt-1.5 text-green-500">
          <GiCheckMark />
        </div>
      );
    } else {
      return <div></div>;
    }
  }

  function usernameToGuns() {
    return (
      <>
        <div className="border border-neutral-500 p-1 rounded-md text-2xl">
          {usernames.map((username, idx) => {
            return (
              <>
                <div className="grid grid-cols-3">
                  <div>{username}</div>
                  <div>{loadGunsIcons(idx)}</div>
                  <div>{loadLockedInIcon(idx)}</div>
                </div>
              </>
            );
          })}
        </div>
      </>
    );
  }

  function pointNumberOfGuns() {

    if (meDead || meCaptain || meFinalizedPointedGuns){
      return null;
    }

    function onPlusMinus(amt: number) {
      if (selectedGuns + amt >= -3 && selectedGuns + amt <= 3)
        setSelectedGuns(selectedGuns + amt);
    }

    return (
      <>
        <div className="grid grid-cols-3 text-2xl my-2">
          <button
            onClick={() => onPlusMinus(1)}
            className="pt-1.5 text-green-500 mx-2"
          >
            <FaPlusCircle />
          </button>
          <div className="text-center mx-2">{selectedGuns}</div>
          <button
            onClick={() => onPlusMinus(-1)}
            className="pt-1.5 text-red-500 mx-2"
          >
            <FaMinusCircle />
          </button>
        </div>
      </>
    );
  }

  function btnOk() {

    if (meFinalizedPointedGuns || meDead || meCaptain)
      return null;

    return (
      <button
        onClick={() => {
          if (selectedGuns >= 0) socket.emit("lock-in-guns", { selectedGuns });
        }}
        className="py-2 px-4 rounded-md text-lg bg-blue-500 active:bg-blue-800 text-white"
      >
        Point {selectedGuns} Guns at Captain
      </button>
    );
  }

  return (
    <>
      <div>
        <WorldMap {...worldMap} />
        <div className="flex flex-col items-center justify-center gap-1 mb-10">
          <div className="text-2xl italic">4/6. Question of Loyalty:</div>
          {capLiuNav()}
          <div className="text-2xl">Minimum Sum of Guns for Mutiny:</div>
          <div className="text-4xl font-bold text-red-500">{minGuns}</div>
          {usernameToGuns()}
          {pointNumberOfGuns()}
          {btnOk()}
        </div>
      </div>
    </>
  );
}
