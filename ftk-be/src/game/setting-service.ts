import { Socket } from "socket.io";
import socketService from "../socket-service";
import gameService from "./game-service";

interface Settings {
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
}

const map = new Map<string, Settings>();

function init(socket: Socket) {
  socket.on("update-settings", (data) => {
    const user = socketService.findBySocketId(socket.id);
    updateSettings(user.room, data);
  });
}

function defaultOffDutySigns(journey: boolean, length: number) {
  if (!journey) {
    return length <= 6 ? 1 : length <= 8 ? 2 : 3;
  } else {
    return length <= 8 ? 2 : 3;
  }
}

function defaultDirections(journey: boolean, length: number) {
  if (!journey) {
    return {
      north: 5,
      eastDrunk: 3,
      eastDisarmed: 2,
      westDrunk: 5,
      westMermaid: 2,
      westTelescope: 2,
      westArmed: 0,
    };
  } else {
    return {
      north: 6,
      eastDrunk: 4,
      eastDisarmed: 2,
      westDrunk: 5,
      westMermaid: 2,
      westTelescope: 2,
      westArmed: 2,
    };
  }
}

function defaultTeams(length: number) {
  return {
    sailors:
      length === 5
        ? -1
        : length === 6
        ? 3
        : length === 7
        ? 4
        : length === 8
        ? 4
        : length === 9
        ? 5
        : length === 10
        ? 5
        : 5,
    pirates:
      length === 5
        ? -1
        : length === 6
        ? 2
        : length === 7
        ? 2
        : length === 8
        ? 3
        : length === 9
        ? 3
        : length === 10
        ? 4
        : 5,
    cultLeader: 1,
    cultist: length === 11 ? 1 : 0,
  };
}

function initSettings(room: string) {
  const game = gameService.findByRoom(room);
  const users = game.users;
  const length = users.length;

  map.set(room, {
    journey: false,
    offDutySigns: defaultOffDutySigns(false, length),
    directions: defaultDirections(false, length),
    team: defaultTeams(length),
  });
}

function updateSettings(room: string, data?: any) {
  const game = gameService.findByRoom(room);
  if (!game) {
    console.error(`updateSettings failed. Room not found. room: ${room}`);
    return;
  }

  if (!map.has(room)) {
    initSettings(room);
  }

  const curSettings = map.get(room)!;
  const users = game.users;
  const length = users.length;

  // host manually changing settings
  if (data) {
    // host wants to play long journey, check if possible
    if (data.journey && length >= 7) {
      curSettings.journey = true;
      curSettings.offDutySigns = defaultOffDutySigns(true, length);
      curSettings.directions = defaultDirections(true, length);
    } else {
      // change to short journey
      curSettings.journey = false;
      curSettings.offDutySigns = defaultOffDutySigns(false, length);
      curSettings.directions = defaultDirections(false, length);
    }

    // short and long share same team compositions
    curSettings.team = defaultTeams(length);

  }

  for (let i = 0; i < game.users.length; i++) {
    const host = i === 0;
    const user = game.users[i];

    const newData = {
      host,
      ...curSettings,
    };

    const socket = user.socket;

    socket.emit("settings", newData);
  }
}

function findSettingsByRoom(room:string){
  if (map.has(room)){
    return map.get(room);
  }
}

export default {
  init,
  updateSettings,
  findSettingsByRoom,
};
