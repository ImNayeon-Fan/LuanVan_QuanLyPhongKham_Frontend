import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useToast } from './ToastContext';

/**
 * Component bảo vệ định tuyến (ProtectedRoute)
 * Nhiệm vụ: 
 * 1. Ngăn chặn người dùng chưa đăng nhập truy cập vào các trang nội bộ.
 * 2. Ngăn chặn truy cập nếu tài khoản không thuộc danh sách vai trò cho phép (allowedRoles).
 */
export function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem('token');
  const { showError } = useToast();

  const currentUserStr = localStorage.getItem('currentUser');
  const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;

  const userRole = (() => {
    if (!currentUser) return '';
    const r = (currentUser.role || currentUser.roleName || '').toString().toLowerCase();
    const id = currentUser.roleID || currentUser.roleId;

    if (id === 1 || r === 'admin' || r.includes('quản trị')) return 'Admin';
    if (id === 2 || r === 'bacsi' || r.includes('bác sĩ') || r.includes('bac si')) return 'BacSi';
    if (id === 3 || r === 'letan' || r.includes('lễ tân') || r.includes('le tan')) return 'LeTan';
    if (id === 4 || r === 'thungan' || r.includes('thu ngân') || r.includes('thu ngan')) return 'ThuNgan';
    if (id === 5 || r === 'quanlykho' || r.includes('kho')) return 'QuanLyKho';

    return '';
  })();

  // Nếu không chỉ định allowedRoles thì cho phép tất cả các role đã đăng nhập
  const isAllowed = !allowedRoles || allowedRoles.length === 0 || allowedRoles.includes(userRole) || userRole === 'Admin';

  useEffect(() => {
    if (!token) {
      showError("Bạn cần đăng nhập trước khi truy cập trang này!");
    } else if (!isAllowed) {
      showError("Tài khoản của bạn không có quyền truy cập vào chức năng này!");
    }
  }, [token, isAllowed, showError]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!isAllowed) {
    return <Navigate to="/staff" replace />;
  }

  return children;
}
