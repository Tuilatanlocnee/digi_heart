import { useState } from 'react';
import { FiCalendar, FiUser, FiSearch, FiArrowLeft, FiTag } from 'react-icons/fi';

/**
 * View News - Trang hiển thị Tin tức & Sự kiện của CLB Digi Heart.
 */
export default function News() {
  // Bộ lọc danh mục đang được chọn
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  // Từ khóa tìm kiếm bài viết
  const [searchQuery, setSearchQuery] = useState('');
  // Bài viết đang được mở xem chi tiết (nếu null là đang ở màn hình danh sách)
  const [activePost, setActivePost] = useState(null);

  // Danh sách dữ liệu mẫu tin tức (Mock Data) mang đậm dấu ấn Đoàn MobiFone Cần Thơ
  const newsList = [
    {
      id: 1,
      title: 'Đoàn Thanh Niên MobiFone Cần Thơ ra quân hỗ trợ phổ cập MobiFone Money',
      summary: 'Hoạt động hỗ trợ người dân cài đặt và thanh toán không dùng tiền mặt tại các chợ truyền thống trên địa bàn thành phố Cần Thơ.',
      content: `Trong hai ngày cuối tuần qua, câu lạc bộ Chuyển đổi số Digi Heart phối hợp cùng Đoàn cơ sở MobiFone Cần Thơ đã triển khai chương trình ra quân “Kỳ nghỉ hồng số hóa”. Hơn 30 đoàn viên thanh niên đã trực tiếp đến các chợ truyền thống lớn tại quận Ninh Kiều và Cái Răng để hướng dẫn các tiểu thương cũng như người dân mở ví điện tử MobiFone Money, cách nạp tiền, chuyển khoản và thanh toán hóa đơn điện nước qua điện thoại.

Đây là hoạt động thiết thực nhằm thực hiện chương trình Chuyển đổi số quốc gia, đẩy mạnh thanh toán không dùng tiền mặt, đem lại sự thuận tiện và an toàn tối đa cho bà con trong hoạt động mua bán hàng ngày. Sau chiến dịch, đã có hơn 250 tài khoản ví điện tử được mở mới và kích hoạt thành công, nhận được sự hưởng ứng vô cùng nồng nhiệt từ người dân địa phương.`,
      category: 'Hoạt động Đoàn',
      date: '2026-05-20',
      author: 'Nguyễn Văn Nam',
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 2,
      title: 'Workshop số 02: Ứng dụng AI và ChatGPT hỗ trợ nâng cao hiệu suất làm việc văn phòng',
      summary: 'Khóa đào tạo nội bộ về cách ứng dụng các mô hình ngôn ngữ lớn (LLM) để soạn thảo văn bản, báo cáo và dịch thuật nhanh chóng.',
      content: `Nhằm nâng cao năng lực công nghệ cho đội ngũ cán bộ nhân viên trẻ, CLB Digi Heart đã tổ chức thành công buổi Workshop chuyên đề "Khai phá sức mạnh AI tại văn phòng". Buổi học đã thu hút sự tham gia của gần 40 cán bộ đoàn và đoàn viên ưu tú.

Tại buổi thảo luận, các diễn giả từ Ban Kỹ thuật của CLB đã hướng dẫn chi tiết cách viết prompt (câu lệnh) hiệu quả cho ChatGPT, Gemini để xử lý số liệu excel, lên ý tưởng chiến dịch truyền thông, và tóm tắt văn bản hành chính. Hoạt động này được Ban lãnh đạo MobiFone Cần Thơ đánh giá rất cao vì giúp tối ưu hóa thời gian xử lý công việc hành chính thường nhật lên đến 30%.`,
      category: 'Đào tạo',
      date: '2026-05-15',
      author: 'Lê Thị Mai',
      image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 3,
      title: 'Ra mắt Cẩm nang Chuyển đổi số dành cho Đoàn viên năm 2026',
      summary: 'Ấn phẩm số hóa đầu tay tổng hợp tất cả công cụ thiết yếu và hướng dẫn bảo mật thông tin trên môi trường mạng internet.',
      content: `Với mục tiêu giúp mỗi đoàn viên trở thành một tuyên truyền viên tích cực về công nghệ, CLB Digi Heart đã biên soạn và phát hành phiên bản số của "Cẩm nang Chuyển đổi số 2026". Ấn phẩm này được lưu hành dưới dạng mã QR code tiện lợi để mọi người dễ dàng quét và đọc trên smartphone.

Nội dung cẩm nang được thiết kế dưới dạng infographic trực quan sinh động, bao gồm các chủ đề nóng: Cách thiết lập mật khẩu 2 lớp bảo mật, nhận diện email/tin nhắn giả mạo lừa đảo, giới thiệu các app dịch vụ công trực tuyến và các công cụ thiết kế ấn phẩm truyền thông cơ bản bằng Canva.`,
      category: 'Cẩm nang số',
      date: '2026-05-10',
      author: 'Trần Minh Hoàng',
      image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 4,
      title: 'Đại hội CLB Digi Heart nhiệm kỳ mới: Xác định các mục tiêu cốt lõi',
      summary: 'Kế hoạch hành động cụ thể để ứng dụng tự động hóa quy trình (RPA) vào các nghiệp vụ tại MobiFone Cần Thơ.',
      content: `Vừa qua, câu lạc bộ Digi Heart đã tiến hành Đại hội tổng kết hoạt động năm qua và vạch ra chiến lược cho nhiệm kỳ mới. Với tinh thần học hỏi sáng tạo không ngừng, đại hội thống nhất sẽ đẩy mạnh triển khai nghiên cứu ứng dụng công nghệ RPA (Robotic Process Automation) vào việc cập nhật và đối soát báo cáo kinh doanh nội bộ.

Mục tiêu cụ thể được đặt ra là giảm thiểu 50% thao tác thủ công lặp đi lặp lại của nhân viên nghiệp vụ, hỗ trợ đắc lực cho MobiFone Cần Thơ trong quá trình vận hành bộ máy linh hoạt, hiệu quả hơn.`,
      category: 'Hoạt động Đoàn',
      date: '2026-05-05',
      author: 'Ban Truyền Thông',
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
    },
  ];

  // Danh mục tin tức để người dùng lựa chọn lọc bài viết
  const categories = ['Tất cả', 'Hoạt động Đoàn', 'Đào tạo', 'Cẩm nang số'];

  // Tiến hành lọc bài viết dựa trên Danh mục và Từ khóa tìm kiếm
  const filteredNews = newsList.filter((post) => {
    const matchesCategory = selectedCategory === 'Tất cả' || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          post.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // GIAO DIỆN XEM CHI TIẾT BÀI VIẾT
  if (activePost) {
    return (
      <div className="bg-gray-50 text-gray-800 min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4">
          
          <button
            onClick={() => setActivePost(null)}
            className="flex items-center space-x-2 text-[#0054A6] hover:text-[#003f7f] transition-colors mb-8 group font-semibold"
          >
            <FiArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>Quay lại danh sách tin tức</span>
          </button>

          <article className="bg-white border border-gray-200/80 rounded-3xl p-6 md:p-10 shadow-lg">
            <img
              src={activePost.image}
              alt={activePost.title}
              className="w-full h-64 md:h-[400px] object-cover rounded-2xl mb-8 shadow-sm"
            />

            <div className="flex flex-wrap items-center gap-4 text-xs md:text-sm text-gray-500 mb-6">
              <span className="px-3 py-1 rounded-full bg-blue-50 text-[#0054A6] border border-blue-100 flex items-center space-x-1 font-semibold">
                <FiTag className="w-3.5 h-3.5" />
                <span>{activePost.category}</span>
              </span>
              <span className="flex items-center space-x-1">
                <FiCalendar className="w-4 h-4 text-gray-400" />
                <span>{activePost.date}</span>
              </span>
              <span className="flex items-center space-x-1">
                <FiUser className="w-4 h-4 text-gray-400" />
                <span>Người viết: {activePost.author}</span>
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl md:text-4xl font-extrabold mb-6 leading-snug text-gray-800">
              {activePost.title}
            </h1>

            <div className="text-gray-655 leading-relaxed text-sm md:text-base space-y-6 whitespace-pre-line border-t border-gray-100 pt-6">
              {activePost.content}
            </div>
          </article>

        </div>
      </div>
    );
  }

  // GIAO DIỆN DANH SÁCH BÀI VIẾT
  return (
    <div className="bg-gray-50 text-gray-800 min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Tiêu đề trang */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-black mb-4 text-gray-800">
            Tin Tức & <span className="text-[#0054A6]">Sự Kiện</span>
          </h1>
          <p className="text-gray-500 font-medium">
            Cập nhật những tin tức mới nhất về các hoạt động hỗ trợ xã hội, các lớp đào tạo và cẩm nang công nghệ của Digi Heart tại Cần Thơ.
          </p>
        </div>

        {/* Thanh tìm kiếm và bộ lọc */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12 bg-white border border-gray-200/80 p-4 rounded-2xl shadow-sm">
          
          {/* Nhóm Bộ lọc Category */}
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all border ${
                  selectedCategory === cat
                    ? 'bg-[#0054A6] text-white border-[#0054A6] shadow-md shadow-blue-500/10'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-[#0054A6]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Ô Tìm kiếm */}
          <div className="relative w-full md:w-80">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm bài viết..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0054A6] focus:ring-1 focus:ring-[#0054A6] transition-all text-gray-800 placeholder-gray-400 shadow-inner"
            />
          </div>

        </div>

        {/* Danh sách bài viết dạng Grid */}
        {filteredNews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredNews.map((post) => (
              <div
                key={post.id}
                onClick={() => setActivePost(post)}
                className="bg-white border border-gray-200/80 rounded-2xl overflow-hidden hover:border-[#0054A6]/30 hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col h-full shadow-sm"
              >
                <div className="relative h-48 md:h-56 overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-4 left-4 px-2.5 py-1 rounded-md text-xs font-bold bg-[#0054A6] text-white shadow-sm">
                    {post.category}
                  </span>
                </div>
                
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-center space-x-1 text-xs text-gray-400 mb-3">
                    <FiCalendar className="w-3.5 h-3.5" />
                    <span>{post.date}</span>
                  </div>
                  
                  <h3 className="text-lg md:text-xl font-bold mb-3 text-gray-800 group-hover:text-[#0054A6] transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  
                  <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-3">
                    {post.summary}
                  </p>
                  
                  <span className="text-xs font-bold text-[#0054A6] mt-auto flex items-center space-x-1 group-hover:underline">
                    <span>Xem chi tiết bài viết</span>
                    <span>&rarr;</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white border border-dashed border-gray-200 rounded-2xl shadow-sm">
            <p className="text-gray-400">Không tìm thấy bài viết nào phù hợp với bộ lọc hoặc từ khóa.</p>
          </div>
        )}

      </div>
    </div>
  );
}
