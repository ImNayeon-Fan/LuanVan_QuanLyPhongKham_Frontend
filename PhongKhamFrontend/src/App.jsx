import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
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
import KhoNhaCungCap from './pages/KhoNhaCungCap';
import ThanhToanHoaDon from './pages/ThanhToanHoaDon';
import LichPhongKham from './pages/LichPhongKham';
import DanhMucKhoa from './pages/DanhMucKhoa';
import DatLichPublic from './pages/DatLichPublic';
import LandingPage from './pages/LandingPage';
import CustomerPortal from './pages/CustomerPortal';
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
          
          {/* Trang chủ điều hướng Landing Page */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Trang cổng thông tin khách hàng */}
          <Route path="/khach-hang" element={<CustomerPortal />} />
          
          {/* Trang chủ quản trị nhân sự (Yêu cầu đăng nhập) */}
          <Route path="/staff" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          
          {/* Phân hệ chuyên môn khám chữa bệnh & tiếp đón bệnh nhân */}
          <Route path="/kham-benh" element={<ProtectedRoute allowedRoles={['BacSi']}><KhamBenh /></ProtectedRoute>} />
          <Route path="/tiep-don" element={<ProtectedRoute allowedRoles={['LeTan']}><TiepDon /></ProtectedRoute>} />
          <Route path="/danh-sach-tiep-nhan" element={<ProtectedRoute allowedRoles={['Admin', 'BacSi', 'LeTan']}><DanhSachTiepNhan /></ProtectedRoute>} />
          <Route path="/ho-so-chi-tiet/:maPhieu" element={<ProtectedRoute allowedRoles={['Admin', 'BacSi', 'LeTan']}><ChiTietBenhNhan /></ProtectedRoute>} />
          <Route path="/ho-so-benh-an" element={<ProtectedRoute allowedRoles={['Admin', 'BacSi', 'LeTan']}><HoSoBenhAn /></ProtectedRoute>} />
          
          {/* Quản trị hệ thống, danh mục chuyên môn và phân quyền nhân sự */}
          <Route path="/phan-quyen" element={<ProtectedRoute allowedRoles={['Admin']}><PhanQuyenNhanSu /></ProtectedRoute>} />
          <Route path="/danhmuc/icd" element={<ProtectedRoute allowedRoles={['Admin']}><DanhMucICD /></ProtectedRoute>} />
          <Route path="/danhmuc/dich-vu" element={<ProtectedRoute allowedRoles={['Admin']}><DanhMucDichVu /></ProtectedRoute>} />
          <Route path="/danhmuc/khoa" element={<ProtectedRoute allowedRoles={['Admin']}><DanhMucKhoa /></ProtectedRoute>} />
          <Route path="/thanh-toan" element={<ProtectedRoute allowedRoles={['ThuNgan']}><ThanhToanHoaDon /></ProtectedRoute>} />
          
          {/* Quản lý kho dược phẩm, vật tư y tế */}
          <Route path="/kho/danh-muc-thuoc" element={<ProtectedRoute allowedRoles={['QuanLyKho']}><KhoDanhMucThuoc /></ProtectedRoute>} />
          <Route path="/kho/danh-muc-vat-tu" element={<ProtectedRoute allowedRoles={['QuanLyKho']}><KhoDanhMucVatTu /></ProtectedRoute>} />
          <Route path="/kho/nhap-kho" element={<ProtectedRoute allowedRoles={['QuanLyKho']}><KhoNhapKho /></ProtectedRoute>} />
          <Route path="/kho/nha-cung-cap" element={<ProtectedRoute allowedRoles={['QuanLyKho']}><KhoNhaCungCap /></ProtectedRoute>} />
          
          {/* Cổng đặt lịch khám công khai dành cho bệnh nhân tự đặt ngoài trang chủ (Không cần đăng nhập) */}
          <Route path="/dat-lich-kham" element={<DatLichPublic />} />
          
          {/* Lịch làm việc và đặt lịch hẹn khám của bác sĩ */}
          <Route path="/lich" element={<ProtectedRoute allowedRoles={['Admin', 'BacSi', 'LeTan']}><LichPhongKham /></ProtectedRoute>} />
          
          {/* Tự động chuyển hướng về trang đăng nhập nếu người dùng gõ sai đường dẫn */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </ToastProvider>
  );
}

export default App;


