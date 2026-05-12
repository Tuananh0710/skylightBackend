const { DataTypes } = require("sequelize");
const { sequelize } = require("../configs/database");

const User = sequelize.define(
  "users",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    bio: {
      type: String,
      maxLength: 500,
    },
    birthday: {
      type: DataTypes.DATE,
    },
    avatar: {
      type: DataTypes.STRING,
      defaultValue: "default-avatar.png",
    },
  },
  {
    tableName: "users",
    createdAt: "created_at",
    updatedAt: false,
  },
);

module.exports = User;
