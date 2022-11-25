const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer(app);

const io = new Server(server);

const userSocketMap = {}; //to store all the users data

const getAllConnectedClients = (roomId) => {
  return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
    (socketId) => {
      return {
        socketId,
        username: userSocketMap[socketId],
      };
    }
  );
};

io.on("connection", (socket) => {
  console.log("Socket Lag gya", socket.id);

  socket.on("join", ({ roomId, username }) => {
    userSocketMap[socket.id] = username;
    socket.join(roomId); //joinig new client
    const clients = getAllConnectedClients(roomId);
    clients.map(({ socketId }) => {
      //this is notify that someone has joined
      io.to(socketId).emit("joined", {
        clients,
        username,
        socketId: socket.id,
      });
    });
  });

  socket.on("code-change", ({ roomId, code }) => {
    socket.to(roomId).emit("code-change", { code }); //if it is io.to then it broadcasts to everyone including the current guy
  });

  socket.on("sync-code", ({ code, socketId }) => {
    // to a particular newly joined guy
    io.to(socketId).emit("code-change", { code }); //if it is io.to then it broadcasts to everyone including the current guy
  });

  socket.on("disconnecting", () => {
    const rooms = [...socket.rooms]; //get all rooms where client is and broadcast he is disconnecting
    rooms.forEach((roomId) => {
      socket.to(roomId).emit("disconnected", {
        socketId: socket.id,
        username: userSocketMap[socket.id],
      });
    });
    delete userSocketMap[socket.id];
    socket.leave();
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log("Bol na mc");
});
