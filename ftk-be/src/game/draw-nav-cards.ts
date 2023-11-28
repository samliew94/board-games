/**
 * list user:pointed how many guns
 * power
 */

import { Socket } from "socket.io";
import socketService from "../socket-service";
import gameService from "./game-service";
import identityService from "./identity-service";
import navCardsService from "./nav-cards-service";
import worldMapService from "./world-map-service";

interface DrawNavCarCards {
  [room: string]: {
    captainDraws: number[];
    liutenantDraws: number[];
    navigatorDraws: number[];
  };
}

const drawNavCardsData: DrawNavCarCards = {};

function init(socket: Socket) {
  socket.on("draw-nav-cards", () => onDrawNavCards(socket));
}

/**
 * captain draws 2 random cards
 * liutenant draws 2 random cards
 *
 *
 */
function onDrawNavCards(socket: Socket) {
  const user = socketService.findBySocketId(socket.id);
  const room = user.room;

  const navCards = navCardsService.getOrDefault(room);

  if (navCards.drawPile.length < 4) {
    navCardsService.mergeDiscardsAndDraw(room);
  }

  drawNavCardsData[room] = {
    captainDraws: [-1, -1],
    liutenantDraws: [-1, -1],
    navigatorDraws: [-1, -1],
  };

  const drawPile = navCards.drawPile;

  for (let i = 0; i < 4; i++) {
    const { id } = drawPile[0];
    drawPile.splice(0, 1); // remove from draw pile

    // give the 4 cards to captain and liutenant in order
    if (i === 0) {
      drawNavCardsData[room].captainDraws[0] = id;
    } else if (i === 1) {
      drawNavCardsData[room].captainDraws[1] = id;
    } else if (i === 2) {
      drawNavCardsData[room].liutenantDraws[0] = id;
    } else if (i === 3) {
      drawNavCardsData[room].liutenantDraws[1] = id;
    }
  }

  update(room);
}

/**
 * waiting for CAPTAIN P1 to pick a card
 * waiting for LIUTENANT P2 to pick a card
 */
function update(room: string) {
  const game = gameService.findByRoom(room);
  const users = game.users;
  const navTeam = identityService.findNavTeamByRoom(room);
  const navCards = navCardsService.getOrDefault(room);

  // get worldMap data
  const worldMap = worldMapService.findWorldMapByRoom(room);

  // get all usernames
  const usernames = users.map((u) => u.username);

  const { captain, liutenant, navigator } = navTeam;

  // captain hasn't decided
  const captainPicked = drawNavCardsData[room].captainDraws.length === 1;
  const liutenantPicked = drawNavCardsData[room].captainDraws.length === 1;

  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    user.service = "draw-nav-cards";

    let draws;

    if (i === captain) {
      draws = drawNavCardsData[room].captainDraws;
    } else if (i === liutenant) {
      draws = drawNavCardsData[room].liutenantDraws;
    } else if (i === navigator) {
      draws = drawNavCardsData[room].navigatorDraws;
    }

    const data: any = {
      worldMap,
      usernames,
      captain,
      liutenant,
      captainPicked,
      liutenantPicked,
      draws,
    };

    const socket = user.socket;
    socket.emit("before-draw-nav-cards", data);
  }
}

/**
 * only cap, liu and nav can use this method
 * take off the selected index (0 or 1) on cap or liu
 * the remaining ones are given to nav
 * if nav picked too, proceed to next stage
 */
function onPick(socket: Socket, data: any) {
  const user = socketService.findBySocketId(socket.id);
  const room = user.room;
  const navCards = navCardsService.getOrDefault(room);
  const game = gameService.findByRoom(room);
  const users = game.users;
  const userIdx = users.findIndex((u) => u.username === user.username);
  const { captain, liutenant, navigator } =
    identityService.findNavTeamByRoom(room);
  const drawNavCard = drawNavCardsData[room];

  // verify user cap,liu and nav

  if (
    !(userIdx === captain || userIdx === liutenant || userIdx === navigator)
  ) {
    console.error(`draw-nav-cards onPick failed. User is not cap, liu or nav`);
    return;
  }

  // of the 2 cards, if user selects idx 0, means 1 will be discarded
  let { selected } = data;
  const discard = selected === 0 ? 1 : 0;

  let discardId = -1
  let arr:number[] = [];
  if (userIdx === captain && drawNavCard.captainDraws.length === 2) {
    arr = drawNavCard.captainDraws;
  } else if (userIdx === liutenant && drawNavCard.liutenantDraws.length === 2) {
    arr = drawNavCard.liutenantDraws;
  } else if (userIdx === navigator && drawNavCard.navigatorDraws.length === 2) {
    arr = drawNavCard.navigatorDraws;
  }
  
  if (arr.length === 0 && !arr.includes(discard)){
    throw new Error(`Invalid draw card!`);
  }

  discardId = arr[discard];
  navCardsService.removeFromDrawAndAddToDiscard(room, arr, discardId);

  // since the moment navigator picks a card the ship moves, we can proceed to next service
  if (userIdx === navigator){
    console.log(`move ship`);
  }
  else {
    update(room);
  }
    
}

export default {
  init,
  update,
};
