/**
 * list user:pointed how many guns
 * power
 */

import { Socket } from "socket.io";
import socketService from "../socket-service";
import beforeAppointService from "./before-appoint-service";
import beforeDrawNavCards from "./before-draw-nav-cards";
import gameService from "./game-service";
import identityService from "./identity-service";
import questionOfLoyalty from "./question-of-loyalty";
import worldMapService from "./world-map-service";

interface ResolveMutiny {
  [room: string]: {
    picker: number; // who's lowering the hand?
    candidates: number[]; // who's pottentially getting lowered?
  };
}

const resolveMutiny: ResolveMutiny = {};

function init(socket: Socket) {
  socket.on("to-mutiny-or-not", () => toMutinyOrNot(socket));

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
        gunsOnHand[i] -= numPointedGuns[i]
      }
    }

    // clear question-of-loyalty temp guns
    questionOfLoyalty.clearTempGunsByRoom(room);

    // are there ties for new captain?
    if (nextCaptainCandidates.length > 1) {
      // initialize resolveMutiny
      if (!resolveMutiny[room]) {
        resolveMutiny[room] = {
          picker: captain,
          candidates: nextCaptainCandidates,
        };
      }

      update(room);
    } else {
      // no ties, proceed to before draw navigation cards.
      console.log(`before draw navigation cards`);
      beforeDrawNavCards.update(room)
    }
  }
}

/** there are ties */
function update(room: string) {
  const game = gameService.findByRoom(room);
  const users = game.users;
  const rm = resolveMutiny[room];

  // get worldMap data
  const worldMap = worldMapService.findWorldMapByRoom(room);

  // get all usernames
  const usernames = users.map((u) => u.username);

  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    user.service = "resolve-mutiny";

    const data: any = {
      worldMap,
      usernames,
      picker: rm.picker,
      mePicker: rm.picker === i,
      candidates: rm.candidates,
    };

    const socket = user.socket;
    socket.emit("resolve-mutiny", data);
  }
}

/** only when there are conflicts/ties in captain position */
function handsDown(socket: Socket, data: any) {
  const user = socketService.findBySocketId(socket.id);
  const room = user.room;
  const game = gameService.findByRoom(room);
  const users = game.users;
  const userIdx = users.findIndex((u) => u.username === user.username);
  const navTeam = identityService.findNavTeamByRoom(room);
  const rm = resolveMutiny[room];

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
    delete resolveMutiny[room];

    beforeAppointService.update(room);
  } else {
    update(room);
  }
}

export default {
  init,
  update,
};
