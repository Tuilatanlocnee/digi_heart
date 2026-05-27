import express from 'express';
import jwt from 'jsonwebtoken';
import Post from '../models/Post.js';
import User from '../models/User.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Hàm hỗ trợ giải mã lấy thông tin người dùng từ token nếu có (không bắt buộc)
const getOptionalUser = (req) => {
  const authHeader = req.headers['authorization'];
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    if (token) {
      try {
        const secret = process.env.JWT_SECRET || 'digi_heart_super_secret_key_123';
        return jwt.verify(token, secret);
      } catch (e) {
        // Bỏ qua nếu token không hợp lệ
      }
    }
  }
  return null;
};

// 1. API Lấy toàn bộ bài đăng trên Fanpage (Công khai, chỉ lấy những bài chưa bị xóa)
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find({ isDeleted: { $ne: true } }).sort({ createdAt: -1 }); // Bài mới nhất xếp trước
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy danh sách bài viết!', error: error.message });
  }
});

// 1.5 API Lấy danh sách bài viết đã bị xóa tạm thời (Chỉ dành cho Admin truy cập Thùng rác)
router.get('/deleted', authMiddleware, async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin' || req.user.role === 'superadmin';
    if (!isAdmin) {
      return res.status(403).json({ message: 'Bạn không có quyền truy cập Thùng rác!' });
    }
    const posts = await Post.find({ isDeleted: true }).sort({ updatedAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy danh sách bài viết đã xóa!', error: error.message });
  }
});

// 2. API Tạo bài viết mới (Yêu cầu đăng nhập)
router.post('/', authMiddleware, async (req, res) => {
  const { title, content, image } = req.body;

  try {
    if (!title) {
      return res.status(400).json({ message: 'Tiêu đề bài viết không được để trống!' });
    }
    if (!content) {
      return res.status(400).json({ message: 'Nội dung bài viết không được để trống!' });
    }

    // Lấy thông tin đầy đủ của User từ database để lấy fullName và avatar thực tế
    const user = await User.findById(req.user.id);
    let authorName = 'Đoàn Viên MobiFone';
    let authorAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80';

    if (user) {
      if (user.role === 'admin' || user.role === 'superadmin') {
        authorName = 'Ban Quản Trị CLB';
      } else {
        authorName = user.fullName || user.username;
      }
      if (user.avatar) {
        authorAvatar = user.avatar;
      }
    } else if (req.user.username === 'admin') {
      authorName = 'Ban Quản Trị CLB';
    }

    const newPost = new Post({
      title,
      author: authorName,
      avatar: authorAvatar,
      content,
      image: image || null,
      time: new Date().toISOString().split('T')[0]
    });

    const savedPost = await newPost.save();
    res.status(201).json({
      message: 'Đăng bài viết lên Fanpage thành công!',
      post: savedPost
    });

  } catch (error) {
    res.status(500).json({ message: 'Lỗi tạo bài viết mới!', error: error.message });
  }
});

// 3. API Thích bài viết (Like)
router.post('/:id/like', async (req, res) => {
  const user = getOptionalUser(req);
  const { guestId } = req.body;

  // Xác định định danh người thích (Ưu tiên username nếu đã đăng nhập, ngược lại dùng guestId)
  const identifier = user ? `user_${user.username}` : (guestId ? `guest_${guestId}` : null);

  if (!identifier) {
    return res.status(400).json({ message: 'Thiếu định danh người dùng hoặc Guest ID!' });
  }

  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Không tìm thấy bài viết.' });
    }

    // Đảm bảo trường likedBy tồn tại trong Schema
    if (!post.likedBy) {
      post.likedBy = [];
    }

    const index = post.likedBy.indexOf(identifier);
    let liked = false;

    if (index > -1) {
      // Nếu đã thích rồi thì HỦY THÍCH (Unlike)
      post.likedBy.splice(index, 1);
      post.likes = Math.max(0, post.likes - 1);
      liked = false;
    } else {
      // Nếu chưa thích thì THÊM VÀO (Like)
      post.likedBy.push(identifier);
      post.likes += 1;
      liked = true;
    }

    const updatedPost = await post.save();
    res.json({ 
      message: liked ? 'Đã thích bài viết!' : 'Đã bỏ thích bài viết!', 
      post: updatedPost,
      liked 
    });

  } catch (error) {
    res.status(500).json({ message: 'Lỗi thích bài viết!', error: error.message });
  }
});

// 3b. API Lấy chi tiết danh sách người thích bài viết
router.get('/:id/likes', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Không tìm thấy bài viết.' });
    }

    const likers = [];
    const likedBy = post.likedBy || [];

    for (const item of likedBy) {
      if (item.startsWith('user_')) {
        const username = item.replace('user_', '');
        const user = await User.findOne({ username });
        if (user) {
          likers.push({
            username: user.username,
            fullName: user.fullName,
            avatar: user.avatar || '',
            role: user.role,
            type: 'user'
          });
        } else {
          likers.push({
            username,
            fullName: username === 'admin' ? 'Ban Quản Trị CLB' : `Thành viên (${username})`,
            avatar: '',
            role: 'member',
            type: 'user'
          });
        }
      } else {
        likers.push({
          username: item,
          fullName: 'Khách ẩn danh',
          avatar: '',
          role: 'guest',
          type: 'guest'
        });
      }
    }

    res.json(likers);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy danh sách người thích!', error: error.message });
  }
});

// 4. API Thêm bình luận mới (Comment)
router.post('/:id/comment', async (req, res) => {
  const { author, text } = req.body;

  try {
    if (!text) {
      return res.status(400).json({ message: 'Nội dung bình luận không được để trống!' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Không tìm thấy bài viết.' });
    }

    const newComment = {
      author: author || 'Bạn',
      text
    };

    post.comments.push(newComment);
    const updatedPost = await post.save();
    res.status(201).json({
      message: 'Đã đăng bình luận!',
      post: updatedPost
    });

  } catch (error) {
    res.status(500).json({ message: 'Lỗi bình luận bài viết!', error: error.message });
  }
});

// 4.5 API Chỉnh sửa bài viết (Yêu cầu đăng nhập, chỉ chính tác giả mới được sửa)
router.put('/:id', authMiddleware, async (req, res) => {
  const { title, content, image } = req.body;

  try {
    if (!title) {
      return res.status(400).json({ message: 'Tiêu đề bài viết không được để trống!' });
    }
    if (!content) {
      return res.status(400).json({ message: 'Nội dung bài viết không được để trống!' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Không tìm thấy bài viết cần chỉnh sửa.' });
    }

    // Kiểm tra quyền: chỉ tác giả bài viết mới được sửa
    const user = await User.findById(req.user.id);
    const isAuthor = user && post.author === user.fullName;

    if (!isAuthor) {
      return res.status(403).json({ message: 'Bạn không có quyền chỉnh sửa bài viết này!' });
    }

    post.title = title;
    post.content = content;
    if (image !== undefined) {
      post.image = image;
    }

    const updatedPost = await post.save();
    res.json({
      message: 'Đã cập nhật bài viết thành công!',
      post: updatedPost
    });

  } catch (error) {
    res.status(500).json({ message: 'Lỗi cập nhật bài viết!', error: error.message });
  }
});

// 5. API Xóa bài đăng Fanpage - Chuyển sang Soft Delete (Chỉ tác giả hoặc Admin mới được quyền xóa)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Không tìm thấy bài viết cần xóa.' });
    }

    // Kiểm tra quyền: tác giả bài viết hoặc admin/superadmin mới được xóa
    const user = await User.findById(req.user.id);
    const isAuthor = user && post.author === user.fullName;
    const isAdmin = req.user.role === 'admin' || req.user.role === 'superadmin';

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ message: 'Bạn không có quyền xóa bài viết này!' });
    }

    post.isDeleted = true;
    const savedPost = await post.save();
    res.json({ message: 'Đã chuyển bài viết vào Thùng rác thành công!', post: savedPost });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi xóa bài đăng!', error: error.message });
  }
});

// 5.5 API Khôi phục bài viết đã xóa tạm thời từ Thùng rác (Chỉ Admin)
router.post('/:id/restore', authMiddleware, async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin' || req.user.role === 'superadmin';
    if (!isAdmin) {
      return res.status(403).json({ message: 'Bạn không có quyền khôi phục bài viết!' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Không tìm thấy bài viết.' });
    }

    post.isDeleted = false;
    const restoredPost = await post.save();
    res.json({ message: 'Khôi phục bài viết thành công!', post: restoredPost });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khôi phục bài viết!', error: error.message });
  }
});

// 5.6 API Xóa vĩnh viễn bài viết khỏi database (Chỉ Admin)
router.delete('/:id/force', authMiddleware, async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin' || req.user.role === 'superadmin';
    if (!isAdmin) {
      return res.status(403).json({ message: 'Bạn không có quyền xóa vĩnh viễn bài viết!' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Không tìm thấy bài viết.' });
    }

    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Đã xóa vĩnh viễn bài viết thành công!', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi xóa vĩnh viễn bài viết!', error: error.message });
  }
});

export default router;
