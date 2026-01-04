
import React, { useState } from 'react';
import { registerUser, authenticateUser, initiatePasswordReset, verifyAndResetPassword, isConfigured } from '../services/supabaseService';

interface AuthProps {
  onAuthComplete: (user: { name: string; email: string; id: string }, isNewUser: boolean) => void;
}

type AuthMode = 'login' | 'signup' | 'reset';

const Auth: React.FC<AuthProps> = ({ onAuthComplete }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isCacheError, setIsCacheError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [resetStep, setResetStep] = useState<1 | 2>(1);

  const RELOAD_CMD = "NOTIFY pgrst, 'reload schema';";

  const handleCopyFix = () => {
    navigator.clipboard.writeText(RELOAD_CMD);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsCacheError(false);
    
    if (!isConfigured()) {
      setError("Cloud services not configured. Please use the 'Setup Database' tool first.");
      return;
    }

    const sanitizedEmail = email.toLowerCase().trim();

    if (mode === 'reset') {
      if (resetStep === 1) {
        if (!sanitizedEmail) { setError('Email required.'); return; }
        setIsLoading(true);
        const result = await initiatePasswordReset(sanitizedEmail);
        setIsLoading(false);
        if (result.success) {
          setResetStep(2);
          setSuccess(`Recovery code broadcasted. Check terminal/console for code: ${result.token}`);
        } else {
          setError(result.error || "Recovery failed.");
        }
        return;
      } else {
        if (!resetToken || !password) { setError('Token and New Password required.'); return; }
        setIsLoading(true);
        const result = await verifyAndResetPassword(sanitizedEmail, resetToken, password);
        setIsLoading(false);
        if (result.success) {
          setMode('login');
          setResetStep(1);
          setSuccess("Credentials updated. Authenticate to proceed.");
          setPassword('');
          setResetToken('');
        } else {
          setError(result.error || "Override failed.");
        }
        return;
      }
    }

    if (!sanitizedEmail || !password || (mode === 'signup' && !name)) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);

    try {
      let result;
      if (mode === 'signup') {
        result = await registerUser(name.trim(), sanitizedEmail, password);
      } else {
        result = await authenticateUser(sanitizedEmail, password);
      }

      if (result.success && result.data) {
        onAuthComplete({ name: result.data.name, email: result.data.email, id: result.data.id }, mode === 'signup');
      } else {
        setError(result.error || "Authentication failed");
        if (result.error?.includes('reload schema')) {
          setIsCacheError(true);
        }
      }
    } catch (err: any) {
      setError("Connection error. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950 overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-rose-600/20 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/20 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="relative w-full max-w-sm px-6 animate-fade-in">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 to-indigo-600 flex items-center justify-center shadow-2xl shadow-rose-500/30 mb-4 rotate-3">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-4xl font-black gradient-text tracking-tighter italic uppercase text-center">SparkAI</h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2 text-center">
            {mode === 'reset' ? 'RECOVERY_PROTOCOL' : 'Centralized Auth Protocol'}
          </p>
        </div>

        {/* Auth Card */}
        <div className="glass-morphism rounded-[2.5rem] p-8 border border-white/10 shadow-2xl relative overflow-hidden">
          {mode !== 'reset' && (
            <div className="flex gap-4 mb-8">
              <button 
                onClick={() => { setMode('login'); setError(null); setSuccess(null); setIsCacheError(false); }}
                className={`flex-1 py-2 text-xs font-black uppercase tracking-widest transition-all border-b-2 ${mode === 'login' ? 'border-rose-500 text-white' : 'border-transparent text-slate-500'}`}
              >
                Sign In
              </button>
              <button 
                onClick={() => { setMode('signup'); setError(null); setSuccess(null); setIsCacheError(false); }}
                className={`flex-1 py-2 text-xs font-black uppercase tracking-widest transition-all border-b-2 ${mode === 'signup' ? 'border-rose-500 text-white' : 'border-transparent text-slate-500'}`}
              >
                Sign Up
              </button>
            </div>
          )}

          {mode === 'reset' && (
            <div className="mb-6 flex items-center justify-between">
               <h3 className="text-xs font-black text-white uppercase tracking-widest italic">Identity Recovery</h3>
               <button onClick={() => { setMode('login'); setResetStep(1); setError(null); setSuccess(null); }} className="text-[10px] text-slate-500 hover:text-white uppercase font-black">Cancel</button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="space-y-1 animate-slide-up">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Your Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="What should we call you?"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm text-white focus:outline-none focus:border-rose-500 transition-all placeholder:text-slate-600"
                  autoComplete="name"
                />
              </div>
            )}

            {(mode !== 'reset' || resetStep === 1 || resetStep === 2) && (
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                <input 
                  type="email" 
                  value={email}
                  disabled={mode === 'reset' && resetStep === 2}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm text-white focus:outline-none focus:border-rose-500 transition-all placeholder:text-slate-600 disabled:opacity-50"
                  autoComplete="email"
                />
              </div>
            )}

            {mode === 'reset' && resetStep === 2 && (
              <div className="space-y-4 animate-slide-up">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-amber-500 uppercase tracking-widest ml-1">Verification Code</label>
                  <input 
                    type="text" 
                    maxLength={6}
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    placeholder="6-digit code"
                    className="w-full bg-white/5 border border-amber-500/30 rounded-2xl px-5 py-3.5 text-sm text-white focus:outline-none focus:border-amber-500 transition-all placeholder:text-slate-600 text-center tracking-[0.5em] font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">New Password</label>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm text-white focus:outline-none focus:border-rose-500 transition-all placeholder:text-slate-600"
                    autoComplete="new-password"
                  />
                </div>
              </div>
            )}

            {(mode === 'login' || mode === 'signup') && (
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                  {mode === 'signup' ? 'Create Password' : 'Password'}
                </label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm text-white focus:outline-none focus:border-rose-500 transition-all placeholder:text-slate-600"
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                />
              </div>
            )}

            {error && (
              <div className={`p-4 rounded-2xl border animate-shake ${isCacheError ? 'bg-amber-500/10 border-amber-500/30' : 'bg-rose-500/10 border-rose-500/20'}`}>
                <p className={`text-[9px] font-bold uppercase tracking-widest text-center leading-relaxed ${isCacheError ? 'text-amber-400' : 'text-rose-400'}`}>
                  {error}
                </p>
                {isCacheError && (
                  <button 
                    type="button"
                    onClick={handleCopyFix}
                    className="w-full mt-3 py-2 bg-amber-500 text-slate-900 rounded-xl text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all"
                  >
                    {copied ? 'Copied to Clipboard!' : 'Copy Fix Command'}
                  </button>
                )}
              </div>
            )}

            {success && (
              <div className="p-4 rounded-2xl border bg-emerald-500/10 border-emerald-500/20">
                 <p className="text-[9px] font-bold uppercase tracking-widest text-center leading-relaxed text-emerald-400">
                   {success}
                 </p>
              </div>
            )}

            <button 
              disabled={isLoading}
              className="w-full py-4 mt-4 bg-gradient-to-r from-rose-500 to-indigo-600 rounded-2xl text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Syncing...</span>
                </div>
              ) : (
                mode === 'login' ? 'Secure Sign In' : (mode === 'signup' ? 'Create Identity' : (resetStep === 1 ? 'Generate Recovery Code' : 'Update Credentials'))
              )}
            </button>
          </form>

          {mode === 'login' && (
            <div className="mt-6 text-center">
               <button 
                onClick={() => { setMode('reset'); setResetStep(1); setError(null); setSuccess(null); }}
                className="text-[10px] font-black text-slate-600 uppercase tracking-widest hover:text-rose-400 transition-colors"
               >
                 Forgot Security Credentials?
               </button>
            </div>
          )}

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
            <div className="relative flex justify-center text-[8px] uppercase font-black text-slate-600 tracking-[0.4em] bg-transparent">
              <span className="bg-slate-900 px-3 py-1 rounded-full border border-white/5">Secured By Supabase</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
