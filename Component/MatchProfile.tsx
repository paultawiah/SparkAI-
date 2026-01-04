
import React from 'react';
import { Profile, SubscriptionTier } from '../types';

interface MatchProfileProps {
  match: Profile;
  onClose: () => void;
  onUnmatch: () => void;
  userTier: SubscriptionTier;
}

const MatchProfile: React.FC<MatchProfileProps> = ({ match, onClose, onUnmatch, userTier }) => {
  const isPremium = userTier === SubscriptionTier.GOLD;

  return (
    <div className="fixed inset-0 z-[80] bg-slate-950 flex flex-col animate-fade-in overflow-y-auto custom-scrollbar">
      <div className="relative w-full h-[60vh]">
        <img src={match.imageUrl} className="w-full h-full object-cover" alt={match.name} />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
        <div className="absolute top-6 left-6 right-6 flex justify-between items-center">
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white border border-white/10 active:scale-90 transition-all"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
          <div className="flex flex-col items-end gap-2">
            {match.compatibility && <div className="bg-indigo-600 px-4 py-1.5 rounded-full text-white font-bold text-sm shadow-xl flex items-center gap-2 border border-white/20"><span className="text-white text-sm font-bold">{match.compatibility}% Vibe</span></div>}
            {match.isAi && (
              <div className="bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full border border-indigo-500/30 flex items-center gap-1.5 shadow-xl">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></div>
                <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">AI Personality</span>
              </div>
            )}
          </div>
        </div>
        <div className="absolute bottom-6 left-6">
          <div className="flex items-center gap-3">
            <h2 className="text-4xl font-black text-white italic tracking-tighter">{match.name}, {match.age}</h2>
            {match.isVerified && (
              <div className="text-sky-400 drop-shadow-[0_0_12px_rgba(56,189,248,0.7)] mt-1">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-slate-300 mt-1"><span className="text-sm font-bold">{match.distance}</span></div>
        </div>
      </div>

      <div className="flex-1 px-6 py-8 space-y-8 pb-32">
        {match.matchReason && (
          <div className="p-5 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Match Insight</span>
              {!isPremium && <span className="text-amber-500 text-[8px] font-black uppercase">🔒 Gold</span>}
            </div>
            <div className="relative">
              <p className={`text-slate-200 text-sm italic font-medium ${!isPremium ? 'blur-[4px] select-none opacity-40' : ''}`}>"{match.matchReason}"</p>
              {!isPremium && <div className="absolute inset-0 flex items-center justify-center"><p className="text-indigo-300 text-[10px] font-black uppercase text-center">Upgrade for details</p></div>}
            </div>
          </div>
        )}
        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">About Me</label>
          <p className="text-slate-300 leading-relaxed text-sm">{match.bio}</p>
        </div>
        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Interests</label>
          <div className="flex flex-wrap gap-2">
            {match.interests.map(interest => (<span key={interest} className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-slate-400 text-xs font-bold uppercase tracking-tighter">{interest}</span>))}
          </div>
        </div>
        <button onClick={onUnmatch} className="w-full py-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all">Unmatch {match.name}</button>
      </div>
    </div>
  );
};

export default MatchProfile;
