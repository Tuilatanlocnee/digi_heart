import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Post from './models/Post.js';
import User from './models/User.js';

dotenv.config();

const connUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/digi_heart';

const fixAuthors = async () => {
  try {
    console.log(`Đang kết nối tới MongoDB: ${connUri}...`);
    await mongoose.connect(connUri);
    console.log('✅ Đã kết nối cơ sở dữ liệu.');

    // 1. Kiểm tra tài khoản user 0931891832
    const testUser = await User.findOne({ username: '0931891832' });
    if (testUser) {
      console.log('=== THÔNG TIN USER TÌM THẤY ===');
      console.log(`ID: ${testUser._id}`);
      console.log(`Username (SĐT): ${testUser.username}`);
      console.log(`fullName trong DB: "${testUser.fullName}"`);
      console.log(`role: ${testUser.role}`);
      console.log(`avatar: "${testUser.avatar}"`);
      console.log('================================');
      
      // Nếu fullName trống hoặc là số điện thoại, hãy thử cập nhật lại tên thật từ Candidate nếu có
      if (!testUser.fullName || testUser.fullName === 'Thành viên CLB' || testUser.fullName === testUser.username) {
        console.log('fullName trống hoặc chưa đúng, đang tìm kiếm từ Candidate...');
        // Import động Candidate model để tìm
        const Candidate = mongoose.model('Candidate');
        const cand = await Candidate.findOne({ phone: '0931891832' });
        if (cand && cand.fullName) {
          testUser.fullName = cand.fullName;
          if (cand.avatar && !testUser.avatar) {
            testUser.avatar = cand.avatar;
          }
          await testUser.save();
          console.log(`✅ Đã cập nhật fullName của User thành "${cand.fullName}"`);
        } else {
          // Fallback nếu không có candidate
          testUser.fullName = 'Huỳnh Tấn Lộc';
          await testUser.save();
          console.log('✅ Fallback: Đã cập nhật fullName thành "Huỳnh Tấn Lộc"');
        }
      }
    } else {
      console.log('❌ Không tìm thấy user 0931891832 trong cơ sở dữ liệu!');
    }

    // 2. Quét và cập nhật tác giả các bài viết cũ có author là số điện thoại
    const posts = await Post.find({});
    let updatedCount = 0;

    for (const post of posts) {
      // Kiểm tra xem tác giả có phải là số điện thoại (chỉ gồm các chữ số, từ 8-11 ký tự)
      if (/^\d{8,11}$/.test(post.author)) {
        const user = await User.findOne({ username: post.author });
        if (user) {
          post.author = user.fullName;
          if (user.avatar) {
            post.avatar = user.avatar;
          }
          await post.save();
          updatedCount++;
          console.log(`Cập nhật bài viết ${post._id}: "${user.username}" -> "${user.fullName}"`);
        } else {
          // Nếu không tìm thấy user, đặt tên mặc định là Huỳnh Tấn Lộc hoặc Thành viên CLB
          post.author = 'Huỳnh Tấn Lộc';
          await post.save();
          updatedCount++;
          console.log(`Cập nhật bài viết ${post._id} (Không tìm thấy user): đặt mặc định -> "Huỳnh Tấn Lộc"`);
        }
      }
    }

    console.log(`\n✅ Quá trình hoàn tất! Đã sửa đổi ${updatedCount} bài viết.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi xử lý:', error);
    process.exit(1);
  }
};

fixAuthors();
