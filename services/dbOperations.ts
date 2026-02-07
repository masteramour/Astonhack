import { getDatabase } from './database';
import * as qb from './queryBuilder';
import type {
  DBVolunteer,
  DBEventManager,
  DBAttendee,
  DBEvent,
  DBLeaderboard,
  DBVolEventResolver,
  DBAttendeeEventResolver
} from '../types';

// ==================== VOLUNTEER OPERATIONS ====================

export async function createVolunteer(
  firstName: string,
  lastName: string,
  address?: string,
  dob?: string,
  languagesSpoken?: string,
  radius?: number
): Promise<number> {
  const db = await getDbConnection();
  return qb.insert(db, 'Volunteers',
    ['First_Name', 'Last_Name', 'Address', 'DOB', 'LanguagesSpoken', 'Radius'],
    [firstName, lastName, address || null, dob || null, languagesSpoken || null, radius || null]
  );
}

export async function getVolunteerById(id: number): Promise<DBVolunteer | undefined> {
  const db = await getDbConnection();
  return qb.selectById<DBVolunteer>(db, 'Volunteers', 'Volunteer_ID', id);
}

export async function getAllVolunteers(): Promise<DBVolunteer[]> {
  const db = await getDbConnection();
  return qb.selectAll<DBVolunteer>(db, 'Volunteers');
}

export async function updateVolunteer(
  id: number,
  updates: Partial<Omit<DBVolunteer, 'Volunteer_ID'>>
): Promise<boolean> {
  const db = await getDbConnection();
  return qb.update(db, 'Volunteers', 'Volunteer_ID', id, updates);
}

export async function deleteVolunteer(id: number): Promise<boolean> {
  const db = await getDbConnection();
  return qb.deleteById(db, 'Volunteers', 'Volunteer_ID', id);
}

// ==================== EVENT MANAGER OPERATIONS ====================

export async function createEventManager(name: string, moneyRaised: number = 0): Promise<number> {
  const db = await getDbConnection();
  return qb.insert(db, 'EventManager', ['Name', 'MoneyRaised'], [name, moneyRaised]);
}

export async function getEventManagerById(id: number): Promise<DBEventManager | undefined> {
  const db = await getDbConnection();
  return qb.selectById<DBEventManager>(db, 'EventManager', 'Manager_ID', id);
}

export async function getAllEventManagers(): Promise<DBEventManager[]> {
  const db = await getDbConnection();
  return qb.selectAll<DBEventManager>(db, 'EventManager');
}

export async function updateEventManager(
  id: number,
  updates: Partial<Omit<DBEventManager, 'Manager_ID'>>
): Promise<boolean> {
  const db = await getDbConnection();
  return qb.update(db, 'EventManager', 'Manager_ID', id, updates);
}

export async function deleteEventManager(id: number): Promise<boolean> {
  const db = await getDbConnection();
  return qb.deleteById(db, 'EventManager', 'Manager_ID', id);
}

// ==================== ATTENDEE OPERATIONS ====================

export async function createAttendee(
  firstName: string,
  lastName: string,
  address?: string,
  dob?: string,
  languagesSpoken?: string,
  radius?: number
): Promise<number> {
  const db = await getDbConnection();
  return qb.insert(db, 'Attendee',
    ['First_Name', 'Last_Name', 'Address', 'DOB', 'LanguagesSpoken', 'Radius'],
    [firstName, lastName, address || null, dob || null, languagesSpoken || null, radius || null]
  );
}

export async function getAttendeeById(id: number): Promise<DBAttendee | undefined> {
  const db = await getDbConnection();
  return qb.selectById<DBAttendee>(db, 'Attendee', 'Attendee_ID', id);
}

export async function getAllAttendees(): Promise<DBAttendee[]> {
  const db = await getDbConnection();
  return qb.selectAll<DBAttendee>(db, 'Attendee');
}

export async function updateAttendee(
  id: number,
  updates: Partial<Omit<DBAttendee, 'Attendee_ID'>>
): Promise<boolean> {
  const db = await getDbConnection();
  return qb.update(db, 'Attendee', 'Attendee_ID', id, updates);
}

export async function deleteAttendee(id: number): Promise<boolean> {
  const db = await getDbConnection();
  return qb.deleteById(db, 'Attendee', 'Attendee_ID', id);
}

// ==================== EVENT OPERATIONS ====================

export async function createEvent(
  name: string,
  date: string,
  location: string,
  volunteersNeeded: number,
  managerId?: number
): Promise<number> {
  const db = await getDbConnection();
  return qb.insert(db, 'Events',
    ['Name', 'Manager_ID', 'Date', 'NumOfVolunteersneeded', 'Location'],
    [name, managerId || null, date, volunteersNeeded, location]
  );
}

export async function getEventById(id: number): Promise<DBEvent | undefined> {
  const db = await getDbConnection();
  return qb.selectById<DBEvent>(db, 'Events', 'Events_ID', id);
}

export async function getAllEvents(): Promise<DBEvent[]> {
  const db = await getDbConnection();
  return qb.selectAll<DBEvent>(db, 'Events', 'Date DESC');
}

export async function updateEvent(
  id: number,
  updates: Partial<Omit<DBEvent, 'Events_ID'>>
): Promise<boolean> {
  const db = await getDbConnection();
  return qb.update(db, 'Events', 'Events_ID', id, updates);
}

export async function deleteEvent(id: number): Promise<boolean> {
  const db = await getDbConnection();
  return qb.deleteById(db, 'Events', 'Events_ID', id);
}

// ==================== LEADERBOARD OPERATIONS ====================

export async function upsertLeaderboard(
  volunteerId: number,
  updates: Partial<Omit<DBLeaderboard, 'Volunteer_ID'>>
): Promise<number> {
  const db = await getDbConnection();
  const existing = await qb.selectById<DBLeaderboard>(db, 'Leaderboard', 'Volunteer_ID', volunteerId);

  if (existing) {
    await qb.update(db, 'Leaderboard', 'Volunteer_ID', volunteerId, updates);
    return volunteerId;
  }

  return qb.insert(db, 'Leaderboard',
    ['Volunteer_ID', ...Object.keys(updates)],
    [volunteerId, ...Object.values(updates)]
  );
}

// Replace unresolved 'db' references in leaderboard-related functions
export async function getLeaderboardByVolunteerId(volunteerId: number): Promise<DBLeaderboard | undefined> {
  const db = await getDbConnection();
  return qb.selectById<DBLeaderboard>(db, 'Leaderboard', 'Volunteer_ID', volunteerId);
}

export async function getAllLeaderboards(): Promise<DBLeaderboard[]> {
  const db = await getDbConnection();
  return qb.selectAll<DBLeaderboard>(db, 'Leaderboard', 'Points DESC');
}

export async function updateLeaderboardPoints(volunteerId: number, additionalPoints: number): Promise<boolean> {
  const db = await getDbConnection();
  const current = await qb.selectById<DBLeaderboard>(db, 'Leaderboard', 'Volunteer_ID', volunteerId);
  if (!current) return false;

  return qb.update(db, 'Leaderboard', 'Volunteer_ID', volunteerId, {
    Points: current.Points + additionalPoints
  });
}

export async function deleteLeaderboard(volunteerId: number): Promise<boolean> {
  const db = await getDbConnection();
  return qb.deleteById(db, 'Leaderboard', 'Volunteer_ID', volunteerId);
}

// ==================== RESOLVER OPERATIONS ====================

export async function addVolunteerToEvent(volunteerId: number, eventId: number): Promise<boolean> {
  const db = await getDbConnection();
  const [result] = await db.execute(
    'INSERT IGNORE INTO VolEventsResolver (Volunteer_ID, Events_ID) VALUES (?, ?)',
    [volunteerId, eventId]
  ) as any;
  return result.affectedRows >= 0; // Returns true if inserted or already existed
}

export async function removeVolunteerFromEvent(volunteerId: number, eventId: number): Promise<boolean> {
  const db = await getDbConnection();
  const [result] = await db.execute(
    'DELETE FROM VolEventsResolver WHERE Volunteer_ID = ? AND Events_ID = ?',
    [volunteerId, eventId]
  );
  return (result as any).affectedRows > 0;
}

export async function addAttendeeToEvent(attendeeId: number, eventId: number): Promise<boolean> {
  const db = await getDbConnection();
  const [result] = await db.execute(
    'INSERT IGNORE INTO AttendeeEventsResolver (Attendee_ID, Events_ID) VALUES (?, ?)',
    [attendeeId, eventId]
  ) as any;
  return result.affectedRows >= 0; // Returns true if inserted or already existed
}

export async function removeAttendeeFromEvent(attendeeId: number, eventId: number): Promise<boolean> {
  const db = await getDbConnection();
  const [result] = await db.execute(
    'DELETE FROM AttendeeEventsResolver WHERE Attendee_ID = ? AND Events_ID = ?',
    [attendeeId, eventId]
  );
  return (result as any).affectedRows > 0;
}

/**
 * Get volunteer with stats (used by api.ts)
 */
export async function getVolunteerWithStats(id: number): Promise<DBVolunteer | null> {
  return (await getVolunteerById(id)) || null;
}

/**
 * Get all volunteers for a specific event
 */
export async function getVolunteersByEvent(eventId: number): Promise<DBVolunteer[]> {
  const db = await getDbConnection();
  const query = `
    SELECT v.* FROM Volunteers v
    INNER JOIN VolEventsResolver ve ON v.Volunteer_ID = ve.Volunteer_ID
    WHERE ve.Events_ID = ?
  `;
  const [rows] = await db.execute(query, [eventId]) as any;
  return rows || [];
}

/**
 * Get all events for a specific volunteer
 */
export async function getEventsByVolunteer(volunteerId: number): Promise<DBEvent[]> {
  const db = await getDbConnection();
  const query = `
    SELECT e.* FROM Events e
    INNER JOIN VolEventsResolver ve ON e.Events_ID = ve.Events_ID
    WHERE ve.Volunteer_ID = ?
  `;
  const [rows] = await db.execute(query, [volunteerId]) as any;
  return rows || [];
}

/**
 * Get all attendees for a specific event
 */
export async function getAttendeesByEvent(eventId: number): Promise<DBAttendee[]> {
  const db = await getDbConnection();
  const query = `
    SELECT a.* FROM Attendee a
    INNER JOIN AttendeeEventsResolver ae ON a.Attendee_ID = ae.Attendee_ID
    WHERE ae.Events_ID = ?
  `;
  const [rows] = await db.execute(query, [eventId]) as any;
  return rows || [];
}

/**
 * Get all events for a specific attendee
 */
export async function getEventsByAttendee(attendeeId: number): Promise<DBEvent[]> {
  const db = await getDbConnection();
  const query = `
    SELECT e.* FROM Events e
    INNER JOIN AttendeeEventsResolver ae ON e.Events_ID = ae.Events_ID
    WHERE ae.Attendee_ID = ?
  `;
  const [rows] = await db.execute(query, [attendeeId]) as any;
  return rows || [];
}

// Add a helper function to get the database connection
async function getDbConnection() {
  return await getDatabase();
}

export default {
  createVolunteer,
  getVolunteerById,
  getAllVolunteers,
  updateVolunteer,
  deleteVolunteer,
  createEventManager,
  getEventManagerById,
  getAllEventManagers,
  updateEventManager,
  deleteEventManager,
  createAttendee,
  getAttendeeById,
  getAllAttendees,
  updateAttendee,
  deleteAttendee,
  createEvent,
  getEventById,
  getAllEvents,
  updateEvent,
  deleteEvent,
  upsertLeaderboard,
  getLeaderboardByVolunteerId,
  getAllLeaderboards,
  updateLeaderboardPoints,
  deleteLeaderboard,
  addVolunteerToEvent,
  removeVolunteerFromEvent,
  addAttendeeToEvent,
  removeAttendeeFromEvent,
  getVolunteerWithStats,
  getVolunteersByEvent,
  getEventsByVolunteer,
  getAttendeesByEvent,
  getEventsByAttendee
};
