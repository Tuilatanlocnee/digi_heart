# Digi Heart Youth Club - Hướng dẫn Cài đặt & Khởi chạy Dự án

Dự án Digi Heart là một website dành cho câu lạc bộ thanh niên bao gồm hai phần chính:
1. **Backend (Server)**: Xây dựng bằng Node.js, Express, kết nối cơ sở dữ liệu MongoDB để quản lý bài viết, dự án và thông tin thành viên.
2. **Frontend (Website)**: Xây dựng bằng React.js, Vite và Tailwind CSS, cung cấp giao diện tương tác hiện đại cho người dùng.

---

## 1. Yêu cầu Hệ thống (Prerequisites)

Trước khi bắt đầu, hãy đảm bảo máy tính của bạn đã cài đặt các công cụ sau:
- **Node.js**: Phiên bản LTS mới nhất (Khuyên dùng từ `v18.x` hoặc `v20.x` trở lên).
  - Kiểm tra bằng lệnh: `node -v`
- **MongoDB**: Bạn cần chạy dịch vụ MongoDB cục bộ (Local MongoDB Server) hoặc sử dụng MongoDB Atlas trực tuyến.
  - Cổng mặc định: `27017`
  - Cơ sở dữ liệu: `digi_heart`
  - Nếu chạy MongoDB cục bộ, hãy đảm bảo service MongoDB (như MongoDB Community Server) đang hoạt động.

---

## 2. Cấu trúc Dự án

```text
digi_heart/
├── server/          # Mã nguồn Backend (Express.js + Mongoose)
├── website/         # Mã nguồn Frontend (React + Vite)
├── package.json     # Cấu hình cài đặt chung (nếu có)
└── README.md        # Tài liệu hướng dẫn (File này)
```

---

## 3. Cấu hình Môi trường (Configuration)

### Backend (`/server`)
Tại thư mục [server](file:///d:/digi_heart/server), file [.env](file:///d:/digi_heart/server/.env) đã được thiết lập sẵn dựa trên file [.env.example](file:///d:/digi_heart/server/.env.example). Vui lòng xác nhận các thông tin sau đã trùng khớp với môi trường của bạn:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/digi_heart
JWT_SECRET=digi_heart_super_secret_key_123
```

- Nếu MongoDB của bạn yêu cầu tài khoản/mật khẩu hoặc đang chạy ở cổng khác, hãy sửa lại đường dẫn `MONGODB_URI`.

---

## 4. Hướng dẫn Khởi chạy Từng bước

Hãy mở **hai cửa sổ Terminal** riêng biệt để chạy đồng thời cả Backend và Frontend.

### Bước 1: Khởi chạy Backend (Server)

Mở Terminal thứ nhất và thực hiện các lệnh sau:

1. **Di chuyển vào thư mục server**:
   ```bash
   cd server
   ```
2. **Cài đặt các thư viện dependencies**:
   ```bash
   npm install
   ```
   *Kết quả mong đợi*: Quá trình cài đặt hoàn tất không có lỗi, thư mục `node_modules` được tạo ra trong thư mục `server`.
3. **Nạp dữ liệu mẫu (Seed Data) vào MongoDB (Chỉ chạy khi cài đặt lần đầu)**:
   > [!WARNING]
   > **LƯU Ý QUAN TRỌNG VỀ BẢO TOÀN DỮ LIỆU:**
   > Lệnh `npm run seed` sẽ **xóa sạch toàn bộ dữ liệu hiện tại** trong database MongoDB để reset lại từ đầu. 
   > * **Chỉ chạy lệnh này 1 lần duy nhất** khi bạn cài đặt dự án lần đầu.
   > * Từ các lần chạy sau, **tuyệt đối KHÔNG chạy lệnh này** để tránh mất các tài khoản và dữ liệu đăng ký thực tế của người dùng.
   
   Nếu bạn cần reset hoặc nạp lại cấu hình admin ban đầu, hãy chạy:
   ```bash
   npm run seed
   ```
   *Kết quả mong đợi*: Terminal hiển thị quá trình kết nối thành công và tạo tài khoản Admin mặc định.
4. **Khởi chạy Server ở chế độ phát triển**:
   ```bash
   npm run dev
   ```
   *Kết quả mong đợi*: Màn hình terminal hiển thị thông báo Server đang chạy thành công trên cổng 5000:
   ```text
   Server is running on port 5000
   Connected to MongoDB
   ```

---

### Bước 2: Khởi chạy Frontend (Website)

Mở Terminal thứ hai và thực hiện các lệnh sau:

1. **Di chuyển vào thư mục website**:
   ```bash
   cd website
   ```
2. **Cài đặt các thư viện dependencies**:
   ```bash
   npm install
   ```
   *Kết quả mong đợi*: Quá trình cài đặt hoàn tất không có lỗi, thư mục `node_modules` được tạo ra trong thư mục `website`.
3. **Khởi chạy Frontend với Vite**:
   ```bash
   npm run dev
   ```
   *Kết quả mong đợi*: Vite khởi chạy thành công và cung cấp địa chỉ truy cập cục bộ (local URL):
   ```text
     VITE v8.x.x  ready in xxx ms

     ➜  Local:   http://localhost:5173/
     ➜  Network: use --host to expose
   ```

Mở trình duyệt web bất kỳ (Chrome, Edge, Firefox) và truy cập vào địa chỉ: [http://localhost:5173](http://localhost:5173).

---

## 5. Kịch bản Kiểm thử nhanh (Quick Test Cases)

Sau khi khởi chạy thành công cả 2 phần, bạn hãy thực hiện các bước sau để đảm bảo website hoạt động bình thường:

1. **Kiểm tra Giao diện Trang chủ**:
   - Truy cập [http://localhost:5173](http://localhost:5173). Trang web phải hiển thị đầy đủ tiêu đề, banner và các phần giới thiệu mà không bị lỗi giao diện.
2. **Kiểm tra kết nối API (Dự án & Bài viết)**:
   - Chuyển sang trang **Dự án (Projects)** hoặc **Bài viết (News)**.
   - Nếu bạn đã chạy `npm run seed` ở Bước 1, danh sách các dự án/bài viết mẫu sẽ được tải từ Backend (cổng 5000) và hiển thị lên giao diện Frontend.
3. **Kiểm tra tính năng đăng ký tham gia (Join Us)**:
   - Điều hướng tới trang **Join Us**.
   - Điền thông tin vào form đăng ký và nhấn gửi.
   - Xác nhận xem hệ thống hiển thị thông báo gửi thành công hay không (Dữ liệu sẽ được lưu vào MongoDB thông qua API của backend).
