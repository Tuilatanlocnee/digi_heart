import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiUsers, FiZap, FiGrid, FiCheck, FiX, FiTrash2, 
  FiRefreshCw, FiArrowRight, FiShield, FiFileText, FiEdit
} from 'react-icons/fi';
import { candidateAPI, ideaAPI, postAPI, newsAPI } from '../utils/api';

/**
 * View AdminDashboard - Trang quản trị trung tâm dành cho Ban chủ nhiệm CLB Digi Heart.
 * Phân chia quản lý thành viên, ý tưởng sáng tạo và bài đăng fanpage.
 */
export default function AdminDashboard() {
  const navigate = useNavigate();
  
  // Trạng thái các tab quản lý: 'ideas' | 'news'
  const [activeTab, setActiveTab] = useState('ideas');

  // Dữ liệu lấy từ API
  const [candidates] = useState([]); // Giữ làm mảng rỗng tương thích ngược
  const [ideas, setIdeas] = useState([]);
  const [posts] = useState([]);      // Giữ làm mảng rỗng tương thích ngược
  const [news, setNews] = useState([]);
  
  // Trạng thái đăng tin tức mới
  const [showAddNews, setShowAddNews] = useState(false);
  const [showEditNews, setShowEditNews] = useState(false);
  const [editingNewsId, setEditingNewsId] = useState(null);
  const [newsForm, setNewsForm] = useState({
    title: '',
    summary: '',
    content: '',
    category: 'Hoạt động Đoàn',
    author: 'Ban Truyền Thông',
    image: ''
  });
  
  // Trạng thái loading
  const [loading, setLoading] = useState(false);
  
  // Thông báo hành động
  const [message, setMessage] = useState({ text: '', type: '' });

  // 1. Kiểm tra quyền truy cập Admin & Tải dữ liệu ban đầu
  useEffect(() => {
    const token = localStorage.getItem('digiheart_admin_token');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchData();
  }, [navigate]);

  // Hàm tải dữ liệu đồng thời từ API
  const fetchData = async () => {
    setLoading(true);
    try {
      const [ideasData, newsData] = await Promise.all([
        ideaAPI.getAll(),
        newsAPI.getAll()
      ]);
      setIdeas(ideasData);
      setNews(newsData);
    } catch (error) {
      showNotify('Không thể kết nối đến máy chủ. Hệ thống đang chạy ở chế độ offline LocalStorage Fallback!', 'warning');
    } finally {
      setLoading(false);
    }
  };

  // Hàm hiển thị thông báo phản hồi nhanh
  const showNotify = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4500);
  };

  // ==========================================
  // XỬ LÝ CANDIDATES (ỨNG VIÊN GIA NHẬP)
  // ==========================================
  const handleUpdateCandidate = async (id, status) => {
    try {
      await candidateAPI.updateStatus(id, status);
      showNotify(`Đã cập nhật trạng thái ứng viên thành công!`);
      // Update local state
      setCandidates(candidates.map(cand => 
        (cand._id === id || cand.id === id) ? { ...cand, status } : cand
      ));
    } catch (error) {
      showNotify('Gặp lỗi khi cập nhật trạng thái ứng viên!', 'danger');
    }
  };

  const handleDeleteCandidate = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa hồ sơ ứng viên này không?')) return;
    try {
      await candidateAPI.delete(id);
      showNotify('Đã xóa hồ sơ ứng viên thành công!');
      setCandidates(candidates.filter(cand => cand._id !== id && cand.id !== id));
    } catch (error) {
      showNotify('Gặp lỗi khi xóa ứng viên!', 'danger');
    }
  };

  // ==========================================
  // XỬ LÝ IDEAS (Ý TƯỞNG SÁNG KIẾN SỐ)
  // ==========================================
  const handleUpdateIdea = async (id, status) => {
    try {
      await ideaAPI.updateStatus(id, status);
      showNotify(`Đã chuyển đổi trạng thái sáng kiến thành: ${status}`);
      setIdeas(ideas.map(idea => 
        (idea._id === id || idea.id === id) ? { ...idea, status } : idea
      ));
    } catch (error) {
      showNotify('Lỗi cập nhật tiến trình sáng kiến!', 'danger');
    }
  };

  const handleDeleteIdea = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa ý tưởng này không?')) return;
    try {
      await ideaAPI.delete(id);
      showNotify('Đã xóa ý tưởng thành công!');
      setIdeas(ideas.filter(idea => idea._id !== id && idea.id !== id));
    } catch (error) {
      showNotify('Lỗi xóa ý tưởng!', 'danger');
    }
  };

  // ==========================================
  // XỬ LÝ POSTS (BÀI ĐĂNG FANPAGE)
  // ==========================================
  const handleDeletePost = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài đăng này trên Fanpage không?')) return;
    try {
      await postAPI.delete(id);
      showNotify('Đã xóa bài đăng thành công khỏi dòng thời gian!');
      setPosts(posts.filter(post => post._id !== id && post.id !== id));
    } catch (error) {
      showNotify('Lỗi xóa bài đăng!', 'danger');
    }
  };

  // ==========================================
  // XỬ LÝ NEWS (TIN TỨC & SỰ KIỆN)
  // ==========================================
  const handleCreateNews = async (e) => {
    e.preventDefault();
    if (!newsForm.title || !newsForm.summary || !newsForm.content || !newsForm.author) {
      showNotify('Vui lòng điền đầy đủ các thông tin bắt buộc (*)', 'warning');
      return;
    }
    try {
      const response = await newsAPI.create(newsForm);
      showNotify('Đã đăng bài viết tin tức thành công!');
      setNews([response.news, ...news]);
      setShowAddNews(false);
      setNewsForm({
        title: '',
        summary: '',
        content: '',
        category: 'Hoạt động Đoàn',
        author: 'Ban Truyền Thông',
        image: ''
      });
    } catch (error) {
      showNotify(error.message || 'Lỗi khi đăng tin tức!', 'danger');
    }
  };

  const handleDeleteNews = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài viết tin tức này không?')) return;
    try {
      await newsAPI.delete(id);
      showNotify('Đã xóa bài viết tin tức thành công!');
      setNews(news.filter(item => item._id !== id && item.id !== id));
    } catch (error) {
      showNotify('Gặp lỗi khi xóa bài viết tin tức!', 'danger');
    }
  };
  
  const startEditNews = (item) => {
    setEditingNewsId(item._id || item.id);
    setNewsForm({
      title: item.title,
      summary: item.summary,
      content: item.content,
      category: item.category,
      author: item.author,
      image: item.image || ''
    });
    setShowEditNews(true);
  };
  
  const handleUpdateNews = async (e) => {
    e.preventDefault();
    if (!newsForm.title || !newsForm.summary || !newsForm.content || !newsForm.author) {
      showNotify('Vui lòng điền đầy đủ các thông tin bắt buộc (*)', 'warning');
      return;
    }
    try {
      const response = await newsAPI.update(editingNewsId, newsForm);
      showNotify('Đã cập nhật bài viết tin tức thành công!');
      
      const updatedNews = response.news || { ...newsForm, _id: editingNewsId };
      setNews(news.map(item => 
        (item._id === editingNewsId || item.id === editingNewsId) ? { ...item, ...updatedNews } : item
      ));
      
      setShowEditNews(false);
      setEditingNewsId(null);
      setNewsForm({
        title: '',
        summary: '',
        content: '',
        category: 'Hoạt động Đoàn',
        author: 'Ban Truyền Thông',
        image: ''
      });
    } catch (error) {
      showNotify(error.message || 'Lỗi khi cập nhật tin tức!', 'danger');
    }
  };

  // Tính toán nhanh số liệu thống kê
  const stats = {
    totalIdeas: ideas.length,
    pendingIdeas: ideas.filter(i => i.status === 'Chờ duyệt').length,
    appliedIdeas: ideas.filter(i => i.status === 'Đã áp dụng').length,
    totalNews: news.length
  };

  return (
    <div className="bg-gray-50 text-gray-800 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Dashboard */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 pb-5 border-b border-gray-200">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-800 flex items-center space-x-2">
              <FiShield className="text-[#0054A6] w-6 h-6 md:w-8 md:h-8 shrink-0" />
              <span>Bảng Điều Khiển Quản Trị</span>
            </h1>
            <p className="text-gray-400 text-xs mt-1.5 font-semibold uppercase tracking-wider">
              Hệ thống quản lý CLB Digi Heart • MobiFone Cần Thơ
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <button
              onClick={fetchData}
              className="p-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl transition-all shadow-sm flex items-center space-x-1.5 text-xs font-bold"
              disabled={loading}
              title="Làm mới dữ liệu"
            >
              <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Tải lại dữ liệu</span>
            </button>
          </div>
        </div>

        {/* Thông báo sự kiện */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-xl text-xs font-bold flex items-center space-x-2 animate-fadeIn ${
            message.type === 'danger' ? 'bg-red-50 border border-red-200 text-red-700' :
            message.type === 'warning' ? 'bg-amber-50 border border-amber-200 text-amber-700' :
            'bg-emerald-50 border border-emerald-200 text-emerald-700'
          }`}>
            <FiCheck className="w-4 h-4 flex-shrink-0" />
            <span>{message.text}</span>
          </div>
        )}

        {/* 📊 Thẻ Thống Kê Nhanh (Stats Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          
          <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-450 tracking-wider">Tổng ý tưởng sáng tạo</span>
              <h3 className="text-2xl font-black text-gray-800 mt-1">{stats.totalIdeas}</h3>
              <p className="text-[10px] text-gray-400 mt-1">Có <span className="font-bold text-amber-500">{stats.pendingIdeas}</span> ý tưởng chờ duyệt</p>
            </div>
            <div className="p-3.5 bg-amber-50 text-amber-500 rounded-xl shadow-sm">
              <FiZap className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-450 tracking-wider">Ý tưởng đã áp dụng</span>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">{stats.appliedIdeas}</h3>
              <p className="text-[10px] text-gray-400 mt-1">Đã đưa vào thực tế hoạt động</p>
            </div>
            <div className="p-3.5 bg-emerald-50 text-emerald-500 rounded-xl shadow-sm">
              <FiCheck className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-450 tracking-wider">Bài viết tin tức</span>
              <h3 className="text-2xl font-black text-gray-800 mt-1">{stats.totalNews}</h3>
              <p className="text-[10px] text-gray-400 mt-1">Đã đăng lên cổng tin tức & sự kiện</p>
            </div>
            <div className="p-3.5 bg-blue-50 text-[#0054A6] rounded-xl shadow-sm">
              <FiFileText className="w-6 h-6" />
            </div>
          </div>

        </div>

        {/* 🗂️ Menu Tab Quản Lý */}
        <div className="flex overflow-x-auto whitespace-nowrap border-b border-gray-200 mb-6 bg-white p-2 rounded-2xl border border-gray-150 shadow-sm space-x-1 scrollbar-none">
          <button
            onClick={() => setActiveTab('ideas')}
            className={`shrink-0 px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
              activeTab === 'ideas' 
                ? 'bg-[#E30613]/5 text-[#E30613] shadow-sm border border-[#E30613]/10' 
                : 'text-gray-550 hover:bg-gray-50'
            }`}
          >
            <FiZap className="w-4 h-4" />
            <span>Sáng Kiến Số Hóa ({stats.totalIdeas})</span>
          </button>
          <button
            onClick={() => setActiveTab('news')}
            className={`shrink-0 px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
              activeTab === 'news' 
                ? 'bg-blue-50 text-[#0054A6] shadow-sm border border-blue-100/50' 
                : 'text-gray-550 hover:bg-gray-50'
            }`}
          >
            <FiFileText className="w-4 h-4" />
            <span>Quản lý Tin Tức ({stats.totalNews})</span>
          </button>
        </div>

        {/* 📑 Nội dung hiển thị theo Tab */}
        {loading ? (
          <div className="bg-white border border-gray-200 rounded-3xl p-16 text-center shadow-sm">
            <span className="inline-block w-8 h-8 border-4 border-[#0054A6] border-t-transparent rounded-full animate-spin"></span>
            <p className="text-gray-400 text-xs font-bold mt-4 uppercase">Đang tải dữ liệu từ máy chủ...</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200/80 rounded-3xl p-5 md:p-6 shadow-sm">
            


            {/* TAB 2: QUẢN LÝ SÁNG KIẾN */}
            {activeTab === 'ideas' && (
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
                  <FiZap className="text-[#E30613]" />
                  <span>Danh sách ý tưởng, sáng kiến chuyển đổi số</span>
                </h3>

                {ideas.length === 0 ? (
                  <div className="py-12 text-center text-gray-400 text-xs">Hiện tại chưa có ý tưởng đóng góp nào.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-gray-600 min-w-[800px]">
                      <thead className="text-[10px] uppercase bg-gray-50 text-gray-500 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3.5">Người đóng góp</th>
                          <th className="px-4 py-3.5">Tên sáng kiến</th>
                          <th className="px-4 py-3.5">Mô tả giải pháp</th>
                          <th className="px-4 py-3.5 text-center">Tiến trình</th>
                          <th className="px-4 py-3.5 text-center">Cập nhật tiến trình</th>
                          <th className="px-4 py-3.5 text-center">Xóa</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-155">
                        {ideas.map((idea) => {
                          const ideaId = idea._id || idea.id;
                          return (
                            <tr key={ideaId} className="hover:bg-gray-50/50">
                              <td className="px-4 py-4">
                                <p className="font-bold text-gray-800">{idea.fullName}</p>
                                <p className="text-gray-400 text-[10px] mt-0.5">{idea.email || 'Không để lại email'}</p>
                                <p className="text-gray-400 text-[9px] mt-0.5">Ngày gửi: {idea.date}</p>
                              </td>
                              <td className="px-4 py-4 font-bold text-[#0054A6] max-w-[180px]">{idea.title}</td>
                              <td className="px-4 py-4 max-w-[280px]">
                                <p className="text-gray-600 line-clamp-3 leading-relaxed" title={idea.description}>
                                  {idea.description}
                                </p>
                              </td>
                              <td className="px-4 py-4 text-center">
                                <span className={`px-2.5 py-1.5 rounded-full font-bold text-[9px] ${
                                  idea.status === 'Đã áp dụng' ? 'bg-emerald-50 text-emerald-600' :
                                  idea.status === 'Đang thử nghiệm' ? 'bg-blue-50 text-blue-500' :
                                  idea.status === 'Đã tiếp nhận' ? 'bg-purple-50 text-purple-600' :
                                  'bg-amber-50 text-amber-600'
                                }`}>
                                  {idea.status}
                                </span>
                              </td>
                              <td className="px-4 py-4 text-center">
                                <div className="flex flex-col space-y-1 items-center justify-center">
                                  {idea.status === 'Chờ duyệt' && (
                                    <button
                                      onClick={() => handleUpdateIdea(ideaId, 'Đã tiếp nhận')}
                                      className="px-2 py-1 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-md text-[9px] font-bold transition-all w-24"
                                    >
                                      Tiếp nhận
                                    </button>
                                  )}
                                  {(idea.status === 'Đã tiếp nhận' || idea.status === 'Chờ duyệt') && (
                                    <button
                                      onClick={() => handleUpdateIdea(ideaId, 'Đang thử nghiệm')}
                                      className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-md text-[9px] font-bold transition-all w-24"
                                    >
                                      Thử nghiệm
                                    </button>
                                  )}
                                  {idea.status === 'Đang thử nghiệm' && (
                                    <button
                                      onClick={() => handleUpdateIdea(ideaId, 'Đã áp dụng')}
                                      className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-md text-[9px] font-bold transition-all w-24"
                                    >
                                      Áp dụng thực tế
                                    </button>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-4 text-center">
                                <button
                                  onClick={() => handleDeleteIdea(ideaId)}
                                  className="p-1.5 bg-gray-50 hover:bg-red-50 hover:text-red-500 text-gray-400 rounded-lg transition-colors"
                                  title="Xóa ý tưởng đóng góp"
                                >
                                  <FiTrash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}



            {/* TAB 4: QUẢN LÝ TIN TỨC */}
            {activeTab === 'news' && (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-gray-100 pb-4 animate-fadeIn">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center space-x-2">
                    <FiFileText className="text-[#0054A6]" />
                    <span>Danh sách bài viết tin tức & sự kiện</span>
                  </h3>
                  <button
                    onClick={() => setShowAddNews(true)}
                    className="px-4 py-2 bg-[#0054A6] hover:bg-[#003d80] text-white text-xs font-bold rounded-xl shadow-md transition-colors flex items-center space-x-1.5 self-start"
                  >
                    <span>+ Đăng tin tức mới</span>
                  </button>
                </div>

                {news.length === 0 ? (
                  <div className="py-12 text-center text-gray-400 text-xs animate-fadeIn">Hiện tại chưa có tin tức nào được đăng.</div>
                ) : (
                  <div className="overflow-x-auto animate-fadeIn">
                    <table className="w-full text-left text-xs text-gray-600 min-w-[800px]">
                      <thead className="text-[10px] uppercase bg-gray-50 text-gray-500 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3.5">Tiêu đề tin tức</th>
                          <th className="px-4 py-3.5">Danh mục</th>
                          <th className="px-4 py-3.5">Người viết / Ngày đăng</th>
                          <th className="px-4 py-3.5">Tóm tắt ngắn</th>
                          <th className="px-4 py-3.5 text-center">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-155">
                        {news.map((item) => {
                          const itemId = item._id || item.id;
                          return (
                            <tr key={itemId} className="hover:bg-gray-50/50">
                              <td className="px-4 py-4">
                                <div className="flex items-center space-x-3 max-w-[280px]">
                                  {item.image && (
                                    <img
                                      src={item.image}
                                      alt="Cover"
                                      className="w-10 h-10 object-cover rounded-lg shrink-0 border border-gray-100"
                                    />
                                  )}
                                  <p className="font-bold text-gray-800 line-clamp-2" title={item.title}>
                                    {item.title}
                                  </p>
                                </div>
                              </td>
                              <td className="px-4 py-4 font-semibold">
                                <span className="px-2.5 py-1 bg-blue-50/80 text-[#0054A6] rounded-md font-bold text-[10px]">
                                  {item.category}
                                </span>
                              </td>
                              <td className="px-4 py-4">
                                <p className="font-bold text-gray-700">{item.author}</p>
                                <p className="text-gray-400 text-[10px] mt-0.5">{item.date}</p>
                              </td>
                              <td className="px-4 py-4 max-w-[280px]">
                                <p className="text-gray-500 line-clamp-2" title={item.summary}>
                                  {item.summary}
                                </p>
                              </td>
                              <td className="px-4 py-4 text-center">
                                <div className="flex items-center justify-center space-x-1.5">
                                  <button
                                    onClick={() => startEditNews(item)}
                                    className="p-1.5 bg-blue-50 hover:bg-blue-100 text-[#0054A6] rounded-lg transition-colors"
                                    title="Chỉnh sửa bài viết"
                                  >
                                    <FiEdit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteNews(itemId)}
                                    className="p-1.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg transition-colors"
                                    title="Xóa bài viết tin tức"
                                  >
                                    <FiTrash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

          </div>
        )}

        {/* 🔐 Modal Đăng Tin Tức Mới */}
        {showAddNews && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white border border-gray-200/80 w-full max-w-2xl rounded-3xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-black text-gray-800 mb-5 flex items-center space-x-2 border-b border-gray-100 pb-3">
                <FiFileText className="text-[#0054A6] w-5 h-5" />
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
                    <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase">Ảnh đại diện bài viết</label>
                    {newsForm.image ? (
                      <div className="relative w-full h-24 rounded-xl border border-gray-200 overflow-hidden group">
                        <img
                          src={newsForm.image}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => setNewsForm({ ...newsForm, image: '' })}
                            className="bg-red-500 hover:bg-red-600 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg transition-colors shadow-md"
                          >
                            Xóa ảnh
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="w-full h-24 border border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#0054A6] hover:bg-blue-50/20 transition-all">
                        <span className="text-gray-550 text-[11px] font-bold">Chọn ảnh từ thiết bị</span>
                        <span className="text-[9px] text-gray-400 mt-1">Hỗ trợ JPG, PNG, WEBP</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setNewsForm({ ...newsForm, image: reader.result });
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    )}
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
                      setShowAddNews(false);
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
          </div>
        )}
        
        {/* 🔐 Modal Chỉnh Sửa Tin Tức */}
        {showEditNews && (
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
                    <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase">Ảnh đại diện bài viết</label>
                    {newsForm.image ? (
                      <div className="relative w-full h-24 rounded-xl border border-gray-200 overflow-hidden group">
                        <img
                          src={newsForm.image}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => setNewsForm({ ...newsForm, image: '' })}
                            className="bg-red-500 hover:bg-red-600 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg transition-colors shadow-md"
                          >
                            Xóa ảnh
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="w-full h-24 border border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#0054A6] hover:bg-blue-50/20 transition-all">
                        <span className="text-gray-550 text-[11px] font-bold">Chọn ảnh từ thiết bị</span>
                        <span className="text-[9px] text-gray-400 mt-1">Hỗ trợ JPG, PNG, WEBP</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setNewsForm({ ...newsForm, image: reader.result });
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    )}
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
                      setShowEditNews(false);
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
          </div>
        )}

      </div>
    </div>

  );
}
