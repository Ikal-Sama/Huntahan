import { axiosInstance } from '@/lib/axios';
import toast from 'react-hot-toast';
import { create } from 'zustand';
import { io } from 'socket.io-client';
import Peer from 'simple-peer';

console.log("WebRTC supported:", !!navigator.mediaDevices && !!navigator.mediaDevices.getUserMedia);
console.log("SimplePeer:", Peer);


const BASE_URL = import.meta.env.MODE === "development" ? import.meta.env.VITE_SERVER_URL : "/";

const storedFriendRequests = localStorage.getItem("friendRequests");

export const useAuthStore = create((set, get) => ({
  authUser: null,
  incomingCall: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  onlineUsers: [],
  isCheckingAuth: true,
  socket: null,
  friendRequests: storedFriendRequests && storedFriendRequests !== "undefined"
    ? JSON.parse(storedFriendRequests)
    : [],
  acceptanceNotifications: [],
  localStream: null,
  remoteStream: null,
  peer: null,
  isCallActive: false,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });

      const friendRequestsRes = await axiosInstance.get('/auth/friend-requests');
      const fetchedFriendRequests = Array.isArray(friendRequestsRes.data) ? friendRequestsRes.data : [];
      set({ friendRequests: fetchedFriendRequests });
      localStorage.setItem("friendRequests", JSON.stringify(fetchedFriendRequests)); // Update localStorage

      get().connectSocket();
      get().listenForIncomingCall();

    } catch (error) {
      console.error("Error in checkAuth:", error);
      set({ authUser: null, friendRequests: [] });
      localStorage.removeItem("friendRequests"); // Clear localStorage on error
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });

      await get().fetchFriendRequests();
      
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed");
      set({ authUser: null, friendRequests: [] });
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });

      await get().fetchFriendRequests();
      get().connectSocket();
      toast.success("Logged in successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null, friendRequests: [] });
      localStorage.removeItem("friendRequests"); // Clear localStorage
      get().disconnectSocket();
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Logout failed");
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  fetchFriendRequests: async () => {
    try {
      const res = await axiosInstance.get("/auth/friend-requests");
      console.log("Fetched friend requests:", res.data);
      const fetchedFriendRequests = Array.isArray(res.data) ? res.data : [];
      set({ friendRequests: fetchedFriendRequests });
      localStorage.setItem("friendRequests", JSON.stringify(fetchedFriendRequests)); // Update localStorage
    } catch (error) {
      console.error("Error fetching friend requests:", error);
      set({ friendRequests: [] });
    }
  },

  connectSocket: () => {
    const { authUser, socket } = get();
    if (!authUser) return; // No user logged in, no need to connect
  
    if (socket && socket.connected) return; // Already connected
  
    const newSocket = io(BASE_URL, { query: { userId: authUser._id } });
    set({ socket: newSocket });
  
    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id);
    });
  
    newSocket.on("disconnect", () => {
      console.log("Socket disconnected");
    });
  
    newSocket.on("getOnlineUsers", (userIds) => set({ onlineUsers: userIds }));


    newSocket.on("callIncoming", (data) => {
      console.log("Incoming call:", data);
      toast(`Incoming call from ${data.name}`);
      set({ incomingCall: data });
    });

  
      newSocket.on("friendRequest", (data) => {
        if (data.senderId !== authUser._id) {
            set((state) => {
                const updatedRequests = [...state.friendRequests, data];
                localStorage.setItem("friendRequests", JSON.stringify(updatedRequests));
                return { friendRequests: updatedRequests };
            });
        }
    });

    newSocket.on("friendRequestAccepted", (data) => {
        console.log("Received friendRequestAccepted event:", data);
        set((state) => ({
            acceptanceNotifications: [...state.acceptanceNotifications, {
                message: `${data.recipientName} accepted your friend request.`,
                recipientId: data.recipientId,
                recipientName: data.recipientName,
                recipientProfilePic: data.recipientProfilePic
            }],
        }));
    });
  
    newSocket.on("friendRequestDeclined", (data) => {
      toast.error(`${data.recipientName} declined your friend request.`);
    });

  
    newSocket.connect();
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket?.connected) socket.disconnect();
  },

  addFriend: async (friendId) => {
    try {
      const { authUser } = get();
      if (!authUser) return toast.error("You must be logged in to add a friend");
  
      await axiosInstance.post(`/auth/addfriend/${friendId}`);
      await get().fetchFriendRequests(); // Refresh friend requests after adding
      toast.success("Friend request sent");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add friend");
    }
  },

  acceptFriendRequest: async (senderId) => {
    try {
      const { socket, authUser  } = get();
      const response = await axiosInstance.post(`/auth/acceptfriend/${senderId}`);
  
      if (response.data && response.data.message === "Friend request accepted") {
        // Update the local state to remove the accepted friend request
        set((state) => ({
          friendRequests: state.friendRequests.filter(
            (request) => request.senderId !== senderId
          ),
        }));
  
        // Notify the sender via socket
        socket?.emit("friendRequestAccepted", {
          senderId,
          recipientName: authUser ?.fullName,
          recipientProfilePic: authUser ?.profilePic,
        });
  
        // Show success toast
        toast.success("Friend request accepted");
      } else {
        toast.error("Failed to accept friend request: Invalid response from server");
      }
    } catch (error) {
      console.error("Error accepting friend request:", error);
      toast.error(error.response?.data?.message || "Failed to accept friend request");
    }
  },

  cancelFriendRequest: async (friendId) => {
  try {
    await axiosInstance.post(`/auth/cancelfriend/${friendId}`);
    await get().fetchFriendRequests(); // Refresh friend requests after canceling
    toast.success("Friend request canceled");
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to cancel friend request");
  }
},

  declineFriendRequest: async (senderId) => {
    try {
      const { socket } = get();
      await axiosInstance.post(`/auth/declinefriend/${senderId}`);
      await get().fetchFriendRequests();
      socket?.emit("declineFriendRequest", { senderId });
      toast.success("Friend request declined");
    } catch (error) {
      toast.error("Failed to decline friend request");
    }
  },

  unFriend : async(friendId) => {
    try {
      const {authUser} = get();
      if (!authUser) return toast.error("You must be logged in to unfriend someone");
      await axiosInstance.delete(`/auth/unfriend/${friendId}`)

      // Update the local state to remove the friend
      set((state) => ({
        authUser: {
          ...state.authUser,
          friends: state.authUser.friends.filter((id) => id.toString() !== friendId)
        }
      }))
      toast.success("Unfriended successfully");
    } catch (error) {
      console.error("Error unfriending:", error);
      toast.error(error.response?.data?.message || "Failed to unfriend");
    }
  },  

  removeFriendRequest: (senderId) => {
    set((state) => ({
      friendRequests: state.friendRequests.filter((request) => request.senderId !== senderId),
    }));
  },

  startCall: async (receiverId) => {
    console.log("Start CALL IS CALLED:", receiverId);
    
    const { authUser, socket } = get();
    console.log("SOCKET CONNECTION:", socket);
  
    if (!authUser || !socket) return;
    if (!receiverId) {
      console.error("receiverId is undefined in startCall.");
      return;
    }
  
    try {
      console.log("Accessing media....");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log("Microphone access granted:", stream);
      console.log("Stream active:", stream.active);
      console.log("Stream tracks:", stream.getTracks());
      set({ localStream: stream });
  
      console.log("Creating peer....");
      
      const peerSignal = new Peer({ initiator: true, trickle: false, stream: stream});
      console.log("Peer object created:", peerSignal);
    
      peerSignal.on('signal', (data) => {
        console.log("Generated signal:", data);
        console.log("Emitting callUser:", {
          from: authUser._id,
          userToCall: receiverId,
          name: authUser.fullName,
          profilePic: authUser.profilePic,
          signalData: data
        });
        socket.emit('callUser', {
          from: authUser._id,
          userToCall: receiverId,
          name: authUser.fullName,
          profilePic: authUser.profilePic,
          signalData: data
        });
      });
  
      peerSignal.on('stream', (remoteStream) => {
        console.log("Remote stream received:", remoteStream);
        set({ remoteStream });
      });
  
      peerSignal.on('close', () => {
        console.log("Peer connection closed.");
        set({ peer: null, remoteStream: null, localStream: null, isCallActive: false });
      });

      peerSignal.on('error', (error) => {
        console.error("Peer error:", error);
        toast.error('Peer connection error.');
      });
  
  
      socket.on('callAccepted', (signal) => {
        console.log("Call accepted, signaling peer:", signal);
        peerSignal.signal(signal);
        set({ isCallActive: true });
      });

      
  
      set({ peer: peerSignal });
      toast.success("Calling...");
    } catch (error) {
      console.error('Error starting call:', error.message);
      toast.error('Failed to start call.');
      
    }
  },
  
  listenForIncomingCall: () => {
    const { socket } = get();
    if (!socket) return;
  
    socket.on("callIncoming", (data) => {
      console.log("Incoming call data:", data);
      toast(`Incoming call from ${data.name}`);
      set({ incomingCall: data });
    });
  },
  
  acceptCall: async () => {
    const { socket, incomingCall, authUser } = get();
    if (!socket || !incomingCall) return;

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        set({ localStream: stream });

        const peer = new SimplePeer({ initiator: false, trickle: false, stream });

        peer.on('signal', (signal) => {
            socket.emit('answerCall', { signal, to: incomingCall.from });
        });

        peer.on('stream', (remoteStream) => {
            set({ remoteStream });
        });

        peer.on('close', () => {
            set({ peer: null, remoteStream: null, localStream: null, isCallActive: false });
        });

        socket.on('callAccepted', (signal) => {
            peer.signal(signal);
            set({ isCallActive: true });
        });

        set({ peer });

        socket.emit("answerCall", { from: incomingCall.to, to: incomingCall.from });

        set({ incomingCall: null });
        toast.success("Call accepted");

    } catch (error) {
        console.error('Error accepting call:', error);
        toast.error('Failed to accept call.');
        set({ incomingCall: null });
    }
},

rejectCall: () => {
  const { socket, incomingCall } = get();
  if (!socket || !incomingCall) return;

  socket.emit("rejectCall", { from: incomingCall.to, to: incomingCall.from });

  set({ incomingCall: null });
  toast.error("Call rejected");
},

endCall: () => {
  const { peer, localStream } = get();
  if (peer) {
      peer.destroy();
      set({ peer: null, remoteStream: null, localStream: null, isCallActive: false });
  }
  if(localStream){
      localStream.getTracks().forEach(track => track.stop());
  }
},

}));