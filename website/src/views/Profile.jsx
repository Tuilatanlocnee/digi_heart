import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiUser, FiMapPin, FiMail, FiPhone, FiTag, FiThumbsUp, FiMessageSquare, FiClock, FiArrowLeft, FiLogOut, FiEdit, FiX } from 'react-icons/fi';
import { candidateAPI, postAPI } from '../utils/api';

/**
 * View Profile - Trang hồ sơ cá nhân chi tiết của Thành viên và Ban Quản Trị (Light Mode).
 * Hiển thị đầy đủ thông tin ứng tuyển, kỹ năng, thống kê số liệu và dòng thời gian các bài viết đã đăng.
 */
export default function Profile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Trạng thái thông tin tài khoản và hồ sơ
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [myPosts, setMyPosts] = useState([]);
  const [stats, setStats] = useState({ totalPosts: 0, totalLikes: 0 });

  // Hàm tải dữ liệu hồ sơ từ API và danh sách bài viết cá nhân
  const loadProfileAndPosts = async (currentUser) => {
    setLoading(true);
    setError('');
    try {
      // 1. Lấy thông tin chi tiết ứng viên/admin từ API
      const profileData = await candidateAPI.getProfile();
      setProfile(profileData);

      // 2. Lấy danh sách toàn bộ bài viết để lọc bài của chính mình
      const allPosts = await postAPI.getAll();
      const nameToMatch = profileData?.fullName || currentUser?.fullName;
      const personalPosts = allPosts.filter(post => post.author === nameToMatch);
      
      // Sắp xếp bài viết mới nhất lên đầu
      const sortedPosts = personalPosts.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      setMyPosts(sortedPosts);

      // 3. Tính toán thống kê hoạt động
      const totalLikes = sortedPosts.reduce((acc, post) => acc + (post.likes || 0), 0);
      setStats({
        totalPosts: sortedPosts.length,
        totalLikes
      });
    } catch (err) {
      console.error('Lỗi khi tải thông tin hồ sơ:', err);
      setError('Không thể kết nối đến máy chủ để tải thông tin hồ sơ.');
    } finally {
      setLoading(false);
    }
  };

  // Kiểm tra đăng nhập và tải dữ liệu khi trang được mở
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    const token = localStorage.getItem('digiheart_admin_token');
    const userStr = localStorage.getItem('digiheart_admin_user');
    
    if (!token || !userStr) {
      setError('Vui lòng đăng nhập để xem thông tin hồ sơ cá nhân.');
      setLoading(false);
      return;
    }

    try {
      const parsedUser = JSON.parse(userStr);
      setUser(parsedUser);
      loadProfileAndPosts(parsedUser);
    } catch {
      setError('Lỗi xác thực tài khoản, vui lòng đăng nhập lại.');
      setLoading(false);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  // Hàm xử lý Đăng xuất
  const handleLogout = () => {
    localStorage.removeItem('digiheart_admin_token');
    localStorage.removeItem('digiheart_admin_user');
    navigate('/');
    window.location.reload(); // Reload để đồng bộ lại trạng thái Navbar
  };

  // Xử lý tải và cập nhật ảnh đại diện (avatar) của thành viên
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Giới hạn kích thước file ảnh tối đa 2MB để tối ưu lưu trữ Base64
    if (file.size > 2 * 1024 * 1024) {
      alert('Kích thước ảnh đại diện quá lớn (Vui lòng chọn ảnh dưới 2MB).');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result;
      try {
        setLoading(true);
        // Gọi API cập nhật avatar lưu trữ vào database
        await candidateAPI.updateProfile({ avatar: base64String });
        
        // Đồng bộ dữ liệu state hiện tại
        if (profile) {
          setProfile({ ...profile, avatar: base64String });
        }
        if (user) {
          const updatedUser = { ...user, avatar: base64String };
          setUser(updatedUser);
          localStorage.setItem('digiheart_admin_user', JSON.stringify(updatedUser));
        }
        alert('Cập nhật ảnh đại diện thành công!');
      } catch (err) {
        console.error('Lỗi cập nhật ảnh đại diện:', err);
        alert(err.message || 'Gặp lỗi khi tải ảnh đại diện lên máy chủ.');
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Xóa ảnh đại diện hiện tại
  const handleDeleteAvatar = async (e) => {
    e.preventDefault();
    e.stopPropagation(); // Ngăn chặn trigger mở hộp thoại chọn file ảnh
    if (!confirm('Bạn có chắc chắn muốn xóa ảnh đại diện hiện tại?')) return;

    try {
      setLoading(true);
      // Gọi API cập nhật avatar bằng chuỗi rỗng
      await candidateAPI.updateProfile({ avatar: '' });

      // Cập nhật lại trạng thái local
      if (profile) {
        setProfile({ ...profile, avatar: '' });
      }
      if (user) {
        const updatedUser = { ...user, avatar: '' };
        setUser(updatedUser);
        localStorage.setItem('digiheart_admin_user', JSON.stringify(updatedUser));
      }
      alert('Đã xóa ảnh đại diện thành công!');
    } catch (err) {
      console.error('Lỗi khi xóa ảnh đại diện:', err);
      alert(err.message || 'Không thể xóa ảnh đại diện, vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#0054A6] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-semibold text-sm">Đang tải dữ liệu hồ sơ cá nhân...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white border border-gray-250 p-8 rounded-3xl shadow-xl max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto text-3xl">
            ⚠️
          </div>
          <h3 className="text-xl font-bold text-gray-800">Không Thể Truy Cập</h3>
          <p className="text-gray-500 text-sm leading-relaxed">{error}</p>
          <div className="pt-2 flex flex-col space-y-3">
            <Link
              to="/admin/login"
              className="w-full py-3 bg-[#0054A6] hover:bg-[#003d80] text-white font-bold rounded-xl shadow-md transition-colors"
            >
              Đăng nhập ngay
            </Link>
            <Link
              to="/"
              className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors flex items-center justify-center space-x-1"
            >
              <FiArrowLeft />
              <span>Quay về trang chủ</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Tên hiển thị viết tắt làm Avatar
  const avatarLetter = profile?.fullName ? profile.fullName.charAt(0) : (user?.fullName ? user.fullName.charAt(0) : 'U');

  return (
    <div className="min-h-screen bg-gray-50/50 pb-16">
      
      {/* 🚀 Cover Banner Layer */}
      <div className="relative bg-gradient-to-r from-blue-700 via-[#0054A6] to-indigo-800 h-36 md:h-48 shadow-inner">
        <div className="absolute inset-0 bg-black/15"></div>
        <div className="max-w-6xl mx-auto px-4 h-full flex items-end relative z-10">
          <div className="flex flex-col md:flex-row items-center md:items-end space-y-4 md:space-y-0 md:space-x-6 w-full text-center md:text-left pb-4 md:pb-6">
            
            {/* Avatar tròn lớn */}
            <div className="w-28 h-28 md:w-36 md:h-36 rounded-full border-4 border-white bg-blue-50 shadow-lg overflow-hidden flex items-center justify-center font-black text-[#0054A6] flex-shrink-0 select-none translate-y-10 md:translate-y-14 relative group">
              {profile?.avatar || user?.avatar ? (
                <img 
                  src={profile?.avatar || user?.avatar} 
                  alt="Avatar" 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <span className="text-4xl md:text-5xl">{avatarLetter}</span>
              )}
              
              {/* Overlay tùy chọn ảnh đại diện khi hover */}
              <div className="absolute inset-0 bg-black/55 flex flex-col items-center justify-center text-white text-[10px] md:text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity overflow-hidden">
                
                {/* Lựa chọn tải ảnh mới */}
                <label className="flex flex-col items-center justify-center cursor-pointer hover:bg-white/10 transition-colors w-full h-1/2 border-b border-white/10 pt-2 pb-1">
                  <FiEdit className="w-3.5 h-3.5 mb-1" />
                  <span>Đổi ảnh</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleAvatarChange} 
                    className="hidden" 
                  />
                </label>

                {/* Lựa chọn xóa ảnh nếu đã có */}
                {profile?.avatar || user?.avatar ? (
                  <button 
                    type="button" 
                    onClick={handleDeleteAvatar} 
                    className="flex flex-col items-center justify-center w-full h-1/2 hover:bg-red-500/20 text-red-200 hover:text-red-100 transition-colors pt-1 pb-2"
                  >
                    <FiX className="w-3.5 h-3.5 mb-1" />
                    <span>Xóa ảnh</span>
                  </button>
                ) : (
                  <div className="flex flex-col items-center justify-center w-full h-1/2 opacity-30 select-none pt-1 pb-2">
                    <FiX className="w-3.5 h-3.5 mb-1 text-gray-400" />
                    <span className="text-gray-400">Xóa ảnh</span>
                  </div>
                )}
              </div>
            </div>

            {/* Tên và Vai trò */}
            <div className="pb-1 md:pb-2 flex-grow text-gray-800 md:text-white">
              <h2 className="text-2xl md:text-3xl font-black flex items-center justify-center md:justify-start space-x-3 drop-shadow-none md:drop-shadow-sm">
                <span>{profile?.fullName || user?.fullName}</span>
                <span className="text-[10px] md:text-xs px-2.5 py-0.5 font-bold rounded-full bg-blue-100 text-[#0054A6] md:bg-white/20 md:text-white md:border md:border-white/10 md:backdrop-blur-sm shadow-sm">
                  {user?.role === 'admin' || user?.role === 'superadmin' ? 'Ban Quản Trị' : 'Thành Viên CLB'}
                </span>
              </h2>
              <p className="text-gray-500 md:text-blue-100/90 text-sm mt-1 font-semibold">@{user?.username}</p>
            </div>

            {/* Các nút tác vụ nhanh */}
            <div className="flex items-center space-x-3 pb-2 md:pb-4 self-center md:self-end md:translate-y-12">
              <Link
                to="/fanpage"
                className="px-4 py-2 bg-white text-[#0054A6] hover:bg-blue-50 text-xs font-bold rounded-xl shadow-md border border-gray-200 transition-all flex items-center space-x-1.5"
              >
                <FiEdit className="w-3.5 h-3.5" />
                <span>Đăng bài viết mới</span>
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-[#E30613] hover:bg-[#c2050f] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center space-x-1.5"
              >
                <FiLogOut className="w-3.5 h-3.5" />
                <span>Đăng xuất</span>
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* 📊 Main Content Layout */}
      <div className="max-w-6xl mx-auto px-4 mt-12 md:mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* 📌 Cột Trái: Thông tin cá nhân chi tiết */}
          <div className="space-y-6">
            <div className="bg-white border border-gray-200/80 rounded-3xl p-6 shadow-sm">
              <h3 className="text-base font-extrabold text-gray-800 pb-3 border-b border-gray-150 mb-4 flex items-center space-x-2">
                <FiUser className="text-[#0054A6] w-4 h-4" />
                <span>Thông tin cá nhân</span>
              </h3>
              
              <div className="space-y-4 text-sm text-gray-600">
                {profile?.department && (
                  <div className="flex items-start space-x-3">
                    <FiMapPin className="text-[#0054A6] w-4 h-4 mt-0.5 shrink-0" />
                    <div>
                      <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wide">Đơn vị công tác</span>
                      <span className="font-semibold text-gray-700">{profile.department}</span>
                    </div>
                  </div>
                )}

                {profile?.targetBan && (
                  <div className="flex items-start space-x-3">
                    <FiUser className="text-[#E30613] w-4 h-4 mt-0.5 shrink-0" />
                    <div>
                      <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wide">Ban hoạt động đăng ký</span>
                      <span className="font-semibold text-gray-700">{profile.targetBan}</span>
                    </div>
                  </div>
                )}

                {profile?.phone && (
                  <div className="flex items-start space-x-3">
                    <FiPhone className="text-gray-400 w-4 h-4 mt-0.5 shrink-0" />
                    <div>
                      <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wide">Số điện thoại</span>
                      <span className="font-semibold text-gray-700">{profile.phone}</span>
                    </div>
                  </div>
                )}

                {profile?.email && (
                  <div className="flex items-start space-x-3">
                    <FiMail className="text-gray-400 w-4 h-4 mt-0.5 shrink-0" />
                    <div>
                      <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wide">Địa chỉ Email</span>
                      <span className="font-semibold text-gray-700 break-all">{profile.email}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Thẻ kỹ năng */}
            {profile?.skills && (
              <div className="bg-white border border-gray-200/80 rounded-3xl p-6 shadow-sm">
                <h3 className="text-base font-extrabold text-gray-800 pb-3 border-b border-gray-150 mb-4 flex items-center space-x-2">
                  <FiTag className="text-[#0054A6] w-4 h-4" />
                  <span>Kỹ năng & Sở trường</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.split(',').map((skill, idx) => (
                    <span 
                      key={idx} 
                      className="px-3 py-1 bg-blue-50 border border-blue-100 text-[#0054A6] rounded-xl text-xs font-semibold"
                    >
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Lý do tham gia */}
            {profile?.reason && (
              <div className="bg-white border border-gray-200/80 rounded-3xl p-6 shadow-sm">
                <h3 className="text-base font-extrabold text-gray-800 pb-3 border-b border-gray-150 mb-4">Mục tiêu tham gia</h3>
                <p className="text-gray-600 text-xs leading-relaxed italic">&ldquo;{profile.reason}&rdquo;</p>
              </div>
            )}
          </div>

          {/* 📌 Cột Phải: Hoạt động & Danh sách bài viết */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Hộp Thống kê số liệu */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white border border-gray-200/80 rounded-3xl p-6 shadow-sm text-center">
                <span className="block text-3xl font-black text-[#0054A6] mb-1">{stats.totalPosts}</span>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Bài viết đã đăng</span>
              </div>
              <div className="bg-white border border-gray-200/80 rounded-3xl p-6 shadow-sm text-center">
                <span className="block text-3xl font-black text-[#E30613] mb-1">{stats.totalLikes}</span>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Lượt thích nhận được</span>
              </div>
            </div>

            {/* Danh sách bài viết dòng thời gian */}
            <div className="bg-white border border-gray-200/80 rounded-3xl p-6 shadow-sm">
              <h3 className="text-base font-extrabold text-gray-800 pb-3 border-b border-gray-150 mb-6 flex items-center justify-between">
                <span>Dòng thời gian bài viết ({myPosts.length})</span>
                <span className="text-xs font-semibold text-gray-400">Các chia sẻ chính chủ trên Fanpage</span>
              </h3>

              <div className="space-y-6">
                {myPosts.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 italic space-y-2">
                    <p className="text-sm">Bạn chưa đăng tải bài viết nào trên trang Fanpage.</p>
                    <Link to="/fanpage" className="text-xs text-[#0054A6] hover:underline font-bold inline-block mt-2">
                      Chia sẻ bài viết đầu tiên ngay &rarr;
                    </Link>
                  </div>
                ) : (
                  myPosts.map((post) => {
                    const postId = post._id || post.id;
                    return (
                      <div 
                        key={postId} 
                        className="p-5 bg-gray-50 border border-gray-200 rounded-2xl space-y-4 hover:border-blue-100 transition-all"
                      >
                        {/* Header bài viết */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center font-bold text-sm text-[#0054A6]">
                              {avatarLetter}
                            </div>
                            <div>
                              <h4 className="font-bold text-sm text-gray-800">{post.author}</h4>
                              <div className="text-[10px] text-gray-400 flex items-center space-x-1 mt-0.5">
                                <FiClock />
                                <span>{post.time}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Nội dung bài viết */}
                        <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>

                        {/* Tương tác */}
                        <div className="flex items-center justify-between pt-3 border-t border-gray-200/60 text-xs text-gray-500 font-medium">
                          <div className="flex items-center space-x-1.5 hover:text-[#0054A6] transition-colors cursor-pointer">
                            <FiThumbsUp className="w-4 h-4 text-[#0054A6]" />
                            <span>{post.likes || 0} Lượt thích</span>
                          </div>
                          <div className="flex items-center space-x-1.5 hover:text-[#0054A6] transition-colors cursor-pointer">
                            <FiMessageSquare className="w-4 h-4" />
                            <span>{post.comments?.length || 0} Bình luận</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
}
