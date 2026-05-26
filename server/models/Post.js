import mongoose from 'mongoose';

// Định nghĩa lược đồ con (Sub-schema) cho bình luận của bài đăng
const commentSchema = new mongoose.Schema({
  author: {
    type: String,
    required: true,
    default: 'Bạn'
  },
  text: {
    type: String,
    required: true
  },
  date: {
    type: String,
    default: () => new Date().toISOString().split('T')[0]
  }
}, {
  timestamps: true
});

// Định nghĩa lược đồ (Schema) cho bài viết trên dòng thời gian Fanpage
const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: String,
    required: true,
    default: 'Đoàn Viên MobiFone'
  },
  avatar: {
    type: String,
    default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'
  },
  time: {
    type: String,
    default: 'Vừa xong'
  },
  content: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: null
  },
  likes: {
    type: Number,
    default: 0
  },
  likedBy: {
    type: [String],
    default: []
  },
  comments: [commentSchema]
}, {
  timestamps: true
});

const Post = mongoose.model('Post', postSchema);
export default Post;
