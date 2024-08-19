import sql from 'mssql';

const config = {
    user: 'sa', // SQL Server username
    password: 'its2514LOVE!', // SQL Server password
    server: '173.249.56.16', // Remote SQL Server IP address
    database: 'node_pos', // SQL Server database name
    options: {
        encrypt: false, // Encrypt connections to the SQL Server
        trustServerCertificate: true, // Trust the server certificate (useful for self-signed certificates)
        enableArithAbort: true // Required for modern SQL Server versions
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
