import React, { createContext, useContext, useState, useCallback } from 'react';

// Khởi tạo một Context để quản lý thông báo Toast trên toàn dự án
const ToastContext = createContext(null);

/**
 * Component ToastProvider cung cấp Context thông báo cho toàn bộ các Component con
 * Giúp bất kỳ trang nào cũng có thể gọi hiển thị thông báo thành công/lỗi mà không cần truyền props phức tạp.
 */
export function ToastProvider({ children }) {
  // State quản lý danh sách các thông báo Toast đang hiển thị trên màn hình
  const [toasts, setToasts] = useState([]);

  // Hàm tạo và hiển thị thông báo mới
  const showToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now() + Math.random(); // Tạo ID ngẫu nhiên cho mỗi toast
    setToasts((prev) => [...prev, { id, message, type }]); // Thêm toast mới vào mảng
    
    // Tự động xóa thông báo sau khoảng thời gian chỉ định
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  // Các hàm định dạng nhanh loại thông báo
  const showSuccess = useCallback((msg, duration = 4000) => showToast(msg, 'success', duration), [showToast]);
  const showError = useCallback((msg, duration = 4000) => showToast(msg, 'error', duration), [showToast]);
  const showWarning = useCallback((msg, duration = 4000) => showToast(msg, 'warning', duration), [showToast]);

  // Hàm xóa chủ động một thông báo (khi người dùng click dấu x)
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    // Cung cấp các hàm này xuống toàn bộ cây Component con bên dưới
    <ToastContext.Provider value={{ showToast, showSuccess, showError, showWarning }}>
      {children}
      {/* Container hiển thị danh sách Toast nổi lên màn hình */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast-item toast-${toast.type}`}>
            <span className="toast-message">{toast.message}</span>
            <button className="toast-close-btn" onClick={() => removeToast(toast.id)}>
              &times;
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/**
 * Hook tùy biến useToast giúp các Component con sử dụng thông báo nhanh
 * Ví dụ: const { showSuccess, showError } = useToast();
 */
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
