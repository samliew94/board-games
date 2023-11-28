import { Socket } from "socket.io";
import { REF_CHARACTER } from "../game-data";
import socketService from "../socket-service";
import shuffler from "../util/shuffler";
import gameService from "./game-service";
import settingService from "./setting-service";

type Character =
  | "Kleptomaniac"
  | "Troublemaker"
  | "Gunsmith"
  | "Peacemaker"
  | "Gunslinger"
  | "Minstrel"
  | "Bosun"
  | "Herbalist"
  | "Look-Out"
  | "Master Strategist"
  | "Smuggler"
  | "Agitator"
  | "Consultant"
  | "Chief Cook"
  | "Rabble-rouser"
  | "Archivist"
  | "Spiritualist"
  | "Debt Collector"
  | "Equalizer"
  | "Instigator";

interface IMap {
  [room: string]: {
    [username: string]: {
      team: "sailor" | "pirate" | "cultLeader" | "cultist";
      cultistConvert?: boolean; // is player a cultist convert?
      character?: Character; // all players have one character
      abilityActivated?: boolean; // if truthy, user activated ability
    };
  };
}

/** user game.users[idx] to determine who's who */
interface NavTeam {
  [room: string]: {
    captain?: number;
    liutenant?: number;
    navigator?: number;
    offDuty: number[];
    dead: number;
  };
}

interface Guns {
  [room: string]: number[];
}

const map: IMap = {};
const navTeam: NavTeam = {};
const guns: Guns = {};

function init(socket: Socket) {
  socket.on("begin-journey", (data: any) => {
    assignTeamsAndCharacters(socket, data);
  });
}

/** first captain also assigned here */
async function assignTeamsAndCharacters(socket: Socket, data: any) {
  const user = socketService.findBySocketId(socket.id);
  const room = user.room;
  const game = gameService.findByRoom(room);
  if (!game) {
    console.error(
      `assignCharacters failed. Can't find by game by room: ${room}`
    );
    return;
  }
  const host = game.users[0].username;
  const users = game.users;
  const totalUsers = users.length;
  const settings = settingService.findSettingsByRoom(room)!;

  if (!settings) {
    console.error(
      `assignCharacters failed. Can't find by settings by room: ${room}`
    );
    return;
  }

  map[room] = {};
  navTeam[room] = {
    offDuty: [],
    dead: -1,
  };
  guns[room] = [];
  const identity = map[room];

  if (user.username !== host) {
    console.error(
      `beginJourney failed. Non-host ${user.username} attempted to begin journey`
    );
    return;
  }

  //assign team based on settings configuration
  const journey = settings.journey;
  const { sailors, pirates } = settings.team;

  const shuffledUsers = shuffler.shuffleArray(game.users);

  if (totalUsers === 5) {
    // in a game of 5P, the journey must be Short
    // there can be either 3:1 or 2:2 ratio of sailor:pirate
    const bit = Math.floor(Math.random() * 2);
    if (!bit) {
      // ratio is 3:1:1 | sailor:pirate:cultLeader
      for (let i = 0; i < 5; i++) {
        identity[shuffledUsers.pop().username] = {
          team: i <= 2 ? "sailor" : i === 3 ? "pirate" : "cultLeader",
        };
      }
    } else {
      // ratio is 2:2:1 | sailor:pirate:cultLeader
      for (let i = 0; i < 5; i++) {
        identity[shuffledUsers.pop().username] = {
          team: i <= 1 ? "sailor" : i <= 3 ? "pirate" : "cultLeader",
        };
      }
    }
  } else {
    // greater than 5 settings
    for (let i = 0; i < sailors; i++) {
      identity[shuffledUsers.pop().username] = {
        team: "sailor",
      };
    }
    for (let i = 0; i < pirates; i++) {
      identity[shuffledUsers.pop().username] = {
        team: "pirate",
      };
    }
    identity[shuffledUsers.pop().username] = {
      team: "cultLeader",
    };

    if (shuffledUsers.length === 1) {
      identity[shuffledUsers.pop().username] = {
        team: "cultist",
      };
    }
  }

  // assign unique characters
  const charSet = new Set<string>();
  while (charSet.size != totalUsers) {
    const charId = Math.floor(Math.random() * 21);
    const charName = REF_CHARACTER.characters[charId].name;
    if (charSet.has(charName)) {
      continue;
    }
    // for games <= 6 players, avoid using Debt Collector, Minstrel and Menthor
    if (totalUsers <= 6) {
      if (
        charName === "Debt Collector" ||
        charName === "Minstrel" ||
        charName === "Mentor"
      ) {
        continue;
      }
    }
    charSet.add(charName);
  }
  const charNameSetList = Array.from(charSet);

  const herbalistIdx = Math.floor(Math.random() * totalUsers);
  const consultantIdx = Math.floor(Math.random() * totalUsers);

  for (let i = 0; i < totalUsers; i++) {
    const username = users[i].username;
    const _identity = identity[username];
    const charName = charNameSetList[i];

    // if (herbalistIdx === i){
    //   _identity.character = "Herbalist";
    // }
    // else if (consultantIdx === i){
    //   _identity.character = "Consultant";
    // }
    // else
    _identity.character = charName as Character;

    // allocate 3 guns to each player
    guns[room].push(3);
  }

  // assign randomly first captain
  const randomCaptainIdx = Math.floor(Math.random() * totalUsers);
  navTeam[room].captain = randomCaptainIdx;

  updateIdentity(room);
}

async function updateIdentity(room: string) {
  const game = gameService.findByRoom(room);
  const users = game.users;

  const allPirates: string[] = [];
  for (const user of users) {
    if (map[room][user.username].team === "pirate") {
      allPirates.push(user.username);
    }
  }

  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    const socket = user.socket;

    user.service = "identity";

    const identity = map[room][user.username];

    const otherPirates = [];
    if (identity.team === "pirate") {
      otherPirates.push(...allPirates.filter((x) => x !== user.username));
    }

    socket.emit("identity", {
      host: i === 0,
      otherPirates,
      ...identity,
    });
  }
}

function findByRoom(room: string) {
  const mapRoom = map[room];

  if (mapRoom) {
    return mapRoom;
  } else {
    throw new Error(
      `identity-service findByRoom failed. Room ${room} not found`
    );
  }
}

function findNavTeamByRoom(room: string) {
  const data = navTeam[room];

  if (data) {
    return data;
  } else {
    throw new Error(
      `identity-service findNavTeamByRoom failed. Room ${room} not found`
    );
  }
}

function findGunsByRoom(room: string) {
  const data = guns[room];

  if (data) {
    return data;
  } else {
    throw new Error(
      `identity-service findGunsByRoom failed. Room ${room} not found`
    );
  }
}

export default {
  init,
  findByRoom,
  updateIdentity,
  findNavTeamByRoom,
  findGunsByRoom,
};
