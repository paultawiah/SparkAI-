
import React, { useState, useRef, useEffect } from 'react';
import { verifyPhotoLiveness } from '../services/geminiService';

interface VerificationFlowProps {
  onComplete: (isSuccess: boolean) => void;
  onClose: () => void;
}

const VerificationFlow: React.FC<VerificationFlowProps> = ({ onComplete, onClose }) => {
  const [status, setStatus] = useState<'IDLE' | 'CAMERA' | 'CAPTURING' | 'ANALYZING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      setStatus('CAMERA');
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      setStatus('ERROR');
      setErrorMsg('Camera access denied or unavailable.');
    }
  };

  const captureAndVerify = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setStatus('CAPTURING');
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(video, 0, 0);
    
    const base64Image = canvas.toDataURL('image/jpeg').split(',')[1];
    
    setStatus('ANALYZING');
    const result = await verifyPhotoLiveness(base64Image);
    
    if (result.isVerified) {
      setStatus('SUCCESS');
      setTimeout(() => onComplete(true), 2000);
    } else {
      setStatus('ERROR');
      setErrorMsg(result.reason || 'Verification failed. Please try again.');
    }
    
    // Stop camera
    streamRef.current?.getTracks().forEach(track => track.stop());
  };

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach(track => track.stop());
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[400] bg-slate-950/95 backdrop-blur-2xl flex items-center justify-center p-6 animate-fade-in">
      <div className="w-full max-w-sm glass-morphism rounded-[3rem] p-8 border border-white/10 shadow-2xl relative overflow-hidden flex flex-col items-center">
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Biometric Check</h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-1">Liveness Protocol</p>
        </div>

        <div className="w-full aspect-[3/4] rounded-3xl bg-slate-900 border-2 border-dashed border-white/10 relative overflow-hidden mb-8 group">
          {status === 'IDLE' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              <p className="text-slate-400 text-sm font-medium">Position your face within the frame in a well-lit environment.</p>
              <button onClick={startCamera} className="px-6 py-2.5 bg-white text-slate-950 font-black rounded-xl text-[10px] uppercase tracking-widest active:scale-95 transition-all">Start Check</button>
            </div>
          )}

          {(status === 'CAMERA' || status === 'CAPTURING' || status === 'ANALYZING') && (
            <>
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              <div className="absolute inset-0 border-[30px] border-slate-950/40 pointer-events-none">
                 <div className="w-full h-full border-2 border-indigo-500/50 rounded-full animate-pulse" />
              </div>
              
              {status === 'ANALYZING' && (
                <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
                   <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                   <span className="text-[10px] font-black uppercase text-indigo-400 tracking-[0.3em]">Analyzing Biometrics</span>
                </div>
              )}

              {status === 'CAMERA' && (
                <button onClick={captureAndVerify} className="absolute bottom-6 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full border-4 border-white flex items-center justify-center active:scale-90 transition-all shadow-2xl">
                   <div className="w-12 h-12 rounded-full bg-white" />
                </button>
              )}
            </>
          )}

          {status === 'SUCCESS' && (
            <div className="absolute inset-0 bg-emerald-500/20 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6">
              <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/40 mb-4 animate-[bounce_1s_infinite]">
                 <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              </div>
              <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Spark Verified</h3>
              <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest mt-1">Badge Awarded</p>
            </div>
          )}

          {status === 'ERROR' && (
            <div className="absolute inset-0 bg-rose-500/20 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-rose-500 text-white flex items-center justify-center">
                 <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <p className="text-rose-200 text-xs font-bold leading-relaxed">{errorMsg}</p>
              <button onClick={startCamera} className="px-6 py-2.5 bg-white text-slate-950 font-black rounded-xl text-[10px] uppercase tracking-widest active:scale-95 transition-all">Retry Check</button>
            </div>
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />

        <div className="text-center">
           <p className="text-slate-500 text-[9px] font-medium leading-relaxed max-w-[200px]">
             Biometric data is processed locally and discarded immediately after liveness confirmation.
           </p>
        </div>
      </div>
    </div>
  );
};

export default VerificationFlow;
