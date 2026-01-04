
import React, { useState, useEffect, useRef } from 'react';
import { Profile, UserProfile, ChatMessage, SubscriptionTier } from '../types';
import { MOCK_PROFILES } from '../constants';
import { getSpeedDateIcebreaker } from '../services/geminiService';

interface SpeedDatingProps {
  currentUser: UserProfile;
  onMatch: (profile: Profile) => void;
  onSessionStart: () => boolean;
}

type SpeedDatePhase = 'START' | 'SEARCHING' | 'CHATTING' | 'VIBE_CHECK' | 'EXTENDED_CHATTING' | 'DECISION';

const REACTION_EMOJIS = ['🔥', '❤️', '😂', '✨', '👋'];

const SpeedDating: React.FC<SpeedDatingProps> = ({ currentUser, onMatch, onSessionStart }) => {
  const [phase, setPhase] = useState<SpeedDatePhase>('START');
  const [currentPartner, setCurrentPartner] = useState<Profile | null>(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [aiTip, setAiTip] = useState<string | null>(null);
  const [floatingReactions, setFloatingReactions] = useState<{ id: number, emoji: string }[]>([]);
  
  const [userWantsToContinue, setUserWantsToContinue] = useState<boolean | null>(null);
  const [partnerWantsToContinue, setPartnerWantsToContinue] = useState<boolean | null>(null);
  const [isVibeCheckLoading, setIsVibeCheckLoading] = useState(false);

  const isPremium = currentUser.tier === SubscriptionTier.GOLD;
  const scrollRef = useRef<HTMLDivElement>(null);
  const reactionIdRef = useRef(0);

  const startSearching = () => {
    // Check daily limit via parent
    const canProceed = onSessionStart();
    if (!canProceed) return;

    setPhase('SEARCHING');
    setUserWantsToContinue(null);
    setPartnerWantsToContinue(null);
    setFloatingReactions([]);
    setTimeout(() => {
      const randomMatch = MOCK_PROFILES[Math.floor(Math.random() * MOCK_PROFILES.length)];
      setCurrentPartner(randomMatch);
      setPhase('CHATTING');
      setTimeLeft(60);
      setMessages([]);
      setAiTip(null);
    }, 3000);
  };

  useEffect(() => {
    let timer: any;
    if ((phase === 'CHATTING' || phase === 'EXTENDED_CHATTING') && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      if (phase === 'CHATTING') {
        setPhase('VIBE_CHECK');
        setTimeout(() => {
          setPartnerWantsToContinue(Math.random() > 0.2);
        }, 1200);
      } else if (phase === 'EXTENDED_CHATTING') {
        setPhase('DECISION');
      }
    }
    return () => clearInterval(timer);
  }, [phase, timeLeft]);

  useEffect(() => {
    // AI Icebreaker: Only for Gold users
    if (!isPremium) return;

    if (phase === 'CHATTING' && (timeLeft === 40 || timeLeft === 20) && currentPartner) {
      const fetchTip = async () => {
        const tip = await getSpeedDateIcebreaker(currentUser, currentPartner);
        setAiTip(tip);
        setTimeout(() => setAiTip(null), 8000);
      };
      fetchTip();
    }
    if (phase === 'EXTENDED_CHATTING' && timeLeft === 60 && currentPartner) {
        const fetchTip = async () => {
          const tip = await getSpeedDateIcebreaker(currentUser, currentPartner);
          setAiTip("⚡ Deep Dive: " + tip);
        };
        fetchTip();
      }
  }, [timeLeft, phase, isPremium]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, aiTip]);

  useEffect(() => {
    if (phase === 'VIBE_CHECK' && userWantsToContinue && partnerWantsToContinue) {
        setIsVibeCheckLoading(true);
        setTimeout(() => {
            setPhase('EXTENDED_CHATTING');
            setTimeLeft(120);
            setIsVibeCheckLoading(false);
            setMessages(prev => [...prev, {
                id: 'system-extended',
                senderId: 'ai',
                text: "✨ VIBES MATCHED! Entering 2-minute bonus round.",
                timestamp: Date.now()
            }]);
        }, 1500);
    } else if (phase === 'VIBE_CHECK' && (userWantsToContinue === false || (partnerWantsToContinue === false && userWantsToContinue !== null))) {
        setTimeout(() => {
            setPhase('DECISION');
        }, 1000);
    }
  }, [userWantsToContinue, partnerWantsToContinue, phase]);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    const msg: ChatMessage = {
      id: Date.now().toString(),
      senderId: 'me',
      text: inputValue,
      timestamp: Date.now()
    };
    setMessages([...messages, msg]);
    setInputValue('');

    setTimeout(() => {
      const replies = ["No way! 😲", "Tell me more!", "Haha, love it.", "True though.", "Wait, really??"];
      const reply: ChatMessage = {
        id: (Date.now() + 1).toString(),
        senderId: currentPartner?.id || 'other',
        text: replies[Math.floor(Math.random() * replies.length)],
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, reply]);
    }, 1200);
  };

  const sendReaction = (emoji: string) => {
    const id = reactionIdRef.current++;
    setFloatingReactions(prev => [...prev, { id, emoji }]);
    setTimeout(() => {
      setFloatingReactions(prev => prev.filter(r => r.id !== id));
    }, 2000);
  };

  if (phase === 'START') {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-8 animate-fade-in">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-rose-500 blur-3xl opacity-20 rounded-full animate-pulse"></div>
          <div className="relative w-28 h-28 bg-gradient-to-br from-rose-400 via-rose-600 to-indigo-700 rounded-[2.5rem] flex items-center justify-center shadow-2xl rotate-3">
            <svg className="w-14 h-14 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>
        <h2 className="text-4xl font-black text-white mb-2 uppercase tracking-tighter italic bg-gradient-to-r from-rose-400 to-indigo-400 bg-clip-text text-transparent">Speed Spark</h2>
        <p className="text-slate-400 text-sm mb-10 leading-relaxed max-w-[240px]">Rapid-fire matching. 1 minute to find a vibe.</p>
        <button 
          onClick={startSearching}
          className="px-12 py-5 bg-white text-slate-900 font-black rounded-[2rem] active:scale-95 shadow-2xl shadow-white/10 uppercase tracking-[0.15em] text-sm"
        >
          Start Session
        </button>
      </div>
    );
  }

  if (phase === 'SEARCHING') {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="relative w-56 h-56 mb-12">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="absolute inset-0 rounded-full border-2 border-rose-500 animate-[ping_3s_linear_infinite] opacity-0" style={{ animationDelay: `${i * 1}s` }}></div>
          ))}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/10 flex items-center justify-center shadow-2xl">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-rose-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-rose-500 rounded-full animate-bounce"></div>
              </div>
            </div>
          </div>
        </div>
        <h3 className="text-2xl font-black text-white mb-2 italic tracking-tight">Syncing Hearts...</h3>
      </div>
    );
  }

  if ((phase === 'CHATTING' || phase === 'EXTENDED_CHATTING') && currentPartner) {
    const totalPossible = phase === 'CHATTING' ? 60 : 120;
    return (
      <div className="flex flex-col h-full bg-slate-950/80 backdrop-blur-2xl relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none z-50">
          {floatingReactions.map(r => (
            <div key={r.id} className="absolute bottom-20 left-1/2 -translate-x-1/2 text-4xl animate-[reaction_2s_ease-out_forwards]" style={{ left: `${Math.random() * 80 + 10}%` }}>{r.emoji}</div>
          ))}
        </div>
        <div className="px-6 py-5 flex items-center justify-between border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-3">
             <img src={currentPartner.imageUrl} className="w-11 h-11 rounded-full object-cover border-2 border-indigo-500/50" />
             <div>
               <h4 className="font-bold text-white text-lg">{currentPartner.name}</h4>
               <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{phase === 'EXTENDED_CHATTING' ? 'Bonus Round' : 'Initial Spark'}</p>
             </div>
          </div>
          <div className="relative w-14 h-14 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90">
              <circle cx="28" cy="28" r="22.5" fill="none" stroke="currentColor" strokeWidth="4" className="text-slate-800" />
              <circle cx="28" cy="28" r="22.5" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="141.37" strokeDashoffset={(1 - timeLeft/totalPossible) * 141.37} className={`transition-all duration-1000 ${timeLeft < 10 ? 'text-rose-500' : 'text-rose-400'}`} />
            </svg>
            <span className={`absolute text-sm font-black italic ${timeLeft < 10 ? 'text-rose-500 animate-pulse' : 'text-white'}`}>{timeLeft}</span>
          </div>
        </div>
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.senderId === 'me' ? 'justify-end' : m.senderId === 'ai' ? 'justify-center' : 'justify-start'}`}>
              <div className={`px-4 py-2.5 rounded-2xl text-sm ${m.senderId === 'me' ? 'bg-rose-500 text-white rounded-tr-none' : m.senderId === 'ai' ? 'bg-indigo-500/10 text-indigo-300 italic text-xs' : 'bg-slate-800 text-slate-100 rounded-tl-none'}`}>{m.text}</div>
            </div>
          ))}
          {aiTip && (
            <div className="relative p-5 bg-indigo-600/10 border border-indigo-500/20 rounded-3xl animate-fade-in">
              <p className="text-[10px] font-black text-indigo-400 uppercase mb-2 tracking-widest">AI Referee Challenge</p>
              <p className="text-sm font-bold text-indigo-100 italic leading-relaxed">"{aiTip}"</p>
            </div>
          )}
          {!isPremium && !aiTip && phase === 'CHATTING' && (
            <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex items-center justify-between">
               <p className="text-[10px] text-amber-500 font-bold uppercase tracking-widest">🔒 AI Referee Tips disabled (Gold only)</p>
            </div>
          )}
        </div>
        <div className="p-4 bg-slate-900/40 border-t border-white/10 pb-24">
          <div className="flex justify-between px-2 mb-4">{REACTION_EMOJIS.map(emoji => (<button key={emoji} onClick={() => sendReaction(emoji)} className="text-2xl hover:scale-125 transition-transform p-2">{emoji}</button>))}</div>
          <div className="flex gap-2">
            <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} placeholder="Type fast..." className="flex-1 bg-slate-800 border border-white/10 rounded-2xl px-5 py-3 text-sm text-white" />
            <button onClick={handleSend} className="w-12 h-12 bg-rose-500 rounded-2xl text-white flex items-center justify-center active:scale-90 shadow-xl"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg></button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'VIBE_CHECK' && currentPartner) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-8 animate-fade-in bg-slate-950">
        <h2 className="text-3xl font-black text-white mb-4 uppercase italic tracking-tighter">Vibe Check!</h2>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          {userWantsToContinue === null ? (
            <div className="flex flex-col gap-3">
                <button onClick={() => setUserWantsToContinue(true)} className="w-full py-5 bg-indigo-600 rounded-2xl text-white font-black uppercase text-xs">Extend Chat (+2m) ⚡</button>
                <button onClick={() => setUserWantsToContinue(false)} className="w-full py-4 bg-slate-900 rounded-2xl text-slate-500 font-bold">Wrap it up</button>
            </div>
          ) : (
            <div className="text-center"><p className="text-xs text-indigo-300 italic font-bold animate-pulse">Waiting for {currentPartner.name}...</p></div>
          )}
        </div>
      </div>
    );
  }

  if (phase === 'DECISION' && currentPartner) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-8 animate-fade-in text-center">
        <h2 className="text-3xl font-black text-white mb-2 italic">Date Over</h2>
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <button onClick={() => { onMatch(currentPartner); setPhase('START'); }} className="w-full py-5 bg-gradient-to-r from-rose-500 to-indigo-600 rounded-2xl text-white font-black uppercase tracking-widest text-xs">Match & Save Chat ✨</button>
          <button onClick={() => setPhase('START')} className="w-full py-5 bg-slate-900 rounded-2xl text-slate-500 font-bold uppercase tracking-widest text-xs">Pass</button>
        </div>
      </div>
    );
  }

  return null;
};

export default SpeedDating;
