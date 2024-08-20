import express from 'express';
import {
    createCustomer,
    getAllCustomers,
    getCustomerById,
    updateCustomerById,
    deleteCustomerById
} from '../controllers/customerController.js'; // Import individual controller functions


import { validationResult } from 'express-validator';
import { createCustomerValidation, updateCustomerValidation } from '../validators/customerValidation.js';

const router = express.Router();

// Middleware to handle validation errors
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// Define routes and associate them with controller functions
router.post('/create', createCustomerValidation, validate, createCustomer); // Create a new unit
router.get('/', getAllCustomers); // Get all units
router.get('/:id', getCustomerById); // Get a Customer by ID
router.put('/:id', updateCustomerValidation, validate, updateCustomerById); // Update a Customer by ID
router.delete('/:id', deleteCustomerById); // Delete a Customer by ID

export default router;
