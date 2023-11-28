import shuffler from "../util/shuffler";
import gameService from "./game-service";

interface NavCard {
  id: number;
  name: string;
}

interface NavCards {
  [room: string]: {
    drawPile: NavCard[];
    discardPile: NavCard[];
    resumes: {
      [userIdx: number]: number[];
    };
  };
}

const navCardsData: NavCards = {};

function findNavCardsByRoom(room: string) {
  if (!navCardsData[room]) {
    throw new Error(
      `nav-cards method findNavCardsByRoom failed. Room ${room} not found`
    );
  }

  return navCardsData[room];
}

function init(room: string) {
  const navCards = findNavCardsByRoom(room);
}

function getOrDefault(room: string) {
  if (!navCardsData[room]) {
    let drawPile: NavCard[] = [];
    for (let i = 0; i < 5; i++) {
      drawPile.push({ id: i, name: "northCultUprising" });
    }
    for (let i = 5; i < 8; i++) {
      drawPile.push({ id: i, name: "eastDrunk" });
    }
    for (let i = 8; i < 10; i++) {
      drawPile.push({ id: i, name: "eastDisarmed" });
    }
    for (let i = 10; i < 15; i++) {
      drawPile.push({ id: i, name: "westDrunk" });
    }
    for (let i = 15; i < 17; i++) {
      drawPile.push({ id: i, name: "westMermaid" });
    }
    for (let i = 17; i < 19; i++) {
      drawPile.push({ id: i, name: "westTelescope" });
    }

    drawPile = shuffler.shuffleArray(drawPile);

    const totalUsers = gameService.findByRoom(room).users.length;

    const resumes: { [userIdx: number]: number[] } = {};
    for (let i = 0; i < totalUsers; i++) {
      resumes[i] = [];
    }

    navCardsData[room] = {
      drawPile,
      discardPile: [],
      resumes,
    };
  }

  return navCardsData[room];
}

/** used when phase just transitioned to The Navigation */
function mergeDiscardsAndDraw(room: string) {

  const {drawPile, discardPile} = navCardsData[room];
  
  drawPile.push(...discardPile);

  const shuffledDrawPile = shuffler.shuffleArray(drawPile);

  drawPile.length = 0
  drawPile.push(...shuffledDrawPile);

}

/** 
 * drawPile is either cap, liu or nav  
 * dicardId refers to interface NavCard.id 
 */
function removeFromDrawAndAddToDiscard(room:string, drawPile:number[], discardId:number){
  
  const idx = drawPile.findIndex(x=>x === discardId);
  
  const toBeDiscardNavCard = navCardsData[room].drawPile[idx]

  // remove from drawPile
  drawPile.splice(idx,1);

  const navCard = navCardsData[room];

  navCard.discardPile.push(toBeDiscardNavCard)

}

export default {
  init,
  getOrDefault,
  mergeDiscardsAndDraw,
  removeFromDrawAndAddToDiscard
};
