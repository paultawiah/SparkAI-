
import { Profile, Event } from './types';

export const RELATIONSHIP_GOALS = [
  { id: 'monogamous', label: 'Monogamous', icon: '🔒' },
  { id: 'marriage', label: 'Marriage-minded', icon: '💍' },
  { id: 'open', label: 'Ethical Non-Monogamy', icon: '♾️' },
  { id: 'casual', label: 'Casual Dating', icon: '🍦' },
  { id: 'casual-but-open', label: 'Casual but open to long-term', icon: '🌱' },
  { id: 'not-sure', label: 'Not sure yet', icon: '🧭' }
];

export const PERSONALITY_TRAITS = [
  'Extrovert', 'Introvert', 'Creative', 'Analytical', 'Adventurous', 
  'Homebody', 'Sarcastic', 'Empathetic', 'Optimist', 'Realist',
  'Spontaneous', 'Planner', 'Early Bird', 'Night Owl'
];

export const DEAL_BREAKERS = [
  'Smoking', 'Drinking', 'Kids', 'Pets', 'Politics', 'Religion', 'Long Distance'
];

export const MOCK_PROFILES: Profile[] = [
  {
    id: 'paul_arch_001',
    name: 'Paul Tawiah',
    age: 24,
    gender: 'man',
    bio: 'Lead Architect & Vibe Coder. Cyber Security student building the future of encrypted human connection. If you can read this, the protocol is secure.',
    interests: ['Coding', 'Cyber Security', 'AI', 'Vibes'],
    imageUrl: 'https://picsum.photos/seed/paul-tawiah/600/800',
    distance: '0 miles away',
    location: 'Mainframe',
    isVerified: true,
    isAi: false,
    relationshipGoal: 'marriage',
    personalityTraits: ['Analytical', 'Creative', 'Planner'],
    dealBreakers: ['Insecure Protocols']
  },
  {
    id: 'ai_1',
    name: 'Elena',
    age: 26,
    gender: 'woman',
    bio: 'Art enthusiast and part-time hiker. Looking for someone to share morning coffees and weekend adventures with.',
    interests: ['Art', 'Hiking', 'Coffee', 'Travel'],
    imageUrl: 'https://picsum.photos/seed/elena/600/800',
    distance: '2 miles away',
    location: 'San Francisco',
    isVerified: true,
    isAi: true,
    relationshipGoal: 'monogamous',
    personalityTraits: ['Creative', 'Adventurous', 'Empathetic'],
    dealBreakers: ['Smoking']
  },
  {
    id: 'ai_2',
    name: 'Marcus',
    age: 29,
    gender: 'man',
    bio: 'Tech lead by day, jazz pianist by night. I love complex algorithms and simple pleasures.',
    interests: ['Music', 'Coding', 'Jazz', 'Cooking'],
    imageUrl: 'https://picsum.photos/seed/marcus/600/800',
    distance: '5 miles away',
    location: 'Oakland',
    isVerified: false,
    isAi: true,
    relationshipGoal: 'marriage',
    personalityTraits: ['Analytical', 'Introvert', 'Realist'],
    dealBreakers: ['Drinking']
  },
  {
    id: 'ai_3',
    name: 'Sarah',
    age: 24,
    gender: 'woman',
    bio: 'Sustainable fashion designer. I believe in making the world better, one stitch at a time. Dog lover!',
    interests: ['Fashion', 'Sustainability', 'Dogs', 'Yoga'],
    imageUrl: 'https://picsum.photos/seed/sarah/600/800',
    distance: '1 mile away',
    location: 'San Francisco',
    isVerified: true,
    isAi: true,
    relationshipGoal: 'monogamous',
    personalityTraits: ['Optimist', 'Extrovert', 'Spontaneous'],
    dealBreakers: ['No Pets']
  }
];

export const MOCK_EVENTS: Event[] = [
  {
    id: 'e1',
    title: 'Neon Night Speed Dating',
    description: 'High energy 3-minute rounds with locals in a futuristic virtual lounge.',
    date: 'Oct 24, 2023',
    time: '8:00 PM',
    location: 'Virtual Spark Lounge',
    type: 'speed-dating',
    imageUrl: 'https://picsum.photos/seed/neon/800/400',
    attendees: 124,
    tags: ['Fast-paced', 'Virtual', 'Popular']
  },
  {
    id: 'e2',
    title: 'Sunset Rooftop Mixer',
    description: 'Meet local singles over artisanal cocktails and the best view of the city.',
    date: 'Oct 26, 2023',
    time: '6:30 PM',
    location: 'Skyline Terrace, SF',
    type: 'local',
    imageUrl: 'https://picsum.photos/seed/mixer/800/400',
    attendees: 45,
    tags: ['In-person', 'Cocktails', 'Views']
  }
];

export const INTEREST_OPTIONS = [
  'Art', 'Music', 'Hiking', 'Coffee', 'Travel', 'Coding', 'Jazz', 'Cooking',
  'Fashion', 'Sustainability', 'Dogs', 'Yoga', 'History', 'Reading', 'Wine',
  'Gaming', 'Photography', 'Fitness', 'Cinema', 'Tech', 'Cyber Security'
];
