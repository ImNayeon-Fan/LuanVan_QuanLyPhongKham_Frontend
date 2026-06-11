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
  Users
} from 'lucide-react';
import { apiLogout } from '../utils/api';

const subModules = [
  { name: 'Tiếp đón bệnh nhân',              icon: <UserPlus size={26} />,     route: '/tiep-don' },
  { name: 'Danh sách bệnh nhân đã tiếp đón', icon: <ClipboardList size={26} />, route: '/danh-sach-tiep-nhan' },
  { name: 'Khám bệnh cho bệnh nhân',         icon: <Stethoscope size={26} />,  route: '/kham-benh' },
  { name: 'Hồ sơ bệnh án',                    icon: <FileText size={26} />,     route: '/ho-so-benh-an' },
];

const subModulesKho = [
  { name: 'Quản lý danh mục thuốc',          icon: <Pill size={26} />,         route: '/kho/danh-muc-thuoc' },
  { name: 'Quản lý danh mục vật tư',         icon: <ClipboardList size={26} />,route: '/kho/danh-muc-vat-tu' },
  { name: 'Quản lý nhập kho thuốc',          icon: <Database size={26} />,     route: '/kho/nhap-kho' },
];

const subModulesDanhMuc = [
  { name: 'Danh mục bệnh lý (ICD)',         icon: <Database size={26} />,     route: '/danhmuc/icd' },
  { name: 'Danh mục dịch vụ y tế (CLS)',     icon: <ClipboardList size={26} />,route: '/danhmuc/dich-vu' },
  { name: 'Danh mục Khoa (Chuyên môn)',      icon: <Users size={26} />,        route: '/danhmuc/khoa' },
];

function Home() {
  const navigate = useNavigate();
  const [expandedModule, setExpandedModule] = useState(null);

  const [userInfo, setUserInfo] = useState(() => {
    try {
      const stored = localStorage.getItem('currentUser');
      return stored ? JSON.parse(stored) : { name: '', role: '' };
    } catch (e) {
      return { name: '', role: '' };
    }
  });

  const handleLogout = async () => {
    await apiLogout();
    navigate('/login');
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ backgroundColor: 'var(--primary-light)', padding: '8px', borderRadius: '8px', color: 'var(--primary)' }}>
            <HomeIcon size={24} />
          </div>
          <div>
            <h1>Trang chủ</h1>
            {(userInfo.name || userInfo.role) && (
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px', fontWeight: '500' }}>
                {userInfo.role ? `${userInfo.role} - ` : ''}{userInfo.name}
              </p>
            )}
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="btn-outline"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <LogOut size={18} />
          Đăng xuất
        </button>
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
    </div>
  );
}

export default Home;
