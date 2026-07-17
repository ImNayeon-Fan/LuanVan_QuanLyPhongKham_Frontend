import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Calendar, ShieldAlert, Plus, 
  Trash2, Search, ArrowRight, ShieldCheck, MapPin,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { apiGetStaffList } from '../utils/api';
import { useToast } from '../utils/ToastContext';

// Danh sách Bác sĩ mặc định nếu API không trả về
const DEFAULT_DOCTORS = [
  { maNV: 'NV002', hoTen: 'BS. CK1. Nguyễn Văn An', chuyenMon: 'Nội tổng quát' },
  { maNV: 'NV003', hoTen: 'BS. CK2. Trần Thị Bình', chuyenMon: 'Tim mạch' },
  { maNV: 'NV004', hoTen: 'ThS. BS. Phạm Minh Cường', chuyenMon: 'Nhi khoa' },
  { maNV: 'NV005', hoTen: 'BS. Lê Hoài Nam', chuyenMon: 'Tai Mũi Họng' },
];

/**
 * Component Quản lý Lịch hẹn bệnh nhân và Lịch trực bác sĩ
 */
function LichPhongKham() {
  const navigate = useNavigate();
  const { showSuccess, showError, showWarning } = useToast();

  // Phân quyền: vai trò & quyền truy cập lịch làm việc bác sĩ
  const [userRole, setUserRole] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [hasLichBacSiAccess, setHasLichBacSiAccess] = useState(false);

  // Tab hiện tại ('appt': Lịch đặt hẹn của bệnh nhân, 'doctor': Lịch trực bác sĩ)
  const [activeTab, setActiveTab] = useState('appt');

  // Quản lý danh sách lịch hẹn & bộ lọc tìm kiếm
  const [appointments, setAppointments] = useState([]);
  const [apptFilters, setApptFilters] = useState({ search: '', date: '' });
  
  // Quản lý danh sách lịch trực bác sĩ & danh sách bác sĩ phục vụ chọn lựa
  const [doctorSchedules, setDoctorSchedules] = useState([]);
  const [doctorsList, setDoctorsList] = useState(DEFAULT_DOCTORS);
  
  /**
   * Xác định thứ Hai của tuần chứa ngày d
   */
  const getMonday = (d) => {
    d = new Date(d);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Trả về thứ 2 của tuần đó
    return new Date(d.setDate(diff));
  };

  // State lưu trữ ngày thứ Hai của tuần hiện hành đang hiển thị
  const [currentMonday, setCurrentMonday] = useState(() => getMonday(new Date()));

  /**
   * Tính toán 7 ngày trong tuần từ thứ Hai hiện hành
   */
  const getDaysOfWeek = (monday) => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const weekDays = getDaysOfWeek(currentMonday);
  const weekDaysNames = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'];

  // Hàm chuyển đổi tuần (Sau, Trước, Về tuần hiện tại)
  const handlePrevWeek = () => {
    const prev = new Date(currentMonday);
    prev.setDate(currentMonday.getDate() - 7);
    setCurrentMonday(prev);
  };

  const handleNextWeek = () => {
    const next = new Date(currentMonday);
    next.setDate(currentMonday.getDate() + 7);
    setCurrentMonday(next);
  };

  const handleCurrentWeek = () => {
    setCurrentMonday(getMonday(new Date()));
  };
  
  // Trạng thái modal và form thêm mới ca trực bác sĩ
  const [showDocModal, setShowDocModal] = useState(false);
  const [docForm, setDocForm] = useState({
    maNV: '', ngayLamViec: '', caLamViec: 'Sang', phongKham: '', ghiChu: ''
  });

  // Tải dữ liệu phân quyền người dùng và dữ liệu lịch biểu khi load component
  useEffect(() => {
    try {
      const userStr = localStorage.getItem('currentUser');
      if (userStr) {
        const parsed = JSON.parse(userStr);
        setCurrentUser(parsed);
        const role = parsed.role || parsed.roleName || '';
        setUserRole(role);
        // Admin, Lễ tân và Bác sĩ đều có quyền thao tác trên lịch trực bác sĩ
        if (role === 'Admin' || role === 'LeTan' || role === 'BacSi') {
          setHasLichBacSiAccess(true);
        } else {
          setHasLichBacSiAccess(false);
        }
      }
    } catch (e) {
      console.error('Lỗi phân quyền:', e);
    }

    loadAppointments();
    loadDoctorSchedules();
    fetchDoctors();
  }, []);

  /**
   * Lấy danh sách bác sĩ từ hệ thống/API để đưa vào selectbox
   */
  const fetchDoctors = async () => {
    try {
      const response = await apiGetStaffList('active', 1, 1000);
      if (response && response.data) {
        const docs = response.data.filter(s => s.roleID === 2 || s.roleName === 'BacSi');
        if (docs.length > 0) {
          setDoctorsList(docs);
          setDocForm(prev => ({ ...prev, maNV: docs[0].maNV }));
        } else {
          setDocForm(prev => ({ ...prev, maNV: DEFAULT_DOCTORS[0].maNV }));
        }
      } else {
        setDocForm(prev => ({ ...prev, maNV: DEFAULT_DOCTORS[0].maNV }));
      }
    } catch (err) {
      console.warn('Sử dụng danh sách bác sĩ mặc định:', err);
      setDocForm(prev => ({ ...prev, maNV: DEFAULT_DOCTORS[0].maNV }));
    }
  };

  /**
   * Tải danh sách lịch hẹn khám bệnh nhân từ LocalStorage
   */
  const loadAppointments = () => {
    try {
      const stored = localStorage.getItem('danhSachDatLich');
      if (stored) {
        setAppointments(JSON.parse(stored));
      } else {
        const defaultAppts = [
          {
            maDatLich: 'DL_260603_001',
            hoTenKhach: 'NGUYỄN VĂN AN',
            sdt: '0901234567',
            ngayHen: new Date().toISOString().split('T')[0],
            yeuCauKham: 'Đau tức ngực, khó thở nhẹ',
            trangThai: 'DaXacNhan',
            ngayTao: new Date().toISOString()
          },
          {
            maDatLich: 'DL_260603_002',
            hoTenKhach: 'LÊ THỊ MAI',
            sdt: '0987654321',
            ngayHen: new Date(Date.now() + 86400000).toISOString().split('T')[0],
            yeuCauKham: 'Khám mắt định kỳ',
            trangThai: 'ChoXacNhan',
            ngayTao: new Date().toISOString()
          }
        ];
        localStorage.setItem('danhSachDatLich', JSON.stringify(defaultAppts));
        setAppointments(defaultAppts);
      }
    } catch (e) {
      console.error(e);
    }
  };

  /**
   * Tải danh sách ca trực bác sĩ từ LocalStorage
   */
  const loadDoctorSchedules = () => {
    try {
      const stored = localStorage.getItem('danhSachLichLamViec');
      if (stored) {
        setDoctorSchedules(JSON.parse(stored));
      } else {
        const monday = getMonday(new Date());
        const getOffsetDateStr = (offset) => {
          const d = new Date(monday);
          d.setDate(d.getDate() + offset);
          return d.toISOString().split('T')[0];
        };
        const defaultDocSchedules = [
          {
            maLich: 'LBS001',
            maNV: 'NV002',
            tenBacSi: 'BS. CK1. Nguyễn Văn An',
            chuyenMon: 'Nội tổng quát',
            ngayLamViec: getOffsetDateStr(0),
            caLamViec: 'Sang',
            phongKham: 'Phòng 101',
            ghiChu: 'Khám nội nhi'
          },
          {
            maLich: 'LBS002',
            maNV: 'NV003',
            tenBacSi: 'BS. CK2. Trần Thị Bình',
            chuyenMon: 'Tim mạch',
            ngayLamViec: getOffsetDateStr(0),
            caLamViec: 'Chieu',
            phongKham: 'Phòng 102',
            ghiChu: 'Siêu âm tim mạch'
          },
          {
            maLich: 'LBS003',
            maNV: 'NV004',
            tenBacSi: 'ThS. BS. Phạm Minh Cường',
            chuyenMon: 'Nhi khoa',
            ngayLamViec: getOffsetDateStr(1),
            caLamViec: 'Sang',
            phongKham: 'Phòng 103',
            ghiChu: 'Khám nhi sơ sinh'
          },
          {
            maLich: 'LBS004',
            maNV: 'NV005',
            tenBacSi: 'BS. Lê Hoài Nam',
            chuyenMon: 'Tai Mũi Họng',
            ngayLamViec: getOffsetDateStr(1),
            caLamViec: 'Chieu',
            phongKham: 'Phòng 104',
            ghiChu: 'Nội soi tai mũi họng'
          },
          {
            maLich: 'LBS005',
            maNV: 'NV002',
            tenBacSi: 'BS. CK1. Nguyễn Văn An',
            chuyenMon: 'Nội tổng quát',
            ngayLamViec: getOffsetDateStr(2),
            caLamViec: 'Sang',
            phongKham: 'Phòng 101',
            ghiChu: 'Hội chẩn trực tuyến'
          },
          {
            maLich: 'LBS006',
            maNV: 'NV004',
            tenBacSi: 'ThS. BS. Phạm Minh Cường',
            chuyenMon: 'Nhi khoa',
            ngayLamViec: getOffsetDateStr(2),
            caLamViec: 'Chieu',
            phongKham: 'Phòng 103',
            ghiChu: 'Chích ngừa dịch vụ'
          },
          {
            maLich: 'LBS007',
            maNV: 'NV003',
            tenBacSi: 'BS. CK2. Trần Thị Bình',
            chuyenMon: 'Tim mạch',
            ngayLamViec: getOffsetDateStr(3),
            caLamViec: 'Sang',
            phongKham: 'Phòng 102',
            ghiChu: 'Đọc kết quả Holter'
          },
          {
            maLich: 'LBS008',
            maNV: 'NV005',
            tenBacSi: 'BS. Lê Hoài Nam',
            chuyenMon: 'Tai Mũi Họng',
            ngayLamViec: getOffsetDateStr(3),
            caLamViec: 'Chieu',
            phongKham: 'Phòng 104',
            ghiChu: 'Rửa tai, hút mũi'
          },
          {
            maLich: 'LBS009',
            maNV: 'NV002',
            tenBacSi: 'BS. CK1. Nguyễn Văn An',
            chuyenMon: 'Nội tổng quát',
            ngayLamViec: getOffsetDateStr(4),
            caLamViec: 'Sang',
            phongKham: 'Phòng 101',
            ghiChu: 'Khám sức khỏe tổng quát'
          },
          {
            maLich: 'LBS010',
            maNV: 'NV003',
            tenBacSi: 'BS. CK2. Trần Thị Bình',
            chuyenMon: 'Tim mạch',
            ngayLamViec: getOffsetDateStr(4),
            caLamViec: 'Chieu',
            phongKham: 'Phòng 102',
            ghiChu: 'Khám ngoại trú'
          }
        ];
        localStorage.setItem('danhSachLichLamViec', JSON.stringify(defaultDocSchedules));
        setDoctorSchedules(defaultDocSchedules);
      }
    } catch (e) {
      console.error(e);
    }
  };

  /**
   * Cập nhật trạng thái duyệt lịch đặt khám
   */
  const handleUpdateStatus = (maDatLich, newStatus) => {
    try {
      const updated = appointments.map(appt => {
        if (appt.maDatLich === maDatLich) {
          return { ...appt, trangThai: newStatus };
        }
        return appt;
      });
      localStorage.setItem('danhSachDatLich', JSON.stringify(updated));
      setAppointments(updated);
      showSuccess('Cập nhật trạng thái lịch hẹn thành công!');
    } catch (err) {
      showError('Lỗi cập nhật trạng thái!');
    }
  };

  /**
   * Tiếp nhận bệnh nhân: Điền thông tin vào luồng tiếp đón
   */
  const handleReceivePatient = (appt) => {
    navigate('/tiep-don', {
      state: {
        hoTen: appt.hoTenKhach,
        sdt: appt.sdt,
        gioiTinh: appt.gioiTinh || 'Nam',
        ngaySinh: appt.ngaySinh || '',
        diaChi: appt.diaChi || '',
        tienSuBenh: appt.tienSuBenh || '',
        maNV: appt.maNV || '',
        lyDoKham: appt.yeuCauKham
      }
    });
    showSuccess(`Đã chọn bệnh nhân ${appt.hoTenKhach}. Đang chuyển sang Tiếp đón...`);
  };

  /**
   * Thêm lịch trực làm việc mới cho bác sĩ
   */
  const handleAddDoctorSchedule = (e) => {
    if (e) e.preventDefault();
    const { maNV, ngayLamViec, caLamViec, phongKham, ghiChu } = docForm;

    if (!maNV) {
      showError('Vui lòng chọn Bác sĩ!');
      return;
    }
    if (!ngayLamViec) {
      showError('Vui lòng chọn Ngày làm việc!');
      return;
    }


    const selectedDoc = doctorsList.find(d => d.maNV === maNV);
    const tenBacSi = selectedDoc ? selectedDoc.hoTen : 'Bác sĩ';

    // Kiểm tra xung đột trùng ca làm việc của cùng bác sĩ trong cùng ngày
    const isConflict = doctorSchedules.some(s => 
      s.maNV === maNV && 
      s.ngayLamViec === ngayLamViec && 
      (s.caLamViec === caLamViec || s.caLamViec === 'CaNgay' || caLamViec === 'CaNgay')
    );

    if (isConflict) {
      showWarning(`${tenBacSi} đã có lịch trực vào ca này ngày ${ngayLamViec}!`);
      return;
    }

    const chuyenMon = selectedDoc ? (selectedDoc.chuyenMon || selectedDoc.roleName || '') : '';

    const newSchedule = {
      maLich: `LBS${Date.now().toString().slice(-6)}`,
      maNV,
      tenBacSi,
      chuyenMon,
      ngayLamViec,
      caLamViec,
      phongKham: (phongKham || '').trim(),
      ghiChu: (ghiChu || '').trim()
    };

    try {
      const updated = [...doctorSchedules, newSchedule];
      localStorage.setItem('danhSachLichLamViec', JSON.stringify(updated));
      setDoctorSchedules(updated);
      showSuccess(`Sắp lịch trực cho ${tenBacSi} thành công!`);
      setShowDocModal(false);
      
      setDocForm({
        maNV: doctorsList[0]?.maNV || '',
        ngayLamViec: '',
        caLamViec: 'Sang',
        phongKham: '',
        ghiChu: ''
      });
    } catch (e) {
      showError('Lỗi lưu lịch làm việc!');
    }
  };

  /**
   * Xóa một ca trực của bác sĩ
   */
  const handleDeleteDoctorSchedule = (maLich, tenBacSi) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa ca trực này của ${tenBacSi}?`)) {
      try {
        const updated = doctorSchedules.filter(s => s.maLich !== maLich);
        localStorage.setItem('danhSachLichLamViec', JSON.stringify(updated));
        setDoctorSchedules(updated);
        showSuccess('Đã xóa ca trực thành công!');
      } catch (err) {
        showError('Không thể xóa ca trực!');
      }
    }
  };

  // Áp dụng bộ lọc tìm kiếm cho cuộc hẹn bệnh nhân
  const filteredAppts = appointments.filter(appt => {
    const matchesSearch = 
      (appt.hoTenKhach || '').toLowerCase().includes(apptFilters.search.toLowerCase()) ||
      (appt.sdt || '').includes(apptFilters.search);
    const matchesDate = apptFilters.date ? appt.ngayHen === apptFilters.date : true;
    return matchesSearch && matchesDate;
  });

  const formatDateDMY = (dateObj) => {
    const dd = String(dateObj.getDate()).padStart(2, '0');
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
    const yyyy = dateObj.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  const getISODateString = (dateObj) => {
    const yyyy = dateObj.getFullYear();
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
    const dd = String(dateObj.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  return (
    <div className="kb-wrapper h-screen overflow-hidden flex flex-col font-inherit">
      {/* Topbar điều hướng */}
      <div className="kb-topbar h-[50px] px-5 flex-shrink-0 font-inherit flex items-center justify-between">
        <div className="flex-1 flex justify-start">
          <button className="kb-back-btn py-[5px] px-[10px] font-inherit flex items-center gap-1" onClick={() => navigate('/staff')}>
            <ArrowLeft size={16} /> Quay về trang chủ
          </button>
        </div>
        <div className="kb-topbar-title flex-1 flex justify-center text-[15px] font-inherit items-center">
          <Calendar size={18} className="mr-[6px]" />
          <strong>Quản Lý Lịch Hẹn & Lịch Làm Việc</strong>
        </div>
        <div className="flex-1 flex justify-end text-[12px] opacity-[0.85] font-inherit">
          <span>Trang chủ / Quản lý chung / Lịch hoạt động</span>
        </div>
      </div>

      {/* Tab Navigation header */}
      <div className="flex border-b border-[var(--border-color)] bg-white px-5 h-[46px] items-center justify-between flex-shrink-0 font-inherit">
        <div className="flex gap-2 h-full font-inherit">
          <button
            onClick={() => setActiveTab('appt')}
            className={`px-5 border-none bg-none text-[14px] cursor-pointer h-full font-inherit transition-all duration-150 ease-in-out ${
              activeTab === 'appt'
                ? 'font-extrabold text-[var(--primary)] border-b-[3px] border-[var(--primary)]'
                : 'font-medium text-[var(--text-muted)] border-b-0'
            }`}
          >
            Lịch Đặt Khám Bệnh Nhân ({appointments.length})
          </button>
          <button
            onClick={() => setActiveTab('doctor')}
            className={`px-5 border-none bg-none text-[14px] cursor-pointer h-full font-inherit transition-all duration-150 ease-in-out ${
              activeTab === 'doctor'
                ? 'font-extrabold text-[var(--primary)] border-b-[3px] border-[var(--primary)]'
                : 'font-medium text-[var(--text-muted)] border-b-0'
            }`}
          >
            Lịch Làm Việc Bác Sĩ
          </button>
        </div>


      </div>

      {/* Main Body Content */}
      <div className="flex-1 bg-[var(--bg-main)] overflow-y-auto p-5 flex flex-col">
        
        {/* TAB 1: LỊCH ĐẶT KHÁM BỆNH NHÂN */}
        {activeTab === 'appt' && (
          <div className="bg-white rounded-[10px] border border-[var(--border-color)] flex flex-col flex-1 overflow-hidden">
            {/* Thanh tìm kiếm & lọc */}
            <div className="py-3 px-4 flex gap-3 border-b border-[var(--border-color)] bg-[var(--bg-main)]">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm bệnh nhân theo Tên hoặc Số điện thoại..."
                  value={apptFilters.search}
                  onChange={(e) => setApptFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="form-input pl-8 h-[34px] text-[13px] font-inherit"
                />
                <Search size={14} className="absolute left-2.5 top-2.5 text-[var(--text-muted)]" />
              </div>
              <div className="w-[180px]">
                <input
                  type="date"
                  value={apptFilters.date}
                  onChange={(e) => setApptFilters(prev => ({ ...prev, date: e.target.value }))}
                  className="form-input h-[34px] text-[13px] font-inherit"
                />
              </div>
              {(apptFilters.search || apptFilters.date) && (
                <button 
                  onClick={() => setApptFilters({ search: '', date: '' })} 
                  className="btn-outline h-[34px] text-[12.5px] m-0 px-3 font-inherit"
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>

            {/* Bảng danh sách */}
            <div className="flex-1 overflow-y-auto">
              {filteredAppts.length === 0 ? (
                <div className="p-10 text-center text-[var(--text-muted)]">
                  <Calendar size={48} strokeWidth={1} className="text-[var(--border-color)] mb-3 mx-auto" />
                  <p className="text-[14px]">Không tìm thấy lịch hẹn khám bệnh nào phù hợp.</p>
                </div>
              ) : (
                <table className="kb-table w-full border-collapse text-[13px]">
                  <thead>
                    <tr className="bg-[var(--bg-main)] border-b-2 border-[var(--border-color)]">
                      <th className="w-[50px] text-center p-2.5">STT</th>
                      <th className="w-[130px] p-2.5 text-left">Mã đặt lịch</th>
                      <th className="w-[160px] p-2.5 text-left">Họ tên khách</th>
                      <th className="w-[115px] p-2.5 text-left">Số điện thoại</th>
                      <th className="w-[140px] p-2.5 text-left">Ngày hẹn khám</th>
                      <th className="p-2.5 text-left">Yêu cầu khám bệnh</th>
                      <th className="w-[140px] p-2.5 text-center">Trạng thái</th>
                      <th className="w-[150px] p-2.5 text-center">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAppts.map((appt, i) => (
                      <tr key={appt.maDatLich} className="border-b border-[var(--border-color)]">
                        <td className="text-center p-2.5">{i + 1}</td>
                        <td className="p-2.5 font-semibold">{appt.maDatLich}</td>
                        <td className="p-2.5 font-bold">{appt.hoTenKhach}</td>
                        <td className="p-2.5">{appt.sdt}</td>
                        <td className="p-2.5 font-semibold">
                          <div>{appt.ngayHen}</div>
                          {appt.caKham && (
                            <div className="text-[11px] text-[var(--text-muted)] font-medium mt-0.5">
                              Ca: {appt.caKham === 'Sang' ? 'Sáng' : 'Chiều'}
                            </div>
                          )}
                        </td>
                        <td className="p-2.5 text-[var(--text-muted)]">
                          <div>{appt.yeuCauKham}</div>
                          {appt.tenBacSi && (
                            <div className="text-[11px] text-[var(--primary)] font-bold mt-1">
                              Yêu cầu bác sĩ: {appt.tenBacSi}
                            </div>
                          )}
                        </td>
                        <td className="p-2.5 text-center">
                          <select
                            value={appt.trangThai}
                            onChange={(e) => handleUpdateStatus(appt.maDatLich, e.target.value)}
                            className={`border rounded-md h-8 text-[12px] w-[130px] font-semibold font-inherit outline-none transition-all duration-150 cursor-pointer ${
                              appt.trangThai === 'DaXacNhan' ? 'text-[#10b981] bg-emerald-50/30 border-emerald-200' :
                              appt.trangThai === 'DaKham' ? 'text-[var(--primary)] bg-sky-50/30 border-sky-200' :
                              appt.trangThai === 'DaHuy' ? 'text-[#ef4444] bg-red-50/30 border-red-200' : 'text-[#6b7280] bg-slate-50/30 border-slate-200'
                            }`}
                            style={{ textAlign: 'center', textAlignLast: 'center', padding: '0 20px 0 8px' }}
                          >
                            <option value="ChoXacNhan">Chờ xác nhận</option>
                            {appt.trangThai === 'DaXacNhan' && <option value="DaXacNhan">Đã xác nhận</option>}
                            {appt.trangThai === 'DaKham' && <option value="DaKham">Đã khám</option>}
                            <option value="DaHuy">Đã hủy</option>
                          </select>
                        </td>
                        <td className="p-2.5 text-center">
                          <button
                            onClick={() => handleReceivePatient(appt)}
                            className={`btn-primary h-7 text-[12px] px-2.5 m-0 w-auto mt-0 font-inherit inline-flex items-center gap-1 ${
                              (appt.trangThai === 'DaHuy' || appt.trangThai === 'DaKham') ? 'opacity-50 cursor-not-allowed' : 'opacity-100 cursor-pointer'
                            }`}
                            disabled={appt.trangThai === 'DaHuy' || appt.trangThai === 'DaKham'}
                          >
                            Tiếp nhận <ArrowRight size={12} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: LỊCH LÀM VIỆC BÁC SĨ (DẠNG WEEKLY GRID) */}
        {activeTab === 'doctor' && (
          <>
            {!hasLichBacSiAccess ? (
              <div className="flex flex-col items-center justify-center py-20 px-5 bg-white rounded-[10px] border border-[var(--border-color)] text-center flex-1">
                <ShieldAlert size={64} strokeWidth={1.2} className="text-[#ef4444] mb-5" />
                <h3 className="text-[18px] font-extrabold text-[#ef4444] mb-2">Giới Hạn Quyền Truy Cập</h3>
                <p className="max-w-[480px] text-[var(--text-muted)] text-[14px] leading-[1.6] mb-5">
                  Mục này chỉ dành cho <strong>Admin (Quản trị hệ thống)</strong> và <strong>Thư ký y khoa (Lễ tân)</strong> truy cập, sắp xếp và xem lịch làm việc của Bác sĩ. 
                  <br />
                  Vai trò hiện tại của bạn là <span className="text-red-600 font-semibold">{userRole || 'Không xác định'}</span> không được phép thao tác.
                </p>
                <button onClick={() => setActiveTab('appt')} className="btn-outline mt-5 font-inherit">
                  Xem lịch đặt của bệnh nhân
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-[10px] border border-[var(--border-color)] flex flex-col flex-1 overflow-hidden">
                
                {/* Thanh điều hướng Tuần & Ngày */}
                <div className="py-3 px-4 flex items-center justify-between border-b border-[var(--border-color)] bg-[var(--bg-main)]">
                  <div className="flex items-center gap-2">
                    <button onClick={handlePrevWeek} className="btn-outline h-[34px] px-2.5 m-0 flex items-center justify-center font-inherit">
                      <ChevronLeft size={16} /> Tuần trước
                    </button>
                    <button onClick={handleCurrentWeek} className="btn-outline h-[34px] px-3 m-0 flex items-center justify-center font-inherit">
                      Tuần này
                    </button>
                    <button onClick={handleNextWeek} className="btn-outline h-[34px] px-2.5 m-0 flex items-center justify-center font-inherit">
                      Tuần sau <ChevronRight size={16} />
                    </button>
                  </div>
                  
                  <div className="text-[14.5px] font-extrabold text-[var(--primary)]">
                    Từ {formatDateDMY(weekDays[0])} đến {formatDateDMY(weekDays[6])}
                  </div>

                  <div className="flex items-center gap-2 opacity-80">
                    <Calendar size={16} className="text-[var(--text-muted)]" />
                    <span className="text-[13px] font-medium">Lịch trực theo tuần</span>
                  </div>
                </div>

                {/* Bảng dạng cột từ Thứ 2 đến Chủ nhật */}
                <div className="flex-1 overflow-y-auto">
                  <table className="w-full border-collapse table-fixed min-w-[1280px]">
                    <thead>
                      <tr className="bg-[var(--bg-main)] border-b-2 border-[var(--border-color)]">
                        <th className="w-[180px] py-3 px-2.5 border-r border-[var(--border-color)] text-center text-[13px] font-extrabold">Ca Trực</th>
                        {weekDays.map((day, idx) => {
                          const dateStr = getISODateString(day);
                          const isToday = dateStr === new Date().toISOString().split('T')[0];
                          return (
                            <th key={idx} className={`py-2.5 px-1.5 border-r border-[var(--border-color)] text-center ${
                              isToday ? 'bg-[var(--primary-light)] text-[var(--primary)]' : 'bg-transparent text-[var(--text-main)]'
                            }`}>
                              <div className="text-[13px] font-extrabold">{weekDaysNames[idx]}</div>
                              <div className="text-[11px] opacity-80 mt-0.5">{formatDateDMY(day).slice(0, 5)}</div>
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {/* Dòng 1: Ca Sáng */}
                      <tr className="border-b border-[var(--border-color)]">
                        <td className="py-4 px-3 border-r border-[var(--border-color)] bg-[var(--bg-main)] text-center align-middle">
                          <div className="text-[14px] font-extrabold text-[#0369a1]">Ca Sáng</div>
                          <div className="text-[11px] text-[var(--text-muted)] mt-1 font-semibold">07:30 - 11:30</div>
                        </td>
                        {weekDays.map((day, dayIdx) => {
                          const dateStr = getISODateString(day);
                          const isToday = dateStr === new Date().toISOString().split('T')[0];
                          const daySchedules = doctorSchedules.filter(s => s.ngayLamViec === dateStr && (s.caLamViec === 'Sang' || s.caLamViec === 'CaNgay'));

                          return (
                            <td key={dayIdx} className={`py-3 px-2 border-r border-[var(--border-color)] align-top min-h-[220px] ${
                              isToday ? 'bg-[rgba(14,165,233,0.03)]' : 'bg-transparent'
                            }`}>
                              <div className="flex flex-col gap-2 h-full">
                                {daySchedules.map((sched) => {
                                  const isOwnSchedule = currentUser && currentUser.maNV === sched.maNV;
                                  const canDelete = hasLichBacSiAccess && (userRole === 'Admin' || userRole === 'LeTan' || isOwnSchedule);
                                  return (
                                    <div key={sched.maLich} className="p-2 rounded-md text-[11.5px] font-semibold relative border flex flex-col gap-1 shadow-sm bg-[#e0f2fe] text-[#0369a1] border-[#bae6fd]">
                                      <div className="flex justify-between items-start gap-1">
                                        <div className="font-bold text-[12px] break-words flex-1 text-[#0369a1]">
                                          {sched.tenBacSi}
                                        </div>
                                        {canDelete && (
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDeleteDoctorSchedule(sched.maLich, sched.tenBacSi);
                                            }}
                                            className="border-none bg-none text-[#ef4444] cursor-pointer p-0.5 text-[11.5px] font-bold leading-none font-inherit hover:scale-110 transition-transform"
                                            title="Hủy đăng ký ca trực này"
                                          >
                                            ✕
                                          </button>
                                        )}
                                      </div>
                                      {sched.chuyenMon && (
                                        <div className="text-[10px] text-[var(--text-muted)] italic font-medium">{sched.chuyenMon}</div>
                                      )}
                                      {sched.phongKham && (
                                        <div className="text-[11px] flex items-center gap-0.5 text-inherit font-bold mt-0.5">
                                          <MapPin size={10} /> {sched.phongKham}
                                        </div>
                                      )}
                                      {sched.ghiChu && (
                                        <div className="text-[10px] opacity-85 italic break-words mt-1 border-t border-dashed border-[rgba(3,105,161,0.15)] pt-1">{sched.ghiChu}</div>
                                      )}
                                    </div>
                                  );
                                })}

                                {hasLichBacSiAccess && (
                                  <button
                                    onClick={() => {
                                      const defaultMaNV = (userRole === 'BacSi' && currentUser) ? currentUser.maNV : (doctorsList[0]?.maNV || '');
                                      setDocForm({
                                        maNV: defaultMaNV,
                                        ngayLamViec: dateStr,
                                        caLamViec: 'Sang',
                                        phongKham: '',
                                        ghiChu: ''
                                      });
                                      setShowDocModal(true);
                                    }}
                                    className="w-full p-1.5 border border-dashed border-[var(--border-color)] rounded-[6px] bg-transparent text-[var(--text-muted)] text-[11px] cursor-pointer flex items-center justify-center gap-1 transition-all duration-200 ease-in-out hover:border-[var(--primary)] hover:text-[var(--primary)] hover:bg-[#f0f9ff] mt-auto font-inherit"
                                  >
                                    <Plus size={10} /> Đăng ký trực
                                  </button>
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>

                      {/* Dòng 2: Ca Chiều */}
                      <tr className="border-b border-[var(--border-color)]">
                        <td className="py-4 px-3 border-r border-[var(--border-color)] bg-[var(--bg-main)] text-center align-middle">
                          <div className="text-[14px] font-extrabold text-[#b45309]">Ca Chiều</div>
                          <div className="text-[11px] text-[var(--text-muted)] mt-1 font-semibold">13:30 - 17:00</div>
                        </td>
                        {weekDays.map((day, dayIdx) => {
                          const dateStr = getISODateString(day);
                          const isToday = dateStr === new Date().toISOString().split('T')[0];
                          const daySchedules = doctorSchedules.filter(s => s.ngayLamViec === dateStr && (s.caLamViec === 'Chieu' || s.caLamViec === 'CaNgay'));

                          return (
                            <td key={dayIdx} className={`py-3 px-2 border-r border-[var(--border-color)] align-top min-h-[220px] ${
                              isToday ? 'bg-[rgba(245,158,11,0.02)]' : 'bg-transparent'
                            }`}>
                              <div className="flex flex-col gap-2 h-full">
                                {daySchedules.map((sched) => {
                                  const isOwnSchedule = currentUser && currentUser.maNV === sched.maNV;
                                  const canDelete = hasLichBacSiAccess && (userRole === 'Admin' || userRole === 'LeTan' || isOwnSchedule);
                                  return (
                                    <div key={sched.maLich} className="p-2 rounded-md text-[11.5px] font-semibold relative border flex flex-col gap-1 shadow-sm bg-[#fef3c7] text-[#b45309] border-[#fde68a]">
                                      <div className="flex justify-between items-start gap-1">
                                        <div className="font-bold text-[12px] break-words flex-1 text-[#b45309]">
                                          {sched.tenBacSi}
                                        </div>
                                        {canDelete && (
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDeleteDoctorSchedule(sched.maLich, sched.tenBacSi);
                                            }}
                                            className="border-none bg-none text-[#ef4444] cursor-pointer p-0.5 text-[11.5px] font-bold leading-none font-inherit hover:scale-110 transition-transform"
                                            title="Hủy đăng ký ca trực này"
                                          >
                                            ✕
                                          </button>
                                        )}
                                      </div>
                                      {sched.chuyenMon && (
                                        <div className="text-[10px] text-[var(--text-muted)] italic font-medium">{sched.chuyenMon}</div>
                                      )}
                                      {sched.phongKham && (
                                        <div className="text-[11px] flex items-center gap-0.5 text-inherit font-bold mt-0.5">
                                          <MapPin size={10} /> {sched.phongKham}
                                        </div>
                                      )}
                                      {sched.ghiChu && (
                                        <div className="text-[10px] opacity-85 italic break-words mt-1 border-t border-dashed border-[rgba(180,83,9,0.15)] pt-1">{sched.ghiChu}</div>
                                      )}
                                    </div>
                                  );
                                })}

                                {hasLichBacSiAccess && (
                                  <button
                                    onClick={() => {
                                      const defaultMaNV = (userRole === 'BacSi' && currentUser) ? currentUser.maNV : (doctorsList[0]?.maNV || '');
                                      setDocForm({
                                        maNV: defaultMaNV,
                                        ngayLamViec: dateStr,
                                        caLamViec: 'Chieu',
                                        phongKham: '',
                                        ghiChu: ''
                                      });
                                      setShowDocModal(true);
                                    }}
                                    className="w-full p-1.5 border border-dashed border-[var(--border-color)] rounded-[6px] bg-transparent text-[var(--text-muted)] text-[11px] cursor-pointer flex items-center justify-center gap-1 transition-all duration-200 ease-in-out hover:border-[var(--primary)] hover:text-[var(--primary)] hover:bg-[#fffbeb] mt-auto font-inherit"
                                  >
                                    <Plus size={10} /> Đăng ký trực
                                  </button>
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    </tbody>
                  </table>
                </div>

              </div>
            )}
          </>
        )}

      </div>

      {/* MODAL THÊM LỊCH LÀM VIỆC BÁC SĨ */}
      {showDocModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] p-5">
          <div className="bg-white rounded-[10px] w-full max-w-[460px] shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1)] overflow-hidden">
            <div className="flex items-center justify-between py-3.5 px-5 border-b border-[var(--border-color)] bg-[var(--bg-main)]">
              <h3 className="text-[14.5px] font-extrabold m-0 flex items-center gap-1.5">
                <ShieldCheck size={18} className="text-[var(--primary)]" />
                Đăng Ký Ca Trực Bác Sĩ
              </h3>
              <button onClick={() => setShowDocModal(false)} className="bg-none border-none cursor-pointer text-[var(--text-muted)] text-[16px] font-inherit">✕</button>
            </div>

            <form onSubmit={handleAddDoctorSchedule} className="p-5 flex flex-col gap-3.5">
              <div className="form-group">
                <label className="form-label font-semibold mb-1.5 text-[13px]">Chọn Bác sĩ</label>
                <select
                  value={docForm.maNV}
                  onChange={(e) => setDocForm(prev => ({ ...prev, maNV: e.target.value }))}
                  className="form-input h-9 text-[13px] px-2.5 font-inherit"
                  required
                  disabled={userRole === 'BacSi'}
                >
                  {doctorsList.map(doc => (
                    <option key={doc.maNV} value={doc.maNV}>
                      {doc.hoTen} ({doc.chuyenMon || 'Bác sĩ'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label font-semibold mb-1.5 text-[13px]">Ngày làm việc</label>
                <input
                  type="date"
                  value={docForm.ngayLamViec}
                  onChange={(e) => setDocForm(prev => ({ ...prev, ngayLamViec: e.target.value }))}
                  className="form-input h-9 text-[13px] px-2.5 font-inherit"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label font-semibold mb-1.5 text-[13px]">Ca làm việc</label>
                <select
                  value={docForm.caLamViec}
                  onChange={(e) => setDocForm(prev => ({ ...prev, caLamViec: e.target.value }))}
                  className="form-input h-9 text-[13px] px-2.5 font-inherit"
                  required
                >
                  <option value="Sang">Ca Sáng (07:30 - 11:30)</option>
                  <option value="Chieu">Ca Chiều (13:30 - 17:00)</option>
                  <option value="CaNgay">Cả ngày (07:30 - 17:00)</option>
                </select>
              </div>



              <div className="form-group">
                <label className="form-label font-semibold mb-1.5 text-[13px]">Ghi chú công tác</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Khám nội nhi, Hội chẩn..."
                  value={docForm.ghiChu}
                  onChange={(e) => setDocForm(prev => ({ ...prev, ghiChu: e.target.value }))}
                  className="form-input h-9 text-[13px] px-2.5 font-inherit"
                />
              </div>

              <div className="flex gap-2.5 justify-end mt-4 items-center">
                <button 
                  type="button" 
                  onClick={() => setShowDocModal(false)} 
                  className="btn-outline whitespace-nowrap"
                  style={{ 
                    height: '38px', 
                    padding: '0 20px', 
                    margin: 0, 
                    boxSizing: 'border-box', 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontSize: '13px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Đóng lại
                </button>
                <button 
                  type="submit" 
                  className="btn-primary whitespace-nowrap"
                  style={{ 
                    height: '38px', 
                    padding: '0 20px', 
                    margin: 0, 
                    boxSizing: 'border-box', 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontSize: '13px',
                    width: 'auto',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Lưu Đăng Ký Trực
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default LichPhongKham;
