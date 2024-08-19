import  connectToDatabase  from './config/db.js';

async function testSequelizeConnection() {
    try {
        connectToDatabase();
        console.log('Sequelize connection successful!');
    } catch (error) {
        console.error('Sequelize connection error:', error);
    }
}

testSequelizeConnection();
