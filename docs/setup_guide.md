# Hướng dẫn Cài đặt và Khởi chạy Dự án Digi Heart

Tài liệu này hướng dẫn chi tiết cách cài đặt môi trường và khởi chạy dự án Digi Heart bao gồm cả Frontend và Backend.

---

## 1. Yêu cầu Hệ thống

- **Node.js**: Phiên bản `>= 18.0.0`
- **MongoDB**: Đang chạy cục bộ trên máy ở cổng mặc định `27017` hoặc kết nối thông qua MongoDB Atlas.

---

## 2. Các bước Chuẩn bị cơ sở dữ liệu (MongoDB)

Dự án sử dụng MongoDB để lưu trữ dữ liệu. Hãy chắc chắn dịch vụ MongoDB của bạn đang hoạt động trước khi khởi chạy backend.

- **Trên Windows**: 
  - Mở ứng dụng **Services** (gõ `services.msc` trong hộp thoại Run `Win + R`).
  - Tìm service tên là **MongoDB Server** và bấm **Start** (hoặc Restart) để kích hoạt.
  - Ngoài ra bạn có thể sử dụng ứng dụng **MongoDB Compass** để kiểm tra kết nối với URI: `mongodb://127.0.0.1:27017`.

---

## 3. Các bước Khởi chạy Dự án

Bạn cần mở hai terminal riêng biệt để chạy song song 2 dịch vụ:

### Dịch vụ 1: Backend API Server
1. Mở terminal mới và chuyển vào thư mục `/server`:
   ```bash
   cd server
   ```
2. Cài đặt các thư viện phụ thuộc:
   ```bash
   npm install
   ```
   *Kết quả*: Tạo thư mục `node_modules` chứa các gói Express, Mongoose, v.v.
3. Chạy dữ liệu mẫu (Seed Data) (Chỉ chạy khi cài đặt dự án lần đầu):
   > [!WARNING]
   > **CẢNH BÁO BẢO TOÀN DỮ LIỆU:**
   > Lệnh `npm run seed` sẽ **xóa sạch toàn bộ dữ liệu hiện có** trong database để reset lại từ đầu.
   > * **Chỉ chạy duy nhất một lần** khi cài đặt mới.
   > * Từ các lần sau, **tuyệt đối KHÔNG chạy lệnh này** để tránh mất các tài khoản thành viên và dữ liệu thực tế đã lưu.
   
   Nếu bạn cần reset hoặc tạo lại tài khoản Admin ban đầu, hãy chạy:
   ```bash
   npm run seed
   ```
   *Kết quả mong đợi*: Màn hình hiển thị quá trình kết nối và tạo tài khoản Admin mặc định thành công.
4. Chạy server phát triển (watch mode):
   ```bash
   npm run dev
   ```
   *Kết quả*: Server chạy ở cổng 5000:
   ```text
   Server is running on port 5000
   Connected to MongoDB
   ```

### Dịch vụ 2: Frontend Website
1. Mở terminal khác và chuyển vào thư mục `/website`:
   ```bash
   cd website
   ```
2. Cài đặt các thư viện phụ thuộc:
   ```bash
   npm install
   ```
   *Kết quả*: Tạo thư mục `node_modules` chứa các gói React, Tailwind CSS, Vite.
3. Chạy website phát triển:
   ```bash
   npm run dev
   ```
   *Kết quả*: Vite biên dịch và hiển thị cổng chạy local:
   ```text
   ➜  Local:   http://localhost:5173/
   ```

Mở trình duyệt truy cập: [http://localhost:5173/](http://localhost:5173/) để trải nghiệm website.

---

## 4. Kịch bản Kiểm thử nhanh (Test Cases)

1. **Test Case 1: Tải dữ liệu từ database**
   - Truy cập trang **Projects** hoặc **Blog**.
   - Nếu dữ liệu mẫu hiển thị (tiêu đề dự án, mô tả, ảnh), có nghĩa là Frontend và Backend đã kết nối với nhau thông qua API cổng 5000 thành công.

2. **Test Case 2: Đăng ký thành viên (Join Us)**
   - Vào mục **Join Us**, điền thông tin vào form và nhấn submit.
   - Kiểm tra xem có popup thông báo thành công không. Dữ liệu này sẽ được lưu vào collection `candidates` của database `digi_heart`.
