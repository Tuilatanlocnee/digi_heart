import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiZap, FiCheck, FiTrash2,
  FiRefreshCw, FiShield, FiFileText, FiEdit, FiMail,
  FiArrowUp, FiArrowDown, FiX, FiUpload, FiImage, FiPlusCircle
} from 'react-icons/fi';
import { ideaAPI, postAPI } from '../utils/api';
import { parseContent, getTextPreview } from '../utils/contentParser';

/**
 * View AdminDashboard - Trang quản trị trung tâm dành cho Ban chủ nhiệm CLB Digi Heart.
 * Phân chia quản lý thành viên, ý tưởng sáng tạo và bài đăng fanpage.
 */
export default function AdminDashboard() {
  const navigate = useNavigate();

  // Trạng thái các tab quản lý: 'ideas' | 'news'
  const [activeTab, setActiveTab] = useState('ideas');

  // Dữ liệu lấy từ API
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
  const [postBlocks, setPostBlocks] = useState([{ type: 'text', value: '' }]);

  // Trạng thái loading
  const [loading, setLoading] = useState(false);

  // Thông báo hành động
  const [message, setMessage] = useState({ text: '', type: '' });

  // Hàm hiển thị thông báo phản hồi nhanh
  const showNotify = useCallback((text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4500);
  }, []);

  // Hàm tải dữ liệu đồng thời từ API
  const fetchData = useCallback(async () => {
    await Promise.resolve();
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
  }, [navigate, showNotify]);

  // 1. Kiểm tra quyền truy cập Admin & Tải dữ liệu ban đầu
  useEffect(() => {
    const token = localStorage.getItem('digiheart_admin_token');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [navigate, fetchData]);

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
      console.error('Lỗi cập nhật sáng kiến:', error);
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
      console.error('Lỗi xóa ý tưởng:', error);
      showNotify('Lỗi xóa ý tưởng!', 'danger');
    }
  };

  // ==========================================
  // XỬ LÝ POSTS (BÀI ĐĂNG TIN TỨC FANPAGE)
  // ==========================================
  const handlePastePlain = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  // Các hàm tiện ích cho Block Editor (nội dung xen kẽ chữ/ảnh) của Admin Dashboard
  const syncBlocksFromDOM = (currentBlocks, prefix = 'add') => {
    return currentBlocks.map((block, idx) => {
      if (block.type === 'text') {
        const editor = document.getElementById(`editor-${prefix}-${idx}`);
        return { ...block, value: editor ? editor.innerHTML : block.value };
      }
      return block;
    });
  };

  const addBlock = (type, prefix = 'add') => {
    const synced = syncBlocksFromDOM(postBlocks, prefix);
    setPostBlocks([...synced, { type, value: '' }]);
  };

  const updateBlockValue = (index, val) => {
    const updated = [...postBlocks];
    updated[index].value = val;
    setPostBlocks(updated);
  };

  const handleFormatText = (idx, formatType, colorValue = null, editorId) => {
    const editor = document.getElementById(editorId);
    if (!editor) return;

    editor.focus();

    if (formatType === 'bold') {
      document.execCommand('bold', false, null);
    } else if (formatType === 'italic') {
      document.execCommand('italic', false, null);
    } else if (formatType === 'underline') {
      document.execCommand('underline', false, null);
    } else if (formatType === 'color' && colorValue) {
      document.execCommand('foreColor', false, colorValue);
    }

    // Cập nhật lại giá trị block
    updateBlockValue(idx, editor.innerHTML);
  };

  const deleteBlock = (index, prefix = 'add') => {
    const synced = syncBlocksFromDOM(postBlocks, prefix);
    if (synced.length === 1) {
      setPostBlocks([{ type: 'text', value: '' }]);
      return;
    }
    setPostBlocks(synced.filter((_, i) => i !== index));
  };

  const moveBlock = (index, direction, prefix = 'add') => {
    const synced = syncBlocksFromDOM(postBlocks, prefix);
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === synced.length - 1) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...synced];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setPostBlocks(updated);
  };

  const handleBlockFileChange = (index, e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      alert('Kích thước ảnh quá lớn! Vui lòng chọn file ảnh dưới 4MB.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      updateBlockValue(index, reader.result);
    };
    reader.readAsDataURL(file);
  };

  // ==========================================
  // XỬ LÝ POSTS (BÀI ĐĂNG TIN TỨC FANPAGE)
  // ==========================================
  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!postForm.title) {
      showNotify('Vui lòng điền tiêu đề bài viết (*)', 'warning');
      return;
    }

    const syncedBlocks = syncBlocksFromDOM(postBlocks, 'add');
    const validBlocks = syncedBlocks.filter(b => b.value.trim() !== '' && b.value !== '<br>' && b.value !== '<div><br></div>');
    if (validBlocks.length === 0) {
      showNotify('Vui lòng điền nội dung bài viết!', 'warning');
      return;
    }
    const serializedContent = JSON.stringify(validBlocks);

    try {
      const response = await postAPI.create({
        title: postForm.title,
        content: serializedContent,
        image: postForm.image || null
      });
      showNotify('Đã đăng bài viết tin tức thành công!');
      setPosts([response.post, ...posts]);
      setShowAddPost(false);
      setPostForm({ title: '', content: '', image: '' });
      setPostBlocks([{ type: 'text', value: '' }]);
    } catch (error) {
      console.error('Lỗi đăng bài viết:', error);
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
      console.error('Lỗi xóa bài đăng:', error);
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
      console.error('Lỗi khôi phục bài viết:', error);
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
      console.error('Lỗi xóa vĩnh viễn bài viết:', error);
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
    const blocks = parseContent(item.content);
    setPostBlocks(blocks);
    setShowEditPost(true);
  };

  const handleUpdatePost = async (e) => {
    e.preventDefault();
    if (!postForm.title) {
      showNotify('Vui lòng điền tiêu đề bài viết (*)', 'warning');
      return;
    }

    const syncedBlocks = syncBlocksFromDOM(postBlocks, 'edit');
    const validBlocks = syncedBlocks.filter(b => b.value.trim() !== '' && b.value !== '<br>' && b.value !== '<div><br></div>');
    if (validBlocks.length === 0) {
      showNotify('Vui lòng điền nội dung bài viết!', 'warning');
      return;
    }
    const serializedContent = JSON.stringify(validBlocks);

    try {
      const response = await postAPI.update(editingPostId, {
        title: postForm.title,
        content: serializedContent,
        image: postForm.image || null
      });
      showNotify('Đã cập nhật bài viết thành công!');

      const updatedPost = response.post || { ...postForm, content: serializedContent, _id: editingPostId };
      setPosts(posts.map(item =>
        (item._id === editingPostId || item.id === editingPostId) ? { ...item, ...updatedPost } : item
      ));

      setShowEditPost(false);
      setEditingPostId(null);
      setPostForm({ title: '', content: '', image: '' });
      setPostBlocks([{ type: 'text', value: '' }]);
    } catch (error) {
      console.error('Lỗi cập nhật bài viết:', error);
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
    <div className="bg-[#f8fafc] text-slate-800 py-4 sm:py-6 md:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header Dashboard */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 pb-4 sm:mb-8 sm:pb-6 border-b border-slate-200/50">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 text-[#0054A6] rounded-full text-[10px] font-bold uppercase tracking-wider mb-2.5 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0054A6] animate-pulse"></span>
              <span>Doanh Nghiệp • Digi Heart Portal</span>
            </div>
            <h1 className="text-lg sm:text-2xl md:text-3xl font-black text-slate-800 flex items-center space-x-3 tracking-tight">
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

        {/* 📊 Thẻ Thống Kê Nhanh (Stats Cards) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">

          <div className="bg-white border border-slate-200/80 rounded-2xl p-3 sm:p-5 shadow-sm hover:shadow-md hover:border-[#0054A6]/20 transition-all duration-300 flex items-center justify-between group">
            <div className="min-w-0 flex-1">
              <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-450 tracking-wider block mb-1 truncate">Sáng kiến số</span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-800 mt-1">{stats.totalIdeas}</h3>
              <div className="text-[9px] sm:text-[10px] text-slate-500 mt-1.5 flex items-center space-x-1">
                <span className="shrink-0">Chờ duyệt:</span>
                <span className={`font-bold px-1.5 py-0.5 rounded-md text-[9px] ${stats.pendingIdeas > 0 ? 'bg-amber-50 text-amber-600 border border-amber-100/50' : 'bg-slate-50 text-slate-500 border border-slate-100'}`}>{stats.pendingIdeas}</span>
              </div>
            </div>
            <div className="p-2.5 bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-[#0054A6] rounded-xl transition-all duration-300 hidden xs:flex shrink-0 ml-1">
              <FiZap className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-3 sm:p-5 shadow-sm hover:shadow-md hover:border-[#0054A6]/20 transition-all duration-300 flex items-center justify-between group">
            <div className="min-w-0 flex-1">
              <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-450 tracking-wider block mb-1 truncate">Đã áp dụng</span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-800 mt-1">{stats.appliedIdeas}</h3>
              <div className="text-[9px] sm:text-[10px] text-slate-500 mt-1.5">
                <span className="bg-blue-50/50 text-[#0054A6] px-1.5 py-0.5 rounded-md border border-blue-100/30 font-bold block text-center sm:inline-block text-[8px] sm:text-[9px]">Sáng kiến thực tế</span>
              </div>
            </div>
            <div className="p-2.5 bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-[#0054A6] rounded-xl transition-all duration-300 hidden xs:flex shrink-0 ml-1">
              <FiCheck className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-3 sm:p-5 shadow-sm hover:shadow-md hover:border-[#0054A6]/20 transition-all duration-300 flex items-center justify-between group">
            <div className="min-w-0 flex-1">
              <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-455 tracking-wider block mb-1 truncate">Liên hệ góp ý</span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-800 mt-1">{stats.totalFeedbacks}</h3>
              <div className="text-[9px] sm:text-[10px] text-slate-500 mt-1.5 flex items-center space-x-1">
                <span className="shrink-0">Chưa xử lý:</span>
                <span className={`font-bold px-1.5 py-0.5 rounded-md text-[9px] ${stats.pendingFeedbacks > 0 ? 'bg-purple-50 text-purple-600 border border-purple-100/50' : 'bg-slate-50 text-slate-500 border border-slate-100'}`}>{stats.pendingFeedbacks}</span>
              </div>
            </div>
            <div className="p-2.5 bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-[#0054A6] rounded-xl transition-all duration-300 hidden xs:flex shrink-0 ml-1">
              <FiMail className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-3 sm:p-5 shadow-sm hover:shadow-md hover:border-[#0054A6]/20 transition-all duration-300 flex items-center justify-between group">
            <div className="min-w-0 flex-1">
              <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-455 tracking-wider block mb-1 truncate">Bài viết tin tức</span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-800 mt-1">{stats.totalNews}</h3>
              <div className="text-[9px] sm:text-[10px] text-slate-500 mt-1.5">
                <span className="bg-blue-50/50 text-[#0054A6] px-1.5 py-0.5 rounded-md border border-blue-100/30 font-bold block text-center sm:inline-block text-[8px] sm:text-[9px]">Đã đăng tin</span>
              </div>
            </div>
            <div className="p-2.5 bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-[#0054A6] rounded-xl transition-all duration-300 hidden xs:flex shrink-0 ml-1">
              <FiFileText className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </div>
          </div>
        </div>

        {/* 🗂️ Menu Tab Quản Lý */}
        <div className="flex overflow-x-auto whitespace-nowrap border-b border-slate-200 mb-6 sm:mb-8 space-x-8 scrollbar-none pl-2">
          <button
            onClick={() => setActiveTab('ideas')}
            className={`shrink-0 pb-4 px-1 text-xs sm:text-sm font-bold transition-all duration-300 flex items-center space-x-2 border-b-2 ${activeTab === 'ideas'
                ? 'border-[#0054A6] text-[#0054A6]'
                : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
          >
            <FiZap className="w-4 h-4" />
            <span>Sáng Kiến Số Hóa ({stats.totalIdeas})</span>
          </button>

          <button
            onClick={() => setActiveTab('feedbacks')}
            className={`shrink-0 pb-4 px-1 text-xs sm:text-sm font-bold transition-all duration-300 flex items-center space-x-2 border-b-2 ${activeTab === 'feedbacks'
                ? 'border-[#0054A6] text-[#0054A6]'
                : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
          >
            <FiMail className="w-4 h-4" />
            <span>Liên Hệ & Góp Ý ({stats.totalFeedbacks})</span>
          </button>

          <button
            onClick={() => setActiveTab('news')}
            className={`shrink-0 pb-4 px-1 text-xs sm:text-sm font-bold transition-all duration-300 flex items-center space-x-2 border-b-2 ${activeTab === 'news'
                ? 'border-[#0054A6] text-[#0054A6]'
                : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
          >
            <FiFileText className="w-4 h-4" />
            <span>Quản lý Tin Tức ({stats.totalNews})</span>
          </button>

          <button
            onClick={() => setActiveTab('trash')}
            className={`shrink-0 pb-4 px-1 text-xs sm:text-sm font-bold transition-all duration-300 flex items-center space-x-2 border-b-2 ${activeTab === 'trash'
                ? 'border-[#0054A6] text-[#0054A6]'
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
          <div className="bg-white border border-slate-100 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">



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
                                <span className={`px-3 py-1.5 rounded-full font-bold text-[10px] inline-block ${idea.status === 'Đã áp dụng' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100/50' :
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
                                </div>
                              </td>
                              <td className="px-5 py-4 text-center">
                                <button
                                  onClick={() => handleDeleteIdea(ideaId)}
                                  className="p-2 bg-slate-50 hover:bg-red-50 hover:text-red-600 text-slate-400 rounded-xl transition-all shadow-sm active:scale-90"
                                  title="Xóa ý tưởng"
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
                                <span className={`px-3 py-1.5 rounded-full font-bold text-[10px] inline-block ${idea.status === 'Đã phản hồi' ? 'bg-blue-50 text-blue-600 border border-blue-100/50' :
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
                                <p className="text-slate-500 line-clamp-2 leading-relaxed text-xs" title={getTextPreview(item.content, 200)}>
                                  {getTextPreview(item.content, 120)}
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
                                <p className="text-slate-500 line-clamp-2 leading-relaxed text-xs font-medium" title={getTextPreview(item.content, 200)}>
                                  {getTextPreview(item.content, 120)}
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
            <div className="bg-white border border-gray-200/80 w-full max-w-3xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl relative max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
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
                          className="bg-red-500 hover:bg-red-650 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg transition-colors shadow-md"
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

                <div className="space-y-4">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase">Nội dung chi tiết bài viết (Xen kẽ chữ và hình ảnh) *</label>
                  
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 pb-1">
                    {postBlocks.map((block, idx) => (
                      <div key={idx} className="border border-gray-200 rounded-xl p-3 bg-gray-50/50 space-y-2 relative group/block">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-1.5">
                          <span className="text-[10px] font-bold text-[#0054A6] uppercase tracking-wider">
                            Khu vực {block.type === 'text' ? 'Văn Bản' : 'Hình Ảnh'} #{idx + 1}
                          </span>
                          
                          <div className="flex items-center space-x-1">
                            <button
                              type="button"
                              onClick={() => moveBlock(idx, 'up', 'add')}
                              disabled={idx === 0}
                              className="p-1 hover:bg-gray-200 disabled:opacity-30 rounded text-gray-555"
                              title="Di chuyển lên"
                            >
                              <FiArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveBlock(idx, 'down', 'add')}
                              disabled={idx === postBlocks.length - 1}
                              className="p-1 hover:bg-gray-200 disabled:opacity-30 rounded text-gray-555"
                              title="Di chuyển xuống"
                            >
                              <FiArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteBlock(idx, 'add')}
                              className="p-1 hover:bg-red-50 hover:text-red-550 rounded text-gray-400 transition-colors"
                              title="Xóa block"
                            >
                              <FiTrash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {block.type === 'text' ? (
                          <div className="space-y-1.5">
                            {/* Thanh công cụ định dạng Rich Text */}
                            <div className="flex flex-wrap items-center gap-1.5 bg-white border border-gray-200/80 rounded-lg p-1.5 shadow-sm">
                              <button
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => handleFormatText(idx, 'bold', null, `editor-add-${idx}`)}
                                className="px-2 py-0.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded text-[10px] font-bold text-gray-700 transition-colors"
                                title="In đậm"
                              >
                                B
                              </button>
                              <button
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => handleFormatText(idx, 'italic', null, `editor-add-${idx}`)}
                                className="px-2 py-0.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded text-[10px] italic text-gray-700 transition-colors"
                                title="In nghiêng"
                              >
                                I
                              </button>
                              <button
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => handleFormatText(idx, 'underline', null, `editor-add-${idx}`)}
                                className="px-2 py-0.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded text-[10px] underline text-gray-700 transition-colors"
                                title="Gạch chân"
                              >
                                U
                              </button>
                              
                              <div className="w-px h-4 bg-gray-200 mx-1"></div>
                              
                              {/* Bảng màu mini */}
                              <div className="flex items-center space-x-1">
                                {[
                                  { color: '#0054A6', title: 'Xanh MobiFone' },
                                  { color: '#E60023', title: 'Đỏ MobiFone' },
                                  { color: '#2E7D32', title: 'Xanh lá' },
                                  { color: '#EF6C00', title: 'Cam' },
                                  { color: '#7B1FA2', title: 'Tím' },
                                  { color: '#1F2937', title: 'Đen' }
                                ].map((item) => (
                                  <button
                                    key={item.color}
                                    type="button"
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => handleFormatText(idx, 'color', item.color, `editor-add-${idx}`)}
                                    className="w-3.5 h-3.5 rounded-full border border-gray-300 hover:scale-110 active:scale-95 transition-transform"
                                    style={{ backgroundColor: item.color }}
                                    title={item.title}
                                  />
                                ))}
                              </div>
                            </div>
                            <div
                              id={`editor-add-${idx}`}
                              contentEditable
                              suppressContentEditableWarning={true}
                              dangerouslySetInnerHTML={{ __html: block.value }}
                              onPaste={handlePastePlain}
                              className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#0054A6] text-gray-800 min-h-[90px] outline-none overflow-y-auto"
                              placeholder="Nhập nội dung đoạn văn bản tại đây..."
                            />
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {block.value ? (
                              <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-white max-h-[140px] flex items-center justify-center">
                                <img src={block.value} alt="Preview block" className="w-full h-full object-cover max-h-[140px]" />
                                <button
                                  type="button"
                                  onClick={() => updateBlockValue(idx, '')}
                                  className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-red-650 text-white rounded-full transition-colors"
                                  title="Xóa ảnh"
                                >
                                  <FiX className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 gap-2">
                                <label className="border border-dashed border-gray-300 rounded-lg p-3 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50/10 hover:border-[#0054A6]/50 transition-all">
                                  <FiUpload className="w-4 h-4 text-gray-400 mb-1" />
                                  <span className="text-[10px] font-bold text-[#0054A6]">Tải ảnh lên từ thiết bị</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleBlockFileChange(idx, e)}
                                    className="hidden"
                                  />
                                </label>
                                
                                <div className="relative">
                                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-[10px]">
                                    <FiImage />
                                  </span>
                                  <input
                                    type="url"
                                    placeholder="Hoặc dán URL ảnh vào đây..."
                                    value={block.value}
                                    onChange={(e) => updateBlockValue(idx, e.target.value)}
                                    className="w-full bg-white border border-gray-200 rounded-lg pl-7 pr-2 py-1.5 text-[10px] focus:outline-none focus:border-[#0054A6] text-gray-800"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center space-x-2 pt-1 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => addBlock('text', 'add')}
                      className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-1"
                    >
                      <span>+ Thêm đoạn chữ</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => addBlock('image', 'add')}
                      className="flex-1 py-2 bg-blue-50 hover:bg-blue-100 text-[#0054A6] text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-1"
                    >
                      <span>+ Thêm hình ảnh</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddPost(false);
                      setPostForm({ title: '', content: '', image: '' });
                      setPostBlocks([{ type: 'text', value: '' }]);
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
            <div className="bg-white border border-gray-200/80 w-full max-w-3xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl relative max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
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

                <div className="space-y-4">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase">Nội dung chi tiết bài viết (Xen kẽ chữ và hình ảnh) *</label>
                  
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 pb-1">
                    {postBlocks.map((block, idx) => (
                      <div key={idx} className="border border-gray-200 rounded-xl p-3 bg-gray-50/50 space-y-2 relative group/block">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-1.5">
                          <span className="text-[10px] font-bold text-[#0054A6] uppercase tracking-wider">
                            Khu vực {block.type === 'text' ? 'Văn Bản' : 'Hình Ảnh'} #{idx + 1}
                          </span>
                          
                          <div className="flex items-center space-x-1">
                            <button
                              type="button"
                              onClick={() => moveBlock(idx, 'up', 'edit')}
                              disabled={idx === 0}
                              className="p-1 hover:bg-gray-200 disabled:opacity-30 rounded text-gray-555"
                              title="Di chuyển lên"
                            >
                              <FiArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveBlock(idx, 'down', 'edit')}
                              disabled={idx === postBlocks.length - 1}
                              className="p-1 hover:bg-gray-200 disabled:opacity-30 rounded text-gray-555"
                              title="Di chuyển xuống"
                            >
                              <FiArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteBlock(idx, 'edit')}
                              className="p-1 hover:bg-red-50 hover:text-red-500 rounded text-gray-400 transition-colors"
                              title="Xóa block"
                            >
                              <FiTrash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {block.type === 'text' ? (
                          <div className="space-y-1.5">
                            {/* Thanh công cụ định dạng Rich Text */}
                            <div className="flex flex-wrap items-center gap-1.5 bg-white border border-gray-200/80 rounded-lg p-1.5 shadow-sm">
                              <button
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => handleFormatText(idx, 'bold', null, `editor-edit-${idx}`)}
                                className="px-2 py-0.5 bg-gray-55 hover:bg-gray-100 border border-gray-200 rounded text-[10px] font-bold text-gray-700 transition-colors"
                                title="In đậm"
                              >
                                B
                              </button>
                              <button
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => handleFormatText(idx, 'italic', null, `editor-edit-${idx}`)}
                                className="px-2 py-0.5 bg-gray-55 hover:bg-gray-100 border border-gray-200 rounded text-[10px] italic text-gray-700 transition-colors"
                                title="In nghiêng"
                              >
                                I
                              </button>
                              <button
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => handleFormatText(idx, 'underline', null, `editor-edit-${idx}`)}
                                className="px-2 py-0.5 bg-gray-55 hover:bg-gray-100 border border-gray-200 rounded text-[10px] underline text-gray-700 transition-colors"
                                title="Gạch chân"
                              >
                                U
                              </button>
                              
                              <div className="w-px h-4 bg-gray-200 mx-1"></div>
                              
                              {/* Bảng màu mini */}
                              <div className="flex items-center space-x-1">
                                {[
                                  { color: '#0054A6', title: 'Xanh MobiFone' },
                                  { color: '#E60023', title: 'Đỏ MobiFone' },
                                  { color: '#2E7D32', title: 'Xanh lá' },
                                  { color: '#EF6C00', title: 'Cam' },
                                  { color: '#7B1FA2', title: 'Tím' },
                                  { color: '#1F2937', title: 'Đen' }
                                ].map((item) => (
                                  <button
                                    key={item.color}
                                    type="button"
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => handleFormatText(idx, 'color', item.color, `editor-edit-${idx}`)}
                                    className="w-3.5 h-3.5 rounded-full border border-gray-300 hover:scale-110 active:scale-95 transition-transform"
                                    style={{ backgroundColor: item.color }}
                                    title={item.title}
                                  />
                                ))}
                              </div>
                            </div>
                            <div
                              id={`editor-edit-${idx}`}
                              contentEditable
                              suppressContentEditableWarning={true}
                              dangerouslySetInnerHTML={{ __html: block.value }}
                              onPaste={handlePastePlain}
                              className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#0054A6] text-gray-800 min-h-[90px] outline-none overflow-y-auto"
                              placeholder="Nhập nội dung đoạn văn bản tại đây..."
                            />
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {block.value ? (
                              <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-white max-h-[140px] flex items-center justify-center">
                                <img src={block.value} alt="Preview block" className="w-full h-full object-cover max-h-[140px]" />
                                <button
                                  type="button"
                                  onClick={() => updateBlockValue(idx, '')}
                                  className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-red-600 text-white rounded-full transition-colors"
                                  title="Xóa ảnh"
                                >
                                  <FiX className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 gap-2">
                                <label className="border border-dashed border-gray-300 rounded-lg p-3 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50/10 hover:border-[#0054A6]/50 transition-all">
                                  <FiUpload className="w-4 h-4 text-gray-400 mb-1" />
                                  <span className="text-[10px] font-bold text-[#0054A6]">Tải ảnh lên từ thiết bị</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleBlockFileChange(idx, e)}
                                    className="hidden"
                                  />
                                </label>
                                
                                <div className="relative">
                                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-[10px]">
                                    <FiImage />
                                  </span>
                                  <input
                                    type="url"
                                    placeholder="Hoặc dán URL ảnh vào đây..."
                                    value={block.value}
                                    onChange={(e) => updateBlockValue(idx, e.target.value)}
                                    className="w-full bg-white border border-gray-200 rounded-lg pl-7 pr-2 py-1.5 text-[10px] focus:outline-none focus:border-[#0054A6] text-gray-800"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center space-x-2 pt-1 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => addBlock('text', 'edit')}
                      className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-1"
                    >
                      <span>+ Thêm đoạn chữ</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => addBlock('image', 'edit')}
                      className="flex-1 py-2 bg-blue-50 hover:bg-blue-100 text-[#0054A6] text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-1"
                    >
                      <span>+ Thêm hình ảnh</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditPost(false);
                      setEditingPostId(null);
                      setPostForm({ title: '', content: '', image: '' });
                      setPostBlocks([{ type: 'text', value: '' }]);
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
