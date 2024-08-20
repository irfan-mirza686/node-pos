import connectToDatabase from '../config/db.js';
import { handleResponse } from '../utils/responseHandler.js'; // Import the response handler
import sql from 'mssql/msnodesqlv8.js'; // Ensure correct import for sql

function createSlug(text) {
    return text
        .toString() // Convert to string
        .toLowerCase() // Convert to lowercase
        .trim() // Trim spaces at the beginning and end
        .replace(/[\s\W-]+/g, '-') // Replace spaces and special characters with hyphens
        .replace(/^-+|-+$/g, ''); // Remove leading and trailing hyphens
}
/*******************************************************************/
// Create a new Unit
export const createPorduct = async (req, res) => {

    const {
        productnameenglish,
        BrandName,
        size,
        purchase_price,
        selling_price,
        barcode,
        unit,
        quantity,
        details_page
    } = req.body;
    try {
        const product_type = 'finished_goods';
        const type = 'non_gs1';
        const slug = createSlug(productnameenglish);
        const pool = await connectToDatabase(); // Use the function to get the connection pool
        const result = await pool.request()
            .input('type', sql.NVarChar, type)
            .input('product_type', sql.NVarChar, product_type)
            .input('productnameenglish', sql.NVarChar, productnameenglish)
            .input('slug', sql.NVarChar, slug)
            .input('BrandName', sql.NVarChar, BrandName)
            .input('size', sql.NVarChar, size)
            .input('purchase_price', sql.Float, purchase_price)
            .input('selling_price', sql.Float, selling_price)
            .input('barcode', sql.NVarChar, barcode)
            .input('unit', sql.NVarChar, unit)
            .input('quantity', sql.NVarChar, quantity)
            .input('details_page', sql.NVarChar, details_page)
            .query(`
                INSERT INTO products (type,product_type,productnameenglish,slug,BrandName, size, purchase_price, selling_price, barcode,unit, quantity, details_page)
                VALUES (@type,@product_type,@productnameenglish,@slug,@BrandName, @size, @purchase_price, @selling_price, @barcode,@unit, @quantity, @details_page);
                
                SELECT id, productnameenglish,slug,BrandName, size, purchase_price, selling_price, barcode,unit, quantity, details_page
                FROM products
                WHERE id = SCOPE_IDENTITY();
            `);
        const savedProduct = result.recordset[0];
        handleResponse(res, 201, savedProduct);

    } catch (error) {
        handleResponse(res, 400, error.message, false);
    }
};
/*******************************************************************/

// Get all units
export const getAllPorducts = async (req, res) => {
    try {
        const pool = await connectToDatabase(); // Use the function to get the connection pool
        const result = await pool.request().query('SELECT * FROM products');
        handleResponse(res, 200, result.recordset);
    } catch (error) {
        handleResponse(res, 400, error.message, false);
    }
};
/*******************************************************************/

// Get a single products by ID
export const getPorductById = async (req, res) => {
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
/*******************************************************************/

// Update a product by ID
export const updatePorductById = async (req, res) => {
    const { id } = req.params;  // Get the product ID from the request parameters
    const {
        productnameenglish,
        BrandName,
        size,
        purchase_price,
        selling_price,
        barcode,
        unit,
        quantity,
        details_page
    } = req.body;

    try {
        const pool = await connectToDatabase(); // Use the function to get the connection pool
        const request = pool.request();

        // Set the inputs
        request.input('id', sql.Int, id);
        if (productnameenglish) {
            const slug = createSlug(productnameenglish);
            request.input('productnameenglish', sql.NVarChar, productnameenglish);
            request.input('slug', sql.NVarChar, slug);
        }
        if (BrandName) request.input('BrandName', sql.NVarChar, BrandName);
        if (size) request.input('size', sql.NVarChar, size);
        if (purchase_price) request.input('purchase_price', sql.Float, purchase_price);
        if (selling_price) request.input('selling_price', sql.Float, selling_price);
        if (barcode) request.input('barcode', sql.NVarChar, barcode);
        if (unit) request.input('unit', sql.NVarChar, unit);
        if (quantity) request.input('quantity', sql.NVarChar, quantity);
        if (details_page) request.input('details_page', sql.NVarChar, details_page);

        // Build the query dynamically
        let query = 'UPDATE products SET ';
        if (productnameenglish) query += 'productnameenglish = @productnameenglish, slug = @slug, ';
        if (BrandName) query += 'BrandName = @BrandName, ';
        if (size) query += 'size = @size, ';
        if (purchase_price) query += 'purchase_price = @purchase_price, ';
        if (selling_price) query += 'selling_price = @selling_price, ';
        if (barcode) query += 'barcode = @barcode, ';
        if (unit) query += 'unit = @unit, ';
        if (quantity) query += 'quantity = @quantity, ';
        if (details_page) query += 'details_page = @details_page, ';

        // Remove the last comma and add the WHERE clause
        query = query.slice(0, -2) + ' WHERE id = @id';

        // Execute the query
        await request.query(query);

        // Fetch the updated product
        const updatedProduct = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT id, productnameenglish,slug,BrandName, size, purchase_price, selling_price, barcode,unit, quantity, details_page FROM products WHERE id = @id');

        handleResponse(res, 200, updatedProduct.recordset[0]);
    } catch (error) {
        handleResponse(res, 400, error.message, false);
    }
};
/*******************************************************************/

// Delete a unit by ID
export const deletePorductById = async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await connectToDatabase(); // Use the function to get the connection pool
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM products WHERE id = @id');
        if (result.rowsAffected[0] === 0) {
            return handleResponse(res, 404, 'Product not found', false);
        }
        handleResponse(res, 200, {});
    } catch (error) {
        handleResponse(res, 400, error.message, false);
    }
};
