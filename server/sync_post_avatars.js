import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Post from './models/Post.js';
import User from './models/User.js';

dotenv.config();

const connUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/digi_heart';

const syncPostAvatars = async () => {
  try {
    console.log(`Đang kết nối tới MongoDB: ${connUri}...`);
    await mongoose.connect(connUri);
    console.log('✅ Đã kết nối cơ sở dữ liệu.');

    const posts = await Post.find({});
    let updatedCount = 0;

    for (const post of posts) {
      // Tìm user có fullName trùng với tác giả bài đăng
      const user = await User.findOne({ fullName: post.author });
      if (user && user.avatar && post.avatar !== user.avatar) {
        post.avatar = user.avatar;
        await post.save();
        updatedCount++;
        console.log(`Đã đồng bộ avatar bài viết ${post._id} của tác giả "${post.author}".`);
      }
    }

    console.log(`✅ Quá trình hoàn tất! Đã đồng bộ avatar của ${updatedCount} bài viết.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi xử lý:', error);
    process.exit(1);
  }
};

syncPostAvatars();
