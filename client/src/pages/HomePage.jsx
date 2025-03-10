import { CallInterface } from "@/components/calls/CallInterface";
import ChatContainer from "@/components/ChatContainer";
import NoChatSelected from "@/components/NoChatSelected";
import Sidebar from "@/components/Sidebar";
import UserProfile from "@/components/UserProfile";
import { useAuthStore } from "@/store/useAuthStore";
import { useChatStore } from "@/store/useChatStore";

export default function HomePage() {
  const { selectedUser, viewProfile } = useChatStore();
  const {
    authUser,
    addFriend,
    cancelFriendRequest,
    incomingCall,
    isCallActive,
  } = useAuthStore();

  const isFriend = authUser?.friends?.includes(selectedUser?._id);

  return (
    <div className='h-screen '>
      <div className='flex items-center justify-center pt-20 px-4'>
        <div className='bg-accent rounded-lg shadow-xl w-full max-w-6xl h-[calc(100vh-8rem)]'>
          <div className='flex h-full rounded-lg overflow-hidden'>
            <Sidebar />
            {incomingCall || isCallActive ? (
              <CallInterface /> // Render CallInterface if there's an incoming call or an active call
            ) : !selectedUser ? (
              <NoChatSelected />
            ) : viewProfile ? (
              <UserProfile
                selectedUser={selectedUser}
                addFriend={addFriend}
                cancelFriendRequest={cancelFriendRequest}
              />
            ) : isFriend ? (
              <ChatContainer />
            ) : (
              <UserProfile
                selectedUser={selectedUser}
                addFriend={addFriend}
                cancelFriendRequest={cancelFriendRequest}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
