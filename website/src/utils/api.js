import axios from 'axios';

// Khởi tạo địa chỉ API mặc định của Backend
const API_URL = 'http://localhost:5000/api';

// Khởi tạo instance Axios
const api = axios.create({
  baseURL: API_URL,
  timeout: 5000, // Hạn chế đợi quá lâu nếu backend không chạy
  headers: {
    'Content-Type': 'application/json'
  }
});

// Tự động đính kèm Token JWT vào Header của mọi request nếu có
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('digiheart_admin_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Kiểm tra xem lỗi có phải do mất kết nối mạng / Server Backend chưa bật không
 */
const isNetworkError = (error) => {
  return !error.response && (error.code === 'ERR_NETWORK' || error.message.includes('Network Error') || error.message.includes('timeout'));
};

// ==========================================
// 1. CÁC API XÁC THỰC ADMIN (AUTH API)
// ==========================================
export const authAPI = {
  // Đăng nhập tài khoản Admin hoặc Thành viên
  login: async (username, password) => {
    try {
      const response = await api.post('/auth/login', { username, password });
      if (response.data.token) {
        localStorage.setItem('digiheart_admin_token', response.data.token);
        localStorage.setItem('digiheart_admin_user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      if (isNetworkError(error)) {
        // Fallback login mô phỏng nếu mất kết nối server (cho phép tài khoản admin/admin123)
        if (username === 'admin' && password === 'admin123') {
          const mockUser = { username: 'admin', role: 'admin', fullName: 'Ban Quản Trị CLB' };
          localStorage.setItem('digiheart_admin_token', 'mock_token_local_storage_fallback');
          localStorage.setItem('digiheart_admin_user', JSON.stringify(mockUser));
          return {
            message: 'Đăng nhập mô phỏng thành công (LocalStorage Fallback)!',
            token: 'mock_token_local_storage_fallback',
            user: mockUser
          };
        }
        // Fallback cho tài khoản thành viên khi offline (tên đăng nhập và mật khẩu khớp nhau và là số điện thoại)
        if (/^\d{8,11}$/.test(username) && username === password) {
          const mockUser = { username: username, role: 'member', fullName: `Thành viên (${username})` };
          localStorage.setItem('digiheart_admin_token', 'mock_token_local_storage_fallback');
          localStorage.setItem('digiheart_admin_user', JSON.stringify(mockUser));
          return {
            message: 'Đăng nhập thành viên mô phỏng thành công (Offline)!',
            token: 'mock_token_local_storage_fallback',
            user: mockUser
          };
        }
        throw new Error('Tài khoản hoặc mật khẩu không chính xác (Chế độ offline)!');
      }
      throw new Error(error.response?.data?.message || 'Tài khoản hoặc mật khẩu không chính xác!');
    }
  },

  // Đăng xuất
  logout: () => {
    localStorage.removeItem('digiheart_admin_token');
    localStorage.removeItem('digiheart_admin_user');
  },

  // Kiểm tra thông tin phiên đăng nhập
  getMe: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      if (isNetworkError(error)) {
        const user = localStorage.getItem('digiheart_admin_user');
        return user ? JSON.parse(user) : null;
      }
      return null;
    }
  },

  // Thay đổi mật khẩu tài khoản
  changePassword: async (oldPassword, newPassword) => {
    try {
      const response = await api.put('/auth/change-password', { oldPassword, newPassword });
      return response.data;
    } catch (error) {
      if (isNetworkError(error)) {
        return { message: 'Đổi mật khẩu thành công (Mô phỏng offline)!' };
      }
      throw new Error(error.response?.data?.message || 'Lỗi hệ thống khi đổi mật khẩu!');
    }
  }
};

// ==========================================
// 2. BIỂU MẪU ĐĂNG KÝ THÀNH VIÊN (CANDIDATES API)
// ==========================================
export const candidateAPI = {
  // Lấy thông tin hồ sơ cá nhân của chính mình
  getProfile: async () => {
    try {
      const response = await api.get('/candidates/profile');
      return response.data;
    } catch (error) {
      if (isNetworkError(error)) {
        console.warn('⚠️ Backend offline. Đang tạo dữ liệu profile giả lập từ localStorage.');
        const userStr = localStorage.getItem('digiheart_admin_user');
        if (userStr) {
          const user = JSON.parse(userStr);
          return {
            fullName: user.fullName || 'Thành viên Demo',
            phone: user.username,
            email: `${user.username}@mobifone.vn`,
            department: 'Phòng ban CLB',
            targetBan: user.role === 'admin' ? 'Ban Quản trị' : 'Ban chuyên môn',
            skills: 'Công nghệ thông tin, Thiết kế Canva',
            reason: 'Tài khoản offline fallback.',
            status: 'Đã duyệt'
          };
        }
      }
      throw error;
    }
  },

  // Cập nhật thông tin hồ sơ cá nhân (ví dụ cập nhật avatar)
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/candidates/profile', profileData);
      return response.data;
    } catch (error) {
      if (isNetworkError(error)) {
        console.warn('⚠️ Backend offline. Đang giả lập cập nhật profile qua localStorage.');
        const userStr = localStorage.getItem('digiheart_admin_user');
        if (userStr) {
          const user = JSON.parse(userStr);
          if (profileData.avatar !== undefined) {
            user.avatar = profileData.avatar;
            localStorage.setItem('digiheart_admin_user', JSON.stringify(user));
          }
        }
        return { message: 'Cập nhật thành công (Mô phỏng offline)!', avatar: profileData.avatar };
      }
      throw new Error(error.response?.data?.message || 'Lỗi cập nhật hồ sơ cá nhân!');
    }
  },

  // Lấy danh sách ứng viên
  getAll: async () => {
    try {
      const response = await api.get('/candidates');
      return response.data;
    } catch (error) {
      if (isNetworkError(error)) {
        console.warn('⚠️ Backend offline. Đang chuyển sang sử dụng LocalStorage cho Candidates.');
        const local = localStorage.getItem('digiheart_candidates');
        return local ? JSON.parse(local) : [];
      }
      throw error;
    }
  },

  // Gửi đăng ký mới
  create: async (candidateData) => {
    try {
      const response = await api.post('/candidates', candidateData);
      return response.data;
    } catch (error) {
      if (isNetworkError(error)) {
        console.warn('⚠️ Backend offline. Đang lưu Candidate vào LocalStorage.');
        // Lưu tạm thời vào LocalStorage
        const local = localStorage.getItem('digiheart_candidates');
        const list = local ? JSON.parse(local) : [];
        const newCand = {
          id: Date.now(),
          ...candidateData,
          status: 'Chờ duyệt',
          date: new Date().toISOString().split('T')[0]
        };
        const updatedList = [newCand, ...list];
        localStorage.setItem('digiheart_candidates', JSON.stringify(updatedList));
        return { message: 'Đăng ký thành công (Lưu trữ cục bộ LocalStorage)!', candidate: newCand };
      }
      throw new Error(error.response?.data?.message || 'Lỗi gửi đăng ký!');
    }
  },

  // Admin cập nhật trạng thái ứng viên (Duyệt/Từ chối)
  updateStatus: async (id, status) => {
    try {
      const response = await api.put(`/candidates/${id}`, { status });
      return response.data;
    } catch (error) {
      if (isNetworkError(error)) {
        const local = localStorage.getItem('digiheart_candidates');
        if (local) {
          const list = JSON.parse(local);
          const updated = list.map(cand => {
            if (cand.id === id || cand._id === id) {
              return { ...cand, status };
            }
            return cand;
          });
          localStorage.setItem('digiheart_candidates', JSON.stringify(updated));
          return { message: 'Cập nhật trạng thái cục bộ thành công!' };
        }
      }
      throw error;
    }
  },

  // Admin xóa hồ sơ ứng viên
  delete: async (id) => {
    try {
      const response = await api.delete(`/candidates/${id}`);
      return response.data;
    } catch (error) {
      if (isNetworkError(error)) {
        const local = localStorage.getItem('digiheart_candidates');
        if (local) {
          const list = JSON.parse(local);
          const filtered = list.filter(cand => cand.id !== id && cand._id !== id);
          localStorage.setItem('digiheart_candidates', JSON.stringify(filtered));
          return { message: 'Xóa hồ sơ cục bộ thành công!' };
        }
      }
      throw error;
    }
  }
};

// ==========================================
// 3. HỘP THƯ SÁNG TẠO SỐ (IDEAS API)
// ==========================================
export const ideaAPI = {
  // Lấy danh sách ý tưởng đóng góp
  getAll: async () => {
    try {
      const response = await api.get('/ideas');
      return response.data;
    } catch (error) {
      if (isNetworkError(error)) {
        console.warn('⚠️ Backend offline. Đang sử dụng LocalStorage cho Ideas.');
        const local = localStorage.getItem('digiheart_ideas');
        return local ? JSON.parse(local) : [];
      }
      throw error;
    }
  },

  // Gửi ý tưởng đóng góp mới
  create: async (ideaData) => {
    try {
      const response = await api.post('/ideas', ideaData);
      return response.data;
    } catch (error) {
      if (isNetworkError(error)) {
        console.warn('⚠️ Backend offline. Đang lưu ý tưởng vào LocalStorage.');
        const local = localStorage.getItem('digiheart_ideas');
        const list = local ? JSON.parse(local) : [];
        const newIdea = {
          id: Date.now(),
          ...ideaData,
          status: 'Chờ duyệt',
          date: new Date().toISOString().split('T')[0]
        };
        const updatedList = [newIdea, ...list];
        localStorage.setItem('digiheart_ideas', JSON.stringify(updatedList));
        return { message: 'Gửi ý tưởng thành công (Lưu cục bộ)!', idea: newIdea };
      }
      throw new Error(error.response?.data?.message || 'Lỗi gửi ý tưởng!');
    }
  },

  // Admin cập nhật tiến trình ý tưởng sáng kiến
  updateStatus: async (id, status) => {
    try {
      const response = await api.put(`/ideas/${id}`, { status });
      return response.data;
    } catch (error) {
      if (isNetworkError(error)) {
        const local = localStorage.getItem('digiheart_ideas');
        if (local) {
          const list = JSON.parse(local);
          const updated = list.map(idea => {
            if (idea.id === id || idea._id === id) {
              return { ...idea, status };
            }
            return idea;
          });
          localStorage.setItem('digiheart_ideas', JSON.stringify(updated));
          return { message: 'Cập nhật tiến trình cục bộ thành công!' };
        }
      }
      throw error;
    }
  },

  // Admin xóa ý tưởng đóng góp
  delete: async (id) => {
    try {
      const response = await api.delete(`/ideas/${id}`);
      return response.data;
    } catch (error) {
      if (isNetworkError(error)) {
        const local = localStorage.getItem('digiheart_ideas');
        if (local) {
          const list = JSON.parse(local);
          const filtered = list.filter(idea => idea.id !== id && idea._id !== id);
          localStorage.setItem('digiheart_ideas', JSON.stringify(filtered));
          return { message: 'Xóa ý tưởng cục bộ thành công!' };
        }
      }
      throw error;
    }
  }
};

// ==========================================
// 4. BẢNG TIN FANPAGE TƯƠNG TÁC (POSTS API)
// ==========================================
export const postAPI = {
  // Lấy danh sách bài viết
  getAll: async () => {
    try {
      const response = await api.get('/posts');
      return response.data;
    } catch (error) {
      if (isNetworkError(error)) {
        console.warn('⚠️ Backend offline. Đang sử dụng LocalStorage cho Posts.');
        const local = localStorage.getItem('digiheart_posts');
        return local ? JSON.parse(local) : [];
      }
      throw error;
    }
  },

  // Đăng bài viết mới
  create: async (postData) => {
    try {
      const response = await api.post('/posts', postData);
      return response.data;
    } catch (error) {
      if (isNetworkError(error)) {
        console.warn('⚠️ Backend offline. Đang lưu bài đăng vào LocalStorage.');
        const local = localStorage.getItem('digiheart_posts');
        const list = local ? JSON.parse(local) : [];
        const newPost = {
          id: Date.now(),
          author: postData.author || 'Đoàn Viên MobiFone (Bạn)',
          avatar: postData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
          time: 'Vừa xong',
          content: postData.content,
          image: postData.image || null,
          likes: 0,
          comments: []
        };
        const updatedList = [newPost, ...list];
        localStorage.setItem('digiheart_posts', JSON.stringify(updatedList));
        return { message: 'Đăng bài thành công (Lưu cục bộ)!', post: newPost };
      }
      throw new Error(error.response?.data?.message || 'Lỗi đăng bài viết!');
    }
  },

  // Thích bài viết
  like: async (id, guestId) => {
    try {
      const response = await api.post(`/posts/${id}/like`, { guestId });
      return response.data;
    } catch (error) {
      if (isNetworkError(error)) {
        const local = localStorage.getItem('digiheart_posts');
        if (local) {
          const list = JSON.parse(local);
          let updatedPostData = null;
          const updated = list.map(post => {
            if (post.id === id || post._id === id) {
              const localLikedKey = `liked_${id}`;
              const isLocalLiked = localStorage.getItem(localLikedKey) === 'true';
              const currentLikes = post.likes || 0;
              const currentLikedBy = post.likedBy || [];
              const identifier = `guest_${guestId}`;
              
              let newLikes = currentLikes;
              let newLikedBy = [...currentLikedBy];

              if (isLocalLiked) {
                localStorage.setItem(localLikedKey, 'false');
                newLikes = Math.max(0, currentLikes - 1);
                newLikedBy = newLikedBy.filter(item => item !== identifier);
              } else {
                localStorage.setItem(localLikedKey, 'true');
                newLikes = currentLikes + 1;
                if (!newLikedBy.includes(identifier)) {
                  newLikedBy.push(identifier);
                }
              }

              updatedPostData = { ...post, likes: newLikes, likedBy: newLikedBy };
              return updatedPostData;
            }
            return post;
          });
          localStorage.setItem('digiheart_posts', JSON.stringify(updated));
          return { message: 'Thay đổi lượt thích cục bộ thành công!', post: updatedPostData };
        }
      }
      throw error;
    }
  },

  // Bình luận bài viết
  comment: async (id, commentData) => {
    try {
      const response = await api.post(`/posts/${id}/comment`, commentData);
      return response.data;
    } catch (error) {
      if (isNetworkError(error)) {
        const local = localStorage.getItem('digiheart_posts');
        if (local) {
          const list = JSON.parse(local);
          const updated = list.map(post => {
            if (post.id === id || post._id === id) {
              const newComment = {
                id: Date.now(),
                author: commentData.author || 'Bạn',
                text: commentData.text,
                date: new Date().toISOString().split('T')[0]
              };
              return { ...post, comments: [...post.comments, newComment] };
            }
            return post;
          });
          localStorage.setItem('digiheart_posts', JSON.stringify(updated));
          return { message: 'Bình luận cục bộ thành công!' };
        }
      }
      throw error;
    }
  },

  // Admin xóa bài viết
  delete: async (id) => {
    try {
      const response = await api.delete(`/posts/${id}`);
      return response.data;
    } catch (error) {
      if (isNetworkError(error)) {
        const local = localStorage.getItem('digiheart_posts');
        if (local) {
          const list = JSON.parse(local);
          const filtered = list.filter(post => post.id !== id && post._id !== id);
          localStorage.setItem('digiheart_posts', JSON.stringify(filtered));
          return { message: 'Xóa bài viết cục bộ thành công!' };
        }
      }
      throw error;
    }
  }
};
