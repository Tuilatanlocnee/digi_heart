# Hướng Dẫn Triển Khai Website Digi Heart lên Render (Backend) và Vercel (Frontend)

Tài liệu này hướng dẫn chi tiết cách triển khai (deploy) hệ thống website của CLB Digi Heart lên môi trường production:
- **Backend (Node.js/Express)**: Triển khai lên **Render** (dịch vụ cloud hosting miễn phí/trả phí cho server).
- **Frontend (React/Vite)**: Triển khai lên **Vercel** (dịch vụ tối ưu cho Static Site và Single Page Application).

---

## 1. Tổng Quan Kiến Trúc Sau Khi Triển Khai

Sau khi triển khai thành công, hệ thống sẽ hoạt động theo mô hình tách biệt (Decoupled Architecture):
- **Frontend**: Chạy trên domain Vercel (ví dụ: `https://digi-heart.vercel.app`), giao tiếp trực tiếp với Client Browser.
- **Backend**: Chạy trên Render (ví dụ: `https://digi-heart-api.onrender.com`), tiếp nhận các yêu cầu API từ Frontend và giao tiếp với Cơ sở dữ liệu MongoDB (sử dụng MongoDB Atlas).
- **Database**: Sử dụng MongoDB Atlas (Cloud Database) thay thế cho MongoDB chạy trên Localhost.

---

## 2. Yêu Cầu Hệ Thống (Prerequisites)

Trước khi bắt đầu, hãy chắc chắn bạn đã chuẩn bị:
1. Một tài khoản [GitHub](https://github.com) đã push toàn bộ mã nguồn của dự án (bao gồm cả thư mục `server` và `website`).
2. Một tài khoản [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (gói Shared Free) để lưu trữ database trên cloud.
3. Tài khoản [Render](https://render.com) và tài khoản [Vercel](https://vercel.com) (cả hai đều đăng nhập nhanh thông qua GitHub).

---

## 3. Các Bước Triển Khai Chi Tiết

### Bước 1: Setup Cơ sở dữ liệu MongoDB Atlas (Cloud)
Vì Render là môi trường cloud, server backend của bạn không thể kết nối tới `mongodb://localhost:27017` nữa. Bạn cần một database online:
1. Đăng nhập vào **MongoDB Atlas**.
2. Tạo một **Cluster** mới (chọn gói Shared FREE và Server tại khu vực gần Việt Nam như Singapore - ap-southeast-1).
3. Tại phần **Database Access**, tạo một User (ví dụ: `digi_user` với mật khẩu an toàn).
4. Tại phần **Network Access**, chọn **Add IP Address** -> Chọn **Allow Access From Anywhere** (`0.0.0.0/0`) để cho phép Render kết nối vào database.
5. Vào Cluster vừa tạo -> Chọn **Connect** -> **Drivers** -> Copy chuỗi kết nối (Connection String).
   - *Chuỗi kết nối mẫu:* `mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/digi_heart?retryWrites=true&w=majority`
   - Thay thế `<username>` và `<password>` bằng thông tin User bạn vừa tạo ở bước 3.

---

### Bước 2: Triển Khai Backend Lên Render
1. Đăng nhập vào trang quản trị [Render Dashboard](https://dashboard.render.com/).
2. Nhấn nút **New +** ở góc phải -> Chọn **Web Service**.
3. Kết nối tài khoản GitHub và chọn repository dự án `digi_heart`.
4. Điền các cấu hình chi tiết cho Web Service như sau:
   - **Name**: `digi-heart-backend` (hoặc tên bất kỳ bạn thích).
   - **Region**: Chọn khu vực gần Việt Nam nhất (ví dụ: `Singapore` hoặc `Oregon`).
   - **Branch**: `main` (hoặc nhánh chứa code chính của bạn).
   - **Root Directory**: `server` *(Rất quan trọng! Vì backend nằm trong thư mục con `/server`)*.
   - **Runtime**: `Node`.
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Chọn gói **Free** (hoặc Starter tùy nhu cầu).
5. Cuộn xuống dưới, nhấn vào nút **Advanced** -> Chọn **Add Environment Variable** để nhập các biến môi trường sau:
   - `MONGODB_URI`: Dán chuỗi kết nối MongoDB Atlas đã copy từ Bước 1.
   - `JWT_SECRET`: Nhập một chuỗi ký tự bí mật, phức tạp dùng để mã hóa token đăng nhập Admin.
   - `PORT`: Thiết lập giá trị là `5000` (Render sẽ tự động cấu hình port bên ngoài nhưng backend của chúng ta sẽ map với cấu hình này).
6. Nhấn **Create Web Service**.
7. **Kết quả mong đợi**: Quá trình build sẽ diễn ra trong khoảng 2-3 phút. Khi hoàn thành thành công, màn hình sẽ hiển thị trạng thái `Live` màu xanh lá cây kèm đường link backend dạng: `https://digi-heart-backend.onrender.com`.
   - *Lưu ý*: Hãy truy cập trực tiếp vào link trên trình duyệt, bạn sẽ nhận được thông báo: `{"message": "Chào mừng bạn đến với API Server của CLB Digi Heart!"}`.

---

### Bước 3: Triển Khai Frontend Lên Vercel
Sau khi có link backend từ Render, chúng ta tiến hành deploy frontend.
1. Đăng nhập vào trang quản trị [Vercel Dashboard](https://vercel.com/dashboard).
2. Nhấn nút **Add New...** -> Chọn **Project**.
3. Vercel sẽ liệt kê các repository từ GitHub của bạn. Nhấn **Import** tại repository `digi_heart`.
4. Cấu hình các thông số triển khai dự án monorepo trên Vercel:
   - **Project Name**: `digi-heart-website`
   - **Framework Preset**: Chọn **Vite** (Vercel sẽ tự động nhận diện từ cấu hình project).
   - **Root Directory**: Nhấn nút *Edit* và chọn thư mục `website` *(Rất quan trọng! Vì mã nguồn frontend nằm trong thư mục con `/website`)*. Nhấn **Continue**.
   - **Build and Output Settings**:
     - *Build Command*: `npm run build`
     - *Output Directory*: `dist`
     - *Install Command*: `npm install`
   - **Environment Variables**: Mở phần này ra và nhập biến sau:
     - **Key**: `VITE_API_URL`
     - **Value**: Nhập đường dẫn API của backend trên Render đã lấy ở Bước 2 kèm hậu tố `/api` (Ví dụ: `https://digi-heart-backend.onrender.com/api`).
5. Nhấn nút **Deploy**.
6. **Kết quả mong đợi**: Vercel sẽ tự động cài đặt dependency, build project sang dạng tĩnh và lưu trữ. Quá trình này mất khoảng 1 phút. Sau đó màn hình sẽ hiện lên giao diện chúc mừng (Congratulations) kèm link website chính thức dạng: `https://digi-heart-website.vercel.app`.

---

## 4. Cấu Hình Biến Môi Trường Tham Khảo

### Cho Backend (Render Environment)
Không cần tạo file cấu hình trên Render, chỉ cần điền trực tiếp vào mục **Environment Variables** trên giao diện Render Dashboard các giá trị thực tế sau:
```env
MONGODB_URI=mongodb+srv://digi_user:your_secure_password@cluster0.xxxx.mongodb.net/digi_heart?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here
PORT=5000
```

### Cho Frontend (Vercel Environment)
Khai báo tại mục **Environment Variables** của Vercel Project:
```env
# Lưu ý: Bắt buộc phải có hậu tố /api ở cuối URL
VITE_API_URL=https://digi-heart-backend.onrender.com/api
```
*(Bạn có thể tham khảo file cấu hình mẫu tại [.env.example](file:///d:/digi_heart/website/.env.example) trong thư mục website)*.

---

## 5. Kịch Bản Kiểm Thử & Kiểm Tra Sau Triển Khai (Test Cases)

Để đảm bảo toàn bộ website hoạt động hoàn hảo và không bị lỗi kết nối, hãy thực hiện kiểm thử theo các kịch bản sau:

### Kịch bản 1: Kiểm tra kết nối API Frontend - Backend
- **Các bước thực hiện**:
  1. Truy cập vào đường dẫn trang web của bạn trên Vercel (ví dụ: `https://digi-heart-website.vercel.app`).
  2. Quan sát xem giao diện website có load được các danh sách bài viết trên Bảng tin, hoặc các tin tức sự kiện từ Database không.
- **Kết quả mong đợi**: Các bài viết mặc định (seed data) hiển thị bình thường. Không có thông báo lỗi kết nối mạng ("Network Error").

### Kịch bản 2: Kiểm tra chức năng Router SPA (F5 Refresh)
- **Các bước thực hiện**:
  1. Từ trang chủ website, nhấn vào menu điều hướng để chuyển qua trang **Đăng ký** (`/register` hoặc `/dashboard`).
  2. Nhấn nút F5 (Refresh) trên trình duyệt hoặc load lại trang đó.
- **Kết quả mong đợi**: Trang web phải tự động load lại đúng nội dung của trang con mà không hiển thị lỗi `404 Not Found` từ Vercel. *(Tính năng này đã được xử lý nhờ cấu hình file [vercel.json](file:///d:/digi_heart/website/vercel.json) ở thư mục website)*.

### Kịch bản 3: Đăng nhập Admin và Quản trị
- **Các bước thực hiện**:
  1. Truy cập vào trang đăng nhập Admin.
  2. Sử dụng tài khoản Admin thật trong Database MongoDB Atlas để đăng nhập.
  3. Thử tạo một tin tức sự kiện mới hoặc duyệt một ứng viên đăng ký.
- **Kết quả mong đợi**: Hệ thống xử lý thành công, dữ liệu được ghi nhận vào MongoDB Atlas và hiển thị ngay lập tức trên giao diện.

---
> [!NOTE]
> **Hiện tượng "Cold Start" trên Render gói Free:**
> Nếu bạn sử dụng gói Free của Render, server sẽ chuyển sang trạng thái ngủ (sleep) sau 15 phút không có lượt truy cập nào. Khi có một truy cập mới, Render sẽ khởi động lại container backend, việc này có thể mất từ 50 giây đến 2 phút. Trong thời gian này, website ở frontend có thể tạm thời phản hồi chậm hoặc hiển thị trạng thái loading. Đây là hạn chế chung của các dịch vụ hosting miễn phí.
