import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiThumbsUp, FiMessageSquare, FiSend, FiPlusCircle, FiUser, FiClock, FiEdit, FiX, FiMoreHorizontal } from 'react-icons/fi';
import { postAPI } from '../utils/api';

/**
 * View Fanpage - Trang dòng thời gian (Feed) tương tác của câu lạc bộ.
 * Kết nối dữ liệu MongoDB thông qua Backend API (hỗ trợ offline LocalStorage Fallback).
 */
const getOrCreateGuestId = () => {
  let gId = localStorage.getItem('digiheart_guest_id');
  if (!gId) {
    gId = 'guest_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('digiheart_guest_id', gId);
  }
  return gId;
};

export default function Fanpage() {
  // Trạng thái lưu trữ danh sách các bài đăng
  const [posts, setPosts] = useState([]);
  
  // Trạng thái đăng nhập của Admin
  const [isLoggedIn] = useState(() => !!localStorage.getItem('digiheart_admin_token'));
  
  // Trạng thái guestId của khách truy cập
  const [guestId] = useState(() => getOrCreateGuestId());
  
  // Trạng thái cho biểu mẫu tạo bài viết mới
  const [newPostText, setNewPostText] = useState('');
  const [newPostImage, setNewPostImage] = useState('');
  
  // Trạng thái đăng nhập và thông tin tài khoản hiện tại
  const [currentUser] = useState(() => {
    const userStr = localStorage.getItem('digiheart_admin_user');
    return userStr ? JSON.parse(userStr) : null;
  });

  // Trạng thái cho danh sách người thích bài viết
  const [showLikesModal, setShowLikesModal] = useState(false);
  const [likersList, setLikersList] = useState([]);
  const [loadingLikers, setLoadingLikers] = useState(false);

  // Trạng thái cho việc chỉnh sửa bài viết
  const [showEditPostModal, setShowEditPostModal] = useState(false);
  const [editingPostId, setEditingPostId] = useState(null);
  const [editPostText, setEditPostText] = useState('');
  const [editPostImage, setEditPostImage] = useState('');
  const [savingPost, setSavingPost] = useState(false);
  
  // Trạng thái dropdown menu của bài viết
  const [activeDropdownPostId, setActiveDropdownPostId] = useState(null);
  
  // Trạng thái nhập bình luận cho từng bài viết (key là ID bài viết, value là nội dung bình luận)
  const [commentInputs, setCommentInputs] = useState({});

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
        } catch {
          // Bỏ qua lỗi
        }
      }
    }
    
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
    Promise.resolve().then(() => {
      fetchPosts();
    });
  }, []);

  // Tự động đóng dropdown menu khi click ra ngoài
  useEffect(() => {
    const handleOutsideClick = () => {
      setActiveDropdownPostId(null);
    };
    window.addEventListener('click', handleOutsideClick);
    return () => {
      window.removeEventListener('click', handleOutsideClick);
    };
  }, []);

  // 2. Xử lý Đăng bài viết mới
  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPostText.trim()) return;

    // Lấy tên đầy đủ của tài khoản đăng nhập để gán làm tác giả
    const userStr = localStorage.getItem('digiheart_admin_user');
    let authorName = 'Đoàn Viên MobiFone';
    let authorAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80';
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        authorName = user.role === 'admin' || user.role === 'superadmin' ? 'Ban Quản Trị CLB' : (user.fullName || user.username);
        if (user.avatar) {
          authorAvatar = user.avatar;
        }
      } catch {
        // Bỏ qua lỗi
      }
    }

    try {
      await postAPI.create({
        content: newPostText,
        image: newPostImage || null,
        author: authorName,
        avatar: authorAvatar
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

  // Xử lý khi chọn ảnh từ máy tính
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Giới hạn ảnh < 5MB để tránh payload quá lớn cho Base64
      if (file.size > 5 * 1024 * 1024) {
        alert('Kích thước ảnh quá lớn! Vui lòng chọn ảnh nhỏ hơn 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPostImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Xử lý mở Modal xem danh sách người thích bài viết
  const handleOpenLikesModal = async (postId) => {
    setShowLikesModal(true);
    setLoadingLikers(true);
    setLikersList([]);
    try {
      const data = await postAPI.getLikes(postId);
      setLikersList(data || []);
    } catch (error) {
      console.error('Không tải được danh sách người thích:', error);
    } finally {
      setLoadingLikers(false);
    }
  };

  // Mở Modal chỉnh sửa bài viết
  const handleOpenEditPost = (post) => {
    setEditingPostId(post._id || post.id);
    setEditPostText(post.content);
    setEditPostImage(post.image || '');
    setShowEditPostModal(true);
  };

  // Chọn ảnh cho bài viết chỉnh sửa
  const handleEditPostImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Kích thước ảnh quá lớn! Vui lòng chọn ảnh nhỏ hơn 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditPostImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Gửi cập nhật bài viết
  const handleUpdatePost = async (e) => {
    e.preventDefault();
    if (!editPostText.trim()) return;
    setSavingPost(true);
    try {
      await postAPI.update(editingPostId, {
        content: editPostText,
        image: editPostImage || null
      });
      alert('Đã cập nhật bài viết thành công!');
      setShowEditPostModal(false);
      fetchPosts();
    } catch (err) {
      console.error(err);
      alert(err.message || 'Lỗi khi cập nhật bài viết.');
    } finally {
      setSavingPost(false);
    }
  };

  // Xóa bài viết
  const handleDeletePost = async (postId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bài viết này không?')) return;
    try {
      await postAPI.delete(postId);
      alert('Đã xóa bài viết thành công!');
      fetchPosts();
    } catch (err) {
      console.error(err);
      alert(err.message || 'Lỗi khi xóa bài viết.');
    }
  };

  // 3. Xử lý ấn Thích (Like) bài viết
  const handleLikePost = async (postId) => {
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

              {/* Preview hình ảnh đã chọn */}
              {newPostImage && (
                <div className="relative inline-block border border-gray-200 rounded-xl p-1 bg-gray-50 shadow-sm max-w-[200px] mt-2">
                  <img
                    src={newPostImage}
                    alt="Preview đính kèm"
                    className="max-h-24 w-auto rounded-lg object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setNewPostImage('')}
                    className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-650 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shadow-md transition-colors"
                  >
                    ✕
                  </button>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center gap-3 mt-4">
                <input
                  type="file"
                  id="post-image-upload"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <label
                  htmlFor="post-image-upload"
                  className="w-full sm:w-auto flex-grow flex items-center justify-center space-x-2 px-4 py-2.5 border border-dashed border-gray-300 hover:border-[#0054A6] hover:bg-blue-50/20 rounded-xl text-xs text-gray-500 font-semibold cursor-pointer transition-all duration-200 bg-gray-50/50"
                >
                  <FiPlusCircle className="w-4 h-4 text-gray-405" />
                  <span>{newPostImage ? 'Chọn ảnh khác' : 'Chọn ảnh đính kèm từ máy'}</span>
                </label>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2.5 bg-[#E30613] hover:bg-[#c2050f] rounded-xl text-sm font-bold text-white flex items-center justify-center space-x-1.5 transition-colors shrink-0 shadow-md shadow-red-500/10"
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
                {(() => {
                  const authorMatchName = currentUser?.role === 'admin' || currentUser?.role === 'superadmin' ? 'Ban Quản Trị CLB' : (currentUser?.fullName || currentUser?.username);
                  const isMyPost = isLoggedIn && currentUser && post.author === authorMatchName;
                  const canDelete = isMyPost || (isLoggedIn && currentUser && (currentUser.role === 'admin' || currentUser.role === 'superadmin'));

                  return (
                    <div className="flex items-center justify-between">
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

                      {/* Tác vụ sửa/xóa bài viết dưới dạng dropdown 3 chấm */}
                      {isLoggedIn && currentUser && (isMyPost || canDelete) && (
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDropdownPostId(activeDropdownPostId === postId ? null : postId);
                            }}
                            className="p-1.5 hover:bg-gray-100 rounded-full text-gray-500 hover:text-gray-800 transition-all"
                            title="Tác vụ bài viết"
                          >
                            <FiMoreHorizontal className="w-5 h-5" />
                          </button>

                          {activeDropdownPostId === postId && (
                            <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-20">
                              {isMyPost && (
                                <button
                                  onClick={() => {
                                    setActiveDropdownPostId(null);
                                    handleOpenEditPost(post);
                                  }}
                                  className="w-full px-3.5 py-2 text-left text-xs text-gray-700 hover:bg-gray-50 hover:text-[#0054A6] font-semibold flex items-center space-x-1.5 transition-colors"
                                >
                                  <FiEdit className="w-3.5 h-3.5" />
                                  <span>Chỉnh sửa</span>
                                </button>
                              )}
                              {canDelete && (
                                <button
                                  onClick={() => {
                                    setActiveDropdownPostId(null);
                                    handleDeletePost(postId);
                                  }}
                                  className="w-full px-3.5 py-2 text-left text-xs text-red-600 hover:bg-red-50 font-semibold flex items-center space-x-1.5 transition-colors"
                                >
                                  <FiX className="w-3.5 h-3.5" />
                                  <span>Xóa bài</span>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Nội dung text bài viết */}
                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                  {post.content}
                </p>

                {/* Hình ảnh đính kèm */}
                {post.image && (
                  <div className="overflow-hidden rounded-xl border border-gray-100 max-h-[500px] flex justify-center bg-gray-50/50">
                    <img
                      src={post.image}
                      alt="Đính kèm bài đăng"
                      className="max-h-[500px] w-auto object-contain"
                    />
                  </div>
                )}

                {/* Nút Tương tác */}
                <div className="flex items-center justify-between border-y border-gray-100 py-2.5 text-xs text-gray-500">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleLikePost(postId)}
                      className={`flex items-center space-x-1.5 transition-colors ${
                        isLiked ? 'text-[#0054A6] font-bold scale-105' : 'hover:text-[#0054A6]'
                      }`}
                    >
                      <FiThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-[#0054A6] text-[#0054A6]' : ''}`} />
                      <span>{isLiked ? 'Đã thích' : 'Thích'}</span>
                    </button>
                    {post.likes > 0 && (
                      <button
                        onClick={() => handleOpenLikesModal(postId)}
                        className="hover:underline hover:text-[#0054A6] transition-colors font-semibold"
                      >
                        ({post.likes} lượt thích)
                      </button>
                    )}
                  </div>
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

      {/* Modal Chỉnh sửa bài viết */}
      {showEditPostModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-800 text-sm">Chỉnh sửa bài viết</h3>
              <button
                onClick={() => setShowEditPostModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors w-7 h-7 rounded-full bg-gray-50 flex items-center justify-center font-bold text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdatePost} className="p-5 space-y-4">
              <div>
                <textarea
                  required
                  rows="3"
                  value={editPostText}
                  onChange={(e) => setEditPostText(e.target.value)}
                  className="w-full bg-white border border-gray-250 rounded-xl p-3 text-xs focus:outline-none focus:border-[#0054A6] text-gray-800 placeholder-gray-400 resize-none shadow-inner"
                />
              </div>

              {/* Preview hình ảnh */}
              {editPostImage && (
                <div className="relative inline-block border border-gray-200 rounded-xl p-1 bg-gray-50 shadow-sm max-w-[150px]">
                  <img
                    src={editPostImage}
                    alt="Preview chỉnh sửa"
                    className="max-h-20 w-auto rounded-lg object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setEditPostImage('')}
                    className="absolute -top-1.5 -right-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full w-4.5 h-4.5 flex items-center justify-center text-[10px] font-bold shadow-md transition-colors"
                  >
                    ✕
                  </button>
                </div>
              )}

              <div className="flex items-center gap-3">
                <input
                  type="file"
                  id="edit-post-image-upload"
                  accept="image/*"
                  onChange={handleEditPostImageChange}
                  className="hidden"
                />
                <label
                  htmlFor="edit-post-image-upload"
                  className="flex-grow flex items-center justify-center space-x-1.5 px-3 py-2 border border-dashed border-gray-300 hover:border-[#0054A6] hover:bg-blue-50/20 rounded-xl text-xs text-gray-550 font-semibold cursor-pointer transition-all duration-200 bg-gray-50/50"
                >
                  <FiPlusCircle className="w-3.5 h-3.5 text-gray-400" />
                  <span>{editPostImage ? 'Chọn ảnh khác' : 'Chọn ảnh đính kèm'}</span>
                </label>
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditPostModal(false)}
                  className="px-4 py-2 border border-gray-250 text-gray-650 hover:bg-gray-50 rounded-xl text-xs font-bold transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={savingPost}
                  className="px-4 py-2 bg-[#0054A6] hover:bg-[#003d80] text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center space-x-1"
                >
                  {savingPost ? 'Đang lưu...' : 'Lưu lại'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal hiển thị danh sách người thích bài viết */}
      {showLikesModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-800 text-sm">Người đã thích bài viết</h3>
              <button
                onClick={() => setShowLikesModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors w-7 h-7 rounded-full bg-gray-50 flex items-center justify-center font-bold text-xs"
              >
                ✕
              </button>
            </div>

            <div className="px-5 py-3 max-h-[300px] overflow-y-auto space-y-2">
              {loadingLikers ? (
                <div className="flex items-center justify-center py-6">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#0054A6]"></div>
                </div>
              ) : likersList.length === 0 ? (
                <p className="text-center text-gray-400 py-6 text-xs">Chưa có lượt thích nào.</p>
              ) : (
                likersList.map((liker, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-xl transition-colors">
                    <div className="flex items-center space-x-2.5">
                      {liker.avatar ? (
                        <img
                          src={liker.avatar}
                          alt={liker.fullName}
                          className="w-8 h-8 rounded-full object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                          {liker.fullName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h5 className="font-bold text-xs text-gray-800">{liker.fullName}</h5>
                        {liker.type === 'user' ? (
                          <span className="text-[9px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full font-semibold">
                            {liker.role === 'admin' || liker.role === 'superadmin' ? 'Ban Quản Trị' : 'Thành viên'}
                          </span>
                        ) : (
                          <span className="text-[9px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full font-semibold">
                            Khách
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
