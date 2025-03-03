import { useChatStore } from "@/store/useChatStore";
import React, { useEffect, useState } from "react";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { MessageCircle, UserMinus, UserPlus, Users } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "./ui/button";
import toast from "react-hot-toast";

export default function Sidebar() {
  const {
    getUsers,
    users,
    friends,
    selectedUser,
    setSelectedUser,
    isUsersLoading,
    getFriends,
  } = useChatStore();

  const { onlineUsers, authUser, addFriend, cancelFriendRequest } =
    useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [showAllUsers, setShowAllUsers] = useState(false);
  const [showMessages, setShowMessages] = useState(true);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      await getUsers();
      await getFriends(); // Ensure this is fetching friends correctly
      setRefresh((prev) => !prev); // Force re-render
    };
    fetchData();
  }, []);

  useEffect(() => {
    console.log("Current friends:", friends);
  }, [friends]);

  const handleAddFriend = async (friendId) => {
    try {
      if (!authUser) {
        toast.error("You must be logged in to add a friend");
        return;
      }
      console.log("Friends before update:", authUser.friends);
      await addFriend(friendId);
      // Update the authUser.friends state
      useAuthStore.setState((state) => ({
        authUser: {
          ...state.authUser,
          friends: Array.isArray(state.authUser.friends)
            ? [...state.authUser.friends, { user: friendId, status: "pending" }] // Add the new friend request
            : [{ user: friendId, status: "pending" }], // Initialize as an array if it's not already
        },
      }));
      await getUsers();
      setRefresh((prev) => !prev);
    } catch (error) {
      console.log("Error in handleAddFriend: ", error);
      toast.error(error.response?.data?.message || "Failed to add friend");
    }
  };

  const handleCancelFriendRequest = async (friendId) => {
    try {
      if (!authUser) {
        toast.error("You must be logged in to cancel a friend request");
        return;
      }
      await cancelFriendRequest(friendId);
      await getUsers();
      setRefresh((prev) => !prev);
    } catch (error) {
      console.log("Error in handleCancelFriendRequest: ", error);
      toast.error(
        error.response?.data?.message || "Failed to cancel friend request"
      );
    }
  };

  const filteredUsers = showMessages
    ? friends.filter((friend) => {
        if (!friend || !friend._id) return false;
        if (showOnlineOnly && !onlineUsers.includes(friend._id)) return false;
        return true; // Keep all friends since they are already accepted
      })
    : users.filter((user) => {
        if (showOnlineOnly && !onlineUsers.includes(user._id)) return false;
        const friendEntry = authUser?.friends?.find(
          (friend) => friend._id === user._id
        );
        return !friendEntry; // Show only users who are not yet friends
      });

  const handleShowMessages = () => {
    setShowMessages(true);
    setShowAllUsers(false);
    getFriends(); // Fetch only friends
  };

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className='h-full w-20 lg:w-72 border-r border-slate-700 bg-accent-foreground flex flex-col transition-all duration-200'>
      <div className='border-b border-slate-600 w-full p-5'>
        <div className='flex items-center gap-2'>
          <Users className='size-6 text-accent' />
          <span className='font-medium hidden lg:block text-accent'>
            Contacts
          </span>
        </div>

        {/* Online filter toggle */}
        <div className='mt-3 hidden lg:flex items-center justify-between gap-2'>
          <div className='flex items-center gap-2'>
            <label className='cursor-pointer flex items-center gap-1'>
              <input
                type='checkbox'
                checked={showOnlineOnly}
                onChange={(e) => setShowOnlineOnly(e.target.checked)}
                className='checkbox checkbox-xs checkbox-warning border'
              />

              <span className='text-xs text-yellow-700'>Show online only</span>
            </label>
            <span className='text-xs text-zinc-500'>
              ({onlineUsers.length - 1} online)
            </span>
          </div>

          <div className='flex gap-2 items-center'>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <div
                    className={`text-xs cursor-pointer transition-colors duration-200 ease-in-out ${
                      showMessages ? "text-primary" : "text-slate-400"
                    }`}
                    onClick={handleShowMessages}
                  >
                    <MessageCircle size={15} />
                  </div>
                </TooltipTrigger>
                <TooltipContent className=''>
                  <p className='text-xs'>Messages</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <div
                    className={`text-xs cursor-pointer transition-colors duration-200 ease-in-out ${
                      showAllUsers ? "text-primary" : "text-slate-400"
                    }`}
                    onClick={() => {
                      setShowAllUsers(true); // Enable add friends mode
                      setShowMessages(false); // Disable messages mode
                    }}
                  >
                    <UserPlus size={15} />
                  </div>
                </TooltipTrigger>
                <TooltipContent className=''>
                  <p className='text-xs'>Add friends</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>

      <div className='overflow-y-auto w-full py-3 scrollbar-custom'>
        {filteredUsers.map((user) => (
          <button
            key={user._id}
            onClick={() => setSelectedUser(user)}
            className={`w-full p-3 flex items-center justify-between gap-3 hover:bg-accent transition-colors cursor-pointer ${
              selectedUser?._id === user._id
                ? "bg-accent ring-1 ring-slate-600 "
                : ""
            }`}
          >
            <div className='flex gap-2 items-center'>
              <div className='relative mx-auto lg:mx-0'>
                <img
                  src={user.profilePic || "/avatar.png"} // Fallback image
                  alt={user.fullName}
                  className='size-12 object-cover rounded-full'
                />
                {onlineUsers.includes(user._id) && (
                  <span className='absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-zinc-900' />
                )}
              </div>

              {/* User Info - only available on larger screens */}
              <div className='hidden lg:block text-left min-w-0'>
                <div className='font-medium truncate text-primary'>
                  {user.fullName}
                </div>
                <div className='text-sm text-zinc-400'>
                  {onlineUsers.includes(user._id) ? "Online" : "Offline"}
                </div>
              </div>
            </div>
          </button>
        ))}

        {isUsersLoading ? (
          <div className='text-center text-zinc-500 py-4'>Loading...</div>
        ) : (
          filteredUsers.length === 0 && (
            <div className='text-center text-zinc-500 py-4'>
              {showAllUsers
                ? "No users found"
                : showMessages
                ? "No friends to message"
                : "No friends online"}
            </div>
          )
        )}
      </div>
    </aside>
  );
}
