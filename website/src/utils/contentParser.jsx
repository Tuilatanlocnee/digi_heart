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
    } catch {
      // Bỏ qua lỗi và coi như text thường
    }
  }
  
  return [{ type: 'text', value: contentString }];
}

/**
 * Lọc sạch mã HTML, chống tấn công XSS và chỉ khôi phục các thẻ định dạng văn bản được phép.
 * @param {string} html Chuỗi đầu vào chứa text thô hoặc thẻ HTML định dạng.
 * @returns {string} Chuỗi HTML đã được lọc sạch an toàn.
 */
export function sanitizeHtml(html) {
  if (!html) return '';
  
  // Bước 1: Escape toàn bộ ký tự HTML đặc biệt để vô hiệu hóa script/iframe/v.v.
  let escaped = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
    
  // Bước 2: Khôi phục lại các tag định dạng an toàn
  escaped = escaped.replace(/&lt;b&gt;/gi, '<b>').replace(/&lt;\/b&gt;/gi, '</b>');
  escaped = escaped.replace(/&lt;strong&gt;/gi, '<strong>').replace(/&lt;\/strong&gt;/gi, '</strong>');
  escaped = escaped.replace(/&lt;i&gt;/gi, '<i>').replace(/&lt;\/i&gt;/gi, '</i>');
  escaped = escaped.replace(/&lt;em&gt;/gi, '<em>').replace(/&lt;\/em&gt;/gi, '</em>');
  escaped = escaped.replace(/&lt;u&gt;/gi, '<u>').replace(/&lt;\/u&gt;/gi, '</u>');
  
  // Khôi phục các tag xuống dòng do trình duyệt tự động sinh ra khi gõ Enter/Shift+Enter
  escaped = escaped.replace(/&lt;div&gt;/gi, '<div>').replace(/&lt;\/div&gt;/gi, '</div>');
  escaped = escaped.replace(/&lt;p&gt;/gi, '<p>').replace(/&lt;\/p&gt;/gi, '</p>');
  escaped = escaped.replace(/&lt;br\s*\/?&gt;/gi, '<br />');
  
  // Khôi phục thẻ font color do document.execCommand('foreColor') tạo ra
  escaped = escaped.replace(
    /&lt;font color=&quot;\s*(#[0-9a-fA-F]{3,8}|[a-zA-Z]+(?:-[a-zA-Z]+)*)&quot;&gt;/gi,
    (match, color) => `<font color="${color}">`
  );
  escaped = escaped.replace(/&lt;\/font&gt;/gi, '</font>');

  // Khôi phục thẻ span style="color: ..." (nếu có bài đăng cũ)
  escaped = escaped.replace(
    /&lt;span style=&quot;color:\s*(#[0-9a-fA-F]{3,8}|[a-zA-Z]+(?:-[a-zA-Z]+)*)&quot;&gt;/gi,
    (match, color) => `<span style="color: ${color}">`
  );
  escaped = escaped.replace(/&lt;\/span&gt;/gi, '</span>');
  
  // Chuyển ký tự xuống dòng \n thành thẻ <br /> để hiển thị đúng khi dùng dangerouslySetInnerHTML
  escaped = escaped.replace(/\n/g, '<br />');

  return escaped;
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
    
    // Render text có hỗ trợ định dạng Rich Text đã sanitize an toàn
    return (
      <p 
        key={index} 
        className="leading-relaxed text-gray-700 text-sm sm:text-base mb-5"
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(block.value) }}
      />
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
