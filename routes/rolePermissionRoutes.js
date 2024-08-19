import express from 'express';
import {
    createRolePermission,
    getAllRolePermission,
    getRolePermissionById,
    updateRolePermissionById,
    getAllModules
} from '../controllers/rolePermissionsController.js'; // Import individual controller functions


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
router.post('/create', createRolePermission); // Create a new role permission
router.get('/AllModules', getAllModules);
router.get('/', getAllRolePermission); // Get all permission
router.get('/:id', getRolePermissionById); // Get a permission by group
router.put('/:id', updateRolePermissionById); // Update a role permission by ID



export default router;
