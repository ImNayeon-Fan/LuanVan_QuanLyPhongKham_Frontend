import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useToast } from './ToastContext';

/**
 * Component bảo vệ định tuyến (ProtectedRoute)
 * Nhiệm vụ: Ngăn chặn người dùng chưa đăng nhập truy cập vào các trang nội bộ của hệ thống.
 * Cụ thể: Kiểm tra xem có Token trong LocalStorage hay chưa. Nếu chưa có, chuyển hướng về trang đăng nhập.
 */
export function ProtectedRoute({ children }) {
  // Lấy token từ LocalStorage để xác định trạng thái đăng nhập
  const token = localStorage.getItem('token');
  const { showError } = useToast();

  // Hiển thị thông báo lỗi nếu chưa đăng nhập mà cố tình truy cập
  useEffect(() => {
    if (!token) {
      showError("Bạn cần đăng nhập trước khi truy cập trang này!");
    }
  }, [token, showError]);

  // Nếu không có token, tự động chuyển hướng về màn hình đăng nhập (/login)
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Nếu đã đăng nhập thành công (có token), cho phép hiển thị các component con bên trong
  return children;
}

