import { axiosInstance } from '@/lib/axios'
import toast from 'react-hot-toast'
import {create} from 'zustand'
import { useAuthStore } from './useAuthStore';
// import {socket} from 'socket.io-client'


export const useChatStore = create((set, get) => ({
    messages: [],
    users: [],
    friends: [],
    selectedUser: null,
    viewProfile: false,
    isUsersLoading: false,
    isMessagesLoading: false,


    getUsers: async() => {
        set({isUsersLoading: true});
        try {
            const res = await axiosInstance.get("/messages/users")
            set({users: res.data});

        } catch (error) {
            toast.error(error.response.data.message);
        }finally{ 
            set({isUsersLoading: false});
        }
    },

    getFriends: async () => {
        set({ isUsersLoading: true });
        try {
            const res = await axiosInstance.get("/messages/users/friends");
            console.log("Fetched friends:", res.data);
            set({ friends: res.data }); // Store friends instead of all users
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({ isUsersLoading: false });
        }
    },

    getMessages: async (userId) => {
        set({isMessagesLoading: true});
        try {
            const res = await axiosInstance.get(`/messages/${userId}`)
            set({messages: res.data});
        } catch (error) {
            toast.error(error.response.data.message);
        }finally {
        set({isMessagesLoading: false});
        }
    },

    sendMessage: async (messageData) => {
        const {selectedUser, messages} = get()
        try {
            const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData)
            set({messages: [...messages, res.data]})
        } catch (error) {
            toast.error(error.response.data.message)
        }
    },

    subscribeToMessages: () => {
        const {selectedUser} = get();
        if(!selectedUser) return;

        const socket = useAuthStore.getState().socket;

        
        socket.on("newMessage", (newMessage) => {
            if(newMessage.senderId !== selectedUser._id) return;
            set({messages: [...get().messages, newMessage]});
        })
    },

    unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        socket.off("newMessage");
    },

    setSelectedUser: (selectedUser) => set({ selectedUser, viewProfile: false }), 
    setViewProfile: (viewProfile) => set({ viewProfile }),
}))