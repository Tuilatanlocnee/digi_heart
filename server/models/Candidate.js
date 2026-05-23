import mongoose from 'mongoose';

// Định nghĩa lược đồ (Schema) cho hồ sơ ứng tuyển thành viên CLB
const candidateSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  targetBan: {
    type: String,
    required: true,
    enum: ['Ban Kỹ thuật Số', 'Ban Truyền thông Số', 'Ban Sự kiện & Phong trào']
  },
  skills: {
    type: String,
    default: ''
  },
  reason: {
    type: String,
    required: true
  },
  status: {
    type: String,
    default: 'Chờ duyệt',
    enum: ['Chờ duyệt', 'Đã duyệt', 'Từ chối']
  },
  avatar: {
    type: String,
    default: ''
  },
  date: {
    type: String,
    default: () => new Date().toISOString().split('T')[0]
  }
}, {
  timestamps: true
});

const Candidate = mongoose.model('Candidate', candidateSchema);
export default Candidate;
