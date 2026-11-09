
const {db}=require("../db")

const RetrievAllUsers = async (req, res) => {
    try { 

const query = 'SELECT * FROM users';
const [rows] = await db.query(query);
return res.status(200).json({ status: 'success', data: rows });

    }
    catch (error) {
        console.error('Error retrieving users:', error);
        return res.status(500).json({ status: 'error', message: 'Internal server error' });
    }

}


const getEmployeesandmanagers  = async (req, res) => {
    try { 
const query = 'SELECT e.ID , e.username from users as e LEFT JOIN users as m ON e.Manager_ID = m.ID';
const [rows] = await db.query(query);
return res.status(200).json({ status: 'success', data: rows });
    }
    catch (error) { 
        console.error('Error retrieving employees and managers:', error);
        return res.status(500).json({ status: 'error', message: 'Internal server error' });
    }

}

module.exports = { RetrievAllUsers , getEmployeesandmanagers }  

