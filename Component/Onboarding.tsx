
import React, { useState } from 'react';

interface OnboardingProps {
  onComplete: () => void;
}

const steps = [
  {
    title: "Meet Your AI Matchmaker",
    description: "Welcome to the future of dating. SparkAI uses advanced Gemini models to understand your vibe and find your person.",
    icon: (
      <div className="relative">
        <div className="absolute inset-0 bg-rose-500 blur-3xl opacity-30 rounded-full animate-pulse"></div>
        <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-rose-500 to-indigo-600 flex items-center justify-center shadow-2xl shadow-rose-500/30 rotate-3">
          <svg className="w-14 h-14 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
      </div>
    )
  },
  {
    title: "Hybrid Community",
    description: "To ensure you always have someone to talk to, SparkAI features a mix of real users and sophisticated AI personalities. AI profiles are here to help you practice and stay engaged.",
    icon: (
      <div className="relative flex items-center justify-center">
        <div className="flex -space-x-6">
          <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-white/10 flex items-center justify-center shadow-lg">
            <span className="text-xl">👤</span>
          </div>
          <div className="w-16 h-16 rounded-full bg-indigo-600 border-2 border-indigo-400 flex items-center justify-center z-10 shadow-xl">
             <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
             </svg>
          </div>
          <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-white/10 flex items-center justify-center shadow-lg">
            <span className="text-xl">👥</span>
          </div>
        </div>
      </div>
    )
  },
  {
    title: "Deep Soul Analysis",
    description: "No more guessing. We analyze profile bios and interests to calculate a real compatibility score for every single Spark.",
    icon: (
      <div className="relative flex items-center justify-center">
        <div className="absolute w-32 h-32 bg-indigo-500/10 blur-2xl rounded-full"></div>
        <div className="w-20 h-20 rounded-full bg-indigo-500/20 border-2 border-indigo-400/50 flex items-center justify-center">
           <svg className="w-10 h-10 text-indigo-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
      </div>
    )
  },
  {
    title: "60-Second Speed Spark",
    description: "Short on time? Jump into our live speed-dating arena. Chat for 1 minute, feel the vibe, and decide if you want to stay.",
    icon: (
      <div className="flex gap-4 items-center scale-110">
        <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center border-2 border-rose-500/30 text-rose-400">
           <div className="text-xl font-black italic">60s</div>
        </div>
        <div className="w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center text-white shadow-lg animate-bounce">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
    )
  },
  {
    title: "Your Voice Wingman",
    description: "Anxious about what to say? Talk to Spark, our real-time voice AI, to practice conversation skills and get date advice.",
    icon: (
      <div className="relative">
        <div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-20 animate-pulse"></div>
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center shadow-xl">
          <svg className="w-10 h-10 text-white animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </div>
      </div>
    )
  }
];

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsAnimating(false);
      }, 250);
    } else {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-6 bg-slate-950/90 backdrop-blur-xl">
      <div className="relative w-full max-w-sm glass-morphism rounded-[48px] p-8 border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] flex flex-col items-center text-center animate-slide-up">
        
        {/* Skip Button */}
        <button 
          onClick={onComplete}
          className="absolute top-8 right-10 text-[10px] font-black text-slate-500 hover:text-rose-400 transition-colors uppercase tracking-[0.2em]"
        >
          Skip
        </button>

        {/* Illustration Area */}
        <div className={`mb-12 mt-8 h-32 flex items-center justify-center transition-all duration-300 transform ${isAnimating ? 'scale-90 opacity-0' : 'scale-100 opacity-100'}`}>
          {steps[currentStep].icon}
        </div>

        {/* Content */}
        <div className={`space-y-4 mb-10 transition-all duration-300 ${isAnimating ? 'translate-y-4 opacity-0' : 'translate-y-0 opacity-100'}`}>
          <h2 className="text-3xl font-black text-white italic tracking-tighter leading-none uppercase">
            {steps[currentStep].title}
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed px-2 font-medium">
            {steps[currentStep].description}
          </p>
        </div>

        {/* Progress Dots */}
        <div className="flex gap-2.5 mb-10">
          {steps.map((_, idx) => (
            <div 
              key={idx} 
              className={`h-1.5 rounded-full transition-all duration-500 ${
                idx === currentStep ? 'w-10 bg-gradient-to-r from-rose-500 to-indigo-600' : 'w-1.5 bg-slate-800'
              }`} 
            />
          ))}
        </div>

        {/* Primary Action */}
        <button 
          onClick={handleNext}
          className="w-full py-5 rounded-[2rem] bg-white text-slate-950 font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-rose-500 hover:text-white active:scale-[0.96] transition-all"
        >
          {currentStep === steps.length - 1 ? 'Start Your Journey' : 'Continue'}
        </button>
        
        <p className="mt-6 text-[9px] text-slate-600 font-bold uppercase tracking-widest">
          Version 2.5 • Powered by Gemini
        </p>
      </div>
    </div>
  );
};

export default Onboarding;
