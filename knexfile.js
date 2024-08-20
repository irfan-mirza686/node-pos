// knexfile.js

export default {
  development: {
    client: 'mssql',
    connection: {
      user: 'sa', // Your SQL Server username
      password: 'its2514LOVE!', // Your SQL Server password
      server: '173.249.56.16', // Your SQL Server IP address
      database: 'node_pos', // Your SQL Server database name
      options: {
        encrypt: false, // Use true if you're using an encrypted connection
        trustServerCertificate: true, // Trust the server certificate
        enableArithAbort: true, // Required for modern SQL Server versions
      }
    },
    migrations: {
      directory: './migrations', // Directory where migration files are stored
      tableName: 'knex_migrations' // Table to track migrations
    }
  }
};
