import { useAuthStore } from "@/store/useAuthStore";
import { Bell, Check, LogOut, Settings, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ModeToggle } from "./ModeToggle";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "./ui/button";

export default function Navbar() {
  const {
    logout,
    authUser,
    friendRequests,
    acceptFriendRequest,
    declineFriendRequest,
    fetchFriendRequests,
    acceptanceNotifications,
  } = useAuthStore();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [seenNotifications, setSeenNotifications] = useState(new Set());

  useEffect(() => {
    if (authUser) {
      fetchFriendRequests();
    }
  }, [authUser, fetchFriendRequests]);

  // Combine friend requests and acceptance notifications
  const allNotifications = [
    ...friendRequests.map((request) => ({
      type: "request",
      ...request,
    })),
    ...acceptanceNotifications.map((notification) => ({
      type: "acceptance",
      ...notification,
    })),
  ].sort((a, b) => {
    if (a.type === "request" && b.type === "acceptance") return -1;
    if (a.type === "acceptance" && b.type === "request") return 1;
    return 0;
  });

  // Mark notifications as seen when dropdown is opened
  useEffect(() => {
    if (isDropdownOpen) {
      const newSeenNotifications = new Set(seenNotifications);
      allNotifications.forEach((notification) => {
        if (notification.type === "request") {
          newSeenNotifications.add(notification.senderId);
        } else if (notification.type === "acceptance") {
          newSeenNotifications.add(notification.recipientId);
        }
      });
      setSeenNotifications(newSeenNotifications);
    }
  }, [isDropdownOpen]);

  // Calculate the number of unseen notifications
  const unseenNotificationsCount = allNotifications.filter((notification) => {
    if (notification.type === "request") {
      return !seenNotifications.has(notification.senderId);
    } else if (notification.type === "acceptance") {
      return !seenNotifications.has(notification.recipientId);
    }
    return false;
  }).length;

  return (
    <header className='fixed w-full top-0 z-40 shadow-md backdrop-blur-lg bg-slate-900/70'>
      <div className='container mx-auto px-8 h-14'>
        <div className='flex items-center justify-between h-full'>
          <div className='flex items-center gap-8'>
            <Link
              to='/'
              className='flex items-center gap-2.5 hover:opacity-80 transition-all'
            >
              <div className='w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center'>
                <img src='./logo.png' alt='Logo' />
              </div>
              <h1 className='text-lg font-bold text-primary'>Huntahan</h1>
            </Link>
          </div>

          <div className='flex items-center gap-2'>
            <ModeToggle />

            {authUser && (
              <>
                <DropdownMenu onOpenChange={setIsDropdownOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size='icon'
                      variant='none'
                      className='rounded-full cursor-pointer relative text-primary hover:shadow hover:bg-slate-700'
                    >
                      <Bell size={20} />
                      {unseenNotificationsCount > 0 && (
                        <span className='absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-1'>
                          {unseenNotificationsCount}
                        </span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className='ml-5'>
                    <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {allNotifications.length === 0 ? (
                      <DropdownMenuItem className='text-xs text-zinc-500'>
                        No new notifications.
                      </DropdownMenuItem>
                    ) : (
                      allNotifications.map((notification, index) => (
                        <DropdownMenuItem
                          key={index}
                          className='flex items-center justify-between'
                        >
                          {notification.type === "request" ? (
                            <>
                              <div className='avatar'>
                                <div className='size-7'>
                                  <img
                                    src={
                                      notification.senderProfilePic
                                        ? notification.senderProfilePic
                                        : "./avatar.png"
                                    }
                                    alt=''
                                  />
                                </div>
                              </div>
                              <span className='text-xs'>
                                {notification.senderName}
                              </span>
                              <div className='flex gap-2'>
                                <div
                                  className='text-sm rounded-full cursor-pointer bg-primary p-1 hover:bg-yellow-500 transition-colors duration-200 ease-in-out'
                                  onClick={() =>
                                    acceptFriendRequest(notification.senderId)
                                  }
                                >
                                  <Check className='text-accent-foreground' />
                                </div>
                                <div
                                  className='text-sm text-white rounded-full cursor-pointer bg-slate-200 p-1 hover:bg-slate-300 transition-colors duration-200 ease-in-out'
                                  onClick={() =>
                                    declineFriendRequest(notification.senderId)
                                  }
                                >
                                  <X className='text-red-500' />
                                </div>
                              </div>
                            </>
                          ) : (
                            <div className='flex items-center gap-1'>
                              <div className='avatar'>
                                <div className='size-7'>
                                  <img
                                    src={
                                      notification.recipientProfilePic ||
                                      "./avatar.png"
                                    }
                                    alt='profile pic'
                                  />
                                </div>
                              </div>

                              <span className='text-xs'>
                                {notification.message}
                              </span>
                            </div>
                          )}
                        </DropdownMenuItem>
                      ))
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size='icon' className='rounded-full cursor-pointer'>
                      <div className='avatar'>
                        <div className='size-8'>
                          <img
                            src={
                              authUser.ProfilePic
                                ? authUser.ProfilePic
                                : "./avatar.png"
                            }
                            alt=''
                          />
                        </div>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <Link to='/profile'>
                      <DropdownMenuItem className='cursor-pointer'>
                        <User />
                        Profile
                      </DropdownMenuItem>
                    </Link>
                    <Link to='/settings'>
                      <DropdownMenuItem className='cursor-pointer'>
                        <Settings />
                        Settings
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuItem
                      onClick={logout}
                      className='cursor-pointer'
                    >
                      <LogOut /> Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
