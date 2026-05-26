import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLock, FiUser, FiAlertCircle } from 'react-icons/fi';
import { authAPI } from '../utils/api';

/**
 * View Login - Trang đăng nhập dành riêng cho Ban quản trị CLB Digi Heart.
 */
export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Kiểm tra nếu người dùng đã đăng nhập từ trước, tự động chuyển hướng đúng trang
  useEffect(() => {
    const token = localStorage.getItem('digiheart_admin_token');
    const userStr = localStorage.getItem('digiheart_admin_user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.role === 'admin' || user.role === 'superadmin') {
          navigate('/admin');
        }
      } catch (e) {
        // Bỏ qua lỗi
      }
    }
  }, [navigate]);

  // Xử lý sự kiện đăng nhập
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await authAPI.login(username, password);
      // Chuyển hướng dựa theo vai trò tài khoản
      if (response.user.role === 'admin' || response.user.role === 'superadmin') {
        navigate('/admin');
      } else {
        setError('Tài khoản của bạn không có quyền quản trị!');
        authAPI.logout();
      }
    } catch (err) {
      setError(err.message || 'Tài khoản hoặc mật khẩu không chính xác!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 text-gray-800 min-h-[calc(100vh-16rem)] flex items-center justify-center py-16 px-4">
      <div className="max-w-md w-full bg-white border border-gray-200/80 rounded-3xl p-6 md:p-8 shadow-xl">
        
        {/* Header Form */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center bg-gray-50 border border-gray-200 px-4 py-1.5 rounded-xl shadow-sm mb-4">
            <span className="font-black text-lg text-[#0054A6] tracking-tighter">mobi</span>
            <span className="font-black text-lg text-[#E30613] tracking-tighter">fone</span>
          </div>
          <h2 className="text-2xl font-black text-gray-800">
            Đăng Nhập Quản Trị
          </h2>
          <p className="text-gray-400 text-xs mt-1.5 font-semibold uppercase tracking-wider">
            Hệ thống CLB chuyển đổi số Digi Heart
          </p>
        </div>

        {/* Thông báo lỗi nếu có */}
        {error && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold flex items-center space-x-2 animate-shake">
            <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Biểu mẫu đăng nhập */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">
              Tên tài khoản admin
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
                <FiUser className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:border-[#0054A6] focus:ring-1 focus:ring-[#0054A6] text-gray-800 placeholder-gray-400 shadow-inner"
                placeholder="Nhập tên tài khoản (admin)..."
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">
              Mật khẩu
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
                <FiLock className="w-4 h-4" />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:border-[#0054A6] focus:ring-1 focus:ring-[#0054A6] text-gray-800 placeholder-gray-400 shadow-inner"
                placeholder="Nhập mật khẩu (admin123)..."
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 text-white font-bold rounded-xl text-sm transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg disabled:bg-gray-300 disabled:cursor-not-allowed bg-[#E30613] hover:bg-[#c2050f] shadow-red-500/10"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <span>Xác Nhận Đăng Nhập</span>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-[10px] text-gray-400 font-medium">
            Tài khoản demo: <span className="font-bold text-gray-600">admin</span> / Mật khẩu: <span className="font-bold text-gray-600">admin123</span>
          </p>
        </div>

      </div>
    </div>
  );
}
