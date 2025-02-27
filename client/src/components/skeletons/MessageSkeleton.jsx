import React from "react";
import { Skeleton } from "../ui/skeleton";

export default function MessageSkeleton() {
  const skeletonMessages = Array(6).fill(null);
  return (
    <div className='flex-1 overflow-y-auto p-4 space-y-4 scrollbar-custom'>
      {skeletonMessages.map((_, idx) => (
        <div
          key={idx}
          className={`flex gap-3 ${
            idx % 2 === 0 ? "flex-row items-end" : "flex-row-reverse items-end"
          }`}
        >
          <div className='chat-image avatar'>
            <div className='size-10 rounded-full'>
              <Skeleton className='size-10 w-full rounded-full' />
            </div>
          </div>

          <div>
            <div className='chat-header mb-1'>
              <Skeleton className='h-4 w-16' />
            </div>

            <div className='chat-bubble bg-transparent p-0'>
              <Skeleton className='h-16 w-[200px]' />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
