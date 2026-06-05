# Hướng dẫn Triển khai (Deploy) Dự án Digi Heart lên VPS Linux (Ubuntu)

Tài liệu này hướng dẫn chi tiết cách triển khai toàn bộ ứng dụng Digi Heart (bao gồm Backend Node.js/Express, Frontend React/Vite và Cơ sở dữ liệu MongoDB) lên một máy chủ ảo cá nhân (VPS) chạy hệ điều hành Ubuntu Server (khuyên dùng Ubuntu 20.04 LTS hoặc 22.04 LTS trở lên).

---

## 1. Mô hình Kiến trúc Triển khai (Deployment Architecture)

Để đảm bảo hiệu năng và tính bảo mật, chúng ta sẽ cấu hình hệ thống trên VPS theo mô hình sau:

```mermaid
graph TD
    Client[Trình duyệt Người dùng] -->|HTTPS: Cổng 443| Nginx{Nginx Web Server}
    Nginx -->|Phục vụ Tĩnh /| Static[Thư mục Frontend dist]
    Nginx -->|Reverse Proxy /api| Express[Backend API Cổng 5000]
    Express -->|Kết nối| MongoDB[(MongoDB Server)]
    
    subgraph VPS (Ubuntu Server)
        Nginx
        Static
        Express
        MongoDB
    end
```

*   **Nginx**: Đóng vai trò là Web Server phục vụ các file tĩnh (Frontend React sau khi build) và làm **Reverse Proxy** (Proxy ngược) chuyển tiếp các request API (ví dụ: `/api/...`) tới Node.js Backend chạy ở cổng 5000.
*   **PM2**: Bộ quản lý tiến trình (Process Manager) giúp chạy ứng dụng Node.js Backend ngầm (background) và tự động khởi động lại nếu server bị crash hoặc reboot.
*   **MongoDB**: Cơ sở dữ liệu lưu trữ chạy cục bộ trên VPS hoặc sử dụng MongoDB Atlas bên ngoài.

---

## 2. Chuẩn bị (Prerequisites)

*   Một VPS chạy **Ubuntu 20.04/22.04 LTS** sạch.
*   Địa chỉ IP công cộng (Public IP) của VPS.
*   Một tên miền (Domain Name) đã trỏ bản ghi `A` về IP của VPS (ví dụ: `digiheart.club` và `www.digiheart.club`).
*   Tài khoản GitHub chứa mã nguồn dự án của bạn.

---

## 3. Hướng dẫn Triển khai Từng Bước

### Bước 1: Kết nối SSH vào VPS và cập nhật hệ thống
Mở Terminal của bạn (Git Bash, PowerShell hoặc Terminal trên macOS/Linux) và kết nối với VPS:
```bash
ssh root@YOUR_VPS_IP
```
Cập nhật danh sách gói và nâng cấp các gói hệ thống hiện tại:
```bash
sudo apt update && sudo apt upgrade -y
```

### Bước 2: Cài đặt các công cụ cơ bản (Node.js, Git, Nginx, MongoDB)

#### 1. Cài đặt Node.js (Phiên bản v20.x LTS)
Sử dụng NodeSource để cài đặt phiên bản Node.js ổn định:
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```
Kiểm tra lại phiên bản sau khi cài đặt:
```bash
node -v
npm -v
```

#### 2. Cài đặt Git và Nginx
```bash
sudo apt install git nginx -y
```

#### 3. Cài đặt MongoDB (Community Edition)
Nhập khóa PGP công khai cho MongoDB:
```bash
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
   sudo gpg --o /usr/share/keyrings/mongodb-server-7.0.gpg \
   --dearmor --yes
```
Tạo file danh sách cho MongoDB:
```bash
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
```
Cập nhật apt và cài đặt MongoDB:
```bash
sudo apt update
sudo apt install -y mongodb-org
```
Khởi động và kích hoạt tự khởi động MongoDB cùng hệ thống:
```bash
sudo systemctl start mongod
sudo systemctl enable mongod
```
*Kết quả mong đợi*: Lệnh `sudo systemctl status mongod` hiển thị trạng thái `active (running)`.

---

### Bước 3: Đưa mã nguồn lên VPS

Khuyến nghị tạo một thư mục ứng dụng tại `/var/www/` để dễ quản lý:
```bash
sudo mkdir -p /var/www/digi_heart
sudo chown -R $USER:$USER /var/www/digi_heart
cd /var/www/digi_heart
```

Clone dự án từ GitHub của bạn (thay URL bằng link repo thật của bạn):
```bash
git clone https://github.com/YOUR_USERNAME/digi_heart.git .
```

---

### Bước 4: Thiết lập và Chạy Backend (Server)

1.  **Di chuyển vào thư mục server và cài đặt dependencies**:
    ```bash
    cd /var/www/digi_heart/server
    npm install --production
    ```
    *(Chỉ cài các thư viện production để tối ưu bộ nhớ VPS).*

2.  **Cấu hình biến môi trường**:
    Tạo file `.env` cho môi trường production từ file mẫu:
    ```bash
    cp .env.example .env
    nano .env
    ```
    *Cấu hình nội dung file `.env` như sau (chỉnh sửa các giá trị bảo mật)*:
    ```env
    PORT=5000
    MONGODB_URI=mongodb://127.0.0.1:27017/digi_heart
    JWT_SECRET=THAY_THE_BANG_MOT_CHUOI_RANDOM_BAO_MAT_HON
    # Nếu ứng dụng của bạn gửi email hoặc dùng Cloudinary, hãy thêm các cấu hình tương ứng ở đây
    ```
    Nhấn `Ctrl + O`, rồi `Enter` để lưu, và `Ctrl + X` để thoát trình soạn thảo nano.

3.  **Khởi chạy dữ liệu mẫu (Chỉ chạy 1 lần duy nhất để khởi tạo Database)**:
    ```bash
    npm run seed
    ```

4.  **Cài đặt và chạy Backend bằng PM2**:
    Cài đặt PM2 toàn cục:
    ```bash
    sudo npm install pm2 -g
    ```
    Khởi chạy server backend với PM2 và đặt tên tiến trình là `digi-heart-api`:
    ```bash
    pm2 start index.js --name "digi-heart-api"
    ```
    *Lưu ý*: Nếu file chạy chính của backend của bạn không phải là `index.js` (ví dụ: `server.js`), hãy thay thế tên file cho đúng.
    
    Cấu hình PM2 tự động khởi chạy lại ứng dụng khi VPS khởi động lại:
    ```bash
    pm2 startup
    ```
    Hệ thống sẽ hiển thị một lệnh chứa mã token (bắt đầu bằng `sudo env PATH=...`). Hãy copy lệnh đó, paste vào Terminal và chạy.
    Sau đó, lưu trạng thái hiện tại của PM2:
    ```bash
    pm2 save
    ```

---

### Bước 5: Thiết lập và Build Frontend (Website)

1.  **Di chuyển đến thư mục Frontend**:
    ```bash
    cd /var/www/digi_heart/website
    ```

2.  **Cấu hình API Endpoint**:
    Đảm bảo các request API từ React được gọi đúng địa chỉ IP/domain của VPS. Thường trong code React, bạn sẽ dùng đường dẫn tương đối `/api` hoặc biến môi trường `VITE_API_URL`.
    Nếu sử dụng biến môi trường, hãy tạo file `.env.production`:
    ```bash
    nano .env.production
    ```
    Thêm dòng sau:
    ```env
    VITE_API_URL=https://yourdomain.com/api
    ```

3.  **Cài đặt thư viện và Build**:
    ```bash
    npm install
    npm run build
    ```
    *Kết quả mong đợi*: Lệnh build thành công tạo ra thư mục `/var/www/digi_heart/website/dist` chứa toàn bộ code tĩnh (HTML, JS, CSS, hình ảnh).

---

### Bước 6: Cấu hình Nginx làm Web Server & Reverse Proxy

1.  **Tạo file cấu hình Nginx mới cho dự án**:
    ```bash
    sudo nano /etc/nginx/sites-available/digi_heart
    ```

2.  **Dán cấu hình sau vào file** (thay thế `yourdomain.com` bằng tên miền thật hoặc IP của bạn):
    ```nginx
    server {
        listen 80;
        server_name yourdomain.com www.yourdomain.com;

        # Thư mục chứa Frontend tĩnh sau khi build
        root /var/www/digi_heart/website/dist;
        index index.html;

        # Xử lý React Routing (để khi reload trang không bị lỗi 404)
        location / {
            try_files $uri $uri/ /index.html;
        }

        # Reverse Proxy cho các request API gửi tới Backend Node.js
        location /api {
            proxy_pass http://127.0.0.1:5000; # Cổng chạy của Backend Express
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
        
        # Cấu hình cache cho static assets để tăng tốc tải trang
        location ~* \.(?:ico|css|js|gif|jpe?g|png|svg|woff2?|eot|ttf|otf)$ {
            expires 6M;
            access_log off;
            add_header Cache-Control "public";
        }
    }
    ```

3.  **Kích hoạt cấu hình mới và kiểm tra**:
    Tạo liên kết symlink để kích hoạt cấu hình:
    ```bash
    sudo ln -s /etc/nginx/sites-available/digi_heart /etc/nginx/sites-enabled/
    ```
    Xóa cấu hình mặc định (default) của Nginx để tránh xung đột:
    ```bash
    sudo rm /etc/nginx/sites-enabled/default
    ```
    Kiểm tra lỗi cú pháp cấu hình Nginx:
    ```bash
    sudo nginx -t
    ```
    *Kết quả mong đợi*: `nginx: configuration file ... test is successful`.
    
    Khởi động lại Nginx để áp dụng cấu hình mới:
    ```bash
    sudo systemctl restart nginx
    ```

---

### Bước 7: Cấu hình SSL miễn phí (HTTPS) với Let's Encrypt

Bắt buộc phải sử dụng HTTPS để bảo mật dữ liệu truyền tải (đặc biệt là mật khẩu đăng nhập Admin).

1.  **Cài đặt Certbot và plugin Nginx**:
    ```bash
    sudo apt install certbot python3-certbot-nginx -y
    ```

2.  **Chạy Certbot để tự động lấy và cài đặt chứng chỉ SSL**:
    ```bash
    sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
    ```
    *   Nhập email của bạn khi được yêu cầu.
    *   Đồng ý với các điều khoản dịch vụ (nhấn `A`).
    *   Certbot sẽ tự kiểm tra cấu hình Nginx, tạo chứng chỉ SSL, và tự cập nhật file cấu hình Nginx sang HTTPS (cổng 443) cũng như tự động chuyển hướng (redirect) từ HTTP sang HTTPS.

3.  **Kiểm tra tính năng tự động gia hạn chứng chỉ (Auto-renew)**:
    Certbot tự động thêm một cronjob để gia hạn trước khi chứng chỉ hết hạn (90 ngày). Thử nghiệm chạy lệnh giả lập gia hạn:
    ```bash
    sudo certbot renew --dry-run
    ```
    *Kết quả mong đợi*: Quá trình chạy thử hoàn thành thành công mà không có lỗi.

---

## 4. Quản lý Ứng dụng sau khi Deploy

Dưới đây là một số câu lệnh hữu ích khi vận hành hệ thống trên VPS:

*   **Xem danh sách tiến trình Node.js**:
    ```bash
    pm2 status
    ```
*   **Xem log thời gian thực của Backend (rất quan trọng để debug lỗi)**:
    ```bash
    pm2 logs digi-heart-api
    ```
*   **Khởi động lại Backend sau khi cập nhật mã nguồn**:
    ```bash
    pm2 restart digi-heart-api
    ```
*   **Kiểm tra log lỗi của Nginx**:
    ```bash
    sudo tail -f /var/log/nginx/error.log
    ```

---

## 5. Quy trình Cập nhật Phiên bản Mới (Update Code)

Mỗi khi bạn có sự thay đổi mã nguồn ở máy local và đã đẩy lên GitHub, hãy làm theo các bước sau để cập nhật trên VPS:

1.  SSH vào VPS và di chuyển tới thư mục dự án:
    ```bash
    cd /var/www/digi_heart
    ```
2.  Kéo code mới nhất về:
    ```bash
    git pull origin main
    ```
3.  Cập nhật Backend (nếu có thư viện mới):
    ```bash
    cd server
    npm install --production
    pm2 restart digi-heart-api
    ```
4.  Cập nhật Frontend:
    ```bash
    cd ../website
    npm install
    npm run build
    ```
    *(Nginx sẽ tự động nhận diện thư mục `dist` mới mà không cần restart lại dịch vụ Nginx).*
