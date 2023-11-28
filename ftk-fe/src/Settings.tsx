interface Props {
  socket: any;
  data: {
    host: boolean;
    journey: boolean;
    offDutySigns: number;
    directions: {
      north: number;
      eastDrunk: number;
      eastDisarmed: number;
      westDrunk: number;
      westMermaid: number;
      westTelescope: number;
      westArmed: number;
    };
    team: {
      sailors: number;
      pirates: number;
      cultLeader: number;
      cultist: number;
    };
  };
}

export default function Settings({ socket, data }: Props) {

  const { host, journey, offDutySigns, directions, team } = data;
  const {north, eastDrunk, eastDisarmed, westDrunk, westMermaid, westTelescope, westArmed} = directions;
  const {sailors, pirates, cultLeader, cultist} = team;

  function onChangeJourney(journey: boolean) {
    if (!host) return;
    socket.emit("update-settings", { journey });
  }

  function beginJourney() {
    if (!host) return;
    socket.emit("begin-journey", {});
  }

  return (
    <>
      <div className="flex flex-col justify-center items-center h-screen gap-1">
        <div className="text-4xl">Game Settings</div>
        <div className="grid grid-cols-1 gap-1">
          <button
            onClick={() => onChangeJourney(false)}
            className={`text-white rounded-md py-2 px-4 ${
              !journey ? "bg-green-600" : "bg-neutral-500"
            }`}
          >
            <div className="text-3xl">
              Quick Journey&nbsp;
              <span className="text-2xl italic">(5-11 Players)</span>
            </div>
            <div className="text-2xl"></div>
            <div className="text-lg italic">est. playtime 45m</div>
            <div className="italic">
              Play this if you're new or have limited time.
            </div>
          </button>
          <button
            onClick={() => onChangeJourney(true)}
            className={`text-white rounded-md py-2 px-4 ${
              journey ? "bg-red-600" : "bg-neutral-500"
            }`}
          >
            <div className="text-3xl">
              Long Journey&nbsp;
              <span className="text-2xl italic">(7-11 Players)</span>
            </div>
            <div className="text-lg italic">est. playtime 90m</div>
            <div className="italic">Play this if you're veterans and have more time.</div>
          </button>
        </div>
        <div className="text-3xl mt-4" >Journey Details:</div>
        <div className="grid grid-cols-2 border divide-x divide-y border-black rounded-md">
          <div className="p-1">Off-Duty Signs</div>
          <div className="p-1">{offDutySigns}x</div>
          <div className="p-1 text-yellow-500">North (Yellow)</div>
          <div className="p-1">{north}x Cult Uprising</div>
          <div className="p-1 text-blue-500">East (Blue)</div>
          <div className="p-1 grid grid-cols-1 ">
            <div>{eastDrunk}x Drunk</div>
            <div>{eastDisarmed}x Disarmed</div>
          </div>
          <div className="p-1 text-red-500">West (Red)</div>
          <div className="p-1 grid grid-cols-1 ">
            <div>{westDrunk}x Drunk</div>
            <div>{westMermaid}x Mermaid</div>
            <div>{westTelescope}x Telescope</div>
            <div>{westArmed}x Armed</div>
          </div>
        </div>
        <div className="text-3xl mt-4" >Team Compositions:</div>
        <div className="grid grid-cols-2 border divide-x divide-y border-black rounded-md">
          <div className="p-1 text-blue-500">Sailors</div>
          <div className="p-1">{sailors === -1 ? '3 or 2' : sailors}</div>
          <div className="p-1 text-red-500">Pirates</div>
          <div className="p-1">{pirates === -1 ? '1 or 2' : pirates}</div>
          <div className="p-1 text-yellow-500">Cult Leader</div>
          <div className="p-1">{cultLeader}</div>
          <div className="p-1 text-green-500">Cultist</div>
          <div className="p-1">{cultist}</div>
        </div>

        {host ? (
          <button
            onClick={beginJourney}
            className="bg-blue-500 active:bg-blue-800 text-white text-2xl py-2 px-4 rounded-md"
          >
            Begin Journey
          </button>
        ) : null}
      </div>
    </>
  );
}
