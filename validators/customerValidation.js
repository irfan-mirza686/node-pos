import { body, param } from 'express-validator';
import sql from 'mssql/msnodesqlv8.js';
import connectToDatabase from '../config/db.js';

// Function to check if a product name is unique, skipping the current ID
const isCustomerNameUnique = async (field, value, id = null) => {
    try {
        const pool = await connectToDatabase();
        const query = id
            ? `SELECT COUNT(*) AS count FROM customers WHERE ${field} = @value AND id <> @id`
            : `SELECT COUNT(*) AS count FROM customers WHERE ${field} = @value`;

        const result = await pool.request()
            .input('value', sql.NVarChar, value)
            .input('id', sql.Int, id)
            .query(query);

        return result.recordset[0].count === 0;
    } catch (error) {
        console.error('Error querying the database:', error);
        throw new Error('Database query failed');
    }
};

// Regular expression to check if the string starts with a digit
const doesNotStartWithDigit = (value) => !/^\d/.test(value);

// Validation rules for creating a new customer
export const createCustomerValidation = [
    body('name')
        .notEmpty().withMessage('Customer Name English is required')
        .isString().withMessage('Customer Name must be a string')
        .isLength({ max: 100 }).withMessage('Customer Name must be at most 100 characters long')
        .custom(doesNotStartWithDigit).withMessage('Name should not start with a digit')
        .custom(async (value, { req }) => {
            const isUnique = await isCustomerNameUnique('name', value);
            if (!isUnique) {
                throw new Error('Customer name already exists');
            }
            return true;
        }),

    body('mobile')
        .notEmpty().withMessage('Mobile is required'),

    body('vat')
        .notEmpty().withMessage('Vat # is required'),

];

// Validation rules for updating a customer
export const updateCustomerValidation = [
    param('id')
        .isInt().withMessage('Customer ID must be an integer'),

    body('name')
        .notEmpty().withMessage('Customer Name English is required')
        .isString().withMessage('Customer Name must be a string')
        .isLength({ max: 100 }).withMessage('Customer Name must be at most 100 characters long')
        .custom(doesNotStartWithDigit).withMessage('Name should not start with a digit')
        .custom(async (value, { req }) => {
            const { id } = req.params;
            if (!id) {
                const isUnique = await isCustomerNameUnique('name', value);
                if (!isUnique) {
                    throw new Error('Customer name already exists');
                }
                return true;
            }

        }),

    body('mobile')
        .notEmpty().withMessage('Mobile is required'),

    body('vat')
        .notEmpty().withMessage('Vat # is required'),
];
