
import React from 'react';
import { AppTab } from '../types';

interface BottomNavProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: AppTab.EXPLORE, icon: 'M4 6h16M4 12h16m-7 6h7', label: 'Explore' },
    { id: AppTab.SPEED_DATING, icon: 'M13 10V3L4 14h7v7l9-11h-7z', label: 'Speed' },
    { id: AppTab.DATE_VISION, icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z', label: 'Vision' },
    { id: AppTab.LIVE_ICEBREAKER, icon: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z', label: 'Live AI' },
    { id: AppTab.CHATS, icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z', label: 'Chats' },
    { id: AppTab.PROFILE, icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', label: 'Profile' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-2 pt-3 pb-safe glass-morphism border-t border-white/5">
      <div className="flex justify-around items-center max-w-lg mx-auto mb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center gap-1 transition-all duration-300 ${
              activeTab === tab.id ? 'text-rose-500 scale-110' : 'text-slate-500'
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
            </svg>
            <span className="text-[9px] font-bold uppercase tracking-tighter">{tab.label}</span>
          </button>
        ))}
      </div>
      <div className="text-center py-1 opacity-30">
        <p className="text-[7px] font-black text-slate-400 uppercase tracking-[0.4em]">
          © 2024 TAWIAH COMPANIES • ENCRYPTED PROTOCOL
        </p>
      </div>
    </nav>
  );
};

export default BottomNav;
