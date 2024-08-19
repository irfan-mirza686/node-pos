/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
export default {

  development: {
    client: 'mssql',
    connection: {
      server: 'localhost\\SQLEXPRESS', // Use the correct server and instance name
      database: 'node_pos',            // Replace with your database name
      driver: 'tedious',
      options: {
        trustedConnection: true,       // Use Windows Authentication
        enableArithAbort: true,        // Required for modern SQL Server versions
        trustServerCertificate: true   // Trust the server certificate for local dev
      }
    },
    migrations: {
      directory: './migrations',       // Directory to store migration files
      tableName: 'knex_migrations'     // Table to keep track of migrations
    }
  },

  // staging: {
  //   client: 'mssql',
  //   connection: {
  //     server: 'localhost\\SQLEXPRESS',
  //     database: 'node_pos',
  //     options: {
  //       trustedConnection: true,
  //       enableArithAbort: true,
  //       trustServerCertificate: true
  //     }
  //   },
  //   migrations: {
  //     directory: './migrations',
  //     tableName: 'knex_migrations'
  //   },
  //   pool: {
  //     min: 2,
  //     max: 10
  //   }
  // },

  // production: {
  //   client: 'mssql',
  //   connection: {
  //     server: 'localhost\\SQLEXPRESS',
  //     database: 'node_pos',
  //     options: {
  //       trustedConnection: true,
  //       enableArithAbort: true,
  //       trustServerCertificate: true
  //     }
  //   },
  //   migrations: {
  //     directory: './migrations',
  //     tableName: 'knex_migrations'
  //   },
  //   pool: {
  //     min: 2,
  //     max: 10
  //   }
  // }

};
