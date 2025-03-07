import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "../ui/button";
import { Phone, PhoneOff, VideoOff } from "lucide-react";
import { useEffect, useRef } from "react";

export const CallInterface = () => {
  const {
    incomingCall,
    acceptCall,
    rejectCall,
    localStream,
    remoteStream,
    endCall,
    isCallActive,
    isVideoCall,
  } = useAuthStore();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // Attach streams to video elements
  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
      console.log("Local Stream:", localStream);
    }
    if (remoteStream && remoteVideoRef.current) {
      console.log("Remote Stream being attached:", remoteStream);
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [localStream, remoteStream]);

  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      console.log("Remote video ref:", remoteVideoRef.current);
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  console.log("INCOMING CALL:", incomingCall);

  if (!isCallActive && !incomingCall) return null;

  return (
    <div className='flex flex-1 flex-col items-center justify-center h-full'>
      {/* Active Call UI */}
      {isCallActive && (
        <div className='flex flex-col items-center'>
          {/* Local Video Stream (only for video calls) */}
          {isVideoCall && localStream && (
            <video
              ref={localVideoRef}
              autoPlay
              muted
              className='w-40 h-30 rounded-lg'
            />
          )}

          {/* Remote Video Stream */}
          {remoteStream && (
            <video
              ref={remoteVideoRef}
              autoPlay
              className='w-full h-80 rounded-lg'
            />
          )}

          {/* Remote User Profile */}
          <div className='mt-4 flex flex-col items-center'>
            {incomingCall?.profilePic && (
              <img
                src={incomingCall.profilePic}
                alt={`${incomingCall.name}'s profile`}
                className='w-20 h-20 rounded-full mb-2'
              />
            )}
            <span className='text-lg'>{incomingCall?.name}</span>
          </div>

          {/* End Call Button */}
          <Button
            size='icon'
            variant='destructive'
            onClick={endCall}
            className='rounded-full p-2 cursor-pointer mt-4'
          >
            <VideoOff className='w-4 h-4' />
          </Button>
        </div>
      )}

      {/* Incoming Call UI */}
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
          {/* Accept/Reject Buttons */}
          <div className='flex items-center gap-4 justify-center mt-4'>
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
          </div>
        </div>
      )}
    </div>
  );
};
