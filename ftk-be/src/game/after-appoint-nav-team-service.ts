import { Socket } from "socket.io";
import socketService from "../socket-service";
import gameService from "./game-service";
import identityService from "./identity-service";
import worldMapService from "./world-map-service";

function init(socket: Socket) {
  socket.on("i-trust-this-team", () => {
    trustThisTeam(socket);
  });
}

function trustThisTeam(socket: Socket) {
  const user = socketService.findBySocketId(socket.id);
  const room = user.room;
  const game = gameService.findByRoom(room);
  const users = game.users;

  const identity = identityService.findNavTeamByRoom(room);

  if (!identity) {
    console.error(`afterCaptainAppointedNavTeam failed. navTeam is falsy`);
    return;
  }

  const captain = identity.captain;

  if (!captain) {
    console.error(`afterCaptainAppointedNavTeam failed. captain is falsy`);
    return;
  }

  const emitterIdx = users.findIndex((u) => u.username === user.username);

  if (emitterIdx != captain) {
    console.error(
      `afterCaptainAppointedNavTeam failed. emittedIdx=${emitterIdx} !== captain=${captain}`
    );
    return;
  }

  update(room);
}

function update(room: string) {
  const game = gameService.findByRoom(room);
  const users = game.users;
  const navTeam = identityService.findNavTeamByRoom(room);
  const identity = identityService.findByRoom(room);

  if (!navTeam) {
    console.error(
      `afterCaptainAppointedNavTeam update failed. navTeam not found by room ${room}`
    );
    return;
  }

  if (!identity) {
    console.error(
      `afterCaptainAppointedNavTeam update failed. identity not found by room ${room}`
    );
    return;
  }

  const { captain, liutenant, navigator, dead} = navTeam;

  if (
    captain === undefined ||
    liutenant === undefined ||
    navigator === undefined
  ) {
    console.error(
      `afterCaptainAppointedNavTeam update failed. captain (${captain}), liutenant(${liutenant}) or navigator(${navigator}) is null`
    );
    return;
  }

  // get cap,liu and nav's name
  const captainName = users[captain].username;
  const liutenantName = users[liutenant].username;
  const navigatorName = users[navigator].username;

  // get worldMap data
  const worldMap = worldMapService.findWorldMapByRoom(room);

  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    user.service = "after-captain-appointed-nav-team";

    // check if user activated character's ability, and the character name itself
    const { abilityActivated, character } = identity[user.username];

    const data: any = {
      worldMap,
      captain: captainName,
      liutenant: liutenantName,
      navigator: navigatorName,
      host: i === 0,
    };

    // if data.character is set, player can activate char's ability
    if (
      dead !== i &&
      !abilityActivated &&
      (character === "Minstrel" ||
        character === "Agitator" ||
        character === "Chief Cook" ||
        character === "Debt Collector" ||
        character === "Equalizer")
    ) {
      data.character = character;
    }

    const socket = user.socket;
    socket.emit("after-captain-appointed-nav-team", data);
  }
}

export default {
  init,
  trustThisTeam,
  update,
};
