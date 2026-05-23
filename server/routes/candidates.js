import express from 'express';
import bcrypt from 'bcryptjs';
import Candidate from '../models/Candidate.js';
import User from '../models/User.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// 1. API Lấy toàn bộ danh sách ứng viên (Dành riêng cho Admin)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const candidates = await Candidate.find().sort({ createdAt: -1 }); // Mới nhất xếp trước
    res.json(candidates);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy danh sách ứng viên!', error: error.message });
  }
});

// 2. API Đăng ký gia nhập CLB mới (Công khai cho tất cả người dùng)
router.post('/', async (req, res) => {
  const { fullName, email, phone, department, targetBan, skills, reason } = req.body;

  try {
    if (!fullName || !email || !phone || !reason) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ các trường bắt buộc (*)' });
    }

    const newCandidate = new Candidate({
      fullName,
      email,
      phone,
      department: department || 'Đoàn viên tự do',
      targetBan: targetBan || 'Ban Kỹ thuật Số',
      skills,
      reason
    });

    const savedCandidate = await newCandidate.save();
    res.status(201).json({
      message: 'Đăng ký ứng tuyển gia nhập CLB thành công!',
      candidate: savedCandidate
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lưu thông tin đăng ký!', error: error.message });
  }
});

// 3. API Cập nhật trạng thái ứng viên (Admin phê duyệt / từ chối)
router.put('/:id', authMiddleware, async (req, res) => {
  const { status } = req.body;

  try {
    if (!status || !['Chờ duyệt', 'Đã duyệt', 'Từ chối'].includes(status)) {
      return res.status(400).json({ message: 'Trạng thái duyệt không hợp lệ!' });
    }

    // Tìm hồ sơ ứng viên trước
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ message: 'Không tìm thấy hồ sơ ứng viên.' });
    }

    // Nếu phê duyệt sang 'Đã duyệt', tự động tạo tài khoản cho thành viên
    if (status === 'Đã duyệt') {
      const existingUser = await User.findOne({ username: candidate.phone });
      if (!existingUser) {
        const hashedPassword = await bcrypt.hash(candidate.phone, 10);
        const newUser = new User({
          username: candidate.phone,
          password: hashedPassword,
          fullName: candidate.fullName,
          role: 'member'
        });
        await newUser.save();
      }
    }

    candidate.status = status;
    const updatedCandidate = await candidate.save();

    res.json({
      message: `Đã cập nhật trạng thái ứng viên thành: ${status}`,
      candidate: updatedCandidate
    });

  } catch (error) {
    res.status(500).json({ message: 'Lỗi cập nhật trạng thái ứng viên!', error: error.message });
  }
});

// 4. API Xóa hồ sơ ứng viên (Dành cho Admin)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const deletedCandidate = await Candidate.findByIdAndDelete(req.params.id);
    if (!deletedCandidate) {
      return res.status(404).json({ message: 'Không tìm thấy hồ sơ ứng viên.' });
    }
    res.json({ message: 'Đã xóa hồ sơ đăng ký thành công!', candidate: deletedCandidate });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi xóa hồ sơ đăng ký!', error: error.message });
  }
});

export default router;
