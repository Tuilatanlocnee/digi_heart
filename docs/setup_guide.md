# Hướng Dẫn Cài Đặt Công Cụ, Thư Viện Và Khởi Chạy Dự Án Digi Heart (Môi trường Local)

Tài liệu này hướng dẫn chi tiết từ A-Z cách tải, cài đặt các công cụ hệ thống, phiên bản cụ thể của các thư viện và các bước để khởi chạy dự án Digi Heart trên máy tính cá nhân (Localhost).

---

## 1. Yêu Cầu Phiên Bản Công Cụ Hệ Thống (Prerequisites)

Để dự án chạy ổn định và không gặp lỗi xung đột, vui lòng cài đặt các công cụ với phiên bản chính xác như sau:

| Công cụ | Phiên bản khuyến nghị | Mục đích sử dụng | Link tải chính thức |
| :--- | :--- | :--- | :--- |
| **Node.js** | **`v20.14.0 LTS`** (hoặc `>= v18.0.0`) | Môi trường chạy Javascript cho Backend và Frontend. | [Tải Node.js](https://nodejs.org/en/download/package-manager) |
| **MongoDB Community Server** | **`v8.0 Stable`** (Khuyên dùng v8.0) | Hệ quản trị cơ sở dữ liệu lưu trữ dữ liệu local. | [Tải MongoDB](https://www.mongodb.com/try/download/community) |
| **Git** | Phiên bản mới nhất (`>= v2.40.0`) | Clone mã nguồn từ GitHub về máy. | [Tải Git](https://git-scm.com/downloads) |
| **MongoDB Compass** | Phiên bản mới nhất | Giao diện trực quan để xem và quản lý Database. | [Tải Compass](https://www.mongodb.com/try/download/compass) |

---

## 2. Hướng Dẫn Chi Tiết Cách Cài Đặt Công Cụ

### Bước 2.1: Cài đặt Node.js
1. Truy cập link tải Node.js ở bảng trên, tải bản cài đặt `.msi` (cho Windows) hoặc `.pkg` (cho macOS).
2. Chạy file cài đặt, nhấn **Next** liên tục (giữ các thiết lập mặc định) và nhấn **Finish**.
3. **Kiểm tra cài đặt**: Mở Terminal/Command Prompt gõ:
   ```bash
   node -v
   npm -v
   ```
   *Kết quả mong đợi*: Hiển thị phiên bản Node (ví dụ `v20.14.0`) và npm (ví dụ `v10.7.0`).

### Bước 2.2: Cài đặt MongoDB Local
1. Tải bản **MongoDB Community Server (v8.0 Stable)** cho Windows (dạng MSI).
2. Khi cài đặt, chọn kiểu **Complete**.
3. **Rất quan trọng**: Ở màn hình cài đặt có tích chọn *"Install MongoDB as a Service"*, hãy giữ nguyên tích chọn này để MongoDB tự khởi động cùng máy tính.
4. Cài đặt thêm **MongoDB Compass** (thường trình cài đặt MongoDB sẽ tự động hỏi ở bước cuối, nếu không bạn hãy tải thủ công ở link trên).
5. **Kiểm tra dịch vụ**:
   * Trên Windows: Nhấn `Win + R`, gõ `services.msc` nhấn Enter. Tìm dịch vụ tên là **MongoDB Agent** hoặc **MongoDB Server**. Đảm bảo cột *Status* của nó đang là **Running**.

---

## 3. Danh Sách Thư Viện Và Phiên Bản Sử Dụng Trong Dự Án

Khi chạy lệnh cài đặt, hệ thống sẽ tự động cài các thư viện được định nghĩa sẵn trong dự án với phiên bản như sau:

### A. Backend API Server (trong thư mục `/server/package.json`)
* **`express`** (`^4.19.2`): Framework chính để tạo các API Routes.
* **`mongoose`** (`^8.3.1`): Thư viện ODM dùng kết nối và thao tác với Database MongoDB.
* **`bcryptjs`** (`^2.4.3`): Thư viện mã hóa mật khẩu người dùng (Admin) an toàn.
* **`jsonwebtoken`** (`^9.0.2`): Tạo và xác thực mã Token (JWT) phục vụ đăng nhập.
* **`cors`** (`^2.8.5`): Middleware cho phép Frontend gọi API khác cổng (Cross-Origin Resource Sharing).
* **`dotenv`** (`^16.4.5`): Load các biến cấu hình từ file `.env` vào project.

### B. Frontend Website (trong thư mục `/website/package.json`)
* **`react`** & **`react-dom`** (`^19.2.6`): Thư viện UI cốt lõi để xây dựng giao diện.
* **`react-router-dom`** (`^7.15.1`): Quản lý các trang con và định tuyến (routing).
* **`axios`** (`^1.16.1`): Thư viện gọi các request HTTP API tới Backend.
* **`react-icons`** (`^5.6.0`): Bộ icon đa dạng dùng cho giao diện.
* **`tailwindcss`** (`^3.4.19`): Framework styling CSS tiện lợi.
* **`vite`** (`^8.0.12`): Trình biên dịch và chạy thử (Dev Server) siêu tốc cho React.

---

## 4. Quy Trình Khởi Chạy Dự Án Chi Tiết

Sau khi sếp đã cài xong các công cụ trên, hãy mở Terminal (hoặc Git Bash/VS Code Terminal) và chạy các lệnh sau:

### Bước 4.1: Tải mã nguồn về máy
```bash
git clone https://github.com/Tuilatanlocnee/digi_heart.git
cd digi_heart
```

### Bước 4.2: Thiết lập và Chạy Backend (Dịch vụ 1)
1. Di chuyển vào thư mục `/server`:
   ```bash
   cd server
   ```
2. Cài đặt toàn bộ thư viện:
   ```bash
   npm install
   ```
3. Tạo file cấu hình môi trường `.env`:
   * Copy file `.env.example` thành file `.env`.
   * Mở file `.env` và điền cấu hình (để mặc định kết nối với local MongoDB):
     ```env
     PORT=5000
     MONGODB_URI=mongodb://127.0.0.1:27017/digi_heart
     JWT_SECRET=digi_heart_super_secret_key_123
     ```
4. **Nạp dữ liệu mẫu ban đầu (Chỉ chạy 1 lần duy nhất)**:
   * Chạy lệnh sau để tạo tài khoản admin (`admin`/`admin123`) và các bài viết mẫu:
     ```bash
     npm run seed
     ```
     *Kết quả mong đợi*: Màn hình hiện thông báo nạp thành công các bài viết và tài khoản quản trị vào cơ sở dữ liệu local.
5. Khởi chạy Backend ở chế độ phát triển:
   ```bash
   npm run dev
   ```
   *Kết quả mong đợi*: Terminal hiển thị: `🚀 Server đang chạy trên port: 5000` và `✅ Kết nối MongoDB thành công!`.

---

### Bước 4.3: Thiết lập và Chạy Frontend (Dịch vụ 2)
1. Mở một cửa sổ Terminal mới (song song với Terminal Backend) và di chuyển vào `/website`:
   ```bash
   cd website
   ```
2. Cài đặt các thư viện Frontend:
   ```bash
   npm install
   ```
3. Tạo file cấu hình môi trường `.env`:
   * Copy file `.env.example` thành file `.env` (để trống hoặc điền như sau để trỏ về API localhost):
     ```env
     VITE_API_URL=http://localhost:5000/api
     ```
4. Khởi chạy Frontend:
   ```bash
   npm run dev
   ```
   *Kết quả mong đợi*: Terminal hiển thị:
   ```text
     ➜  Local:   http://localhost:5173/
   ```

Bây giờ sếp chỉ cần mở trình duyệt và truy cập vào **`http://localhost:5173`** để trải nghiệm website chạy cục bộ trên máy của mình!

---

## 5. Kịch Bản Kiểm Thử Nhanh Để Đảm Bảo Setup Đúng (Test Cases)

* **Test Case 1: Kiểm tra kết nối API**
  * Truy cập vào trang chủ `http://localhost:5173`. Nếu giao diện hiển thị đầy đủ các bài viết trên Bảng tin Fanpage (chào mừng CLB, chiến dịch Kỳ nghỉ hồng...), nghĩa là Frontend đã gọi API Backend thành công.
* **Test Case 2: Đăng nhập Admin**
  * Click nút **Đăng nhập** ở góc trên bên phải.
  * Nhập tài khoản: `admin` | Mật khẩu: `admin123`.
  * *Kết quả mong đợi*: Đăng nhập thành công và chuyển hướng vào Dashboard quản trị viên.
