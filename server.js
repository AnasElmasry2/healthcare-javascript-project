const { app } = require('./index.js');

const {
  db,
  createUsersTable,
  createClinicsTable,
  createSpecialtiesTable,
  createDoctorsTable,
  createDoctorClinicsTable,
  createSchedulesTable,
  createAppointmentsTable,
  createRatingsTable,
  createRemindersTable,
  createDoctorDayLocksTable,
  createAuthenticationLogsTable,
  createReminderSettingsTable
} = require('./db.js');

const PORT = process.env.PORT || 3000;
const HOSTNAME = process.env.HOSTNAME || 'localhost';

async function startServer() {
  try {
    await db.query(createUsersTable);
    await db.query(createClinicsTable);
    await db.query(createSpecialtiesTable);
    await db.query(createDoctorsTable);
    await db.query(createDoctorClinicsTable);
    await db.query(createSchedulesTable);
    await db.query(createAppointmentsTable);
    await db.query(createRatingsTable);
    await db.query(createRemindersTable);
    await db.query(createDoctorDayLocksTable);
    await db.query(createAuthenticationLogsTable);
    await db.query(createReminderSettingsTable);

    console.log('All database tables are ready');

    app.listen(PORT, HOSTNAME, () => {
      console.log(`Server running at http://${HOSTNAME}:${PORT}`);
    });

  } catch (error) {
    console.error('Database initialization failed:', error.message);
    process.exit(1);
  }
}

startServer();




