import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "../ui/button";
import { Phone, PhoneOff } from "lucide-react";

export const CallInterface = () => {
  const {
    incomingCall,
    acceptCall,
    rejectCall,
    localStream,
    remoteStream,
    endCall,
    isCallActive,
  } = useAuthStore();

  console.log("INCOMING CALL:", incomingCall);

  if (!isCallActive && !incomingCall) return null;
  return (
    <div className='flex flex-1 flex-col items-center justify-center h-full'>
      {isCallActive && (
        <div className='flex flex-col items-center'>
          {localStream && (
            <video
              ref={(ref) => ref && (ref.srcObject = localStream)}
              autoPlay
              muted
              className='w-40 h-30 rounded-lg'
            />
          )}
          {remoteStream && (
            <video
              ref={(ref) => ref && (ref.srcObject = remoteStream)}
              autoPlay
              className='w-full h-80 rounded-lg'
            />
          )}
        </div>
      )}
      {!isCallActive && incomingCall && (
        <div className='flex flex-col items-center'>
          <div className='text-2xl font-semibold mb-4'>Incoming Call...</div>
          <div className='mb-4 flex flex-col items-center'>
            {incomingCall.profilePic && (
              <img
                src={incomingCall.profilePic}
                alt={`${incomingCall.name}'s profile`}
                className='w-20 h-20 rounded-full mb-2'
              />
            )}
            <span className='text-lg'>{incomingCall.name}</span>
          </div>
        </div>
      )}
      <div className='flex items-center gap-4 justify-center mt-4'>
        {incomingCall && (
          <>
            <Button
              size='icon'
              onClick={acceptCall}
              className='rounded-full p-2 bg-primary cursor-pointer'
            >
              <Phone className='w-4 h-4 text-white' />
            </Button>
            <Button
              size='icon'
              variant='destructive'
              onClick={rejectCall}
              className='rounded-full p-2 cursor-pointer'
            >
              <PhoneOff className='w-4 h-4' />
            </Button>
          </>
        )}
        {isCallActive && (
          <Button
            size='icon'
            variant='destructive'
            onClick={endCall}
            className='rounded-full p-2 cursor-pointer'
          >
            <VideoOff className='w-4 h-4' />
          </Button>
        )}
      </div>
    </div>
  );
};
