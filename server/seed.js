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

    // 3. Nạp danh sách ứng viên mẫu (Candidates)
    console.log('Đang nạp dữ liệu ứng viên mẫu...');
    const mockCandidates = [];
    await Candidate.insertMany(mockCandidates);
    console.log(`✅ Đã nạp thành công ${mockCandidates.length} ứng viên mẫu.`);

    // 4. Nạp danh sách ý tưởng sáng kiến mẫu (Ideas)
    console.log('Đang nạp dữ liệu ý tưởng mẫu...');
    const mockIdeas = [];
    await Idea.insertMany(mockIdeas);
    console.log(`✅ Đã nạp thành công ${mockIdeas.length} ý tưởng sáng kiến mẫu.`);

    // 5. Nạp danh sách bài viết Fanpage mẫu (Posts) - Chứa các mốc thời gian khác nhau
    console.log('Đang nạp dữ liệu bài đăng mẫu...');
    const mockPosts = [
      {
        title: 'Chào mừng ra mắt Fanpage CLB Chuyển đổi số Digi Heart',
        author: 'Ban Quản Trị CLB',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
        time: '2026-05-25',
        content: '🎉 Chào mừng các bạn đến với Fanpage chính thức của CLB Chuyển đổi số Digi Heart MobiFone Cần Thơ! Hãy cùng nhau kết nối tri thức số, dẫn lối tương lai. Đừng ngần ngại đăng các ý kiến đóng góp hoặc bài viết chia sẻ công nghệ của bạn tại đây nhé! 💻✨',
        image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
        likes: 12,
        likedBy: ['guest_1', 'guest_2'],
        comments: [
          { author: 'Huỳnh Tấn Lộc', text: 'Tuyệt vời quá! Chúc CLB ngày càng phát triển!' },
          { author: 'Nguyễn Văn Nam', text: 'Kết nối tri thức số – Dẫn lối tương lai!' }
        ],
        createdAt: new Date('2026-05-25T08:00:00.000Z')
      },
      {
        title: 'Chiến dịch Kỳ nghỉ hồng: Hướng dẫn sử dụng MobiFone Money tại Chợ Ninh Kiều',
        author: 'Lê Thị Mai',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
        time: '2026-05-18',
        content: 'Hôm nay CLB Digi Heart đã hoàn thành buổi hướng dẫn cài đặt và sử dụng ứng dụng thanh toán không dùng tiền mặt MobiFone Money cho bà con tiểu thương tại Chợ Ninh Kiều. Tinh thần của các bạn đoàn viên vô cùng nhiệt huyết! ❤️',
        image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80',
        likes: 8,
        likedBy: ['guest_3'],
        comments: [
          { author: 'Ban Quản Trị CLB', text: 'Cảm ơn sự đóng góp tích cực của đồng chí Mai!' }
        ],
        createdAt: new Date('2026-05-18T14:30:00.000Z')
      },
      {
        title: 'Workshop số 02: Ứng dụng AI và ChatGPT nâng cao hiệu suất làm việc văn phòng',
        author: 'Nguyễn Văn Nam',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
        time: '2026-04-22',
        content: '🤖 Workshop chia sẻ kiến thức về ứng dụng Trí tuệ nhân tạo (AI) trong soạn thảo văn bản hành chính đã diễn ra vô cùng sôi nổi. Rất nhiều mẹo viết prompt hay đã được chia sẻ. Cảm ơn mọi người đã tham gia nhiệt tình!',
        image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80',
        likes: 15,
        likedBy: [],
        comments: [],
        createdAt: new Date('2026-04-22T09:15:00.000Z')
      },
      {
        title: 'Phát hành Cẩm nang Chuyển đổi số dành cho Đoàn viên năm 2026',
        author: 'Trần Minh Hoàng',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
        time: '2026-04-05',
        content: 'Các bạn đã quét mã QR để tải "Cẩm nang Chuyển đổi số dành cho Đoàn viên năm 2026" chưa? Rất nhiều kiến thức bổ ích về an toàn thông tin và các công cụ thiết kế cơ bản trên đó nhé! 🛡️🛡️',
        image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
        likes: 5,
        likedBy: [],
        comments: [],
        createdAt: new Date('2026-04-05T10:00:00.000Z')
      },
      {
        title: 'Chào mừng Kỷ niệm 95 năm ngày thành lập Đoàn TNCS Hồ Chí Minh',
        author: 'Ban Quản Trị CLB',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
        time: '2026-03-26',
        content: 'Chúc mừng Kỷ niệm 95 năm Ngày thành lập Đoàn TNCS Hồ Chí Minh (26/3/1931 - 26/3/2026)! CLB Digi Heart quyết tâm mang sức trẻ, trí tuệ số đóng góp vào sự phát triển chung của MobiFone Cần Thơ! 🇻🇳✨',
        image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
        likes: 25,
        likedBy: [],
        comments: [],
        createdAt: new Date('2026-03-26T07:30:00.000Z')
      }
    ];
    await Post.insertMany(mockPosts);
    console.log(`✅ Đã nạp thành công ${mockPosts.length} bài đăng Fanpage mẫu.`);

    // 6. Nạp danh sách tin tức mẫu (News)
    console.log('Đang nạp dữ liệu tin tức mẫu...');
    const mockNews = [
      {
        title: 'Đoàn Thanh Niên MobiFone Cần Thơ ra quân hỗ trợ phổ cập MobiFone Money',
        summary: 'Hoạt động hỗ trợ người dân cài đặt và thanh toán không dùng tiền mặt tại các chợ truyền thống trên địa bàn thành phố Cần Thơ.',
        content: `Trong hai ngày cuối tuần qua, câu lạc bộ Chuyển đổi số Digi Heart phối hợp cùng Đoàn cơ sở MobiFone Cần Thơ đã triển khai chương trình ra quân “Kỳ nghỉ hồng số hóa”. Hơn 30 đoàn viên thanh niên đã trực tiếp đến các chợ truyền thống lớn tại quận Ninh Kiều và Cái Răng để hướng dẫn các tiểu thương cũng như người dân mở ví điện tử MobiFone Money, cách nạp tiền, chuyển khoản và thanh toán hóa đơn điện nước qua điện thoại.

Đây là hoạt động thiết thực nhằm thực hiện chương trình Chuyển đổi số quốc gia, đẩy mạnh thanh toán không dùng tiền mặt, đem lại sự thuận tiện và an toàn tối đa cho bà con trong hoạt động mua bán hàng ngày. Sau chiến dịch, đã có hơn 250 tài khoản ví điện tử được mở mới và kích hoạt thành công, nhận được sự hưởng ứng vô cùng nồng nhiệt từ người dân địa phương.`,
        category: 'Hoạt động Đoàn',
        date: '2026-05-20',
        author: 'Nguyễn Văn Nam',
        image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80'
      },
      {
        title: 'Workshop số 02: Ứng dụng AI và ChatGPT hỗ trợ nâng cao hiệu suất làm việc văn phòng',
        summary: 'Khóa đào tạo nội bộ về cách ứng dụng các mô hình ngôn ngữ lớn (LLM) để soạn thảo văn bản, báo cáo và dịch thuật nhanh chóng.',
        content: `Nhằm nâng cao năng lực công nghệ cho đội ngũ cán bộ nhân viên trẻ, CLB Digi Heart đã tổ chức thành công buổi Workshop chuyên đề "Khai phá sức mạnh AI tại văn phòng". Buổi học đã thu hút sự tham gia của gần 40 cán bộ đoàn và đoàn viên ưu tú.

Tại buổi thảo luận, các diễn giả từ Ban Kỹ thuật của CLB đã hướng dẫn chi tiết cách viết prompt (câu lệnh) hiệu quả cho ChatGPT, Gemini để xử lý số liệu excel, lên ý tưởng chiến dịch truyền thông, và tóm tắt văn bản hành chính. Hoạt động này được Ban lãnh đạo MobiFone Cần Thơ đánh giá rất cao vì giúp tối ưu hóa thời gian xử lý công việc hành chính thường nhật lên đến 30%.`,
        category: 'Đào tạo',
        date: '2026-05-15',
        author: 'Lê Thị Mai',
        image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80'
      },
      {
        title: 'Ra mắt Cẩm nang Chuyển đổi số dành cho Đoàn viên năm 2026',
        summary: 'Ấn phẩm số hóa đầu tay tổng hợp tất cả công cụ thiết yếu và hướng dẫn bảo mật thông tin trên môi trường mạng internet.',
        content: `Với mục tiêu giúp mỗi đoàn viên trở thành một tuyên truyền viên tích cực về công nghệ, CLB Digi Heart đã biên soạn và phát hành phiên bản số của "Cẩm nang Chuyển đổi số 2026". Ấn phẩm này được lưu hành dưới dạng mã QR code tiện lợi để mọi người dễ dàng quét và đọc trên smartphone.

Nội dung cẩm nang được thiết kế dưới dạng infographic trực quan sinh động, bao gồm các chủ đề nóng: Cách thiết lập mật khẩu 2 lớp bảo mật, nhận diện email/tin nhắn giả mạo lừa đảo, giới thiệu các app dịch vụ công trực tuyến và các công cụ thiết kế ấn phẩm truyền thông cơ bản bằng Canva.`,
        category: 'Cẩm nang số',
        date: '2026-05-10',
        author: 'Trần Minh Hoàng',
        image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80'
      },
      {
        title: 'Đại hội CLB Digi Heart nhiệm kỳ mới: Xác định các mục tiêu cốt lõi',
        summary: 'Kế hoạch hành động cụ thể để ứng dụng tự động hóa quy trình (RPA) vào các nghiệp vụ tại MobiFone Cần Thơ.',
        content: `Vừa qua, câu lạc bộ Digi Heart đã tiến hành Đại hội tổng kết hoạt động năm qua và vạch ra chiến lược cho nhiệm kỳ mới. Với tinh thần học hỏi sáng tạo không ngừng, đại hội thống nhất sẽ đẩy mạnh triển khai nghiên cứu ứng dụng công nghệ RPA (Robotic Process Automation) vào việc cập nhật và đối soát báo cáo kinh doanh nội bộ.

Mục tiêu cụ thể được đặt ra là giảm thiểu 50% thao tác thủ công lặp đi lặp lại của nhân viên nghiệp vụ, hỗ trợ đắc lực cho MobiFone Cần Thơ trong quá trình vận hành bộ máy linh hoạt, hiệu quả hơn.`,
        category: 'Hoạt động Đoàn',
        date: '2026-05-05',
        author: 'Ban Truyền Thông',
        image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80'
      }
    ];
    await News.insertMany(mockNews);
    console.log(`✅ Đã nạp thành công ${mockNews.length} bài viết tin tức mẫu.`);


    console.log('🎉 TẤT CẢ DỮ LIỆU ĐÃ ĐƯỢC NẠP THÀNH CÔNG VÀO MONGODB!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi trong quá trình nạp dữ liệu (seed):', error);
    process.exit(1);
  }
};

seedDatabase();
