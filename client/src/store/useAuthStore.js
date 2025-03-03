import { axiosInstance } from '@/lib/axios';
import toast from 'react-hot-toast';
import { create } from 'zustand';
import { io } from 'socket.io-client';

const BASE_URL = import.meta.env.MODE === "development" ? import.meta.env.VITE_SERVER_URL : "/";

const storedFriendRequests = localStorage.getItem("friendRequests");

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  onlineUsers: [],
  isCheckingAuth: true,
  socket: null,
  friendRequests: storedFriendRequests && storedFriendRequests !== "undefined"
    ? JSON.parse(storedFriendRequests)
    : [],

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });

      const friendRequestsRes = await axiosInstance.get('/auth/friend-requests');
      const fetchedFriendRequests = Array.isArray(friendRequestsRes.data) ? friendRequestsRes.data : [];
      set({ friendRequests: fetchedFriendRequests });
      localStorage.setItem("friendRequests", JSON.stringify(fetchedFriendRequests)); // Update localStorage

      get().connectSocket();
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
      get().connectSocket();
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
    if (!authUser || socket?.connected) return;

    const newSocket = io(BASE_URL, { query: { userId: authUser._id } });
    set({ socket: newSocket });

    newSocket.on("getOnlineUsers", (userIds) => set({ onlineUsers: userIds }));

    newSocket.on("friendRequest", (data) => {
      if (data.senderId !== authUser._id) { // Only add if the logged-in user is the recipient
        set((state) => {
          const updatedRequests = [...state.friendRequests, data];
          localStorage.setItem("friendRequests", JSON.stringify(updatedRequests)); // Update localStorage
          return { friendRequests: updatedRequests };
        });
      }
    });

    newSocket.on("sendFriendRequest", (data) => {
        if (data.recipientId === authUser._id) { // Only update if the logged-in user is the recipient
            set((state) => {
                const updatedRequests = [...state.friendRequests, {
                    senderId: data.senderId,
                    recipientId: data.recipientId,
                    status: "pending"
                }];
                localStorage.setItem("friendRequests", JSON.stringify(updatedRequests));
                return { friendRequests: updatedRequests };
            });
        }
    });

    newSocket.on("friendRequestAccepted", (data) => toast.success(`${data.recipientName} accepted your friend request!`));
    newSocket.on("friendRequestDeclined", (data) => toast.error(`${data.recipientName} declined your friend request.`));

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
      const { socket } = get();
      await axiosInstance.post(`/auth/acceptfriend/${senderId}`);
      await get().fetchFriendRequests(); // Refresh friend requests after accepting
      socket?.emit("acceptFriendRequest", { senderId });
      toast.success("Friend request accepted");
    } catch (error) {
      toast.error("Failed to accept friend request");
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

  removeFriendRequest: (senderId) => {
    set((state) => ({
      friendRequests: state.friendRequests.filter((request) => request.senderId !== senderId),
    }));
  },
}));