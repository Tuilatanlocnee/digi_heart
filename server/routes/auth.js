import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// 1. API Đăng nhập Admin
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    if (!username || !password) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ tài khoản và mật khẩu!' });
    }

    // Tìm kiếm tài khoản trong CSDL
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Tài khoản không chính xác!' });
    }

    // So sánh mật khẩu băm (bcrypt)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Mật khẩu không chính xác!' });
    }

    // Tạo mã thông báo JWT (hết hạn trong 1 ngày)
    const secret = process.env.JWT_SECRET || 'digi_heart_super_secret_key_123';
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      secret,
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Đăng nhập hệ thống thành công!',
      token,
      user: {
        username: user.username,
        role: user.role,
        fullName: user.fullName || 'Thành viên CLB'
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Lỗi đăng nhập hệ thống!', error: error.message });
  }
});

// 2. API Kiểm tra token / lấy thông tin tài khoản hiện tại
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin tài khoản.' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy thông tin phiên làm việc!', error: error.message });
  }
});

// 3. API Thay đổi mật khẩu tài khoản (Yêu cầu đăng nhập)
router.put('/change-password', authMiddleware, async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  try {
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ mật khẩu cũ và mật khẩu mới!' });
    }

    if (newPassword.length < 4) {
      return res.status(400).json({ message: 'Mật khẩu mới phải có độ dài ít nhất 4 ký tự!' });
    }

    // Tìm kiếm tài khoản
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin tài khoản.' });
    }

    // So sánh mật khẩu cũ
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Mật khẩu cũ không chính xác!' });
    }

    // Băm và lưu mật khẩu mới
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: 'Thay đổi mật khẩu tài khoản thành công!' });

  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi thay đổi mật khẩu!', error: error.message });
  }
});

export default router;
