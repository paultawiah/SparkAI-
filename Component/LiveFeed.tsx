
import React from 'react';
import { FeedItem } from '../types';

interface LiveFeedProps {
  items: FeedItem[];
}

const LiveFeed: React.FC<LiveFeedProps> = ({ items }) => {
  return (
    <div className="w-full overflow-x-auto custom-scrollbar pb-2">
      <div className="flex gap-3 px-2 min-w-max">
        {items.map((item) => (
          <div
            key={item.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl glass-morphism border animate-slide-up transition-all duration-500 ${
              item.type === 'match' 
                ? 'border-rose-500/40 bg-rose-500/5' 
                : 'border-white/5 bg-white/5'
            }`}
          >
            <div className={`p-2 rounded-xl flex-shrink-0 ${
              item.type === 'match' ? 'bg-rose-500 text-white' : 
              item.type === 'tip' ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300'
            }`}>
              {item.type === 'match' && (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
              )}
              {item.type === 'tip' && (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              )}
              {item.type === 'activity' && (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </div>
            <div className="flex flex-col">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${
                item.type === 'match' ? 'text-rose-400' : 'text-slate-500'
              }`}>
                {item.type === 'match' ? 'New Spark!' : item.type === 'tip' ? 'AI Insight' : 'Nearby'}
              </span>
              <p className="text-xs text-slate-200 font-medium whitespace-nowrap">
                {item.message}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LiveFeed;
