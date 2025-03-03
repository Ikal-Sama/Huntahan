import { Server } from 'socket.io';
import http from 'http';
import express from 'express';
import User from '../models/user.model.js';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
  },
});

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// Used to store online users
const userSocketMap = {}; // {userId: socketId}

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) userSocketMap[userId] = socket.id;

  // Emit online users to all clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Handle friend request acceptance
  socket.on("acceptFriendRequest", async ({ senderId }) => {
    try {
      const recipient = await User.findById(userId); // Recipient's ID
      const sender = await User.findById(senderId); // Sender's ID

      if (!recipient || !sender) {
        return;
      }

      // Update the friend request status to "accepted"
      const friendRequest = recipient.friendRequests.find(
        (request) => request.senderId.toString() === senderId && request.status === "pending"
      );

      if (!friendRequest) {
        return;
      }

      friendRequest.status = "accepted";
      await recipient.save();

      // Add each other as friends
      if (!recipient.friends.includes(senderId)) {
        recipient.friends.push(senderId);
        await recipient.save();
      }

      if (!sender.friends.includes(userId)) {
        sender.friends.push(userId);
        await sender.save();
      }

      // Notify the sender that the request was accepted
      const senderSocketId = getReceiverSocketId(senderId);
      if (senderSocketId) {
        io.to(senderSocketId).emit("friendRequestAccepted", {
          recipientId: userId,
          recipientName: recipient.fullName,
        });
      }
    } catch (error) {
      console.log("Error accepting friend request:", error);
    }
  });

  // Handle user disconnect
  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };