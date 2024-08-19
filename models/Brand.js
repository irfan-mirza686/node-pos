import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Brand = sequelize.define('Brand', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, // Ensure the name is unique
    }
}, {
    tableName: 'brands',
    timestamps: false // Disable timestamps if your table doesn't have 'createdAt' and 'updatedAt' fields
});

export default Brand;
