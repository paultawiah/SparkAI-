
import React, { useState, useEffect } from 'react';
import { UserProfile, SubscriptionTier } from '../types';

interface ProfileViewProps {
  user: UserProfile;
  onSignOut: () => void;
  onUpgrade: () => void;
  onViewPortfolio: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ user, onSignOut, onUpgrade, onViewPortfolio }) => {
  const [traffic, setTraffic] = useState<{ id: string; node: string; action: string }[]>([]);
  const [terminalLog, setTerminalLog] = useState<string[]>(["GENESIS_PROTOCOL_STABLE", "RSA_2048_ACTIVE", "V1_DEBUT_PRODUCTION"]);

  useEffect(() => {
    const interval = setInterval(() => {
      const actions = ['RSA_HANDSHAKE', 'KEY_ROTATION', 'GENESIS_SYNC', 'AUTH_VALIDATE'];
      const nodes = ['NODE_SF_01', 'NODE_NY_02', 'NODE_LDN_03'];
      const newTraffic = {
        id: Math.random().toString(36).substring(7).toUpperCase(),
        node: nodes[Math.floor(Math.random() * nodes.length)],
        action: actions[Math.floor(Math.random() * actions.length)]
      };
      setTraffic(prev => [newTraffic, ...prev].slice(0, 3));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const runProtocol = (name: string) => {
    setTerminalLog(prev => [`[EXEC] ${name}_SEQUENCE_INITIATED`, ...prev.slice(0, 5)]);
    setTimeout(() => {
      setTerminalLog(prev => [`[DONE] ${name}_COMPLETED_SUCCESSFULLY`, ...prev.slice(0, 5)]);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full animate-fade-in p-6 pt-24 pb-40 overflow-y-auto custom-scrollbar bg-slate-950">
      {/* User Header */}
      <div className="relative mb-12">
        <div className="flex flex-col items-center">
          <div className="relative group">
            <div className="absolute inset-0 bg-rose-500 blur-2xl opacity-20 rounded-full group-hover:opacity-40 transition-opacity" />
            <img 
              src={user.userImageUrl || 'https://picsum.photos/seed/user/400/400'} 
              className="w-32 h-32 rounded-[2.5rem] object-cover border-4 border-white/10 relative z-10 shadow-2xl" 
              alt={user.name} 
            />
            {user.tier === SubscriptionTier.GOLD && (
              <div className="absolute -bottom-2 -right-2 bg-amber-500 p-2 rounded-2xl shadow-lg z-20 animate-bounce">
                <svg className="w-4 h-4 text-slate-900" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
              </div>
            )}
          </div>
          <h2 className="text-3xl font-black text-white italic tracking-tighter mt-6 uppercase">{user.name}, {user.age}</h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-1">{user.tier === SubscriptionTier.GOLD ? 'Gold Protocol Member' : 'Standard Identity'}</p>
        </div>
      </div>

      {/* Founder Section - The Architect's Chamber */}
      <div className="mb-12 relative">
        <div className="absolute inset-0 bg-emerald-500/10 blur-3xl rounded-full" />
        <div className="relative glass-morphism rounded-[2.5rem] p-8 border border-emerald-500/30 overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-1000" />
          
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em]">Architect's Chamber</h3>
                <span className="bg-emerald-500/10 border border-emerald-500/30 text-[7px] font-black text-emerald-400 px-1.5 py-0.5 rounded-full uppercase tracking-widest animate-pulse">Genesis</span>
              </div>
              <p className="text-xl font-bold text-white italic">Paul Tawiah</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>

          <div className="space-y-4 font-mono">
            <div className="flex items-center gap-3">
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-md border border-emerald-500/20 font-black tracking-widest">REAL_WORLD_PROJ_01</span>
            </div>
            
            {/* Command Suite */}
            <div className="grid grid-cols-2 gap-2 my-4">
              <button 
                onClick={() => runProtocol('GENESIS_SYNC')}
                className="py-2 bg-white/5 border border-white/10 rounded-xl text-[8px] font-black text-slate-300 uppercase hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all active:scale-95"
              >
                Sync Genesis
              </button>
              <button 
                onClick={() => runProtocol('FLUSH_CACHE')}
                className="py-2 bg-white/5 border border-white/10 rounded-xl text-[8px] font-black text-slate-300 uppercase hover:bg-rose-500/10 hover:border-rose-500/30 transition-all active:scale-95"
              >
                Purge Logs
              </button>
            </div>

            <div className="bg-black/40 rounded-xl p-3 border border-emerald-500/10 min-h-[60px]">
              {terminalLog.map((log, i) => (
                <div key={i} className={`text-[7px] font-bold ${i === 0 ? 'text-emerald-400' : 'text-slate-600'}`}>
                  {i === 0 && <span className="animate-pulse mr-1">></span>}
                  {log}
                </div>
              ))}
            </div>

            <p className="text-slate-400 text-xs leading-relaxed italic mt-4">
              "SparkAI is my first real-world project. It is the foundation. There is more to come."
            </p>
            
            <div className="flex items-center gap-2 pt-4">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
              <span className="text-[8px] text-emerald-500 font-black uppercase tracking-widest">Protocol Nominal</span>
            </div>
          </div>
        </div>
      </div>

      {/* App Actions */}
      <div className="space-y-4">
        {user.tier === SubscriptionTier.FREE && (
          <button 
            onClick={onUpgrade}
            className="w-full py-5 rounded-[2rem] bg-gradient-to-r from-amber-400 to-orange-600 text-slate-950 font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-amber-500/20 active:scale-95 transition-all"
          >
            Upgrade to Spark Gold
          </button>
        )}
        <button 
          onClick={onViewPortfolio} 
          className="w-full py-5 rounded-[2rem] bg-white/5 border border-white/10 text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-white/10 active:scale-95 transition-all"
        >
          View Architect's Portfolio
        </button>
        <button 
          onClick={onSignOut}
          className="w-full py-5 rounded-[2rem] bg-rose-500/10 border border-rose-500/20 text-rose-500 font-black text-xs uppercase tracking-[0.2em] active:scale-95 transition-all"
        >
          Deactivate Session
        </button>
      </div>

      <div className="mt-16 text-center space-y-2">
        <p className="text-[10px] text-emerald-500 font-black uppercase tracking-[0.8em] drop-shadow-[0_0_5px_rgba(16,185,129,0.4)]">
          TAWIAH COMPANIES
        </p>
        <p className="text-[7px] text-slate-700 font-bold uppercase tracking-[0.3em]">
          E2EE Secured Dating Protocol • v2.6.0-PROD
        </p>
      </div>
    </div>
  );
};

export default ProfileView;
