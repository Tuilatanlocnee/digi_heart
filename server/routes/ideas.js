import express from 'express';
import Idea from '../models/Idea.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// 1.2 API Lấy danh sách ý tưởng đã được duyệt/tiếp nhận (Công khai)
router.get('/approved', async (req, res) => {
  try {
    const ideas = await Idea.find({ 
      status: { $ne: 'Chờ duyệt' },
      type: { $ne: 'Góp ý' } // Chỉ hiển thị Sáng kiến, không hiển thị Góp ý liên hệ chung
    }).sort({ createdAt: -1 });
    res.json(ideas);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy danh sách sáng kiến số!', error: error.message });
  }
});

// 1. API Lấy danh sách toàn bộ ý tưởng (Dành riêng cho Admin)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const ideas = await Idea.find().sort({ createdAt: -1 });
    res.json(ideas);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy danh sách ý tưởng sáng kiến!', error: error.message });
  }
});

// 2. API Gửi ý tưởng mới (Công khai cho đoàn viên)
router.post('/', async (req, res) => {
  const { fullName, email, title, description, type } = req.body;

  try {
    if (!fullName || !title || !description) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ các thông tin bắt buộc (*).' });
    }

    const newIdea = new Idea({
      fullName,
      email,
      title,
      description,
      type: type || 'Sáng kiến'
    });

    const savedIdea = await newIdea.save();
    res.status(201).json({
      message: 'Gửi ý tưởng chuyển đổi số thành công! Cảm ơn đóng góp của bạn.',
      idea: savedIdea
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi gửi ý tưởng đóng góp!', error: error.message });
  }
});

// 3. API Cập nhật trạng thái ý tưởng (Admin phân loại / tiến trình thực hiện)
router.put('/:id', authMiddleware, async (req, res) => {
  const { status } = req.body;

  try {
    const validStatuses = ['Chờ duyệt', 'Đã tiếp nhận', 'Đang thử nghiệm', 'Đã áp dụng', 'Đã phản hồi'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Trạng thái xử lý không hợp lệ!' });
    }

    const updatedIdea = await Idea.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updatedIdea) {
      return res.status(404).json({ message: 'Không tìm thấy ý tưởng sáng kiến cần cập nhật.' });
    }

    res.json({
      message: `Đã chuyển đổi trạng thái sáng kiến sang: ${status}`,
      idea: updatedIdea
    });

  } catch (error) {
    res.status(500).json({ message: 'Lỗi cập nhật tiến trình ý tưởng!', error: error.message });
  }
});

// 4. API Xóa ý tưởng (Admin dọn dẹp tin spam)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const deletedIdea = await Idea.findByIdAndDelete(req.params.id);
    if (!deletedIdea) {
      return res.status(404).json({ message: 'Không tìm thấy ý tưởng sáng kiến.' });
    }
    res.json({ message: 'Đã xóa ý tưởng thành công!', idea: deletedIdea });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi xóa ý tưởng đóng góp!', error: error.message });
  }
});

export default router;
