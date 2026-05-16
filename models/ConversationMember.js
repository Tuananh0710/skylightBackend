const { DataTypes } = require("sequelize");
const { sequelize } = require("../configs/database.js");

const Conversation_members = sequelize.define(
  "conversation_members",
  {
    conversation_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: "conversations",
        key: "id",
      },
    },
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: "users",
        key: "id",
      },
    },
    role: {
      type: DataTypes.ENUM("member", "admin"),
      defaultValue: "member",
    },
    joined_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "conversation_members",
    createdAt: false,
    updatedAt: false,
    underscored: true,
  },
);

module.exports = Conversation_members;
