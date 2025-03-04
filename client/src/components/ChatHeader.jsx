import { useAuthStore } from "@/store/useAuthStore";
import { useChatStore } from "@/store/useChatStore";
import { Phone, Video, X } from "lucide-react";
import React from "react";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { useCallStore } from "@/store/useCallStore";

export default function ChatHeader() {
  const { selectedUser, setViewProfile, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const { startCall } = useCallStore();

  console.log("selected user", selectedUser);

  const handleCall = (type) => {
    if (!selectedUser) return;
    startCall(selectedUser, type);
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

        <div className='flex gap-2'>
          <Button
            variant='outline'
            size='icon'
            className='rounded-full'
            onClick={() => handleCall("audio")}
          >
            <Phone className='size-4 text-primary' />
          </Button>
          <Button
            variant='outline'
            size='icon'
            className='rounded-full'
            onClick={() => handleCall("video")}
          >
            <Video className='size-4 text-primary' />
          </Button>
        </div>

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
  );
}
