import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiThumbsUp, FiMessageSquare, FiSend, FiPlusCircle, FiUser, FiClock } from 'react-icons/fi';
import { postAPI } from '../utils/api';

/**
 * View Fanpage - Trang dòng thời gian (Feed) tương tác của câu lạc bộ.
 * Kết nối dữ liệu MongoDB thông qua Backend API (hỗ trợ offline LocalStorage Fallback).
 */
export default function Fanpage() {
  // Trạng thái lưu trữ danh sách các bài đăng
  const [posts, setPosts] = useState([]);
  
  // Trạng thái đăng nhập của Admin
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Trạng thái cho biểu mẫu tạo bài viết mới
  const [newPostText, setNewPostText] = useState('');
  const [newPostImage, setNewPostImage] = useState('');
  
  // Trạng thái nhập bình luận cho từng bài viết (key là ID bài viết, value là nội dung bình luận)
  const [commentInputs, setCommentInputs] = useState({});

  // Lấy hoặc tạo guestId ngẫu nhiên để xác định duy nhất lượt like khi chưa đăng nhập
  const getOrCreateGuestId = () => {
    let gId = localStorage.getItem('digiheart_guest_id');
    if (!gId) {
      gId = 'guest_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('digiheart_guest_id', gId);
    }
    return gId;
  };

  // Kiểm tra xem bài viết đã được thích bởi người dùng hiện tại (hoặc khách) chưa
  const checkIfLiked = (post) => {
    if (!post.likedBy) return false;
    
    const token = localStorage.getItem('digiheart_admin_token');
    if (token) {
      const userStr = localStorage.getItem('digiheart_admin_user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          return post.likedBy.includes(`user_${user.username}`);
        } catch (e) {
          // Bỏ qua lỗi
        }
      }
    }
    
    const guestId = getOrCreateGuestId();
    return post.likedBy.includes(`guest_${guestId}`);
  };

  // 1. Tải danh sách bài đăng khi khởi chạy trang
  const fetchPosts = async () => {
    try {
      const data = await postAPI.getAll();
      setPosts(data);
    } catch (error) {
      console.error('Không tải được bài viết Fanpage:', error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('digiheart_admin_token');
    setIsLoggedIn(!!token);
    fetchPosts();
  }, []);

  // 2. Xử lý Đăng bài viết mới
  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPostText.trim()) return;

    // Lấy tên đầy đủ của tài khoản đăng nhập để gán làm tác giả
    const userStr = localStorage.getItem('digiheart_admin_user');
    let authorName = 'Đoàn Viên MobiFone';
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        authorName = user.role === 'admin' || user.role === 'superadmin' ? 'Ban Quản Trị CLB' : (user.fullName || user.username);
      } catch (err) {
        // Bỏ qua lỗi
      }
    }

    try {
      await postAPI.create({
        content: newPostText,
        image: newPostImage.trim() || null,
        author: authorName,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'
      });

      // Tải lại danh sách
      fetchPosts();
      
      // Reset form
      setNewPostText('');
      setNewPostImage('');
    } catch (error) {
      console.error('Lỗi đăng bài viết:', error);
    }
  };

  // 3. Xử lý ấn Thích (Like) bài viết
  const handleLikePost = async (postId) => {
    const guestId = getOrCreateGuestId();
    try {
      const resData = await postAPI.like(postId, guestId);
      if (resData && resData.post) {
        // Cập nhật trực tiếp post trong danh sách để tránh load lại toàn bộ
        setPosts(posts.map((post) => {
          if (post._id === postId || post.id === postId) {
            return resData.post;
          }
          return post;
        }));
      } else {
        fetchPosts();
      }
    } catch (error) {
      console.error('Lỗi khi thích bài viết:', error);
    }
  };

  // 4. Xử lý Đăng bình luận (Comment)
  const handleAddComment = async (postId) => {
    const commentText = commentInputs[postId];
    if (!commentText || !commentText.trim()) return;

    try {
      await postAPI.comment(postId, {
        author: isLoggedIn ? 'Ban Quản Trị CLB' : 'Khách',
        text: commentText
      });

      // Tải lại bài đăng để cập nhật bình luận
      fetchPosts();
      
      // Xóa text box bình luận của bài viết đó
      setCommentInputs({ ...commentInputs, [postId]: '' });
    } catch (error) {
      console.error('Lỗi bình luận bài viết:', error);
    }
  };

  return (
    <div className="bg-gray-50 text-gray-800 min-h-screen py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        
        {/* Tiêu đề Fanpage */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-5xl font-black mb-3 text-gray-800">
            Góc Tương Tác <span className="text-[#0054A6]">Fanpage</span>
          </h1>
          <p className="text-gray-500 font-medium text-sm">
            Nơi chia sẻ ý kiến, cập nhật nhanh các hoạt động đoàn và kết nối đoàn viên trực tuyến.
          </p>
        </div>

        {/* 📝 Biểu mẫu Đăng bài mới (Chỉ hiển thị khi đã đăng nhập) */}
        {isLoggedIn ? (
          <div className="bg-white border border-gray-200/80 rounded-2xl p-5 mb-8 shadow-sm">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#0054A6] to-[#E30613] flex items-center justify-center font-bold text-white shadow-sm">
                A
              </div>
              <span className="font-bold text-sm text-gray-700">Đăng hoạt động chuyển đổi số mới</span>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <textarea
                  placeholder="Hôm nay chi đoàn của bạn có hoạt động chuyển đổi số nào nổi bật không?"
                  rows="3"
                  value={newPostText}
                  onChange={(e) => setNewPostText(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-[#0054A6] focus:ring-1 focus:ring-[#0054A6] text-gray-800 placeholder-gray-400 resize-none shadow-inner"
                  required
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <input
                  type="url"
                  placeholder="Dán link ảnh đính kèm (tùy chọn)..."
                  value={newPostImage}
                  onChange={(e) => setNewPostImage(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#0054A6] text-gray-800 placeholder-gray-400"
                />
                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2 bg-[#E30613] hover:bg-[#c2050f] rounded-xl text-sm font-bold text-white flex items-center justify-center space-x-1.5 transition-colors shrink-0 shadow-md shadow-red-500/10"
                >
                  <FiPlusCircle />
                  <span>Đăng bài</span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-5 mb-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="font-bold text-sm text-gray-800">Bạn muốn chia sẻ hoạt động chuyển đổi số?</h3>
              <p className="text-xs text-gray-500">Vui lòng đăng nhập tài khoản Quản trị để đăng bài viết lên dòng thời gian.</p>
            </div>
            <Link
              to="/admin/login"
              className="px-5 py-2.5 bg-[#0054A6] hover:bg-[#003f7f] text-white text-xs font-bold rounded-xl shadow-md transition-all duration-300 shrink-0 flex items-center justify-center"
            >
              Đăng nhập để đăng bài
            </Link>
          </div>
        )}

        {/* 📱 Dòng thời gian bài đăng (Timeline Feed) */}
        <div className="space-y-6">
          {posts.map((post) => {
            const postId = post._id || post.id;
            const isLiked = checkIfLiked(post);
            return (
              <div
                key={postId}
                className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm space-y-4"
              >
                
                {/* Header bài đăng */}
                <div className="flex items-center space-x-3">
                  <img
                    src={post.avatar}
                    alt={post.author}
                    className="w-10 h-10 rounded-full object-cover border border-gray-100"
                  />
                  <div>
                    <h4 className="font-bold text-sm text-gray-800">{post.author}</h4>
                    <span className="flex items-center text-xs text-gray-450 space-x-1 mt-0.5">
                      <FiClock className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-gray-400">{post.time}</span>
                    </span>
                  </div>
                </div>

                {/* Nội dung text bài viết */}
                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                  {post.content}
                </p>

                {/* Hình ảnh đính kèm */}
                {post.image && (
                  <div className="overflow-hidden rounded-xl border border-gray-100 max-h-[350px]">
                    <img
                      src={post.image}
                      alt="Đính kèm bài đăng"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Nút Tương tác */}
                <div className="flex items-center justify-between border-y border-gray-100 py-2.5 text-xs text-gray-500">
                  <button
                    onClick={() => handleLikePost(postId)}
                    className={`flex items-center space-x-1.5 transition-colors ${
                      isLiked ? 'text-[#0054A6] font-bold scale-105' : 'hover:text-[#0054A6]'
                    }`}
                  >
                    <FiThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-[#0054A6] text-[#0054A6]' : ''}`} />
                    <span>{isLiked ? 'Đã thích' : 'Thích'} ({post.likes})</span>
                  </button>
                  <div className="flex items-center space-x-1.5">
                    <FiMessageSquare className="w-4 h-4 text-gray-455" />
                    <span className="font-semibold">Bình luận ({post.comments?.length || 0})</span>
                  </div>
                </div>

                {/* Khu vực Bình luận */}
                <div className="space-y-3">
                  
                  {/* Danh sách bình luận */}
                  {post.comments && post.comments.length > 0 && (
                    <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                      {post.comments.map((comment) => {
                        const commentId = comment._id || comment.id;
                        return (
                          <div key={commentId} className="bg-gray-50 border border-gray-100 rounded-xl p-2.5 text-xs space-y-1">
                            <div className="flex items-center space-x-1.5">
                              <FiUser className="text-[#0054A6] w-3 h-3" />
                              <span className="font-bold text-gray-700">{comment.author}</span>
                            </div>
                            <p className="text-gray-600 pl-4">{comment.text}</p>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Hộp viết bình luận mới */}
                  <div className="flex items-center space-x-2 pt-2">
                    <input
                      type="text"
                      placeholder="Viết bình luận của bạn..."
                      value={commentInputs[postId] || ''}
                      onChange={(e) =>
                        setCommentInputs({ ...commentInputs, [postId]: e.target.value })
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddComment(postId);
                      }}
                      className="flex-grow bg-white border border-gray-250 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#0054A6] text-gray-800 placeholder-gray-400 shadow-inner"
                    />
                    <button
                      onClick={() => handleAddComment(postId)}
                      className="p-2 bg-[#0054A6] hover:bg-[#003d80] rounded-xl text-white transition-colors shadow-sm"
                      aria-label="Send comment"
                    >
                      <FiSend className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>

              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
