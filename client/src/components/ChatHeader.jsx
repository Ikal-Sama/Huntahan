import { useAuthStore } from "@/store/useAuthStore";
import { useChatStore } from "@/store/useChatStore";
import { X } from "lucide-react";
import React from "react";
import { Button } from "./ui/button";

export default function ChatHeader() {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();
  return (
    <div className='p-2.5 border-b border-slate-700'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3 '>
          {/* Avatar */}
          <div className='relative'>
            <div className='w-10 h-10 rounded-full relative'>
              <img
                src={selectedUser.profilePic || "./avatar.png"}
                alt={selectedUser.fullName}
                className='rounded-full w-10 h-10 absolute'
              />
            </div>
          </div>

          {/* User Info */}
          <div className=''>
            <h3 className='font-medium text-primary'>
              {selectedUser.fullName}
            </h3>
            <p className='text-sm text-muted-foreground'>
              {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
            </p>
          </div>
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
