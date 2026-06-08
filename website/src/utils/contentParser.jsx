/**
 * Tiện ích xử lý nội dung bài viết định dạng Block (Xen kẽ văn bản và hình ảnh).
 * Tương thích ngược với các bài viết cũ (văn bản thuần).
 */

/**
 * Phân tích chuỗi content từ database thành mảng các blocks.
 * @param {string} contentString Chuỗi nội dung bài viết.
 * @returns {Array<{type: string, value: string}>} Mảng các khối nội dung.
 */
export function parseContent(contentString) {
  if (!contentString) {
    return [{ type: 'text', value: '' }];
  }
  
  const trimmed = contentString.trim();
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch (e) {
      // Bỏ qua lỗi và coi như text thường
    }
  }
  
  return [{ type: 'text', value: contentString }];
}

/**
 * Render danh sách blocks thành các thẻ React tương ứng.
 * @param {string} contentString Chuỗi nội dung bài viết.
 * @returns {JSX.Element[]} Các thành phần React hiển thị.
 */
export function renderContent(contentString) {
  const blocks = parseContent(contentString);
  
  return blocks.map((block, index) => {
    if (block.type === 'image') {
      return (
        <div key={index} className="my-6 max-w-full">
          <img
            src={block.value}
            alt="Hình ảnh bài đăng"
            className="w-full max-h-[550px] object-cover rounded-2xl shadow-sm border border-gray-100/60"
            loading="lazy"
          />
        </div>
      );
    }
    
    // Mặc định render text
    return (
      <p 
        key={index} 
        className="whitespace-pre-line leading-relaxed text-gray-700 text-sm sm:text-base mb-5"
      >
        {block.value}
      </p>
    );
  });
}

/**
 * Lấy ra văn bản thuần túy tóm tắt từ nội dung blocks (loại bỏ hình ảnh).
 * @param {string} contentString Chuỗi nội dung bài viết.
 * @param {number} maxLength Độ dài tối đa cần lấy.
 * @returns {string} Chuỗi tóm tắt văn bản.
 */
export function getTextPreview(contentString, maxLength = 150) {
  const blocks = parseContent(contentString);
  const textOnly = blocks
    .filter(b => b.type === 'text' && b.value)
    .map(b => b.value.trim())
    .join(' ');
    
  if (textOnly.length <= maxLength) {
    return textOnly;
  }
  return textOnly.slice(0, maxLength).trim() + '...';
}
