import { useState, useEffect } from 'react';
import { FiMapPin, FiPhone, FiMail, FiSend, FiZap } from 'react-icons/fi';
import { ideaAPI } from '../utils/api';

/**
 * View Contact - Trang liên hệ và gửi ý tưởng, sáng kiến chuyển đổi số cho CLB.
 * Kết nối dữ liệu MongoDB thông qua Backend API (hỗ trợ offline LocalStorage Fallback).
 */
export default function Contact() {
  // Trạng thái lưu trữ danh sách ý tưởng sáng tạo số đã gửi
  const [ideas, setIdeas] = useState([]);
  
  // Trạng thái nhập liệu cho form
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    title: '',
    description: ''
  });

  // Trạng thái hiện popup báo gửi thành công
  const [showSuccess, setShowSuccess] = useState(false);

  // 1. Tải danh sách ý tưởng khi khởi chạy trang
  const fetchIdeas = async () => {
    try {
      const data = await ideaAPI.getAll();
      setIdeas(data);
    } catch (error) {
      console.error('Không lấy được danh sách ý tưởng:', error);
    }
  };

  useEffect(() => {
    fetchIdeas();
  }, []);

  // 2. Xử lý khi Submit gửi ý tưởng
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.title || !formData.description) return;

    try {
      await ideaAPI.create({
        fullName: formData.fullName,
        email: formData.email,
        title: formData.title,
        description: formData.description
      });

      // Tải lại danh sách sáng kiến
      fetchIdeas();

      // Reset form
      setFormData({
        fullName: '',
        email: '',
        title: '',
        description: ''
      });
      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
      }, 4500);

    } catch (error) {
      console.error('Lỗi khi gửi sáng kiến:', error);
      alert('Không thể gửi sáng kiến số. Vui lòng thử lại!');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div className="bg-gray-50 text-gray-800 min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Tiêu đề */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-black mb-4 text-gray-800">
            Liên Hệ & <span className="text-[#0054A6]">Góp Ý Sáng Kiến</span>
          </h1>
          <p className="text-gray-500 font-medium">
            Bạn có ý tưởng cải tiến công việc hay sáng kiến số hóa nào cho MobiFone Cần Thơ? Hãy gửi ngay cho CLB Digi Heart!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Cột trái (5 phần): Thông tin liên hệ trực tiếp */}
          <div className="lg:col-span-5 space-y-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">MobiFone Cần Thơ</h2>
            <div className="bg-white border border-gray-200/80 p-6 rounded-2xl space-y-5 shadow-sm">
              
              <div className="flex items-start space-x-3.5">
                <FiMapPin className="text-[#0054A6] w-5 h-5 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-sm text-gray-800">Địa chỉ văn phòng</h4>
                  <p className="text-gray-500 text-xs mt-1 leading-relaxed">
                    Đoàn cơ sở Công ty Dịch vụ MobiFone Khu vực 9 <br />
                    Số 06 Hòa Bình, Phường An Hội, Quận Ninh Kiều, Thành phố Cần Thơ.
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3.5 border-t border-gray-100 pt-4">
                <FiPhone className="text-[#E30613] w-5 h-5 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-sm text-gray-800">Tổng đài hỗ trợ</h4>
                  <p className="text-gray-500 text-xs mt-0.5">1800 1090 (Hỗ trợ 24/7)</p>
                </div>
              </div>

              <div className="flex items-center space-x-3.5 border-t border-gray-100 pt-4">
                <FiMail className="text-[#0054A6] w-5 h-5 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-sm text-gray-800">Hộp thư điện tử</h4>
                  <p className="text-gray-500 text-xs mt-0.5">doanthanhnien.cantho@mobifone.vn</p>
                </div>
              </div>

            </div>

            {/* Trí tuệ tập thể */}
            <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-6 text-center shadow-sm">
              <FiZap className="w-10 h-10 text-amber-500 mx-auto mb-3 animate-bounce" />
              <p className="text-xs text-gray-500 leading-relaxed font-medium">
                &ldquo;Mỗi ý kiến đóng góp là một viên gạch xây dựng nên hệ sinh thái số vững chắc cho thanh niên MobiFone Cần Thơ.&rdquo;
              </p>
            </div>
          </div>

          {/* Cột phải (7 phần): Form gửi sáng kiến */}
          <div className="lg:col-span-7 bg-white border border-gray-200/80 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-lg">
            <h3 className="text-xl font-bold mb-6 flex items-center space-x-2 text-gray-800">
              <FiZap className="text-[#E30613]" />
              <span>Hộp thư Sáng tạo Số</span>
            </h3>

            {showSuccess && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-250 text-emerald-700 rounded-xl text-sm font-semibold animate-fadeIn">
                🚀 Cảm ơn bạn! Ý tưởng của bạn đã được lưu lại và gửi tới Hộp thư sáng tạo của Đoàn MobiFone Cần Thơ.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Họ và tên người đóng góp *</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#0054A6] focus:ring-1 focus:ring-[#0054A6] text-gray-800 placeholder-gray-400 shadow-inner"
                  placeholder="Nhập họ và tên..."
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Email nhận phản hồi (tùy chọn)</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#0054A6] focus:ring-1 focus:ring-[#0054A6] text-gray-800 placeholder-gray-400 shadow-inner"
                  placeholder="username@mobifone.vn"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Tên ý tưởng / Sáng kiến số hóa *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#0054A6] focus:ring-1 focus:ring-[#0054A6] text-gray-800 placeholder-gray-400 shadow-inner"
                  placeholder="Ví dụ: Tích hợp mã QR tra cứu cẩm nang tại sảnh tiếp khách..."
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Mô tả chi tiết giải pháp & Hiệu quả mong đợi *</label>
                <textarea
                  name="description"
                  rows="4"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-[#0054A6] focus:ring-1 focus:ring-[#0054A6] text-gray-800 placeholder-gray-400 resize-none shadow-inner"
                  placeholder="Mô tả cụ thể cách thức triển khai và lợi ích mang lại..."
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#E30613] hover:bg-[#c2050f] text-white font-bold rounded-xl text-sm transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg shadow-red-500/10"
              >
                <FiSend className="w-4 h-4" />
                <span>Gửi Ý Tưởng Chuyển Đổi Số</span>
              </button>
            </form>
          </div>

        </div>

        {/* 💡 Danh sách các ý tưởng số hóa đã ghi nhận */}
        <div className="mt-16 bg-white border border-gray-200/80 rounded-3xl p-6 shadow-sm">
          <h3 className="text-xl font-bold mb-4 flex items-center space-x-2 text-gray-800">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0054A6] animate-pulse"></span>
            <span>Các ý tưởng đã được tiếp nhận</span>
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="text-xs uppercase bg-gray-50 text-gray-700 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3">Người đóng góp</th>
                  <th className="px-4 py-3">Tên sáng kiến</th>
                  <th className="px-4 py-3 text-center">Tiến trình</th>
                  <th className="px-4 py-3">Ngày gửi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {ideas.map((idea) => {
                  const ideaId = idea._id || idea.id;
                  return (
                    <tr key={ideaId} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 font-bold text-gray-850">{idea.fullName}</td>
                      <td className="px-4 py-3 text-[#0054A6] font-semibold">{idea.title}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                          idea.status === 'Đã áp dụng' ? 'bg-emerald-50 text-emerald-600' :
                          idea.status === 'Đang thử nghiệm' ? 'bg-blue-50 text-blue-500' :
                          idea.status === 'Đã tiếp nhận' ? 'bg-purple-50 text-purple-600' :
                          'bg-amber-50 text-amber-600'
                        }`}>
                          {idea.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400">{idea.date}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
