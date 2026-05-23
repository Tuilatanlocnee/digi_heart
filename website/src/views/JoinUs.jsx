import { useState, useEffect } from 'react';
import { FiUserCheck, FiCpu, FiMessageSquare, FiCompass, FiAward } from 'react-icons/fi';
import { candidateAPI } from '../utils/api';

/**
 * View JoinUs - Trang giới thiệu ban bộ và biểu mẫu đăng ký tham gia CLB Digi Heart.
 * Kết nối dữ liệu MongoDB thông qua Backend API (hỗ trợ offline LocalStorage Fallback).
 */
export default function JoinUs() {
  // Trạng thái lưu trữ danh sách các thành viên đăng ký ứng tuyển
  const [candidates, setCandidates] = useState([]);
  
  // Trạng thái cho biểu mẫu nhập liệu
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    department: '',
    targetBan: 'Ban Kỹ thuật Số',
    skills: '',
    reason: ''
  });

  // Trạng thái hiển thị thông báo gửi thành công
  const [showSuccess, setShowSuccess] = useState(false);

  // 1. Tải danh sách ứng viên khi khởi chạy trang
  const fetchCandidates = async () => {
    try {
      const data = await candidateAPI.getAll();
      setCandidates(data);
    } catch (error) {
      console.error('Không lấy được danh sách ứng viên:', error);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  // 2. Xử lý khi Submit form đăng ký
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.phone) return;

    try {
      await candidateAPI.create({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        department: formData.department || 'Đoàn viên tự do',
        targetBan: formData.targetBan,
        skills: formData.skills,
        reason: formData.reason
      });

      // Cập nhật lại danh sách hiển thị
      fetchCandidates();

      // Reset biểu mẫu và hiện thông báo
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        department: '',
        targetBan: 'Ban Kỹ thuật Số',
        skills: '',
        reason: ''
      });
      setShowSuccess(true);
      
      // Tự động tắt thông báo thành công sau 4 giây
      setTimeout(() => {
        setShowSuccess(false);
      }, 4000);

    } catch (error) {
      console.error('Lỗi khi gửi đăng ký ứng tuyển:', error);
      alert('Gửi đăng ký không thành công. Vui lòng thử lại!');
    }
  };

  // Thay đổi dữ liệu trong form khi người dùng nhập
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Thông tin giới thiệu về 3 ban hoạt động của câu lạc bộ
  const banInfo = [
    {
      icon: <FiCpu className="w-6 h-6 text-[#0054A6]" />,
      name: 'Ban Kỹ thuật Số',
      description: 'Chịu trách nhiệm nghiên cứu công cụ AI, lập trình ứng dụng nội bộ, tự động hóa biểu mẫu excel và số hóa cơ sở dữ liệu.'
    },
    {
      icon: <FiMessageSquare className="w-6 h-6 text-[#E30613]" />,
      name: 'Ban Truyền thông Số',
      description: 'Thiết kế ấn phẩm, biên tập nội dung cẩm nang chuyển đổi số, quay dựng video ngắn truyền thông các chương trình của Đoàn.'
    },
    {
      icon: <FiCompass className="w-6 h-6 text-emerald-500" />,
      name: 'Ban Sự kiện & Phong trào',
      description: 'Tổ chức các buổi workshop công nghệ, các đợt ra quân hỗ trợ cài đặt ví điện tử và mở rộng mạng lưới chuyển đổi số đến các địa bàn.'
    }
  ];

  return (
    <div className="bg-gray-50 text-gray-800 min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Tiêu đề */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-black mb-4 text-gray-800">
            Đăng Ký <span className="text-[#0054A6]">Gia Nhập CLB</span>
          </h1>
          <p className="text-gray-500 font-medium">
            Hãy cùng Digi Heart hiện thực hóa các ý tưởng sáng tạo và nâng tầm kỹ năng công nghệ trong thời đại số.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Cột trái (5 phần): Giới thiệu cơ cấu Ban bộ */}
          <div className="lg:col-span-5 space-y-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center space-x-2 text-gray-800">
              <FiCompass className="text-[#0054A6]" />
              <span>Lựa chọn Ban Hoạt động</span>
            </h2>
            <div className="space-y-4">
              {banInfo.map((ban, idx) => (
                <div key={idx} className="bg-white border border-gray-200/80 p-5 rounded-2xl flex items-start space-x-4 shadow-sm">
                  <div className="p-3 bg-blue-50/50 rounded-xl flex-shrink-0">
                    {ban.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-md mb-1.5 text-gray-800">{ban.name}</h3>
                    <p className="text-gray-500 text-xs leading-relaxed">{ban.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Quyền lợi thành viên */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-50/30 border border-blue-100 rounded-2xl p-6">
              <h3 className="font-bold text-md mb-3 flex items-center space-x-1.5 text-gray-800">
                <FiAward className="text-[#E30613]" />
                <span>Quyền lợi khi tham gia</span>
              </h3>
              <ul className="text-xs text-gray-600 space-y-2 list-disc list-inside">
                <li>Đào tạo chuyên sâu về AI, Chatbot, Canva, CapCut...</li>
                <li>Đóng góp trực tiếp vào đề án số hóa của MobiFone Cần Thơ.</li>
                <li>Nhận chứng nhận hoạt động xuất sắc từ Đoàn cơ sở.</li>
              </ul>
            </div>
          </div>

          {/* Cột phải (7 phần): Form Đăng ký ứng tuyển */}
          <div className="lg:col-span-7 bg-white border border-gray-200/80 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-lg relative">
            
            {showSuccess && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-250 text-emerald-700 rounded-xl text-sm font-semibold animate-fadeIn">
                🎉 Đăng ký thành công! Thông tin của bạn đã được ghi nhận trên hệ thống và chuyển đến ban chủ nhiệm CLB.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Họ và tên *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#0054A6] focus:ring-1 focus:ring-[#0054A6] text-gray-800 placeholder-gray-400 shadow-inner"
                    placeholder="Nguyễn Văn A"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Bộ phận công tác *</label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#0054A6] focus:ring-1 focus:ring-[#0054A6] text-gray-800 placeholder-gray-400 shadow-inner"
                    placeholder="MobiFone Quận Ninh Kiều"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Email liên hệ *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#0054A6] focus:ring-1 focus:ring-[#0054A6] text-gray-800 placeholder-gray-400 shadow-inner"
                    placeholder="email@mobifone.vn"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Số điện thoại *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#0054A6] focus:ring-1 focus:ring-[#0054A6] text-gray-800 placeholder-gray-400 shadow-inner"
                    placeholder="090xxxxxxx"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Ban muốn gia nhập</label>
                <select
                  name="targetBan"
                  value={formData.targetBan}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#0054A6] focus:ring-1 focus:ring-[#0054A6] text-gray-800"
                >
                  <option value="Ban Kỹ thuật Số">Ban Kỹ thuật Số</option>
                  <option value="Ban Truyền thông Số">Ban Truyền thông Số</option>
                  <option value="Ban Sự kiện & Phong trào">Ban Sự kiện & Phong trào</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Kỹ năng công nghệ & sở trường</label>
                <input
                  type="text"
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#0054A6] focus:ring-1 focus:ring-[#0054A6] text-gray-800 placeholder-gray-400 shadow-inner"
                  placeholder="Lập trình web, thiết kế Canva, tổ chức trò chơi, chỉnh sửa video..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Tại sao bạn muốn gia nhập Digi Heart? *</label>
                <textarea
                  name="reason"
                  rows="3"
                  value={formData.reason}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-[#0054A6] focus:ring-1 focus:ring-[#0054A6] text-gray-800 placeholder-gray-400 resize-none shadow-inner"
                  placeholder="Chia sẻ lý do và mong muốn đóng góp của bạn..."
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#E30613] hover:bg-[#c2050f] text-white font-bold rounded-xl text-sm transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg shadow-red-500/10"
              >
                <FiUserCheck className="w-5 h-5" />
                <span>Gửi Đăng Ký Gia Nhập</span>
              </button>
            </form>
          </div>

        </div>

        {/* 📋 Danh sách Ứng viên mới đăng ký */}
        <div className="mt-16 bg-white border border-gray-200/80 rounded-3xl p-6 shadow-sm">
          <h3 className="text-xl font-bold mb-4 flex items-center space-x-2 text-gray-800">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            <span>Danh sách đăng ký gần đây</span>
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="text-xs uppercase bg-gray-50 text-gray-700 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3">Họ và tên</th>
                  <th className="px-4 py-3">Nơi công tác</th>
                  <th className="px-4 py-3">Ban đăng ký</th>
                  <th className="px-4 py-3 text-center">Trạng thái</th>
                  <th className="px-4 py-3">Ngày đăng ký</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {candidates.map((cand) => {
                  const candId = cand._id || cand.id;
                  return (
                    <tr key={candId} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 font-bold text-gray-850">{cand.fullName}</td>
                      <td className="px-4 py-3">{cand.department}</td>
                      <td className="px-4 py-3 text-[#0054A6] font-semibold">{cand.targetBan}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                          cand.status === 'Đã duyệt' ? 'bg-emerald-50 text-emerald-600' :
                          cand.status === 'Từ chối' ? 'bg-red-50 text-red-500' :
                          'bg-amber-50 text-amber-600'
                        }`}>
                          {cand.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400">{cand.date}</td>
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
