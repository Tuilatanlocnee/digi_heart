import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiCalendar, FiUser, FiSearch, FiArrowLeft, FiTag, FiInbox, FiPlusCircle, FiEdit, FiTrash2 } from 'react-icons/fi';
import { newsAPI } from '../utils/api';

/**
 * View News - Trang hiển thị Tin tức & Sự kiện của CLB Digi Heart.
 * Dữ liệu được kết nối động tới database MongoDB thông qua Backend API.
 * Đặc biệt: Admin đăng nhập có thể đăng bài viết tin tức trực tiếp tại trang này.
 */
export default function News() {
  // Bộ lọc danh mục đang được chọn
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  // Từ khóa tìm kiếm bài viết
  const [searchQuery, setSearchQuery] = useState('');
  // Bài viết đang được mở xem chi tiết (nếu null là đang ở màn hình danh sách)
  const [activePost, setActivePost] = useState(null);

  // Trạng thái danh sách tin tức động từ API
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Trạng thái quản trị của Admin
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingNewsId, setEditingNewsId] = useState(null);
  const [newsForm, setNewsForm] = useState({
    title: '',
    summary: '',
    content: '',
    category: 'Hoạt động Đoàn',
    author: 'Ban Truyền Thông',
    image: ''
  });
  const [notify, setNotify] = useState({ text: '', type: '' });

  // Tải danh sách tin tức từ backend khi trang khởi chạy
  const fetchNews = async () => {
    try {
      const data = await newsAPI.getAll();
      setNewsList(data);
    } catch (error) {
      console.error('Không lấy được danh sách tin tức:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();

    // Kiểm tra tư cách Admin
    const token = localStorage.getItem('digiheart_admin_token');
    const userStr = localStorage.getItem('digiheart_admin_user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        setIsAdmin(user.role === 'admin' || user.role === 'superadmin');
      } catch {
        setIsAdmin(false);
      }
    }
  }, []);

  // Xử lý đăng tin tức mới
  const handleCreateNews = async (e) => {
    e.preventDefault();
    if (!newsForm.title || !newsForm.summary || !newsForm.content || !newsForm.author) {
      alert('Vui lòng điền đầy đủ các thông tin bắt buộc (*)');
      return;
    }
    try {
      const response = await newsAPI.create(newsForm);
      setNewsList([response.news, ...newsList]);
      setShowAddModal(false);
      setNewsForm({
        title: '',
        summary: '',
        content: '',
        category: 'Hoạt động Đoàn',
        author: 'Ban Truyền Thông',
        image: ''
      });
      setNotify({ text: 'Đăng bài viết tin tức thành công!', type: 'success' });
      setTimeout(() => setNotify({ text: '', type: '' }), 4500);
    } catch (error) {
      alert(error.message || 'Lỗi khi đăng tin tức!');
    }
  };

  // Xóa bài viết tin tức trực tiếp
  const handleDeleteNews = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài viết tin tức này không?')) return;
    try {
      await newsAPI.delete(id);
      setNewsList(newsList.filter(item => item._id !== id && item.id !== id));
      setNotify({ text: 'Đã xóa bài viết tin tức thành công!', type: 'success' });
      setTimeout(() => setNotify({ text: '', type: '' }), 4500);
    } catch (error) {
      alert(error.message || 'Lỗi khi xóa bài viết tin tức!');
    }
  };

  // Bắt đầu chỉnh sửa bài viết tin tức trực tiếp
  const startEditNews = (post, e) => {
    e.stopPropagation();
    setEditingNewsId(post._id || post.id);
    setNewsForm({
      title: post.title,
      summary: post.summary,
      content: post.content,
      category: post.category,
      author: post.author,
      image: post.image || ''
    });
    setShowEditModal(true);
  };

  // Gửi cập nhật tin tức lên API
  const handleUpdateNews = async (e) => {
    e.preventDefault();
    if (!newsForm.title || !newsForm.summary || !newsForm.content || !newsForm.author) {
      alert('Vui lòng điền đầy đủ các thông tin bắt buộc (*)');
      return;
    }
    try {
      const response = await newsAPI.update(editingNewsId, newsForm);
      const updatedNews = response.news || { ...newsForm, _id: editingNewsId };

      setNewsList(newsList.map(item =>
        (item._id === editingNewsId || item.id === editingNewsId) ? { ...item, ...updatedNews } : item
      ));

      setShowEditModal(false);
      setEditingNewsId(null);
      setNewsForm({
        title: '',
        summary: '',
        content: '',
        category: 'Hoạt động Đoàn',
        author: 'Ban Truyền Thông',
        image: ''
      });
      setNotify({ text: 'Chỉnh sửa bài viết tin tức thành công!', type: 'success' });
      setTimeout(() => setNotify({ text: '', type: '' }), 4500);
    } catch (error) {
      alert(error.message || 'Lỗi khi chỉnh sửa bài viết tin tức!');
    }
  };

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

          <article className="bg-white border border-gray-200/80 rounded-3xl p-6 md:p-10 shadow-lg animate-fadeIn">
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
        <div className="text-center max-w-3xl mx-auto mb-12 relative">
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-black mb-4 text-gray-800">
            Tin Tức & <span className="text-[#0054A6]">Sự Kiện</span>
          </h1>
          <p className="text-gray-500 font-medium">
            Cập nhật những tin tức mới nhất về các hoạt động hỗ trợ xã hội, các lớp đào tạo và cẩm nang công nghệ của Digi Heart tại Cần Thơ.
          </p>

          {isAdmin && (
            <div className="mt-6 flex justify-center animate-fadeIn">
              <button
                onClick={() => setShowAddModal(true)}
                className="px-6 py-2.5 bg-[#0054A6] hover:bg-[#003d80] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center space-x-2 hover:scale-105"
              >
                <FiPlusCircle className="w-4 h-4 text-emerald-300" />
                <span>Đăng Tin Tức Mới</span>
              </button>
            </div>
          )}
        </div>

        {/* Thông báo sự kiện */}
        {notify.text && (
          <div className="max-w-xl mx-auto mb-8 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold text-center animate-fadeIn">
            🎉 {notify.text}
          </div>
        )}

        {/* Thanh tìm kiếm và bộ lọc */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12 bg-white border border-gray-200/80 p-4 rounded-2xl shadow-sm">

          {/* Nhóm Bộ lọc Category */}
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all border ${selectedCategory === cat
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

        {/* Trạng thái Loading */}
        {loading ? (
          <div className="bg-white border border-gray-200 rounded-3xl p-16 text-center shadow-sm max-w-md mx-auto">
            <span className="inline-block w-8 h-8 border-4 border-[#0054A6] border-t-transparent rounded-full animate-spin"></span>
            <p className="text-gray-400 text-xs font-bold mt-4 uppercase">Đang tải danh sách bài viết...</p>
          </div>
        ) : filteredNews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredNews.map((post) => {
              const postId = post._id || post.id;
              return (
                <div
                  key={postId}
                  onClick={() => setActivePost(post)}
                  className="bg-white border border-gray-200/80 rounded-2xl overflow-hidden hover:border-[#0054A6]/30 hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col h-full shadow-sm animate-fadeIn"
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
                    {isAdmin && (
                      <div className="absolute top-4 right-4 flex space-x-1.5 z-10">
                        <button
                          onClick={(e) => startEditNews(post, e)}
                          className="p-1.5 bg-white/95 hover:bg-white text-[#0054A6] rounded-lg shadow-md transition-all hover:scale-110"
                          title="Sửa bài viết"
                        >
                          <FiEdit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNews(postId);
                          }}
                          className="p-1.5 bg-white/95 hover:bg-red-50 text-red-500 rounded-lg shadow-md transition-all hover:scale-110"
                          title="Xóa bài viết"
                        >
                          <FiTrash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex items-center space-x-1 text-xs text-gray-400 mb-3">
                      <FiCalendar className="w-3.5 h-3.5" />
                      <span>{post.date}</span>
                    </div>

                    <h3 className="text-lg md:text-xl font-bold mb-3 text-gray-800 group-hover:text-[#0054A6] transition-colors line-clamp-2 leading-tight">
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
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-white border border-gray-200 rounded-3xl shadow-sm p-8 max-w-xl mx-auto space-y-4 animate-fadeIn">
            <div className="w-12 h-12 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto text-xl shadow-inner">
              <FiInbox />
            </div>
            <p className="text-gray-400 text-sm">Không tìm thấy bài viết nào phù hợp với bộ lọc hoặc từ khóa.</p>
          </div>
        )}

      </div>

      {/* 🔐 Modal Đăng Tin Tức Mới dành cho Admin */}
      {showAddModal && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white border border-gray-200/80 w-full max-w-2xl rounded-3xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-black text-gray-800 mb-5 flex items-center space-x-2 border-b border-gray-100 pb-3">
              <FiTag className="text-[#0054A6] w-5 h-5" />
              <span>Đăng Tin Tức & Sự Kiện Mới</span>
            </h3>

            <form onSubmit={handleCreateNews} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase">Tiêu đề tin tức *</label>
                  <input
                    type="text"
                    value={newsForm.title}
                    onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#0054A6] text-gray-800 shadow-inner"
                    placeholder="Nhập tiêu đề nổi bật..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase">Tác giả (Người viết) *</label>
                  <input
                    type="text"
                    value={newsForm.author}
                    onChange={(e) => setNewsForm({ ...newsForm, author: e.target.value })}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#0054A6] text-gray-800 shadow-inner"
                    placeholder="Ban Truyền Thông, Nguyễn Văn A..."
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase">Danh mục tin tức *</label>
                  <select
                    value={newsForm.category}
                    onChange={(e) => setNewsForm({ ...newsForm, category: e.target.value })}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#0054A6] text-gray-800"
                    required
                  >
                    <option value="Hoạt động Đoàn">Hoạt động Đoàn</option>
                    <option value="Đào tạo">Đào tạo</option>
                    <option value="Cẩm nang số">Cẩm nang số</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase">Link ảnh đại diện (URL)</label>
                  <input
                    type="url"
                    value={newsForm.image}
                    onChange={(e) => setNewsForm({ ...newsForm, image: e.target.value })}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#0054A6] text-gray-800 shadow-inner"
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase">Tóm tắt ngắn bài viết *</label>
                <input
                  type="text"
                  value={newsForm.summary}
                  onChange={(e) => setNewsForm({ ...newsForm, summary: e.target.value })}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#0054A6] text-gray-800 shadow-inner"
                  placeholder="Tóm tắt ngắn gọn nội dung tin tức..."
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase">Nội dung chi tiết tin tức *</label>
                <textarea
                  rows="6"
                  value={newsForm.content}
                  onChange={(e) => setNewsForm({ ...newsForm, content: e.target.value })}
                  className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-[#0054A6] text-gray-800 resize-none shadow-inner"
                  placeholder="Viết nội dung bài viết tin tức tại đây..."
                  required
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setNewsForm({
                      title: '',
                      summary: '',
                      content: '',
                      category: 'Hoạt động Đoàn',
                      author: 'Ban Truyền Thông',
                      image: ''
                    });
                  }}
                  className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0054A6] hover:bg-[#003d80] text-white text-xs font-bold rounded-xl shadow-md transition-colors"
                >
                  Đăng tin tức
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* 🔐 Modal Chỉnh Sửa Tin Tức dành cho Admin */}
      {showEditModal && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white border border-gray-200/80 w-full max-w-2xl rounded-3xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-black text-gray-800 mb-5 flex items-center space-x-2 border-b border-gray-100 pb-3">
              <FiEdit className="text-[#0054A6] w-5 h-5" />
              <span>Chỉnh Sửa Tin Tức & Sự Kiện</span>
            </h3>

            <form onSubmit={handleUpdateNews} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase">Tiêu đề tin tức *</label>
                  <input
                    type="text"
                    value={newsForm.title}
                    onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#0054A6] text-gray-800 shadow-inner"
                    placeholder="Nhập tiêu đề nổi bật..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase">Tác giả (Người viết) *</label>
                  <input
                    type="text"
                    value={newsForm.author}
                    onChange={(e) => setNewsForm({ ...newsForm, author: e.target.value })}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#0054A6] text-gray-800 shadow-inner"
                    placeholder="Ban Truyền Thông, Nguyễn Văn A..."
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase">Danh mục tin tức *</label>
                  <select
                    value={newsForm.category}
                    onChange={(e) => setNewsForm({ ...newsForm, category: e.target.value })}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#0054A6] text-gray-800"
                    required
                  >
                    <option value="Hoạt động Đoàn">Hoạt động Đoàn</option>
                    <option value="Đào tạo">Đào tạo</option>
                    <option value="Cẩm nang số">Cẩm nang số</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase">Link ảnh đại diện (URL)</label>
                  <input
                    type="url"
                    value={newsForm.image}
                    onChange={(e) => setNewsForm({ ...newsForm, image: e.target.value })}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#0054A6] text-gray-800 shadow-inner"
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase">Tóm tắt ngắn bài viết *</label>
                <input
                  type="text"
                  value={newsForm.summary}
                  onChange={(e) => setNewsForm({ ...newsForm, summary: e.target.value })}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#0054A6] text-gray-800 shadow-inner"
                  placeholder="Tóm tắt ngắn gọn nội dung tin tức..."
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase">Nội dung chi tiết tin tức *</label>
                <textarea
                  rows="6"
                  value={newsForm.content}
                  onChange={(e) => setNewsForm({ ...newsForm, content: e.target.value })}
                  className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-[#0054A6] text-gray-800 resize-none shadow-inner"
                  placeholder="Viết nội dung bài viết tin tức tại đây..."
                  required
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingNewsId(null);
                    setNewsForm({
                      title: '',
                      summary: '',
                      content: '',
                      category: 'Hoạt động Đoàn',
                      author: 'Ban Truyền Thông',
                      image: ''
                    });
                  }}
                  className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0054A6] hover:bg-[#003d80] text-white text-xs font-bold rounded-xl shadow-md transition-colors"
                >
                  Cập nhật tin tức
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
