import express from 'express';
import News from '../models/News.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// 1. API Lấy toàn bộ danh sách tin tức (Công khai cho mọi người)
router.get('/', async (req, res) => {
  try {
    const newsList = await News.find().sort({ createdAt: -1 });
    res.json(newsList);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy danh sách tin tức!', error: error.message });
  }
});

// 2. API Lấy chi tiết một bài viết tin tức (Công khai)
router.get('/:id', async (req, res) => {
  try {
    const newsItem = await News.findById(req.params.id);
    if (!newsItem) {
      return res.status(404).json({ message: 'Không tìm thấy bài viết tin tức.' });
    }
    res.json(newsItem);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy chi tiết tin tức!', error: error.message });
  }
});

// 3. API Đăng bài viết tin tức mới (Yêu cầu quyền Admin)
router.post('/', authMiddleware, async (req, res) => {
  const { title, summary, content, category, author, image } = req.body;

  try {
    if (!title || !summary || !content || !category || !author) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ các thông tin bắt buộc (*).' });
    }

    const newNews = new News({
      title,
      summary,
      content,
      category,
      author,
      image: image || undefined
    });

    const savedNews = await newNews.save();
    res.status(201).json({
      message: 'Đăng bài viết tin tức thành công!',
      news: savedNews
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi đăng bài viết tin tức!', error: error.message });
  }
});

// 4. API Xóa bài viết tin tức (Yêu cầu quyền Admin)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const deletedNews = await News.findByIdAndDelete(req.params.id);
    if (!deletedNews) {
      return res.status(404).json({ message: 'Không tìm thấy bài viết tin tức cần xóa.' });
    }
    res.json({
      message: 'Đã xóa bài viết tin tức thành công!',
      news: deletedNews
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi xóa bài viết tin tức!', error: error.message });
  }
});

// 5. API Chỉnh sửa bài viết tin tức (Yêu cầu quyền Admin)
router.put('/:id', authMiddleware, async (req, res) => {
  const { title, summary, content, category, author, image } = req.body;

  try {
    if (!title || !summary || !content || !category || !author) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ các thông tin bắt buộc (*).' });
    }

    const updatedNews = await News.findByIdAndUpdate(
      req.params.id,
      {
        title,
        summary,
        content,
        category,
        author,
        image: image || undefined
      },
      { new: true }
    );

    if (!updatedNews) {
      return res.status(404).json({ message: 'Không tìm thấy bài viết tin tức cần chỉnh sửa.' });
    }

    res.json({
      message: 'Cập nhật bài viết tin tức thành công!',
      news: updatedNews
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi cập nhật bài viết tin tức!', error: error.message });
  }
});

export default router;
