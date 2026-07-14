import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, KeyRound, X, Phone } from 'lucide-react';
import { apiLogin, apiChangePassword, apiResetPassword, setSession } from '../utils/api';
import { useToast } from '../utils/ToastContext';

function Login() {
  const [viewMode, setViewMode] = useState('login'); // 'login', 'forceChange'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [tempUser, setTempUser] = useState(null);
  
  // Các state quản lý việc mở modal đổi mật khẩu
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSdt, setResetSdt] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  
  const navigate = useNavigate();
  const { showSuccess, showError, showWarning } = useToast();

  // Đóng modal và reset tất cả trường nhập liệu
  const closeResetModal = () => {
    setShowResetModal(false);
    setResetEmail('');
    setResetSdt('');
    setResetNewPassword('');
    setResetConfirmPassword('');
  };

  // Xử lý yêu cầu đổi mật khẩu (Quên mật khẩu)
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetEmail.trim() || !resetSdt.trim() || !resetNewPassword.trim() || !resetConfirmPassword.trim()) {
      showError("Vui lòng điền đầy đủ các thông tin yêu cầu!");
      return;
    }
    if (resetNewPassword !== resetConfirmPassword) {
      showError("Mật khẩu mới và xác nhận mật khẩu không trùng khớp!");
      return;
    }
    try {
      const response = await apiResetPassword(resetEmail.trim(), resetSdt.trim(), resetNewPassword.trim(), resetConfirmPassword.trim());
      showSuccess(response.message || "Đổi mật khẩu thành công!");
      closeResetModal();
    } catch (err) {
      showError(err.message || "Tài khoản hoặc số điện thoại không tồn tại!");
    }
  };

  // Xử lý đăng nhập thông thường
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await apiLogin(email.trim(), password);
      
      // Nếu mật khẩu đăng nhập là mật khẩu mặc định "STUCaoLo"
      if (password === 'STUCaoLo') {
        setTempUser({
          username: email.trim(),
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
      showSuccess(`Đăng nhập thành công! Chào mừng ${response.hoTen || email.trim()} quay trở lại.`);
      navigate('/staff');
    } catch (err) {
      showError(err.message || "Email hoặc mật khẩu không chính xác!");
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
                <p>Nhập địa chỉ Email để truy cập hệ thống</p>
              </div>

              <form onSubmit={handleLogin}>
                <div className="form-group">
                  <label className="form-label">Địa chỉ Email</label>
                  <div className="input-wrapper">
                    <Mail className="input-icon" size={18} />
                    <input
                      type="email"
                      className="form-input"
                      placeholder="Nhập địa chỉ email..."
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
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

                {/* Đường dẫn mở popup Đổi mật khẩu */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-6px', marginBottom: '14px' }}>
                  <button 
                    type="button" 
                    onClick={() => setShowResetModal(true)} 
                    style={{ fontSize: '12px', color: 'var(--primary)', textDecoration: 'none', cursor: 'pointer', backgroundColor: 'transparent', border: 0, padding: 0, fontWeight: '500' }}
                    className="hover:underline"
                  >
                    Quên mật khẩu?
                  </button>
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

        {/* MODAL / POPUP: QUÊN MẬT KHẨU / ĐỔI MẬT KHẨU */}
        {showResetModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
            {/* Backdrop làm mờ phía sau */}
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)' }} onClick={closeResetModal} />
            
            {/* Hộp thoại Modal Container */}
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden relative z-10 border border-slate-100 animate-in fade-in zoom-in-95 duration-200" style={{ display: 'flex', flexDirection: 'column' }}>
              {/* Header của Modal */}
              <div className="px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white flex justify-between items-center" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="font-semibold text-base m-0 text-white" style={{ fontSize: '15px' }}>Đổi mật khẩu tài khoản</h3>
                <button onClick={closeResetModal} className="text-white/80 hover:text-white bg-transparent border-0 cursor-pointer p-0 m-0 flex items-center" style={{ color: 'white', opacity: 0.8 }}>
                  <X size={18} />
                </button>
              </div>
              
              {/* Form nhập thông tin */}
              <form onSubmit={handleResetPassword} className="p-6" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="form-group m-0" style={{ margin: 0 }}>
                  <label className="form-label text-xs font-semibold text-slate-600" style={{ fontSize: '12px', color: '#475569', marginBottom: '4px', display: 'block' }}>Email đăng nhập</label>
                  <div className="input-wrapper">
                    <Mail className="input-icon" size={16} />
                    <input
                      type="email"
                      className="form-input"
                      style={{ fontSize: '13px', padding: '8px 12px 8px 36px', height: '36px' }}
                      placeholder="Nhập địa chỉ email đăng nhập..."
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group m-0" style={{ margin: 0 }}>
                  <label className="form-label text-xs font-semibold text-slate-600" style={{ fontSize: '12px', color: '#475569', marginBottom: '4px', display: 'block' }}>Số điện thoại</label>
                  <div className="input-wrapper">
                    <Phone className="input-icon" size={16} />
                    <input
                      type="text"
                      className="form-input"
                      style={{ fontSize: '13px', padding: '8px 12px 8px 36px', height: '36px' }}
                      placeholder="Nhập số điện thoại liên kết..."
                      value={resetSdt}
                      onChange={(e) => setResetSdt(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group m-0" style={{ margin: 0 }}>
                  <label className="form-label text-xs font-semibold text-slate-600" style={{ fontSize: '12px', color: '#475569', marginBottom: '4px', display: 'block' }}>Mật khẩu mới</label>
                  <div className="input-wrapper">
                    <Lock className="input-icon" size={16} />
                    <input
                      type="password"
                      className="form-input"
                      style={{ fontSize: '13px', padding: '8px 12px 8px 36px', height: '36px' }}
                      placeholder="Nhập mật khẩu mới..."
                      value={resetNewPassword}
                      onChange={(e) => setResetNewPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group m-0" style={{ margin: 0 }}>
                  <label className="form-label text-xs font-semibold text-slate-600" style={{ fontSize: '12px', color: '#475569', marginBottom: '4px', display: 'block' }}>Xác nhận mật khẩu</label>
                  <div className="input-wrapper">
                    <KeyRound className="input-icon" size={16} />
                    <input
                      type="password"
                      className="form-input"
                      style={{ fontSize: '13px', padding: '8px 12px 8px 36px', height: '36px' }}
                      placeholder="Xác nhận lại mật khẩu..."
                      value={resetConfirmPassword}
                      onChange={(e) => setResetConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="pt-2" style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <button 
                    type="button" 
                    onClick={closeResetModal} 
                    style={{ flex: 1, padding: '8px 16px', backgroundColor: '#f1f5f9', color: '#334155', fontWeight: '600', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', border: 0, transition: 'background-color 0.2s' }}
                    className="hover:bg-slate-200"
                  >
                    Hủy bỏ
                  </button>
                  <button 
                    type="submit" 
                    style={{ flex: 1, padding: '8px 16px', backgroundColor: '#10b981', color: 'white', fontWeight: '600', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', border: 0, transition: 'background-color 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                    className="hover:bg-emerald-600"
                  >
                    <KeyRound size={14} /> Cập nhật
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

export default Login;
