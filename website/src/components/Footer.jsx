import { Link } from 'react-router-dom';
import { FiMail, FiPhone, FiMapPin, FiActivity } from 'react-icons/fi';

/**
 * Component Footer - Chân trang hiển thị thông tin liên hệ (Light Mode).
 * Thiết kế giao diện kép: Tối giản & cực kỳ gọn nhẹ trên mobile, đầy đủ thông tin trên desktop.
 */
export default function Footer() {
  return (
    <footer className="bg-white text-gray-655 border-t border-gray-250 py-4 md:py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* 💻 GIAO DIỆN DESKTOP (Màn hình máy tính & máy tính bảng lớn) */}
        <div className="hidden md:grid grid-cols-12 gap-8">

          {/* Cột 1: Giới thiệu chung */}
          <div className="col-span-5 space-y-2 flex flex-col items-start text-left">
            <div className="flex items-center space-x-2">
              <FiActivity className="w-5 h-5 text-[#0054A6]" />
              <span className="text-gray-800 font-extrabold tracking-wider text-sm">DIGI HEART</span>
            </div>
            <p className="text-xs leading-relaxed text-gray-500 max-w-sm">
              Câu lạc bộ Chuyển đổi số Đoàn Thanh niên MobiFone Cần Thơ.
              Kết nối sức trẻ, ứng dụng công nghệ vì sự phát triển cộng đồng.
            </p>
          </div>

          {/* Cột 2: Các liên kết nhanh */}
          <div className="col-span-3 flex flex-col items-start text-left">
            <h3 className="text-gray-800 font-bold text-xs mb-2 uppercase tracking-wider">Liên kết</h3>
            <ul className="space-y-1 text-xs">
              <li>
                <Link to="/" className="hover:text-[#0054A6] transition-colors duration-200">Trang chủ</Link>
              </li>
              <li>
                <Link to="/news" className="hover:text-[#0054A6] transition-colors duration-200">Tin tức</Link>
              </li>
              <li>
                <Link to="/projects" className="hover:text-[#0054A6] transition-colors duration-200">Dự án số</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#0054A6] transition-colors duration-200">Liên hệ</Link>
              </li>
            </ul>
          </div>

          {/* Cột 3: Thông tin liên hệ */}
          <div className="col-span-4 space-y-2 flex flex-col items-start text-left">
            <h3 className="text-gray-800 font-bold text-xs mb-2 uppercase tracking-wider">Liên hệ</h3>
            <ul className="space-y-1.5 text-xs text-gray-500 flex flex-col items-start w-full">
              <li className="flex items-start space-x-2 text-left max-w-xs">
                <FiMapPin className="mt-0.5 text-[#0054A6] flex-shrink-0 w-3.5 h-3.5" />
                <span>Số 06 Hòa Bình, Ninh Kiều, Cần Thơ</span>
              </li>
              <li className="flex items-center space-x-2 w-full">
                <FiPhone className="text-[#0054A6] flex-shrink-0 w-3.5 h-3.5" />
                <span>1800 1090</span>
              </li>
              <li className="flex items-center space-x-2 w-full">
                <FiMail className="text-[#0054A6] flex-shrink-0 w-3.5 h-3.5" />
                <span className="break-all text-xs">doanthanhnien.cantho@mobifone.vn</span>
              </li>
            </ul>
          </div>
        </div>

        {/* 📱 GIAO DIỆN MOBILE & TABLET NHỎ (Tối giản, siêu gọn, hạn chế tối đa chiều cao) */}
        <div className="md:hidden flex flex-col items-center space-y-4">

          {/* Logo ngắn gọn, không hiển thị mô tả */}
          <div className="flex items-center space-x-2">
            <FiActivity className="w-5 h-5 text-[#0054A6]" />
            <span className="text-gray-800 font-extrabold tracking-wider text-sm">DIGI HEART</span>
          </div>

          {/* Hàng liên kết nhanh nằm ngang */}
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-xs font-semibold text-gray-600">
            <Link to="/" className="hover:text-[#0054A6] transition-colors">Trang chủ</Link>
            <span className="text-gray-300">•</span>
            <Link to="/news" className="hover:text-[#0054A6] transition-colors">Tin tức</Link>
            <span className="text-gray-300">•</span>
            <Link to="/projects" className="hover:text-[#0054A6] transition-colors">Dự án số</Link>
            <span className="text-gray-300">•</span>
            <Link to="/contact" className="hover:text-[#0054A6] transition-colors">Liên hệ</Link>
          </div>

          {/* Thông tin liên hệ rút gọn dạng dòng ngang */}
          <div className="flex flex-col items-center space-y-1.5 text-[11px] text-gray-500 w-full px-2">
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
              <span className="flex items-center space-x-1">
                <FiPhone className="text-[#0054A6] w-3.5 h-3.5 shrink-0" />
                <span>1800 1090</span>
              </span>
              <span className="text-gray-300">•</span>
              <span className="flex items-center space-x-1 max-w-full">
                <FiMail className="text-[#0054A6] w-3.5 h-3.5 shrink-0" />
                <span className="break-all">doanthanhnien.cantho@mobifone.vn</span>
              </span>
            </div>
            <div className="flex items-center space-x-1 justify-center text-center">
              <FiMapPin className="text-[#0054A6] w-3.5 h-3.5 shrink-0" />
              <span>Số 06 Hòa Bình, Ninh Kiều, Cần Thơ</span>
            </div>
          </div>
        </div>

        {/* 🎯 Bản quyền tác giả (Chung cho cả hai) */}
        <div className="border-t border-gray-100 mt-4 pt-4 text-center text-[9px] md:text-xs text-gray-400 px-4">
          <p>
            &copy; {new Date().getFullYear()} Digi Heart - Trái Tim Số.
          </p>
          <p className="mt-0.5 text-gray-450">
            Đoàn cơ sở Công ty Dịch vụ MobiFone Khu vực 9 - Cần Thơ
          </p>
        </div>
      </div>
    </footer>
  );
}
