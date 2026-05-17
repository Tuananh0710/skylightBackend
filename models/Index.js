const { DataTypes } = require("sequelize");
const { sequelize } = require("../configs/database.js");

const User = require("./User");
const Friend = require("./Friend");
const FriendRequest = require("./FriendRequest");
const Conversation = require("./Conversation");
const Conversation_members = require("./ConversationMember");

// 1. Quan hệ Many-to-Many giữa User và Conversation
User.belongsToMany(Conversation, {
  through: Conversation_members,
  foreignKey: "user_id",
  otherKey: "conversation_id",
  as: "conversations",
});
Conversation.belongsToMany(User, {
  through: Conversation_members,
  foreignKey: "conversation_id",
  otherKey: "user_id",
  as: "members",
});
// Super Many-to-Many để truy vấn bảng trung gian chi tiết
Conversation.hasMany(Conversation_members, {
  foreignKey: "conversation_id",
  as: "memberDetails",
});
Conversation_members.belongsTo(Conversation, { foreignKey: "conversation_id" });
User.hasMany(Conversation_members, { foreignKey: "user_id" });
Conversation_members.belongsTo(User, { foreignKey: "user_id", as: "user" });

//
//
//
// 2. Quan hệ giữa User và Friend
// Liên kết từ Friend ngược về User để phục vụ Eager Loading (include)
Friend.belongsTo(User, { foreignKey: "user_id", as: "user" });
Friend.belongsTo(User, { foreignKey: "friend_id", as: "friend" });
// Nếu muốn từ User truy vấn ra danh sách Friend
User.hasMany(Friend, { foreignKey: "user_id", as: "friendsAsUser" });
User.hasMany(Friend, { foreignKey: "friend_id", as: "friendsAsFriend" });

//
//
//
// 3. Quan hệ giữa User và FriendRequest
FriendRequest.belongsTo(User, { foreignKey: "sender_id", as: "sender" });
FriendRequest.belongsTo(User, { foreignKey: "receiver_id", as: "receiver" });

User.hasMany(FriendRequest, { foreignKey: "sender_id", as: "sentRequests" });
User.hasMany(FriendRequest, {
  foreignKey: "receiver_id",
  as: "receivedRequests",
});

module.exports = {
  sequelize,
  User,
  Friend,
  FriendRequest,
  Conversation,
  Conversation_members,
};
