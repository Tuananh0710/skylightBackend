const { DataTypes } = require("sequelize");
const { sequelize } = require("../configs/database.js");

const FriendRequest = sequelize.define(
  "friends_requests",
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    sender_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    receiver_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    status: {
      type: DataTypes.ENUM("pending", "accepted", "rejected"),
      defaultValue: "pending",
    },
  },
  {
    tableName: "friends_requests",
    createdAt: "created_at",
    updatedAt: false,
    underscored: true,
  },
);

module.exports = FriendRequest;
