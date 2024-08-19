import connectToDatabase from "../config/db.js";

export const testController = async (req, res) => {
    try {
        // Connect to the database
        const pool = await connectToDatabase(); // Call the function correctly

        // Query the database
        const result = await pool.request().query('SELECT * FROM users');

        // Check if data was returned
        if (!result.recordset.length) {
            return res.status(404).send({
                success: false,
                message: "No user found"
            });
        }

        // Send the result as a response
        return res.status(200).send({
            success: true,
            data: result.recordset
        });
    } catch (err) {
        console.error('Error in testController:', err);
        return res.status(500).send({
            success: false,
            message: "Server Error"
        });
    }
};
