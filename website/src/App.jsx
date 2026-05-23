import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './views/Home';
import News from './views/News';
import Projects from './views/Projects';
import Fanpage from './views/Fanpage';
import JoinUs from './views/JoinUs';
import Contact from './views/Contact';
import AdminLogin from './views/AdminLogin';
import AdminDashboard from './views/AdminDashboard';

/**
 * Component App - Cấu hình định tuyến và bộ khung giao diện của ứng dụng Digi Heart.
 * Sử dụng BrowserRouter để quản lý chuyển trang SPA.
 */
function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800 selection:bg-blue-100 selection:text-[#0054A6]">
        
        {/* Thanh điều hướng cố định phía trên */}
        <Navbar />

        {/* Nội dung thay đổi theo đường dẫn URL */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/news" element={<News />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/fanpage" element={<Fanpage />} />
            <Route path="/join-us" element={<JoinUs />} />
            <Route path="/contact" element={<Contact />} />
            
            {/* Phân hệ quản trị Admin */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </main>

        {/* Chân trang hiển thị thông tin bản quyền và liên hệ */}
        <Footer />
        
      </div>
    </Router>
  );
}

export default App;
