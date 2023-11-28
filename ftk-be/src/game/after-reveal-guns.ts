/**
 * list user:pointed how many guns
 * power
 */

import { Socket } from "socket.io";
import gameService from "./game-service";
import identityService from "./identity-service";
import questionOfLoyalty from "./question-of-loyalty";
import worldMapService from "./world-map-service";

function init(socket: Socket) {
  socket.on("question-of-loyalty", () => {});
}

function update(room: string) {
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

  // how many minimum guns to commit mutiny?
  let minGuns = 5;

  if (totalUsers <= 9) {
    minGuns = 4;
  } else if (totalUsers <= 7) {
    minGuns = 3;
  }

  let sumOfPointedGuns = 0;

  for (let i = 0; i < users.length; i++) {
    if (i !== captain && i !== dead) sumOfPointedGuns += numPointedGuns[i];
  }

  const usernames = users.map((u) => u.username);

  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    user.service = "after-reveal-guns";

    // check if user activated character's ability, and the character name itself
    const { abilityActivated, character } = identity[user.username];

    const data: any = {
      meHost: i === 0,
      worldMap,
      captain,
      liutenant,
      navigator,
      minGuns,
      usernames,
      numPointedGuns,
      sumOfPointedGuns,
      dead,
      meDead: dead === i,
      meCaptain: captain === i,
    };

    // if data.character is set, player can activate char's ability
    if (
      dead !== i &&
      !abilityActivated &&
      (character === "Troublemaker" ||
        character === "Peacemaker" ||
        character === "Master Strategist" ||
        character === "Rabble-rouser" ||
        character === "Instigator")
    ) {
      data.character = character;
    }

    const socket = user.socket;
    socket.emit("after-reveal-guns", data);
  }
}

export default {
  init,
  update,
};
