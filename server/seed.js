import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Import các models
import User from './models/User.js';
import Candidate from './models/Candidate.js';
import Idea from './models/Idea.js';
import Post from './models/Post.js';

dotenv.config();

const connUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/digi_heart';

const seedDatabase = async () => {
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

    // 3. Nạp danh sách ứng viên mẫu (Candidates)
    console.log('Đang nạp dữ liệu ứng viên mẫu...');
    const mockCandidates = [
      {
        fullName: 'Phạm Minh Trí',
        email: 'tripm.cantho@mobifone.vn',
        phone: '0901234567',
        department: 'Phòng Kỹ thuật nghiệp vụ',
        targetBan: 'Ban Kỹ thuật Số',
        skills: 'Excel nâng cao, lập trình Python cơ bản',
        reason: 'Tôi muốn học hỏi thêm về tự động hóa báo cáo và ứng dụng AI vào công việc đối soát số liệu hàng ngày.',
        status: 'Đã duyệt',
        date: '2026-05-21'
      },
      {
        fullName: 'Nguyễn Kiều Trang',
        email: 'trangnk.cantho@mobifone.vn',
        phone: '0907654321',
        department: 'Phòng Khách hàng doanh nghiệp',
        targetBan: 'Ban Truyền thông Số',
        skills: 'Thiết kế Canva, biên tập nội dung, dựng video CapCut',
        reason: 'Đóng góp năng lực thiết kế để quảng bá hình ảnh các sản phẩm số của MobiFone Cần Thơ tới các đoàn viên trẻ.',
        status: 'Chờ duyệt',
        date: '2026-05-20'
      },
      {
        fullName: 'Vương Chí Cường',
        email: 'cuongvc.cantho@mobifone.vn',
        phone: '0939888999',
        department: 'Phòng Bán hàng & Chăm sóc khách hàng',
        targetBan: 'Ban Sự kiện & Phong trào',
        skills: 'MC, tổ chức team building, hoạt náo viên',
        reason: 'Tôi muốn tham gia các hoạt động cộng đồng, tổ chức các buổi ra quân cài đặt ứng dụng số MobiFone Money cho bà con.',
        status: 'Chờ duyệt',
        date: '2026-05-22'
      }
    ];
    await Candidate.insertMany(mockCandidates);
    console.log(`✅ Đã nạp thành công ${mockCandidates.length} ứng viên mẫu.`);

    // 4. Nạp danh sách ý tưởng sáng kiến mẫu (Ideas)
    console.log('Đang nạp dữ liệu ý tưởng mẫu...');
    const mockIdeas = [
      {
        fullName: 'Lê Hoàng Long',
        email: 'longlh.cantho@mobifone.vn',
        title: 'Tự động hóa đối soát thẻ nạp bằng Python',
        description: 'Xây dựng một script Python chạy tự động hàng ngày để so sánh file đối soát giao dịch thẻ nạp từ đối tác với hệ thống đối soát nội bộ của MobiFone, giảm thiểu 90% thời gian đối soát thủ công bằng Excel.',
        status: 'Đang thử nghiệm',
        date: '2026-05-22'
      },
      {
        fullName: 'Trần Thị Thuỷ',
        email: 'thuytt.cantho@mobifone.vn',
        title: 'Phát hành QR Code tài liệu sinh hoạt chi đoàn',
        description: 'Thay vì in ấn các tài liệu giấy cho các buổi họp Đoàn hàng tháng, sẽ tạo một trang lưu trữ tài liệu trên Drive và tạo mã QR dán tại phòng họp. Đoàn viên chỉ cần quét mã bằng điện thoại để xem tài liệu, tiết kiệm chi phí in ấn.',
        status: 'Đã áp dụng',
        date: '2026-05-19'
      },
      {
        fullName: 'Đỗ Hữu Nghĩa',
        email: 'nghiadh.cantho@mobifone.vn',
        title: 'Xây dựng chatbot Zalo hỗ trợ tra cứu cẩm nang nội bộ',
        description: 'Tích hợp một chatbot Zalo OA kết nối với cơ sở dữ liệu cẩm nang chuyển đổi số để nhân viên bán hàng có thể tra cứu nhanh các chính sách gói cước mới của MobiFone ngay trong lúc tư vấn cho khách hàng.',
        status: 'Chờ duyệt',
        date: '2026-05-22'
      }
    ];
    await Idea.insertMany(mockIdeas);
    console.log(`✅ Đã nạp thành công ${mockIdeas.length} ý tưởng sáng kiến mẫu.`);

    // 5. Nạp danh sách bài viết Fanpage mẫu (Posts)
    console.log('Đang nạp dữ liệu bài đăng mẫu...');
    const mockPosts = [
      {
        author: 'Ban Truyền Thông CLB',
        avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80',
        time: '2 giờ trước',
        content: 'Hôm nay CLB Digi Heart đã hoàn thành lắp đặt hệ thống mã QR thanh toán không dùng tiền mặt tại hơn 50 quầy hàng ở chợ Cần Thơ. Chúc mừng đội ngũ kỹ thuật và truyền thông đã làm việc hết mình! 🎉💪',
        image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80',
        likes: 24,
        comments: [
          { author: 'Nguyễn Minh Anh', text: 'Tuyệt vời quá các bạn ơi! Sáng kiến rất thiết thực.', date: '2026-05-22' },
          { author: 'Trần Văn Linh', text: 'Tuổi trẻ MobiFone Cần Thơ năng động quá!', date: '2026-05-22' }
        ]
      },
      {
        author: 'Ban Kỹ Thuật Số',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
        time: '1 ngày trước',
        content: 'Tin vui! Bản beta của app Quản lý Đoàn viên nội bộ đã chạy thử nghiệm thành công mà không phát sinh lỗi lớn. Cảm ơn các thành viên core team đã thức đêm fix bug nhé. 🚀🔥',
        image: 'https://images.unsplash.com/photo-1600132806370-bf17e65e942f?auto=format&fit=crop&w=800&q=80',
        likes: 18,
        comments: [
          { author: 'Lê Thu Thảo', text: 'Hóng bản chính thức để áp dụng cho chi đoàn mình.', date: '2026-05-21' }
        ]
      }
    ];
    await Post.insertMany(mockPosts);
    console.log(`✅ Đã nạp thành công ${mockPosts.length} bài đăng Fanpage mẫu.`);

    console.log('🎉 TẤT CẢ DỮ LIỆU ĐÃ ĐƯỢC NẠP THÀNH CÔNG VÀO MONGODB!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi trong quá trình nạp dữ liệu (seed):', error);
    process.exit(1);
  }
};

seedDatabase();
