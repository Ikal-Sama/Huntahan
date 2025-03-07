import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "../ui/button";
import { Mic, MicOff, Phone, PhoneOff, Video, VideoOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";

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
    remoteUserProfile,
  } = useAuthStore();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  console.log("isVideoCall:", isVideoCall);
  console.log("remote user profile:", remoteUserProfile);

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
  // console.log("AUDIO in frend", localStream.getAudioTracks()[0].enabled);

  const toggleMute = () => {
    setIsMuted(!isMuted);
    localStream.getAudioTracks()[0].enabled = !isMuted;
  };

  const toggleCamera = () => {
    setIsCameraOn(!isCameraOn);
    localStream.getVideoTracks()[0].enabled = !isCameraOn;
  };

  if (localStream) {
    const audioTracks = localStream.getAudioTracks();
    if (audioTracks.length > 0) {
      console.log("Audio Track Exists:", audioTracks[0].enabled);
    } else {
      console.error("No Audio Track Found");
    }
  }

  if (!isCallActive && !incomingCall) return null;

  return (
    <div className='flex flex-1 flex-col items-center justify-center h-full '>
      {isCallActive && isVideoCall && (
        <div className=' '>
          {localStream && (
            <video
              ref={localVideoRef}
              autoPlay
              muted // Keep this muted to avoid echo
              className='w-40 h-30 rounded-lg absolute top-36 right-5 z-50 '
            />
          )}

          {remoteStream && (
            <div className='w-[800px] h-80 relative'>
              <video
                ref={remoteVideoRef}
                autoPlay
                className='w-full h-full rounded-lg  object-contain'
              />
            </div>
          )}
        </div>
      )}

      {/* Display remote user profile only if it's a voice call */}
      {isCallActive && !isVideoCall && (
        <div className='flex flex-col items-center justify-center'>
          <img
            src={
              remoteUserProfile.profilePic
                ? remoteUserProfile.profilePic
                : "./avatar.png"
            }
            alt={`${remoteUserProfile.name}'s profile`}
            className='w-24 h-24 rounded-full'
          />
          <span>{remoteUserProfile.name}</span>
        </div>
      )}

      {/* Call Controls */}
      {isCallActive && ( // Only show call controls during an active call
        <div className='flex gap-4 mt-4 items-center'>
          <div onClick={toggleMute}>
            {isMuted ? (
              <Button size='icon' className='rounded-full p-2 cursor-pointer'>
                <MicOff size={10} />
              </Button>
            ) : (
              <Button size='icon' className='rounded-full p-2 cursor-pointer'>
                <Mic size={10} />
              </Button>
            )}
          </div>
          <div onClick={toggleCamera}>
            {isCameraOn ? (
              <Button size='icon' className='rounded-full p-2 cursor-pointer'>
                <VideoOff size={10} />
              </Button>
            ) : (
              <Button size='icon' className='rounded-full p-2 cursor-pointer'>
                <Video size={10} />
              </Button>
            )}
          </div>
          <Button
            size='icon'
            variant='destructive'
            onClick={endCall}
            className='rounded-full p-2 cursor-pointer'
          >
            <PhoneOff className='w-6 h-6' />
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
