
import { EncryptedPayload } from './services/encryptionService';

export interface Profile {
  id: string;
  name: string;
  age: number;
  gender: 'man' | 'woman' | 'non-binary';
  bio: string;
  interests: string[];
  imageUrl: string;
  distance: string;
  location?: string;
  compatibility?: number;
  matchReason?: string;
  isVerified?: boolean;
  isAi?: boolean; 
  relationshipGoal?: string;
  personalityTraits?: string[];
  dealBreakers?: string[];
  isPremium?: boolean;
  publicKey?: string; 
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string; 
  encryptedPayload?: EncryptedPayload; 
  timestamp: number;
  read?: boolean;
}

export enum SubscriptionTier {
  FREE = 'free',
  GOLD = 'gold'
}

export interface UserProfile {
  name: string;
  age: number;
  gender: 'man' | 'woman' | 'non-binary';
  bio: string;
  interests: string[];
  userImageUrl?: string;
  isVerified?: boolean;
  location?: string;
  dateOfBirth?: string;
  lookingFor?: 'long-term' | 'short-term' | 'friendship' | 'not-sure';
  relationshipGoal?: string;
  personalityTraits?: string[];
  dealBreakers?: string[];
  tier: SubscriptionTier;
  publicKey?: string; 
  usageLimits: {
    aiAdviceRemaining: number;
    practiceSessionsRemaining: number;
    swipesRemaining: number;
    eventsRemaining: number;
    speedDatingRemaining: number;
    dateVisionRemaining: number;
    lastResetTimestamp: number;
  };
}

export enum AppTab {
  EXPLORE = 'explore',
  SPEED_DATING = 'speed_dating',
  DATE_VISION = 'date_vision',
  EVENTS = 'events',
  CHATS = 'chats',
  PROFILE = 'profile',
  LIVE_ICEBREAKER = 'live',
  PORTFOLIO = 'portfolio'
}

export interface FeedItem {
  id: string;
  type: 'match' | 'tip' | 'activity';
  message: string;
  timestamp: number;
  icon?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  type: 'virtual' | 'local' | 'speed-dating';
  imageUrl: string;
  attendees: number;
  tags: string[];
}
