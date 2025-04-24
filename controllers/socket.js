const { Server } = require("socket.io");

const onlineUsers = {}; // Store online users

const initSocket = server => {
  const io = new Server(server, {
    cors: { origin: "*" },
  });

  io.on("connection", socket => {
    console.log(`User Connected: ${socket.id}`);

    // Step 1. User Joins (Online)
    socket.on("userOnline", userId => {
      onlineUsers[userId] = { socketId: socket.id, lastSeen: new Date().toISOString() };
      console.log(`User ${userId} is online`);
      io.emit("updateUserStatus", onlineUsers); // Notify all clients
    });

    // Step 2. User Disconnects (Offline)
    socket.on("disconnect", () => {
      const userId = Object.keys(onlineUsers).find(key => onlineUsers[key].socketId === socket.id);
      if (userId) {
        delete onlineUsers[userId];
        console.log(` User ${userId} is offline`);
        io.emit("updateUserStatus", onlineUsers); // Notify all clients
      }
    });
  });

  return io;
};

module.exports = { initSocket, onlineUsers };
