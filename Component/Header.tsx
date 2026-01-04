
import React, { useState, useEffect } from 'react';
import { isConfigured, supabase } from '../services/supabaseService';

interface HeaderProps {
  onFilterClick?: () => void;
  onDeployClick?: () => void;
  showFilterButton?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onFilterClick, onDeployClick, showFilterButton = true }) => {
  const [isLive, setIsLive] = useState(false);
  const [entropy, setEntropy] = useState(0);
  const [nodes, setNodes] = useState(0);
  const isDemoMode = localStorage.getItem('spark_db_setup_done') === 'true' && !isLive;

  useEffect(() => {
    const checkCloud = async () => {
      if (!isConfigured()) return;
      try {
        const { error } = await supabase.from('profiles').select('id').limit(1);
        setIsLive(!error);
      } catch {
        setIsLive(false);
      }
    };
    checkCloud();
    const interval = setInterval(checkCloud, 10000);
    const entropyInterval = setInterval(() => {
      setEntropy(Math.floor(Math.random() * 256));
      setNodes(Math.floor(Math.random() * 5) + 8);
    }, 2000);
    return () => {
      clearInterval(interval);
      clearInterval(entropyInterval);
    };
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 glass-morphism border-b border-white/5 flex items-center justify-between">
      <div className="flex items-center gap-3 cursor-pointer group" onClick={onDeployClick}>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-rose-500/20 group-active:scale-90 transition-transform relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
          <svg className="w-6 h-6 text-white relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-black gradient-text tracking-tighter leading-none uppercase italic">SparkAI</h1>
          <div className="flex items-center gap-2 mt-1">
            <div className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse' : isDemoMode ? 'bg-amber-500' : 'bg-slate-600'}`}></div>
            <div className="flex flex-col">
              <span className={`text-[7px] font-black uppercase tracking-widest ${isLive ? 'text-emerald-500' : isDemoMode ? 'text-amber-500' : 'text-slate-500'}`}>
                {isLive ? 'TAWIAH_NET_SECURE' : isDemoMode ? 'DEMO_PROTOCOL' : 'INITIALIZING...'}
              </span>
              <div className="flex gap-2">
                <span className="text-[6px] text-slate-600 font-mono tracking-tighter uppercase">ENTROPY: 0x{entropy.toString(16).toUpperCase()}</span>
                <span className="text-[6px] text-slate-600 font-mono tracking-tighter uppercase">NODES: {nodes}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-1.5">
        <button 
          onClick={onDeployClick}
          className="px-3 py-1.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10 flex items-center gap-2 hover:bg-emerald-500/10 transition-all active:scale-95 group"
          title="Architect Terminal"
        >
          <div className="flex gap-0.5">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-0.5 h-3 bg-emerald-400/40 rounded-full group-hover:bg-emerald-400 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}></div>
            ))}
          </div>
          <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">Architect</span>
        </button>

        {showFilterButton && (
          <button 
            onClick={onFilterClick}
            className="p-2 rounded-xl hover:bg-white/5 transition-all active:scale-90 group relative"
            title="Discovery Filters"
          >
            <svg className="w-5 h-5 text-slate-500 group-hover:text-rose-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
