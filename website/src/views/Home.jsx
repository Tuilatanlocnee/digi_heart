import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiCpu, FiUsers, FiAward, FiArrowRight, FiBookOpen } from 'react-icons/fi';

/**
 * View Home - Trang chủ giới thiệu về CLB Digi Heart (Light Mode).
 */
export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    const token = localStorage.getItem('digiheart_admin_token');
    setIsLoggedIn(!!token);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  // Danh sách các mục tiêu hành động chính của CLB
  const keyObjectives = [
    {
      icon: <FiCpu className="w-8 h-8 text-[#0054A6]" />,
      title: 'Ứng dụng Công nghệ',
      description: 'Đẩy mạnh số hóa tài liệu, quy trình làm việc nội bộ của Đoàn Thanh niên và công tác sản xuất kinh doanh tại MobiFone.',
    },
    {
      icon: <FiUsers className="w-8 h-8 text-[#E30613]" />,
      title: 'Hỗ trợ Cộng đồng',
      description: 'Ra quân hướng dẫn người dân, khách hàng cài đặt và trải nghiệm các ứng dụng số như MobiFone Money, My MobiFone.',
    },
    {
      icon: <FiAward className="w-8 h-8 text-emerald-500" />,
      title: 'Nâng cao Kỹ năng',
      description: 'Tổ chức các buổi chia sẻ (workshop) nâng cao năng lực số, kỹ năng tin học văn phòng và công nghệ mới cho đoàn viên.',
    },
  ];

  return (
    <div className="bg-white text-gray-800 min-h-screen">
      
      {/* 🚀 Hero Section (Banner lớn phong cách mobifone.vn) */}
      <section className="relative overflow-hidden py-8 sm:py-12 md:py-16 bg-gradient-to-r from-[#002f6c] via-[#0054A6] to-[#002f6c] text-white">
        
        {/* Điểm nhấn vệt sáng công nghệ nhẹ nhàng */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-blue-400/20 rounded-full blur-3xl -z-10 pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/3 w-[200px] h-[200px] md:w-[400px] md:h-[400px] bg-red-400/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Nhãn nhỏ mang Slogan MobiFone */}
          <span className="inline-block px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-white/10 border border-white/20 text-[10px] sm:text-xs font-semibold text-blue-200 mb-3 md:mb-4 uppercase tracking-wider max-w-full truncate sm:overflow-visible">
            MobiFone Cần Thơ • Kết nối giá trị - Khơi dậy tiềm năng
          </span>
          
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold leading-tight tracking-tight mb-3 md:mb-4">
            Đoàn Thanh Niên <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent inline-block py-2 px-1 leading-normal">
              {"DIGI HEART - "}
            </span>
            <span className="bg-gradient-to-r from-[#ffd0d4] via-[#ff6b7b] to-[#e30613] bg-clip-text text-transparent inline-block py-2 px-1 leading-normal font-extrabold drop-shadow-[0_2px_8px_rgba(227,6,19,0.2)]">
              {"TRÁI TIM SỐ"}
            </span>
          </h1>

          {/* Slogan của CLB */}
          <div className="text-base sm:text-lg md:text-xl font-bold text-amber-300 mb-3 tracking-wide">
            Kết nối tri thức số – Dẫn lối tương lai
          </div>
          
          <p className="text-sm sm:text-base md:text-lg text-blue-100 max-w-3xl mx-auto mb-6 md:mb-8 leading-relaxed font-light px-2 sm:px-0">
            Nơi hội tụ thế hệ trẻ MobiFone Cần Thơ. Mỗi thành viên mang trong mình trái tim nhiệt huyết, tiên phong chuyển đổi số và lan tỏa kiến thức số đến cộng đồng.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-xs sm:max-w-none mx-auto">

            <Link
              to="/projects"
              className="w-full sm:w-auto px-6 sm:px-8 py-2.5 bg-white/10 border border-white/25 rounded-xl font-bold hover:bg-white/25 hover:border-white/40 transition-all duration-300 flex items-center justify-center space-x-2 text-white"
            >
              <FiBookOpen className="w-5 h-5 text-blue-300" />
              <span>Xem dự án số</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 📊 Section: Số liệu Thống kê Ấn tượng (Nền xám nhạt phẳng) */}
      <section className="py-8 sm:py-12 border-b border-gray-200 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center">
            
            <div className="p-4 sm:p-5 bg-white rounded-2xl border border-gray-200/60 shadow-sm">
              <span className="block text-2xl sm:text-3xl md:text-4xl font-black text-[#0054A6] mb-1">50+</span>
              <span className="text-[10px] sm:text-[11px] text-gray-500 uppercase tracking-wider font-bold block min-h-[32px] flex items-center justify-center">Thành viên nòng cốt</span>
            </div>

            <div className="p-4 sm:p-5 bg-white rounded-2xl border border-gray-200/60 shadow-sm">
              <span className="block text-2xl sm:text-3xl md:text-4xl font-black text-[#E30613] mb-1">15+</span>
              <span className="text-[10px] sm:text-[11px] text-gray-500 uppercase tracking-wider font-bold block min-h-[32px] flex items-center justify-center">Dự án & Sáng kiến</span>
            </div>

            <div className="p-4 sm:p-5 bg-white rounded-2xl border border-gray-200/60 shadow-sm">
              <span className="block text-2xl sm:text-3xl md:text-4xl font-black text-[#0054A6] mb-1">2000+</span>
              <span className="text-[10px] sm:text-[11px] text-gray-500 uppercase tracking-wider font-bold block min-h-[32px] flex items-center justify-center">Lượt hỗ trợ người dân</span>
            </div>

            <div className="p-4 sm:p-5 bg-white rounded-2xl border border-gray-200/60 shadow-sm">
              <span className="block text-2xl sm:text-3xl md:text-4xl font-black text-emerald-500 mb-1">100%</span>
              <span className="text-[10px] sm:text-[11px] text-gray-500 uppercase tracking-wider font-bold block min-h-[32px] flex items-center justify-center">Chỉ tiêu số hóa đạt</span>
            </div>

          </div>
        </div>
      </section>

      {/* 🎯 Section: Mục tiêu và Sứ mệnh (Nền trắng tinh) */}
      <section className="py-12 sm:py-20 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-4 text-gray-800">
              Chúng Tôi Làm Gì Tại <span className="text-[#0054A6]">Digi Heart?</span>
            </h2>
            <p className="text-gray-500 font-medium text-sm sm:text-base">
              Với phương châm &ldquo;Đoàn Thanh niên xung kích chuyển đổi số&rdquo;, CLB tập trung vào 3 trụ cột hoạt động cốt lõi sau.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
            {keyObjectives.map((obj, index) => (
              <div
                key={index}
                className="p-5 md:p-8 bg-gray-50 border border-gray-200/80 rounded-2xl md:rounded-3xl hover:bg-white hover:border-[#0054A6]/30 hover:shadow-xl transition-all duration-300 flex flex-row md:flex-col items-start md:items-center text-left md:text-center gap-4 md:gap-0 group"
              >
                <div className="p-3 bg-white border border-gray-200/80 rounded-xl md:rounded-2xl mb-0 md:mb-6 shadow-sm shrink-0 group-hover:scale-110 transition-transform duration-300">
                  {obj.icon}
                </div>
                <div className="flex-grow">
                  <h3 className="text-sm md:text-xl font-bold mb-1 md:mb-3 text-gray-800">{obj.title}</h3>
                  <p className="text-xs md:text-sm text-gray-500 leading-relaxed">{obj.description}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>



    </div>
  );
}
