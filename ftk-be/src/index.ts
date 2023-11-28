import axios from "axios";
import express, { NextFunction, Request, Response } from "express";
import path from "path";
import { CustomError } from "./custom-error";
import { decodeJwt, signToken, verifyToken } from "./jwt-util";
import mySocket from "./socket-service";

// this app should also be a websocket server and RabbitMQ server.
const app = express();
const port = process.env.PORT || 3000;
const http = require("http");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const server = http.createServer(app);
const { Server } = require("socket.io");

app.use(express.json());
app.use(cookieParser());

const corsOptions = {
  origin: "http://localhost:5173",
  methods: ["GET", "POST"],
  credentials: true,
};

app.use(cors(corsOptions));

const io = new Server(server, {
  cors: corsOptions,
});

app.get("/", (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.post("/login", (req, res) => {
  const { username } = req.body;
  res.cookie("username", username, { httpOnly: true });
  return res.json();
});

app.get("/authenticated", async (req: Request, res: Response, next) => {
  const { accessToken, ssoToken } = req.cookies;

  try {
    verifyToken(accessToken);
    return res.json();
  } catch (error: any) {
    if (ssoToken) {
      try {
        await axios.post(`${process.env.AUTH_SERVER}/verify-sso-token`, {
          ssoToken,
        });

        const decoded: any = decodeJwt(ssoToken);
        const { username, exp } = decoded;
        res.cookie("accessToken", signToken({ username, exp }), {
          httpOnly: true,
        });
        return res.json();
      } catch (error: any) {
        return next(new CustomError(401, error.cause?.message));
      }
    }

    return next(new CustomError(400, error.message));
  }
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err && err instanceof CustomError) {
    return res.status(err.status).json({ message: err.message });
  }
});

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "../public")));

server.listen(port, () => {
  mySocket.initSocketService(io);

  console.log(`Feed The Kraken Server running at http://localhost:${port}`);
});
