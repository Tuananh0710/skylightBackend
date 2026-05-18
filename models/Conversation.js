const { DataTypes } = require("sequelize");
const { sequelize } = require("../configs/database.js");

const Conversation = sequelize.define(
  "conversations",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    is_group: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "conversations",
    createdAt: "created_at",
    updatedAt: false,
    underscored: true,
  },
);

module.exports = Conversation;
