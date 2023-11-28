console.log("init user-service");

import { Socket } from "socket.io";
import { User } from "./user";

const users: User[] = [];

function findByUsername(username: string) {
  return users.find((u) => u.username === username);
}

function findAll() {
  return users;
}

function createOrUpdateUser(username: string, socket: Socket) {
  const user = findByUsername(username);

  if (user) {
    user.socket = socket;
    return user;
  }

  const newUser: User = {
    username,
    socket,
    room: "main", // which room is user in?
    service: "game", // which foo-service.ts is managing?
  };
  users.push(newUser);
  return newUser;
}

export default {
  findByUsername,
  createOrUpdateUser,
  findAll,
};
