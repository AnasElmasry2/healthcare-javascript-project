const { app } = require('./index.js');
const { db, createUsersTable } = require('./db.js');

const PORT = process.env.PORT || 3000;
const HOSTNAME = process.env.HOSTNAME || 'localhost';

async function startServer() {
  try {
    await db.query(createUsersTable);

    console.log('Users table is ready');

    app.listen(PORT, HOSTNAME, () => {
      console.log(`Server running at http://${HOSTNAME}:${PORT}`);
    });
  } catch (error) {
    console.error('Database initialization failed:', error.message);
    process.exit(1);
  }
}

startServer();



