import express from 'express';
import {
    createBrand,
    getAllBrands,
    getBrandById,
    updateBrandById,
    deleteBrandById
} from '../controllers/brandController.js'; // Import individual controller functions

import { validationResult } from 'express-validator';
import { createBrandValidation, updateBrandValidation } from '../validators/brandValidation.js';

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
router.post('/create', createBrandValidation, validate, createBrand); // Create a new brand
router.get('/', getAllBrands); // Get all brands
router.get('/:id', getBrandById); // Get a brand by ID
router.put('/:id', updateBrandValidation, validate, updateBrandById); // Update a brand by ID
router.delete('/:id', deleteBrandById); // Delete a brand by ID

export default router;
