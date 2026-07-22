import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, 
  Home as HomeIcon,
  ShieldCheck,
  Database,
  Stethoscope,
  Pill,
  Receipt,
  UserPlus,
  ClipboardList,
  FileText,
  ChevronDown,
  ChevronUp,
  Calendar,
  Users,
  User,
  Lock,
  X
} from 'lucide-react';
import { apiLogout, apiChangePassword } from '../utils/api';
import { useToast } from '../utils/ToastContext';

const subModules = [
  { name: 'Tiếp đón bệnh nhân',              icon: <UserPlus size={26} />,     route: '/tiep-don' },
  { name: 'Danh sách bệnh nhân đã tiếp đón', icon: <ClipboardList size={26} />, route: '/danh-sach-tiep-nhan' },
  { name: 'Khám bệnh cho bệnh nhân',         icon: <Stethoscope size={26} />,  route: '/kham-benh' },
  { name: 'Hồ sơ bệnh án',                    icon: <FileText size={26} />,     route: '/ho-so-benh-an' },
];

const subModulesKho = [
  { name: 'Quản lý danh mục thuốc',          icon: <Pill size={26} />,         route: '/kho/danh-muc-thuoc' },
  { name: 'Quản lý danh mục vật tư',         icon: <ClipboardList size={26} />,route: '/kho/danh-muc-vat-tu' },
  { name: 'Quản lý nhà cung cấp',            icon: <Users size={26} />,        route: '/kho/nha-cung-cap' },
  { name: 'Quản lý nhập kho thuốc',          icon: <Database size={26} />,     route: '/kho/nhap-kho' },
];

const subModulesDanhMuc = [
  { name: 'Danh mục bệnh lý (ICD)',         icon: <Database size={26} />,     route: '/danhmuc/icd' },
  { name: 'Danh mục dịch vụ y tế (CLS)',     icon: <ClipboardList size={26} />,route: '/danhmuc/dich-vu' },
  { name: 'Danh mục Khoa (Chuyên môn)',      icon: <Users size={26} />,        route: '/danhmuc/khoa' },
];

function Home() {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [expandedModule, setExpandedModule] = useState(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Form states for password change
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [userInfo, setUserInfo] = useState(() => {
    try {
      const stored = localStorage.getItem('currentUser');
      return stored ? JSON.parse(stored) : { name: '', role: '' };
    } catch (e) {
      return { name: '', role: '' };
    }
  });

  // Tìm thông tin mới nhất của nhân viên này từ danh sách nhân viên trong localStorage
  const latestUserInfo = (() => {
    try {
      const storedList = localStorage.getItem('danhSachNhanVien');
      if (storedList) {
        const list = JSON.parse(storedList);
        // Tìm theo username trước, nếu không có thì tìm theo họ tên (bỏ qua hoa thường và khoảng trắng thừa)
        const targetUsername = userInfo.username ? userInfo.username.trim().toLowerCase() : '';
        const targetName = userInfo.name ? userInfo.name.trim().toLowerCase() : '';
        
        const found = list.find(u => {
          const uUsername = u.username ? u.username.trim().toLowerCase() : '';
          const uHoTen = u.hoTen ? u.hoTen.trim().toLowerCase() : '';
          return (targetUsername && uUsername === targetUsername) || (targetName && uHoTen === targetName);
        });
        if (found) return found;
      }
    } catch (e) {}
    return null;
  })();

  // Giá trị hiển thị ưu tiên lấy từ danh sách nhân viên mới nhất, sau đó đến session và cuối cùng là mặc định
  const userMaNV = (latestUserInfo && latestUserInfo.maNV) || userInfo.maNV || (userInfo.role === 'Bác sĩ' ? 'NV002' : 'NV003');
  const userHoTen = (latestUserInfo && latestUserInfo.hoTen) || userInfo.hoTen || userInfo.name || 'Mai Xuân Phát';
  const userSdt = (latestUserInfo && latestUserInfo.sdt) || userInfo.sdt || '0909090909';
  const userEmail = (latestUserInfo && latestUserInfo.email) || userInfo.email || `${userInfo.username || 'maixuanphat'}@phongkham.vn`;
  const userKhoa = (latestUserInfo && latestUserInfo.khoa) || userInfo.chuyenMon || userInfo.khoa || (userInfo.role === 'Bác sĩ' ? 'Khoa Nội' : undefined);
  const userTrangThai = (latestUserInfo && latestUserInfo.trangThai) || userInfo.trangThai || 'active';

  const handleLogout = async () => {
    await apiLogout();
    navigate('/login');
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      showError('Vui lòng nhập đầy đủ các thông tin mật khẩu.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showError('Mật khẩu mới và xác nhận mật khẩu không khớp nhau.');
      return;
    }
    try {
      const response = await apiChangePassword(oldPassword, newPassword, confirmPassword);
      showSuccess(response.message || 'Thay đổi mật khẩu thành công!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordModal(false);
      
      // Buộc người dùng đăng nhập lại vì token cũ đã bị vô hiệu hóa ở BE
      handleLogout();
    } catch (err) {
      showError(err.message || 'Có lỗi xảy ra khi đổi mật khẩu.');
    }
  };

  const modules = [
    { key: 'phanquyen',  name: 'Phân quyền & Nhân sự',  icon: <ShieldCheck size={32} /> },
    { key: 'danhmuc',    name: 'Danh mục dùng chung',    icon: <Database size={32} /> },
    { key: 'tiepnhan',   name: 'Tiếp nhận & Khám bệnh', icon: <Stethoscope size={32} /> },
    { key: 'kho',        name: 'Quản lý kho dược',        icon: <Pill size={32} /> },
    { key: 'thanhtoan',  name: 'Thanh toán & Hóa đơn',  icon: <Receipt size={32} /> },
    { key: 'lichhen',    name: 'Lịch & Đặt hẹn khám',    icon: <Calendar size={32} /> },
  ];

  return (
    <div className="home-container" style={{ position: 'relative', minHeight: '100vh' }}>
      {/* Background overlay to close popover when clicking outside */}
      {expandedModule && (
        <div 
          onClick={() => setExpandedModule(null)} 
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            zIndex: 90,
            cursor: 'default'
          }} 
        />
      )}

      <div className="home-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <img 
            src="/clinic_logo.png" 
            alt="Logo Phòng Khám Đa Khoa Nhật Tảo" 
            className="h-12 w-auto object-contain rounded-xl p-1 bg-white border border-slate-200 shadow-sm"
          />
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Hệ thống quản lý phòng khám</h1>
          </div>
        </div>

        {/* Profile Dropdown Widget */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className="flex items-center gap-2.5 px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 transition-all duration-200 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-[var(--primary-light)] text-[var(--primary)] flex items-center justify-center font-bold">
              {userInfo.name ? userInfo.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="text-left hidden md:block">
              <div className="text-sm font-semibold text-slate-800">{userInfo.name || 'Người dùng'}</div>
              <div className="text-xs text-slate-500 font-medium">{userInfo.role || 'Nhân viên'}</div>
            </div>
            <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${showProfileDropdown ? 'rotate-180' : ''}`} />
          </button>

          {showProfileDropdown && (
            <>
              {/* Invisible full screen backdrop to dismiss dropdown */}
              <div 
                style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 110 }} 
                onClick={() => setShowProfileDropdown(false)} 
              />
              <div 
                className="absolute right-0 mt-2 w-52 bg-white border border-slate-100 rounded-xl shadow-xl py-1.5 animate-in fade-in slide-in-from-top-2 duration-150"
                style={{ zIndex: 120 }}
              >
                <button
                  onClick={() => {
                    setShowInfoModal(true);
                    setShowProfileDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors border-0 bg-transparent cursor-pointer"
                >
                  <User size={16} className="text-slate-400" />
                  Thông tin cá nhân
                </button>

                <button
                  onClick={() => {
                    setShowPasswordModal(true);
                    setShowProfileDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors border-0 bg-transparent cursor-pointer"
                >
                  <Lock size={16} className="text-slate-400" />
                  Đổi mật khẩu
                </button>

                <div className="h-px bg-slate-100 my-1" />

                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors border-0 bg-transparent cursor-pointer"
                >
                  <LogOut size={16} className="text-red-500" />
                  Đăng xuất
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid-container" style={{ position: 'relative' }}>
        {modules.map((mod) => {
          const isTiepNhan = mod.key === 'tiepnhan';
          const isPhanQuyen = mod.key === 'phanquyen';
          const isDanhMuc = mod.key === 'danhmuc';
          const isKho = mod.key === 'kho';
          const isThanhToan = mod.key === 'thanhtoan';
          const isLichHen = mod.key === 'lichhen';
          const isActive = (isTiepNhan && expandedModule === 'tiepnhan') || 
                           (isKho && expandedModule === 'kho') || 
                           (isDanhMuc && expandedModule === 'danhmuc');
          const isClickable = isTiepNhan || isPhanQuyen || isDanhMuc || isKho || isThanhToan || isLichHen;
          
          return (
            <div 
              key={mod.key} 
              style={{ position: 'relative', zIndex: isActive ? 101 : 1 }}
            >
              <div
                className={`module-card ${isActive ? 'module-card--active' : ''}`}
                onClick={() => {
                  if (isTiepNhan) {
                    setExpandedModule(isActive ? null : 'tiepnhan');
                  } else if (isKho) {
                    setExpandedModule(isActive ? null : 'kho');
                  } else if (isDanhMuc) {
                    setExpandedModule(isActive ? null : 'danhmuc');
                  } else if (isLichHen) {
                    navigate('/lich');
                  } else if (isPhanQuyen) {
                    navigate('/phan-quyen');
                  } else if (isThanhToan) {
                    navigate('/thanh-toan');
                  }
                }}
                style={{ cursor: isClickable ? 'pointer' : 'default' }}
              >
                <div className="module-icon-wrapper">{mod.icon}</div>
                <h3>{mod.name}</h3>
              </div>

              {/* Floating Popover Dropdown */}
              {isActive && (
                <div className="home-popover">
                  <div className="home-popover-arrow" />
                  {(isTiepNhan ? subModules : isKho ? subModulesKho : subModulesDanhMuc).map((sub, i) => (
                    <div
                      key={i}
                      className="home-popover-item"
                      onClick={() => {
                        setExpandedModule(null);
                        if (sub.route) navigate(sub.route);
                      }}
                    >
                      {sub.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* MODAL 1: THÔNG TIN CÁ NHÂN */}
      {showInfoModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }} className="flex justify-center items-center">
          {/* Backdrop blur */}
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)' }} onClick={() => setShowInfoModal(false)} />
          
          {/* Modal Container */}
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden relative z-10 border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white flex justify-between items-center">
              <h3 className="font-semibold text-base m-0">Thông tin cá nhân</h3>
              <button onClick={() => setShowInfoModal(false)} className="text-white/80 hover:text-white bg-transparent border-0 cursor-pointer p-0 m-0 flex items-center">
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex flex-col items-center mb-5">
                <div className="w-16 h-16 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-2xl font-bold mb-2.5 border-4 border-teal-50">
                  {userHoTen ? userHoTen.charAt(0).toUpperCase() : 'U'}
                </div>
                <h4 className="font-bold text-slate-800 text-lg m-0">{userHoTen}</h4>
                <span className="text-xs text-teal-600 font-semibold px-2.5 py-0.5 bg-teal-50 rounded-full mt-1.5">{userInfo.role || 'Chưa xác định'}</span>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-xs text-slate-500 font-medium">Mã nhân viên</span>
                  <span className="text-xs text-slate-800 font-semibold">{userMaNV}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-xs text-slate-500 font-medium">Họ và tên</span>
                  <span className="text-xs text-slate-800 font-semibold">{userHoTen}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-xs text-slate-500 font-medium">Số điện thoại</span>
                  <span className="text-xs text-slate-800 font-semibold">{userSdt}</span>
                </div>
                {userKhoa && (
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-xs text-slate-500 font-medium">Khoa chuyên môn</span>
                    <span className="text-xs text-slate-800 font-semibold">{userKhoa}</span>
                  </div>
                )}
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-xs text-slate-500 font-medium">Địa chỉ email</span>
                  <span className="text-xs text-slate-800 font-semibold">{userEmail}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-xs text-slate-500 font-medium">Vai trò</span>
                  <span className="text-xs text-slate-800 font-semibold">{userInfo.role || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-xs text-slate-500 font-medium">Trạng thái tài khoản</span>
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {userTrangThai === 'active' ? 'Đang hoạt động' : 'Tạm khóa'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowInfoModal(false)}
                className="w-full mt-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl border-0 cursor-pointer transition-all duration-200"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ĐỔI MẬT KHẨU */}
      {showPasswordModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }} className="flex justify-center items-center">
          {/* Backdrop blur */}
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)' }} onClick={() => setShowPasswordModal(false)} />
          
          {/* Modal Container */}
          <form onSubmit={handleChangePassword} className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden relative z-10 border border-slate-100 animate-in fade-in zoom-in-95 duration-200 m-0">
            <div className="px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white flex justify-between items-center">
              <h3 className="font-semibold text-base m-0">Đổi mật khẩu</h3>
              <button type="button" onClick={() => setShowPasswordModal(false)} className="text-white/80 hover:text-white bg-transparent border-0 cursor-pointer p-0 m-0 flex items-center">
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Mật khẩu hiện tại</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', top: 0, bottom: 0, left: 0, display: 'flex', alignItems: 'center', paddingLeft: '12px' }} className="text-slate-400">
                    <Lock size={14} />
                  </span>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Nhập mật khẩu cũ"
                    style={{ paddingLeft: '34px' }}
                    className="w-full pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 text-xs transition-all box-border"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Mật khẩu mới</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', top: 0, bottom: 0, left: 0, display: 'flex', alignItems: 'center', paddingLeft: '12px' }} className="text-slate-400">
                    <Lock size={14} />
                  </span>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nhập mật khẩu mới"
                    style={{ paddingLeft: '34px' }}
                    className="w-full pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 text-xs transition-all box-border"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Xác nhận mật khẩu mới</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', top: 0, bottom: 0, left: 0, display: 'flex', alignItems: 'center', paddingLeft: '12px' }} className="text-slate-400">
                    <Lock size={14} />
                  </span>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Xác nhận mật khẩu mới"
                    style={{ paddingLeft: '34px' }}
                    className="w-full pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 text-xs transition-all box-border"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-5 pt-1">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="w-1/2 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl border-0 cursor-pointer transition-all duration-200"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold text-xs rounded-xl border-0 cursor-pointer shadow-md shadow-teal-500/10 transition-all duration-200"
                >
                  Lưu thay đổi
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default Home;
