import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiUsers, FiZap, FiGrid, FiCheck, FiX, FiTrash2, 
  FiRefreshCw, FiArrowRight, FiShield, FiFileText, FiEdit, FiMail
} from 'react-icons/fi';
import { candidateAPI, ideaAPI, postAPI } from '../utils/api';

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
  const [posts, setPosts] = useState([]);
  const [deletedPosts, setDeletedPosts] = useState([]);
  
  // Trạng thái đăng bài viết tin tức mới
  const [showAddPost, setShowAddPost] = useState(false);
  const [showEditPost, setShowEditPost] = useState(false);
  const [editingPostId, setEditingPostId] = useState(null);
  const [postForm, setPostForm] = useState({
    title: '',
    content: '',
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
      const [ideasData, postsData, deletedPostsData] = await Promise.all([
        ideaAPI.getAll(),
        postAPI.getAll(),
        postAPI.getDeleted()
      ]);
      setIdeas(ideasData);
      setPosts(postsData);
      setDeletedPosts(deletedPostsData);
    } catch (error) {
      console.error('Lỗi tải dữ liệu admin:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        showNotify('Phiên đăng nhập đã hết hạn hoặc token không hợp lệ. Vui lòng đăng nhập lại!', 'danger');
        localStorage.removeItem('digiheart_admin_token');
        localStorage.removeItem('digiheart_admin_user');
        setTimeout(() => {
          navigate('/admin/login');
        }, 2000);
      } else {
        showNotify('Không thể kết nối đến máy chủ. Hệ thống đang chạy ở chế độ offline LocalStorage Fallback!', 'warning');
      }
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
  // XỬ LÝ POSTS (BÀI ĐĂNG TIN TỨC FANPAGE)
  // ==========================================
  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!postForm.title || !postForm.content) {
      showNotify('Vui lòng điền đầy đủ các thông tin bắt buộc (*)', 'warning');
      return;
    }
    try {
      const response = await postAPI.create({
        title: postForm.title,
        content: postForm.content,
        image: postForm.image || null
      });
      showNotify('Đã đăng bài viết tin tức thành công!');
      setPosts([response.post, ...posts]);
      setShowAddPost(false);
      setPostForm({ title: '', content: '', image: '' });
    } catch (error) {
      showNotify(error.message || 'Lỗi khi đăng bài viết!', 'danger');
    }
  };

  const handleDeletePost = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài đăng này không? Bài viết sẽ được chuyển vào mục Thùng rác.')) return;
    try {
      await postAPI.delete(id);
      showNotify('Đã chuyển bài viết vào Thùng rác thành công!');
      const deletedItem = posts.find(post => post._id === id || post.id === id);
      setPosts(posts.filter(post => post._id !== id && post.id !== id));
      if (deletedItem) {
        setDeletedPosts([{ ...deletedItem, isDeleted: true }, ...deletedPosts]);
      } else {
        fetchData();
      }
    } catch (error) {
      showNotify('Lỗi xóa bài đăng!', 'danger');
    }
  };

  const handleRestorePost = async (id) => {
    try {
      await postAPI.restore(id);
      showNotify('Đã khôi phục bài viết thành công!');
      const restoredItem = deletedPosts.find(post => post._id === id || post.id === id);
      setDeletedPosts(deletedPosts.filter(post => post._id !== id && post.id !== id));
      if (restoredItem) {
        setPosts([{ ...restoredItem, isDeleted: false }, ...posts]);
      } else {
        fetchData();
      }
    } catch (error) {
      showNotify('Lỗi khôi phục bài viết!', 'danger');
    }
  };

  const handleForceDeletePost = async (id) => {
    if (!window.confirm('CẢNH BÁO: Bạn có chắc chắn muốn xóa vĩnh viễn bài viết này? Hành động này sẽ không thể khôi phục!')) return;
    try {
      await postAPI.forceDelete(id);
      showNotify('Đã xóa vĩnh viễn bài viết thành công khỏi cơ sở dữ liệu!');
      setDeletedPosts(deletedPosts.filter(post => post._id !== id && post.id !== id));
    } catch (error) {
      showNotify('Lỗi xóa vĩnh viễn bài viết!', 'danger');
    }
  };
  
  const startEditPost = (item) => {
    setEditingPostId(item._id || item.id);
    setPostForm({
      title: item.title,
      content: item.content,
      image: item.image || ''
    });
    setShowEditPost(true);
  };
  
  const handleUpdatePost = async (e) => {
    e.preventDefault();
    if (!postForm.title || !postForm.content) {
      showNotify('Vui lòng điền đầy đủ các thông tin bắt buộc (*)', 'warning');
      return;
    }
    try {
      const response = await postAPI.update(editingPostId, {
        title: postForm.title,
        content: postForm.content,
        image: postForm.image || null
      });
      showNotify('Đã cập nhật bài viết thành công!');
      
      const updatedPost = response.post || { ...postForm, _id: editingPostId };
      setPosts(posts.map(item => 
        (item._id === editingPostId || item.id === editingPostId) ? { ...item, ...updatedPost } : item
      ));
      
      setShowEditPost(false);
      setEditingPostId(null);
      setPostForm({ title: '', content: '', image: '' });
    } catch (error) {
      showNotify(error.message || 'Lỗi khi cập nhật bài viết!', 'danger');
    }
  };

  // Tính toán nhanh số liệu thống kê
  const stats = {
    totalIdeas: ideas.filter(i => i.type !== 'Góp ý').length,
    pendingIdeas: ideas.filter(i => i.type !== 'Góp ý' && i.status === 'Chờ duyệt').length,
    appliedIdeas: ideas.filter(i => i.type !== 'Góp ý' && i.status === 'Đã áp dụng').length,
    totalFeedbacks: ideas.filter(i => i.type === 'Góp ý').length,
    pendingFeedbacks: ideas.filter(i => i.type === 'Góp ý' && i.status === 'Chờ duyệt').length,
    totalNews: posts.length
  };

  return (
    <div className="bg-[#f8fafc] text-slate-800 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Dashboard */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 pb-6 border-b border-slate-200/50">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 text-[#0054A6] rounded-full text-[10px] font-bold uppercase tracking-wider mb-2.5 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0054A6] animate-pulse"></span>
              <span>Doanh Nghiệp • Digi Heart Portal</span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-800 flex items-center space-x-3 tracking-tight">
              <div className="p-2 bg-[#0054A6]/5 rounded-xl border border-[#0054A6]/10">
                <FiShield className="text-[#0054A6] w-6 h-6 md:w-7 md:h-7 shrink-0" />
              </div>
              <span>Bảng Điều Khiển Quản Lý</span>
            </h1>
            <p className="text-slate-400 text-xs mt-1.5 font-semibold uppercase tracking-widest pl-1">
              Hệ thống quản lý CLB Digi Heart • MobiFone Cần Thơ
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-5 md:mt-0">
            <button
              onClick={fetchData}
              className="px-5 py-2.5 bg-white border border-slate-200/80 hover:border-[#0054A6]/30 hover:text-[#0054A6] text-slate-600 rounded-xl transition-all shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-md flex items-center space-x-2 text-xs font-bold active:scale-95 duration-200"
              disabled={loading}
              title="Làm mới dữ liệu"
            >
              <FiRefreshCw className={`w-4 h-4 text-[#0054A6] ${loading ? 'animate-spin' : ''}`} />
              <span>Đồng bộ dữ liệu</span>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          <div className="bg-white border-l-4 border-l-amber-500 border border-y-slate-100 border-r-slate-100 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.015)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.05)] hover:-translate-y-1 transition-all duration-300 flex items-center justify-between group">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">Ý tưởng sáng tạo</span>
              <h3 className="text-3xl font-black text-slate-800 mt-1">{stats.totalIdeas}</h3>
              <div className="text-[10px] text-slate-450 mt-2 flex items-center space-x-1">
                <span>Chờ duyệt:</span>
                <span className="font-extrabold text-amber-650 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100/30">{stats.pendingIdeas}</span>
              </div>
            </div>
            <div className="p-4 bg-gradient-to-br from-amber-50 to-amber-100/30 text-amber-500 rounded-xl shadow-inner group-hover:scale-105 transition-transform duration-300">
              <FiZap className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white border-l-4 border-l-emerald-500 border border-y-slate-100 border-r-slate-100 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.015)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.05)] hover:-translate-y-1 transition-all duration-300 flex items-center justify-between group">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">Ý tưởng đã áp dụng</span>
              <h3 className="text-3xl font-black text-emerald-600 mt-1">{stats.appliedIdeas}</h3>
              <div className="text-[10px] text-slate-450 mt-2">
                <span className="bg-emerald-50/50 text-emerald-650 px-2 py-0.5 rounded-md border border-emerald-100/30 font-bold">Đã đưa vào thực tế</span>
              </div>
            </div>
            <div className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100/30 text-emerald-500 rounded-xl shadow-inner group-hover:scale-105 transition-transform duration-300">
              <FiCheck className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white border-l-4 border-l-purple-500 border border-y-slate-100 border-r-slate-100 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.015)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.05)] hover:-translate-y-1 transition-all duration-300 flex items-center justify-between group">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">Liên hệ & Góp ý</span>
              <h3 className="text-3xl font-black text-purple-650 mt-1">{stats.totalFeedbacks}</h3>
              <div className="text-[10px] text-slate-450 mt-2 flex items-center space-x-1">
                <span>Chưa xử lý:</span>
                <span className="font-extrabold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100/30">{stats.pendingFeedbacks}</span>
              </div>
            </div>
            <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100/30 text-purple-500 rounded-xl shadow-inner group-hover:scale-105 transition-transform duration-300">
              <FiMail className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white border-l-4 border-l-[#0054A6] border border-y-slate-100 border-r-slate-100 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.015)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.05)] hover:-translate-y-1 transition-all duration-300 flex items-center justify-between group">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">Bài viết tin tức</span>
              <h3 className="text-3xl font-black text-[#0054A6] mt-1">{stats.totalNews}</h3>
              <div className="text-[10px] text-slate-455 mt-2">
                <span className="bg-blue-50/50 text-[#0054A6] px-2 py-0.5 rounded-md border border-blue-100/30 font-bold">Đã đăng lên tin tức</span>
              </div>
            </div>
            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100/30 text-[#0054A6] rounded-xl shadow-inner group-hover:scale-105 transition-transform duration-300">
              <FiFileText className="w-5 h-5" />
            </div>
          </div>

        </div>

        {/* 🗂️ Menu Tab Quản Lý */}
        <div className="flex overflow-x-auto whitespace-nowrap border-b border-slate-200 mb-8 space-x-8 scrollbar-none pl-2">
          <button
            onClick={() => setActiveTab('ideas')}
            className={`shrink-0 pb-4 px-1 text-sm font-bold transition-all duration-300 flex items-center space-x-2 border-b-2 ${
              activeTab === 'ideas' 
                ? 'border-[#0054A6] text-[#0054A6]' 
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <FiZap className="w-4 h-4" />
            <span>Sáng Kiến Số Hóa ({stats.totalIdeas})</span>
          </button>
          
          <button
            onClick={() => setActiveTab('feedbacks')}
            className={`shrink-0 pb-4 px-1 text-sm font-bold transition-all duration-300 flex items-center space-x-2 border-b-2 ${
              activeTab === 'feedbacks' 
                ? 'border-purple-500 text-purple-600' 
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <FiMail className="w-4 h-4" />
            <span>Liên Hệ & Góp Ý ({stats.totalFeedbacks})</span>
          </button>

          <button
            onClick={() => setActiveTab('news')}
            className={`shrink-0 pb-4 px-1 text-sm font-bold transition-all duration-300 flex items-center space-x-2 border-b-2 ${
              activeTab === 'news' 
                ? 'border-[#0054A6] text-[#0054A6]' 
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <FiFileText className="w-4 h-4" />
            <span>Quản lý Tin Tức ({stats.totalNews})</span>
          </button>
          
          <button
            onClick={() => setActiveTab('trash')}
            className={`shrink-0 pb-4 px-1 text-sm font-bold transition-all duration-300 flex items-center space-x-2 border-b-2 ${
              activeTab === 'trash' 
                ? 'border-red-500 text-red-600' 
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <FiTrash2 className="w-4 h-4" />
            <span>Thùng rác bài viết ({deletedPosts.length})</span>
          </button>
        </div>

        {/* 📑 Nội dung hiển thị theo Tab */}
        {loading ? (
          <div className="bg-white border border-gray-200 rounded-3xl p-16 text-center shadow-sm">
            <span className="inline-block w-8 h-8 border-4 border-[#0054A6] border-t-transparent rounded-full animate-spin"></span>
            <p className="text-gray-400 text-xs font-bold mt-4 uppercase">Đang tải dữ liệu từ máy chủ...</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
            


            {/* TAB 2: QUẢN LÝ SÁNG KIẾN */}
            {activeTab === 'ideas' && (
              <div>
                <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center space-x-2 pb-4 border-b border-slate-100">
                  <FiZap className="text-[#0054A6] w-5 h-5" />
                  <span>Danh sách ý tưởng, sáng kiến chuyển đổi số</span>
                </h3>

                {ideas.filter(i => i.type !== 'Góp ý').length === 0 ? (
                  <div className="py-12 text-center text-gray-400 text-xs">Hiện tại chưa có ý tưởng đóng góp nào.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-650 min-w-[800px] border-collapse">
                      <thead className="text-[10px] uppercase bg-slate-50/80 text-slate-400 border-b border-slate-100">
                        <tr>
                          <th className="px-5 py-4 font-bold tracking-wider rounded-l-2xl">Người đóng góp</th>
                          <th className="px-5 py-4 font-bold tracking-wider">Tên sáng kiến</th>
                          <th className="px-5 py-4 font-bold tracking-wider">Mô tả giải pháp</th>
                          <th className="px-5 py-4 font-bold tracking-wider text-center">Tiến trình</th>
                          <th className="px-5 py-4 font-bold tracking-wider text-center">Cập nhật tiến trình</th>
                          <th className="px-5 py-4 font-bold tracking-wider text-center rounded-r-2xl">Xóa</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {ideas.filter(i => i.type !== 'Góp ý').map((idea) => {
                          const ideaId = idea._id || idea.id;
                          return (
                            <tr key={ideaId} className="hover:bg-slate-50/60 transition-colors duration-200">
                              <td className="px-5 py-4">
                                <p className="font-bold text-slate-800 text-sm">{idea.fullName}</p>
                                <p className="text-slate-400 text-[10px] mt-1">{idea.email || 'Không để lại email'}</p>
                                <p className="text-slate-400 text-[9px] mt-1">Ngày gửi: {idea.date}</p>
                              </td>
                              <td className="px-5 py-4 font-bold text-[#0054A6] text-sm max-w-[180px]">{idea.title}</td>
                              <td className="px-5 py-4 max-w-[280px]">
                                <p className="text-slate-600 line-clamp-3 leading-relaxed text-xs" title={idea.description}>
                                  {idea.description}
                                </p>
                              </td>
                              <td className="px-5 py-4 text-center">
                                <span className={`px-3 py-1.5 rounded-full font-bold text-[10px] inline-block ${
                                  idea.status === 'Đã áp dụng' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100/50' :
                                  idea.status === 'Đang thử nghiệm' ? 'bg-blue-50 text-blue-500 border border-blue-100/50' :
                                  idea.status === 'Đã tiếp nhận' ? 'bg-purple-50 text-purple-600 border border-purple-100/50' :
                                  'bg-amber-50 text-amber-600 border border-amber-100/50'
                                }`}>
                                  {idea.status}
                                </span>
                              </td>
                              <td className="px-5 py-4 text-center">
                                <div className="flex flex-col space-y-1.5 items-center justify-center">
                                  {idea.status === 'Chờ duyệt' && (
                                    <button
                                      onClick={() => handleUpdateIdea(ideaId, 'Đã tiếp nhận')}
                                      className="px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-lg text-[10px] font-bold transition-all w-28 shadow-sm active:scale-95"
                                    >
                                      Tiếp nhận
                                    </button>
                                  )}
                                  {(idea.status === 'Đã tiếp nhận' || idea.status === 'Chờ duyệt') && (
                                    <button
                                      onClick={() => handleUpdateIdea(ideaId, 'Đang thử nghiệm')}
                                      className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-[10px] font-bold transition-all w-28 shadow-sm active:scale-95"
                                    >
                                      Thử nghiệm
                                    </button>
                                  )}
                                  {idea.status === 'Đang thử nghiệm' && (
                                    <button
                                      onClick={() => handleUpdateIdea(ideaId, 'Đã áp dụng')}
                                      className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg text-[10px] font-bold transition-all w-28 shadow-sm active:scale-95"
                                    >
                                      Áp dụng thực tế
                                    </button>
                                  )}
                                           {/* TAB 3: QUẢN LÝ LIÊN HỆ & GÓP Ý */}
            {activeTab === 'feedbacks' && (
              <div>
                <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center space-x-2 pb-4 border-b border-slate-100">
                  <FiMail className="text-purple-650 w-5 h-5" />
                  <span>Danh sách liên hệ, ý kiến đóng góp chung</span>
                </h3>

                {ideas.filter(i => i.type === 'Góp ý').length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs">Hiện tại chưa có liên hệ góp ý nào.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-650 min-w-[800px] border-collapse">
                      <thead className="text-[10px] uppercase bg-slate-50/80 text-slate-400 border-b border-slate-100">
                        <tr>
                          <th className="px-5 py-4 font-bold tracking-wider rounded-l-2xl">Người đóng góp</th>
                          <th className="px-5 py-4 font-bold tracking-wider">Tiêu đề góp ý</th>
                          <th className="px-5 py-4 font-bold tracking-wider">Nội dung chi tiết</th>
                          <th className="px-5 py-4 font-bold tracking-wider text-center">Trạng thái</th>
                          <th className="px-5 py-4 font-bold tracking-wider text-center">Cập nhật trạng thái</th>
                          <th className="px-5 py-4 font-bold tracking-wider text-center rounded-r-2xl">Xóa</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {ideas.filter(i => i.type === 'Góp ý').map((idea) => {
                          const ideaId = idea._id || idea.id;
                          return (
                            <tr key={ideaId} className="hover:bg-slate-50/60 transition-colors duration-200">
                              <td className="px-5 py-4">
                                <p className="font-bold text-slate-800 text-sm">{idea.fullName}</p>
                                <p className="text-slate-400 text-[10px] mt-1">{idea.email || 'Không để lại email'}</p>
                                <p className="text-slate-400 text-[9px] mt-1">Ngày gửi: {idea.date}</p>
                              </td>
                              <td className="px-5 py-4 font-bold text-[#0054A6] text-sm max-w-[180px]">{idea.title}</td>
                              <td className="px-5 py-4 max-w-[280px]">
                                <p className="text-slate-600 line-clamp-3 leading-relaxed text-xs" title={idea.description}>
                                  {idea.description}
                                </p>
                              </td>
                              <td className="px-5 py-4 text-center">
                                <span className={`px-3 py-1.5 rounded-full font-bold text-[10px] inline-block ${
                                  idea.status === 'Đã phản hồi' ? 'bg-blue-50 text-blue-600 border border-blue-100/50' :
                                  idea.status === 'Đã tiếp nhận' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100/50' :
                                  'bg-amber-50 text-amber-650 border border-amber-100/50'
                                }`}>
                                  {idea.status === 'Đã phản hồi' ? 'Đã phản hồi' : 
                                   idea.status === 'Đã tiếp nhận' ? 'Đã tiếp nhận' : 'Chưa xử lý'}
                                </span>
                              </td>
                              <td className="px-5 py-4 text-center">
                                <div className="flex justify-center">
                                  {idea.status === 'Chờ duyệt' && (
                                    <button
                                      onClick={() => handleUpdateIdea(ideaId, 'Đã tiếp nhận')}
                                      className="px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-655 rounded-lg text-[10px] font-bold transition-all w-32 shadow-sm active:scale-95"
                                    >
                                      Xác nhận tiếp nhận
                                    </button>
                                  )}
                                  {idea.status === 'Đã tiếp nhận' && (
                                    <button
                                      onClick={() => handleUpdateIdea(ideaId, 'Đã phản hồi')}
                                      className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-[10px] font-bold transition-all w-32 shadow-sm active:scale-95"
                                    >
                                      Xác nhận phản hồi
                                    </button>
                                  )}
                                  {idea.status === 'Đã phản hồi' && (
                                    <span className="text-slate-400 text-[10px] font-bold bg-slate-50 px-2 py-1 rounded-md">Đã phản hồi đóng góp</span>
                                  )}
                                </div>
                              </td>
                              <td className="px-5 py-4 text-center">
                                <button
                                  onClick={() => handleDeleteIdea(ideaId)}
                                  className="p-2 bg-slate-50 hover:bg-red-50 hover:text-red-600 text-slate-400 rounded-xl transition-all shadow-sm active:scale-90"
                                  title="Xóa ý kiến đóng góp"
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



            {/* TAB 4: QUẢN LÝ BÀI VIẾT TIN TỨC FANPAGE */}
            {activeTab === 'news' && (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-100 pb-4 animate-fadeIn">
                  <h3 className="text-lg font-black text-slate-800 flex items-center space-x-2">
                    <FiFileText className="text-[#0054A6] w-5 h-5" />
                    <span>Danh sách bài viết Tin tức CLB</span>
                  </h3>
                  <button
                    onClick={() => setShowAddPost(true)}
                    className="px-4 py-2.5 bg-[#0054A6] hover:bg-[#003d80] text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center space-x-1.5 self-start active:scale-95"
                  >
                    <span>+ Đăng bài viết mới</span>
                  </button>
                </div>

                {posts.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs animate-fadeIn">Hiện tại chưa có bài viết nào được đăng.</div>
                ) : (
                  <div className="overflow-x-auto animate-fadeIn">
                    <table className="w-full text-left text-xs text-slate-650 min-w-[800px] border-collapse">
                      <thead className="text-[10px] uppercase bg-slate-50/80 text-slate-400 border-b border-slate-100">
                        <tr>
                          <th className="px-5 py-4 font-bold tracking-wider rounded-l-2xl">Tiêu đề bài viết</th>
                          <th className="px-5 py-4 font-bold tracking-wider">Người đăng / Ngày đăng</th>
                          <th className="px-5 py-4 font-bold tracking-wider">Nội dung tóm tắt</th>
                          <th className="px-5 py-4 font-bold tracking-wider text-center rounded-r-2xl">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {posts.map((item) => {
                          const itemId = item._id || item.id;
                          const formatDate = (dateStr) => {
                            if (!dateStr) return 'Vừa xong';
                            const date = new Date(dateStr);
                            if (isNaN(date.getTime())) return dateStr;
                            return date.toLocaleDateString('vi-VN', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            });
                          };

                          return (
                            <tr key={itemId} className="hover:bg-slate-50/60 transition-colors duration-200">
                              <td className="px-5 py-4">
                                <div className="flex items-center space-x-3 max-w-[280px]">
                                  {item.image && (
                                    <img
                                      src={item.image}
                                      alt="Cover"
                                      className="w-12 h-12 object-cover rounded-xl shrink-0 border border-slate-100 shadow-sm"
                                    />
                                  )}
                                  <p className="font-bold text-slate-800 text-sm line-clamp-2" title={item.title}>
                                    {item.title}
                                  </p>
                                </div>
                              </td>
                              <td className="px-5 py-4">
                                <p className="font-bold text-slate-700">{item.author}</p>
                                <p className="text-slate-400 text-[10px] mt-1">{formatDate(item.createdAt || item.time)}</p>
                              </td>
                              <td className="px-5 py-4 max-w-[280px]">
                                <p className="text-slate-500 line-clamp-2 leading-relaxed text-xs" title={item.content}>
                                  {item.content}
                                </p>
                              </td>

                              <td className="px-5 py-4 text-center">
                                <div className="flex items-center justify-center space-x-2">
                                  <button
                                    onClick={() => startEditPost(item)}
                                    className="p-2 bg-blue-50 hover:bg-blue-100 text-[#0054A6] rounded-xl transition-all shadow-sm active:scale-90"
                                    title="Chỉnh sửa bài viết"
                                  >
                                    <FiEdit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeletePost(itemId)}
                                    className="p-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl transition-all shadow-sm active:scale-90"
                                    title="Xóa bài viết"
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

            {/* TAB 5: THÙNG RÁC BÀI VIẾT ĐÃ XÓA TẠM THỜI */}
            {activeTab === 'trash' && (
              <div>
                <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center space-x-2 pb-4 border-b border-slate-100">
                  <FiTrash2 className="text-red-500 w-5 h-5" />
                  <span>Thùng rác bài viết đã xóa tạm thời</span>
                </h3>

                {deletedPosts.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs">Thùng rác hiện đang trống.</div>
                ) : (
                  <div className="overflow-x-auto animate-fadeIn">
                    <table className="w-full text-left text-xs text-slate-650 min-w-[800px] border-collapse">
                      <thead className="text-[10px] uppercase bg-slate-50/80 text-slate-400 border-b border-slate-100">
                        <tr>
                          <th className="px-5 py-4 font-bold tracking-wider rounded-l-2xl">Tiêu đề bài viết</th>
                          <th className="px-5 py-4 font-bold tracking-wider">Người đăng / Ngày đăng</th>
                          <th className="px-5 py-4 font-bold tracking-wider">Nội dung tóm tắt</th>
                          <th className="px-5 py-4 font-bold tracking-wider text-center rounded-r-2xl">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {deletedPosts.map((item) => {
                          const itemId = item._id || item.id;
                          const formatDate = (dateStr) => {
                            if (!dateStr) return 'Vừa xong';
                            const date = new Date(dateStr);
                            if (isNaN(date.getTime())) return dateStr;
                            return date.toLocaleDateString('vi-VN', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            });
                          };

                          return (
                            <tr key={itemId} className="hover:bg-slate-50/60 transition-colors duration-200">
                              <td className="px-5 py-4">
                                <div className="flex items-center space-x-3 max-w-[280px]">
                                  {item.image && (
                                    <img
                                      src={item.image}
                                      alt="Cover"
                                      className="w-12 h-12 object-cover rounded-xl shrink-0 border border-slate-100 shadow-sm"
                                    />
                                  )}
                                  <p className="font-bold text-slate-800 text-sm line-clamp-2" title={item.title}>
                                    {item.title}
                                  </p>
                                </div>
                              </td>
                              <td className="px-5 py-4">
                                <p className="font-bold text-slate-700">{item.author}</p>
                                <p className="text-slate-400 text-[10px] mt-1">{formatDate(item.createdAt || item.time)}</p>
                              </td>
                              <td className="px-5 py-4 max-w-[280px]">
                                <p className="text-slate-500 line-clamp-2 leading-relaxed text-xs font-medium" title={item.content}>
                                  {item.content}
                                </p>
                              </td>

                              <td className="px-5 py-4 text-center">
                                <div className="flex items-center justify-center space-x-2">
                                  <button
                                    onClick={() => handleRestorePost(itemId)}
                                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg transition-all font-bold text-[10px] shadow-sm active:scale-95"
                                    title="Khôi phục bài viết"
                                  >
                                    Khôi phục
                                  </button>
                                  <button
                                    onClick={() => handleForceDeletePost(itemId)}
                                    className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg transition-all font-bold text-[10px] shadow-sm active:scale-95"
                                    title="Xóa vĩnh viễn bài viết"
                                  >
                                    Xóa vĩnh viễn
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

        {/* 🔐 Modal Đăng Bài Viết Mới */}
        {showAddPost && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white border border-gray-200/80 w-full max-w-2xl rounded-3xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-black text-gray-800 mb-5 flex items-center space-x-2 border-b border-gray-100 pb-3">
                <FiFileText className="text-[#0054A6] w-5 h-5" />
                <span>Đăng Bài Viết Tin Tức Mới</span>
              </h3>

              <form onSubmit={handleCreatePost} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase">Tiêu đề bài viết *</label>
                  <input
                    type="text"
                    value={postForm.title}
                    onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#0054A6] text-gray-800 shadow-inner"
                    placeholder="Nhập tiêu đề nổi bật cho bài viết..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase">Ảnh đại diện bài viết</label>
                  {postForm.image ? (
                    <div className="relative w-full h-32 rounded-xl border border-gray-200 overflow-hidden group">
                      <img
                        src={postForm.image}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => setPostForm({ ...postForm, image: '' })}
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
                              setPostForm({ ...postForm, image: reader.result });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase">Nội dung chi tiết bài viết *</label>
                  <textarea
                    rows="6"
                    value={postForm.content}
                    onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
                    className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-[#0054A6] text-gray-800 resize-none shadow-inner"
                    placeholder="Viết nội dung bài viết tin tức tại đây..."
                    required
                  />
                </div>

                <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddPost(false);
                      setPostForm({ title: '', content: '', image: '' });
                    }}
                    className="px-4 py-2 text-xs font-bold text-gray-550 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#0054A6] hover:bg-[#003d80] text-white text-xs font-bold rounded-xl shadow-md transition-colors"
                  >
                    Đăng bài viết
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 🔐 Modal Chỉnh Sửa Bài Viết */}
        {showEditPost && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white border border-gray-200/80 w-full max-w-2xl rounded-3xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-black text-gray-800 mb-5 flex items-center space-x-2 border-b border-gray-100 pb-3">
                <FiEdit className="text-[#0054A6] w-5 h-5" />
                <span>Chỉnh Sửa Bài Viết Tin Tức</span>
              </h3>

              <form onSubmit={handleUpdatePost} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase">Tiêu đề bài viết *</label>
                  <input
                    type="text"
                    value={postForm.title}
                    onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#0054A6] text-gray-800 shadow-inner"
                    placeholder="Nhập tiêu đề bài viết..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase">Ảnh đại diện bài viết</label>
                  {postForm.image ? (
                    <div className="relative w-full h-32 rounded-xl border border-gray-200 overflow-hidden group">
                      <img
                        src={postForm.image}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => setPostForm({ ...postForm, image: '' })}
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
                              setPostForm({ ...postForm, image: reader.result });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase">Nội dung chi tiết bài viết *</label>
                  <textarea
                    rows="6"
                    value={postForm.content}
                    onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
                    className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-[#0054A6] text-gray-800 resize-none shadow-inner"
                    placeholder="Viết nội dung bài viết tin tức tại đây..."
                    required
                  />
                </div>

                <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditPost(false);
                      setEditingPostId(null);
                      setPostForm({ title: '', content: '', image: '' });
                    }}
                    className="px-4 py-2 text-xs font-bold text-gray-550 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#0054A6] hover:bg-[#003d80] text-white text-xs font-bold rounded-xl shadow-md transition-colors"
                  >
                    Cập nhật bài viết
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
