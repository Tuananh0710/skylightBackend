require('dotenv').config();
const app = require('./app');
const { sequelize, connectMongoDB } = require('./configs/database');

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // 1. Connect to MySQL (Sequelize)
    await sequelize.authenticate();
    console.log('--- MySQL connected successfully ---');

    // 2. Connect to MongoDB (Mongoose)
    await connectMongoDB();

    // 3. Start Server
    app.listen(PORT, () => {
      console.log(`--- Server is running on port ${PORT} ---`);
    });
  } catch (error) {
    console.error('Unable to start the server:', error);
  }
};

startServer();
