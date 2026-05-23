import jwt from 'jsonwebtoken';

/**
 * Middleware xác thực Token JWT của Admin trước khi cho phép truy cập các API quản trị
 */
export default function authMiddleware(req, res, next) {
  // Lấy token từ Header Authorization
  const authHeader = req.headers['authorization'];
  
  if (!authHeader) {
    return res.status(401).json({ message: 'Không có mã xác thực (Token). Truy cập bị từ chối!' });
  }

  // Token thường gửi dưới dạng: Bearer <TOKEN_STRING>
  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Mã xác thực không đúng định dạng.' });
  }

  try {
    const secret = process.env.JWT_SECRET || 'digi_heart_super_secret_key_123';
    const decoded = jwt.verify(token, secret);
    
    // Lưu thông tin admin đã giải mã vào object request để dùng tiếp ở các controller phía sau
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Mã xác thực đã hết hạn hoặc không hợp lệ!' });
  }
}
