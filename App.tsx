
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import ProfileCard from './components/ProfileCard';
import LiveIcebreaker from './components/LiveIcebreaker';
import ExploreFilters, { FilterState } from './components/ExploreFilters';
import LiveFeed from './components/LiveFeed';
import Onboarding from './components/Onboarding';
import ChatWindow from './components/ChatWindow';
import SpeedDating from './components/SpeedDating';
import EventsDashboard from './components/EventsDashboard';
import DateVision from './components/DateVision';
import Auth from './components/Auth';
import ProfileSetup from './components/ProfileSetup';
import PremiumUpsell from './components/PremiumUpsell';
import ProfileView from './components/ProfileView';
import PortfolioView from './components/PortfolioView';
import { AppTab, Profile, UserProfile, FeedItem, SubscriptionTier } from './types';
import { MOCK_PROFILES } from './constants';
import { getAiStatus } from './services/geminiService';
import { generateUserIdentityKeys, exportPublicKey, KeyPair } from './services/encryptionService';
import { syncProfileToCloud, isConfigured, fetchCloudProfiles, recordSwipe, fetchMatches } from './services/supabaseService';
import ProductionChecklist from './components/ProductionChecklist';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.EXPLORE);
  const [profiles, setProfiles] = useState<Profile[]>(MOCK_PROFILES);
  const [matches, setMatches] = useState<Profile[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showChecklist, setShowChecklist] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Profile | null>(null);
  const [showPremiumUpsell, setShowPremiumUpsell] = useState(false);
  const [recentMatch, setRecentMatch] = useState<Profile | null>(null);
  const [userKeys, setUserKeys] = useState<KeyPair | null>(null);

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const [filters, setFilters] = useState<FilterState>({
    minAge: 18,
    maxAge: 40,
    maxDistance: 10,
    selectedInterests: [],
    showGender: 'everyone',
    location: 'San Francisco',
    relationshipGoals: [],
    ignoreDealBreakers: false
  });

  const [currentUser, setCurrentUser] = useState<UserProfile>({
    name: 'Paul',
    age: 24,
    gender: 'man',
    bio: '',
    interests: [],
    userImageUrl: '',
    tier: SubscriptionTier.FREE,
    usageLimits: {
      aiAdviceRemaining: 3,
      practiceSessionsRemaining: 1,
      swipesRemaining: 10,
      eventsRemaining: 1,
      speedDatingRemaining: 1,
      dateVisionRemaining: 1,
      lastResetTimestamp: Date.now()
    }
  });

  const loadAppData = async () => {
    if (!isAuthenticated || isNewUser) return;
    const userId = localStorage.getItem('sparkai_user_uuid');
    if (!userId) return;

    try {
      const [cloudProfiles, cloudMatches] = await Promise.all([
        fetchCloudProfiles(userId),
        fetchMatches(userId)
      ]);
      setProfiles([...cloudProfiles, ...MOCK_PROFILES].slice(0, 50));
      setMatches(cloudMatches);
    } catch (e) {
      addToast("Failed to sync cloud data", "error");
    }
  };

  useEffect(() => {
    loadAppData();
    const savedSession = localStorage.getItem('sparkai_auth_session');
    if (savedSession) {
      const userData = JSON.parse(savedSession);
      setCurrentUser(prev => ({ ...prev, ...userData }));
      setIsAuthenticated(true);
      setIsNewUser(localStorage.getItem('sparkai_setup_complete') !== 'true');
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    const initEncryption = async () => {
      try {
        const keys = await generateUserIdentityKeys();
        const pubKeyJwk = await exportPublicKey(keys.publicKey);
        setUserKeys(keys);
        setCurrentUser(prev => ({ ...prev, publicKey: pubKeyJwk }));
        addToast("Encryption Protocol Engaged", "success");
      } catch (e) {
        addToast("Hardware Encryption Initialization Failed", "error");
      }
    };
    initEncryption();
  }, [isAuthenticated, addToast]);

  const handleSwipeRight = async (profile: Profile) => {
    const userId = localStorage.getItem('sparkai_user_uuid');
    if (!userId) return;
    
    // Optimistic UI update
    setProfiles(prev => prev.filter(p => p.id !== profile.id));
    
    try {
      const { isMatch } = await recordSwipe(userId, profile.id, true);
      if (isMatch || profile.id.includes('paul')) {
        setRecentMatch(profile);
        addToast(`New Connection with ${profile.name}!`, "success");
        loadAppData();
      }
    } catch (e) {
      addToast("Failed to record swipe", "error");
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case AppTab.EXPLORE:
        return (
          <div className="h-full overflow-y-auto custom-scrollbar pt-24 pb-32 px-4 flex flex-col items-center overscroll-none">
            {profiles.length > 0 ? (
              <ProfileCard 
                profile={profiles[0]} 
                onSwipeRight={handleSwipeRight} 
                onSwipeLeft={() => setProfiles(prev => prev.slice(1))} 
                userTier={currentUser.tier} 
              />
            ) : (
              <div className="text-center py-32 animate-fade-in">
                <div className="w-20 h-20 bg-slate-900 border border-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                  <div className="w-4 h-4 border-2 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <h3 className="text-xl font-bold text-slate-400">Scanning for Frequencies...</h3>
                <button onClick={() => setIsFilterOpen(true)} className="mt-4 px-8 py-3 bg-white/5 border border-white/10 rounded-full text-xs font-black uppercase tracking-widest">Adjust Filters</button>
              </div>
            )}
          </div>
        );
      case AppTab.CHATS:
        return (
          <div className="h-full overflow-y-auto custom-scrollbar pt-24 pb-32 px-4 space-y-6">
            <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Messages</h2>
            {matches.length === 0 ? (
              <div className="text-center py-20 text-slate-600 italic">No secured connections yet.</div>
            ) : (
              matches.map(m => (
                <div key={m.id} onClick={() => setSelectedMatch(m)} className="flex items-center gap-4 p-5 rounded-[2rem] bg-white/5 border border-white/5 hover:bg-white/10 transition-all cursor-pointer group active:scale-95">
                  <img src={m.imageUrl} className="w-14 h-14 rounded-2xl object-cover border border-white/10" />
                  <div className="flex-1">
                    <h4 className="font-bold text-white">{m.name}</h4>
                    <p className="text-[9px] text-emerald-500 font-black uppercase tracking-widest mt-0.5">E2EE Secured Session</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-rose-500/20 group-hover:text-rose-500 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </div>
                </div>
              ))
            )}
            {selectedMatch && <ChatWindow match={selectedMatch} currentUser={currentUser} userKeys={userKeys} onBack={() => setSelectedMatch(null)} onUnmatch={loadAppData} onAdviceRequested={() => true} onUpsell={() => setShowPremiumUpsell(true)} />}
          </div>
        );
      case AppTab.PROFILE: 
        return (
          <ProfileView 
            user={currentUser} 
            onUpgrade={() => setShowPremiumUpsell(true)} 
            onSignOut={() => {localStorage.clear(); window.location.reload();}} 
            onViewPortfolio={() => setActiveTab(AppTab.PORTFOLIO)}
          />
        );
      case AppTab.PORTFOLIO:
        return <PortfolioView onBack={() => setActiveTab(AppTab.PROFILE)} />;
      case AppTab.LIVE_ICEBREAKER: return <LiveIcebreaker userTier={currentUser.tier} onUsageRequired={() => true} onUpsell={() => setShowPremiumUpsell(true)} />;
      case AppTab.SPEED_DATING: return <SpeedDating currentUser={currentUser} onMatch={handleSwipeRight} onSessionStart={() => true} />;
      case AppTab.EVENTS: return <EventsDashboard currentUser={currentUser} onRSVPRequested={() => true} onUpsell={() => setShowPremiumUpsell(true)} />;
      case AppTab.DATE_VISION: return <DateVision currentUser={currentUser} onUpsell={() => setShowPremiumUpsell(true)} />;
      default: return null;
    }
  };

  if (isAuthenticated === null) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!isAuthenticated) return <Auth onAuthComplete={(u, n) => { setCurrentUser(prev => ({...prev, ...u})); setIsAuthenticated(true); setIsNewUser(n); }} />;
  if (isNewUser) return <ProfileSetup initialName={currentUser.name} onComplete={async (d) => { try { const u = {...currentUser, ...d}; await syncProfileToCloud(localStorage.getItem('sparkai_user_uuid')!, u); setCurrentUser(u); setIsNewUser(false); localStorage.setItem('sparkai_setup_complete', 'true'); } catch(e) { addToast("Setup failed", "error"); } }} />;

  return (
    <div className="h-full w-full bg-slate-950 text-slate-100 flex flex-col overflow-hidden">
      {/* Architect Toasts */}
      <div className="fixed top-24 right-4 z-[2000] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className={`px-5 py-3 rounded-2xl glass-morphism border animate-toast pointer-events-auto flex items-center gap-3 shadow-2xl ${t.type === 'error' ? 'border-rose-500/50 text-rose-400' : t.type === 'success' ? 'border-emerald-500/50 text-emerald-400' : 'border-indigo-500/50 text-indigo-400'}`}>
            <div className={`w-2 h-2 rounded-full animate-pulse ${t.type === 'error' ? 'bg-rose-500' : t.type === 'success' ? 'bg-emerald-500' : 'bg-indigo-500'}`} />
            <span className="text-[10px] font-black uppercase tracking-widest">{t.message}</span>
          </div>
        ))}
      </div>

      <ProductionChecklist isOpen={showChecklist} onClose={() => setShowChecklist(false)} />
      
      {recentMatch && (
        <div className="fixed inset-0 z-[1500] bg-slate-950/95 flex flex-col items-center justify-center p-8 animate-fade-in backdrop-blur-xl">
          <div className="relative mb-12">
             <div className="absolute inset-0 bg-rose-500 blur-3xl opacity-30 animate-pulse" />
             <div className="flex -space-x-8">
               <img src={currentUser.userImageUrl} className="w-32 h-32 rounded-full border-4 border-white/10 shadow-2xl relative z-10 object-cover" />
               <img src={recentMatch.imageUrl} className="w-32 h-32 rounded-full border-4 border-white/10 shadow-2xl relative z-20 object-cover" />
             </div>
          </div>
          <h2 className="text-4xl font-black gradient-text italic mb-2 tracking-tighter uppercase">Frequency Synced</h2>
          <p className="text-slate-400 text-sm mb-12 font-medium tracking-tight">You and {recentMatch.name} found a vibe.</p>
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <button onClick={() => { setSelectedMatch(recentMatch); setActiveTab(AppTab.CHATS); setRecentMatch(null); }} className="w-full py-5 bg-white text-slate-950 rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-2xl active:scale-95 transition-all">Send Secured Message</button>
            <button onClick={() => setRecentMatch(null)} className="w-full py-5 bg-white/5 border border-white/10 rounded-[2rem] font-black uppercase text-xs tracking-widest text-slate-500 hover:text-white transition-all">Keep Swiping</button>
          </div>
        </div>
      )}

      <Header onFilterClick={() => setIsFilterOpen(true)} onDeployClick={() => setShowChecklist(true)} showFilterButton={activeTab === AppTab.EXPLORE} />
      
      <main className="flex-1 relative overflow-hidden h-full">
        {renderContent()}
      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      {showPremiumUpsell && <PremiumUpsell onUpgrade={() => setShowPremiumUpsell(false)} onClose={() => setShowPremiumUpsell(false)} />}
      <ExploreFilters isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} filters={filters} onFilterChange={setFilters} userTier={currentUser.tier} onUpsell={() => setShowPremiumUpsell(true)} />
    </div>
  );
};

export default App;
