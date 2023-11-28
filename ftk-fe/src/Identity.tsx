import { useState } from "react";
import { REF_CHARACTER } from "./game-info";

interface Props {
  socket: any;
  data: {
    host: boolean;
    team: string;
    otherPirates: string[];
    character: string;
    cultistConvert: boolean;
    identityOk: boolean; // have you clicked ok?
    waitingFor: string; // who not yet press OK
  };
}

export default function Identity({ socket, data }: Props) {
  const { host, team, otherPirates, character, identityOk, waitingFor } = data;

  const [seeTeam, setSeeTeam] = useState(false);

  function loadMap() {
    if (!host) return;
    socket.emit("beforeCaptainAppointsNavTeam");
  }

  function loadTeam() {
    const bgColor =
      team === "sailor" ? "blue" : team === "pirate" ? "red" : "yellow";
    const fontColor = "white";
    console.log(`team ${team}`);
    const teamName =
      team === "sailor"
        ? "Sailor"
        : team === "pirate"
        ? "Pirate"
        : "Cult Leader";
    const style =
      (seeTeam
        ? `text-${fontColor} bg-${bgColor}-500`
        : "text-white bg-neutral-500") + " py-2 px-4 rounded-md text-lg";
    const content = seeTeam ? teamName : "Tap to see team";

    return (
      <button
        onClick={() => {
          setSeeTeam(!seeTeam);
        }}
        className={style}
      >
        {content}
      </button>
    );
  }

  function loadChar() {

    const characterData = REF_CHARACTER.characters.find(x=>x.name===character);

    if (!characterData) return null;

    const { name, ability } = characterData;

    const abilities = ability.split("\n");

    return (
      <div className="text-center p-1">
        <div className="text-3xl">{name}</div>
        {abilities.map((ability) => (
          <div className="text-lg">{ability}</div>
        ))}
      </div>
    );
  }

  function loadOtherPirates() {
    if (team !== "pirate") {
      return null;
    }

    return (
      <>
        <div className="text-lg italic">
          Other Pirates:
          <div className="flex flex-col justify-center items-center gap-1">
            {otherPirates.map((_) => (
              <div>{_}</div>
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="flex flex-col justify-center items-center h-screen gap-1">
        {loadTeam()}
        {loadOtherPirates()}
        {loadChar()}
        {host ? (
          <button
            onClick={loadMap}
            className="bg-green-500 active:bg-green-800 text-white text-2xl py-2 px-4 rounded-md"
          >
            Load Map!
          </button>
        ) : null}
      </div>
    </>
  );
}
