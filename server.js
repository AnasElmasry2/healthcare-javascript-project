const { app } = require('./index');
const { db , createUsersTable} = require('./db');

const port = 3000;
const host = '127.0.0.1';

async function startServer() {
    try {
        await db.query(createUsersTable);
        console.log('Users table created successfully');

        app.listen(port, host, () => {
            console.log(`Server is running on port ${port}`);
        }); 
}
catch (error) {
        console.log('Error initializing db :');
        await db.end();
    }
}
startServer(); 



