import sql from 'mssql/msnodesqlv8.js';

const config = {
    database: 'node_pos', // SQL Server database name
    server: 'localhost\\SQLEXPRESS', // Use 'localhost' or IP address
    driver: 'msnodesqlv8',
    options: {
        trustedConnection: true, // Use Windows Authentication
        enableArithAbort: true, // Required for modern SQL Server versions
        trustServerCertificate: true // Trust the server certificate for local dev
    }
};

async function connectToDatabase() {
    try {
        console.log('Attempting to connect to SQL Server...');
        let pool = await sql.connect(config);
        console.log('Connected to SQL Server successfully!');
        return pool;
    } catch (err) {
        console.error('Database connection error:', err);
        throw err;
    }
}

export default connectToDatabase;
