import { useState } from 'react';
import { FiSend, FiCheckCircle, FiUser, FiMail, FiPhone, FiLayers, FiCheck } from 'react-icons/fi';
import { candidateAPI } from '../utils/api';

/**
 * View JoinUs - Trang đăng ký gia nhập CLB Chuyển đổi số Digi Heart.
 * Kết nối dữ liệu với Backend thông qua candidateAPI.
 */
export default function JoinUs() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    department: '',
    targetBan: 'Ban Kỹ thuật Số',
    skills: '',
    reason: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess(false);

    try {
      await candidateAPI.create(formData);
      setSuccess(true);
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        department: '',
        targetBan: 'Ban Kỹ thuật Số',
        skills: '',
        reason: ''
      });
    } catch (err) {
      setError(err.message || 'Gửi đăng ký thất bại, vui lòng kiểm tra lại kết nối!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 text-gray-800 py-10 md:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Tiêu đề trang */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
          <h1 className="text-xl sm:text-3xl md:text-4xl font-black mb-4 text-gray-800">
            Đăng Ký Gia Nhập <span className="text-[#0054A6]">Digi Heart</span>
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-gray-500 font-medium">
            Hãy cùng chúng tôi tiên phong hành động, kiến tạo các giá trị số và lan tỏa tinh thần nhiệt huyết của thanh niên MobiFone Cần Thơ.
          </p>
        </div>

        <div className="bg-white border border-gray-200/80 rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10 shadow-lg relative overflow-hidden">
          {/* Vệt sáng thương hiệu */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#0054A6] via-[#E30613] to-[#0054A6]"></div>

          {success ? (
            <div className="text-center py-10 sm:py-16 space-y-6 animate-fadeIn">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto text-3xl shadow-inner border border-emerald-100">
                <FiCheckCircle className="w-10 h-10" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-gray-800">🎉 Đăng Ký Thành Công!</h2>
              <p className="text-gray-500 text-xs sm:text-sm max-w-md mx-auto leading-relaxed font-medium">
                Hồ sơ ứng tuyển gia nhập CLB của bạn đã được gửi thành công đến hệ thống. 
                Ban chủ nhiệm CLB Digi Heart sẽ xem xét và liên hệ với bạn qua Số điện thoại / Email trong thời gian sớm nhất.
              </p>
              <div className="pt-4">
                <button
                  onClick={() => setSuccess(false)}
                  className="px-6 py-2.5 bg-[#0054A6] hover:bg-[#003d80] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-colors"
                >
                  Gửi thêm đăng ký mới
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
              
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold flex items-center space-x-2 animate-shake">
                  <span className="w-2 h-2 rounded-full bg-red-650 shrink-0"></span>
                  <span>{error}</span>
                </div>
              )}

              {/* Thông tin cá nhân */}
              <div className="space-y-4 sm:space-y-5">
                <h3 className="text-sm sm:text-base font-black text-gray-800 border-b border-gray-100 pb-2 flex items-center space-x-2">
                  <FiUser className="text-[#0054A6] w-4 h-4 shrink-0" />
                  <span>Thông tin cá nhân ứng viên</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <div>
                    <label className="block text-[11px] sm:text-xs font-bold text-gray-500 mb-1.5 uppercase">Họ và tên *</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
                        <FiUser className="w-4 h-4" />
                      </span>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-3 py-2 sm:py-2.5 text-xs sm:text-sm focus:outline-none focus:border-[#0054A6] text-gray-800 placeholder-gray-450 shadow-inner"
                        placeholder="Nhập họ và tên..."
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] sm:text-xs font-bold text-gray-500 mb-1.5 uppercase">Số điện thoại liên hệ *</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
                        <FiPhone className="w-4 h-4" />
                      </span>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-3 py-2 sm:py-2.5 text-xs sm:text-sm focus:outline-none focus:border-[#0054A6] text-gray-800 placeholder-gray-450 shadow-inner"
                        placeholder="Ví dụ: 0939123456..."
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <div>
                    <label className="block text-[11px] sm:text-xs font-bold text-gray-500 mb-1.5 uppercase">Hộp thư điện tử (Email) *</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
                        <FiMail className="w-4 h-4" />
                      </span>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-3 py-2 sm:py-2.5 text-xs sm:text-sm focus:outline-none focus:border-[#0054A6] text-gray-800 placeholder-gray-450 shadow-inner"
                        placeholder="Nhập địa chỉ email..."
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] sm:text-xs font-bold text-gray-500 mb-1.5 uppercase">Bộ phận / Phòng ban làm việc *</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
                        <FiLayers className="w-4 h-4" />
                      </span>
                      <input
                        type="text"
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-3 py-2 sm:py-2.5 text-xs sm:text-sm focus:outline-none focus:border-[#0054A6] text-gray-800 placeholder-gray-455 shadow-inner"
                        placeholder="Ví dụ: Phòng Kỹ thuật, Cửa hàng..."
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Nguyện vọng ứng tuyển */}
              <div className="space-y-4 sm:space-y-5">
                <h3 className="text-sm sm:text-base font-black text-gray-800 border-b border-gray-100 pb-2 flex items-center space-x-2">
                  <FiLayers className="text-[#E30613] w-4 h-4 shrink-0" />
                  <span>Nguyện vọng & Kỹ năng</span>
                </h3>

                <div>
                  <label className="block text-[11px] sm:text-xs font-bold text-gray-500 mb-1.5 uppercase">Ban chuyên môn ứng tuyển *</label>
                  <select
                    name="targetBan"
                    value={formData.targetBan}
                    onChange={handleChange}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-[#0054A6] text-gray-800 shadow-inner"
                    required
                    disabled={isLoading}
                  >
                    <option value="Ban Kỹ thuật Số">Ban Kỹ thuật Số (Xây dựng công cụ số, tối ưu quy trình)</option>
                    <option value="Ban Truyền thông Số">Ban Truyền thông Số (Sáng tạo nội dung, thiết kế, xây dựng bản tin)</option>
                    <option value="Ban Sự kiện & Phong trào">Ban Sự kiện & Phong trào (Tổ chức workshop, phong trào số hóa)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] sm:text-xs font-bold text-gray-500 mb-1.5 uppercase">Kỹ năng nổi bật hoặc sở trường</label>
                  <input
                    type="text"
                    name="skills"
                    value={formData.skills}
                    onChange={handleChange}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 sm:py-2.5 text-xs sm:text-sm focus:outline-none focus:border-[#0054A6] text-gray-800 placeholder-gray-450 shadow-inner"
                    placeholder="Ví dụ: Thiết kế Canva, Word/Excel tốt, lập trình, thuyết trình..."
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-[11px] sm:text-xs font-bold text-gray-500 mb-1.5 uppercase">Lý do & Mong muốn gia nhập CLB *</label>
                  <textarea
                    name="reason"
                    rows="4"
                    value={formData.reason}
                    onChange={handleChange}
                    className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs sm:text-sm focus:outline-none focus:border-[#0054A6] text-gray-800 placeholder-gray-450 resize-none shadow-inner"
                    placeholder="Chia sẻ lý do bạn muốn đồng hành cùng CLB Digi Heart và bạn mong đợi điều gì..."
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Nút gửi đăng ký */}
              <div className="flex items-center justify-end pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#E30613] hover:bg-[#c2050f] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 active:scale-95 duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <>
                      <FiSend className="w-4 h-4 shrink-0" />
                      <span>Xác Nhận Đăng Ký</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          )}

        </div>

      </div>
    </div>
  );
}
