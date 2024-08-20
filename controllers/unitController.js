import connectToDatabase from '../config/db.js';
import { handleResponse } from '../utils/responseHandler.js'; // Import the response handler
import sql from 'mssql/msnodesqlv8.js'; // Ensure correct import for sql

// Create a new Unit
export const createUnit = async (req, res) => {
    const { name } = req.body;
    try {
        const pool = await connectToDatabase(); // Use the function to get the connection pool
        const result = await pool.request()
            .input('name', sql.NVarChar, name)
            .query('INSERT INTO units (name) VALUES (@name); SELECT SCOPE_IDENTITY() AS id');
        handleResponse(res, 201, { id: result.recordset[0].id, name });

    } catch (error) {
        handleResponse(res, 400, error.message, false);
    }
};

// Get all units
export const getAllUnits = async (req, res) => {
    try {
        const pool = await connectToDatabase(); // Use the function to get the connection pool
        const result = await pool.request().query('SELECT * FROM units');
        handleResponse(res, 200, result.recordset);
    } catch (error) {
        handleResponse(res, 400, error.message, false);
    }
};

// Get a single unit by ID
export const getUnitById = async (req, res) => {
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

// Update a unit by ID
export const updateUnitById = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    try {
        const pool = await connectToDatabase(); // Use the function to get the connection pool
        const result = await pool.request()
            .input('id', sql.Int, id)
            .input('name', sql.NVarChar, name)
            .query('UPDATE units SET name = @name WHERE id = @id');
        if (result.rowsAffected[0] === 0) {
            return handleResponse(res, 404, 'Unit not found', false);
        }
        handleResponse(res, 200, { id, name });
    } catch (error) {
        handleResponse(res, 400, error.message, false);
    }
};

// Delete a unit by ID
export const deleteUnitById = async (req, res) => {
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
