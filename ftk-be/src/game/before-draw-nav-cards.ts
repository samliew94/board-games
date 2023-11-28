/**
 * list user:pointed how many guns
 * power
 */

import { Socket } from "socket.io";
import socketService from "../socket-service";
import beforeAppointService from "./before-appoint-service";
import gameService from "./game-service";
import identityService from "./identity-service";
import questionOfLoyalty from "./question-of-loyalty";
import worldMapService from "./world-map-service";

interface BeforeDrawNavigations {
  [room: string]: {
    picker: number; // who's lowering the hand?
    candidates: number[]; // who's pottentially getting lowered?
  };
}

const beforeDrawNavigationsData: BeforeDrawNavigations = {};

function init(socket: Socket) {
  socket.on("before-draw-navigations", () => toMutinyOrNot(socket));
  socket.on("hands-down", (data) => handsDown(socket, data));
}

/**
 * Get min number of guns for mutiny.
 * if mutiny, check for ties.
 * if ties, resolve mutiny
 * if no ties, proceed to change captain
 * take away guns
 *
 * may set user.service to 'resolve-mutiny'
 *
 */
function toMutinyOrNot(socket: Socket) {
  const user = socketService.findBySocketId(socket.id);
  const room = user.room;
  const game = gameService.findByRoom(room);
  const users = game.users;
  const totalUsers = users.length;
  const navTeam = identityService.findNavTeamByRoom(room);
  const identity = identityService.findByRoom(room);

  // get worldMap data
  const worldMap = worldMapService.findWorldMapByRoom(room);

  const pointedGuns = questionOfLoyalty.findPointedGunsByRoom(room);

  const numPointedGuns = Array.from(pointedGuns).map((n) => n);

  const { captain, liutenant, navigator, offDuty, dead } = navTeam;

  if (captain === undefined) {
    console.error(`mutiny method toMutinyOrNot failed. captain is undefined`);
    return;
  }

  // how many minimum guns to commit mutiny?
  let minGuns = 5;

  if (totalUsers <= 9) {
    minGuns = 4;
  } else if (totalUsers <= 7) {
    minGuns = 3;
  }

  let sumOfPointedGuns = 0;

  let maxGunsCount = 0;
  for (let i = 0; i < users.length; i++) {
    if (i !== captain && i !== dead) {
      sumOfPointedGuns += numPointedGuns[i];

      if (numPointedGuns[i] > maxGunsCount) {
        maxGunsCount = numPointedGuns[i];
      }
    }
  }

  if (sumOfPointedGuns >= minGuns) {
    // successful mutiny. deduct guns
    const gunsOnHand = identityService.findGunsByRoom(room);

    // who has the most guns? is there a tie?
    const nextCaptainCandidates: number[] = [];
    for (let i = 0; i < users.length; i++) {
      if (i !== captain && i !== dead) {
        if (numPointedGuns[i] === maxGunsCount) {
          nextCaptainCandidates.push(i);
        }

        // deduct guns due to successful mutiny
        gunsOnHand[i] -= numPointedGuns[i];
      }
    }

    // clear question-of-loyalty temp guns
    questionOfLoyalty.clearTempGunsByRoom(room);

    // are there ties for new captain?
    if (nextCaptainCandidates.length > 1) {
      // initialize resolveMutiny
      if (!beforeDrawNavigationsData[room]) {
        beforeDrawNavigationsData[room] = {
          picker: captain,
          candidates: nextCaptainCandidates,
        };
      }

      update(room);
    } else {
      // no ties, proceed to before draw navigation cards.
      console.log(`before draw navigation cards`);
    }
  }
}

function update(room: string) {
  const game = gameService.findByRoom(room);
  const users = game.users;
  const navTeam = identityService.findNavTeamByRoom(room);
  const identity = identityService.findByRoom(room);

  // get worldMap data
  const worldMap = worldMapService.findWorldMapByRoom(room);

  // get all usernames
  const usernames = users.map((u) => u.username);

  const { captain, liutenant, navigator } = navTeam;

  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    user.service = "before-draw-nav-cards";

    // check if user activated character's ability, and the character name itself
    const { abilityActivated, character } = identity[user.username];

    const data: any = {
      meHost: i === 0,
      worldMap,
      usernames,
      captain,
      liutenant,
      navigator,
    };

    // if data.character is set, player can activate char's ability
    if (
      !abilityActivated &&
      (character === "Bosun" ||
        character === "Smuggler" ||
        character === "Archivist")
    ) {
      data.character = character;
    }

    const socket = user.socket;
    socket.emit("before-draw-nav-cards", data);
  }
}

function handsDown(socket: Socket, data: any) {
  const user = socketService.findBySocketId(socket.id);
  const room = user.room;
  const game = gameService.findByRoom(room);
  const users = game.users;
  const userIdx = users.findIndex((u) => u.username === user.username);
  const navTeam = identityService.findNavTeamByRoom(room);
  const rm = beforeDrawNavigationsData[room];

  if (rm.picker !== userIdx) {
    console.error(
      `mutiny handsDown failed. rm.picker ${rm.picker} !== user.idx ${userIdx}`
    );
    return;
  }

  const { target } = data;

  if (!rm.candidates.includes(target)) {
    console.error(
      `mutiny handsDown failed. target ${target} not part of rm.candidates ${rm.candidates}`
    );
    return;
  }

  const found = rm.candidates.findIndex((n) => n === target);

  // the selected becomes the picker
  rm.picker = found;

  // the selected removed from candidates
  rm.candidates.splice(found, 1);

  if (rm.candidates.length === 1) {
    const newCaptainIdx = rm.candidates[0];
    navTeam.captain = newCaptainIdx;
    navTeam.liutenant = undefined;
    navTeam.navigator = undefined;

    // clean mutiny's data
    delete beforeDrawNavigationsData[room];

    beforeAppointService.update(room);
  } else {
    update(room);
  }
}

export default {
  init,
  update,
};
