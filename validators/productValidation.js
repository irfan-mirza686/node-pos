import { body, param } from 'express-validator';
import sql from 'mssql';
import connectToDatabase from '../config/db.js';

// Function to check if a product name is unique, skipping the current ID
const isProductNameUnique = async (field, value, id = null) => {
    try {
        const pool = await connectToDatabase();
        const query = id
            ? `SELECT COUNT(*) AS count FROM products WHERE ${field} = @value AND id <> @id`
            : `SELECT COUNT(*) AS count FROM products WHERE ${field} = @value`;

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

// Function to check if a barcode is unique, skipping the current ID
const isBarcodeUnique = async (value, id = null) => {
    try {
        const pool = await connectToDatabase();
        const query = id
            ? `SELECT COUNT(*) AS count FROM products WHERE barcode = @value AND id <> @id`
            : `SELECT COUNT(*) AS count FROM products WHERE barcode = @value`;

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

// Validation rules for creating a new product
export const createProductValidation = [
    body('productnameenglish')
        .notEmpty().withMessage('Product Name English is required')
        .isString().withMessage('Product Name must be a string')
        .isLength({ max: 150 }).withMessage('Product Name must be at most 150 characters long')
        .custom(doesNotStartWithDigit).withMessage('Name should not start with a digit')
        .custom(async (value, { req }) => {
            const isUnique = await isProductNameUnique('productnameenglish', value);
            if (!isUnique) {
                throw new Error('Product name already exists');
            }
            return true;
        }),

    body('BrandName')
        .notEmpty().withMessage('Brand is required'),

    body('size')
        .notEmpty().withMessage('Size is required'),

    body('purchase_price')
        .notEmpty().withMessage('Purchase Price is required'),

    body('selling_price')
        .notEmpty().withMessage('Selling Price is required'),

    body('barcode')
        .notEmpty().withMessage('Product Code is required')
        .custom(async (value) => {
            const isUnique = await isBarcodeUnique(value);
            if (!isUnique) {
                throw new Error('Barcode already exists');
            }
            return true;
        }),

    body('unit')
        .notEmpty().withMessage('Unit is required'),

    body('quantity')
        .notEmpty().withMessage('Quantity is required'),

    body('details_page')
        .notEmpty().withMessage('Product Description English is required'),
];

// Validation rules for updating a Product
export const updateProductValidation = [
    param('id')
        .isInt().withMessage('Product ID must be an integer'),

    body('productnameenglish')
        .notEmpty().withMessage('Product Name English is required')
        .isString().withMessage('Product Name must be a string')
        .isLength({ max: 150 }).withMessage('Product Name must be at most 150 characters long')
        .custom(doesNotStartWithDigit).withMessage('Name should not start with a digit')
        .custom(async (value, { req }) => {
            const isUnique = await isProductNameUnique('productnameenglish', value, req.params.id);
            if (!isUnique) {
                throw new Error('Product name already exists');
            }
            return true;
        }),

    body('BrandName')
        .notEmpty().withMessage('Brand is required'),

    body('size')
        .notEmpty().withMessage('Size is required'),

    body('purchase_price')
        .notEmpty().withMessage('Purchase Price is required'),

    body('selling_price')
        .notEmpty().withMessage('Selling Price is required'),

        body('barcode')
        .notEmpty().withMessage('Product Code is required')
        .custom(async (value, { req }) => {
            // Get the existing product's barcode from the database
            const pool = await connectToDatabase();
            const currentProductResult = await pool.request()
                .input('id', sql.Int, req.params.id)
                .query('SELECT barcode FROM products WHERE id = @id');

            if (currentProductResult.recordset.length === 0) {
                throw new Error('Product not found');
            }

            const currentBarcode = currentProductResult.recordset[0].barcode;

            // Only check for uniqueness if the barcode is being changed
            if (value !== currentBarcode) {
                const isUnique = await isBarcodeUnique(value);
                if (!isUnique) {
                    throw new Error('Barcode already exists');
                }
            }
            return true;
        }),

    body('unit')
        .notEmpty().withMessage('Unit is required'),

    body('quantity')
        .notEmpty().withMessage('Quantity is required'),

    body('details_page')
        .notEmpty().withMessage('Product Description English is required'),
];
