import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiCheckCircle, FiActivity, FiUser, FiCalendar, FiInbox, FiZap } from 'react-icons/fi';
import { ideaAPI } from '../utils/api';

/**
 * View Projects - Trang trưng bày các Dự án & Sáng kiến chuyển đổi số của CLB.
 * Kết nối dữ liệu MongoDB thông qua Backend API (hỗ trợ offline LocalStorage Fallback).
 */
export default function Projects() {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);

  // Lấy danh sách sáng kiến đã duyệt khi component mount
  useEffect(() => {
    const fetchIdeas = async () => {
      try {
        const data = await ideaAPI.getApproved();
        setIdeas(data);
      } catch (error) {
        console.error('Lỗi khi tải danh sách sáng kiến:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchIdeas();
  }, []);

  return (
    <div className="bg-gray-50 text-gray-800 min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Tiêu đề chính */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-black mb-4 text-gray-800">
            Dự Án & <span className="text-[#0054A6]">Sáng Kiến Số</span>
          </h1>
          <p className="text-gray-500 font-medium">
            Tổng hợp các giải pháp công nghệ, phần mềm tiện ích và các chiến dịch số hóa cộng đồng do lực lượng thanh niên MobiFone Cần Thơ làm nòng cốt.
          </p>
        </div>

        {/* Nội dung chính: Loading -> Empty -> List */}
        {loading ? (
          <div className="bg-white border border-gray-200 rounded-3xl p-16 text-center shadow-sm max-w-md mx-auto">
            <span className="inline-block w-8 h-8 border-4 border-[#0054A6] border-t-transparent rounded-full animate-spin"></span>
            <p className="text-gray-400 text-xs font-bold mt-4 uppercase">Đang tải danh sách sáng kiến...</p>
          </div>
        ) : ideas.length === 0 ? (
          <div className="text-center py-16 bg-white border border-gray-200 rounded-3xl p-8 max-w-xl mx-auto shadow-sm space-y-5 animate-fadeIn">
            <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto text-2xl shadow-inner">
              <FiInbox className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">Chưa có sáng kiến nào được công bố</h3>
            <p className="text-gray-500 text-sm max-w-sm mx-auto leading-relaxed">
              Các sáng kiến đột phá do đoàn viên đề xuất sau khi được Ban chấp hành phê duyệt và đưa vào áp dụng sẽ được trưng bày tại đây.
            </p>
            <div className="pt-2">
              <Link
                to="/contact"
                className="inline-flex items-center space-x-2 px-6 py-2.5 bg-[#0054A6] hover:bg-[#003d80] text-white font-bold rounded-xl shadow-md transition-all duration-300 hover:scale-105"
              >
                <FiZap className="w-4 h-4 text-amber-400 fill-amber-450" />
                <span>Gửi Sáng Kiến Của Bạn</span>
              </Link>
            </div>
          </div>
        ) : (
          /* Danh sách thẻ dự án */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {ideas.map((idea) => (
              <div
                key={idea._id || idea.id}
                className="bg-white border border-gray-200/80 rounded-2xl sm:rounded-3xl p-5 sm:p-8 hover:border-[#0054A6]/30 hover:shadow-xl transition-all duration-300 shadow-sm flex flex-col relative group overflow-hidden"
              >
                
                {/* Trang trí hiệu ứng ánh sáng mờ khi hover */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#0054A6]/5 rounded-full blur-2xl group-hover:bg-[#0054A6]/10 transition-all pointer-events-none"></div>
                
                {/* Trạng thái dự án */}
                <div className="flex items-center justify-between mb-6">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    idea.status === 'Đã áp dụng' ? 'bg-emerald-50 text-emerald-600 border-emerald-250' :
                    idea.status === 'Đang thử nghiệm' ? 'bg-blue-50 text-blue-500 border-blue-250' :
                    'bg-purple-50 text-purple-600 border-purple-250'
                  }`}>
                    {idea.status}
                  </span>
                  <FiActivity className="w-5 h-5 text-gray-400" />
                </div>

                {/* Tên và Mô tả */}
                <h3 className="text-xl md:text-2xl font-bold mb-4 text-gray-800 group-hover:text-[#0054A6] transition-colors leading-tight">
                  {idea.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-6 whitespace-pre-line">
                  {idea.description}
                </p>

                {/* Người đóng góp & Thời gian */}
                <div className="mt-auto border-t border-gray-100 pt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-400 font-bold uppercase tracking-wider">
                  <div className="flex items-center space-x-1.5">
                    <FiUser className="text-[#0054A6] w-4 h-4" />
                    <span>Đề xuất: <strong className="text-gray-700 normal-case">{idea.fullName}</strong></span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <FiCalendar className="w-4 h-4 text-gray-400" />
                    <span>Ngày gửi: <span className="text-gray-500">{idea.date}</span></span>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
