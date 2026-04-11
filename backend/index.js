import express from "express";
import { connectDB } from "./db.js";
import cors from "cors";
import { verifyJwt } from "./middleware/auth.js";
import http from 'http';

import authRouter from "./routes/authRoutes.js";
import chatRouter from "./routes/chatRoutes.js";
import usersRouter from "./routes/usersRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import { initSocket } from "./socket.js";

const app = express();
const port = 3000;

app.use (cors({
  origin: "http://localhost:5173"
}))
app.use(express.json());

await connectDB();

app.use("/api/user", authRouter)

app.use("/api/users", verifyJwt, usersRouter)

app.use("/api/chats", verifyJwt, chatRouter)

app.use("/api/messages", verifyJwt, messageRouter)

const server = http.createServer(app);

initSocket(server);

server.listen(port,()=>console.log("Server is running"))