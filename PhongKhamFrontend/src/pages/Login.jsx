import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, LogIn, KeyRound } from 'lucide-react';
import { apiLogin, apiChangePassword, setSession } from '../utils/api';
import { useToast } from '../utils/ToastContext';

function Login() {
  const [viewMode, setViewMode] = useState('login'); // 'login', 'forceChange'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [tempUser, setTempUser] = useState(null);
  
  const navigate = useNavigate();
  const { showSuccess, showError, showWarning } = useToast();

  // Xử lý đăng nhập thông thường
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await apiLogin(username.trim(), password);
      
      // Nếu mật khẩu đăng nhập là mật khẩu mặc định "STUCaoLo"
      if (password === 'STUCaoLo') {
        setTempUser({
          username: username.trim(),
          hoTen: response.hoTen,
          roleName: response.roleName,
          token: response.token
        });
        setViewMode('forceChange');
        showWarning("Tài khoản của bạn đã được reset mật khẩu. Vui lòng thiết lập mật khẩu mới để tiếp tục!");
        return;
      }

      // Lưu phiên đăng nhập chính thức
      setSession(response.token, response);
      showSuccess(`Đăng nhập thành công! Chào mừng ${response.hoTen || username.trim()} quay trở lại.`);
      navigate('/');
    } catch (err) {
      showError(err.message || "Tên đăng nhập hoặc mật khẩu không chính xác!");
    }
  };

  // Xử lý đổi mật khẩu bắt buộc
  const handleForceChange = async (e) => {
    e.preventDefault();
    if (!newPassword.trim()) {
      showError("Mật khẩu mới không được để trống!");
      return;
    }
    if (newPassword !== confirmPassword) {
      showError("Mật khẩu xác nhận không trùng khớp!");
      return;
    }
    if (newPassword === 'STUCaoLo') {
      showError("Mật khẩu mới không được trùng với mật khẩu mặc định (STUCaoLo)!");
      return;
    }

    // Kiểm tra các quy tắc mật khẩu mạnh giống Backend
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
      // Thiết lập token tạm thời để gọi API bảo mật DoiMatKhau
      localStorage.setItem('token', tempUser.token);
      
      await apiChangePassword('STUCaoLo', newPassword, confirmPassword);
      
      // Xóa token tạm thời
      localStorage.removeItem('token');

      showSuccess("Thay đổi mật khẩu thành công! Vui lòng đăng nhập lại với mật khẩu mới.");
      setNewPassword('');
      setConfirmPassword('');
      setTempUser(null);
      setViewMode('login');
    } catch (err) {
      // Xóa token tạm thời phòng trường hợp lỗi
      localStorage.removeItem('token');
      showError(err.message || "Đã xảy ra lỗi khi lưu mật khẩu mới!");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-split">

        {/* Bên trái - Logo và Thương hiệu */}
        <div className="auth-image-panel" style={{ gap: '24px' }}>
          <div style={{
            width: '160px',
            height: '160px',
            borderRadius: '50%',
            backgroundColor: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.15)',
            padding: '16px',
            border: '4px solid rgba(255, 255, 255, 0.3)'
          }}>
            <img 
              src="/clinic_logo.png" 
              alt="Logo Phòng khám Đa khoa Nhật Tảo" 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                borderRadius: '50%'
              }}
            />
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: '13px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              marginBottom: '6px'
            }}>Chào mừng đến với</p>
            <h2 style={{
              color: '#ffffff',
              fontSize: '22px',
              fontWeight: '800',
              lineHeight: '1.3',
              margin: 0,
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}>PHÒNG KHÁM ĐA KHOA NHẬT TẢO</h2>
            <p style={{
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '12px',
              marginTop: '10px',
              fontStyle: 'italic'
            }}>Uy tín - Tận tâm - Chuyên nghiệp</p>
          </div>
        </div>

        {/* Bên phải - Từng khung chức năng tùy theo viewMode */}
        <div className="auth-card">
          {viewMode === 'login' && (
            <>
              <div className="auth-header">
                <h1>Đăng nhập</h1>
                <p>Nhập tài khoản để truy cập hệ thống</p>
              </div>

              <form onSubmit={handleLogin}>
                <div className="form-group">
                  <label className="form-label">Tài khoản</label>
                  <div className="input-wrapper">
                    <User className="input-icon" size={18} />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Nhập tên đăng nhập..."
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Mật khẩu</label>
                  <div className="input-wrapper">
                    <Lock className="input-icon" size={18} />
                    <input
                      type="password"
                      className="form-input"
                      placeholder="Nhập mật khẩu..."
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <LogIn size={20} />
                  Đăng nhập
                </button>
              </form>
            </>
          )}

          {viewMode === 'forceChange' && (
            <>
              <div className="auth-header">
                <h1 style={{ color: 'var(--primary)' }}>Đổi mật khẩu</h1>
                <p>Thiết lập mật khẩu mới cho tài khoản <strong>{tempUser?.username}</strong></p>
              </div>

              <form onSubmit={handleForceChange}>
                <div className="form-group">
                  <label className="form-label">Mật khẩu mới</label>
                  <div className="input-wrapper">
                    <Lock className="input-icon" size={18} />
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

                <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', backgroundColor: '#10b981' }}>
                  <KeyRound size={18} />
                  Cập nhật & Đăng nhập
                </button>
              </form>
            </>
          )}
        </div>

      </div>
    </div>
  );
}

export default Login;
