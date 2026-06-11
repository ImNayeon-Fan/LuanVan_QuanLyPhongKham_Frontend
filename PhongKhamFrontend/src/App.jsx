import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import ChangePassword from './pages/ChangePassword';
import Home from './pages/Home';
import KhamBenh from './pages/KhamBenh';
import TiepDon from './pages/TiepDon';
import DanhSachTiepNhan from './pages/DanhSachTiepNhan';
import ChiTietBenhNhan from './pages/ChiTietBenhNhan';
import HoSoBenhAn from './pages/HoSoBenhAn';
import PhanQuyenNhanSu from './pages/PhanQuyenNhanSu';
import DanhMucICD from './pages/DanhMucICD';
import DanhMucDichVu from './pages/DanhMucDichVu';
import KhoDanhMucThuoc from './pages/KhoDanhMucThuoc';
import KhoDanhMucVatTu from './pages/KhoDanhMucVatTu';
import KhoNhapKho from './pages/KhoNhapKho';
import ThanhToanHoaDon from './pages/ThanhToanHoaDon';
import LichPhongKham from './pages/LichPhongKham';
import DanhMucKhoa from './pages/DanhMucKhoa';
import DatLichPublic from './pages/DatLichPublic';
import { ToastProvider } from './utils/ToastContext';
import { ProtectedRoute } from './utils/ProtectedRoute';
import './index.css';

/**
 * Component App - Trái tim cấu hình của ứng dụng Frontend
 * Nhiệm vụ:
 * 1. Định nghĩa các đường dẫn (Routes) của ứng dụng.
 * 2. Bảo vệ các trang nội bộ bằng ProtectedRoute (chỉ cho phép truy cập khi đã đăng nhập).
 * 3. Cung cấp ToastProvider để hiển thị thông báo pop-up trên toàn bộ ứng dụng.
 */
function App() {
  return (
    <ToastProvider>
      <Router>
        <Routes>
          {/* Màn hình Đăng nhập (Mọi người đều có thể truy cập mà không cần đăng nhập trước) */}
          <Route path="/login" element={<Login />} />
          
          {/* Trang Đổi mật khẩu (Bắt buộc phải qua ProtectedRoute để bảo vệ) */}
          <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
          
          {/* Trang chủ quản trị (Yêu cầu đăng nhập) */}
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          
          {/* Phân hệ chuyên môn khám chữa bệnh & tiếp đón bệnh nhân */}
          <Route path="/kham-benh" element={<ProtectedRoute><KhamBenh /></ProtectedRoute>} />
          <Route path="/tiep-don" element={<ProtectedRoute><TiepDon /></ProtectedRoute>} />
          <Route path="/danh-sach-tiep-nhan" element={<ProtectedRoute><DanhSachTiepNhan /></ProtectedRoute>} />
          <Route path="/ho-so-chi-tiet/:maPhieu" element={<ProtectedRoute><ChiTietBenhNhan /></ProtectedRoute>} />
          <Route path="/ho-so-benh-an" element={<ProtectedRoute><HoSoBenhAn /></ProtectedRoute>} />
          
          {/* Quản trị hệ thống, danh mục chuyên môn và phân quyền nhân sự */}
          <Route path="/phan-quyen" element={<ProtectedRoute><PhanQuyenNhanSu /></ProtectedRoute>} />
          <Route path="/danhmuc/icd" element={<ProtectedRoute><DanhMucICD /></ProtectedRoute>} />
          <Route path="/danhmuc/dich-vu" element={<ProtectedRoute><DanhMucDichVu /></ProtectedRoute>} />
          <Route path="/danhmuc/khoa" element={<ProtectedRoute><DanhMucKhoa /></ProtectedRoute>} />
          <Route path="/thanh-toan" element={<ProtectedRoute><ThanhToanHoaDon /></ProtectedRoute>} />
          
          {/* Quản lý kho dược phẩm, vật tư y tế */}
          <Route path="/kho/danh-muc-thuoc" element={<ProtectedRoute><KhoDanhMucThuoc /></ProtectedRoute>} />
          <Route path="/kho/danh-muc-vat-tu" element={<ProtectedRoute><KhoDanhMucVatTu /></ProtectedRoute>} />
          <Route path="/kho/nhap-kho" element={<ProtectedRoute><KhoNhapKho /></ProtectedRoute>} />
          
          {/* Cổng đặt lịch khám công khai dành cho bệnh nhân tự đặt ngoài trang chủ (Không cần đăng nhập) */}
          <Route path="/dat-lich-kham" element={<DatLichPublic />} />
          
          {/* Lịch làm việc và đặt lịch hẹn khám của bác sĩ */}
          <Route path="/lich" element={<ProtectedRoute><LichPhongKham /></ProtectedRoute>} />
          
          {/* Tự động chuyển hướng về trang đăng nhập nếu người dùng gõ sai đường dẫn */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </ToastProvider>
  );
}

export default App;


