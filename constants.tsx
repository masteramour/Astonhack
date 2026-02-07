
import React from 'react';
import { UserRole, UserProfile, Event, BlogPost } from './types';

export const OctopusLogo = ({ className = "w-10 h-10" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="currentColor">
    <path d="M50 10C35 10 23 22 23 37C23 46 27 53 34 59C32 63 26 65 20 65C14 65 10 70 10 75C10 80 14 85 20 85C26 85 32 80 34 75L36 71C38 75 42 78 47 79C43 83 40 88 40 93C40 98 44 102 49 102H51C56 102 60 98 60 93C60 88 57 83 53 79C58 78 62 75 64 71L66 75C68 80 74 85 80 85C86 85 90 80 90 75C90 70 86 65 80 65C74 65 68 63 66 59C73 53 77 46 77 37C77 22 65 10 50 10ZM40 35C43 35 45 37 45 40C45 43 43 45 40 45C37 45 35 43 35 40C35 37 37 35 40 35ZM60 35C63 35 65 37 65 40C65 43 63 45 60 45C57 45 55 43 55 40C55 37 57 35 60 35Z" />
  </svg>
);

export const MOCK_USERS: UserProfile[] = [
  {
    id: '1',
    name: 'Sarah Octopus',
    role: UserRole.MANAGER,
    email: 'sarah@8vents.com',
    avatar: 'https://picsum.photos/seed/sarah/200',
    location: { lat: 40.7128, lng: -74.0060 },
    skills: ['Event Planning', 'Logistics'],
    eventsHelped: 12,
    totalDonatedTime: 40,
    totalDonatedItems: 5,
    bio: 'Love organizing community events and helping people connect.'
  },
  {
    id: '2',
    name: 'James Tentacle',
    role: UserRole.VOLUNTEER,
    email: 'james@8vents.com',
    avatar: 'https://picsum.photos/seed/james/200',
    location: { lat: 40.7306, lng: -73.9352 },
    skills: ['Cooking', 'Heavy Lifting'],
    eventsHelped: 25,
    totalDonatedTime: 120,
    totalDonatedItems: 15,
    bio: 'Always ready to lend a tentacle for a good cause.'
  },
  {
    id: '3',
    name: 'Inky Wilson',
    role: UserRole.ADMIN,
    email: 'inky@8vents.com',
    avatar: 'https://picsum.photos/seed/inky/200',
    location: { lat: 40.7580, lng: -73.9855 },
    skills: ['System Admin', 'Security'],
    eventsHelped: 5,
    totalDonatedTime: 10,
    totalDonatedItems: 2,
    bio: 'Administrator for the 8vents platform.'
  },
  {
    id: '4',
    name: 'Bubbles McGee',
    role: UserRole.VOLUNTEER,
    email: 'bubbles@8vents.com',
    avatar: 'https://picsum.photos/seed/bubbles/200',
    location: { lat: 40.7061, lng: -73.9969 },
    skills: ['Music', 'Art'],
    eventsHelped: 8,
    totalDonatedTime: 30,
    totalDonatedItems: 8,
    bio: 'Bringing creativity to every event.'
  }
];

export const MOCK_EVENTS: Event[] = [
  {
    id: 'e1',
    title: 'Beach Cleanup Day',
    description: 'Help us clean up the local shoreline! We need volunteers to pick up trash and sort recyclables. Equipment will be provided.',
    managerId: '1',
    date: '2024-06-15',
    location: 'Ocean Park Beach',
    volunteersNeeded: 20,
    volunteersJoined: ['2', '4'],
    image: 'https://picsum.photos/seed/beach/800/400',
    tags: ['Environment', 'Outdoors']
  },
  {
    id: 'e2',
    title: 'Community Food Drive',
    description: 'Collecting and sorting non-perishable food items for local families in need. Sorting happens at the community center.',
    managerId: '1',
    date: '2024-07-02',
    location: 'Central Community Center',
    volunteersNeeded: 10,
    volunteersJoined: ['2'],
    image: 'https://picsum.photos/seed/food/800/400',
    tags: ['Charity', 'Social Service']
  },
  {
    id: 'e3',
    title: 'Winter Toy Workshop',
    description: 'Refurbishing and packaging toys for holiday donations. Great for makers and creators.',
    managerId: '1',
    date: '2024-12-10',
    location: 'East Side MakerSpace',
    volunteersNeeded: 15,
    volunteersJoined: ['4'],
    image: 'https://picsum.photos/seed/toy/800/400',
    tags: ['Holiday', 'Creative']
  }
];

export const MOCK_BLOGS: BlogPost[] = [
  {
    id: 'b1',
    title: 'How Volunteering Changed My Life',
    authorId: '2',
    content: 'Starting as a volunteer at 8vents was the best decision I ever made. I found my community and my purpose...',
    date: '2024-05-20',
    category: 'Success Story',
    image: 'https://picsum.photos/seed/blog1/600/300'
  },
  {
    id: 'b2',
    title: 'Top 10 Tips for Event Planning',
    authorId: '1',
    content: 'Managing an event can be stressful, but with the right tools like 8vents, it becomes a breeze. Here are my tips...',
    date: '2024-05-18',
    category: 'Guide',
    image: 'https://picsum.photos/seed/blog2/600/300'
  }
];
