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
    socket.on("callUser", async ({ userToCall, signalData, from, name, profilePic, isVideoCall }) => {
      const receiverSocketId = getReceiverSocketId(userToCall);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("callIncoming", {
          signalData,
          from,
          name,
          profilePic,
          isVideoCall, // Relay call type to the receiver
        });
      }
      console.log("Caller data:", userToCall, signalData, from, name, profilePic, isVideoCall);
      
    });

  // Handle answering a call
  socket.on("answerCall", async (data) => {
    console.log("Answer Call:", data);
    const callerSocketId = getReceiverSocketId(data.to);
    if (callerSocketId) {
      try {
        const caller = await User.findById(data.to); // Retrieve caller's profile
        const receiver = await User.findById(data.from); // Retrieve receiver's profile
  
        // Send caller's profile to the receiver
        io.to(callerSocketId).emit("callAccepted", {
          signal: data.signal,
          receiverName: data.receiverName,
          receiverProfilePic: data.receiverProfilePic,
          callerProfile: { // Send the caller's profile to the receiver
            name: caller.fullName,
            profilePic: caller.profilePic,
          },
        });
  
        // Send receiver's profile to the caller
        const receiverSocketId = getReceiverSocketId(data.from);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("callerProfile", {
            name: receiver.fullName,
            profilePic: receiver.profilePic,
          });
        }
      } catch (error) {
        console.error("Error retrieving profiles:", error);
      }
    } else {
      console.error("Caller socket ID not found for user:", data.to);
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