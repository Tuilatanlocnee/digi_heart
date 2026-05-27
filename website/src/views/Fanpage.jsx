import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  FiImage, 
  FiCalendar, 
  FiUser, 
  FiPlusCircle, 
  FiFilter, 
  FiInbox, 
  FiTrash2, 
  FiZap,
  FiUpload,
  FiX,
  FiArrowLeft,
  FiChevronDown,
  FiChevronRight
} from 'react-icons/fi';
import { postAPI } from '../utils/api';

/**
 * View Fanpage - Trang tin tức CLB Digi Heart.
 * Hiển thị danh sách các bài viết chia sẻ theo Tháng/Năm, sắp xếp theo ngày.
 * Người dùng có thể click vào bài viết để đọc chi tiết như một trang thông tin.
 * Xóa bỏ hoàn toàn avatar và tên tác giả.
 */
export default function Fanpage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ type: 'all', value: null });
  const [expandedYears, setExpandedYears] = useState({});
  
  // Bài viết đang được đọc chi tiết (null: đang xem danh sách)
  const [activePost, setActivePost] = useState(null);

  // Trạng thái đăng nhập
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Form đăng bài viết mới
  const [showAddModal, setShowAddModal] = useState(false);
  const [postForm, setPostForm] = useState({
    title: '',
    content: '',
    image: ''
  });

  // Nạp danh sách bài viết từ Backend
  const fetchPosts = async () => {
    try {
      const data = await postAPI.getAll();
      // Sắp xếp bài mới nhất lên đầu
      const sorted = data.sort((a, b) => new Date(b.createdAt || b.time) - new Date(a.createdAt || a.time));
      setPosts(sorted);
    } catch (error) {
      console.error('Không tải được danh sách bài đăng Fanpage:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();

    // Kiểm tra đăng nhập
    const token = localStorage.getItem('digiheart_admin_token');
    const userStr = localStorage.getItem('digiheart_admin_user');
    if (token && userStr) {
      try {
        const parsed = JSON.parse(userStr);
        setUser(parsed);
        setIsLoggedIn(true);
        setIsAdmin(parsed.role === 'admin' || parsed.role === 'superadmin');
      } catch {
        setIsLoggedIn(false);
        setUser(null);
        setIsAdmin(false);
      }
    }
  }, []);

  // Helper lấy thông tin năm, tháng của bài viết
  const getPostDateInfo = (post) => {
    let year = 'Khác';
    let month = 'Khác';
    let monthYear = 'Khác';

    if (post.createdAt) {
      const date = new Date(post.createdAt);
      if (!isNaN(date.getTime())) {
        year = date.getFullYear().toString();
        month = String(date.getMonth() + 1).padStart(2, '0');
        monthYear = `${month}/${year}`;
      }
    } else if (post.time && /^\d{4}-\d{2}-\d{2}$/.test(post.time)) {
      const parts = post.time.split('-');
      year = parts[0];
      month = parts[1];
      monthYear = `${parts[1]}/${parts[0]}`;
    }

    return { year, month, monthYear };
  };

  // Tự động mở rộng tất cả các năm có bài đăng khi danh sách posts thay đổi
  useEffect(() => {
    if (posts.length > 0) {
      const initialExpanded = {};
      posts.forEach(post => {
        const { year } = getPostDateInfo(post);
        if (year !== 'Khác') {
          initialExpanded[year] = true;
        }
      });
      setExpandedYears(initialExpanded);
    }
  }, [posts]);

  // Phân tích posts để xây dựng cấu trúc bộ lọc Năm & Tháng
  const getFilterStructure = () => {
    const structure = {};
    posts.forEach(post => {
      const { year, month, monthYear } = getPostDateInfo(post);
      if (year === 'Khác') return;

      if (!structure[year]) {
        structure[year] = {
          year,
          postCount: 0,
          months: {}
        };
      }

      structure[year].postCount += 1;

      if (!structure[year].months[monthYear]) {
        structure[year].months[monthYear] = {
          monthYear,
          label: `Tháng ${month}/${year}`,
          postCount: 0,
          monthNum: Number(month)
        };
      }
      structure[year].months[monthYear].postCount += 1;
    });

    // Chuyển object thành array, sắp xếp năm giảm dần và tháng giảm dần
    return Object.values(structure)
      .sort((a, b) => Number(b.year) - Number(a.year))
      .map(yGroup => {
        const sortedMonths = Object.values(yGroup.months)
          .sort((a, b) => b.monthNum - a.monthNum);
        return {
          ...yGroup,
          months: sortedMonths
        };
      });
  };

  const filterStructure = getFilterStructure();

  // Lọc danh sách bài đăng dựa trên bộ lọc đã chọn
  const filteredPosts = posts.filter(post => {
    if (filter.type === 'all') return true;
    
    const { year, monthYear } = getPostDateInfo(post);
    if (filter.type === 'year') {
      return year === filter.value;
    }
    if (filter.type === 'month') {
      return monthYear === filter.value;
    }
    return true;
  });

  // Label hiển thị khi không có bài đăng
  const getFilterLabel = () => {
    if (filter.type === 'all') return 'danh sách';
    if (filter.type === 'year') return `năm ${filter.value}`;
    if (filter.type === 'month') return `tháng ${filter.value}`;
    return '';
  };

  // Xử lý khi người dùng chọn file ảnh từ máy tính
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Giới hạn kích thước file (ví dụ 4MB) để tránh lưu Base64 quá dài
    if (file.size > 4 * 1024 * 1024) {
      alert('Kích thước ảnh quá lớn! Vui lòng chọn file ảnh dưới 4MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPostForm({
        ...postForm,
        image: reader.result
      });
    };
    reader.readAsDataURL(file);
  };

  // Xử lý tạo bài viết mới
  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!postForm.title.trim() || !postForm.content.trim()) {
      alert('Vui lòng điền đầy đủ tiêu đề và nội dung bài viết!');
      return;
    }

    try {
      await postAPI.create({
        title: postForm.title,
        content: postForm.content,
        image: postForm.image.trim() || null,
        author: user?.fullName || 'Thành viên CLB',
        avatar: user?.avatar || ''
      });

      setShowAddModal(false);
      setPostForm({ title: '', content: '', image: '' });
      await fetchPosts(); // Load lại danh sách bài viết
    } catch (error) {
      alert(error.message || 'Lỗi khi đăng bài viết!');
    }
  };

  // Xóa bài viết (Admin hoặc Tác giả)
  const handleDeletePost = async (postId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài viết này không?')) return;

    try {
      await postAPI.delete(postId);
      setPosts(posts.filter(p => p._id !== postId && p.id !== postId));
      if (activePost && (activePost._id === postId || activePost.id === postId)) {
        setActivePost(null);
      }
    } catch (error) {
      alert(error.message || 'Lỗi khi xóa bài viết!');
    }
  };

  // Hàm định dạng ngày hiển thị đẹp
  const formatDate = (dateStr) => {
    if (!dateStr) return 'Vừa xong';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 1. GIAO DIỆN XEM CHI TIẾT BÀI VIẾT (TRANG THÔNG TIN)
  if (activePost) {
    return (
      <div className="bg-gray-50 text-gray-800 min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4">
          
          <button
            onClick={() => setActivePost(null)}
            className="flex items-center space-x-2 text-[#0054A6] hover:text-[#003f7f] transition-colors mb-8 group font-semibold text-sm"
          >
            <FiArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>Quay lại danh sách bài viết</span>
          </button>

          <article className="bg-white border border-gray-200/80 rounded-3xl p-6 md:p-10 shadow-lg animate-fadeIn">
            {activePost.image && (
              <img
                src={activePost.image}
                alt={activePost.title}
                className="w-full h-64 md:h-[400px] object-cover rounded-2xl mb-8 shadow-sm"
              />
            )}

            <div className="flex items-center text-xs text-gray-400 mb-4 font-bold uppercase tracking-wider">
              <FiCalendar className="w-4 h-4 mr-1.5" />
              <span>{formatDate(activePost.createdAt || activePost.time)}</span>
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-black mb-6 leading-snug text-gray-800">
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

  // 2. GIAO DIỆN DANH SÁCH BÀI VIẾT
  return (
    <div className="bg-gray-50 text-gray-800 min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Banner tiêu đề chính */}
        <div className="text-center max-w-4xl mx-auto mb-16 relative">
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-black mb-4 text-gray-800">
            Tin Tức CLB <span className="text-[#0054A6]">Digi Heart</span>
          </h1>
          <p className="text-gray-500 font-medium md:whitespace-nowrap">
            Nơi kết nối và cập nhật tức thì các hoạt động, hình ảnh sôi nổi của Câu lạc bộ Chuyển đổi số Digi Heart.
          </p>

          {/* Nút đăng bài cho thành viên đã đăng nhập */}
          {isLoggedIn && (
            <div className="mt-6 flex justify-center animate-fadeIn">
              <button
                onClick={() => setShowAddModal(true)}
                className="px-6 py-2.5 bg-[#0054A6] hover:bg-[#003d80] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center space-x-2 hover:scale-105"
              >
                <FiPlusCircle className="w-4 h-4 text-emerald-300" />
                <span>Đăng Bài Viết Mới</span>
              </button>
            </div>
          )}
        </div>

        {/* Bố cục trang gồm Sidebar lọc và Timeline chính */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Cột trái (4 phần): Sidebar thông tin CLB & Lọc theo tháng */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-20">
            
            {/* Card Giới thiệu Slogan CLB */}
            <div className="bg-gradient-to-r from-[#002f6c] to-[#0054A6] text-white p-6 rounded-2xl md:rounded-3xl shadow-lg relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-xl group-hover:bg-white/10 transition-all pointer-events-none"></div>
              <div className="flex items-center space-x-2 mb-4">
                <FiZap className="text-amber-300 w-5 h-5 animate-pulse" />
                <span className="font-extrabold text-sm tracking-wider">DIGI HEART</span>
              </div>
              <h4 className="text-lg font-black mb-2 text-amber-300">
                &ldquo;Kết nối tri thức số – Dẫn lối tương lai&rdquo;
              </h4>
              <p className="text-xs text-blue-100 leading-relaxed font-light">
                Mỗi thành viên CLB mang trong mình trái tim nhiệt huyết, sẵn sàng lan tỏa kiến thức và kỹ năng số đến cộng đồng MobiFone Cần Thơ.
              </p>
            </div>

            {/* Card Bộ lọc theo Năm & Tháng */}
            <div className="bg-white border border-gray-200/80 p-5 rounded-2xl shadow-sm">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center space-x-2">
                <FiFilter className="text-[#0054A6]" />
                <span>Xem Post Theo Thời Gian</span>
              </h3>

              <div className="space-y-3">
                {/* Nút lọc Tất cả bài viết */}
                <button
                  onClick={() => setFilter({ type: 'all', value: null })}
                  className={`w-full px-4 py-2.5 rounded-xl text-xs md:text-sm font-semibold transition-all border text-left flex justify-between items-center ${
                    filter.type === 'all'
                      ? 'bg-[#0054A6] text-white border-[#0054A6] shadow-md shadow-blue-500/10'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-[#0054A6]'
                  }`}
                >
                  <span className="flex items-center space-x-2">
                    <FiCalendar className="w-4 h-4" />
                    <span>Tất cả bài viết</span>
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    filter.type === 'all' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {posts.length}
                  </span>
                </button>

                {/* Danh sách các Năm dạng Accordion */}
                <div className="space-y-2">
                  {filterStructure.map((yearGroup) => {
                    const isExpanded = !!expandedYears[yearGroup.year];
                    const isYearActive = filter.type === 'year' && filter.value === yearGroup.year;

                    return (
                      <div key={yearGroup.year} className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                        {/* Header của Năm */}
                        <button
                          onClick={() => setExpandedYears(prev => ({
                            ...prev,
                            [yearGroup.year]: !prev[yearGroup.year]
                          }))}
                          className="w-full px-3 py-2.5 bg-gray-50/50 hover:bg-gray-50 text-gray-700 font-bold text-xs transition-all flex justify-between items-center border-b border-gray-100"
                        >
                          <span className="flex items-center space-x-1.5">
                            {isExpanded ? (
                              <FiChevronDown className="w-3.5 h-3.5 text-gray-400" />
                            ) : (
                              <FiChevronRight className="w-3.5 h-3.5 text-gray-400" />
                            )}
                            <span>Năm {yearGroup.year}</span>
                          </span>
                          <span className="text-[9px] bg-gray-200/60 text-gray-500 px-2 py-0.5 rounded-full font-extrabold">
                            {yearGroup.postCount} bài
                          </span>
                        </button>

                        {/* Danh sách các tháng thuộc năm */}
                        {isExpanded && (
                          <div className="p-1.5 bg-white space-y-1">
                            {/* Option chọn toàn bộ năm */}
                            <button
                              onClick={() => setFilter({ type: 'year', value: yearGroup.year })}
                              className={`w-full px-2.5 py-2 rounded-lg text-xs font-medium transition-all text-left flex justify-between items-center ${
                                isYearActive
                                  ? 'bg-[#0054A6]/10 text-[#0054A6] font-bold border-l-2 border-[#0054A6] pl-2'
                                  : 'text-gray-500 hover:bg-gray-50 hover:text-[#0054A6]'
                              }`}
                            >
                              <span>Tất cả bài viết năm {yearGroup.year}</span>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                                isYearActive ? 'bg-[#0054A6]/20 text-[#0054A6]' : 'bg-gray-100 text-gray-400'
                              }`}>
                                {yearGroup.postCount}
                              </span>
                            </button>

                            {/* Từng tháng cụ thể */}
                            {yearGroup.months.map((mGroup) => {
                              const isMonthActive = filter.type === 'month' && filter.value === mGroup.monthYear;
                              return (
                                <button
                                  key={mGroup.monthYear}
                                  onClick={() => setFilter({ type: 'month', value: mGroup.monthYear })}
                                  className={`w-full px-2.5 py-2 rounded-lg text-xs font-medium transition-all text-left flex justify-between items-center ${
                                    isMonthActive
                                      ? 'bg-[#0054A6]/10 text-[#0054A6] font-bold border-l-2 border-[#0054A6] pl-2'
                                      : 'text-gray-500 hover:bg-gray-50 hover:text-[#0054A6]'
                                  }`}
                                >
                                  <span>{mGroup.label}</span>
                                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                                    isMonthActive ? 'bg-[#0054A6]/20 text-[#0054A6]' : 'bg-gray-100 text-gray-400'
                                  }`}>
                                    {mGroup.postCount}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>

          {/* Cột phải (8 phần): Danh sách các bài đăng */}
          <div className="lg:col-span-8 space-y-6">
            {loading ? (
              <div className="bg-white border border-gray-200 rounded-3xl p-16 text-center shadow-sm max-w-md mx-auto">
                <span className="inline-block w-8 h-8 border-4 border-[#0054A6] border-t-transparent rounded-full animate-spin"></span>
                <p className="text-gray-400 text-xs font-bold mt-4 uppercase">Đang tải danh sách bài viết...</p>
              </div>
            ) : filteredPosts.length > 0 ? (
              <div className="space-y-6">
                {filteredPosts.map((post) => {
                  const postId = post._id || post.id;

                  return (
                    <div
                      key={postId}
                      onClick={() => setActivePost(post)}
                      className="bg-white border border-gray-200/80 rounded-2xl p-5 hover:border-[#0054A6]/30 hover:shadow-md transition-all duration-300 cursor-pointer group flex flex-col sm:flex-row gap-5 shadow-sm animate-fadeIn"
                    >
                      {post.image && (
                        <div className="w-full sm:w-44 h-32 rounded-xl overflow-hidden shrink-0 bg-gray-50 border border-gray-100 flex items-center justify-center">
                          <img 
                            src={post.image} 
                            alt={post.title} 
                            className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                          />
                        </div>
                      )}
                      
                      <div className="flex-grow flex flex-col justify-between py-1">
                        <div>
                          <span className="text-[10px] text-gray-405 font-bold tracking-wider flex items-center mb-1.5 uppercase">
                            <FiCalendar className="mr-1" />
                            {formatDate(post.createdAt || post.time)}
                          </span>
                          <h3 className="text-base sm:text-lg font-bold text-gray-800 group-hover:text-[#0054A6] transition-colors leading-snug mb-2 line-clamp-2">
                            {post.title}
                          </h3>
                          <p className="text-gray-500 text-xs sm:text-sm font-light leading-relaxed line-clamp-2">
                            {post.content}
                          </p>
                        </div>
                        
                        <div className="flex items-center justify-between mt-4 border-t border-gray-50 pt-3">
                          <span className="text-xs font-bold text-[#0054A6] flex items-center space-x-1 group-hover:underline">
                            <span>Đọc chi tiết bài viết</span>
                            <span>&rarr;</span>
                          </span>
                          {(isAdmin || (isLoggedIn && post.author === user?.fullName)) && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeletePost(postId);
                              }}
                              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors z-10"
                              title="Xóa bài viết"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 bg-white border border-gray-200 rounded-3xl p-8 max-w-xl mx-auto shadow-sm space-y-4 animate-fadeIn">
                <div className="w-12 h-12 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto text-xl shadow-inner">
                  <FiInbox />
                </div>
                <p className="text-gray-400 text-sm">Không có bài viết nào thuộc {getFilterLabel()}.</p>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* 🔐 Modal Đăng Bài Viết Mới */}
      {showAddModal && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white border border-gray-200/80 w-full max-w-lg rounded-3xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-black text-gray-800 mb-5 flex items-center space-x-2 border-b border-gray-100 pb-3">
              <FiPlusCircle className="text-[#0054A6] w-5 h-5" />
              <span>Đăng Bài Viết Fanpage Mới</span>
            </h3>

            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase">Tiêu đề bài viết *</label>
                <input
                  type="text"
                  value={postForm.title}
                  onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#0054A6] text-gray-800 shadow-inner"
                  placeholder="Nhập tiêu đề nổi bật cho bài viết..."
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase">Nội dung bài đăng *</label>
                <textarea
                  rows="5"
                  value={postForm.content}
                  onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
                  className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-[#0054A6] text-gray-800 resize-none shadow-inner"
                  placeholder="Hãy viết nội dung chia sẻ chi tiết tại đây..."
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase">Hình ảnh đính kèm</label>
                
                {postForm.image ? (
                  /* Khung hiển thị ảnh xem trước (Preview) */
                  <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50 max-h-[220px] flex items-center justify-center group">
                    <img 
                      src={postForm.image} 
                      alt="Xem trước ảnh tải lên" 
                      className="w-full h-full object-cover max-h-[220px]"
                    />
                    <button
                      type="button"
                      onClick={() => setPostForm({ ...postForm, image: '' })}
                      className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors shadow"
                      title="Xóa ảnh"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  /* Khung chọn ảnh */
                  <div className="space-y-3">
                    {/* Vùng tải file từ máy tính */}
                    <label className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-[#0054A6]/50 hover:bg-blue-50/10 transition-all space-y-1">
                      <FiUpload className="w-6 h-6 text-gray-400" />
                      <span className="text-xs font-bold text-[#0054A6]">Tải ảnh lên từ thiết bị</span>
                      <span className="text-[10px] text-gray-450">Hỗ trợ định dạng JPG, PNG, WEBP (Tối đa 4MB)</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileChange} 
                        className="hidden" 
                      />
                    </label>
                    
                    {/* Nhập link URL thay thế */}
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-450 text-xs">
                        <FiImage />
                      </span>
                      <input
                        type="url"
                        placeholder="Hoặc dán URL ảnh có sẵn vào đây..."
                        value={postForm.image}
                        onChange={(e) => setPostForm({ ...postForm, image: e.target.value })}
                        className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-xs focus:outline-none focus:border-[#0054A6] text-gray-800 shadow-inner"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setPostForm({ title: '', content: '', image: '' });
                  }}
                  className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0054A6] hover:bg-[#003d80] text-white text-xs font-bold rounded-xl shadow-md transition-colors"
                >
                  Đăng bài
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
