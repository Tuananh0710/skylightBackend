const { DataTypes } = require("sequelize");
const { sequelize } = require("../configs/database.js");

const Friend = sequelize.define(
  "friends",
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    friend_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
  },
  {
    tableName: "friends",
    createdAt: "created_at",
    updatedAt: false,
    underscored: true,
  },
);

// Tự động chuẩn hóa thứ tự trước khi validate và lưu vào DB
Friend.beforeValidate((friend) => {
  if (friend.user_id && friend.friend_id) {
    if (friend.user_id === friend.friend_id) {
      throw new Error("Bạn không thể kết bạn với chính mình.");
    }

    // Đảm bảo user_id luôn nhỏ hơn friend_id để tránh trùng lặp
    if (friend.user_id > friend.friend_id) {
      const temp = friend.user_id;
      friend.user_id = friend.friend_id;
      friend.friend_id = temp;
    }
  }
});

module.exports = Friend;
