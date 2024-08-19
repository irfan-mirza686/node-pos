import express from 'express';
import {
    createUnit,
    getAllUnits,
    getUnitById,
    updateUnitById,
    deleteUnitById
} from '../controllers/unitController.js'; // Import individual controller functions


import { validationResult } from 'express-validator';
import { createUnitValidation, updateUnitValidation } from '../validators/unitValidation.js';

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
router.post('/create', createUnitValidation, validate, createUnit); // Create a new unit
router.get('/', getAllUnits); // Get all units
router.get('/:id', getUnitById); // Get a unit by ID
router.put('/:id', updateUnitValidation, validate, updateUnitById); // Update a unit by ID
router.delete('/:id', deleteUnitById); // Delete a unit by ID

export default router;
