import { Link } from 'react-router-dom';
import { FiMail, FiPhone, FiMapPin, FiActivity } from 'react-icons/fi';

/**
 * Component Footer - Chân trang hiển thị thông tin liên hệ (Light Mode).
 */
export default function Footer() {
  return (
    <footer className="bg-white text-gray-600 border-t border-gray-200 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Cột 1: Giới thiệu chung về Digi Heart */}
          <div className="space-y-4 flex flex-col items-center text-center md:items-start md:text-left">
            <div className="flex items-center space-x-2">
              <FiActivity className="w-6 h-6 text-[#0054A6]" />
              <span className="text-gray-800 font-extrabold tracking-wider">DIGI HEART</span>
            </div>
            <p className="text-sm leading-relaxed text-gray-500 max-w-md">
              Câu lạc bộ Chuyển đổi số Đoàn Thanh niên MobiFone Cần Thơ.
              Chúng tôi kết nối những trái tim trẻ nhiệt huyết, ứng dụng công nghệ để nâng cao hiệu quả công việc và phục vụ cộng đồng.
            </p>
          </div>

          {/* Cột 2: Các liên kết nhanh tiện ích */}
          <div className="flex flex-col items-center text-center md:items-start md:text-left">
            <h3 className="text-gray-800 font-bold text-sm mb-4 uppercase tracking-wider">Liên kết nhanh</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-[#0054A6] transition-colors duration-200">Trang chủ</Link>
              </li>
              <li>
                <Link to="/news" className="hover:text-[#0054A6] transition-colors duration-200">Tin tức & Sự kiện</Link>
              </li>
              <li>
                <Link to="/projects" className="hover:text-[#0054A6] transition-colors duration-200">Dự án chuyển đổi số</Link>
              </li>
              <li>
                <Link to="/fanpage" className="hover:text-[#0054A6] transition-colors duration-200">Tương tác Fanpage</Link>
              </li>
              <li>
                <Link to="/join-us" className="hover:text-[#0054A6] transition-colors duration-200">Đăng ký thành viên</Link>
              </li>
            </ul>
          </div>

          {/* Cột 3: Thông tin liên hệ tại MobiFone Cần Thơ */}
          <div className="space-y-3 flex flex-col items-center text-center md:items-start md:text-left">
            <h3 className="text-gray-800 font-bold text-sm mb-4 uppercase tracking-wider">Liên hệ</h3>
            <ul className="space-y-2.5 text-sm text-gray-500 flex flex-col items-center md:items-start">
              <li className="flex items-start space-x-3 text-left max-w-md">
                <FiMapPin className="mt-1 text-[#0054A6] flex-shrink-0" />
                <span>Số 06 Hòa Bình, Phường An Hội, Quận Ninh Kiều, Thành phố Cần Thơ</span>
              </li>
              <li className="flex items-center space-x-3 text-left w-full justify-center md:justify-start">
                <FiPhone className="text-[#0054A6] flex-shrink-0" />
                <span>1800 1090</span>
              </li>
              <li className="flex items-center space-x-3 text-left w-full justify-center md:justify-start">
                <FiMail className="text-[#0054A6] flex-shrink-0" />
                <span className="break-all">doanthanhnien.cantho@mobifone.vn</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bản quyền tác giả thực tập */}
        <div className="border-t border-gray-100 mt-8 pt-8 text-center text-xs text-gray-400 px-4">
          <p>
            &copy; {new Date().getFullYear()} Digi Heart - Trái Tim Số. Phát triển bởi Sinh viên thực tập ngành Kỹ thuật Phần mềm.
          </p>
          <p className="mt-1 text-gray-450">
            Đoàn cơ sở Công ty Dịch vụ MobiFone Khu vực 9 - Cần Thơ
          </p>
        </div>
      </div>
    </footer>
  );
}
