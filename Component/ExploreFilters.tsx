
import React from 'react';
import { INTEREST_OPTIONS, RELATIONSHIP_GOALS, DEAL_BREAKERS } from '../constants';
import { SubscriptionTier } from '../types';

export interface FilterState {
  minAge: number;
  maxAge: number;
  maxDistance: number;
  selectedInterests: string[];
  showGender: 'man' | 'woman' | 'everyone';
  location: string;
  relationshipGoals: string[];
  ignoreDealBreakers: boolean;
}

interface ExploreFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  isOpen: boolean;
  onClose: () => void;
  userTier: SubscriptionTier;
  onUpsell: () => void;
}

const ExploreFilters: React.FC<ExploreFiltersProps> = ({ filters, onFilterChange, isOpen, onClose, userTier, onUpsell }) => {
  if (!isOpen) return null;

  const isPremium = userTier === SubscriptionTier.GOLD;

  const toggleInterest = (interest: string) => {
    const newInterests = filters.selectedInterests.includes(interest)
      ? filters.selectedInterests.filter(i => i !== interest)
      : [...filters.selectedInterests, interest];
    onFilterChange({ ...filters, selectedInterests: newInterests });
  };

  const toggleGoal = (goalId: string) => {
    if (!isPremium) {
      onUpsell();
      return;
    }
    const newGoals = filters.relationshipGoals.includes(goalId)
      ? filters.relationshipGoals.filter(g => g !== goalId)
      : [...filters.relationshipGoals, goalId];
    onFilterChange({ ...filters, relationshipGoals: newGoals });
  };

  const handleDistanceChange = (val: number) => {
    if (!isPremium && val > 10) {
      onUpsell();
      return;
    }
    onFilterChange({ ...filters, maxDistance: val });
  };

  const handleDealBreakerToggle = () => {
    if (!isPremium) {
      onUpsell();
      return;
    }
    onFilterChange({ ...filters, ignoreDealBreakers: !filters.ignoreDealBreakers });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center px-4 pb-24">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-lg glass-morphism rounded-[2.5rem] p-6 border border-white/10 animate-slide-up shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">Discovery Filters</h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white transition-colors bg-white/5 rounded-full">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="space-y-8 max-h-[65vh] overflow-y-auto pr-2 custom-scrollbar pb-4">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Show Me</label>
            <div className="flex bg-slate-800/50 rounded-2xl p-1.5 border border-white/5">
              {(['man', 'woman', 'everyone'] as const).map((gender) => (
                <button
                  key={gender}
                  onClick={() => onFilterChange({...filters, showGender: gender})}
                  className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    filters.showGender === gender ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-500'
                  }`}
                >
                  {gender === 'everyone' ? 'Everyone' : gender + 'en'}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Max Distance</label>
              <span className="text-indigo-400 font-bold text-xs">{filters.maxDistance} miles</span>
            </div>
            <div className="relative group">
              <input 
                type="range" 
                min="1" 
                max="100" 
                value={filters.maxDistance} 
                onChange={(e) => handleDistanceChange(parseInt(e.target.value))} 
                className="w-full accent-indigo-500 h-1.5 bg-slate-700 rounded-lg" 
              />
              {!isPremium && (
                 <div className="absolute -top-1 right-0 bg-amber-500/10 text-amber-500 text-[7px] font-black px-1 rounded border border-amber-500/20">🔒 10mi Limit</div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Deal Breakers</label>
              {!isPremium && <span className="text-[8px] text-amber-500 font-black uppercase tracking-tighter">🔒 Gold</span>}
            </div>
            <button 
              onClick={handleDealBreakerToggle}
              className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${filters.ignoreDealBreakers ? 'bg-indigo-500/10 border-indigo-500' : 'bg-white/5 border-white/10'}`}
            >
              <span className="text-xs font-bold text-slate-300">Ignore preferences for more matches</span>
              <div className={`w-10 h-5 rounded-full relative transition-colors ${filters.ignoreDealBreakers ? 'bg-indigo-500' : 'bg-slate-700'}`}>
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${filters.ignoreDealBreakers ? 'right-1' : 'left-1'}`} />
              </div>
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Intentions</label>
              {!isPremium && <span className="text-[8px] text-amber-500 font-black uppercase tracking-tighter">🔒 Gold Feature</span>}
            </div>
            <div className={`flex flex-wrap gap-2 transition-all ${!isPremium ? 'opacity-50 grayscale pointer-events-none blur-[1px]' : ''}`}>
              {RELATIONSHIP_GOALS.map(goal => (
                <button
                  key={goal.id}
                  onClick={() => toggleGoal(goal.id)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-tighter border transition-all ${
                    filters.relationshipGoals.includes(goal.id) ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300' : 'bg-white/5 border-white/10 text-slate-500'
                  }`}
                >
                  {goal.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Interests</label>
            <div className="flex flex-wrap gap-2">
              {INTEREST_OPTIONS.map(interest => (
                <button
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-tighter border transition-all ${
                    filters.selectedInterests.includes(interest) ? 'bg-rose-500/20 border-rose-500 text-rose-300' : 'bg-white/5 border-white/10 text-slate-500'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button onClick={onClose} className="w-full mt-6 py-4 rounded-2xl bg-gradient-to-r from-rose-500 to-indigo-600 text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl active:scale-[0.98]">Update Discovery</button>
      </div>
    </div>
  );
};

export default ExploreFilters;
