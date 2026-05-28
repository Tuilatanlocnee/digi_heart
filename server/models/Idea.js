import mongoose from 'mongoose';

// Định nghĩa lược đồ (Schema) cho ý tưởng và sáng kiến số hoá
const ideaSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    default: ''
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    default: 'Chờ duyệt',
    enum: ['Chờ duyệt', 'Đã tiếp nhận', 'Đang thử nghiệm', 'Đã áp dụng', 'Đã phản hồi']
  },
  type: {
    type: String,
    enum: ['Sáng kiến', 'Góp ý'],
    default: 'Sáng kiến'
  },
  date: {
    type: String,
    default: () => new Date().toISOString().split('T')[0]
  }
}, {
  timestamps: true
});

const Idea = mongoose.model('Idea', ideaSchema);
export default Idea;
