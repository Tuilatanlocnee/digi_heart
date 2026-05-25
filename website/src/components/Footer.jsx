import { Link } from 'react-router-dom';
import { FiMail, FiPhone, FiMapPin, FiActivity } from 'react-icons/fi';

/**
 * Component Footer - Chân trang hiển thị thông tin liên hệ (Light Mode).
 */
export default function Footer() {
  return (
    <footer className="bg-white text-gray-655 border-t border-gray-250 py-8 md:py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-12 gap-6 md:gap-8">
          
          {/* Cột 1: Giới thiệu chung về Digi Heart */}
          <div className="col-span-12 md:col-span-5 space-y-2.5 md:space-y-4 flex flex-col items-center text-center md:items-start md:text-left">
            <div className="flex items-center space-x-2">
              <FiActivity className="w-5 h-5 md:w-6 md:h-6 text-[#0054A6]" />
              <span className="text-gray-800 font-extrabold tracking-wider text-sm md:text-base">DIGI HEART</span>
            </div>
            <p className="text-xs md:text-sm leading-relaxed text-gray-500 max-w-md">
              Câu lạc bộ Chuyển đổi số Đoàn Thanh niên MobiFone Cần Thơ.
              Chúng tôi kết nối những trái tim trẻ nhiệt huyết, ứng dụng công nghệ để nâng cao hiệu quả công việc và phục vụ cộng đồng.
            </p>
          </div>

          {/* Cột 2: Các liên kết nhanh tiện ích */}
          <div className="col-span-6 md:col-span-3 flex flex-col items-start text-left pt-2 md:pt-0">
            <h3 className="text-gray-800 font-bold text-xs md:text-sm mb-2 md:mb-4 uppercase tracking-wider">Liên kết</h3>
            <ul className="space-y-1.5 md:space-y-2 text-xs md:text-sm">
              <li>
                <Link to="/" className="hover:text-[#0054A6] transition-colors duration-200">Trang chủ</Link>
              </li>
              <li>
                <Link to="/news" className="hover:text-[#0054A6] transition-colors duration-200">Tin tức & Sự kiện</Link>
              </li>
              <li>
                <Link to="/projects" className="hover:text-[#0054A6] transition-colors duration-200">Dự án số</Link>
              </li>
              <li>
                <Link to="/fanpage" className="hover:text-[#0054A6] transition-colors duration-200">Fanpage</Link>
              </li>
              <li>
                <Link to="/join-us" className="hover:text-[#0054A6] transition-colors duration-200">Gia nhập CLB</Link>
              </li>
            </ul>
          </div>

          {/* Cột 3: Thông tin liên hệ tại MobiFone Cần Thơ */}
          <div className="col-span-6 md:col-span-4 space-y-2 md:space-y-3 flex flex-col items-start text-left pt-2 md:pt-0">
            <h3 className="text-gray-800 font-bold text-xs md:text-sm mb-2 md:mb-4 uppercase tracking-wider">Liên hệ</h3>
            <ul className="space-y-1.5 md:space-y-2.5 text-xs md:text-sm text-gray-500 flex flex-col items-start w-full">
              <li className="flex items-start space-x-2 text-left max-w-md">
                <FiMapPin className="mt-0.5 text-[#0054A6] flex-shrink-0 w-3.5 h-3.5" />
                <span>Số 06 Hòa Bình, Ninh Kiều, Cần Thơ</span>
              </li>
              <li className="flex items-center space-x-2 text-left w-full justify-start">
                <FiPhone className="text-[#0054A6] flex-shrink-0 w-3.5 h-3.5" />
                <span>1800 1090</span>
              </li>
              <li className="flex items-center space-x-2 text-left w-full justify-start">
                <FiMail className="text-[#0054A6] flex-shrink-0 w-3.5 h-3.5" />
                <span className="break-all">doanthanhnien.cantho@mobifone.vn</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bản quyền tác giả thực tập */}
        <div className="border-t border-gray-100 mt-6 md:mt-8 pt-6 md:pt-8 text-center text-[10px] md:text-xs text-gray-400 px-4">
          <p>
            &copy; {new Date().getFullYear()} Digi Heart - Trái Tim Số. Phát triển bởi Sinh viên thực tập ngành Kỹ thuật Phần mềm.
          </p>
          <p className="mt-0.5 text-gray-450">
            Đoàn cơ sở Công ty Dịch vụ MobiFone Khu vực 9 - Cần Thơ
          </p>
        </div>
      </div>
    </footer>
  );
}
