import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Post from './models/Post.js';

dotenv.config();

const connUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/digi_heart';

const cleanDefaultPosts = async () => {
  try {
    console.log(`Đang kết nối tới MongoDB để dọn dẹp bài đăng mẫu: ${connUri}...`);
    await mongoose.connect(connUri);
    console.log('✅ Đã kết nối cơ sở dữ liệu.');

    // Xóa các bài viết do seed tạo ra
    const result = await Post.deleteMany({
      author: { $in: ['Ban Truyền Thông CLB', 'Ban Kỹ Thuật Số'] }
    });

    console.log(`✅ Đã xóa thành công ${result.deletedCount} bài đăng mặc định khỏi database.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi dọn dẹp bài đăng mặc định:', error);
    process.exit(1);
  }
};

cleanDefaultPosts();
