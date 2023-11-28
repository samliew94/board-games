import { Socket } from "socket.io-client";
import { REF_CHARACTER } from "./game-info";

export interface ActivableCharacterAbilityProps {
  socket: Socket;
  character?: string;
}

export default function activableCharacterAbility({
  socket,
  character,
}: ActivableCharacterAbilityProps) {

  if (!character){
    return null;
  }

  const characterData = REF_CHARACTER.characters.find(
    (x) => x.name === character
  );

  if (!characterData) return null;

  const { ability } = characterData;

  const abilities = ability.split("\n");

  return (
    <>
      <div className="flex flex-col justify-center items-center m-4">
        <div className="text-lg">You have an activable ability:</div>
        <div className="text-center items-center mt-4">
          <div className="text-2xl">{character}</div>
          {abilities.map((ability, idx) => (
            <div className="text-lg">
              {ability}
            </div>
          ))}
        </div>
        <button
          className="py-2 px-4 bg-green-500 active:bg-green-500 rounded-md text-white text-lg mt-1"
          onClick={() => {
            socket.emit("activate-character-ability");
          }}
        >
          ACTIVATE
        </button>
      </div>
    </>
  );
}
