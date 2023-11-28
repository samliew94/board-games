import { Socket } from "socket.io";
import socketService from "../socket-service";
import gameService from "./game-service";
import identityService from "./identity-service";
import worldMapService from "./world-map-service";

function init(socket: Socket) {
  socket.on("beforeCaptainAppointsNavTeam", () => {
    beforeCaptainAppointsNavTeam(socket);
  });
}

function update(room: string) {
  const game = gameService.findByRoom(room);
  const users = game.users;
  const identity = identityService.findByRoom(room);
  const navTeam = identityService.findNavTeamByRoom(room);

  if (!identity) {
    console.error(`identityMap not found by room ${room}`);
    return;
  }

  if (!navTeam) {
    console.error(`navTeam not found by room ${room}`);
    return;
  }

  // get worldMap data
  const worldMap = worldMapService.initOrFindWorldMap(room);

  // get navTeam
  const captainIndex = navTeam.captain;

  if (!captainIndex) {
    console.error(`captain not found in room ${room} with index ${captainIndex}`);
    return;
  }

  const captain = users[captainIndex].username;

  for (let i = 0; i < users.length; i++) {
    const user = users[i];

    user.service = "beforeCaptainAppointsNavTeam";

    const { abilityActivated, character } = identity[user.username];

    const data: any = {
      worldMap,
      captain,
      host: i === 0,
    };

    // if data.character is set, player can activate char's ability
    if (
      !abilityActivated &&
      (character === "Herbalist" || character === "Consultant")
    ) {
      data.character = character;
    }

    const socket = user.socket;
    socket.emit("beforeCaptainAppointsNavTeam", data);
  }
}

function beforeCaptainAppointsNavTeam(socket: Socket) {
  const user = socketService.findBySocketId(socket.id);
  const room = user.room;
  const game = gameService.findByRoom(room);
  const users = game.users;

  if (users[0].username !== user.username) {
    console.error(
      `beforeCaptainAppointsNavTeam failed. User ${user.username} is not host`
    );
    return;
  }

  update(room);
}

export default { init, beforeCaptainAppointsNavTeam, update };
