import { body, param } from 'express-validator';
import sql from 'mssql/msnodesqlv8.js';
import connectToDatabase from '../config/db.js';

// Function to check if a user name, email, or mobile is unique, skipping the current ID
const isUserUnique = async (field, value, id = null) => {
    try {
        const pool = await connectToDatabase();
        const query = id
            ? `SELECT COUNT(*) AS count FROM users WHERE ${field} = @value AND id <> @id`
            : `SELECT COUNT(*) AS count FROM users WHERE ${field} = @value`;

        const result = await pool.request()
            .input('value', sql.NVarChar, value)
            .input('id', sql.Int, id)
            .query(query);

        return result.recordset[0].count === 0;
    } catch (error) {
        throw new Error('Database query failed');
    }
};

// Regular expression to check if the string starts with a digit
const doesNotStartWithDigit = (value) => !/^\d/.test(value);

// validation rules for addin a new user 
export const createUserValidation = [
    
    // Validate the ID parameter
    // param('id')
    //     .isInt().withMessage('ID must be an integer')
    //     .notEmpty().withMessage('ID is required'),

    body('group_id')
        .notEmpty().withMessage('Group is required'),

    // Validate the name field
    
    // body('name')
    //     .isString().withMessage('User Name must be a string')
    //     .optional()
    //     .isLength({ max: 100 }).withMessage('User Name must be at most 100 characters long')
    //     .custom(doesNotStartWithDigit).withMessage('Name should not start with a digit')
    //     .custom(async (value, { req }) => {
            
    //         const isUnique = await isUserUnique('name', value, req.params.id);
    //         if (!isUnique) {
    //             throw new Error('User name already exists');
    //         }
    //         return true;
    //     }),

    // Validate the email field
    body('email')
        .isEmail().withMessage('Invalid email address')
        .optional()
        .custom(async (value, { req }) => {
            const isUnique = await isUserUnique('email', value, req.params.id);
            if (!isUnique) {
                throw new Error('Email already exists');
            }
            return true;
        }),

    // Validate the mobile field
    body('mobile')
        .isMobilePhone().withMessage('Invalid mobile phone number')
        .optional()
        .custom(async (value, { req }) => {
            const isUnique = await isUserUnique('mobile', value, req.params.id);
            if (!isUnique) {
                throw new Error('Mobile number already exists');
            }
            return true;
        }),

    // Validate the password field
    body('password')
        .isString().withMessage('Password must be a string')
        .optional()
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),

    // Validate the confirmPassword field
    body('confirmPassword')
        .custom((value, { req }) => {
         
            if (value !== req.body.password) {
                throw new Error('Confirm Password must match the Password');
            }
            return true;
        })
        .optional(),

    // Validate the status field
    body('status')
        .isString().withMessage('Status must be a string')
        .isIn(['active', 'inactive']).withMessage('Status must be either active or inactive')
        .optional(),
];

// Validation rules for updating a user
export const updateUserValidation = [
    // Validate the ID parameter
    // param('id')
    //     .isInt().withMessage('ID must be an integer')
    //     .notEmpty().withMessage('ID is required'),

    // Validate the name field
    // body('fname')
    //     .isString().withMessage('User Name must be a string')
    //     .optional()
    //     .isLength({ max: 100 }).withMessage('User Name must be at most 100 characters long')
    //     .custom(doesNotStartWithDigit).withMessage('Name should not start with a digit')
    //     .custom(async (value, { req }) => {
    //         const isUnique = await isUserUnique('name', value, req.params.id);
    //         if (!isUnique) {
    //             throw new Error('User name already exists');
    //         }
    //         return true;
    //     }),

    // Validate the email field
    body('email')
        .isEmail().withMessage('Invalid email address')
        .optional()
        .custom(async (value, { req }) => {
            const isUnique = await isUserUnique('email', value, req.params.id);
            if (!isUnique) {
                throw new Error('Email already exists');
            }
            return true;
        }),

    // Validate the mobile field
    body('mobile')
        .isMobilePhone().withMessage('Invalid mobile phone number')
        .optional()
        .custom(async (value, { req }) => {
            const isUnique = await isUserUnique('mobile', value, req.params.id);
            if (!isUnique) {
                throw new Error('Mobile number already exists');
            }
            return true;
        }),

    // Validate the password field
    body('password')
        .isString().withMessage('Password must be a string')
        .optional()
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),

    // Validate the confirmPassword field
    body('confirmPassword')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Confirm Password must match the Password');
            }
            return true;
        })
        .optional(),

    // Validate the status field
    body('status')
        .isString().withMessage('Status must be a string')
        .isIn(['active', 'inactive']).withMessage('Status must be either active or inactive')
        .optional(),
];
