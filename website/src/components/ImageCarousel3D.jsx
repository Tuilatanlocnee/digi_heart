import { useState, useEffect, useRef } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

/**
 * Danh sách hình ảnh banner tĩnh nằm trong thư mục public/photos/
 * Kèm tiêu đề và mô tả ngắn cho từng hoạt động.
 */
const CAROUSEL_IMAGES = [
  {
    id: 1,
    url: '/photos/photo1.jpg',
    title: 'Đoàn Thanh Niên Xung Kích',
    description: 'Tiên phong trong mọi hoạt động xã hội và công nghệ của MobiFone Cần Thơ.',
  },
  {
    id: 2,
    url: '/photos/photo2.jpg',
    title: 'Chuyển Đổi Số Doanh Nghiệp',
    description: 'Ứng dụng công nghệ nâng cao hiệu quả sản xuất kinh doanh.',
  },
  {
    id: 3,
    url: '/photos/photo3.jpg',
    title: 'Tập Huấn Năng Lực Số',
    description: 'Tổ chức các lớp chia sẻ kỹ năng công nghệ cho cán bộ đoàn viên.',
  },
  {
    id: 4,
    url: '/photos/photo4.jpg',
    title: 'Hỗ Trợ Người Dân Xác Thực Sim',
    description: 'Đồng hành cùng người dân xác thực sim chính chủ theo quy định mới.',
  },
  {
    id: 5,
    url: '/photos/photo5.jpg',
    title: 'Giải Pháp Công Nghệ Mới',
    description: 'Sáng tạo và làm chủ công nghệ phục vụ cộng đồng.',
  },
];

/**
 * Component ImageCarousel3D - Banner ảnh xoay vòng dạng 3D xếp chồng (Stacked Card 3D).
 * Sử dụng CSS 3D Perspective và React state để điều phối mượt mà.
 */
export default function ImageCarousel3D() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isHovered, setIsHovered] = useState(false);
  const autoplayTimer = useRef(null);

  // Cập nhật trạng thái mobile/desktop khi thay đổi kích thước màn hình
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setIsMobile(window.innerWidth < 768);
    };

    // Gọi ngay lần đầu tiên để khởi tạo đúng
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Thiết lập autoplay chuyển slide tự động sau mỗi 4.5 giây
  useEffect(() => {
    // Nếu người dùng đang rê chuột vào carousel (isHovered = true) thì tạm thời dừng autoplay
    if (isHovered) {
      if (autoplayTimer.current) clearInterval(autoplayTimer.current);
      return;
    }

    autoplayTimer.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
    }, 4500);

    return () => {
      if (autoplayTimer.current) clearInterval(autoplayTimer.current);
    };
  }, [isHovered]);

  // Điều hướng chuyển tiếp slide
  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + CAROUSEL_IMAGES.length) % CAROUSEL_IMAGES.length);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
  };

  // Tính toán inline style 3D tương đối cho từng card ảnh
  const getCardStyle = (index) => {
    const total = CAROUSEL_IMAGES.length;
    // Tính khoảng cách ngắn nhất trên vòng tròn (offset từ -2 đến 2)
    let offset = (index - activeIndex) % total;
    if (offset > 2) offset -= total;
    if (offset < -2) offset += total;

    // Khoảng cách dịch chuyển ngang (translateX) được tính toán tối ưu dựa trên kích thước card mới
    const stepX = isMobile ? Math.min(105, windowWidth * 0.25) : 280; // Dịch chuyển card phụ sang 2 bên xa hơn
    const farStepX = isMobile ? 180 : 450; // Dịch chuyển các card ẩn đi xa hơn hẳn

    let translateX;
    let scale;
    let rotateY;
    let zIndex;
    let opacity;
    let filter;
    let visibility;
    let pointerEvents;

    if (offset === 0) {
      // Card đang hiển thị chính giữa (Active)
      translateX = 0;
      scale = 1;
      rotateY = 0;
      zIndex = 10;
      opacity = 1;
      filter = 'none';
      visibility = 'visible';
      pointerEvents = 'auto';
    } else if (offset === 1) {
      // Card kế tiếp bên phải
      translateX = stepX;
      scale = isMobile ? 0.7 : 0.75;
      rotateY = -10; // Góc xoay rất nhẹ để giữ độ phẳng tự nhiên dễ nhìn
      zIndex = 5;
      opacity = 0.55;
      filter = 'brightness(0.65) blur(1.5px)'; // Làm mờ nhẹ nền
      visibility = 'visible';
      pointerEvents = 'auto';
    } else if (offset === -1) {
      // Card liền trước bên trái
      translateX = -stepX;
      scale = isMobile ? 0.7 : 0.75;
      rotateY = 10;
      zIndex = 5;
      opacity = 0.55;
      filter = 'brightness(0.65) blur(1.5px)';
      visibility = 'visible';
      pointerEvents = 'auto';
    } else {
      // Ẩn hoàn toàn 100% tất cả các slide còn lại (offset = 2, -2) để hai bên thoáng sạch
      translateX = offset > 0 ? farStepX : -farStepX;
      scale = 0.5;
      rotateY = offset > 0 ? -15 : 15;
      zIndex = 1;
      opacity = 0;
      filter = 'brightness(0.3) blur(4px)';
      visibility = 'hidden'; // Ẩn hoàn toàn khỏi giao diện để tránh vết mờ
      pointerEvents = 'none';
    }

    return {
      transform: `translateX(${translateX}px) scale(${scale}) rotateY(${rotateY}deg)`,
      zIndex,
      opacity,
      filter,
      visibility,
      pointerEvents,
    };
  };

  return (
    <section
      className="py-12 md:py-16 bg-gradient-to-b from-[#f8fafc] to-[#f1f5f9] border-b border-gray-200 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="max-w-7xl mx-auto px-4 text-center">

        {/* Tiêu đề mục banner */}
        <div className="mb-8 md:mb-12">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-800 tracking-tight">
            Hoạt Động Nổi Bật <span className="text-[#0054A6]">Digi Heart</span>
          </h2>
          <div className="h-1 w-16 bg-[#E30613] mx-auto mt-3 rounded-full"></div>
        </div>

        {/* Khung chứa các slide 3D xếp chồng */}
        <div
          className="relative flex items-center justify-center min-h-[200px] sm:min-h-[280px] md:min-h-[380px] max-w-5xl mx-auto"
          style={{ perspective: '1200px', transformStyle: 'preserve-3d' }}
        >
          {CAROUSEL_IMAGES.map((img, index) => {
            const isActive = index === activeIndex;
            return (
              <div
                key={img.id}
                onClick={() => {
                  if (!isActive) setActiveIndex(index);
                }}
                className={`absolute w-[200px] h-[125px] sm:w-[340px] sm:h-[210px] md:w-[500px] md:h-[300px] rounded-2xl md:rounded-3xl overflow-hidden shadow-xl md:shadow-2xl transition-all duration-700 ease-out cursor-pointer group select-none`}
                style={getCardStyle(index)}
              >
                {/* Hình ảnh */}
                <img
                  src={img.url}
                  alt={img.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />

                {/* Hiệu ứng lớp phủ gradient bóng mờ */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-90"></div>

                {/* Tiêu đề ngắn gọn hiển thị ngay trên card */}
                <div
                  className={`absolute bottom-0 left-0 right-0 p-3 sm:p-5 md:p-6 text-left text-white transition-all duration-500 ease-in-out ${isActive
                      ? 'opacity-100 translate-y-0 pointer-events-auto scale-100'
                      : 'opacity-0 translate-y-4 pointer-events-none scale-95'
                    }`}
                >
                  <h3 className="text-xs sm:text-sm md:text-lg font-extrabold tracking-wide mb-0.5 sm:mb-1 drop-shadow-md">
                    {img.title}
                  </h3>
                  <p className="text-[9px] sm:text-[11px] md:text-xs text-gray-200/90 font-medium line-clamp-1 drop-shadow-sm">
                    {img.description}
                  </p>
                </div>

                {/* Viền sáng bao quanh card khi active và hover */}
                {isActive && (
                  <div className="absolute inset-0 border-[3px] border-[#0054A6]/80 rounded-2xl md:rounded-3xl pointer-events-none transition-all duration-300 group-hover:border-[#E30613]/90"></div>
                )}
              </div>
            );
          })}

          {/* Nút điều hướng Trái (Chỉ hiện trên desktop hoặc tự do) */}
          <button
            onClick={handlePrev}
            className="absolute left-2 sm:left-4 z-20 p-2 sm:p-3 rounded-full bg-white/80 hover:bg-white text-gray-800 border border-gray-200 shadow-lg hover:text-[#0054A6] hover:scale-110 active:scale-95 transition-all duration-200 focus:outline-none"
            aria-label="Slide trước"
          >
            <FiChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Nút điều hướng Phải */}
          <button
            onClick={handleNext}
            className="absolute right-2 sm:right-4 z-20 p-2 sm:p-3 rounded-full bg-white/80 hover:bg-white text-gray-800 border border-gray-200 shadow-lg hover:text-[#0054A6] hover:scale-110 active:scale-95 transition-all duration-200 focus:outline-none"
            aria-label="Slide sau"
          >
            <FiChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Các chấm chỉ báo (Dots indicators) phía dưới */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-6 md:mt-8">
          {CAROUSEL_IMAGES.map((_, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`h-2 rounded-full transition-all duration-300 focus:outline-none ${isActive
                    ? 'w-6 sm:w-8 bg-[#0054A6]'
                    : 'w-2 bg-gray-300 hover:bg-gray-400'
                  }`}
                aria-label={`Đi tới slide ${index + 1}`}
              />
            );
          })}
        </div>

      </div>
    </section>
  );
}
