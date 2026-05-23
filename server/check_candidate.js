import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Candidate from './models/Candidate.js';
import User from './models/User.js';

dotenv.config();

const connUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/digi_heart';

const checkCandidate = async () => {
  try {
    console.log(`Đang kết nối tới MongoDB: ${connUri}...`);
    await mongoose.connect(connUri);
    console.log('✅ Đã kết nối cơ sở dữ liệu.');

    const phone = '0931891832';
    const cand = await Candidate.findOne({ phone });

    if (cand) {
      console.log('=== CANDIDATE TÌM THẤY ===');
      console.log(`ID: ${cand._id}`);
      console.log(`Họ tên: ${cand.fullName}`);
      console.log(`SĐT: ${cand.phone}`);
      console.log(`Trạng thái: ${cand.status}`);
      console.log(`Avatar: "${cand.avatar}"`);
      console.log('===========================');
    } else {
      console.log('❌ Không tìm thấy hồ sơ Candidate cho SĐT 0931891832!');
      
      // Tạo Candidate tương ứng từ thông tin User
      const user = await User.findOne({ username: phone });
      if (user) {
        console.log(`Đang tạo Candidate mới cho user ${user.fullName}...`);
        const newCand = new Candidate({
          fullName: user.fullName || 'Huỳnh Tấn Lộc',
          email: `${phone}@mobifone.vn`,
          phone: phone,
          department: 'Phòng Kỹ thuật nghiệp vụ',
          targetBan: 'Ban Kỹ thuật Số',
          skills: 'IT, React, Node.js',
          reason: 'Tham gia CLB Chuyển đổi số Digi Heart.',
          status: 'Đã duyệt',
          avatar: user.avatar || ''
        });
        await newCand.save();
        console.log('✅ Đã tạo và duyệt hồ sơ Candidate thành công!');
      } else {
        console.log('❌ Không tìm thấy User tương ứng để tạo Candidate!');
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi xử lý:', error);
    process.exit(1);
  }
};

checkCandidate();
