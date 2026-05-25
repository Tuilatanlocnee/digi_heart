import mongoose from 'mongoose';

// Định nghĩa lược đồ (Schema) cho bài viết Tin tức & Sự kiện
const newsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  summary: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Hoạt động Đoàn', 'Đào tạo', 'Cẩm nang số'],
    default: 'Hoạt động Đoàn'
  },
  date: {
    type: String,
    default: () => new Date().toISOString().split('T')[0]
  },
  author: {
    type: String,
    required: true,
    trim: true,
    default: 'Ban Truyền Thông'
  },
  image: {
    type: String,
    default: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80'
  }
}, {
  timestamps: true
});

const News = mongoose.model('News', newsSchema);
export default News;
