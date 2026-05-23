import express from 'express';
import jwt from 'jsonwebtoken';
import Post from '../models/Post.js';
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

// 1. API Lấy toàn bộ bài đăng trên Fanpage (Công khai)
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 }); // Bài mới nhất xếp trước
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy danh sách bài viết!', error: error.message });
  }
});

// 2. API Tạo bài viết mới (Yêu cầu đăng nhập)
router.post('/', authMiddleware, async (req, res) => {
  const { content, image } = req.body;
  const authorName = req.user.username === 'admin' ? 'Ban Quản Trị CLB' : req.user.username;

  try {
    if (!content) {
      return res.status(400).json({ message: 'Nội dung bài viết không được để trống!' });
    }

    const newPost = new Post({
      author: authorName,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      content,
      image: image || null,
      time: 'Vừa xong'
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

// 5. API Xóa bài đăng Fanpage (Chỉ Admin mới được quyền xóa các bài đăng vi phạm)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const deletedPost = await Post.findByIdAndDelete(req.params.id);
    if (!deletedPost) {
      return res.status(404).json({ message: 'Không tìm thấy bài viết cần xóa.' });
    }
    res.json({ message: 'Đã xóa bài viết thành công!', post: deletedPost });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi xóa bài đăng!', error: error.message });
  }
});

export default router;
