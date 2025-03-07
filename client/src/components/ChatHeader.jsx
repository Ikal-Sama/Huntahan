import { useAuthStore } from "@/store/useAuthStore";
import { useChatStore } from "@/store/useChatStore";
import { Phone, Video, X } from "lucide-react";
import React from "react";
import { Button } from "./ui/button";

export default function ChatHeader() {
  const { selectedUser, setViewProfile, setSelectedUser } = useChatStore();
  const { onlineUsers, authUser, startCall } = useAuthStore();

  const handleVoiceCall = async () => {
    if (!selectedUser?._id) {
      console.error("selectedUser._id is undefined. Cannot start call.");
      return; // Prevent call if _id is missing
    }
    console.log("Starting voice call with selectedUser._id:", selectedUser._id);
    await startCall(selectedUser._id, false); // false for voice-only call
  };

  const handleVideoCall = async () => {
    if (!selectedUser?._id) {
      console.error("selectedUser._id is undefined. Cannot start call.");
      return; // Prevent call if _id is missing
    }
    console.log("Starting video call with selectedUser._id:", selectedUser._id);
    await startCall(selectedUser._id, true); // true for video call
  };

  return (
    <div className='p-2.5 border-b border-slate-700'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          {/* Avatar */}
          <div
            className='relative cursor-pointer'
            onClick={() => setViewProfile(true)}
          >
            <div className='w-10 h-10 rounded-full relative'>
              <img
                src={selectedUser.profilePic || "./avatar.png"}
                alt={selectedUser.fullName}
                className='rounded-full w-10 h-10 absolute'
              />
            </div>
          </div>

          {/* User Info */}
          <div className='cursor-pointer' onClick={() => setViewProfile(true)}>
            <h3 className='font-medium text-primary'>
              {selectedUser.fullName}
            </h3>
            <p className='text-sm text-muted-foreground'>
              {onlineUsers.includes(selectedUser._id) ? (
                <span className='text-green-500'>Online</span>
              ) : (
                <span className='text-sm'>Offline</span>
              )}
            </p>
          </div>
        </div>

        <div className='flex gap-1 items-center'>
          {/* Voice Call Button */}
          <Button
            variant='ghost'
            size='icon'
            className='rounded-full cursor-pointer group'
            onClick={handleVoiceCall}
          >
            <Phone className='size-5 text-primary group-hover:text-accent-foreground transition-colors duration-300 ease-in-out' />
          </Button>

          {/* Video Call Button */}
          <Button
            variant='ghost'
            size='icon'
            className='rounded-full cursor-pointer group'
            onClick={handleVideoCall}
          >
            <Video className='size-5 text-primary group-hover:text-accent-foreground transition-colors duration-300 ease-in-out' />
          </Button>

          {/* Close button */}
          <Button
            variant='outline'
            size='icon'
            onClick={() => setSelectedUser(null)}
            className='rounded-full cursor-pointer'
          >
            <X className='size-4 text-primary' />
          </Button>
        </div>
      </div>
    </div>
  );
}
