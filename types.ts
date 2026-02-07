
export enum UserRole {
  ADMIN = 'Admin',
  MANAGER = 'Event Manager',
  VOLUNTEER = 'Volunteer'
}

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  avatar: string;
  location: {
    lat: number;
    lng: number;
  };
  skills: string[];
  eventsHelped: number;
  totalDonatedTime: number; // hours
  totalDonatedItems: number; // count
  bio: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  managerId: string;
  date: string;
  location: string;
  volunteersNeeded: number;
  volunteersJoined: string[]; // user IDs
  image: string;
  tags: string[];
}

export interface Donation {
  id: string;
  userId: string;
  type: 'time' | 'item';
  category: string; // 'food', 'toys', 'clothes', or task name
  amount: number;
  date: string;
}

export interface BlogPost {
  id: string;
  title: string;
  authorId: string;
  content: string;
  date: string;
  category: string;
  image: string;
}
