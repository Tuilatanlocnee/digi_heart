import mongoose from 'mongoose';

// Định nghĩa lược đồ (Schema) cho tài khoản người dùng / Admin
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  fullName: {
    type: String,
    default: 'Thành viên CLB'
  },
  role: {
    type: String,
    default: 'member',
    enum: ['admin', 'superadmin', 'member']
  }
}, {
  timestamps: true // Tự động thêm createdAt và updatedAt
});

const User = mongoose.model('User', userSchema);
export default User;
