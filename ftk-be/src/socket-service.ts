console.log("init socket-service");

import { Socket } from "socket.io";
import afterAppointNavTeamService from "./game/after-appoint-nav-team-service";
import afterRevealGuns from "./game/after-reveal-guns";
import beforeAppointService from "./game/before-appoint-service";
import appointingNavTeam from "./game/captain-appointing-nav-team";
import gameService from "./game/game-service";
import identityService from "./game/identity-service";
import mutiny from "./game/mutiny";
import questionOfLoyalty from "./game/question-of-loyalty";
import settingService from "./game/setting-service";
import { User } from "./game/user";
import userService from "./game/user-service";

let io: any;

const socketData: SocketData = {};

interface SocketData {
  [socketId: string]: User;
}

function getIo() {
  return io;
}

function initSocketService(_: any) {
  io = _;

  io.on("connection", (socket: any) => {
    gameService.init(socket);
    settingService.init(socket);
    identityService.init(socket);
    beforeAppointService.init(socket);
    appointingNavTeam.init(socket);
    afterAppointNavTeamService.init(socket);
    questionOfLoyalty.init(socket);
    afterRevealGuns.init(socket);
    mutiny.init(socket);

    const username = socket.handshake.auth.username;
    console.log(`${username} connected: ${socket.id}`);

    const user = userService.createOrUpdateUser(username, socket);

    const room = user.room;
    socket.join(room);
    socketData[socket.id] = user;

    if (user.service === "game") {
      gameService.updateGameList();
    } else if (user.service === "lobby") {
      gameService.updateLobby(room);
    } else if (user.service === "settings") {
      settingService.updateSettings(room);
    } else if (user.service === "identity") {
      identityService.updateIdentity(room);
    } else if (user.service === "beforeCaptainAppointsNavTeam") {
      beforeAppointService.update(room);
    } else if (user.service === "captain-appointing-nav-team") {
      appointingNavTeam.update(room);
    } else if (user.service === "after-captain-appointed-nav-team") {
      afterAppointNavTeamService.update(room);
    } else if (user.service === "question-of-loyalty") {
      questionOfLoyalty.update(room);
    } else if (user.service === "after-reveal-guns") {
      afterRevealGuns.update(room);
    } else if (user.service === "mutiny") {
      mutiny.update(room);
    }
  });
}

function findBySocketId(socketId: string) {
  return socketData[socketId];
}

async function findAllByRoom(room: string) {
  return (await io.in(room).fetchSockets()) as Socket[];
}

export default {
  getIo,
  initSocketService,
  findBySocketId,
  findAllByRoom,
};
