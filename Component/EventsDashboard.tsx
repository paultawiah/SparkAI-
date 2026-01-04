
import React, { useState, useEffect } from 'react';
import { Event, UserProfile, SubscriptionTier } from '../types';
import { MOCK_EVENTS } from '../constants';
import { getEventRecommendations } from '../services/geminiService';

interface EventsDashboardProps {
  currentUser: UserProfile;
  onRSVPRequested: () => boolean;
  onUpsell: () => void;
}

const EventsDashboard: React.FC<EventsDashboardProps> = ({ currentUser, onRSVPRequested, onUpsell }) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'virtual' | 'local'>('all');
  const [rsvpedEvents, setRsvpedEvents] = useState<Set<string>>(new Set());
  const [recommendations, setRecommendations] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setIsLoading(true);
      const recs = await getEventRecommendations(currentUser, MOCK_EVENTS);
      const recMap: Record<string, string> = {};
      recs.forEach(r => { recMap[r.eventId] = r.recommendation; });
      setRecommendations(recMap);
      setIsLoading(false);
    };
    fetchRecommendations();
  }, [currentUser]);

  const toggleRSVP = (id: string) => {
    if (rsvpedEvents.has(id)) {
      setRsvpedEvents(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      return;
    }

    const canRSVP = onRSVPRequested();
    if (canRSVP) {
      setRsvpedEvents(prev => new Set(prev).add(id));
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto custom-scrollbar animate-fade-in px-4 pt-24 pb-32">
      <div className="py-6 space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-black text-white italic tracking-tighter">Events</h2>
          {currentUser.tier === SubscriptionTier.FREE && (
             <div className="bg-white/5 border border-white/10 px-3 py-1 rounded-full flex items-center gap-2">
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">RSVPs: {currentUser.usageLimits.eventsRemaining}/1</span>
                <button onClick={onUpsell} className="text-[8px] font-black text-amber-500 uppercase tracking-tighter">Upgrade</button>
             </div>
          )}
        </div>
        <p className="text-slate-400 text-sm">Join the community in-person or virtually.</p>
      </div>

      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 no-scrollbar">
        {(['all', 'virtual', 'local'] as const).map(filter => (
          <button key={filter} onClick={() => setActiveFilter(filter)} className={`px-6 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all ${activeFilter === filter ? 'bg-rose-500 text-white' : 'bg-white/5 text-slate-400'}`}>{filter}</button>
        ))}
      </div>

      <div className="space-y-6">
        {MOCK_EVENTS.filter(e => activeFilter === 'all' || (activeFilter === 'virtual' ? e.type !== 'local' : e.type === 'local')).map(event => (
          <div key={event.id} className="group relative glass-morphism rounded-[2.5rem] overflow-hidden border border-white/10">
            <div className="aspect-[2/1] relative overflow-hidden">
              <img src={event.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-900/60 backdrop-blur-md text-white border border-white/10">{event.type}</span>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
              <p className="text-slate-400 text-sm mb-4 line-clamp-2">{event.description}</p>
              <div className="flex items-center justify-between">
                <div className="text-xs">
                  <div className="text-white font-bold">{event.date}</div>
                  <div className="text-slate-500 uppercase tracking-tighter">{event.location}</div>
                </div>
                <button onClick={() => toggleRSVP(event.id)} className={`px-6 py-3 rounded-2xl font-black text-xs uppercase transition-all ${rsvpedEvents.has(event.id) ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' : 'bg-white text-slate-950 hover:bg-rose-500 hover:text-white'}`}>{rsvpedEvents.has(event.id) ? '✓ Going' : 'RSVP Now'}</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventsDashboard;
