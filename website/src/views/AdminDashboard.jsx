import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiUsers, FiZap, FiGrid, FiCheck, FiX, FiTrash2, 
  FiRefreshCw, FiArrowRight, FiShield, FiFileText 
} from 'react-icons/fi';
import { candidateAPI, ideaAPI, postAPI } from '../utils/api';

/**
 * View AdminDashboard - Trang quản trị trung tâm dành cho Ban chủ nhiệm CLB Digi Heart.
 * Phân chia quản lý thành viên, ý tưởng sáng tạo và bài đăng fanpage.
 */
export default function AdminDashboard() {
  const navigate = useNavigate();
  
  // Trạng thái các tab quản lý: 'candidates' | 'ideas' | 'posts'
  const [activeTab, setActiveTab] = useState('candidates');

  // Dữ liệu lấy từ API
  const [candidates, setCandidates] = useState([]);
  const [ideas, setIdeas] = useState([]);
  const [posts, setPosts] = useState([]);
  
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
      const [candidatesData, ideasData, postsData] = await Promise.all([
        candidateAPI.getAll(),
        ideaAPI.getAll(),
        postAPI.getAll()
      ]);
      setCandidates(candidatesData);
      setIdeas(ideasData);
      setPosts(postsData);
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

  // Tính toán nhanh số liệu thống kê
  const stats = {
    totalCandidates: candidates.length,
    pendingCandidates: candidates.filter(c => c.status === 'Chờ duyệt').length,
    approvedCandidates: candidates.filter(c => c.status === 'Đã duyệt').length,
    totalIdeas: ideas.length,
    totalPosts: posts.length
  };

  return (
    <div className="bg-gray-50 text-gray-800 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Dashboard */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 pb-5 border-b border-gray-200">
          <div>
            <h1 className="text-3xl font-black text-gray-800 flex items-center space-x-2">
              <FiShield className="text-[#0054A6] w-8 h-8" />
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          
          <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-450 tracking-wider">Đăng ký gia nhập</span>
              <h3 className="text-2xl font-black text-gray-800 mt-1">{stats.totalCandidates}</h3>
              <p className="text-[10px] text-gray-400 mt-1">Có <span className="font-bold text-amber-500">{stats.pendingCandidates}</span> hồ sơ chờ duyệt</p>
            </div>
            <div className="p-3.5 bg-blue-50 text-[#0054A6] rounded-xl shadow-sm">
              <FiUsers className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-450 tracking-wider">Ứng viên đã duyệt</span>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">{stats.approvedCandidates}</h3>
              <p className="text-[10px] text-gray-400 mt-1">Đã sẵn sàng hoạt động</p>
            </div>
            <div className="p-3.5 bg-emerald-50 text-emerald-500 rounded-xl shadow-sm">
              <FiCheck className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-450 tracking-wider">Ý tưởng sáng tạo số</span>
              <h3 className="text-2xl font-black text-gray-800 mt-1">{stats.totalIdeas}</h3>
              <p className="text-[10px] text-gray-400 mt-1">Sáng kiến đóng góp từ các chi đoàn</p>
            </div>
            <div className="p-3.5 bg-amber-50 text-amber-500 rounded-xl shadow-sm">
              <FiZap className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-450 tracking-wider">Bài viết Fanpage</span>
              <h3 className="text-2xl font-black text-gray-800 mt-1">{stats.totalPosts}</h3>
              <p className="text-[10px] text-gray-400 mt-1">Bài viết hiển thị trên bảng tin</p>
            </div>
            <div className="p-3.5 bg-red-50 text-[#E30613] rounded-xl shadow-sm">
              <FiGrid className="w-6 h-6" />
            </div>
          </div>

        </div>

        {/* 🗂️ Menu Tab Quản Lý */}
        <div className="flex border-b border-gray-200 mb-6 bg-white p-2 rounded-2xl border border-gray-150 shadow-sm space-x-1">
          <button
            onClick={() => setActiveTab('candidates')}
            className={`flex-grow md:flex-grow-0 px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
              activeTab === 'candidates' 
                ? 'bg-blue-50 text-[#0054A6] shadow-sm border border-blue-100/50' 
                : 'text-gray-550 hover:bg-gray-50'
            }`}
          >
            <FiUsers className="w-4 h-4" />
            <span>Hồ Sơ Đăng Ký ({stats.pendingCandidates} Chờ)</span>
          </button>
          <button
            onClick={() => setActiveTab('ideas')}
            className={`flex-grow md:flex-grow-0 px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
              activeTab === 'ideas' 
                ? 'bg-[#E30613]/5 text-[#E30613] shadow-sm border border-[#E30613]/10' 
                : 'text-gray-550 hover:bg-gray-50'
            }`}
          >
            <FiZap className="w-4 h-4" />
            <span>Sáng Kiến Số Hóa ({stats.totalIdeas})</span>
          </button>
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-grow md:flex-grow-0 px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
              activeTab === 'posts' 
                ? 'bg-emerald-50 text-[#0054A6] shadow-sm border border-emerald-100' 
                : 'text-gray-550 hover:bg-gray-50'
            }`}
          >
            <FiGrid className="w-4 h-4" />
            <span>Bài viết Fanpage ({stats.totalPosts})</span>
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
            
            {/* TAB 1: QUẢN LÝ ỨNG VIÊN */}
            {activeTab === 'candidates' && (
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
                  <FiUsers className="text-[#0054A6]" />
                  <span>Danh sách hồ sơ đăng ký thành viên</span>
                </h3>

                {candidates.length === 0 ? (
                  <div className="py-12 text-center text-gray-400 text-xs">Hiện tại chưa có hồ sơ đăng ký nào.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-gray-600 min-w-[800px]">
                      <thead className="text-[10px] uppercase bg-gray-50 text-gray-500 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3.5">Họ và tên</th>
                          <th className="px-4 py-3.5">Đơn vị công tác</th>
                          <th className="px-4 py-3.5">Ban ứng tuyển</th>
                          <th className="px-4 py-3.5">Kỹ năng & Lý do</th>
                          <th className="px-4 py-3.5 text-center">Trạng thái</th>
                          <th className="px-4 py-3.5 text-center">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-155">
                        {candidates.map((cand) => {
                          const candId = cand._id || cand.id;
                          return (
                            <tr key={candId} className="hover:bg-gray-50/50">
                              <td className="px-4 py-4">
                                <p className="font-bold text-gray-800">{cand.fullName}</p>
                                <p className="text-gray-400 text-[10px] mt-0.5">{cand.email} • {cand.phone}</p>
                              </td>
                              <td className="px-4 py-4 font-semibold text-gray-700">{cand.department}</td>
                              <td className="px-4 py-4">
                                <span className="px-2.5 py-1 bg-blue-50/80 text-[#0054A6] rounded-md font-bold text-[10px]">
                                  {cand.targetBan}
                                </span>
                              </td>
                              <td className="px-4 py-4 max-w-[280px]">
                                <p className="text-gray-700 line-clamp-1" title={cand.skills}><strong>Sở trường:</strong> {cand.skills || 'Không có'}</p>
                                <p className="text-gray-450 line-clamp-2 mt-1 text-[11px]" title={cand.reason}><strong>Lý do:</strong> {cand.reason}</p>
                              </td>
                              <td className="px-4 py-4 text-center">
                                <span className={`px-2.5 py-1.5 rounded-full font-bold text-[9px] ${
                                  cand.status === 'Đã duyệt' ? 'bg-emerald-50 text-emerald-600' :
                                  cand.status === 'Từ chối' ? 'bg-red-50 text-red-500' :
                                  'bg-amber-50 text-amber-600'
                                }`}>
                                  {cand.status}
                                </span>
                              </td>
                              <td className="px-4 py-4 text-center">
                                <div className="flex items-center justify-center space-x-1.5">
                                  {cand.status === 'Chờ duyệt' && (
                                    <>
                                      <button
                                        onClick={() => handleUpdateCandidate(candId, 'Đã duyệt')}
                                        className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg transition-colors"
                                        title="Phê duyệt hồ sơ"
                                      >
                                        <FiCheck className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() => handleUpdateCandidate(candId, 'Từ chối')}
                                        className="p-1.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg transition-colors"
                                        title="Từ chối hồ sơ"
                                      >
                                        <FiX className="w-4 h-4" />
                                      </button>
                                    </>
                                  )}
                                  <button
                                    onClick={() => handleDeleteCandidate(candId)}
                                    className="p-1.5 bg-gray-50 hover:bg-gray-150 hover:text-red-500 text-gray-400 rounded-lg transition-colors"
                                    title="Xóa hồ sơ"
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

            {/* TAB 3: QUẢN LÝ BÀI ĐĂNG FANPAGE */}
            {activeTab === 'posts' && (
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
                  <FiGrid className="text-emerald-500" />
                  <span>Danh sách các bài viết hiển thị trên Fanpage</span>
                </h3>

                {posts.length === 0 ? (
                  <div className="py-12 text-center text-gray-400 text-xs">Hiện tại chưa có bài đăng nào.</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {posts.map((post) => {
                      const postId = post._id || post.id;
                      return (
                        <div key={postId} className="border border-gray-200 rounded-2xl p-4 flex flex-col justify-between hover:shadow-md transition-shadow">
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-2.5">
                                <img
                                  src={post.avatar}
                                  alt={post.author}
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                                <div>
                                  <h4 className="font-bold text-xs text-gray-800">{post.author}</h4>
                                  <span className="text-[9px] text-gray-400">{post.time}</span>
                                </div>
                              </div>
                              <button
                                onClick={() => handleDeletePost(postId)}
                                className="p-1.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg transition-colors"
                                title="Xóa bài viết vi phạm"
                              >
                                <FiTrash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed whitespace-pre-line mb-3">
                              {post.content}
                            </p>
                            {post.image && (
                              <div className="h-28 overflow-hidden rounded-xl border border-gray-100 mb-3">
                                <img
                                  src={post.image}
                                  alt="Mẫu đính kèm"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                          </div>
                          <div className="border-t border-gray-100 pt-2.5 text-[10px] text-gray-450 font-bold flex items-center justify-between">
                            <span>Lượt thích: {post.likes}</span>
                            <span>Bình luận: {post.comments?.length || 0}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
