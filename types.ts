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
  phone?: string;
  avatar: string;
  location: {
    lat: number;
    lng: number;
  };
  interests?: string[];
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

export interface DBVolunteer {
  Volunteer_ID: number;
  First_Name: string;
  Last_Name: string;
  Address?: string;
  DOB?: string;
  LanguagesSpoken?: string;
  Radius?: number;
}

export interface DBEventManager {
  Manager_ID: number;
  Name: string;
  Email: string;
}

export interface DBAttendee {
  Attendee_ID: number;
  Name: string;
  Email: string;
}

export interface DBEvent {
  Event_ID: number;
  Title: string;
  Description: string;
  Manager_ID: number;
  Date: string;
  Location: string;
  VolunteersNeeded: number;
}

export interface DBLeaderboard {
  Volunteer_ID: number;
  Points: number;
  MoneyRaised: number;
  TimeSpent: number;
  NumEventsVolunteered: number;
}

export interface DBVolEventResolver {
  Volunteer_ID: number;
  Event_ID: number;
}

export interface DBAttendeeEventResolver {
  Attendee_ID: number;
  Event_ID: number;
}
