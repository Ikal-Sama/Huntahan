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

    // Handle user calling another user
   socket.on("callUser", async ({ userToCall, signalData, from, name }) => {
    try {
      console.log("callUser event received:", { userToCall, signalData, from, name });

    if (!userToCall) {
      console.log("Error: userToCall is undefined.");
      return;
    }

    const caller = await User.findById(from);
    if (!caller) {
      console.log("Error: Caller not found.");
      return;
    }

    const profilePic = caller.profilePic;
    const receiverSocketId = getReceiverSocketId(userToCall);
    console.log("Receiver Socket ID:", receiverSocketId);
    console.log("Signal Data:", signalData);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("callIncoming", {
        signalData, 
        from,
        name,
        profilePic,
      });
      console.log(`Emitting callIncoming to ${userToCall}`);
    } else {
      console.log(`User ${userToCall} is not online`);
    }
  } catch (error) {
    console.error("Error in callUser handler:", error);
  }
});


  // Handle answering a call
  socket.on("answerCall", ({ to, signal }) => {
    const callerSocketId = getReceiverSocketId(to);
    if (callerSocketId) {
      io.to(callerSocketId).emit("callAccepted", signal);
    }
  });

  // Handle call rejection
  socket.on("rejectCall", ({ to }) => {
    const callerSocketId = getReceiverSocketId(to);
    if (callerSocketId) {
      io.to(callerSocketId).emit("callRejected");
    }
  });

  // Handle call disconnection
  socket.on("endCall", ({ to }) => {
    const receiverSocketId = getReceiverSocketId(to);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("callEnded");
    }
  });
  

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