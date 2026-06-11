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
  { maNV: 'BS001', hoTen: 'BS. CK1. Nguyễn Văn An', chuyenMon: 'Nội tổng quát' },
  { maNV: 'BS002', hoTen: 'BS. CK2. Trần Thị Bình', chuyenMon: 'Tim mạch' },
  { maNV: 'BS003', hoTen: 'ThS. BS. Phạm Minh Cường', chuyenMon: 'Nhi khoa' },
  { maNV: 'BS004', hoTen: 'BS. Lê Hoài Nam', chuyenMon: 'Tai Mũi Họng' },
];

/**
 * Component Quản lý Lịch hẹn bệnh nhân và Lịch trực bác sĩ
 */
function LichPhongKham() {
  const navigate = useNavigate();
  const { showSuccess, showError, showWarning } = useToast();

  // Phân quyền: vai trò & quyền truy cập lịch làm việc bác sĩ
  const [userRole, setUserRole] = useState('');
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
      const currentUser = localStorage.getItem('currentUser');
      if (currentUser) {
        const parsed = JSON.parse(currentUser);
        const role = parsed.role || '';
        setUserRole(role);
        // Chỉ Admin và LeTan được quyền cấu hình lịch làm việc bác sĩ
        if (role === 'Admin' || role === 'LeTan') {
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
        const todayStr = new Date().toISOString().split('T')[0];
        const defaultDocSchedules = [
          {
            maLich: 'LBS001',
            maNV: 'BS001',
            tenBacSi: 'BS. CK1. Nguyễn Văn An',
            ngayLamViec: todayStr,
            caLamViec: 'Sang',
            phongKham: 'Phòng 101',
            ghiChu: 'Trực phòng nội'
          },
          {
            maLich: 'LBS002',
            maNV: 'BS002',
            tenBacSi: 'BS. CK2. Trần Thị Bình',
            ngayLamViec: todayStr,
            caLamViec: 'Chieu',
            phongKham: 'Phòng 102',
            ghiChu: 'Siêu âm tim'
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
    if (!phongKham.trim()) {
      showError('Vui lòng nhập tên/số Phòng khám!');
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

    const newSchedule = {
      maLich: `LBS${Date.now().toString().slice(-6)}`,
      maNV,
      tenBacSi,
      ngayLamViec,
      caLamViec,
      phongKham: phongKham.trim(),
      ghiChu: ghiChu.trim()
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
    <div className="kb-wrapper" style={styles.wrapper}>
      {/* Topbar điều hướng */}
      <div className="kb-topbar" style={styles.topbar}>
        <div style={styles.topbarLeft}>
          <button className="kb-back-btn" onClick={() => navigate('/')} style={styles.backBtn}>
            <ArrowLeft size={16} /> Quay về trang chủ
          </button>
        </div>
        <div className="kb-topbar-title" style={styles.topbarTitle}>
          <Calendar size={18} style={{ marginRight: '6px' }} />
          <strong>Quản Lý Lịch Hẹn & Lịch Làm Việc</strong>
        </div>
        <div style={styles.topbarRight}>
          <span>Trang chủ / Quản lý chung / Lịch hoạt động</span>
        </div>
      </div>

      {/* Tab Navigation header */}
      <div style={styles.tabNavHeader}>
        <div style={styles.tabGroup}>
          <button
            onClick={() => setActiveTab('appt')}
            style={styles.getTabStyle(activeTab === 'appt')}
          >
            Lịch Đặt Khám Bệnh Nhân ({appointments.length})
          </button>
          <button
            onClick={() => setActiveTab('doctor')}
            style={styles.getTabStyle(activeTab === 'doctor')}
          >
            Lịch Làm Việc Bác Sĩ
          </button>
        </div>

        {activeTab === 'doctor' && hasLichBacSiAccess && (
          <button
            onClick={() => {
              const tomorrow = new Date();
              tomorrow.setDate(tomorrow.getDate() + 1);
              setDocForm({
                maNV: doctorsList[0]?.maNV || '',
                ngayLamViec: getISODateString(tomorrow),
                caLamViec: 'Sang',
                phongKham: '',
                ghiChu: ''
              });
              setShowDocModal(true);
            }}
            className="btn-primary"
            style={styles.addDocBtn}
          >
            <Plus size={14} /> Thêm Lịch Làm Việc
          </button>
        )}
      </div>

      {/* Main Body Content */}
      <div style={styles.mainBody}>
        
        {/* TAB 1: LỊCH ĐẶT KHÁM BỆNH NHÂN */}
        {activeTab === 'appt' && (
          <div style={styles.tabApptContent}>
            {/* Thanh tìm kiếm & lọc */}
            <div style={styles.filterBar}>
              <div style={styles.searchContainer}>
                <input
                  type="text"
                  placeholder="Tìm kiếm bệnh nhân theo Tên hoặc Số điện thoại..."
                  value={apptFilters.search}
                  onChange={(e) => setApptFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="form-input"
                  style={styles.searchInput}
                />
                <Search size={14} style={styles.searchIcon} />
              </div>
              <div style={styles.dateFilterContainer}>
                <input
                  type="date"
                  value={apptFilters.date}
                  onChange={(e) => setApptFilters(prev => ({ ...prev, date: e.target.value }))}
                  className="form-input"
                  style={styles.dateInput}
                />
              </div>
              {(apptFilters.search || apptFilters.date) && (
                <button 
                  onClick={() => setApptFilters({ search: '', date: '' })} 
                  className="btn-outline" 
                  style={styles.clearFilterBtn}
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>

            {/* Bảng danh sách */}
            <div style={styles.tableWrapper}>
              {filteredAppts.length === 0 ? (
                <div style={styles.noData}>
                  <Calendar size={48} style={styles.noDataIcon} />
                  <p style={styles.noDataText}>Không tìm thấy lịch hẹn khám bệnh nào phù hợp.</p>
                </div>
              ) : (
                <table className="kb-table" style={styles.table}>
                  <thead>
                    <tr style={styles.tableHeaderRow}>
                      <th style={styles.thStt}>STT</th>
                      <th style={styles.thMaDatLich}>Mã đặt lịch</th>
                      <th style={styles.thHoTen}>Họ tên khách</th>
                      <th style={styles.thSdt}>Số điện thoại</th>
                      <th style={styles.thNgayHen}>Ngày hẹn khám</th>
                      <th style={styles.thYeuCau}>Yêu cầu khám bệnh</th>
                      <th style={styles.thTrangThai}>Trạng thái</th>
                      <th style={styles.thThaoTac}>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAppts.map((appt, i) => (
                      <tr key={appt.maDatLich} style={styles.tableBodyRow}>
                        <td style={styles.tdStt}>{i + 1}</td>
                        <td style={styles.tdMaDatLich}>{appt.maDatLich}</td>
                        <td style={styles.tdHoTen}>{appt.hoTenKhach}</td>
                        <td style={styles.tdSdt}>{appt.sdt}</td>
                        <td style={styles.tdNgayHen}>{appt.ngayHen}</td>
                        <td style={styles.tdYeuCau}>{appt.yeuCauKham}</td>
                        <td style={styles.tdTrangThai}>
                          <select
                            value={appt.trangThai}
                            onChange={(e) => handleUpdateStatus(appt.maDatLich, e.target.value)}
                            className="form-input"
                            style={styles.getStatusSelectStyle(appt.trangThai)}
                          >
                            <option value="ChoXacNhan">Chờ xác nhận</option>
                            <option value="DaXacNhan">Đã xác nhận</option>
                            <option value="DaKham">Đã khám</option>
                            <option value="DaHuy">Đã hủy</option>
                          </select>
                        </td>
                        <td style={styles.tdThaoTac}>
                          <button
                            onClick={() => handleReceivePatient(appt)}
                            className="btn-primary"
                            disabled={appt.trangThai === 'DaHuy' || appt.trangThai === 'DaKham'}
                            style={styles.getReceiveBtnStyle(appt.trangThai === 'DaHuy' || appt.trangThai === 'DaKham')}
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
              <div style={styles.restrictWrapper}>
                <ShieldAlert size={64} style={styles.restrictIcon} />
                <h3 style={styles.restrictTitle}>Giới Hạn Quyền Truy Cập</h3>
                <p style={styles.restrictDesc}>
                  Mục này chỉ dành cho <strong>Admin (Quản trị hệ thống)</strong> và <strong>Thư ký y khoa (Lễ tân)</strong> truy cập, sắp xếp và xem lịch làm việc của Bác sĩ. 
                  <br />
                  Vai trò hiện tại của bạn là <span style={styles.roleBadge}>{userRole || 'Không xác định'}</span> không được phép thao tác.
                </p>
                <button onClick={() => setActiveTab('appt')} className="btn-outline" style={styles.restrictBtn}>
                  Xem lịch đặt của bệnh nhân
                </button>
              </div>
            ) : (
              <div style={styles.tabApptContent}>
                
                {/* Thanh điều hướng Tuần & Ngày */}
                <div style={styles.weekNav}>
                  <div style={styles.weekNavBtnGroup}>
                    <button onClick={handlePrevWeek} className="btn-outline" style={styles.weekNavBtn}>
                      <ChevronLeft size={16} /> Tuần trước
                    </button>
                    <button onClick={handleCurrentWeek} className="btn-outline" style={styles.weekNavBtnThis}>
                      Tuần này
                    </button>
                    <button onClick={handleNextWeek} className="btn-outline" style={styles.weekNavBtn}>
                      Tuần sau <ChevronRight size={16} />
                    </button>
                  </div>
                  
                  <div style={styles.weekTitle}>
                    Từ {formatDateDMY(weekDays[0])} đến {formatDateDMY(weekDays[6])}
                  </div>

                  <div style={styles.weekLegend}>
                    <Calendar size={16} style={styles.weekLegendIcon} />
                    <span style={styles.weekLegendText}>Lịch trực theo tuần</span>
                  </div>
                </div>

                {/* Bảng dạng cột từ Thứ 2 đến Chủ nhật */}
                <div style={styles.tableWrapper}>
                  <table style={styles.gridTable}>
                    <thead>
                      <tr style={styles.tableHeaderRow}>
                        <th style={styles.gridThDoctor}>Bác sĩ \ Thứ & Ngày</th>
                        {weekDays.map((day, idx) => {
                          const dateStr = getISODateString(day);
                          const isToday = dateStr === new Date().toISOString().split('T')[0];
                          return (
                            <th key={idx} style={styles.getGridThDayStyle(isToday)}>
                              <div style={{ fontSize: '13px', fontWeight: '800' }}>{weekDaysNames[idx]}</div>
                              <div style={{ fontSize: '11px', opacity: 0.8, marginTop: '2px' }}>{formatDateDMY(day).slice(0, 5)}</div>
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {doctorsList.map((doc) => (
                        <tr key={doc.maNV} style={styles.tableBodyRow}>
                          <td style={styles.gridTdDoctor}>
                            <div style={styles.gridDocName}>{doc.hoTen}</div>
                            <div style={styles.gridDocMajor}>{doc.chuyenMon || 'Bác sĩ trực'}</div>
                            <div style={styles.gridDocId}>Mã: {doc.maNV}</div>
                          </td>

                          {weekDays.map((day, dayIdx) => {
                            const dateStr = getISODateString(day);
                            const isToday = dateStr === new Date().toISOString().split('T')[0];
                            const daySchedules = doctorSchedules.filter(s => s.maNV === doc.maNV && s.ngayLamViec === dateStr);

                            return (
                              <td key={dayIdx} style={styles.getGridTdDayStyle(isToday)}>
                                <div style={styles.schedContainer}>
                                  
                                  {daySchedules.map((sched) => (
                                    <div key={sched.maLich} style={styles.getSchedItemStyle(sched.caLamViec)}>
                                      <div style={styles.schedHeader}>
                                        <span style={styles.schedCaText}>
                                          {sched.caLamViec === 'Sang' ? 'Ca Sáng' : sched.caLamViec === 'Chieu' ? 'Ca Chiều' : 'Cả ngày'}
                                        </span>
                                        {hasLichBacSiAccess && (
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDeleteDoctorSchedule(sched.maLich, sched.tenBacSi);
                                            }}
                                            style={styles.schedDeleteBtn}
                                            title="Xóa ca trực này"
                                          >
                                            ✕
                                          </button>
                                        )}
                                      </div>
                                      <div style={styles.schedRoomInfo}>
                                        <MapPin size={10} /> {sched.phongKham}
                                      </div>
                                      {sched.ghiChu && (
                                        <div style={styles.schedNotes}>{sched.ghiChu}</div>
                                      )}
                                    </div>
                                  ))}

                                  {daySchedules.length === 0 && !hasLichBacSiAccess && (
                                    <div style={styles.schedEmptyPlaceholder}>-</div>
                                  )}

                                  {hasLichBacSiAccess && (
                                    <button
                                      onClick={() => {
                                        setDocForm({
                                          maNV: doc.maNV, ngayLamViec: dateStr, caLamViec: 'Sang', phongKham: '', ghiChu: ''
                                        });
                                        setShowDocModal(true);
                                      }}
                                      style={styles.quickAddBtn}
                                    >
                                      <Plus size={10} /> Trực
                                    </button>
                                  )}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
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
        <div style={styles.modalOverlay}>
          <div style={styles.modalContainer}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalHeaderTitle}>
                <ShieldCheck size={18} style={{ color: 'var(--primary)' }} />
                Sắp Lịch Làm Việc Bác Sĩ
              </h3>
              <button onClick={() => setShowDocModal(false)} style={styles.modalCloseBtn}>✕</button>
            </div>

            <form onSubmit={handleAddDoctorSchedule} style={styles.modalForm}>
              <div className="form-group">
                <label className="form-label" style={styles.modalLabel}>Chọn Bác sĩ</label>
                <select
                  value={docForm.maNV}
                  onChange={(e) => setDocForm(prev => ({ ...prev, maNV: e.target.value }))}
                  className="form-input"
                  style={styles.modalInput}
                  required
                >
                  {doctorsList.map(doc => (
                    <option key={doc.maNV} value={doc.maNV}>
                      {doc.hoTen} ({doc.chuyenMon || 'Bác sĩ'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={styles.modalLabel}>Ngày làm việc</label>
                <input
                  type="date"
                  value={docForm.ngayLamViec}
                  onChange={(e) => setDocForm(prev => ({ ...prev, ngayLamViec: e.target.value }))}
                  className="form-input"
                  style={styles.modalInput}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={styles.modalLabel}>Ca làm việc</label>
                <select
                  value={docForm.caLamViec}
                  onChange={(e) => setDocForm(prev => ({ ...prev, caLamViec: e.target.value }))}
                  className="form-input"
                  style={styles.modalInput}
                  required
                >
                  <option value="Sang">Ca Sáng (08:00 - 12:00)</option>
                  <option value="Chieu">Ca Chiều (13:30 - 17:30)</option>
                  <option value="CaNgay">Cả ngày (08:00 - 17:30)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={styles.modalLabel}>Phòng trực / Phòng khám</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Phòng 101, Phòng Nhi, Phòng Siêu âm..."
                  value={docForm.phongKham}
                  onChange={(e) => setDocForm(prev => ({ ...prev, phongKham: e.target.value }))}
                  className="form-input"
                  style={styles.modalInput}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={styles.modalLabel}>Ghi chú công tác</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Khám nội nhi, Hội chẩn..."
                  value={docForm.ghiChu}
                  onChange={(e) => setDocForm(prev => ({ ...prev, ghiChu: e.target.value }))}
                  className="form-input"
                  style={styles.modalInput}
                />
              </div>

              <div style={styles.modalActionGroup}>
                <button type="button" onClick={() => setShowDocModal(false)} className="btn-outline" style={styles.modalCancelBtn}>
                  Đóng lại
                </button>
                <button type="submit" className="btn-primary" style={styles.modalSubmitBtn}>
                  Lưu Lịch Làm Việc
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Bảng cấu hình CSS inline tập trung cho trang LichPhongKham
const styles = {
  wrapper: { height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', fontFamily: 'inherit' },
  topbar: { height: '50px', padding: '0 20px', flexShrink: 0, fontFamily: 'inherit' },
  topbarLeft: { flex: 1, display: 'flex', justifyContent: 'flex-start' },
  backBtn: { padding: '5px 10px', fontFamily: 'inherit' },
  topbarTitle: { flex: 1, display: 'flex', justifyContent: 'center', fontSize: '15px', fontFamily: 'inherit' },
  topbarRight: { flex: 1, display: 'flex', justifyContent: 'flex-end', fontSize: '12px', opacity: 0.85, fontFamily: 'inherit' },
  tabNavHeader: {
    display: 'flex',
    borderBottom: '1px solid var(--border-color)',
    backgroundColor: '#ffffff',
    padding: '0 20px',
    height: '46px',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexShrink: 0,
    fontFamily: 'inherit'
  },
  tabGroup: { display: 'flex', gap: '8px', height: '100%', fontFamily: 'inherit' },
  getTabStyle: (isActive) => ({
    padding: '0 20px',
    border: 'none',
    background: 'none',
    fontSize: '14px',
    fontWeight: isActive ? '800' : '500',
    color: isActive ? 'var(--primary)' : 'var(--text-muted)',
    borderBottom: isActive ? '3px solid var(--primary)' : 'none',
    cursor: 'pointer',
    height: '100%',
    fontFamily: 'inherit',
    transition: 'all 0.15s ease'
  }),
  addDocBtn: { 
    height: '32px', 
    fontSize: '12px', 
    padding: '0 12px', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '4px', 
    margin: 0, 
    width: 'auto', 
    marginTop: 0,
    fontFamily: 'inherit'
  },
  mainBody: { flex: 1, backgroundColor: 'var(--bg-main)', overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column' },
  tabApptContent: { backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' },
  filterBar: { padding: '12px 16px', display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)' },
  searchContainer: { flex: 1, position: 'relative' },
  searchInput: { paddingLeft: '32px', height: '34px', fontSize: '13px', fontFamily: 'inherit' },
  searchIcon: { position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' },
  dateFilterContainer: { width: '180px' },
  dateInput: { height: '34px', fontSize: '13px', fontFamily: 'inherit' },
  clearFilterBtn: { height: '34px', fontSize: '12.5px', margin: 0, padding: '0 12px', fontFamily: 'inherit' },
  tableWrapper: { flex: 1, overflowY: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
  tableHeaderRow: { background: 'var(--bg-main)', borderBottom: '2px solid var(--border-color)' },
  thStt: { width: '50px', textAlign: 'center', padding: '10px' },
  thMaDatLich: { width: '140px', padding: '10px' },
  thHoTen: { width: '160px', padding: '10px' },
  thSdt: { width: '110px', padding: '10px' },
  thNgayHen: { width: '110px', padding: '10px' },
  thYeuCau: { padding: '10px' },
  thTrangThai: { width: '140px', padding: '10px', textAlign: 'center' },
  thThaoTac: { width: '150px', padding: '10px', textAlign: 'center' },
  tableBodyRow: { borderBottom: '1px solid var(--border-color)' },
  tdStt: { textAlign: 'center', padding: '10px' },
  tdMaDatLich: { padding: '10px', fontWeight: '600' },
  tdHoTen: { padding: '10px', fontWeight: '700' },
  tdSdt: { padding: '10px' },
  tdNgayHen: { padding: '10px', fontWeight: '600' },
  tdYeuCau: { padding: '10px', color: 'var(--text-muted)' },
  tdTrangThai: { padding: '10px', textAlign: 'center' },
  tdThaoTac: { padding: '10px', textAlign: 'center' },
  getStatusSelectStyle: (status) => ({
    height: '28px',
    fontSize: '12px',
    padding: '2px 4px',
    width: '120px',
    fontWeight: '600',
    fontFamily: 'inherit',
    color: 
      status === 'DaXacNhan' ? '#10b981' : 
      status === 'DaKham' ? 'var(--primary)' : 
      status === 'DaHuy' ? '#ef4444' : '#6b7280'
  }),
  getReceiveBtnStyle: (disabled) => ({
    height: '28px',
    fontSize: '12px',
    padding: '0 10px',
    margin: 0,
    width: 'auto',
    marginTop: 0,
    fontFamily: 'inherit',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    opacity: disabled ? 0.5 : 1,
    cursor: disabled ? 'not-allowed' : 'pointer'
  }),
  noData: { padding: '40px', textAlign: 'center', color: 'var(--text-muted)' },
  noDataIcon: { strokeWidth: 1, color: 'var(--border-color)', marginBottom: '12px' },
  noDataText: { fontSize: '14px' },
  
  // RESTRICT ACCESS STYLES
  restrictWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 20px',
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    border: '1px solid var(--border-color)',
    textAlign: 'center',
    flex: 1
  },
  restrictIcon: { color: '#ef4444', strokeWidth: 1.2, marginBottom: '20px' },
  restrictTitle: { fontSize: '18px', fontWeight: '800', color: '#ef4444', marginBottom: '8px' },
  restrictDesc: { maxWidth: '480px', color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6' },
  roleBadge: { color: 'red', fontWeight: '600' },
  restrictBtn: { marginTop: '20px', fontFamily: 'inherit' },

  // WEEKLY GRID STYLES
  weekNav: {
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-main)'
  },
  weekNavBtnGroup: { display: 'flex', alignItems: 'center', gap: '8px' },
  weekNavBtn: { height: '34px', padding: '0 10px', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit' },
  weekNavBtnThis: { height: '34px', padding: '0 12px', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit' },
  weekTitle: { fontSize: '14.5px', fontWeight: '800', color: 'var(--primary)' },
  weekLegend: { display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.8 },
  weekLegendIcon: { color: 'var(--text-muted)' },
  weekLegendText: { fontSize: '13px', fontWeight: '500' },
  gridTable: { width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', minWidth: '1000px' },
  gridThDoctor: { width: '200px', padding: '12px 10px', borderRight: '1px solid var(--border-color)', textAlign: 'left', fontSize: '13px' },
  getGridThDayStyle: (isToday) => ({
    padding: '10px 6px',
    borderRight: '1px solid var(--border-color)',
    textAlign: 'center',
    backgroundColor: isToday ? 'var(--primary-light)' : 'transparent',
    color: isToday ? 'var(--primary)' : 'var(--text-main)'
  }),
  gridTdDoctor: {
    padding: '12px 10px',
    borderRight: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-main)',
    fontWeight: '600'
  },
  gridDocName: { fontSize: '13.5px', fontWeight: '800', color: 'var(--text-main)' },
  gridDocMajor: { fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' },
  gridDocId: { fontSize: '10px', color: 'var(--primary)', marginTop: '4px', fontStyle: 'italic' },
  getGridTdDayStyle: (isToday) => ({
    padding: '8px 6px',
    borderRight: '1px solid var(--border-color)',
    backgroundColor: isToday ? 'rgba(14, 165, 233, 0.03)' : 'transparent',
    verticalAlign: 'top',
    height: '110px'
  }),
  schedContainer: { display: 'flex', flexDirection: 'column', gap: '6px', height: '100%' },
  getSchedItemStyle: (caLamViec) => {
    const bg = caLamViec === 'Sang' ? '#e0f2fe' : caLamViec === 'Chieu' ? '#fef3c7' : '#dcfce7';
    const color = caLamViec === 'Sang' ? '#0369a1' : caLamViec === 'Chieu' ? '#b45309' : '#15803d';
    const border = caLamViec === 'Sang' ? '#bae6fd' : caLamViec === 'Chieu' ? '#fde68a' : '#bbf7d0';
    return {
      backgroundColor: bg,
      color: color,
      padding: '6px 8px',
      borderRadius: '6px',
      fontSize: '11.5px',
      fontWeight: '600',
      position: 'relative',
      border: '1px solid ' + border,
      display: 'flex',
      flexDirection: 'column',
      gap: '2px',
      boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
    };
  },
  schedHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  schedCaText: { fontSize: '11px', fontWeight: 'bold' },
  schedDeleteBtn: {
    border: 'none',
    background: 'none',
    color: '#ef4444',
    cursor: 'pointer',
    padding: '0 2px',
    fontSize: '11px',
    fontWeight: 'bold',
    lineHeight: 1,
    fontFamily: 'inherit'
  },
  schedRoomInfo: { fontSize: '11px', display: 'flex', alignItems: 'center', gap: '2px', color: 'inherit', fontWeight: 'bold', marginTop: '2px' },
  schedNotes: { fontSize: '10px', opacity: 0.8, fontStyle: 'italic', wordBreak: 'break-word', marginTop: '2px', borderTop: '1px dashed rgba(0,0,0,0.05)', paddingTop: '2px' },
  schedEmptyPlaceholder: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', fontSize: '12px' },
  quickAddBtn: {
    width: '100%',
    padding: '4px',
    border: '1px dashed var(--border-color)',
    borderRadius: '6px',
    backgroundColor: 'transparent',
    color: 'var(--text-muted)',
    fontSize: '11px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    transition: 'all 0.2s ease',
    marginTop: 'auto',
    fontFamily: 'inherit'
  },

  // MODAL FORM STYLES
  modalOverlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 200,
    padding: '20px'
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    width: '100%',
    maxWidth: '460px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden'
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 20px',
    borderBottom: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-main)'
  },
  modalHeaderTitle: { fontSize: '14.5px', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' },
  modalCloseBtn: { background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '16px', fontFamily: 'inherit' },
  modalForm: { padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' },
  modalLabel: { fontWeight: '600', marginBottom: '6px', fontSize: '13px' },
  modalInput: { height: '36px', fontSize: '13px', padding: '0 10px', fontFamily: 'inherit' },
  modalActionGroup: { display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' },
  modalCancelBtn: { height: '34px', padding: '0 16px', margin: 0, fontSize: '13px', fontFamily: 'inherit' },
  modalSubmitBtn: { height: '34px', padding: '0 20px', margin: 0, width: 'auto', marginTop: 0, fontSize: '13px', fontFamily: 'inherit' }
};

export default LichPhongKham;

