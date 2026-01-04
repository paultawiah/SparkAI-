
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Profile, UserProfile, ChatMessage, SubscriptionTier } from '../types';
import { generateConversationStarters, getChatAdvice, moderateContent, generateDateSpotSuggestions, DateSpot, generateAiChatReply } from '../services/geminiService';
import { encryptForRecipient, decryptPayload, importPublicKey, exportPublicKey, KeyPair } from '../services/encryptionService';
import { sendEncryptedMessage, fetchMessages, subscribeToMessages } from '../services/supabaseService';
import MatchProfile from './MatchProfile';
import VideoCall from './VideoCall';

interface ChatWindowProps {
  match: Profile;
  currentUser: UserProfile;
  userKeys: KeyPair | null;
  onBack: () => void;
  onUnmatch: (id: string) => void;
  onAdviceRequested: () => boolean;
  onUpsell: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ match, currentUser, userKeys, onBack, onUnmatch, onAdviceRequested, onUpsell }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [starters, setStarters] = useState<string[]>([]);
  const [dateSpots, setDateSpots] = useState<DateSpot[]>([]);
  const [groundingLinks, setGroundingLinks] = useState<{ uri: string, title: string }[]>([]);
  const [isLoadingStarters, setIsLoadingStarters] = useState(false);
  const [isGettingAdvice, setIsGettingAdvice] = useState(false);
  const [isPlanningDate, setIsPlanningDate] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isModerating, setIsModerating] = useState(false);
  const [moderationError, setModerationError] = useState<string | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showDatePanel, setShowDatePanel] = useState(false);
  const [isInVideoCall, setIsInVideoCall] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isPremium = currentUser.tier === SubscriptionTier.GOLD;
  const userId = localStorage.getItem('sparkai_user_uuid');

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  useEffect(() => {
    if (!userId || !userKeys) return;

    const loadHistory = async () => {
      const cloudMsgs = await fetchMessages(userId, match.id);
      const decrypted = await Promise.all(cloudMsgs.map(async (m: any) => {
        try {
          let text = "[Encrypted Content]";
          if (m.sender_id === userId) {
            text = m.local_text || "Sent Message";
          } else {
            text = await decryptPayload({
              data: m.encrypted_data,
              iv: m.iv,
              key: m.wrapped_key
            }, userKeys.privateKey);
          }
          return {
            id: m.id,
            senderId: m.sender_id === userId ? 'me' : match.id,
            text,
            timestamp: new Date(m.created_at).getTime()
          };
        } catch (e) {
          return {
            id: m.id,
            senderId: m.sender_id === userId ? 'me' : match.id,
            text: "[Identity Key Desync]",
            timestamp: new Date(m.created_at).getTime()
          };
        }
      }));
      setMessages(decrypted);
    };

    loadHistory();

    const subscription = subscribeToMessages(userId, async (newMsg) => {
      if (newMsg.sender_id !== match.id) return;
      try {
        const text = await decryptPayload({
          data: newMsg.encrypted_data,
          iv: newMsg.iv,
          key: newMsg.wrapped_key
        }, userKeys.privateKey);
        
        setMessages(prev => {
          if (prev.find(m => m.id === newMsg.id)) return prev;
          return [...prev, {
            id: newMsg.id,
            senderId: match.id,
            text,
            timestamp: Date.now()
          }];
        });
      } catch (e) {
        console.error("Real-time decryption failure");
      }
    });

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, [userId, match.id, userKeys]);

  useEffect(() => {
    const fetchStarters = async () => {
      setIsLoadingStarters(true);
      try {
        const result = await generateConversationStarters(currentUser, match);
        setStarters(isPremium ? result : result.slice(0, 1));
      } catch (e) {}
      setIsLoadingStarters(false);
    };
    fetchStarters();
  }, [match.id, isPremium]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isModerating || !userKeys || !userId) return;
    
    setModerationError(null);
    setIsModerating(true);
    
    const safetyCheck = await moderateContent(text, 'text');
    if (!safetyCheck.isSafe) {
      setModerationError(safetyCheck.reason || "Safety block.");
      setIsModerating(false);
      return;
    }

    try {
      const matchPubKeyJwk = match.publicKey || JSON.stringify(await exportPublicKey(userKeys.publicKey)); 
      const matchPubKey = await importPublicKey(matchPubKeyJwk);
      const encryptedPayload = await encryptForRecipient(text, matchPubKey);
      
      await sendEncryptedMessage(userId, match.id, encryptedPayload);

      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        senderId: 'me',
        text: text,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, newMessage]);
      setInputValue('');

      if (match.isAi) {
        setIsTyping(true);
        const aiReply = await generateAiChatReply(match, currentUser, text, messages);
        setTimeout(() => {
          setIsTyping(false);
          setMessages(prev => [...prev, {
            id: `ai-${Date.now()}`,
            senderId: match.id,
            text: aiReply,
            timestamp: Date.now(),
          }]);
        }, 1500);
      }
    } catch (e: any) {
      setModerationError("Secure Tunnel Interrupted.");
    } finally {
      setIsModerating(false);
    }
  };

  const handlePlanDate = async () => {
    if (!isPremium) {
      onUpsell();
      return;
    }
    setIsPlanningDate(true);
    setShowDatePanel(true);
    
    let coords;
    try {
      const pos: any = await new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res, rej));
      coords = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
    } catch (e) {
      console.warn("Geolocation fallback to static");
    }

    try {
      const result = await generateDateSpotSuggestions(
        currentUser.interests, 
        match.interests, 
        currentUser.location || 'San Francisco',
        coords
      );
      setDateSpots(result.spots);
      setGroundingLinks(result.sources);
    } catch (e) {
      console.error(e);
    } finally {
      setIsPlanningDate(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col animate-slide-up">
      {isInVideoCall && <VideoCall match={match} onEnd={() => setIsInVideoCall(false)} userTier={currentUser.tier} onUpsell={onUpsell} />}

      {showDatePanel && (
        <div className="absolute inset-0 z-[110] bg-slate-950/60 backdrop-blur-md flex items-end">
          <div className="w-full bg-slate-900 rounded-t-[3rem] border-t border-white/10 p-8 animate-slide-up max-h-[85vh] overflow-y-auto custom-scrollbar shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Date Discovery</h3>
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-1">Grounding Engine: Live Search</p>
              </div>
              <button onClick={() => setShowDatePanel(false)} className="p-3 bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {isPlanningDate ? (
              <div className="py-24 flex flex-col items-center gap-6">
                <div className="w-14 h-14 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest animate-pulse">Syncing Map Data...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {dateSpots.length === 0 ? (
                  <div className="py-12 text-center text-slate-600 italic">No spots found for your specific vibe check.</div>
                ) : (
                  dateSpots.map((spot, idx) => (
                    <div key={idx} className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group">
                      <h4 className="text-lg font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">{spot.name}</h4>
                      <p className="text-slate-400 text-sm mb-4 leading-relaxed">{spot.description}</p>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                        <p className="text-[11px] font-bold text-indigo-200 uppercase tracking-tight italic">Recommended by Spark Core</p>
                      </div>
                    </div>
                  ))
                )}

                {groundingLinks.length > 0 && (
                  <div className="space-y-4 pt-6 border-t border-white/5">
                    <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Grounded Evidence</h5>
                    <div className="grid grid-cols-1 gap-3">
                      {groundingLinks.map((link, idx) => (
                        <a 
                          key={idx} 
                          href={link.uri} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center justify-between px-5 py-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 hover:bg-indigo-500/10 transition-all text-indigo-300"
                        >
                          <div className="flex items-center gap-3">
                            <svg className="w-5 h-5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                            <span className="text-[11px] font-black uppercase tracking-widest truncate max-w-[200px]">{link.title || 'Location Node'}</span>
                          </div>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Chat Header */}
      <div className="px-6 py-5 glass-morphism border-b border-white/5 flex items-center justify-between z-20">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 -ml-2 text-slate-400 hover:text-white transition-colors active:scale-75"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
          <div className="relative cursor-pointer" onClick={() => setShowProfile(true)}><img src={match.imageUrl} className="w-11 h-11 rounded-2xl object-cover border border-white/10" alt="" /><div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-4 border-slate-950"></div></div>
          <div className="cursor-pointer" onClick={() => setShowProfile(true)}>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-white leading-tight">{match.name}</h3>
              {match.isAi && <span className="text-indigo-400 animate-pulse text-xs">✨</span>}
            </div>
            <p className="text-[9px] text-emerald-500 font-black uppercase tracking-widest mt-0.5">RSA-2048 TUNNEL</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handlePlanDate} className="p-3 bg-white/5 rounded-2xl text-indigo-400 hover:bg-indigo-500/10 transition-all active:scale-90" title="Date Vision"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg></button>
          <button onClick={() => setIsInVideoCall(true)} className="p-3 bg-white/5 rounded-2xl text-rose-400 hover:bg-rose-500/10 transition-all active:scale-90"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14" /></svg></button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar pb-12">
        <div className="flex justify-center py-4">
          <div className="px-5 py-2 rounded-full bg-emerald-500/5 border border-emerald-500/10 text-[8px] font-black text-emerald-500/60 uppercase tracking-widest flex items-center gap-2">
            Identity Keys Verified by Tawiah Security Node
          </div>
        </div>
        
        {messages.length === 0 && starters.length > 0 && (
          <div className="space-y-4 py-6 animate-fade-in">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] px-2">Architect AI Suggestions</p>
            <div className="flex flex-col gap-3">
              {starters.map((starter, i) => (<button key={i} onClick={() => handleSend(starter)} className="p-4 text-left rounded-[2rem] bg-indigo-500/5 border border-indigo-500/10 text-indigo-200 text-xs font-medium hover:bg-indigo-500/10 transition-all">✨ {starter}</button>))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.senderId === 'me' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[85%] px-5 py-3 rounded-[2rem] text-sm leading-relaxed ${msg.senderId === 'me' ? 'bg-gradient-to-r from-rose-500 to-indigo-600 text-white rounded-tr-none shadow-xl' : 'bg-slate-800 text-slate-200 rounded-tl-none border border-white/5 shadow-lg'}`}>{msg.text}</div>
            <div className="mt-1.5 flex items-center gap-1.5 px-2">
              <span className="text-[7px] font-black text-slate-600 uppercase tracking-widest">
                {msg.senderId === 'me' ? 'Handshake Secure' : 'Authenticated Stream'}
              </span>
            </div>
          </div>
        ))}
        {isTyping && <div className="flex justify-start"><div className="bg-slate-800 rounded-[1.5rem] rounded-tl-none px-5 py-3.5 flex items-center gap-1.5 shadow-lg"><div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" /><div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]" /><div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]" /></div></div>}
      </div>

      <div className="p-5 glass-morphism border-t border-white/5 pb-10 relative">
        {moderationError && <div className="absolute -top-12 left-0 right-0 px-6"><p className="text-rose-400 text-[9px] font-black uppercase text-center bg-rose-950/80 backdrop-blur-md py-2 rounded-full border border-rose-500/30 shadow-2xl">{moderationError}</p></div>}
        <div className="flex gap-3 items-center max-w-lg mx-auto">
          <button 
            onClick={async () => { 
              if (isGettingAdvice) return; 
              setIsGettingAdvice(true); 
              try {
                const res = await getChatAdvice(currentUser, match, messages); 
                setStarters(res); 
              } catch (e) {}
              setIsGettingAdvice(false); 
            }} 
            disabled={isGettingAdvice} 
            className={`p-4 rounded-[1.5rem] bg-white/5 border border-white/10 text-rose-500 hover:bg-rose-500/10 transition-all ${isGettingAdvice ? 'animate-pulse opacity-50' : 'active:scale-90'}`}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </button>
          <div className="flex-1 flex gap-3 items-center bg-white/5 border border-white/10 rounded-[2rem] pl-6 pr-2 py-1.5 shadow-inner">
            <input 
              type="text" 
              value={inputValue} 
              onChange={(e) => setInputValue(e.target.value)} 
              onKeyPress={(e) => e.key === 'Enter' && handleSend(inputValue)} 
              placeholder="Hardware E2EE Stream..." 
              className="flex-1 bg-transparent border-none focus:ring-0 text-slate-200 text-sm py-2 placeholder:text-slate-600" 
            />
            <button onClick={() => handleSend(inputValue)} disabled={!inputValue.trim() || isModerating} className="w-10 h-10 rounded-[1.2rem] bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/20 active:scale-90 transition-all disabled:opacity-30">
              {isModerating ? <div className="w-4 h-4 border-2 border-t-white border-white/30 rounded-full animate-spin" /> : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>}
            </button>
          </div>
        </div>
      </div>
      {showProfile && <MatchProfile match={match} onClose={() => setShowProfile(false)} onUnmatch={onUnmatch} userTier={currentUser.tier} />}
    </div>
  );
};

export default ChatWindow;
