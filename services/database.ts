import mysql from 'mysql2/promise';

// Database connection configuration
const DB_CONFIG = {
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'events_db',
};

// Singleton database connection
let connection: mysql.Connection | null = null;

/**
 * Get or create database connection
 */
export async function getDatabase(): Promise<mysql.Connection> {
  if (!connection) {
    connection = await mysql.createConnection(DB_CONFIG);
    console.log('Connected to MySQL database');
  }
  return connection;
}

/**
 * Close database connection
 */
export async function closeDatabase() {
  if (connection) {
    await connection.end();
    connection = null;
    console.log('MySQL database connection closed');
  }
}

/**
 * Seed database with initial data
 */
export async function seedDatabase() {
  const db = await getDatabase();

  try {
    // Clear existing data (for fresh seed)
    await db.execute('DELETE FROM AttendeeEventsResolver');
    await db.execute('DELETE FROM VolEventsResolver');
    await db.execute('DELETE FROM Leaderboard');
    await db.execute('DELETE FROM Events');
    await db.execute('DELETE FROM Attendee');
    await db.execute('DELETE FROM Volunteers');
    await db.execute('DELETE FROM EventManager');

    // Insert Event Managers
    await db.execute(
      'INSERT INTO EventManager (Name, MoneyRaised) VALUES (?, ?)',
      ['Sarah Octopus', 5000.00]
    );
    await db.execute(
      'INSERT INTO EventManager (Name, MoneyRaised) VALUES (?, ?)',
      ['Alex Manager', 3000.00]
    );

    // Insert Volunteers
    await db.execute(
      'INSERT INTO Volunteers (First_name, Last_name, Address, DOB, LanguagesSpoken, Radius) VALUES (?, ?, ?, ?, ?, ?)',
      ['James', 'Tentacle', '123 Ocean Ave, New York, NY', '1990-05-15', 'English, Spanish', 10]
    );
    await db.execute(
      'INSERT INTO Volunteers (First_name, Last_name, Address, DOB, LanguagesSpoken, Radius) VALUES (?, ?, ?, ?, ?, ?)',
      ['Bubbles', 'McGee', '456 Reef St, Brooklyn, NY', '1995-08-22', 'English, French', 15]
    );
    await db.execute(
      'INSERT INTO Volunteers (First_name, Last_name, Address, DOB, LanguagesSpoken, Radius) VALUES (?, ?, ?, ?, ?, ?)',
      ['Marina', 'Wave', '789 Coral Blvd, Queens, NY', '1988-03-10', 'English, Portuguese', 20]
    );

    // Insert Attendees
    await db.execute(
      'INSERT INTO Attendee (First_name, Last_name, Address, DOB, LanguagesSpoken, Radius) VALUES (?, ?, ?, ?, ?, ?)',
      ['John', 'Swimmer', '321 Beach Rd, Manhattan, NY', '1985-12-03', 'English', 5]
    );
    await db.execute(
      'INSERT INTO Attendee (First_name, Last_name, Address, DOB, LanguagesSpoken, Radius) VALUES (?, ?, ?, ?, ?, ?)',
      ['Emily', 'Diver', '654 Sea Lane, Bronx, NY', '1992-07-18', 'English, Italian', 10]
    );

    // Insert Events
    await db.execute(
      'INSERT INTO Events (Name, Manager_ID, Date, NumOfVolunteersneeded, Location) VALUES (?, ?, ?, ?, ?)',
      ['Beach Cleanup Day', 1, '2024-06-15', 20, 'Ocean Park Beach, NY']
    );
    await db.execute(
      'INSERT INTO Events (Name, Manager_ID, Date, NumOfVolunteersneeded, Location) VALUES (?, ?, ?, ?, ?)',
      ['Community Food Drive', 1, '2024-07-02', 10, 'Central Community Center, NY']
    );
    await db.execute(
      'INSERT INTO Events (Name, Manager_ID, Date, NumOfVolunteersneeded, Location) VALUES (?, ?, ?, ?, ?)',
      ['Winter Toy Workshop', 2, '2024-12-10', 15, 'East Side MakerSpace, NY']
    );

    // Insert Leaderboard entries for volunteers
    await db.execute(
      'INSERT INTO Leaderboard (Volunteer_ID, Points, MoneyRaised, TimeSpent, NumEventsVolunteered, TasksCompleted, PersonalDonations) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [1, 250, 500.00, 120.5, 25, 45, 200.00]
    );
    await db.execute(
      'INSERT INTO Leaderboard (Volunteer_ID, Points, MoneyRaised, TimeSpent, NumEventsVolunteered, TasksCompleted, PersonalDonations) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [2, 120, 300.00, 30.0, 8, 15, 100.00]
    );
    await db.execute(
      'INSERT INTO Leaderboard (Volunteer_ID, Points, MoneyRaised, TimeSpent, NumEventsVolunteered, TasksCompleted, PersonalDonations) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [3, 80, 150.00, 15.0, 5, 10, 50.00]
    );

    // Insert volunteer-event relationships
    await db.execute(
      'INSERT INTO VolEventsResolver (Volunteer_ID, Events_ID) VALUES (?, ?)',
      [1, 1]
    );
    await db.execute(
      'INSERT INTO VolEventsResolver (Volunteer_ID, Events_ID) VALUES (?, ?)',
      [1, 2]
    );
    await db.execute(
      'INSERT INTO VolEventsResolver (Volunteer_ID, Events_ID) VALUES (?, ?)',
      [2, 1]
    );
    await db.execute(
      'INSERT INTO VolEventsResolver (Volunteer_ID, Events_ID) VALUES (?, ?)',
      [2, 3]
    );

    // Insert attendee-event relationships
    await db.execute(
      'INSERT INTO AttendeeEventsResolver (Attendee_ID, Events_ID) VALUES (?, ?)',
      [1, 1]
    );
    await db.execute(
      'INSERT INTO AttendeeEventsResolver (Attendee_ID, Events_ID) VALUES (?, ?)',
      [2, 2]
    );

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

export default { getDatabase, closeDatabase, seedDatabase };
