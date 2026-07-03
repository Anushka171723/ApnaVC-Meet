import express from 'express';
import 'dotenv/config';
import {createServer} from "node:http";
import {Server} from "socket.io";
import mongoose from 'mongoose';
import cors from 'cors';
import {connectToSocket} from './controllers/socketManager.js';
import userRoutes from './routes/users.routes.js';
const app = express();
const server = createServer(app);
const io = connectToSocket(server);
app.set("port", process.env.PORT || 8000);
app.use(cors());
app.use(express.json({limit: "40kb"}));
app.use(express.urlencoded({limit:"40kb", extended: true}));
app.use("/api/v1/users", userRoutes);
const start = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI environment variable is required");
    }

    const connectionDb = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`MONGO Connected DB Host: ${connectionDb.connection.host}`);

    server.listen(app.get("port"), () => {
      console.log("Server running on port " + app.get("port"));
    });

  } catch (error) {
    console.error("DB ERROR:", error);
  }
};
start();

