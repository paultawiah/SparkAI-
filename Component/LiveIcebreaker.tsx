
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob, FunctionDeclaration, Type } from '@google/genai';
import { analyzePracticeSession } from '../services/geminiService';
import { SubscriptionTier } from '../types';

interface Scenario {
  id: string;
  title: string;
  description: string;
  icon: string;
  instruction: string;
  premium?: boolean;
}

const SCENARIOS: Scenario[] = [
  { 
    id: 'first-date', 
    title: 'First Date Jitters', 
    description: 'Practice the awkward first 5 minutes of a date.', 
    icon: '☕',
    instruction: 'Act as a friendly, slightly shy date on a first meeting at a coffee shop.'
  },
  { 
    id: 'deep-vibe', 
    title: 'The Deep Dive', 
    description: 'Skip the small talk and get into deep, soulful topics.', 
    icon: '🌊',
    instruction: 'Act as a person who loves philosophy and deep meaningful questions.'
  },
  { 
    id: 'reconnect', 
    title: 'The "Artful" Flirt', 
    description: 'Practice high-energy, witty, and charming banter.', 
    icon: '✨',
    instruction: 'Act as a very charismatic, witty person who loves playful challenges.',
    premium: true
  }
];

interface LiveIcebreakerProps {
  userTier: SubscriptionTier;
  onUsageRequired: () => boolean;
  onUpsell: () => void;
}

const LiveIcebreaker: React.FC<LiveIcebreakerProps> = ({ userTier, onUsageRequired, onUpsell }) => {
  const [isActive, setIsActive] = useState(false);
  const [transcription, setTranscription] = useState<string[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [coachingTips, setCoachingTips] = useState<{ id: number, text: string }[]>([]);
  const [vibeScore, setVibeScore] = useState(50);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [reportCard, setReportCard] = useState<{ summary: string, strengths: string[], weaknesses: string[] } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const streamRef = useRef<MediaStream | null>(null);
  const tipIdRef = useRef(0);

  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const decodeAudioData = async (
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
  ): Promise<AudioBuffer> => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  };

  const encode = (bytes: Uint8Array) => {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const createBlob = (data: Float32Array): Blob => {
    const int16 = new Int16Array(data.length);
    for (let i = 0; i < data.length; i++) {
      int16[i] = data[i] * 32768;
    }
    return {
      data: encode(new Uint8Array(int16.buffer)),
      mimeType: 'audio/pcm;rate=16000',
    };
  };

  const wingmanTools: FunctionDeclaration[] = [
    {
      name: 'giveWingmanTip',
      parameters: {
        type: Type.OBJECT,
        description: 'Provide a real-time dating coaching tip to the user.',
        properties: {
          tip: { type: Type.STRING }
        }
      }
    },
    {
      name: 'updateVibeScore',
      parameters: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER }
        }
      }
    }
  ];

  const handleScenarioSelect = (s: Scenario) => {
    if (s.premium && userTier !== SubscriptionTier.GOLD) {
      onUpsell();
      return;
    }
    setSelectedScenario(s);
  };

  const startSession = async () => {
    if (!selectedScenario) return;

    // Check usage limits
    const canStart = onUsageRequired();
    if (!canStart) return;

    try {
      setIsConnecting(true);
      setReportCard(null);
      setTranscription([]);
      setCoachingTips([]);
      setVibeScore(50);
      
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setIsActive(true);
            setIsConnecting(false);
            const source = audioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.toolCall) {
              for (const fc of message.toolCall.functionCalls) {
                if (fc.name === 'giveWingmanTip') {
                  const tip = (fc.args as any).tip;
                  setCoachingTips(prev => [{ id: tipIdRef.current++, text: tip }, ...prev.slice(0, 1)]);
                } else if (fc.name === 'updateVibeScore') {
                  setVibeScore((fc.args as any).score);
                }
                sessionPromise.then(session => session.sendToolResponse({
                  functionResponses: { id: fc.id, name: fc.name, response: { result: "ok" } }
                }));
              }
            }

            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && outputAudioContextRef.current) {
              const ctx = outputAudioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(ctx.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }

            if (message.serverContent?.outputTranscription) setTranscription(prev => [...prev, `Spark: ${message.serverContent!.outputTranscription!.text}`]);
            if (message.serverContent?.inputTranscription) setTranscription(prev => [...prev, `You: ${message.serverContent!.inputTranscription!.text}`]);
          },
          onerror: (e) => console.error('Live error:', e),
          onclose: () => setIsActive(false),
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          tools: [{ functionDeclarations: wingmanTools }],
          systemInstruction: `You are Spark, a dating coach. SCENARIO: ${selectedScenario.instruction}. Chat naturally as the character, but use tools to give tips and update vibe scores.`,
          outputAudioTranscription: {},
          inputAudioTranscription: {},
        },
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error('Failed to start session:', err);
      setIsConnecting(false);
    }
  };

  const stopSession = async () => {
    if (sessionRef.current) sessionRef.current.close();
    if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
    setIsActive(false);
    if (transcription.length > 2) {
      setIsAnalyzing(true);
      const result = await analyzePracticeSession(transcription, selectedScenario?.title || 'General');
      setReportCard(result);
      setIsAnalyzing(false);
    }
  };

  useEffect(() => { return () => { if (sessionRef.current) sessionRef.current.close(); }; }, []);

  if (!selectedScenario && !reportCard) {
    return (
      <div className="flex flex-col h-full overflow-y-auto custom-scrollbar pt-24 pb-32 gap-8 items-center p-6 animate-fade-in">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Choose Your Vibe</h2>
          <p className="text-slate-400 text-xs font-black uppercase tracking-[0.2em]">Select a scenario to practice</p>
        </div>

        <div className="grid grid-cols-1 gap-4 w-full max-w-sm">
          {SCENARIOS.map(s => (
            <button 
              key={s.id}
              onClick={() => handleScenarioSelect(s)}
              className="p-6 rounded-[2.5rem] bg-white/5 border border-white/10 text-left hover:bg-white/10 hover:border-rose-500/50 transition-all group active:scale-[0.98] relative"
            >
              <div className="flex items-center gap-4 mb-3">
                <span className="text-3xl bg-slate-800 p-2 rounded-2xl group-hover:scale-110 transition-transform">{s.icon}</span>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-white uppercase italic tracking-tight">{s.title}</h3>
                  {s.premium && <span className="bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded-md text-[7px] font-black uppercase tracking-tighter">Gold</span>}
                </div>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">{s.description}</p>
              {s.premium && userTier !== SubscriptionTier.GOLD && (
                <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] rounded-[2.5rem] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-8 h-8 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (reportCard) {
    return (
      <div className="flex flex-col h-full overflow-y-auto custom-scrollbar pt-24 pb-32 gap-8 items-center p-6 animate-slide-up">
        <div className="text-center space-y-2">
           <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
           </div>
           <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Session Complete</h2>
        </div>
        <div className="w-full max-w-sm space-y-4">
           <div className="glass-morphism rounded-[2.5rem] p-6 border border-white/10 space-y-6">
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                 <span className="text-xs font-black text-slate-500 uppercase">Final Rizz</span>
                 <span className="text-2xl font-black text-rose-500">{vibeScore}%</span>
              </div>
              <p className="text-slate-200 text-sm leading-relaxed">{reportCard.summary}</p>
           </div>
           <button onClick={() => { setReportCard(null); setSelectedScenario(null); }} className="w-full py-5 rounded-[2rem] bg-white text-slate-950 font-black text-xs uppercase tracking-[0.2em]">New Practice Vibe</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden pt-24 pb-32 gap-6 items-center p-6 bg-slate-900/40 rounded-3xl border border-white/5">
      <div className="flex items-center justify-between w-full px-4">
        <button onClick={() => !isActive && setSelectedScenario(null)} disabled={isActive} className="text-slate-500 hover:text-white transition-colors"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
        <div className="text-center"><h2 className="text-xl font-black text-white italic uppercase tracking-tighter">{selectedScenario?.title}</h2></div>
        <div className="w-6"></div>
      </div>
      <div className="w-full max-w-sm flex items-center justify-between gap-6 px-4">
        <div className="flex flex-col items-center gap-2">
           <div className="relative w-20 h-20">
              <svg className="w-full h-full -rotate-90">
                <circle cx="40" cy="40" r="34" fill="none" stroke="currentColor" strokeWidth="6" className="text-slate-800" />
                <circle cx="40" cy="40" r="34" fill="none" stroke="url(#vibeGradient)" strokeWidth="6" strokeDasharray="213.6" strokeDashoffset={213.6 * (1 - vibeScore/100)} className="transition-all duration-1000 ease-out" />
                <defs><linearGradient id="vibeGradient" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#f43f5e" /><stop offset="100%" stopColor="#818cf8" /></linearGradient></defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-lg font-black text-white">{vibeScore}</span><span className="text-[7px] font-bold text-slate-500 uppercase">Rizz</span></div>
           </div>
        </div>
        <div className="flex-1 space-y-2 h-20 overflow-hidden">
          {coachingTips.length > 0 ? (
            coachingTips.map(tip => (
              <div key={tip.id} className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl animate-slide-up flex gap-2 items-start"><span className="text-indigo-400 text-xs">✨</span><p className="text-[10px] text-indigo-100 font-bold leading-tight">{tip.text}</p></div>
            ))
          ) : (<div className="h-full flex items-center justify-center border-2 border-dashed border-white/5 rounded-2xl"><p className="text-[8px] text-slate-600 font-black uppercase tracking-widest text-center px-4">{isActive ? "Spark is listening..." : "Ready when you are"}</p></div>)}
        </div>
      </div>
      <div className="relative w-52 h-52 flex items-center justify-center my-4">
        <div className={`absolute inset-0 rounded-full bg-rose-500/10 blur-3xl transition-opacity duration-500 ${isActive ? 'opacity-40' : 'opacity-0'}`} />
        <div className={`w-32 h-32 rounded-full bg-gradient-to-br from-rose-500 via-rose-600 to-indigo-700 flex items-center justify-center shadow-2xl z-10 transition-transform duration-300 ${isActive ? 'scale-110' : 'scale-100'}`}>
          {isConnecting ? (<div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />) : isActive ? (
            <div className="flex gap-1.5 h-10 items-center">{[...Array(5)].map((_, i) => (<div key={i} className="w-1 bg-white/90 rounded-full animate-[bounce_0.6s_infinite]" style={{ height: `${Math.random() * 80 + 20}%`, animationDelay: `${i * 0.1}s` }} />))}</div>
          ) : (<svg className="w-12 h-12 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>)}
        </div>
      </div>
      <div className="flex flex-col gap-4 w-full max-w-xs items-center mt-auto">
        <button onClick={isActive ? stopSession : startSession} disabled={isConnecting || isAnalyzing} className={`w-full py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-3 ${isActive ? 'bg-rose-500 text-white' : 'bg-white text-slate-950'} ${isConnecting || isAnalyzing ? 'opacity-50' : ''}`}>
          {isAnalyzing ? 'Analyzing...' : isConnecting ? 'Syncing...' : isActive ? 'Finish & Analyze' : `Practice ${selectedScenario?.title}`}
        </button>
      </div>
    </div>
  );
};

export default LiveIcebreaker;
