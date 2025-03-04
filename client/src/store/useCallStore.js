import { create } from "zustand";
import { io } from "socket.io-client";
import SimplePeer from "simple-peer";
import { useAuthStore } from "./useAuthStore";


export const useCallStore = create((set, get) => ({
    call: null,
    callAccepted: false,
    callEnded: false,
    stream: null,
    myPeer: null,
  
    startCall: (user, type) => {
        console.log("Starting call with user:", user); // Debugging
        const { socket } = useAuthStore.getState();
        if (!socket) return console.error("Socket is not connected");
      
        navigator.mediaDevices.getUserMedia({ video: type === "video", audio: true })
          .then((stream) => {
            console.log("Media stream obtained:", stream); // Debugging
            set({ stream });
      
            const peer = new SimplePeer({
              initiator: true,
              trickle: false,
              stream,
            });
      
            peer.on("signal", (signalData) => {
              console.log("Signal data:", signalData); // Debugging
              socket.emit("callUser", {
                to: user._id,
                signalData,
                from: socket.id,
                name: "Caller",
              });
            });
      
            peer.on("stream", (remoteStream) => {
              console.log("Remote stream received:", remoteStream); // Debugging
              set({ call: { ...user, remoteStream } });
            });
      
            set({ myPeer: peer });
          })
          .catch((err) => console.error("Error accessing media devices", err));
      },
  
    answerCall: () => {
      const { call, myPeer, stream } = get();
      if (!call || !myPeer) return;
  
      if (call.signal) {
        myPeer.signal(call.signal);
        set({ callAccepted: true });
      }
    },
  
    endCall: () => {
      const { call, myPeer, stream } = get();
      const { socket } = useAuthStore.getState();
      if (!socket) return;
  
      if (call?.id) {
        socket.emit("endCall", { to: call.id });
      }
  
      if (myPeer) {
        myPeer.destroy(); // Properly clean up peer
      }
  
      if (stream) {
        stream.getTracks().forEach(track => track.stop()); // Stop media tracks
      }
  
      set({ call: null, callAccepted: false, callEnded: true, myPeer: null, stream: null });
    },
  
    // Initialize socket event listeners
    initializeSocketListeners: () => {
      const { socket } = useAuthStore.getState();
      if (socket) {
        socket.on("incomingCall", ({ from, signal }) => {
          set({ call: { from, signal }, callAccepted: false });
        });
  
        socket.on("callAccepted", (signal) => {
          const { myPeer } = get();
          if (myPeer) myPeer.signal(signal);
        });
  
        socket.on("callEnded", () => {
          get().endCall();
        });
      }
    },
  }));
  
  // Initialize socket listeners when the store is created
  useCallStore.getState().initializeSocketListeners();
