
import React from 'react';

interface PortfolioViewProps {
  onBack: () => void;
}

const PortfolioView: React.FC<PortfolioViewProps> = ({ onBack }) => {
  const projects = [
    {
      title: "SparkAI Protocol",
      role: "Lead Architect • Genesis Project",
      tech: ["Gemini 3", "RSA-2048", "Supabase"],
      desc: "My first real-world project. A full-stack E2EE dating ecosystem designed to test the limits of AI-human interaction and secure networking."
    },
    {
      title: "Vibe Engine v1",
      role: "Security Lead",
      tech: ["Web Crypto API", "React 19"],
      desc: "Hardware-backed identity verification layer now integrated into the Tawiah Companies core infrastructure."
    }
  ];

  const incoming = [
    { title: "Neural Sync", type: "Social Protocol", status: "Design Phase" },
    { title: "Tawiah Auth 2.0", type: "Identity Node", status: "Prototyping" },
    { title: "Grid OS", type: "Security Shell", status: "Concept" }
  ];

  const stack = [
    { name: "Gemini Intelligence", level: "98%", color: "rose" },
    { name: "E2EE Security", level: "100%", color: "emerald" },
    { name: "Frontend Mastery", level: "95%", color: "indigo" }
  ];

  return (
    <div className="fixed inset-0 z-[500] bg-slate-950 flex flex-col animate-fade-in overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')] opacity-10 pointer-events-none"></div>
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/10 blur-[120px] rounded-full animate-pulse"></div>
      
      {/* Header */}
      <div className="relative z-10 px-8 py-10 flex items-center justify-between border-b border-white/5 glass-morphism">
        <div className="space-y-1">
          <h2 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em]">Manuscript Access</h2>
          <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase">Paul Tawiah</h1>
        </div>
        <button 
          onClick={onBack}
          className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-white transition-all active:scale-95"
        >
          Close Dossier
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-12 pb-40">
        {/* Intro */}
        <section className="space-y-4 max-w-lg">
          <p className="text-emerald-500/80 font-mono text-[11px] leading-relaxed italic">
            "I build systems that value human agency and absolute privacy. SparkAI marks my debut into real-world production. This is just the beginning of the Tawiah Companies vision."
          </p>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">SF_CORE_NODE</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse [animation-delay:0.5s]"></div>
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">E2EE_CERTIFIED</span>
            </div>
          </div>
        </section>

        {/* Project Dossier */}
        <section className="space-y-6">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">The Genesis Dossier</h3>
          <div className="grid grid-cols-1 gap-4">
            {projects.map((p, i) => (
              <div key={i} className="p-6 rounded-[2rem] bg-white/5 border border-white/10 hover:border-emerald-500/30 transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-1">
                    <h4 className="text-lg font-bold text-white">{p.title}</h4>
                    <p className="text-[9px] text-emerald-500 font-black uppercase tracking-widest">{p.role}</p>
                  </div>
                  <div className="flex gap-1">
                    {p.tech.map((t, ti) => (
                      <span key={ti} className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[7px] font-black text-slate-500 uppercase">{t}</span>
                    ))}
                  </div>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed italic">"{p.desc}"</p>
              </div>
            ))}
          </div>
        </section>

        {/* Future Roadmap Section */}
        <section className="space-y-6">
           <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Incoming Transmissions</h3>
           <div className="space-y-3">
              {incoming.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl group hover:bg-indigo-500/5 transition-all">
                   <div>
                      <h4 className="text-xs font-bold text-white tracking-wide">{item.title}</h4>
                      <p className="text-[8px] text-slate-600 font-black uppercase tracking-widest">{item.type}</p>
                   </div>
                   <span className="text-[7px] font-black text-indigo-500/50 uppercase tracking-[0.2em]">{item.status}</span>
                </div>
              ))}
           </div>
           <p className="text-[10px] text-slate-500 italic text-center">Development roadmap is active. Stay tuned for more protocols.</p>
        </section>

        {/* Tech Stack Metrics */}
        <section className="space-y-6">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Architect Stats</h3>
          <div className="space-y-5">
            {stack.map((s, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-bold text-white uppercase tracking-tight">
                  <span>{s.name}</span>
                  <span className={`text-${s.color}-500`}>{s.level}</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-${s.color}-500 shadow-[0_0_8px_rgba(var(--${s.color}-rgb),0.5)] transition-all duration-1000 delay-300`} 
                    style={{ width: s.level }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* External Protocols */}
        <section className="pt-8 border-t border-white/5 flex flex-col items-center gap-6">
          <div className="text-center space-y-2">
            <h4 className="text-white font-black text-xs uppercase tracking-widest">Connect with the Architect</h4>
            <p className="text-slate-600 text-[9px] font-medium tracking-tight">Access external communication arrays</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => window.open('https://paul-tawiah.dev', '_blank')}
              className="px-6 py-3 bg-white text-slate-950 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all shadow-xl"
            >
              Master Domain
            </button>
            <button 
              onClick={() => window.open('https://github.com/paul-tawiah', '_blank')}
              className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
            >
              Source Node
            </button>
          </div>
        </section>

        <div className="text-center opacity-20 py-10">
           <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.8em]">TAWIAH COMPANIES • UNCLASSIFIED</p>
        </div>
      </div>
    </div>
  );
};

export default PortfolioView;
