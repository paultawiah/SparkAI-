
import React, { useState, useEffect } from 'react';
import { UserProfile, Profile, SubscriptionTier } from '../types';
import { generateDateVisualization } from '../services/geminiService';
import { fetchMatches } from '../services/supabaseService';

interface DateVisionProps {
  currentUser: UserProfile;
  onUpsell: () => void;
}

const DateVision: React.FC<DateVisionProps> = ({ currentUser, onUpsell }) => {
  const [matches, setMatches] = useState<Profile[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Profile | null>(null);
  const [vision, setVision] = useState<{ imageUrl: string; description: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMatches, setIsLoadingMatches] = useState(true);

  useEffect(() => {
    const loadMatches = async () => {
      const userId = localStorage.getItem('sparkai_user_uuid');
      if (userId) {
        const data = await fetchMatches(userId);
        setMatches(data);
      }
      setIsLoadingMatches(false);
    };
    loadMatches();
  }, []);

  const handleGenerate = async (match: Profile) => {
    if (currentUser.tier !== SubscriptionTier.GOLD && currentUser.usageLimits.dateVisionRemaining <= 0) {
      onUpsell();
      return;
    }

    setIsLoading(true);
    setSelectedMatch(match);
    try {
      const result = await generateDateVisualization(currentUser, match);
      setVision(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingMatches) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="w-10 h-10 border-4 border-rose-500/20 border-t-rose-500 rounded-full animate-spin" />
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Loading Connections...</p>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-8 text-center gap-6">
        <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-700">
           <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
        </div>
        <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">No Vision Targets</h2>
        <p className="text-slate-500 text-sm">Match with someone to unlock AI-powered Date Visualizations.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full animate-fade-in p-6 overflow-y-auto pb-32 custom-scrollbar">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">Date Vision</h2>
        <p className="text-slate-400 text-xs font-black uppercase tracking-widest mt-1">AI-Powered Date Concepts</p>
      </div>

      {!vision && !isLoading && (
        <div className="space-y-6">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-4">Choose a match to visualize</p>
          <div className="grid grid-cols-1 gap-4">
            {matches.map(match => (
              <button 
                key={match.id} 
                onClick={() => handleGenerate(match)}
                className="flex items-center gap-4 p-4 rounded-3xl bg-white/5 border border-white/5 hover:border-indigo-500/50 transition-all group text-left"
              >
                <img src={match.imageUrl} className="w-14 h-14 rounded-2xl object-cover border border-white/10" alt="" />
                <div className="flex-1">
                   <h4 className="font-bold text-white text-lg">{match.name}</h4>
                   <p className="text-[10px] text-slate-500 font-medium">Shared Interests: {match.interests.slice(0, 2).join(', ')}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {isLoading && (
        <div className="flex-1 flex flex-col items-center justify-center py-20 gap-8">
           <div className="relative">
              <div className="w-32 h-32 border-4 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                 <svg className="w-12 h-12 text-indigo-500 animate-pulse" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>
              </div>
           </div>
           <div className="text-center space-y-2">
              <h3 className="text-xl font-black text-white italic uppercase tracking-widest">Generating Concept...</h3>
              <p className="text-slate-500 text-[10px] font-black uppercase animate-pulse">Consulting the Spark Oracle</p>
           </div>
        </div>
      )}

      {vision && !isLoading && (
        <div className="animate-slide-up space-y-8">
          <div className="relative rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl group">
             <img src={vision.imageUrl} className="w-full aspect-video object-cover" alt="AI Date Concept" />
             <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
             <div className="absolute bottom-6 left-6 right-6">
                <div className="flex items-center gap-3 mb-2">
                   <div className="px-3 py-1 rounded-full bg-indigo-600 text-white text-[8px] font-black uppercase tracking-widest">Spark Vision 2.5</div>
                </div>
                <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Your Dream Date</h3>
             </div>
          </div>
          
          <div className="p-8 rounded-[2.5rem] bg-indigo-500/5 border border-indigo-500/20 space-y-4">
             <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">The Experience</h4>
             <p className="text-slate-200 text-sm leading-relaxed font-medium">
               {vision.description}
             </p>
          </div>

          <div className="flex gap-4">
             <button onClick={() => setVision(null)} className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 text-slate-400 font-black text-[10px] uppercase tracking-widest transition-all">New Vision</button>
             <button className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-rose-500 to-indigo-600 text-white font-black text-[10px] uppercase tracking-widest shadow-xl">Share with {selectedMatch?.name}</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateVision;
