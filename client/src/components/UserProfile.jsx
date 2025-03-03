import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { UserPlus, UserMinus, User } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

export default function UserProfile({ selectedUser }) {
  const {
    authUser,
    friendRequests = [],
    isCheckingAuth,
    addFriend,
    cancelFriendRequest,
    fetchFriendRequests,
    checkAuth,
  } = useAuthStore();

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
      const isAlreadyFriend = authUser.friends.some(
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

  console.log("selected user profile as friend:", selectedUser);

  return (
    <div className='mt-10 flex-1'>
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
            <Button disabled>
              <p className='hidden md:flex lg:flex items-center gap-2'>
                Friends <User />
              </p>
              <span className='block md:hidden lg:hidden'>
                <User />
              </span>
            </Button>
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
        <h1>Ongoing Development...</h1>
      </div>
    </div>
  );
}
