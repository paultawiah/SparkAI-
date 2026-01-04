
import React from 'react';
import { SubscriptionTier } from '../types';

interface PremiumUpsellProps {
  onUpgrade: () => void;
  onClose: () => void;
}

const PremiumUpsell: React.FC<PremiumUpsellProps> = ({ onUpgrade, onClose }) => {
  const perks = [
    { title: 'Unlimited AI Advice', desc: 'Get the perfect response for every chat, every time.', icon: '🪄' },
    { title: 'Infinite Practice', desc: 'Talk to Spark as much as you need to master your rizz.', icon: '🎙️' },
    { title: 'Gold Aura Badge', desc: 'Stand out with a premium badge that screams confidence.', icon: '✨' },
    { title: 'Advanced Compatibility', desc: 'See deep-dive analysis on every profile you swipe.', icon: '🧠' },
    { title: 'Priority Access', desc: 'Skip the line in Speed Dating sessions.', icon: '🚀' }
  ];

  return (
    <div className="fixed inset-0 z-[400] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-6 animate-fade-in">
      <div className="relative w-full max-w-sm glass-morphism rounded-[3rem] p-8 border border-amber-500/30 shadow-[0_0_50px_rgba(251,191,36,0.15)] flex flex-col items-center">
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-500 hover:text-white">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-2xl shadow-amber-500/40 rotate-6 mb-6">
          <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
          </svg>
        </div>

        <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter text-center">Spark Gold</h2>
        <p className="text-amber-500 text-[10px] font-black uppercase tracking-[0.4em] mb-8">Ultimate Dating Protocol</p>

        <div className="w-full space-y-4 mb-10">
          {perks.map((perk, i) => (
            <div key={i} className="flex items-center gap-4 group">
              <span className="text-xl">{perk.icon}</span>
              <div>
                <h4 className="text-[10px] font-black text-white uppercase tracking-wider">{perk.title}</h4>
                <p className="text-[10px] text-slate-500 font-medium">{perk.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="w-full space-y-4">
          <button 
            onClick={onUpgrade}
            className="w-full py-5 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:scale-105 transition-all active:scale-95"
          >
            Go Gold • $9.99/mo
          </button>
          <p className="text-[9px] text-slate-600 text-center font-bold uppercase tracking-widest">
            Cancel anytime. Satisfaction guaranteed.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PremiumUpsell;
