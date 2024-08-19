import dotenv from 'dotenv';
import assert from 'assert';

dotenv.config();

const { PORT, HOST, HOST_URL, SQL_USER, SQL_PASSWORD, SQL_DATABASE, SQL_SERVER, SQL_ENCRYPT } = process.env;
const sqlEncrypt = SQL_ENCRYPT === "true";

assert(PORT, 'Port is required');
assert(HOST, 'Host is required');

const getConfig = () => ({
    port: PORT,
    host: HOST,
    url: HOST_URL,
    sql: {
        server: SQL_SERVER,
        database: SQL_DATABASE,
        user: SQL_USER,
        password: SQL_PASSWORD,
        options: {
            encrypt: sqlEncrypt,
            enableArithAbort: true,
        }
    }
});

export default getConfig;
