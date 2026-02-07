import dbOps from './dbOperations'; // Corrected dbOps import
import type { DBVolunteer, DBEvent } from '../types'; // Added missing type imports
/**
 * API-like functions that bridge the frontend and database
 */

// ==================== VOLUNTEERS API ====================

export async function fetchAllVolunteers() {
  try {
    return await dbOps.getAllVolunteers();
  } catch (error) {
    console.error('Error fetching volunteers:', error);
    return [];
  }
}

export async function fetchVolunteerById(id: number) {
  try {
    return await dbOps.getVolunteerWithStats(id);
  } catch (error) {
    console.error('Error fetching volunteer:', error);
    return null;
  }
}

export async function addVolunteer(data: {
  firstName: string;
  lastName: string;
  address?: string;
  dob?: string;
  languagesSpoken?: string;
  radius?: number;
}) {
  try {
    const id = await dbOps.createVolunteer(
      data.firstName,
      data.lastName,
      data.address || null,
      data.dob || null,
      data.languagesSpoken || null,
      data.radius || null
    );

    // Also create empty leaderboard entry
    await dbOps.upsertLeaderboard(id, {
      Points: 0,
      MoneyRaised: 0,
      TimeSpent: 0,
      NumEventsVolunteered: 0,
      TasksCompleted: 0,
      PersonalDonations: 0,
    });
    return id;
  } catch (error) {
    console.error('Error adding volunteer:', error);
    throw error; // Propagate the error after logging
  }
}

export async function modifyVolunteer(
  id: number,
  data: Partial<{
    firstName: string;
    lastName: string;
    address: string;
    dob: string;
    languagesSpoken: string;
    radius: number;
  }>
) {
  try {
    const dbData: Partial<Omit<DBVolunteer, 'Volunteer_ID'>> = {
      First_Name: data.firstName,
      Last_Name: data.lastName,
      Address: data.address,
      DOB: data.dob,
      LanguagesSpoken: data.languagesSpoken,
      Radius: data.radius,
    };

    return await dbOps.updateVolunteer(id, dbData);
  } catch (error) {
    console.error('Error updating volunteer:', error);
    throw error;
  }
}

export async function removeVolunteer(id: number) {
  try {
    return await dbOps.deleteVolunteer(id);
  } catch (error) {
    console.error('Error deleting volunteer:', error);
    throw error;
  }
}

// ==================== EVENTS API ====================

export async function fetchAllEvents() {
  try {
    return await dbOps.getAllEvents();
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
}

export async function fetchEventById(id: number) {
  try {
    return await dbOps.getEventById(id);
  } catch (error) {
    console.error('Error fetching event:', error);
    return null;
  }
}

export async function fetchUpcomingEvents() {
  try {
    const events = await dbOps.getAllEvents();
    const today = new Date().toISOString().split('T')[0];
    return events.filter(e => e.Date >= today).sort((a, b) => 
      new Date(a.Date).getTime() - new Date(b.Date).getTime()
    );
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    return [];
  }
}

export async function addEvent(data: {
  name: string;
  date: string;
  location: string;
  volunteersNeeded: number;
  managerId?: number;
}) {
  if (!data.name || data.name.trim() === '') {
    throw new Error('Event name is required.');
  }
  if (!data.date || isNaN(new Date(data.date).getTime())) {
    throw new Error('Valid event date is required.');
  }
  if (!data.location || data.location.trim() === '') {
    throw new Error('Event location is required.');
  }
  if (data.volunteersNeeded <= 0) {
    throw new Error('Number of volunteers needed must be a positive number.');
  }
  try {
    return await dbOps.createEvent(
      data.name,
      data.date,
      data.location,
      data.volunteersNeeded,
      data.managerId
    );
  } catch (error) {
    console.error('Error adding event:', error);
    throw error; // Propagate the error after logging
  }
}

export async function modifyEvent(id: number, data: Partial<{
  name: string;
  managerId: number;
  date: string;
  volunteersNeeded: number;
  location: string;
}>) {
  try {
    const dbData: Partial<Omit<DBEvent, 'Events_ID'>> = {
      Name: data.name,
      Manager_ID: data.managerId,
      Date: data.date,
      NumOfVolunteersneeded: data.volunteersNeeded,
      Location: data.location,
    };

    return await dbOps.updateEvent(id, dbData);
  } catch (error) {
    console.error('Error updating event:', error);
    throw error;
  }
}

export async function removeEvent(id: number) {
  try {
    return await dbOps.deleteEvent(id);
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
}

// ==================== EVENT MANAGERS API ====================

export async function fetchAllEventManagers() {
  try {
    return await dbOps.getAllEventManagers();
  } catch (error) {
    console.error('Error fetching event managers:', error);
    return [];
  }
}

export async function fetchEventManagerById(id: number) {
  try {
    return await dbOps.getEventManagerById(id);
  } catch (error) {
    console.error('Error fetching event manager:', error);
    return null;
  }
}

export async function addEventManager(name: string, moneyRaised: number = 0) {
  try {
    return await dbOps.createEventManager(name, moneyRaised);
  } catch (error) {
    console.error('Error adding event manager:', error);
    return null;
  }
}

// ==================== ATTENDEES API ====================

export async function fetchAllAttendees() {
  try {
    return await dbOps.getAllAttendees();
  } catch (error) {
    console.error('Error fetching attendees:', error);
    return [];
  }
}

export async function fetchAttendeeById(id: number) {
  try {
    return await dbOps.getAttendeeById(id);
  } catch (error) {
    console.error('Error fetching attendee:', error);
    return null;
  }
}

export async function addAttendee(data: {
  firstName: string;
  lastName: string;
  address?: string;
  dob?: string;
  languagesSpoken?: string;
  radius?: number;
}) {
  if (!data.firstName || data.firstName.trim() === '') {
    throw new Error('First name is required.');
  }
  if (!data.lastName || data.lastName.trim() === '') {
    throw new Error('Last name is required.');
  }
  try {
    return await dbOps.createAttendee(
      data.firstName,
      data.lastName,
      data.address,
      data.dob,
      data.languagesSpoken,
      data.radius
    );
  } catch (error) {
    console.error('Error adding attendee:', error);
    throw error; // Propagate the error after logging
  }
}

// ==================== LEADERBOARD API ====================

export async function fetchLeaderboard() {
  try {
    const leaderboards = await dbOps.getAllLeaderboards();
    // Enrich with volunteer data
    const enriched = await Promise.all(
      leaderboards.map(async (lb) => {
        const volunteer = await dbOps.getVolunteerById(lb.Volunteer_ID);
        return { ...lb, volunteer };
      })
    );
    return enriched;
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }
}

export async function updateVolunteerStats(
  volunteerId: number,
  stats: Partial<{
    points: number;
    moneyRaised: number;
    timeSpent: number;
    numEventsVolunteered: number;
    tasksCompleted: number;
    personalDonations: number;
  }>
) {
  try {
    const leaderboardData = {
      Points: stats.points || 0,
      MoneyRaised: stats.moneyRaised || 0,
      TimeSpent: stats.timeSpent || 0,
      NumEventsVolunteered: stats.numEventsVolunteered || 0,
      TasksCompleted: stats.tasksCompleted || 0,
      PersonalDonations: stats.personalDonations || 0
    };
    await dbOps.upsertLeaderboard(volunteerId, leaderboardData);
    return true;
  } catch (error) {
    console.error('Error updating volunteer stats:', error);
    throw error;
  }
}

// ==================== VOLUNTEER-EVENT ASSIGNMENTS ====================

export async function registerVolunteerForEvent(volunteerId: number, eventId: number) {
  try {
    const success = await dbOps.addVolunteerToEvent(volunteerId, eventId);
    if (success) {
      // Update leaderboard stats
      const current = await dbOps.getLeaderboardByVolunteerId(volunteerId);
      if (current) {
        current.Points += 10;
        current.NumEventsVolunteered += 1;
        await dbOps.upsertLeaderboard(volunteerId, current);
      }
    }
    return success;
  } catch (error) {
    console.error('Error registering volunteer for event:', error);
    throw error;
  }
}

export async function unregisterVolunteerFromEvent(volunteerId: number, eventId: number) {
  try {
    return await dbOps.removeVolunteerFromEvent(volunteerId, eventId);
  } catch (error) {
    console.error('Error unregistering volunteer from event:', error);
    throw error;
  }
}

export async function fetchVolunteersForEvent(eventId: number) {
  try {
    return dbOps.getVolunteersByEvent(eventId);
  } catch (error) {
    console.error('Error fetching volunteers for event:', error);
    return [];
  }
}

export async function fetchEventsForVolunteer(volunteerId: number) {
  try {
    return dbOps.getEventsByVolunteer(volunteerId);
  } catch (error) {
    console.error('Error fetching events for volunteer:', error);
    return [];
  }
}

// ==================== ATTENDEE-EVENT ASSIGNMENTS ====================

export async function registerAttendeeForEvent(attendeeId: number, eventId: number) {
  try {
    return dbOps.addAttendeeToEvent(attendeeId, eventId);
  } catch (error) {
    console.error('Error registering attendee for event:', error);
    throw error;
  }
}

export async function unregisterAttendeeFromEvent(attendeeId: number, eventId: number) {
  try {
    return dbOps.removeAttendeeFromEvent(attendeeId, eventId);
  } catch (error) {
    console.error('Error unregistering attendee from event:', error);
    throw error;
  }
}

export async function fetchAttendeesForEvent(eventId: number) {
  try {
    return dbOps.getAttendeesByEvent(eventId);
  } catch (error) {
    console.error('Error fetching attendees for event:', error);
    return [];
  }
}

export async function fetchEventsForAttendee(attendeeId: number) {
  try {
    return dbOps.getEventsByAttendee(attendeeId);
  } catch (error) {
    console.error('Error fetching events for attendee:', error);
    return [];
  }
}
