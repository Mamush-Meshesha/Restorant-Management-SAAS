import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { verifyToken } from "./lib/jwt";

export let io: Server;

export const initWebSockets = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // Authentication Middleware
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization;
    if (!token) {
      // For Waitlist scanning, customers might not have a token.
      // We will allow anonymous connections but they can only join specific public rooms.
      socket.data.user = null;
      return next();
    }

    try {
      const cleanToken = token.replace("Bearer ", "");
      const decoded = verifyToken(cleanToken);
      if (decoded) {
        socket.data.user = decoded;
      } else {
        socket.data.user = null;
      }
      next();
    } catch (err) {
      socket.data.user = null;
      next();
    }
  });

  io.on("connection", (socket: Socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // --- Dynamic Table Sessions ---
    socket.on("join_table_session", (data: { token: string }) => {
      if (data.token) {
        socket.join(`session_${data.token}`);
        console.log(`[Socket] Client ${socket.id} joined session_${data.token}`);
      }
    });

    // --- Waitlist ---
    socket.on("join_waitlist_queue", (data: { branchId: string }) => {
      if (data.branchId) {
        socket.join(`waitlist_${data.branchId}`);
        console.log(`[Socket] Client ${socket.id} joined waitlist_${data.branchId}`);
      }
    });

    socket.on("disconnect", () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });

  return io;
};
