import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Import các models
import User from './models/User.js';
import Candidate from './models/Candidate.js';
import Idea from './models/Idea.js';
import Post from './models/Post.js';
import News from './models/News.js';

dotenv.config();

const connUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/digi_heart';

const seedDatabase = async () => {
  // Kiểm tra an toàn bảo mật môi trường Production
  if (process.env.NODE_ENV === 'production') {
    console.error('❌ CẢNH BÁO BẢO MẬT: Không được phép chạy script seed dữ liệu trên môi trường Production!');
    process.exit(1);
  }

  try {
    console.log(`Đang kết nối tới MongoDB để nạp dữ liệu mẫu: ${connUri}...`);
    await mongoose.connect(connUri);
    console.log('✅ Đã kết nối cơ sở dữ liệu.');

    // 1. Xóa dữ liệu cũ
    console.log('Đang dọn dẹp cơ sở dữ liệu cũ...');
    await User.deleteMany({});
    await Candidate.deleteMany({});
    await Idea.deleteMany({});
    await Post.deleteMany({});
    await News.deleteMany({});

    // 2. Tạo tài khoản Admin mặc định
    console.log('Đang tạo tài khoản Admin mặc định...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const defaultAdmin = new User({
      username: 'admin',
      password: hashedPassword,
      role: 'admin'
    });
    await defaultAdmin.save();
    console.log('✅ Tạo Admin thành công! (Tài khoản: admin / Mật khẩu: admin123)');

    // 3. Nạp danh sách ứng viên mẫu (Candidates) - Rỗng để đăng thực tế
    console.log('Đang nạp dữ liệu ứng viên mẫu...');
    const mockCandidates = [];
    await Candidate.insertMany(mockCandidates);
    console.log(`✅ Đã nạp thành công ${mockCandidates.length} ứng viên mẫu.`);

    // 4. Nạp danh sách ý tưởng sáng kiến mẫu (Ideas) - Rỗng để đăng thực tế
    console.log('Đang nạp dữ liệu ý tưởng mẫu...');
    const mockIdeas = [];
    await Idea.insertMany(mockIdeas);
    console.log(`✅ Đã nạp thành công ${mockIdeas.length} ý tưởng sáng kiến mẫu.`);

    // 5. Nạp danh sách bài viết Fanpage mẫu (Posts) - Rỗng để đăng thực tế
    console.log('Đang nạp dữ liệu bài đăng mẫu...');
    const mockPosts = [];
    await Post.insertMany(mockPosts);
    console.log(`✅ Đã nạp thành công ${mockPosts.length} bài đăng Fanpage mẫu.`);

    // 6. Nạp danh sách tin tức mẫu (News) - Rỗng để đăng thực tế
    console.log('Đang nạp dữ liệu tin tức mẫu...');
    const mockNews = [];
    await News.insertMany(mockNews);
    console.log(`✅ Đã nạp thành công ${mockNews.length} bài viết tin tức mẫu.`);

    console.log('🎉 TẤT CẢ DỮ LIỆU CŨ ĐÃ ĐƯỢC DỌN SẠCH. CHỈ CÒN LẠI TÀI KHOẢN ADMIN ĐỂ ĐĂNG THỰC TẾ!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi trong quá trình nạp dữ liệu (seed):', error);
    process.exit(1);
  }
};

seedDatabase();
