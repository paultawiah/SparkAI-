
import React from 'react';
import { Profile, SubscriptionTier } from '../types';

interface ProfileCardProps {
  profile: Profile;
  onSwipeRight: (profile: Profile) => void;
  onSwipeLeft: () => void;
  userTier: SubscriptionTier;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ profile, onSwipeRight, onSwipeLeft, userTier }) => {
  const hasAIStats = profile.compatibility !== undefined && profile.matchReason;
  const isPremium = userTier === SubscriptionTier.GOLD;

  return (
    <div className="relative w-full h-[70vh] rounded-3xl overflow-hidden shadow-2xl glass-morphism group">
      <img
        src={profile.imageUrl}
        alt={profile.name}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
      />
      
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        {profile.compatibility && (
          <div className="bg-indigo-600/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-white/20 shadow-lg shadow-indigo-500/20">
            <svg className="w-4 h-4 text-white animate-pulse" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
            <span className="text-white text-sm font-bold">{profile.compatibility}%</span>
          </div>
        )}
        
        {/* Transparency Badges */}
        {profile.isAi ? (
          <div className="bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full border border-indigo-500/30 flex items-center gap-1.5 shadow-xl">
             <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></div>
             <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">AI Personality</span>
          </div>
        ) : (
          <div className="bg-emerald-500/10 backdrop-blur-md px-3 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1.5 shadow-xl">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
             <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">Nearby Member</span>
          </div>
        )}
      </div>

      {/* Info Overlay */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-6 pt-24">
        <div className="flex items-end justify-between mb-2">
          <div>
            <h2 className="text-3xl font-bold text-white flex items-center gap-2">
              {profile.name}, {profile.age}
              {profile.isVerified && (
                <div className="text-sky-400 drop-shadow-[0_0_10px_rgba(56,189,248,0.6)]">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              )}
            </h2>
            <p className="text-slate-300 text-sm flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {profile.distance}
            </p>
          </div>
        </div>

        <p className="text-slate-200 text-sm mb-4 line-clamp-2 italic">
          "{profile.bio}"
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {profile.interests.slice(0, 3).map((interest, idx) => (
            <span key={idx} className="px-2.5 py-1 rounded-md bg-white/10 backdrop-blur-sm text-xs font-medium text-white border border-white/10">
              {interest}
            </span>
          ))}
          {profile.interests.length > 3 && <span className="text-[10px] text-slate-500 font-bold">+{profile.interests.length - 3} more</span>}
        </div>

        {/* AI Analysis Section */}
        <div className="mb-6 p-4 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 backdrop-blur-md relative overflow-hidden group/insight">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 blur-2xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover/insight:scale-150 transition-transform duration-1000" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded bg-indigo-500/30">
                  <svg className="w-4 h-4 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="font-bold text-indigo-300 text-[10px] uppercase tracking-[0.2em]">Match Insights</span>
              </div>
              {!isPremium && <span className="text-amber-500 text-[8px] font-black uppercase flex items-center gap-1">🔒 Gold Only</span>}
            </div>

            {hasAIStats ? (
              <div className="relative">
                <p className={`text-indigo-100 text-xs leading-relaxed font-medium transition-all duration-500 ${!isPremium ? 'blur-[3px] select-none opacity-40' : ''}`}>
                  {profile.matchReason}
                </p>
                {!isPremium && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-indigo-300 text-[10px] font-black uppercase tracking-widest text-center px-4">Upgrade to read deep vibe check</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3 py-1">
                <div className="w-4 h-4 border-2 border-indigo-500/30 border-t-indigo-400 rounded-full animate-spin" />
                <p className="text-indigo-300/60 text-xs italic">Syncing compatibility...</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-center gap-6">
          <button
            onClick={onSwipeLeft}
            className="w-14 h-14 rounded-full bg-slate-800/80 backdrop-blur-md flex items-center justify-center border border-white/10 text-white hover:text-rose-400 hover:scale-110 transition-all shadow-lg"
          >
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <button
            onClick={() => onSwipeRight(profile)}
            className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-500 to-indigo-600 flex items-center justify-center text-white hover:scale-110 transition-all shadow-xl shadow-rose-500/20"
          >
            <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
