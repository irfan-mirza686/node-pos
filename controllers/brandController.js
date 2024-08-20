import connectToDatabase from '../config/db.js';
import { handleResponse } from '../utils/responseHandler.js'; // Import the response handler
import sql from 'mssql';

// Create a new brand
export const createBrand = async (req, res) => {
    const { name } = req.body;
    try {
        const pool = await connectToDatabase(); // Use the function to get the connection pool
        const result = await pool.request()
            .input('name', sql.NVarChar, name)
            .query('INSERT INTO brands (name) VALUES (@name); SELECT SCOPE_IDENTITY() AS id');
        handleResponse(res, 201, { id: result.recordset[0].id, name });

    } catch (error) {
        handleResponse(res, 400, error.message, false);
    }
};

// Get all brands
export const getAllBrands = async (req, res) => {
    try {
        const pool = await connectToDatabase(); // Use the function to get the connection pool
        const result = await pool.request().query('SELECT * FROM brands');
        handleResponse(res, 200, result.recordset);
    } catch (error) {
        handleResponse(res, 400, error.message, false);
    }
};

// Get a single brand by ID
export const getBrandById = async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await connectToDatabase(); // Use the function to get the connection pool
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT * FROM brands WHERE id = @id');
        if (result.recordset.length === 0) {
            return handleResponse(res, 404, 'Brand not found', false);
        }
        handleResponse(res, 200, result.recordset[0]);
    } catch (error) {
        handleResponse(res, 400, error.message, false);
    }
};

// Update a brand by ID
export const updateBrandById = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    try {
        const pool = await connectToDatabase(); // Use the function to get the connection pool
        const result = await pool.request()
            .input('id', sql.Int, id)
            .input('name', sql.NVarChar, name)
            .query('UPDATE brands SET name = @name WHERE id = @id');
        if (result.rowsAffected[0] === 0) {
            return handleResponse(res, 404, 'Brand not found', false);
        }
        handleResponse(res, 200, { id, name });
    } catch (error) {
        handleResponse(res, 400, error.message, false);
    }
};

// Delete a brand by ID
export const deleteBrandById = async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await connectToDatabase(); // Use the function to get the connection pool
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM brands WHERE id = @id');
        if (result.rowsAffected[0] === 0) {
            return handleResponse(res, 404, 'Brand not found', false);
        }
        handleResponse(res, 200, {});
    } catch (error) {
        handleResponse(res, 400, error.message, false);
    }
};
