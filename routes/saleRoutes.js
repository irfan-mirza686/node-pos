import express from 'express';
import {
    startTransaction,
    searchBarcode,
    makeTransaction
} from '../controllers/saleController.js'; // Import individual controller functions


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
router.get('/start-transaction', startTransaction); // Create a new unit
router.get('/search-barcode', searchBarcode); // Create a new unit
router.post('/transaction', makeTransaction); // Create a new unit


export default router;
