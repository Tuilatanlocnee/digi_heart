import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { FiMenu, FiX, FiLock, FiLogOut, FiKey, FiUser } from 'react-icons/fi';
import { authAPI } from '../utils/api';

/**
 * Component Navbar - Thanh điều hướng chính của trang web (Light Mode).
 * Hỗ trợ nhận diện phiên đăng nhập của Admin & Thành viên để hiển thị menu tương ứng và đổi mật khẩu.
 * Đặc biệt: Di chuột (hover) vào tên thành viên sẽ hiện Profile Hover Card dạng Facebook đầy đủ thông tin & bài viết đã đăng.
 */
export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Trạng thái Modal đổi mật khẩu
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [cpError, setCpError] = useState('');
  const [cpSuccess, setCpSuccess] = useState('');
  const [cpLoading, setCpLoading] = useState(false);

  // Kiểm tra trạng thái đăng nhập khi URL thay đổi
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    const token = localStorage.getItem('digiheart_admin_token');
    const userStr = localStorage.getItem('digiheart_admin_user');
    if (token && userStr) {
      setIsLoggedIn(true);
      try {
        const parsedUser = JSON.parse(userStr);
        setUser(parsedUser);
        setIsAdmin(parsedUser.role === 'admin' || parsedUser.role === 'superadmin');
      } catch {
        setIsLoggedIn(false);
        setUser(null);
        setIsAdmin(false);
      }
    } else {
      setIsLoggedIn(false);
      setUser(null);
      setIsAdmin(false);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [location]);

  // Xử lý khi nhấn Đăng xuất
  const handleLogout = () => {
    authAPI.logout();
    setIsLoggedIn(false);
    setUser(null);
    setIsAdmin(false);
    navigate('/');
  };

  // Xử lý submit đổi mật khẩu
  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    setCpError('');
    setCpSuccess('');

    if (newPassword !== confirmPassword) {
      setCpError('Xác nhận mật khẩu mới không khớp!');
      return;
    }

    if (newPassword.length < 4) {
      setCpError('Mật khẩu mới phải có độ dài ít nhất 4 ký tự!');
      return;
    }

    setCpLoading(true);
    try {
      await authAPI.changePassword(oldPassword, newPassword);
      setCpSuccess('Thay đổi mật khẩu tài khoản thành công!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setShowChangePassword(false);
        setCpSuccess('');
      }, 2000);
    } catch (err) {
      setCpError(err.message || 'Mật khẩu cũ không chính xác hoặc lỗi hệ thống!');
    } finally {
      setCpLoading(false);
    }
  };

  // Danh sách các đường dẫn điều hướng của trang web
  const navLinks = [
    { name: 'Trang chủ', path: '/' },
    { name: 'Tin tức', path: '/news' },
    { name: 'Dự án số', path: '/projects' },
    { name: 'Fanpage', path: '/fanpage' },
    { name: 'Liên hệ', path: '/contact' },
  ];

  const filteredNavLinks = navLinks;

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200/80 text-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Khu vực Logo thương hiệu MobiFone */}
          <Link to="/" className="flex items-center space-x-2 sm:space-x-3 group">
            <div className="flex items-center bg-gray-50 border border-gray-200 px-2 sm:px-3 py-1 rounded-lg shadow-sm group-hover:scale-105 transition-transform duration-300">
              <span className="font-black text-sm sm:text-md text-[#0054A6] tracking-tighter">mobi</span>
              <span className="font-black text-sm sm:text-md text-[#E30613] tracking-tighter">fone</span>
            </div>
            <div className="flex flex-col border-l border-gray-200 pl-2 sm:pl-3">
              <span className="font-bold text-xs sm:text-sm tracking-wider text-gray-800 whitespace-nowrap">
                DIGI HEART
              </span>
              <span className="text-[8px] sm:text-[9px] text-[#0054A6] tracking-wider sm:tracking-widest font-bold uppercase whitespace-nowrap">
                CLB Chuyển Đổi Số
              </span>
            </div>
          </Link>

          {/* Menu điều hướng dành cho Desktop (Light Mode) */}
          <div className="hidden md:flex items-center space-x-1">
            {filteredNavLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-50 text-[#0054A6] border border-blue-100/50 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-[#0054A6]'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}

            {/* Nút hành động đăng nhập, đăng xuất, đổi mật khẩu */}
            {isLoggedIn ? (
              <div className="flex items-center space-x-2 border-l border-gray-200 pl-3 ml-2">
                {isAdmin && (
                  <NavLink
                    to="/admin"
                    className={({ isActive }) =>
                      `px-3 py-2 rounded-lg text-sm font-semibold flex items-center space-x-1.5 transition-all duration-200 ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm'
                          : 'text-emerald-600 hover:bg-emerald-50'
                      }`
                    }
                  >
                    <FiLock className="w-3.5 h-3.5" />
                    <span>Quản trị</span>
                  </NavLink>
                )}

                {/* Tên hiển thị admin */}
                <div
                  className="flex items-center space-x-1 px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-700 max-w-[150px] truncate"
                >
                  <FiUser className="w-3.5 h-3.5 text-[#0054A6]" />
                  <span>{user?.username || 'Admin'}</span>
                </div>


                {/* Nút Đổi mật khẩu */}
                <button
                  onClick={() => setShowChangePassword(true)}
                  className="p-2 text-gray-500 hover:text-[#0054A6] hover:bg-blue-50 rounded-lg text-sm transition-colors"
                  title="Thay đổi mật khẩu"
                  aria-label="Change Password"
                >
                  <FiKey className="w-4 h-4" />
                </button>

                {/* Nút Đăng xuất */}
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-500 hover:text-[#E30613] hover:bg-red-50 rounded-lg text-sm transition-colors"
                  title="Đăng xuất khỏi hệ thống"
                  aria-label="Logout"
                >
                  <FiLogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <NavLink
                to="/admin/login"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm font-semibold flex items-center space-x-1 text-gray-400 hover:text-[#0054A6] hover:bg-gray-50 transition-all duration-200 ml-2 ${
                    isActive ? 'text-[#0054A6] bg-blue-50' : ''
                  }`
                }
              >
                <FiLock className="w-3.5 h-3.5" />
                <span>Đăng nhập</span>
              </NavLink>
            )}
          </div>

          {/* Nút bật/tắt menu trên Mobile */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="p-2 rounded-md text-gray-500 hover:text-[#0054A6] hover:bg-gray-100 focus:outline-none transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Menu thả xuống khi bấm trên Mobile */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg border-b border-gray-200/80 animate-fadeIn">
          <div className="px-3 pt-2 pb-4 space-y-1">
            {filteredNavLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2.5 rounded-xl text-base font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-50 text-[#0054A6] border-l-4 border-[#0054A6] pl-4 shadow-inner'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-[#0054A6]'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}

            {/* Menu phụ trên Mobile */}
            <div className="pt-2 border-t border-gray-100 mt-2">
              {isLoggedIn ? (
                <div className="space-y-1.5">
                  <div
                    className="px-3 py-2.5 rounded-xl text-sm font-bold text-[#0054A6] bg-gray-50 flex items-center space-x-2 border border-gray-150"
                  >
                    <FiUser className="text-[#0054A6] w-4 h-4" />
                    <span className="font-extrabold">{user?.username || 'Admin'}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-[#0054A6]">
                      Q.Trị
                    </span>
                  </div>

                  {isAdmin && (
                    <NavLink
                      to="/admin"
                      onClick={() => setIsOpen(false)}
                      className="block px-3 py-2.5 rounded-xl text-base font-semibold text-emerald-600 hover:bg-emerald-50 flex items-center space-x-2 transition-all"
                    >
                      <FiLock className="w-4 h-4" />
                      <span>Trang Quản trị</span>
                    </NavLink>
                  )}

                  <button
                    onClick={() => {
                      setIsOpen(false);
                      setShowChangePassword(true);
                    }}
                    className="w-full text-left block px-3 py-2.5 rounded-xl text-base font-semibold text-gray-600 hover:bg-gray-50 flex items-center space-x-2 transition-all"
                  >
                    <FiKey className="w-4 h-4" />
                    <span>Đổi mật khẩu</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsOpen(false);
                      handleLogout();
                    }}
                    className="w-full text-left block px-3 py-2.5 rounded-xl text-base font-semibold text-red-500 hover:bg-red-50 flex items-center space-x-2 transition-all"
                  >
                    <FiLogOut className="w-4 h-4" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              ) : (
                <NavLink
                  to="/admin/login"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2.5 rounded-xl text-base font-semibold text-gray-500 hover:text-[#0054A6] hover:bg-gray-50 flex items-center space-x-2 transition-all"
                >
                  <FiLock className="w-4 h-4" />
                  <span>Đăng nhập hệ thống</span>
                </NavLink>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 🔐 Modal Đổi mật khẩu */}
      {showChangePassword && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white border border-gray-200/80 w-full max-w-md rounded-3xl p-6 shadow-2xl relative">
            <h3 className="text-lg font-black text-gray-800 mb-5 flex items-center space-x-2">
              <FiKey className="text-[#0054A6] w-5 h-5" />
              <span>Thay Đổi Mật Khẩu</span>
            </h3>

            {cpError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold flex items-center space-x-1.5 animate-shake">
                <FiX className="w-4 h-4 shrink-0" />
                <span>{cpError}</span>
              </div>
            )}

            {cpSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-semibold flex items-center space-x-1.5 animate-fadeIn">
                <span>🎉 {cpSuccess}</span>
              </div>
            )}

            <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase">Mật khẩu hiện tại *</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#0054A6] text-gray-800 shadow-inner"
                  required
                  disabled={cpLoading}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase">Mật khẩu mới *</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#0054A6] text-gray-800 shadow-inner"
                  required
                  disabled={cpLoading}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase">Xác nhận mật khẩu mới *</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#0054A6] text-gray-800 shadow-inner"
                  required
                  disabled={cpLoading}
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowChangePassword(false);
                    setOldPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                    setCpError('');
                  }}
                  className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
                  disabled={cpLoading}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0054A6] hover:bg-[#003d80] text-white text-xs font-bold rounded-xl shadow-md transition-colors flex items-center space-x-1"
                  disabled={cpLoading}
                >
                  {cpLoading && <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></span>}
                  <span>Lưu thay đổi</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </nav>
  );
}
