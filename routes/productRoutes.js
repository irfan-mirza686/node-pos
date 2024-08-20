import express from 'express';
import {
    createPorduct,
    getAllPorducts,
    getPorductById,
    updatePorductById,
    deletePorductById
} from '../controllers/productController.js'; // Import individual controller functions


// import { validationResult } from 'express-validator';
// import { createPorductValidation, updatePorductValidation } from '../validators/productValidation.js';

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
router.post('/create', createPorduct); // Create a new product
router.get('/', getAllPorducts); // Get all products
router.get('/:id', getPorductById); // Get a product by ID
router.put('/:id', updatePorductById); // Update a product by ID
router.delete('/:id', deletePorductById); // Delete a product by ID

export default router;
