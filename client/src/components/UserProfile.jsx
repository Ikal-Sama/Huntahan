import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { UserPlus, UserMinus, User } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import MediaItem from "./MediaItem";
import { useMediaStore } from "@/store/useMediaStore";

export default function UserProfile({ selectedUser }) {
  const {
    authUser,
    friendRequests = [],
    isCheckingAuth,
    addFriend,
    cancelFriendRequest,
    fetchFriendRequests,
    checkAuth,
    unFriend,
  } = useAuthStore();
  const { fetchUserMedia, selectedUserMedia } = useMediaStore();

  const [requestStatus, setRequestStatus] = useState(null);
  const [isFriend, setIsFriend] = useState(false);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (authUser && selectedUser) {
      fetchFriendRequests(); // Ensure fresh data
    }
  }, [authUser, selectedUser, fetchFriendRequests]);

  useEffect(() => {
    if (authUser && selectedUser) {
      // Check if the selected user is already a friend
      const isAlreadyFriend =
        authUser.friends &&
        authUser.friends.some(
          (friendId) => friendId.toString() === selectedUser._id
        );
      setIsFriend(isAlreadyFriend);

      // Check sentRequests for a pending request to the selected user
      const existingRequest = authUser.sentRequests.find(
        (request) =>
          request.receiverId.toString() === selectedUser._id &&
          request.status === "pending"
      );
      setRequestStatus(existingRequest ? existingRequest.status : null);
    }
  }, [authUser, selectedUser]);

  // Fetch user media when the selected user changes
  useEffect(() => {
    if (selectedUser) {
      const fetchMedia = async () => {
        await fetchUserMedia(selectedUser._id);
      };
      fetchMedia();
    }
  }, [selectedUser, fetchUserMedia]);

  const handleUnfriend = async () => {
    try {
      await unFriend(selectedUser._id); // Call the unFriend method from the store
      setIsFriend(false); // Update local state
    } catch (error) {
      console.error("Error unfriending:", error);
      toast.error("Failed to unfriend");
    }
  };

  if (isCheckingAuth) {
    return <div>Loading...</div>;
  }

  if (!authUser) {
    return <div>Please log in.</div>;
  }

  const handleFriendRequest = async () => {
    if (requestStatus === "pending") {
      await cancelFriendRequest(selectedUser._id);
      setRequestStatus(null); // Update requestStatus immediately
    } else {
      await addFriend(selectedUser._id);
      setRequestStatus("pending"); // Assume request is sent
    }
    fetchFriendRequests(); // Fetch updated friend requests
  };

  console.log("selected user media", selectedUserMedia);

  return (
    <div className='mt-5 flex-1'>
      <div className='flex flex-col justify-center items-center gap-3'>
        <div className='avatar'>
          <div className='size-32 rounded-full'>
            <img
              src={selectedUser.profilePic || "./avatar.png"}
              alt={selectedUser.fullName}
            />
          </div>
        </div>
        <div className='text-center'>
          <h1 className='text-xl font-semibold'>{selectedUser.fullName}</h1>
          <p className='text-muted-foreground mb-2'>{selectedUser.email}</p>

          {isFriend ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className='cursor-pointer'>
                  <p className='hidden md:flex lg:flex items-center gap-2'>
                    Friends <User />
                  </p>
                  <span className='block md:hidden lg:hidden'>
                    <User />
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  className='cursor-pointer'
                  onClick={handleUnfriend}
                >
                  Unfriend
                </DropdownMenuItem>
                <DropdownMenuItem className='cursor-pointer'>
                  Block
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : requestStatus === "pending" ? (
            <Button className='cursor-pointer' onClick={handleFriendRequest}>
              <p className='hidden md:flex lg:flex items-center gap-2'>
                Cancel Request <UserMinus />
              </p>
              <span className='block md:hidden lg:hidden'>
                <UserMinus />
              </span>
            </Button>
          ) : (
            <Button className='cursor-pointer' onClick={handleFriendRequest}>
              <p className='hidden md:flex lg:flex items-center gap-2'>
                Add Friend <UserPlus />
              </p>
              <span className='block md:hidden lg:hidden'>
                <UserPlus />
              </span>
            </Button>
          )}
        </div>
      </div>

      <div className='mt-5 bg-stone-300 w-full h-[0.5px] shadow-sm' />
      <div className='flex flex-col justify-center items-center my-5 gap-2'>
        {selectedUserMedia.length > 0 ? (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto h-40 scrollbar-custom'>
            {selectedUserMedia.map((file, index) => {
              const firstImage = file.files.find(
                (file) => file.type === "image"
              );
              const firstVideo = file.files.find(
                (file) => file.type === "video"
              );
              return (
                <div key={index}>
                  {firstImage && <MediaItem file={firstImage} />}
                  {firstVideo && <MediaItem file={firstVideo} />}
                </div>
              );
            })}
          </div>
        ) : (
          <div className='flex flex-col gap-3 justify-center items-center'>
            <img
              src='./no-found.png'
              alt='no-found-content'
              className='w-20 h-20'
            />
            <p className='text-accent-foreground font-medium'>
              Oops..! no media content yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
