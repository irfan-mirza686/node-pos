import connectToDatabase from '../config/db.js';
import { handleResponse } from '../utils/responseHandler.js';
import sql from 'mssql';

export const createRolePermission = async (req, res) => {

    const { name, txtaccess = [] } = req.body;

    const pool = await connectToDatabase();
    const transaction = new sql.Transaction(pool); // Create a new transaction

    try {
        await transaction.begin(); // Start the transaction

        const group_modules = await pool.request().query('SELECT * FROM group_modules');
        const groups = group_modules.recordset;

        var txtModID = [];
        var txtModname = [];
        var txtModpage = [];
        groups.forEach(element => {
            txtModID.push(element.id);
            txtModname.push(element.module_name);
            txtModpage.push(element.module_page);
        });

        // Insert the role name and get the new role ID
        const insertRoleResult = await transaction.request()
            .input('name', sql.VarChar, name)
            .query('INSERT INTO groups (name) OUTPUT inserted.id VALUES (@name)');

        const roleId = insertRoleResult.recordset[0].id;

        // Prepare the permissions array
        const permissions = [];
        txtModpage.forEach((modulePage, index) => {
            permissions.push({
                group_id: roleId,
                module_id: txtModID[index],
                module_name: txtModname[index],
                module_page: modulePage,
                access: Array.isArray(txtaccess) && txtaccess.includes(index.toString()) ? 1 : 0
            });
        });

        // Insert permissions for the new role
        for (const permission of permissions) {
            await transaction.request()
                .input('group_id', sql.Int, permission.group_id)
                .input('module_id', sql.Int, permission.module_id)
                .input('module_name', sql.VarChar, permission.module_name)
                .input('module_page', sql.VarChar, permission.module_page)
                .input('access', sql.Bit, permission.access)
                .query(`
                    INSERT INTO group_permissions (group_id, module_id, module_name, module_page, access) 
                    VALUES (@group_id, @module_id, @module_name, @module_page, @access)
                `);
        }

        await transaction.commit(); // Commit the transaction if everything is successful

        const responseData = {
            id: roleId,
            name,
            permissions
        };

        handleResponse(res, 201, responseData);

    } catch (error) {
        await transaction.rollback(); // Rollback the transaction in case of an error
        handleResponse(res, 400, { message: error.message }, false);
    }
};

/***************************************************************************/
export const updateRolePermissionById = async (req, res) => {

    const { name, txtaccess = [] } = req.body;
    const { id } = req.params;


    const pool = await connectToDatabase();
    const transaction = new sql.Transaction(pool); // Create a new transaction

    try {
        await transaction.begin(); // Start the transaction

        const group_modules = await pool.request().query('SELECT * FROM group_modules');
        const groups = group_modules.recordset;

        var txtModID = [];
        var txtModname = [];
        var txtModpage = [];
        groups.forEach(element => {
            txtModID.push(element.id);
            txtModname.push(element.module_name);
            txtModpage.push(element.module_page);
        });

        await transaction.request()
            .input('id', sql.Int, id)
            .input('name', sql.NVarChar, name)
            .query('UPDATE groups SET name = @name WHERE id = @id');

        await transaction.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM group_permissions WHERE group_id = @id');
        // Prepare the permissions array
        const permissions = [];
        txtModpage.forEach((modulePage, index) => {
            permissions.push({
                group_id: id,
                module_id: txtModID[index],
                module_name: txtModname[index],
                module_page: modulePage,
                access: Array.isArray(txtaccess) && txtaccess.includes(index.toString()) ? 1 : 0
            });
        });

        // Insert permissions for the new role
        for (const permission of permissions) {
            await transaction.request()
                .input('group_id', sql.Int, permission.group_id)
                .input('module_id', sql.Int, permission.module_id)
                .input('module_name', sql.VarChar, permission.module_name)
                .input('module_page', sql.VarChar, permission.module_page)
                .input('access', sql.Bit, permission.access)
                .query(`
                    INSERT INTO group_permissions (group_id, module_id, module_name, module_page, access) 
                    VALUES (@group_id, @module_id, @module_name, @module_page, @access)
                `);
        }

        await transaction.commit(); // Commit the transaction if everything is successful

        const responseData = {
            id: id,
            name,
            permissions
        };

        handleResponse(res, 200, responseData);

    } catch (error) {
        await transaction.rollback(); // Rollback the transaction in case of an error
        handleResponse(res, 400, { message: error.message }, false);
    }
};
/***************************************************************************/

export const getAllRolePermission = async (req, res) => {
    try {
        // console.log('okk')
        const pool = await connectToDatabase(); // Use the function to get the connection pool
        const result = await pool.request().query('SELECT * FROM units');
        handleResponse(res, 200, result.recordset);
    } catch (error) {
        handleResponse(res, 400, error.message, false);
    }
};
/***************************************************************************/

// Get a single Role and Permission for Edit by ID
export const getRolePermissionById = async (req, res) => {
    const { id } = req.params; // Assuming the group ID is passed as a route parameter
    try {
        const pool = await connectToDatabase(); // Get the connection pool

        const result = await pool.request()
            .input('group_id', sql.Int, id)
            .input('access', sql.Bit, 1)
            .query(`
                SELECT module_page 
                FROM group_permissions 
                WHERE group_id = @group_id AND access = @access
            `);

        // Extract the module_page values from the result set
        const modulePages = result.recordset.map(row => row.module_page);

        const getGroup = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT * FROM groups WHERE id = @id');
        const group = getGroup.recordset;

        handleResponse(res, 200, { group: group, editPermission: modulePages });
    } catch (error) {
        handleResponse(res, 400, error.message, false);
    }
};
/***************************************************************************/
export const getAllModules = async (req, res) => {
    try {
        const pool = await connectToDatabase(); // Use the function to get the connection pool
        const group_modules = await pool.request().query('SELECT * FROM group_modules');
        const groups = group_modules.recordset;
        handleResponse(res, 200, { groupModules: groups });
    } catch (error) {
        handleResponse(res, 400, error.message, false);
    }
}
