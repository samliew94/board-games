import { Socket } from "socket.io";
import socketService from "../socket-service";
import gameService from "./game-service";
import identityService from "./identity-service";
import worldMapService from "./world-map-service";

function init(socket: Socket) {
  socket.on("captain-appointing-nav-team", () => {
    captainAppointingNavTeam(socket);
  });

  socket.on("captain-chose", (data: any) => {
    captainChose(socket, data);
  });
}

function captainAppointingNavTeam(socket: Socket) {
  const user = socketService.findBySocketId(socket.id);
  const room = user.room;
  const game = gameService.findByRoom(room);
  const users = game.users;

  if (users[0].username !== user.username) {
    console.error(
      `captainAppointingNavTeam failed. User ${user.username} is not host`
    );
    return;
  }

  update(room);
}

function update(room: string) {
  const game = gameService.findByRoom(room);
  const users = game.users;
  const navTeam = identityService.findNavTeamByRoom(room);

  if (!navTeam) {
    console.error(
      `navTeam in captain-appointing-nav-team not found by room ${room}`
    );
    return;
  }

  const { captain, liutenant, navigator, offDuty, dead } = navTeam;

  if (!captain) {
    console.error(`captain is falsy in captain-appointing-nav-team`);
    return;
  }

  // get the UNSORTED usernames
  const usernames = game.users.map((_) => _.username);

  // get worldMap data
  const worldMap = worldMapService.findWorldMapByRoom(room);

  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    user.service = "captain-appointing-nav-team";

    const data = {
      worldMap,
      usernames,
      captain,
      liutenant,
      navigator,
      offDuty,
      dead,
      isCaptain: i === captain, // this flag lets client enable buttons
    };

    const socket = user.socket;

    socket.emit("captain-appointing-nav-team", data);
  }
}

function captainChose(socket: Socket, data: any) {
  const user = socketService.findBySocketId(socket.id);
  const room = user.room;
  const game = gameService.findByRoom(room);
  const users = game.users;
  const navTeam = identityService.findNavTeamByRoom(room);

  if (!navTeam) {
    console.error(
      `navTeam in captain-appointing-nav-team not found by room ${room}`
    );
    return;
  }

  const { captain, liutenant, navigator, offDuty, dead } = navTeam;

  if (!captain || captain >= users.length) {
    console.error(
      `captain in captainChose is falsy or captain's index is out of game.users bounds`
    );
    return;
  }

  if (captain !== users.findIndex((x) => x.username === user.username)) {
    console.error(
      `captain found in navTeam in captainChose don't match with the initiating socket user by username`
    );
    return;
  }

  const targetIdx = data.targetIdx;

  if (targetIdx === captain) {
    console.error(`captain in captainChose attempted to self-target`);
    return;
  }

  if (offDuty.includes(targetIdx)) {
    console.error(
      `captain in captainChose attempted to target off-duty players`
    );
    return;
  }
  if (targetIdx === dead) {
    console.error(`captain in captainChose attempted to target dead player`);
    return;
  }

  if (liutenant !== undefined && targetIdx === liutenant) {
    navTeam.liutenant = undefined;
  } else if (navigator !== undefined && targetIdx === navigator) {
    navTeam.navigator = undefined;
  } else if (liutenant === undefined) {
    navTeam.liutenant = targetIdx;
  } else if (navigator === undefined) {
    navTeam.navigator = targetIdx;
  } else {
    // both liutenant and navigator are TRUTHY, deselect both and make new selection liutenant
    navTeam.liutenant = targetIdx;
    navTeam.navigator = undefined;

  }

  update(room);
}

export default {
  init,
  captainAppointingNavTeam,
  update,
};
