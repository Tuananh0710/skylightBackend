const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  userId: {
    type: Number, // Reference to MySQL User ID
    required: true
  },
  content: {
    type: String,
    required: true
  },
  images: [{
    type: String
  }],
  likes: [{
    type: Number // Array of User IDs
  }],
  commentsCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
