import { exec } from 'child_process';

const port = process.env.PORT || 5000;

const killPort = () => {
  const cmd = process.platform === 'win32'
    ? `netstat -ano | findstr :${port}`
    : `lsof -i tcp:${port} | grep LISTEN | awk '{print $2}'`;

  exec(cmd, (err, stdout) => {
    if (err || !stdout) {
      console.log(`[Port Cleaner] Cổng ${port} đã sạch, sẵn sàng khởi chạy.`);
      process.exit(0);
    }

    const lines = stdout.trim().split('\n');
    let pid;
    if (process.platform === 'win32') {
      // Tìm dòng chứa trạng thái LISTENING để lấy đúng PID của server đang lắng nghe
      const listeningLine = lines.find(line => line.includes('LISTENING')) || lines[0];
      const parts = listeningLine.trim().split(/\s+/);
      pid = parts[parts.length - 1];
    } else {
      pid = lines[0].trim();
    }

    // Tránh việc tự tắt chính tiến trình hiện tại của NodeJS
    if (pid && pid !== '0' && pid !== process.pid.toString()) {
      console.log(`[Port Cleaner] Phát hiện cổng ${port} đang bị chiếm dụng bởi tiến trình PID ${pid}. Đang giải phóng...`);
      const killCmd = process.platform === 'win32' ? `taskkill /F /PID ${pid}` : `kill -9 ${pid}`;
      exec(killCmd, (killErr) => {
        if (killErr) {
          console.error(`[Port Cleaner] Không thể giải phóng cổng: ${killErr.message}`);
        } else {
          console.log(`[Port Cleaner] Đã giải phóng cổng ${port} thành công.`);
        }
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  });
};

killPort();
