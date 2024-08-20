import connectToDatabase from '../config/db.js';
import { handleResponse } from '../utils/responseHandler.js'; // Import the response handler
import sql from 'mssql/msnodesqlv8.js'; // Ensure correct import for sql


// Function to generate the next invoice number
const generateInvoiceNumber = async (pool) => {
    try {
        // Query to get the last invoice number
        const result = await pool.request()
            .query('SELECT TOP 1 order_no FROM sales ORDER BY id DESC');

        let nextInvoiceNumber;

        if (result.recordset.length === 0) {
            // No record exists, start with "0001"
            nextInvoiceNumber = '0001';
        } else {
            // Get the last invoice number and increment it
            const lastInvoiceNumber = result.recordset[0].order_no;
            let nextNumber = parseInt(lastInvoiceNumber, 10) + 1;

            // If the next number is less than 10000, pad it with leading zeros
            if (nextNumber < 10000) {
                nextInvoiceNumber = nextNumber.toString().padStart(4, '0');
            } else {
                // If the number is 10000 or more, return it as a string without padding
                nextInvoiceNumber = nextNumber.toString();
            }
        }

        return nextInvoiceNumber;

    } catch (error) {
        throw new Error('Error generating invoice number: ' + error.message);
    }
};
/*********************************************************************************/
// Create a new Unit
export const startTransaction = async (req, res) => {

    try {
        const pool = await connectToDatabase(); // Use the function to get the connection pool
        // Generate the next invoice number
        const invoiceNumber = await generateInvoiceNumber(pool);
        // Fetch the customer ID and name where the customer is "Walk-in customer"
        const customerResult = await pool.request()
            .input('customer_name', sql.VarChar, 'Walk-in customer')
            .query('SELECT id, name FROM customers WHERE name = @customer_name');
        const customer = customerResult.recordset[0];
        handleResponse(res, 201, { order_no: invoiceNumber, customer_id: customer.id, customer_name: customer.name });

    } catch (error) {
        handleResponse(res, 400, error.message, false);
    }
};
/*********************************************************************************/

export const searchBarcode = async (req, res) => {
    const { barcode } = req.body;
    try {
        if (!barcode) {
            return handleResponse(res, 400, 'Barcode is required', false);
        }
        const pool = await connectToDatabase(); // Use the function to get the connection pool
        const result = await pool.request()
            .input('barcode', sql.VarChar, barcode)
            .query('SELECT id,type, productnameenglish, quantity, selling_price FROM products WHERE barcode = @barcode');

        if (result.recordset.length === 0) {
            throw new Error('Product not found');
        }
        const product = result.recordset[0];

        // Calculate VAT at 15% of the selling price
        const vat = product.selling_price * 0.15;

        // Add VAT as a new key in the product object
        product.vat = vat;
        handleResponse(res, 201, product);
    } catch (error) {
        handleResponse(res, 400, error.message, false);
    }
}
/*********************************************************************************/

function makeItemsArr(data) {
    const purchaseItems = [];

    // Ensure all required fields are present in data
    const fields = ['description', 'gpc', 'product_id', 'product_type', 'barcode', 'quantity', 'price', 'discount', 'vat', 'vat_total', 'single_total'];
    for (const field of fields) {
        if (!Array.isArray(data[field])) {
            throw new Error(`Missing or invalid field: ${field}`);
        }
    }

    for (let i = 0; i < data.description.length; i++) {
        purchaseItems.push({
            productName: data.description[i] || '', // Fallback to empty string if undefined
            gpc: data.gpc[i] || '', // Fallback to empty string if undefined
            product_id: data.product_id[i] || null, // Fallback to null if undefined
            product_type: data.product_type[i] || '', // Fallback to empty string if undefined
            barcode: data.barcode ? data.barcode[i] || '' : '', // Handle optional barcode field
            qty: data.quantity[i] || 0, // Fallback to 0 if undefined
            price: data.price[i] || 0, // Fallback to 0 if undefined
            discount: data.discount[i] || 0, // Fallback to 0 if undefined
            vat: data.vat[i] || 0, // Fallback to 0 if undefined
            vat_total: data.vat_total[i] || 0, // Fallback to 0 if undefined
            sub_total: data.single_total[i] || 0, // Fallback to 0 if undefined
        });
    }

    return purchaseItems;
}


export const makeTransaction = async (req, res) => {
    const {
        transactions,
        salesLocation,
        vat_no,
        order_no,
        delivery,
        customer_id,
        remkars,
        type,
        net_with_vat,
        totalAmount,
        tender_amount,
        change_amount 
    } = req.body;

    try {
        const data = req.body;
        const itemsArray = makeItemsArr(data);

        const pool = await connectToDatabase();

        // Start a transaction
        await pool.request().query('BEGIN TRANSACTION');

        try {
            // Save sale in sales table
            const result = await pool.request()
                .input('transactions', sql.NVarChar, transactions)
                .input('salesLocation', sql.NVarChar, salesLocation)
                .input('vat_no', sql.NVarChar, vat_no)
                .input('order_no', sql.NVarChar, order_no)
                .input('delivery', sql.NVarChar, delivery)
                .input('customer_id', sql.Int, customer_id)
                .input('remkars', sql.NVarChar, remkars)
                .input('type', sql.VarChar, type)
                .input('items', sql.NVarChar, JSON.stringify(itemsArray)) // Convert itemsArray to JSON string
                .input('net_with_vat', sql.Float, net_with_vat)
                .input('total', sql.Float, totalAmount)
                .input('tender_amount', sql.Float, tender_amount)
                .input('change_amount', sql.Float, change_amount)
                .query(`
                    INSERT INTO sales (transactions, salesLocation, vat_no, order_no, delivery, customer_id, remkars, type, items,net_with_vat,total,tender_amount,change_amount)
                    VALUES (@transactions, @salesLocation, @vat_no, @order_no, @delivery, @customer_id, @remkars, @type, @items,@net_with_vat,@total,@tender_amount,@change_amount)
                `);

            // Update product stock
            for (const item of itemsArray) {
                const { barcode, qty } = item;

                const productResult = await pool.request()
                    .input('barcode', sql.VarChar, barcode)
                    .query('SELECT quantity FROM products WHERE barcode = @barcode');

                const product = productResult.recordset[0];
                if (product) {
                    const newQty = product.quantity - qty;

                    await pool.request()
                        .input('barcode', sql.VarChar, barcode)
                        .input('newQty', sql.Int, newQty)
                        .query('UPDATE products SET quantity = @newQty WHERE barcode = @barcode');
                }
            }

            // Commit transaction
            await pool.request().query('COMMIT TRANSACTION');

            handleResponse(res, 201, { message: 'Sale saved and stock updated successfully.' });
        } catch (error) {
            // Rollback transaction on error
            await pool.request().query('ROLLBACK TRANSACTION');
            handleResponse(res, 400, error.message, false);
        }
    } catch (error) {
        handleResponse(res, 400, error.message, false);
    }
};
