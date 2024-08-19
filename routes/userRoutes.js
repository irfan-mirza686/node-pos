import express from 'express';
import {
    createUser,
    getAllUsers,
    getUserById,
    updateUserById,
    deleteUserById
} from '../controllers/userController.js'; // Import individual controller functions


import { validationResult } from 'express-validator';
import { createUserValidation, updateUserValidation } from '../validators/userValidation.js';

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
router.post('/create', createUserValidation, validate, createUser); // Create a new user
router.get('/', getAllUsers); // Get all users
router.get('/:id', getUserById); // Get a user by ID
router.put('/:id', updateUserValidation, validate, updateUserById); // Update a user by ID
router.delete('/:id', deleteUserById); // Delete a user by ID

export default router;
