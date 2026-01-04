
import React from 'react';

interface SafetyPolicyProps {
  onClose: () => void;
}

const SafetyPolicy: React.FC<SafetyPolicyProps> = ({ onClose }) => {
  const sections = [
    {
      title: "RSA End-to-End Encryption",
      icon: "🔐",
      content: "All chat data is encrypted before it leaves your device using RSA-2048 and AES-GCM-256 protocols. Only you and your match hold the keys to unlock your conversations—not even SparkAI can read them."
    },
    {
      title: "Hybrid Community Disclosure",
      icon: "🤖",
      content: "To maintain 24/7 engagement and provide practice opportunities, the SparkAI discovery feed contains both verified human users and AI personalities. AI-driven profiles are clearly integrated to ensure no user ever faces an empty experience."
    },
    {
      title: "AI Moderation & Protection",
      icon: "🛡️",
      content: "Before encryption occurs, local AI monitors interactions for safety. We automatically block toxic behavior and harassment to ensure a healthy dating environment."
    },
    {
      title: "Verified Vibes",
      icon: "✅",
      content: "All users are encouraged to undergo AI-assisted photo verification. Profiles with the blue spark badge have been confirmed as real people through biometric liveness checks."
    },
    {
      title: "Zero-Tolerance Policy",
      icon: "🚫",
      content: "We have a strict zero-tolerance policy for hate speech or predatory behavior. Violations result in permanent hardware-level bans."
    },
    {
      title: "Data Sovereignty",
      icon: "🧬",
      content: "Your biometric data and encryption keys are stored exclusively in your device's secure enclave. We never sell your personal information."
    }
  ];

  return (
    <div className="fixed inset-0 z-[300] bg-slate-950 flex flex-col animate-fade-in overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="sticky top-0 z-10 px-6 py-8 glass-morphism border-b border-white/5 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Safety Center</h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-1">Privacy First Protocol</p>
        </div>
        <button 
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white active:scale-90 transition-all"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="p-6 space-y-8 pb-32 max-w-lg mx-auto w-full">
        {/* Hero Section */}
        <div className="relative p-8 rounded-[3rem] bg-gradient-to-br from-emerald-500/10 to-indigo-600/10 border border-emerald-500/20 overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              <h3 className="text-xl font-bold text-white uppercase tracking-tighter">Spark Shield Active</h3>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              SparkAI uses military-grade encryption to ensure that your private moments stay private. Every word you type is protected by your own hardware.
            </p>
          </div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-500/20 blur-3xl rounded-full" />
        </div>

        {/* Policy Grid */}
        <div className="space-y-4">
          {sections.map((section, idx) => (
            <div key={idx} className="p-6 rounded-[2rem] bg-white/5 border border-white/5 hover:border-white/10 transition-all">
              <div className="flex items-center gap-4 mb-3">
                <span className="text-2xl">{section.icon}</span>
                <h4 className="text-lg font-black text-white uppercase italic tracking-tight">{section.title}</h4>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">{section.content}</p>
            </div>
          ))}
        </div>

        {/* Reporting Section */}
        <div className="p-8 rounded-[3rem] bg-rose-950/20 border border-rose-500/30 text-center">
          <div className="w-12 h-12 rounded-2xl bg-rose-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-rose-500/20">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h4 className="text-white font-bold text-lg mb-2">Notice Something Wrong?</h4>
          <p className="text-slate-400 text-xs leading-relaxed mb-6">
            If you encounter a user violating our policies, use the 'Report' button on their profile. All reports are investigated by local AI and human safety agents.
          </p>
          <button className="px-8 py-3 bg-white text-slate-950 rounded-2xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all">
            Contact Support
          </button>
        </div>

        {/* App Info */}
        <div className="text-center space-y-2 opacity-40">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Spark Shield v3.1.2</p>
          <p className="text-[9px] text-slate-600 font-medium">© 2024 SparkAI Dating. All Rights Reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default SafetyPolicy;
