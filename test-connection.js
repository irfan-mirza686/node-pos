import { sequelize } from './config/db.js';

async function testSequelizeConnection() {
    try {
        await sequelize.authenticate();
        console.log('Sequelize connection successful!');
    } catch (error) {
        console.error('Sequelize connection error:', error);
    }
}

testSequelizeConnection();
