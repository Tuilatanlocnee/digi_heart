import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Import các routes
import authRoutes from './routes/auth.js';
import candidateRoutes from './routes/candidates.js';
import ideaRoutes from './routes/ideas.js';
import postRoutes from './routes/posts.js';

import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Cấu hình dotenv
dotenv.config();

// Kiểm tra an toàn cho JWT_SECRET lúc khởi động máy chủ
if (!process.env.JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    console.error('❌ FATAL ERROR: Biến môi trường JWT_SECRET chưa được cấu hình!');
    process.exit(1);
  } else {
    console.warn('⚠️ CẢNH BÁO BẢO MẬT: Biến môi trường JWT_SECRET chưa được cấu hình. Hãy cấu hình sớm trong file .env!');
  }
}

const app = express();
const PORT = process.env.PORT || 5000;

// Cấu hình Middleware bảo mật và giới hạn tần suất
app.use(helmet());
app.use(cors());

// Rate Limiting cấu hình
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 200, // Tối đa 200 requests từ mỗi IP
  message: { message: 'Bạn đã gửi quá nhiều yêu cầu, vui lòng thử lại sau 15 phút!' },
  standardHeaders: true,
  legacyHeaders: false
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 30, // Tối đa 30 requests đăng nhập/đổi mật khẩu
  message: { message: 'Đăng nhập quá nhiều lần liên tiếp, vui lòng thử lại sau 15 phút!' },
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', generalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/change-password', authLimiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Kết nối cơ sở dữ liệu MongoDB
const connectDB = async () => {
  try {
    const connUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/digi_heart';
    console.log(`Đang kết nối tới MongoDB: ${connUri}...`);
    await mongoose.connect(connUri);
    console.log('✅ Kết nối MongoDB thành công!');
  } catch (error) {
    console.error('❌ Lỗi kết nối cơ sở dữ liệu MongoDB:', error.message);
    console.log('Hệ thống sẽ chạy với tùy chọn fallback hoặc vui lòng kiểm tra lại dịch vụ MongoDB của bạn.');
  }
};

connectDB();

// Đăng ký API Routes
app.use('/api/auth', authRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/ideas', ideaRoutes);
app.use('/api/posts', postRoutes);

// Định nghĩa API Root chào mừng
app.get('/', (req, res) => {
  res.json({ message: 'Chào mừng bạn đến với API Server của CLB Digi Heart!' });
});

// Middleware xử lý khi không tìm thấy route (404)
app.use((req, res, next) => {
  res.status(404).json({ message: 'Đường dẫn API không tồn tại.' });
});

// Middleware xử lý lỗi hệ thống toàn cục (500)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Lỗi hệ thống nội bộ!', error: err.message });
});

// Khởi chạy server
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy trên port: ${PORT}`);
  console.log(`Đường dẫn API chính: http://localhost:${PORT}`);
});

// Trigger reload for watch mode
