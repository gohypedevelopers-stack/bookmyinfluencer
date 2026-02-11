const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const socketIo = require("socket.io");
const express = require("express");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev, dir: __dirname });
const handle = app.getRequestHandler();

const PORT = process.env.PORT || 3000;

app.prepare().then(() => {
    const server = express();
    const httpServer = createServer(server);
    const io = socketIo(httpServer, {
        path: "/api/socket"
    });

    io.on("connection", (socket) => {
        console.log("Client connected:", socket.id);

        // Join a specific thread room
        socket.on("join-room", (room) => {
            socket.join(room);
            console.log(`User ${socket.id} joined room: ${room}`);
        });

        // Handle sending messages
        socket.on("send-message", (data) => {
            console.log("Message received:", data);
            socket.to(data.threadId).emit("new-message", data);
        });

        socket.on("typing", (data) => {
            socket.to(data.threadId).emit("typing", data);
        });

        socket.on("stop-typing", (data) => {
            socket.to(data.threadId).emit("stop-typing", data);
        });

        socket.on("message-read", (data) => {
            // data: { threadId, userId }
            socket.to(data.threadId).emit("message-read", data);
        });

        // --- Call Signaling ---

        socket.on("call-user", (data) => {
            // data: { userToCall, signalData, from, name }
            console.log(`Call from ${data.from} to ${data.userToCall}`);
            io.to(data.userToCall).emit("call-received", {
                signal: data.signalData,
                from: data.from,
                name: data.name
            });
        });

        socket.on("answer-call", (data) => {
            // data: { to, signal }
            io.to(data.to).emit("call-accepted", data.signal);
        });

        socket.on("reject-call", (data) => {
            io.to(data.to).emit("call-rejected");
        });

        socket.on("end-call", (data) => {
            // Notify the other user in the room/thread or specific user
            if (data.to) {
                io.to(data.to).emit("call-ended");
            }
        });

        socket.on("disconnect", () => {
            console.log("Client disconnected");
            socket.broadcast.emit("call-ended");
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
