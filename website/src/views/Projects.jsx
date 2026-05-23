import { FiCheckCircle, FiActivity, FiLayers, FiTrendingUp } from 'react-icons/fi';

/**
 * View Projects - Trang trưng bày các Dự án & Sáng kiến chuyển đổi số của CLB.
 */
export default function Projects() {
  // Danh sách các dự án thực tế CLB đã phát triển hoặc triển khai rộng rãi
  const projectList = [
    {
      id: 1,
      title: 'Hệ thống Quản lý và Số hóa Hồ sơ Đoàn viên',
      status: 'Đã hoàn thành',
      description: 'Phần mềm Web giúp quản lý thông tin, phân loại đoàn viên, theo dõi đóng đoàn phí trực tuyến thay thế cho việc nhập liệu sổ sách truyền thống.',
      techStack: ['React', 'Node.js', 'MongoDB', 'Cloudinary'],
      results: [
        'Giảm 80% thời gian tìm kiếm hồ sơ đoàn viên.',
        'Hỗ trợ xuất báo cáo định kỳ tự động chỉ với 1 click.',
        'Áp dụng thành công cho hơn 10 chi đoàn trực thuộc.',
      ],
    },
    {
      id: 2,
      title: 'Ứng dụng Hỗ trợ Khách hàng - MobiFone Cần Thơ Assistant',
      status: 'Đang hoạt động',
      description: 'Hệ thống chatbot thông minh tích hợp trên website và fanpage để hỗ trợ giải đáp nhanh các thắc mắc về gói cước, sim số, dịch vụ 4G/5G.',
      techStack: ['Python', 'Rasa AI', 'Messenger API', 'Docker'],
      results: [
        'Hơn 5,000 lượt tương tác tự động mỗi tháng.',
        'Tỷ lệ phản hồi đúng ý khách hàng đạt trên 85%.',
        'Tiết kiệm sức lao động cho tổng đài viên trực đêm.',
      ],
    },
    {
      id: 3,
      title: 'Chiến dịch "Chợ số - Thanh toán không dùng tiền mặt"',
      status: 'Đã hoàn thành',
      description: 'Số hóa phương thức thanh toán tại các ki-ốt chợ truyền thống ở Cần Thơ, thiết lập điểm quét mã QR MobiFone Money.',
      techStack: ['MobiFone Money SDK', 'QR Generator API', 'Mobile App'],
      results: [
        'Hơn 120 tiểu thương tại chợ Ninh Kiều đã chấp nhận thanh toán số.',
        'Đoàn viên trực tiếp hướng dẫn cài đặt và trao tặng bảng hiệu QR miễn phí.',
      ],
    },
    {
      id: 4,
      title: 'Trang thông tin & Cổng đóng góp sáng kiến ý tưởng số',
      status: 'Đang triển khai',
      description: 'Chính là dự án Website Digi Heart hiện tại, tích hợp các tính năng fanpage mini và tiếp nhận các sáng kiến đột phá từ mọi đoàn viên.',
      techStack: ['React (Vite)', 'Tailwind CSS', 'React Router', 'Local Storage'],
      results: [
        'Nơi tập trung cập nhật thông tin hoạt động trực tuyến.',
        'Hộp thư tiếp nhận sáng kiến hoạt động 24/7.',
      ],
    },
  ];

  return (
    <div className="bg-gray-50 text-gray-800 min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Tiêu đề chính */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-black mb-4 text-gray-800">
            Dự Án & <span className="text-[#0054A6]">Sáng Kiến Số</span>
          </h1>
          <p className="text-gray-500 font-medium">
            Tổng hợp các giải pháp công nghệ, phần mềm tiện ích và các chiến dịch số hóa cộng đồng do lực lượng thanh niên MobiFone Cần Thơ làm nòng cốt.
          </p>
        </div>

        {/* Danh sách thẻ dự án */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {projectList.map((project) => (
            <div
              key={project.id}
              className="bg-white border border-gray-200/80 rounded-2xl sm:rounded-3xl p-5 sm:p-8 hover:border-[#0054A6]/30 hover:shadow-xl transition-all duration-300 shadow-sm flex flex-col relative group overflow-hidden"
            >
              
              {/* Trang trí hiệu ứng ánh sáng mờ khi hover */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#0054A6]/5 rounded-full blur-2xl group-hover:bg-[#0054A6]/10 transition-all pointer-events-none"></div>
              
              {/* Trạng thái dự án */}
              <div className="flex items-center justify-between mb-6">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  project.status === 'Đã hoàn thành' || project.status === 'Đang hoạt động'
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-250'
                    : 'bg-amber-50 text-amber-600 border border-amber-250'
                }`}>
                  {project.status}
                </span>
                <FiActivity className="w-5 h-5 text-gray-400" />
              </div>

              {/* Tên và Mô tả */}
              <h3 className="text-xl md:text-2xl font-bold mb-4 text-gray-800 group-hover:text-[#0054A6] transition-colors">
                {project.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                {project.description}
              </p>

              {/* Công nghệ sử dụng */}
              <div className="mb-6">
                <span className="flex items-center text-xs font-semibold text-gray-400 mb-2.5 uppercase tracking-wider">
                  <FiLayers className="mr-1.5" /> Công nghệ / Giải pháp:
                </span>
                <div className="flex flex-wrap gap-2">
                  {project.techStack.map((tech, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-blue-50/50 border border-blue-100 rounded-lg text-xs text-[#0054A6] font-semibold"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Kết quả nổi bật */}
              <div className="mt-auto border-t border-gray-100 pt-6">
                <span className="flex items-center text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">
                  <FiTrendingUp className="mr-1.5" /> Kết quả thực tế đạt được:
                </span>
                <ul className="space-y-2.5">
                  {project.results.map((result, idx) => (
                    <li key={idx} className="flex items-start text-sm text-gray-600">
                      <FiCheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 mr-2.5 flex-shrink-0" />
                      <span>{result}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
