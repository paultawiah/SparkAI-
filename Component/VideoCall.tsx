
import React, { useEffect, useRef, useState } from 'react';
import { Profile, SubscriptionTier } from '../types';
import { createCall, respondToCall, sendIceCandidate, subscribeToCallSignals, subscribeToIceCandidates } from '../services/supabaseService';

interface VideoCallProps {
  match: Profile;
  onEnd: () => void;
  userTier: SubscriptionTier;
  onUpsell: () => void;
  incomingCallData?: any; // If this component is opened because of an incoming call
}

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

const VideoCall: React.FC<VideoCallProps> = ({ match, onEnd, userTier, onUpsell, incomingCallData }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [status, setStatus] = useState<'Ringing...' | 'Connecting...' | 'Live' | 'Ended'>('Ringing...');
  const [callTime, setCallTime] = useState(0);
  const [callId, setCallId] = useState<string | null>(incomingCallData?.id || null);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pc = useRef<RTCPeerConnection | null>(null);
  const localStream = useRef<MediaStream | null>(null);
  
  const isPremium = userTier === SubscriptionTier.GOLD;
  const FREE_LIMIT = 300; 
  const userId = localStorage.getItem('sparkai_user_uuid');

  const setupPeerConnection = async (stream: MediaStream) => {
    const peer = new RTCPeerConnection(ICE_SERVERS);
    pc.current = peer;

    stream.getTracks().forEach(track => peer.addTrack(track, stream));

    peer.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
        setStatus('Live');
      }
    };

    peer.onicecandidate = (event) => {
      if (event.candidate && callId && userId) {
        sendIceCandidate(callId, userId, event.candidate.toJSON());
      }
    };

    return peer;
  };

  const startCall = async () => {
    if (!userId || match.isAi) {
      // AI Fallback for demo
      setTimeout(() => setStatus('Live'), 2000);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStream.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      const peer = await setupPeerConnection(stream);
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);

      const { data, error } = await createCall(userId, match.id, offer);
      if (data) setCallId(data.id);
    } catch (err) {
      console.error("Signaling failed:", err);
      onEnd();
    }
  };

  const joinCall = async (incoming: any) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStream.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      const peer = await setupPeerConnection(stream);
      await peer.setRemoteDescription(new RTCSessionDescription(incoming.offer));
      
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      
      await respondToCall(incoming.id, answer);
      setStatus('Live');
    } catch (err) {
      console.error("Failed to join call:", err);
      onEnd();
    }
  };

  useEffect(() => {
    if (incomingCallData) {
      joinCall(incomingCallData);
    } else {
      startCall();
    }

    return () => closeCall();
  }, []);

  // Listen for Signaling Updates
  useEffect(() => {
    if (!userId || !callId) return;

    const signalSub = subscribeToCallSignals(userId, async (payload) => {
      if (payload.new.id === callId && payload.new.answer && !pc.current?.remoteDescription) {
        await pc.current?.setRemoteDescription(new RTCSessionDescription(payload.new.answer));
      }
    });

    const iceSub = subscribeToIceCandidates(callId, userId, async (candidate) => {
      if (pc.current) {
        await pc.current.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    return () => {
      if (signalSub) signalSub.unsubscribe();
      if (iceSub) iceSub.unsubscribe();
    };
  }, [callId, userId]);

  useEffect(() => {
    let timer: number;
    if (status === 'Live') {
      timer = window.setInterval(() => {
        setCallTime(prev => {
          if (!isPremium && prev >= FREE_LIMIT) {
            clearInterval(timer);
            onUpsell();
            closeCall();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [status, isPremium]);

  const closeCall = () => {
    localStream.current?.getTracks().forEach(track => track.stop());
    pc.current?.close();
    onEnd();
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center animate-fade-in overflow-hidden">
      <div className="absolute inset-0 bg-slate-900">
        {/* Remote Video Container */}
        <div className="w-full h-full flex items-center justify-center bg-slate-800">
           {status !== 'Live' ? (
              <>
                <img src={match.imageUrl} className="w-full h-full object-cover blur-3xl opacity-20" alt="" />
                <div className="absolute flex flex-col items-center gap-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-rose-500 blur-3xl opacity-20 rounded-full animate-pulse"></div>
                    <img src={match.imageUrl} className="w-40 h-40 rounded-full object-cover border-4 border-white/10 shadow-2xl relative z-10" alt="" />
                  </div>
                  <div className="text-center">
                    <h2 className="text-3xl font-black text-white italic tracking-tighter">{match.name}</h2>
                    <div className="flex items-center justify-center gap-3 text-rose-400 font-bold uppercase tracking-widest text-xs mt-2">
                      <span className="w-2 h-2 bg-rose-500 rounded-full animate-ping"></span>
                      {status}
                    </div>
                  </div>
                </div>
              </>
           ) : (
             <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
           )}
        </div>
      </div>

      <div className="absolute top-8 right-8 w-32 h-44 rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl z-50 bg-slate-800">
        <video ref={localVideoRef} autoPlay muted playsInline className={`w-full h-full object-cover ${isVideoOff ? 'opacity-0' : 'opacity-100'}`} />
        {isVideoOff && <div className="absolute inset-0 flex items-center justify-center bg-slate-900 text-slate-500 text-[10px] font-black uppercase">Camera Off</div>}
      </div>

      {status === 'Live' && (
        <div className="absolute top-8 left-8 px-4 py-2 glass-morphism rounded-full border border-white/10 flex items-center gap-2">
          <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></div>
          <span className="text-white font-mono text-xs">{formatTime(callTime)}</span>
        </div>
      )}

      <div className="absolute bottom-12 left-0 right-0 flex justify-center items-center gap-6 z-50">
          <button onClick={() => setIsMuted(!isMuted)} className={`w-14 h-14 rounded-full flex items-center justify-center border transition-all active:scale-90 ${isMuted ? 'bg-rose-500 text-white' : 'bg-white/10 text-white'}`}>
             {isMuted ? <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg> : <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>}
          </button>
          <button onClick={closeCall} className="w-20 h-20 bg-rose-600 hover:bg-rose-700 text-white rounded-full flex items-center justify-center shadow-2xl shadow-rose-600/30 active:scale-90 transition-all p-5">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" /></svg>
          </button>
          <button onClick={() => setIsVideoOff(!isVideoOff)} className={`w-14 h-14 rounded-full flex items-center justify-center border transition-all active:scale-90 ${isVideoOff ? 'bg-rose-500 text-white' : 'bg-white/10 text-white'}`}>
             <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
          </button>
      </div>
    </div>
  );
};

export default VideoCall;
