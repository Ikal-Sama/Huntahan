import { MessageSquare } from "lucide-react";
import React from "react";

export default function NoChatSelected() {
  return (
    <div className='flex h-full flex-1 justify-center items-center '>
      <div className='flex flex-col items-center  gap-2 group'>
        <div className='bg-primary/10 rounded-xl size-12 flex justify-center items-center group-hover:bg-primary/20 transition-colors'>
          <MessageSquare size={40} className='text-primary/70' />
        </div>
        <h1 className='text-primary/40 text-2xl font-bold'>
          Welcome to Huntahan!
        </h1>
        <p className='text-muted-foreground text-md'>
          Select a conversation to start chatting
        </p>
      </div>
    </div>
  );
}
