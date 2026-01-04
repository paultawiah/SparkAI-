
import React from 'react';

interface VerificationReminderProps {
  onVerify: () => void;
  onDismiss: () => void;
}

const VerificationReminder: React.FC<VerificationReminderProps> = ({ onVerify, onDismiss }) => {
  return (
    <div className="fixed bottom-24 left-4 right-4 z-[150] animate-slide-up">
      <div className="glass-morphism rounded-3xl p-4 border border-sky-500/30 shadow-[0_8px_32px_rgba(56,189,248,0.15)] flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Trust Factor</h4>
            <p className="text-slate-400 text-[10px] font-medium leading-tight">Verified profiles get 3x more sparks. Verify now?</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={onVerify}
            className="px-4 py-2 bg-sky-500 text-white text-[9px] font-black uppercase tracking-tighter rounded-xl active:scale-95 transition-all shadow-lg shadow-sky-500/20"
          >
            Verify
          </button>
          <button 
            onClick={onDismiss}
            className="p-2 text-slate-500 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerificationReminder;
