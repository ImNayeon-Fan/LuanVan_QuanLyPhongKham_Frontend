import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, KeyRound } from 'lucide-react';
import { apiChangePassword, getToken, clearSession } from '../utils/api';
import { useToast } from '../utils/ToastContext';

function ChangePassword() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();



  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!newPassword.trim()) {
      showError("Mật khẩu mới không được để trống!");
      return;
    }
    if (newPassword !== confirmPassword) {
      showError("Mật khẩu xác nhận không trùng khớp!");
      return;
    }

    // Các quy tắc bảo mật mật khẩu ở Backend
    if (newPassword.length < 8 || newPassword.length > 12) {
      showError("Mật khẩu mới phải có độ dài từ 8 đến 12 ký tự!");
      return;
    }
    if (!/[a-z]/.test(newPassword)) {
      showError("Mật khẩu mới phải chứa ít nhất 1 chữ thường (a-z)!");
      return;
    }
    if (!/[A-Z]/.test(newPassword)) {
      showError("Mật khẩu mới phải chứa ít nhất 1 chữ hoa (A-Z)!");
      return;
    }
    if (!/[0-9]/.test(newPassword)) {
      showError("Mật khẩu mới phải chứa ít nhất 1 chữ số (0-9)!");
      return;
    }
    if (!/[!@#$%^&*()\-_=+\[\]{};:'",.<>/?\\|`~]/.test(newPassword)) {
      showError("Mật khẩu mới phải chứa ít nhất 1 ký tự đặc biệt!");
      return;
    }
    if (newPassword.includes(' ')) {
      showError("Mật khẩu mới không được chứa khoảng trắng!");
      return;
    }

    try {
      await apiChangePassword(oldPassword, newPassword, confirmPassword);
      
      // Xóa phiên làm việc hiện tại (vì token cũ đã bị blacklist)
      clearSession();
      
      showSuccess("Đổi mật khẩu thành công! Vui lòng đăng nhập lại bằng mật khẩu mới.");
      navigate('/login');
    } catch (err) {
      showError(err.message || "Đã xảy ra lỗi khi đổi mật khẩu!");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Đổi mật khẩu</h1>
          <p>Cập nhật mật khẩu mới cho tài khoản hệ thống của bạn</p>
        </div>
        
        <form onSubmit={handleChangePassword}>
          <div className="form-group">
            <label className="form-label">Mật khẩu cũ</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                type="password"
                className="form-input"
                placeholder="Nhập mật khẩu cũ..."
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Mật khẩu mới</label>
            <div className="input-wrapper">
              <KeyRound className="input-icon" size={18} />
              <input
                type="password"
                className="form-input"
                placeholder="Nhập mật khẩu mới..."
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Xác nhận mật khẩu mới</label>
            <div className="input-wrapper">
              <KeyRound className="input-icon" size={18} />
              <input
                type="password"
                className="form-input"
                placeholder="Nhập lại mật khẩu mới..."
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <KeyRound size={20} />
            Cập nhật mật khẩu
          </button>
        </form>

        <div className="auth-footer">
          <Link to="/" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'underline' }}>Quay lại Trang chủ</Link>
        </div>
      </div>
    </div>
  );
}

export default ChangePassword;
