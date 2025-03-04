import { axiosInstance } from '@/lib/axios'
import toast from 'react-hot-toast'
import {create} from 'zustand'

const BASE_URL = import.meta.env.MODE === "development" ? import.meta.env.VITE_SERVER_URL : "/";

export const useMediaStore = create((set, get) => ({
    userLoggedInMedia: [],
    selectedUserMedia: [],
    isLoading: false,

    fetchUserContent: async () => {
        try {
          set({ isLoading: true });
    
          // Fetch media content from the backend
          const response = await axiosInstance.get("/media");
    
          // Update local state with the fetched media
          set({ userLoggedInMedia: response.data.media });
        } catch (error) {
          console.error("Error fetching user content:", error);
          toast.error("Failed to fetch user content");
        } finally {
          set({ isLoading: false });
        }
    },

    fetchUserMedia: async (userId) => {
        try {
          set({ isLoading: true });
    
          // Fetch media content from the backend
          const response = await axiosInstance.get(`/media/user/${userId}`);
    
          // Return the fetched media
          set({selectedUserMedia: response.data.media})
        } catch (error) {
          console.error("Error fetching user media:", error);
          toast.error("Failed to fetch user media");
        } finally {
          set({ isLoading: false });
        }
      },
    

    uploadContent: async(title, description, files) => {
        try {
            set({isLoading: true});
            
            const response = await axiosInstance.post('/media', {
                title,
                description,
                files
            })

            set((state) => ({
                userLoggedInMedia: [response.data.media, ...state.userLoggedInMedia],
            }));
        
              toast.success("Media uploaded successfully");
        } catch (error) {
            console.error("Error uploading media:", error);
            toast.error(error.response?.data?.message || "Failed to upload media");
        } finally {
            set({ isLoading: false });
        }
    },
}))