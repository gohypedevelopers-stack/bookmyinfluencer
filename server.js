const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const socketIo = require("socket.io");
const express = require("express");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const PORT = process.env.PORT || 3000;

app.prepare().then(() => {
    const server = express();
    const httpServer = createServer(server);
    const io = socketIo(httpServer);

    io.on("connection", (socket) => {
        console.log("Client connected:", socket.id);

        // Join a specific thread room
        socket.on("join_room", (room) => {
            socket.join(room);
            console.log(`User ${socket.id} joined room: ${room}`);
        });

        // Handle sending messages
        socket.on("send_message", (data) => {
            console.log("Message received:", data);
            // Broadcast to everyone in the room EXCEPT sender (usually sender adds optimistic UI)
            // OR broadcast to everyone including sender if we want single source of truth
            // For now, let's broadcast to the room so the receiver gets it.
            socket.to(data.room).emit("receive_message", data);
        });

        socket.on("disconnect", () => {
            console.log("Client disconnected");
        });
    });

    server.all(/(.*)/, (req, res) => {
        return handle(req, res);
    });

    httpServer.listen(PORT, (err) => {
        if (err) throw err;
        console.log(`> Ready on http://localhost:${PORT}`);
    });
});
