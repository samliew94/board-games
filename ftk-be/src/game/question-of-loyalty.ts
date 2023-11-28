import { Socket } from "socket.io";
import socketService from "../socket-service";
import afterRevealGuns from "./after-reveal-guns";
import gameService from "./game-service";
import identityService from "./identity-service";
import worldMapService from "./world-map-service";

interface PointedGuns {
  [room: string]: number[]; // how many guns user (indexed) is pointing?
}

const pointedGuns: PointedGuns = {};

function init(socket: Socket) {
  socket.on("question-of-loyalty", () => {
    questionOfLoyalty(socket);
  });

  socket.on("lock-in-guns", (data) => lockInGuns(socket, data));
}

/** each user finalize how many guns they gonna use */
function lockInGuns(socket: Socket, data: any) {
  const user = socketService.findBySocketId(socket.id);
  const room = user.room;
  const game = gameService.findByRoom(room);
  const users = game.users;
  const userIdx = users.findIndex((u) => u.username === user.username);
  const guns = identityService.findGunsByRoom(room);
  const navTeam = identityService.findNavTeamByRoom(room);

  const { selectedGuns } = data;

  if (selectedGuns === undefined || selectedGuns < 0 || selectedGuns > 3) {
    console.error(
      `lockInGuns failed. User ${user.username} attempted to lock bad amount ${selectedGuns}`
    );
    return;
  }

  const gunsOnHand = guns[userIdx];

  if (gunsOnHand < selectedGuns) {
    console.error(
      `lockInGuns failed. User ${user.username} has ${gunsOnHand} but attempted to lock in ${selectedGuns} guns`
    );
    return;
  }

  const pointedGun = pointedGuns[room];
  pointedGun[userIdx] = selectedGuns;

  const { captain, dead } = navTeam;

  let allLockedIn = true;
  for (let i = 0; i < users.length; i++) {
    if (pointedGuns[room][i] < 0) {
      //somebody not done
      if (dead === i || captain === i) {
        // ignore the dead & the captain (does not need to vote)
        continue;
      }
      allLockedIn = false;
      break;
    }
  }

  if (allLockedIn) {
    console.log(`revealing guns`);
    afterRevealGuns.update(room);
  } else {
    update(room);
  }
}

function questionOfLoyalty(socket: Socket) {
  const user = socketService.findBySocketId(socket.id);
  const room = user.room;
  const game = gameService.findByRoom(room);
  const users = game.users;

  const isHost = users.findIndex((u) => u.username === user.username);

  if (isHost !== 0) {
    console.error(`questionOfLoyalty failed. Non-host attempted to trigger`);
    return;
  }

  update(room);
}

function update(room: string) {
  const game = gameService.findByRoom(room);
  const users = game.users;
  const navTeam = identityService.findNavTeamByRoom(room);
  const identity = identityService.findByRoom(room);
  const guns = identityService.findGunsByRoom(room);
  const totalUsers = users.length;

  const { captain, liutenant, navigator } = navTeam;

  if (
    captain === undefined ||
    liutenant === undefined ||
    navigator === undefined
  ) {
    console.error(
      `questionOfLoyalty update failed. captain (${captain}), liutenant(${liutenant}) or navigator(${navigator}) is null`
    );
    return;
  }

  // how many minimum guns to commit mutiny?
  let minGuns = 5;

  if (totalUsers <= 9) {
    minGuns = 4;
  } else if (totalUsers <= 7) {
    minGuns = 3;
  }

  const dead = navTeam.dead;

  const usernames = users.map((u) => u.username);

  // get worldMap data
  const worldMap = worldMapService.findWorldMapByRoom(room);

  // initialize gunMap if it's empty
  if (!pointedGuns[room]) {
    pointedGuns[room] = [];
    for (const _ of users) {
      pointedGuns[room].push(-1);
    }
  }

  // who finalized how many guns they wanna point?
  const finalizedPointedGuns = Array.from(pointedGuns[room]).map((x) => x > -1);

  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    user.service = "question-of-loyalty";

    const data: any = {
      worldMap,
      captain,
      liutenant,
      navigator,
      minGuns,
      usernames,
      guns,
      gunsOnHand: guns[i],
      dead,
      meDead: dead === i,
      finalizedPointedGuns,
      meFinalizedPointedGuns: pointedGuns[room][i] > -1,
      meCaptain: captain === i,
    };

    const socket = user.socket;
    socket.emit("question-of-loyalty", data);
  }
}

function findPointedGunsByRoom(room: string) {
  const data = pointedGuns[room];
  if (!data){
    throw new Error(`question-of-loyalty findPointedGunsByRoom failed. Room ${room} not found`);
  }
  return data;
}

function clearTempGunsByRoom(room:string){
  const data = pointedGuns[room];
  if (!data){
    throw new Error(`question-of-loyalty clearTempGunsByRoom failed. Room ${room} not found`);
  }

  delete pointedGuns[room];
}

export default {
  init,
  questionOfLoyalty,
  update,
  findPointedGunsByRoom,
  clearTempGunsByRoom
};
