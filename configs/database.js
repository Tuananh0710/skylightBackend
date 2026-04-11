const { Sequelize } = require('sequelize');
const mongoose = require('mongoose');
require('dotenv').config();

// MySQL Connection (Sequelize)
const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE || 'skylight',
  process.env.MYSQL_USER || 'root',
  process.env.MYSQL_PASSWORD || '',
  {
    host: process.env.MYSQL_HOST || 'localhost',
    dialect: 'mysql',
    logging: false,
  }
);

// MongoDB Connection (Mongoose)
const connectMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/social_app');
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = { sequelize, connectMongoDB };
