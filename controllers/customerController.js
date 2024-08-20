import connectToDatabase from '../config/db.js';
import { handleResponse } from '../utils/responseHandler.js'; // Import the response handler
import sql from 'mssql';

// Create a new Customer
export const createCustomer = async (req, res) => {
    const { name, mobile, vat, address } = req.body;
    const pool = await connectToDatabase(); // Use the function to get the connection pool
    const transaction = new sql.Transaction(pool); // Create a new transaction
    try {
        await transaction.begin(); // Start the transaction
        const customerResult = await pool.request()
            .input('name', sql.NVarChar, name)
            .input('mobile', sql.NVarChar, mobile)
            .input('vat', sql.NVarChar, vat)
            .query('INSERT INTO customers (name,mobile,vat) VALUES (@name,@mobile,@vat); SELECT SCOPE_IDENTITY() AS id');
        const customerId = customerResult.recordset[0].id;
        // Insert each address into customer_addresses table with the generated customerId
        if (address) {
            const addressRequests = address.map(addr =>
                pool.request()
                    .input('customerId', sql.Int, customerId)
                    .input('address', sql.NVarChar, addr)
                    .query('INSERT INTO customer_addresses (customer_id, address) VALUES (@customerId, @address)')
            );
            await Promise.all(addressRequests);
        }
        await transaction.commit(); // Commit the transaction if everything is successful
        handleResponse(res, 201, { id: customerId, name });
    } catch (error) {
        await transaction.rollback(); // Rollback the transaction in case of an error
        handleResponse(res, 400, error.message, false);
    }
};
/***********************************************************************/

// Get all Customers
export const getAllCustomers = async (req, res) => {
    try {
        const pool = await connectToDatabase(); // Use the function to get the connection pool
        // Query to get all customers with their addresses
        const query = `
            SELECT c.id, c.name, c.mobile, c.vat, ca.address
            FROM customers c
            LEFT JOIN customer_addresses ca ON c.id = ca.customer_id
        `;

        const result = await pool.request().query(query);

        // Group addresses by customer ID
        const customers = result.recordset.reduce((acc, row) => {
            const { id, name, mobile, vat, address } = row;
            if (!acc[id]) {
                acc[id] = { id, name, mobile, vat, addresses: [] };
            }
            if (address) {
                acc[id].addresses.push(address);
            }
            return acc;
        }, {});

        // Convert the grouped customers object into an array
        const customersArray = Object.values(customers);

        handleResponse(res, 200, customersArray);
    } catch (error) {
        handleResponse(res, 400, error.message, false);
    }
};
/***********************************************************************/

// Get a single customer by ID
export const getCustomerById = async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await connectToDatabase(); // Use the function to get the connection pool

        // Query to get customer details and their addresses
        const query = `
            SELECT c.id, c.name, c.mobile, c.vat, a.address
            FROM customers c
            LEFT JOIN customer_addresses a ON c.id = a.customer_id
            WHERE c.id = @id
        `;

        const result = await pool.request()
            .input('id', sql.Int, id)
            .query(query);

        if (result.recordset.length === 0) {
            return handleResponse(res, 404, 'Customer not found', false);
        }

        // Group addresses by customer ID
        const customer = {
            id: result.recordset[0].id,
            name: result.recordset[0].name,
            mobile: result.recordset[0].mobile,
            vat: result.recordset[0].vat,
            addresses: result.recordset.map(row => row.address).filter(addr => addr) // Extract addresses and filter out null/undefined
        };

        handleResponse(res, 200, customer);
    } catch (error) {
        handleResponse(res, 400, error.message, false);
    }
};
/***********************************************************************/

// Update a customer by ID
export const updateCustomerById = async (req, res) => {
    const { id } = req.params;
    const { name, mobile, vat, address } = req.body; // Added `id` to identify which customer to update
    const pool = await connectToDatabase(); // Use the function to get the connection pool
    const transaction = new sql.Transaction(pool); // Create a new transaction

    try {
        await transaction.begin(); // Start the transaction

        // Update customer details
        await pool.request()
            .input('id', sql.Int, id)
            .input('name', sql.NVarChar, name)
            .input('mobile', sql.NVarChar, mobile)
            .input('vat', sql.NVarChar, vat)
            .query('UPDATE customers SET name = @name, mobile = @mobile, vat = @vat WHERE id = @id');

        // Check if the customer was updated
        const checkCustomer = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT COUNT(*) AS count FROM customers WHERE id = @id');

        if (checkCustomer.recordset[0].count === 0) {
            throw new Error('Customer not found');
        }

        // Delete existing address for the customer
        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM customer_addresses WHERE customer_id = @id');

        // Insert new addresses
        if (address && address.length > 0) {
            const addressRequests = address.map(addr =>
                pool.request()
                    .input('customerId', sql.Int, id)
                    .input('address', sql.NVarChar, addr)
                    .query('INSERT INTO customer_addresses (customer_id, address) VALUES (@customerId, @address)')
            );
            await Promise.all(addressRequests);
        }

        await transaction.commit(); // Commit the transaction if everything is successful
        handleResponse(res, 200, { id, name });
    } catch (error) {
        await transaction.rollback(); // Rollback the transaction in case of an error
        console.error('Error updating customer:', error); // Log the error
        handleResponse(res, 400, error.message, false);
    }
};

/***********************************************************************/

// Delete a customer by ID
export const deleteCustomerById = async (req, res) => {
    const { id } = req.params;
    const pool = await connectToDatabase(); // Use the function to get the connection pool
    const transaction = new sql.Transaction(pool); // Create a new transaction

    try {
        await transaction.begin(); // Start the transaction

        // Delete addresses associated with the customer
        await transaction.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM customer_addresses WHERE customer_id = @id');

        // Delete the customer
        const result = await transaction.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM customers WHERE id = @id');
        
        if (result.rowsAffected[0] === 0) {
            await transaction.rollback(); // Rollback the transaction if no customer was deleted
            return handleResponse(res, 404, 'Customer not found', false);
        }

        await transaction.commit(); // Commit the transaction if everything is successful
        handleResponse(res, 200, { message: 'Customer deleted successfully' });
    } catch (error) {
        await transaction.rollback(); // Rollback the transaction in case of an error
        handleResponse(res, 400, error.message, false);
    }
};

