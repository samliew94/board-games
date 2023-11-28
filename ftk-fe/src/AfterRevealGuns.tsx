import { GiSawedOffShotgun } from "react-icons/gi";
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
    minGuns: number;
    usernames: string[];
    numPointedGuns: number[];
    sumOfPointedGuns: number;
    dead: number;
    meDead: boolean;
    meCaptain: boolean;
    character:string;
  };
}

export default function AfterRevealGuns({ socket, data }: Props) {
  const {
    meHost,
    worldMap,
    captain,
    liutenant,
    navigator,
    minGuns,
    usernames,
    numPointedGuns,
    sumOfPointedGuns,
    dead,
    meDead,
    meCaptain,
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

  function loadPointedGunsIcon(idx: number) {
    const pointedGuns = numPointedGuns[idx];

    const tsxes = [];
    for (let i = 0; i < 3; i++) {
      if (i + 1 > pointedGuns) {
        tsxes.push(<div />);
      } else {
        tsxes.push(
          <div className="pt-1.5 text-red-500">
            <GiSawedOffShotgun />
          </div>
        );
      }
    }

    return (
      <div className="grid grid-cols-3">{Array.from(tsxes).map((x) => x)}</div>
    );
  }

  function usernameToGuns() {
    return (
      <>
        <div className="border border-neutral-500 p-1 rounded-md text-2xl">
          {usernames.map((username, idx) => {
            return (
              <>
                <div className="grid grid-cols-2">
                  <div>{username}</div>
                  <div>{loadPointedGunsIcon(idx)}</div>
                </div>
              </>
            );
          })}
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
          if (!meHost){
            return;
          }
          socket.emit("to-mutiny-or-not", {});

        }}
        className="py-2 px-4 rounded-md text-lg bg-blue-500 active:bg-blue-800 text-white"
      >
        Next
      </button>
    );
  }

  function txtSumOfPointedGuns() {
    return (
      <div
        className={`text-4xl font-bold ${
          sumOfPointedGuns >= minGuns ? "text-red-500" : "text-green-500"
        }`}
      >
        {sumOfPointedGuns}<span>/{minGuns}</span>
      </div>
    );
  }

  return (
    <>
      <div>
        <WorldMap {...worldMap} />
        <div className="flex flex-col items-center justify-center gap-1 mb-10">
          <div className="text-2xl italic">5/6. After Guns of Revealed:</div>
          {capLiuNav()}
          {usernameToGuns()}
          <div className="text-2xl">Sum of Guns aimed at Captain:</div>
          {txtSumOfPointedGuns()}
          {btnNext()}
          <ActivatableCharacterAbility socket={socket} character={character} />
        </div>
      </div>
    </>
  );
}
