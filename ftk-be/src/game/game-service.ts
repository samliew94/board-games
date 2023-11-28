console.log("init game-service");

import { Socket } from "socket.io";
import { GAME_INFO } from "../game-info";
import socketService from "../socket-service";
import settingService from "./setting-service";
import { User } from "./user";
import userService from "./user-service";

export interface Game {
  [room: string]: {
    max: number;
    users: User[];
  };
}

const games: Game = {};

/**
 * handles `create-game`, `join-game`, `leave-game`, `kick`
 */
function init(socket: Socket) {
  socket.on("create-game", (data: any) => {
    createGame(socket, data);
  });

  socket.on("join-game", (data: any) => {
    const { room } = data;
    joinGame(socket, room);
  });

  socket.on("leave-game", () => {
    leaveGame(socket);
  });

  socket.on("kick", (data: any) => {
    const { username } = data;
    kick(socket, username);
  });

  socket.on("move", (data: any) => {
    const { username, up } = data;
    move(socket, username, up);
  });

  socket.on("start-game", (data: any) => {
    startGame(socket);
  });
}

async function updateLobby(room: string, data?: string) {
  const game = games[room];

  const io = socketService.getIo();
  const sockets = await io.in(room).fetchSockets();

  sockets.forEach((socket: Socket) => {
    const user = socketService.findBySocketId(socket.id);

    const host = user.username === game.users[0].username;

    const data = {
      host,
      start:
        game.users.length >= GAME_INFO.MIN_PLAYERS &&
        game.users.length <= GAME_INFO.MAX_PLAYERS,
      min: GAME_INFO.MIN_PLAYERS,
      users: game.users.map((u) => {
        const { username } = u;
        return { username, isHost: username === game.users[0].username };
      }),
    };

    console.log(`emitting to ${user.username} data: ${JSON.stringify(data)}`);

    socket.emit("lobby", data);
  });

  // io.to(room).emit("lobby", data);
}

function move(socket: Socket, username: string, up: boolean) {
  const user = socketService.findBySocketId(socket.id);
  const room = user.room;
  const game = findByRoom(room);
  const users = game.users;
  if (users[0].username !== user.username) {
    console.error(
      `move player failed. Non-host${user.username} attempted to move player`
    );
    return;
  }

  const idx = users.findIndex((u) => u.username === username);

  if (idx === -1) {
    console.error(
      `move player failed. Unable to find target username: ${username}`
    );
    return;
  }

  if ((idx === 0 && up) || (idx === users.length - 1 && !up)) return;

  const a = users[idx];
  const b = users[up ? idx-1 : idx+1];

  users[idx] = b
  users[up ? idx-1 : idx+1] = a

  updateLobby(room);

}

function gamesToArray() {
  const arr = [];

  for (const key in games) {
    const { max, users } = games[key];

    arr.push({
      room: key,
      host: users[0].username,
      total: users.length,
      max,
    });
  }

  arr.sort((a, b) =>
    a.room.localeCompare(b.room, undefined, { sensitivity: "base" })
  );
  return arr;
}

/**
 * everyone's who in the `main` room gets notified games
 */
function updateGameList() {
  const arr = gamesToArray();

  console.log(`updateGameList called`);
  console.log(`emitting ${JSON.stringify(arr)} to all in room 'main'`);

  const io = socketService.getIo();
  io.to("main").emit("games", arr);
}

function createGame(socket: Socket, data: any) {
  const user = socketService.findBySocketId(socket?.id);

  let room = "";

  while (!room || room in games) {
    room = genRandRoomCode();
  }

  games[room] = {
    max: 11,
    users: [user],
  };

  console.log(`${user.username} created game with roomCode ${room}`);
  joinGame(socket, room);
}

function joinGame(socket: Socket, room: string) {
  const user = socketService.findBySocketId(socket.id);
  if (!(room in games)) return;

  const game = games[room];

  if (game.users.length >= game.max) return;

  if (socket.rooms.has("main")) socket.leave("main");

  if (!game.users.find((x) => x.username === user.username)) {
    const lenUsers = game.users.length;
    game.users.push(user);
  }

  user.room = room;
  user.service = "lobby";

  socket.join(room);

  const io = socketService.getIo();
  io.to("main").emit("games", gamesToArray());
  updateLobby(room);
}

function leaveGame(socket: Socket) {
  const user = socketService.findBySocketId(socket.id);

  const room = user.room;

  if (!(room in games)) {
    console.log(
      `leaveGame unable to locate room: ${room}. User=${user.username}`
    );
    return;
  }

  const game = games[room];

  const i = game.users.findIndex((x) => x.username === user.username);

  if (i !== -1) {
    game.users.splice(i, 1);
    console.log(`game.users removed user ${user.username}`);
    socket.leave(room);
    user.room = "main";
    user.service = "game";
    socket.join(user.room);

    if (game.users.length === 0) {
      delete games[room];
    } else {
      updateLobby(room);
    }

    updateGameList();
  } else {
    console.log(`game.users unable to locate ${user.username} for removal `);
  }
}

function kick(socket: Socket, username: string) {
  const user = socketService.findBySocketId(socket.id);
  if (!user) {
    console.error(`Kicked failed. Unable to find user by socket: ${socket.id}`);
    return;
  }
  const room = user.room;
  if (!(room in games)) {
    console.error(`Kicked failed. Unable to find room: ${room}`);
    return;
  }

  const game = games[room];

  const firstUser = game.users[0];

  if (firstUser.username !== user.username) {
    console.error(
      `Kick failed. The socket user (${user.username}) who initiated the kick command is not the host.`
    );
  }

  if (firstUser.username === username) {
    console.error(
      `Kick failed. Host (${user.username}) attempted to self-kick.`
    );
  }

  const targetUser = userService.findByUsername(username);
  const targetSocket = targetUser?.socket!;
  console.log(
    `Kick conditions met. Kicking target user: ${username} socket.id: ${targetSocket.id}`
  );

  leaveGame(targetSocket);
}

function disconnecting(socket: Socket, reason: any) {
  const user = socketService.findBySocketId(socket.id);
  console.log(`${user.username} disconnecting (${socket.id})`);
}

function startGame(socket: Socket) {
  const user = socketService.findBySocketId(socket.id);
  const room = user.room;
  const game = games[room];
  if (game.users[0].username !== user.username) {
    console.error(
      `startGame failed. Non-host user: ${user.username} attempted to start game`
    );
    return;
  } else if (game.users.length < GAME_INFO.MIN_PLAYERS) {
    console.error(
      `startGame failed. Insufficient players. ${game.users.length}/${GAME_INFO.MIN_PLAYERS}`
    );
    return;
  } else if (game.users.length > GAME_INFO.MAX_PLAYERS) {
    console.error(
      `startGame failed. Too many players. ${game.users.length}/${GAME_INFO.MAX_PLAYERS}`
    );
    return;
  }

  console.log(`startGame all conditions met. Going to settings...`);

  for (const user of game.users) {
    user.service = "settings";
  }

  settingService.updateSettings(room);
}

function findByRoom(room: string) {

  const game = games[room];

  if (game){
    return game
  } else{
    throw new Error(`game-service method findByRoom failed. Room ${room} not found`);
  }
}

function genRandRoomCode() {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export default {
  init,
  updateGameList,
  // createGame,
  // joinGame,
  // leaveGame,
  // kick,
  updateLobby,
  disconnecting,
  findByRoom,
};
