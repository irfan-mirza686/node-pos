import { body, param, check } from 'express-validator';
import sql from 'mssql';
import connectToDatabase from '../config/db.js';

// Function to check if a brand name is unique, skipping the current ID
const isUnitNameUnique = async (name, id = null) => {
    try {
        const pool = await connectToDatabase();
        const query = id
            ? 'SELECT COUNT(*) AS count FROM units WHERE name = @name AND id <> @id'
            : 'SELECT COUNT(*) AS count FROM units WHERE name = @name';

        const result = await pool.request()
            .input('name', sql.NVarChar, name)
            .input('id', sql.Int, id)
            .query(query);

        return result.recordset[0].count === 0;
    } catch (error) {
        throw new Error('Database query failed');
    }
};

// Regular expression to check if the string starts with a digit
const doesNotStartWithDigit = (value) => !/^\d/.test(value);

// Validation rules for creating a new unit
export const createUnitValidation = [
    body('name')
        .isString().withMessage('Unit Name must be a string')
        .notEmpty().withMessage('Unit Name is required')
        .isLength({ max: 100 }).withMessage('Unit Name must be at most 100 characters long')
        .custom(doesNotStartWithDigit).withMessage('Name should not start with a digit')
        .custom(async (value) => {
            const isUnique = await isUnitNameUnique(value);
            if (!isUnique) {
                throw new Error('Unit name already exists');
            }
            return true;
        })
];

// Validation rules for updating a unit
export const updateUnitValidation = [
    param('id')
        .isInt().withMessage('ID must be an integer')
        .notEmpty().withMessage('ID is required'),
    body('name')
        .isString().withMessage('Unit Name must be a string')
        .optional()
        .isLength({ max: 100 }).withMessage('Unit Name must be at most 100 characters long')
        .custom(async (value, { req }) => {
            const isUnique = await isUnitNameUnique(value, req.params.id);
            if (!isUnique) {
                throw new Error('Unit name already exists');
            }
            return true;
        })
];


