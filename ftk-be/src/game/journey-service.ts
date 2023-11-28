import { Socket } from "socket.io";
import gameService from "./game-service";

function init(socket: Socket) {
  socket.on("", (data: any) => {

  });
}

function updateJourney(room: string) {
  const game = gameService.findByRoom(room);
  const users = game.users;
}
