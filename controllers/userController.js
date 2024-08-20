import bcrypt from 'bcrypt';
import connectToDatabase from '../config/db.js';

import { handleResponse } from '../utils/responseHandler.js'; // Import the response handler
import sql from 'mssql/msnodesqlv8.js'; // Ensure correct import for sql

// Create a new User
export const createUser = async (req, res) => {
    const { fname, lname, email, mobile, password, status, group_id } = req.body;

    try {
        const code = password;
        // Hash the password before saving it
        const hashedPassword = await bcrypt.hash(password, 10);

        const pool = await connectToDatabase(); // Use the function to get the connection pool
        const result = await pool.request()
            .input('fname', sql.NVarChar, fname.trim())
            .input('lname', sql.NVarChar, lname.trim())
            .input('email', sql.NVarChar, email.trim())
            .input('mobile', sql.NVarChar, mobile.trim())
            .input('group_id', sql.Int, group_id)
            .input('code', sql.NVarChar, code)
            .input('password', sql.NVarChar, hashedPassword)
            .query(`
        INSERT INTO users (fname,lname, email, mobile, group_id, password, code)
        VALUES (@fname,@lname, @email, @mobile, @group_id, @password, @code);

        SELECT id, fname,lname, email, mobile, group_id, status
        FROM users
        WHERE id = SCOPE_IDENTITY();
    `);

        // Extract the inserted user record
        const savedUser = result.recordset[0];

        // Fetch group details based on group_id
        const groupResult = await pool.request()
            .input('group_id', sql.NVarChar, savedUser.group_id)
            .query('SELECT name FROM groups WHERE id = @group_id');

        // Extract the group record
        const group = groupResult.recordset[0]?.name || null;

        // Prepare the response with separate 'group' key
        const savedUserWithGroup = {
            id: savedUser.id,
            name: savedUser.name,
            email: savedUser.email,
            mobile: savedUser.mobile,
            status: savedUser.status.trim(),
            group: group // Group name added separately
        };

        handleResponse(res, 201, { user: savedUserWithGroup });

    } catch (error) {
        handleResponse(res, 400, error.message, false);
    }
};
/**************************************************************************/

// Get all units
export const getAllUsers = async (req, res) => {
    try {
        const pool = await connectToDatabase(); // Use the function to get the connection pool

        // Query to get all users along with their group details
        const result = await pool.request().query(`
            SELECT 
                u.id, 
                LTRIM(RTRIM(u.fname)) AS firstname, 
                LTRIM(RTRIM(u.lname)) AS lastname, 
                LTRIM(RTRIM(u.email)) AS email, 
                LTRIM(RTRIM(u.mobile)) AS mobile, 
                u.group_id, 
                LTRIM(RTRIM(u.status)) AS status, 
                LTRIM(RTRIM(g.name)) AS group_name
            FROM users u
            LEFT JOIN groups g ON u.group_id = g.id
        `);

        // Handle response with the combined user and group data
        handleResponse(res, 200, result.recordset);
    } catch (error) {
        handleResponse(res, 400, error.message, false);
    }
};
/**************************************************************************/

// Get a single unit by ID
export const getUserById = async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await connectToDatabase(); // Use the function to get the connection pool
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT * FROM units WHERE id = @id');
        if (result.recordset.length === 0) {
            return handleResponse(res, 404, 'Unit not found', false);
        }
        handleResponse(res, 200, result.recordset[0]);
    } catch (error) {
        handleResponse(res, 400, error.message, false);
    }
};
/**************************************************************************/
// Update a unit by ID
export const updateUserById = async (req, res) => {
    const { id } = req.params;
    const { fname, lname, email, mobile, password, status, group_id } = req.body;
    
    try {
        const pool = await connectToDatabase(); // Use the function to get the connection pool

        // Trim and prepare values
        const trimmedfName = fname ? fname.trim() : null;
        const trimmedlName = lname ? lname.trim() : null;
        const trimmedEmail = email ? email.trim() : null;
        const trimmedMobile = mobile ? mobile.trim() : null;
        const trimmedStatus = status ? status.trim() : null;
        const trimmedGroupId = group_id ? group_id : null;

        // Hash the password if provided
        let hashedPassword = null;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            hashedPassword = await bcrypt.hash(password, salt);
        }

        // Update query
        let query = `UPDATE users SET name = @name, email = @email, mobile = @mobile, status = @status, group_id = @group_id`;
        if (hashedPassword) {
            query += `, password = @password`;
        }
        query += ` WHERE id = @id`;

        const request = pool.request()
            .input('id', sql.Int, id)
            .input('fname', sql.NVarChar, trimmedfName)
            .input('lname', sql.NVarChar, trimmedlName)
            .input('email', sql.NVarChar, trimmedEmail)
            .input('mobile', sql.NVarChar, trimmedMobile)
            .input('status', sql.NVarChar, trimmedStatus)
            .input('group_id', sql.Int, trimmedGroupId);

        if (hashedPassword) {
            request.input('password', sql.NVarChar, hashedPassword);
        }

        const result = await request.query(query);

        if (result.rowsAffected[0] === 0) {
            return handleResponse(res, 404, 'User not found', false);
        }
        handleResponse(res, 200, { id, fname: trimmedfName, lname: trimmedlName, email: trimmedEmail, mobile: trimmedMobile, status: trimmedStatus, group_id: trimmedGroupId });
    } catch (error) {
        handleResponse(res, 400, error.message, false);
    }
};
/**************************************************************************/
// Delete a unit by ID
export const deleteUserById = async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await connectToDatabase(); // Use the function to get the connection pool
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM units WHERE id = @id');
        if (result.rowsAffected[0] === 0) {
            return handleResponse(res, 404, 'Unit not found', false);
        }
        handleResponse(res, 200, {});
    } catch (error) {
        handleResponse(res, 400, error.message, false);
    }
};
