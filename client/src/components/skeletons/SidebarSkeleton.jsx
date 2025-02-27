import { Users } from "lucide-react";
import React from "react";
import { Skeleton } from "../ui/skeleton";

export default function SidebarSkeleton() {
  const skeletonContacts = Array(8).fill(null);
  return (
    <aside className='h-full w-20 lg:w-72 border-r border-slate-700 flex flex-col transition-all duration-200'>
      {/* Header */}
      <div className='border-b border-slate-700 w-full p-5'>
        <div className='flex items-center gap-2'>
          <Users className='w-6 h-6' />
          <span className='font-medium hidden lg:block'>Contacts</span>
        </div>
      </div>

      {/* Skeleton Contacts */}
      <div className='overflow-y-auto w-full py-3 scrollbar-custom'>
        {skeletonContacts.map((_, idx) => (
          <div key={idx} className='w-full p-3 flex items-center gap-3'>
            {/* Avatar Skeleton */}
            <div className='relative mx-auto lg:mx-0'>
              <Skeleton className='rounded-full size-12' />
            </div>

            {/* user info skelton  - only visible larger screens */}
            <div className='hidden lg:block text-left min-w-0 flex-1'>
              <Skeleton className='w-32 h-4 mb-2' />
              <Skeleton className='w-32 h-4 mb-2' />
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
