import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, User, Phone, FileText, Search, Clock, 
  History, UserCheck, ShieldAlert, ClipboardList, Pill, UserRound
} from 'lucide-react';
import { useToast } from '../utils/ToastContext';

/**
 * Component Cổng thông tin đặt lịch & tra cứu hồ sơ sức khỏe trực tuyến dành cho bệnh nhân (Public)
 */
function DatLichPublic() {
  const navigate = useNavigate();
  const { showSuccess, showError, showWarning } = useToast();

  const [activeTab, setActiveTab] = useState('book'); // tab hiện tại: 'book' (đăng ký) hoặc 'search' (tra cứu)

  // State biểu mẫu đăng ký lịch hẹn
  const [bookingForm, setBookingForm] = useState({
    hoTenKhach: '',
    sdt: '',
    ngayHen: '',
    yeuCauKham: ''
  });

  // State phục vụ việc tra cứu lịch sử bệnh án / lịch hẹn
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searched, setSearched] = useState(false);

  // Mặc định thiết lập ngày hẹn là ngày mai khi vào trang lần đầu
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const dd = String(tomorrow.getDate()).padStart(2, '0');
    setBookingForm(prev => ({ ...prev, ngayHen: `${yyyy}-${mm}-${dd}` }));
  }, []);

  // Xử lý thay đổi thông tin trên form đặt lịch
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingForm(prev => ({ ...prev, [name]: value }));
  };

  // Gửi thông tin đặt lịch khám trực tuyến
  const handleBookAppointment = (e) => {
    e.preventDefault();
    const { hoTenKhach, sdt, ngayHen, yeuCauKham } = bookingForm;

    if (!hoTenKhach.trim()) {
      showError('Vui lòng nhập họ tên người khám!');
      return;
    }
    if (!sdt.trim()) {
      showError('Vui lòng nhập số điện thoại liên hệ!');
      return;
    }
    const phoneRegex = /^(0\d{9})$/;
    if (!phoneRegex.test(sdt.trim())) {
      showError('Số điện thoại không hợp lệ (phải gồm 10 chữ số bắt đầu bằng số 0)!');
      return;
    }
    if (!ngayHen) {
      showError('Vui lòng chọn ngày hẹn khám!');
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    if (ngayHen < todayStr) {
      showWarning('Ngày hẹn khám không thể ở trong quá khứ!');
      return;
    }

    // Tạo mã lịch đặt ngẫu nhiên: DL_yymmdd_RANDOM
    const nextCode = `DL_${new Date().toISOString().slice(2, 10).replace(/-/g, '')}_${String(Math.floor(100 + Math.random() * 900))}`;
    const newAppointment = {
      maDatLich: nextCode,
      hoTenKhach: hoTenKhach.trim().toUpperCase(),
      sdt: sdt.trim(),
      ngayHen: ngayHen,
      yeuCauKham: yeuCauKham.trim() || 'Khám tổng quát',
      trangThai: 'ChoXacNhan',
      ngayTao: new Date().toISOString()
    };

    try {
      const existing = JSON.parse(localStorage.getItem('danhSachDatLich') || '[]');
      const updated = [...existing, newAppointment];
      localStorage.setItem('danhSachDatLich', JSON.stringify(updated));

      showSuccess(`Đặt lịch hẹn khám thành công! Mã hẹn của bạn là: ${nextCode}`);
      
      // Chuyển sang tab tra cứu và điền sẵn mã
      setSearchQuery(nextCode);
      setActiveTab('search');
      
      setSearchResult({
        patient: {
          maBN: 'Chưa có (Chờ tiếp đón)',
          hoTen: newAppointment.hoTenKhach,
          sdt: newAppointment.sdt,
          ngaySinh: 'N/A',
          gioiTinh: 'N/A',
          diaChi: 'N/A',
          tienSuBenh: 'N/A'
        },
        visits: [],
        appointments: [newAppointment]
      });
      setSearched(true);

      // Reset form biểu mẫu
      setBookingForm({
        hoTenKhach: '',
        sdt: '',
        ngayHen: ngayHen,
        yeuCauKham: ''
      });
    } catch (err) {
      console.error(err);
      showError('Không thể lưu lịch hẹn vào bộ nhớ!');
    }
  };

  // Tra cứu thông tin hồ sơ bệnh án hoặc lịch hẹn dựa vào mã
  const handleSearch = (e) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      showError('Vui lòng nhập Mã người bệnh hoặc Mã hồ sơ để tra cứu!');
      return;
    }

    try {
      const allPhieuKham = JSON.parse(localStorage.getItem('danhSachPhieuKham') || '[]');
      const allDatLich = JSON.parse(localStorage.getItem('danhSachDatLich') || '[]');

      // Tìm kiếm phiếu khám tương ứng mã bệnh nhân hoặc mã phiếu
      const matchedVisits = allPhieuKham.filter(visit => 
        (visit.maBN || '').toLowerCase() === query ||
        (visit.maPhieu || '').toLowerCase() === query
      );

      let matchedAppts = [];
      let patientInfo = null;

      if (matchedVisits.length > 0) {
        const first = matchedVisits[0];
        patientInfo = {
          maBN: first.maBN || 'N/A',
          hoTen: first.hoTen,
          ngaySinh: first.ngaySinh,
          gioiTinh: first.gioiTinh,
          sdt: first.sdt,
          diaChi: first.diaChi,
          tienSuBenh: first.tienSuBenh
        };
        // Tìm lịch đặt khám theo SĐT bệnh nhân này
        matchedAppts = allDatLich.filter(appt => appt.sdt === patientInfo.sdt);
      } else {
        // Tìm trực tiếp trong danh sách lịch hẹn đặt khám trực tuyến
        matchedAppts = allDatLich.filter(appt => 
          appt.maDatLich.toLowerCase() === query ||
          appt.sdt === query
        );

        if (matchedAppts.length > 0) {
          const first = matchedAppts[0];
          patientInfo = {
            maBN: 'Chưa có (Chờ tiếp đón)',
            hoTen: first.hoTenKhach,
            sdt: first.sdt,
            ngaySinh: 'N/A',
            gioiTinh: 'N/A',
            diaChi: 'N/A',
            tienSuBenh: 'N/A'
          };
        }
      }

      if (patientInfo) {
        setSearchResult({
          patient: patientInfo,
          visits: matchedVisits.sort((a, b) => new Date(b.ngayKham) - new Date(a.ngayKham)),
          appointments: matchedAppts.sort((a, b) => new Date(b.ngayHen) - new Date(a.ngayHen))
        });
        showSuccess('Tìm thấy thông tin hồ sơ sức khỏe người bệnh!');
      } else {
        setSearchResult(null);
        showWarning('Không tìm thấy thông tin bệnh án hoặc lịch hẹn nào phù hợp!');
      }
      setSearched(true);
    } catch (err) {
      console.error(err);
      showError('Có lỗi xảy ra khi tra cứu dữ liệu!');
    }
  };

  // Trả về badge trạng thái khám bệnh
  const getStatusBadge = (status) => {
    switch (status) {
      case 0:
        return <span className="status-badge status-waiting">Chờ khám</span>;
      case 1:
        return <span className="status-badge status-active">Đang khám</span>;
      case 2:
        return <span className="status-badge status-completed" style={{ background: '#f59e0b', color: '#fff' }}>Chờ thanh toán</span>;
      case 3:
        return <span className="status-badge status-completed">Đã hoàn thành</span>;
      default:
        return <span className="status-badge status-waiting">Chờ xử lý</span>;
    }
  };

  // Trả về badge trạng thái lịch hẹn đặt khám
  const getApptStatusBadge = (status) => {
    switch (status) {
      case 'ChoXacNhan':
        return <span className="status-badge status-waiting" style={styles.badgeWait}>Chờ xác nhận</span>;
      case 'DaXacNhan':
        return <span className="status-badge status-active">Đã xác nhận</span>;
      case 'DaKham':
        return <span className="status-badge status-completed">Đã khám</span>;
      case 'DaHuy':
        return <span className="status-badge status-danger" style={styles.badgeCancel}>Đã hủy</span>;
      default:
        return <span className="status-badge status-waiting">Chờ xử lý</span>;
    }
  };

  return (
    <div style={styles.container}>
      {/* 1. Header & Navigation */}
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div style={styles.logoContainer} onClick={() => navigate('/dat-lich-kham')}>
            <div style={styles.logoIcon}>NT</div>
            <div>
              <h1 style={styles.logoText}>PHÒNG KHÁM ĐA KHOA NHẬT TẢO</h1>
              <p style={styles.logoSubtext}>Cổng thông tin Đăng ký & Tra cứu y khoa trực tuyến</p>
            </div>
          </div>
          <div style={styles.headerRight}>
            <span>Hotline: <strong style={{ color: 'var(--primary)' }}>1900 6868</strong></span>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section style={styles.hero}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={styles.heroTitle}>Chào mừng bạn đến với Cổng y tế trực tuyến</h2>
          <p style={styles.heroSub}>
            Nhanh chóng đăng ký lịch hẹn khám và chủ động quản lý, tra cứu hồ sơ bệnh án cá nhân chỉ với vài bước đơn giản.
          </p>

          {/* Các tab chuyển hướng */}
          <div style={styles.tabsContainer}>
            <button
              onClick={() => setActiveTab('book')}
              style={{
                ...styles.tabBtn,
                backgroundColor: activeTab === 'book' ? '#ffffff' : 'transparent',
                color: activeTab === 'book' ? 'var(--primary)' : '#ffffff'
              }}
            >
              <Calendar size={16} /> Đăng ký đặt lịch khám
            </button>
            <button
              onClick={() => setActiveTab('search')}
              style={{
                ...styles.tabBtn,
                backgroundColor: activeTab === 'search' ? '#ffffff' : 'transparent',
                color: activeTab === 'search' ? 'var(--primary)' : '#ffffff'
              }}
            >
              <Search size={16} /> Tra cứu bệnh án & Lịch hẹn
            </button>
          </div>
        </div>
      </section>

      {/* 3. Vùng xử lý chính */}
      <main style={styles.mainContent}>
        
        {/* TAB 1: ĐẶT LỊCH HẸN KHÁM */}
        {activeTab === 'book' && (
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={styles.cardIconBox}>
                <UserCheck size={20} />
              </div>
              <div>
                <h3 style={styles.cardTitle}>ĐĂNG KÝ HỒ SƠ ĐẶT HẸN KHÁM BỆNH</h3>
                <p style={styles.cardSub}>Thông tin lịch hẹn sẽ được gửi đến bộ phận Tiếp đón của phòng khám</p>
              </div>
            </div>

            <div style={{ padding: '32px 24px' }}>
              <form onSubmit={handleBookAppointment} style={styles.bookingFormGrid}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={styles.formLabelBold}>
                    <User size={14} style={{ color: 'var(--text-muted)' }} /> Họ tên người bệnh <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="hoTenKhach"
                    value={bookingForm.hoTenKhach}
                    onChange={handleInputChange}
                    placeholder="Nhập đầy đủ họ và tên của bạn..."
                    className="form-input"
                    style={styles.formInputName}
                    required
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={styles.formLabelBold}>
                    <Phone size={14} style={{ color: 'var(--text-muted)' }} /> Số điện thoại liên lạc <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input
                    type="tel"
                    name="sdt"
                    value={bookingForm.sdt}
                    onChange={handleInputChange}
                    placeholder="Nhập số điện thoại (ví dụ: 0912345678)..."
                    className="form-input"
                    style={{ height: '40px', fontSize: '13.5px' }}
                    required
                  />
                </div>

                <div className="form-group" style={styles.gridSpan2}>
                  <label className="form-label" style={styles.formLabelBold}>
                    <Calendar size={14} style={{ color: 'var(--text-muted)' }} /> Chọn ngày hẹn khám bệnh <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input
                    type="date"
                    name="ngayHen"
                    value={bookingForm.ngayHen}
                    onChange={handleInputChange}
                    className="form-input"
                    style={{ height: '40px', fontSize: '13.5px' }}
                    required
                  />
                </div>

                <div className="form-group" style={styles.gridSpan2}>
                  <label className="form-label" style={styles.formLabelBold}>
                    <FileText size={14} style={{ color: 'var(--text-muted)' }} /> Lý do khám / Triệu chứng bệnh lý
                  </label>
                  <textarea
                    name="yeuCauKham"
                    value={bookingForm.yeuCauKham}
                    onChange={handleInputChange}
                    placeholder="Vui lòng miêu tả ngắn gọn triệu chứng hoặc nhu cầu khám (ví dụ: Đau họng, khám sức khỏe định kỳ)..."
                    className="form-input"
                    style={styles.textArea}
                  />
                </div>

                <div style={styles.bookingActions}>
                  <button
                    type="button"
                    onClick={() => setBookingForm(prev => ({ ...prev, hoTenKhach: '', sdt: '', yeuCauKham: '' }))}
                    className="btn-outline"
                    style={styles.resetBtn}
                  >
                    Nhập lại
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    style={styles.submitBtn}
                  >
                    Gửi Đăng Ký Đặt Lịch
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB 2: TRA CỨU HỒ SƠ Y TẾ */}
        {activeTab === 'search' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Thanh Tìm kiếm */}
            <div style={styles.searchCard}>
              <h3 style={styles.searchTitle}>TRA CỨU HỒ SƠ BỆNH ÁN & LỊCH HẸN TRỰC TUYẾN</h3>
              <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="Điền mã người bệnh (BN...) hoặc mã hồ sơ khám (PK...)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="form-input"
                    style={styles.searchBarInput}
                  />
                  <Search size={18} style={styles.searchBarIcon} />
                </div>
                <button type="submit" className="btn-primary" style={styles.searchSubmit}>
                  Tìm Kiếm
                </button>
              </form>
            </div>

            {/* Hiển thị chi tiết Kết quả */}
            {!searched ? (
              <div style={styles.noSearchState}>
                <ClipboardList size={54} style={styles.noSearchIcon} />
                <h4 style={styles.noSearchTitle}>Vui lòng nhập thông tin tra cứu</h4>
                <p style={styles.noSearchText}>
                  Nhập chính xác mã người bệnh (BN...) hoặc mã hồ sơ khám bệnh (PK...) được ghi trên phiếu tiếp nhận để xem kết quả chẩn đoán và đơn thuốc.
                </p>
              </div>
            ) : searchResult ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                
                {/* 1. Thông tin bệnh nhân */}
                <div style={styles.resultCard}>
                  <div style={styles.resultCardHeader}>
                    <UserRound size={18} style={{ color: 'var(--primary)' }} />
                    <strong style={styles.resultCardTitle}>HỒ SƠ HÀNH CHÍNH NGƯỜI BỆNH</strong>
                  </div>
                  <div style={{ padding: '24px' }}>
                    <div style={styles.patientGrid}>
                      <div><strong>Họ và tên:</strong> <span style={styles.patientName}>{searchResult.patient.hoTen}</span></div>
                      <div><strong>Mã người bệnh:</strong> <span style={{ fontWeight: '600' }}>{searchResult.patient.maBN}</span></div>
                      <div><strong>Ngày sinh:</strong> {searchResult.patient.ngaySinh || 'N/A'}</div>
                      <div><strong>Giới tính:</strong> {searchResult.patient.gioiTinh || 'N/A'}</div>
                      <div><strong>Số điện thoại:</strong> {searchResult.patient.sdt}</div>
                      <div><strong>Địa chỉ:</strong> {searchResult.patient.diaChi || 'N/A'}</div>
                      <div style={styles.patientHistoryRow}>
                        <strong>Tiền sử bệnh lý cá nhân:</strong>{' '}
                        <span style={{ color: '#ef4444', fontWeight: '600' }}>{searchResult.patient.tienSuBenh || 'Không'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Lịch đặt khám sắp tới */}
                <div style={styles.resultCard}>
                  <div style={styles.resultCardHeader}>
                    <Clock size={18} style={{ color: 'var(--primary)' }} />
                    <strong style={styles.resultCardTitle}>LỊCH HẸN ĐÃ ĐĂNG KÝ ({searchResult.appointments.length})</strong>
                  </div>
                  <div style={{ padding: '20px' }}>
                    {searchResult.appointments.length === 0 ? (
                      <div style={styles.noDataText}>
                        Người bệnh hiện không có lịch hẹn trực tuyến nào.
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gap: '12px' }}>
                        {searchResult.appointments.map((appt, i) => (
                          <div key={i} style={styles.apptItem}>
                            <div>
                              <div style={{ fontWeight: '700', fontSize: '14.5px', color: 'var(--text-main)', marginBottom: '4px' }}>
                                Ngày hẹn khám: {appt.ngayHen}
                              </div>
                              <div style={{ color: 'var(--text-muted)', fontSize: '12.5px' }}>
                                Mã đặt lịch: <strong style={{ color: 'var(--text-main)' }}>{appt.maDatLich}</strong> | Lý do khám: {appt.yeuCauKham}
                              </div>
                            </div>
                            <div>{getApptStatusBadge(appt.trangThai)}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. Lịch sử thăm khám & điều trị bệnh */}
                <div style={styles.resultCard}>
                  <div style={styles.resultCardHeader}>
                    <History size={18} style={{ color: 'var(--primary)' }} />
                    <strong style={styles.resultCardTitle}>HỒ SƠ LỊCH SỬ CHỮA BỆNH ({searchResult.visits.length})</strong>
                  </div>
                  <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {searchResult.visits.length === 0 ? (
                      <div style={styles.noDataText}>
                        Chưa tìm thấy lịch sử hồ sơ bệnh án cũ của bệnh nhân này.
                      </div>
                    ) : (
                      searchResult.visits.map((visit, i) => (
                        <div key={i} style={styles.visitItem}>
                          {/* Mã phiếu & Ngày khám */}
                          <div style={styles.visitItemHeader}>
                            <span style={{ fontWeight: '800', color: 'var(--primary)', fontSize: '14px' }}>MÃ HỒ SƠ: {visit.maPhieu}</span>
                            <span style={styles.visitTime}>
                              <Clock size={13} /> {new Date(visit.ngayKham).toLocaleDateString('vi-VN')} {new Date(visit.ngayKham).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          {/* Chi tiết hồ sơ bệnh */}
                          <div style={styles.visitGrid}>
                            <div>
                              <strong>Bác sĩ chuyên khoa khám:</strong>
                              <p style={styles.visitDocText}>{visit.tenBacSi}</p>
                            </div>
                            <div>
                              <strong>Trạng thái hồ sơ:</strong>
                              <div style={{ marginTop: '4px' }}>{getStatusBadge(visit.trangThai)}</div>
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                              <strong>Triệu chứng / Lý do nhập viện khám:</strong>
                              <p style={styles.visitReasonText}>{visit.lyDoKham}</p>
                            </div>
                            
                            {/* Kết luận & chẩn đoán bệnh */}
                            <div style={styles.visitSectionBorder}>
                              <strong>Chẩn đoán bệnh (ICD):</strong>
                              <p style={styles.diagnosisText}>
                                {visit.maICD ? `${visit.maICD} - ${visit.tenBenhICD}` : (visit.chanDoan || 'Chưa có kết luận chẩn đoán')}
                              </p>
                            </div>

                            {/* Chỉ định cận lâm sàng */}
                            <div style={styles.visitSectionBorder}>
                              <strong style={styles.subSectionTitle}>
                                <ClipboardList size={14} style={{ color: 'var(--primary)' }} />
                                Danh mục Xét nghiệm & Cận lâm sàng chỉ định
                              </strong>
                              {!visit.chiDinh || visit.chiDinh.length === 0 ? (
                                <p style={styles.emptyText}>Không có chỉ định cận lâm sàng.</p>
                              ) : (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                  {visit.chiDinh.map((item, idx) => (
                                    <span key={idx} style={styles.clsBadge}>
                                      {item.tenXN}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Toa thuốc kê */}
                            <div style={styles.visitSectionBorder}>
                              <strong style={styles.subSectionTitleGreen}>
                                <Pill size={14} style={{ color: '#10b981' }} />
                                Đơn thuốc được bác sĩ kê toa
                              </strong>
                              {!visit.donThuoc || visit.donThuoc.length === 0 ? (
                                <p style={styles.emptyText}>Không có đơn thuốc nào được kê.</p>
                              ) : (
                                <table style={styles.medTable}>
                                  <thead>
                                    <tr style={styles.medTableHeader}>
                                      <th style={styles.medTh}>Tên thuốc</th>
                                      <th style={styles.medThCenter}>Số lượng</th>
                                      <th style={styles.medThCenter}>Số ngày</th>
                                      <th style={styles.medTh}>Hướng dẫn sử dụng</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {visit.donThuoc.map((med, idx) => (
                                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '8px', fontWeight: '600' }}>{med.tenThuoc}</td>
                                        <td style={{ padding: '8px', textAlign: 'center' }}>{med.soLuong}</td>
                                        <td style={{ padding: '8px', textAlign: 'center' }}>{med.soNgay} ngày</td>
                                        <td style={{ padding: '8px', color: 'var(--text-muted)' }}>{med.cachDung || 'Uống theo chỉ dẫn'}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              )}
                            </div>

                            {/* Lời dặn dò */}
                            {visit.loiDan && (
                              <div style={styles.adviceRow}>
                                <strong>* Lời dặn từ bác sĩ điều trị:</strong> {visit.loiDan}
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            ) : (
              <div style={styles.searchErrorBox}>
                <ShieldAlert size={54} style={styles.searchErrorIcon} />
                <h4 style={styles.searchErrorTitle}>Không tìm thấy hồ sơ người bệnh</h4>
                <p style={styles.searchErrorText}>
                  Không tìm thấy thông tin bệnh án hay lịch đặt lịch khám nào trùng khớp với mã bạn vừa điền. Vui lòng kiểm tra lại chính xác.
                </p>
              </div>
            )}
          </div>
        )}

      </main>

      {/* 4. Footer */}
      <footer style={styles.footer}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <strong style={styles.footerBrand}>PHÒNG KHÁM ĐA KHOA NHẬT TẢO</strong>
          <p style={{ margin: '4px 0' }}>Địa chỉ: 123 Đường Nhật Tảo, Phường 4, Quận 10, TP. Hồ Chí Minh</p>
          <p style={{ margin: '4px 0' }}>Email: contact@nhattaoclinic.vn | Hotline hỗ trợ: 1900 6868</p>
          <p style={styles.footerCopy}>&copy; {new Date().getFullYear()} Phòng khám đa khoa Nhật Tảo. Bảo lưu mọi quyền.</p>
        </div>
      </footer>
    </div>
  );
}

// Bảng cấu hình CSS Inline tối ưu hóa giao diện trang Đăng ký/Tra cứu
const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f8fafc' },
  header: {
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    padding: '12px 24px',
    position: 'sticky',
    top: 0,
    zIndex: 50,
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
  },
  headerInner: { maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  logoContainer: { display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' },
  logoIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    backgroundColor: 'var(--primary)',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '20px'
  },
  logoText: { fontSize: '16px', fontWeight: '850', color: 'var(--primary)', margin: 0 },
  logoSubtext: { fontSize: '11px', color: 'var(--text-muted)', margin: 0 },
  headerRight: { display: 'flex', gap: '20px', fontSize: '13.5px', fontWeight: '600' },
  hero: {
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    color: '#ffffff',
    padding: '48px 24px',
    textAlign: 'center'
  },
  heroTitle: { fontSize: '28px', fontWeight: '850', marginBottom: '12px', letterSpacing: '-0.5px' },
  heroSub: { fontSize: '15px', opacity: 0.85, marginBottom: '24px', fontWeight: '400', lineHeight: '1.6' },
  tabsContainer: {
    display: 'inline-flex',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: '6px',
    borderRadius: '12px',
    gap: '8px'
  },
  tabBtn: {
    padding: '10px 24px',
    borderRadius: '8px',
    border: 'none',
    fontWeight: '700',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  mainContent: { maxWidth: '1000px', margin: '40px auto', padding: '0 20px', paddingBottom: '80px' },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
    border: '1px solid #e2e8f0',
    overflow: 'hidden'
  },
  cardHeader: {
    padding: '20px 24px',
    borderBottom: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  cardIconBox: {
    padding: '8px',
    borderRadius: '8px',
    backgroundColor: 'var(--primary-light)',
    color: 'var(--primary)'
  },
  cardTitle: { fontSize: '16px', fontWeight: '800', margin: 0, color: 'var(--text-main)' },
  cardSub: { fontSize: '12px', color: 'var(--text-muted)', margin: 0 },
  bookingFormGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' },
  formLabelBold: { fontWeight: '700', fontSize: '13px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' },
  formInputName: { textTransform: 'uppercase', height: '40px', fontSize: '13.5px' },
  gridSpan2: { margin: 0, gridColumn: 'span 2' },
  textArea: { minHeight: '120px', resize: 'vertical', fontFamily: 'inherit', padding: '12px', fontSize: '13.5px' },
  bookingActions: { gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '12px' },
  resetBtn: { height: '42px', padding: '0 24px', fontSize: '13.5px', fontWeight: '700' },
  submitBtn: { height: '42px', padding: '0 32px', fontSize: '13.5px', fontWeight: '700', width: 'auto', marginTop: 0 },
  
  // Tab Tra Cứu CSS
  searchCard: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
    border: '1px solid #e2e8f0'
  },
  searchTitle: { fontSize: '15px', fontWeight: '850', color: 'var(--text-main)', marginBottom: '16px' },
  searchBarInput: { paddingLeft: '40px', height: '44px', width: '100%', fontSize: '14px' },
  searchBarIcon: { position: 'absolute', left: '14px', top: '13px', color: 'var(--text-muted)' },
  searchSubmit: { height: '44px', padding: '0 28px', margin: 0, display: 'flex', alignItems: 'center', fontSize: '14px', fontWeight: '700', width: 'auto', marginTop: 0, flexShrink: 0 },
  noSearchState: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '48px 24px',
    border: '1px solid #e2e8f0',
    textAlign: 'center',
    color: 'var(--text-muted)'
  },
  noSearchIcon: { strokeWidth: 1, color: 'var(--primary-light)', marginBottom: '16px' },
  noSearchTitle: { fontWeight: '800', fontSize: '16px', color: 'var(--text-main)', marginBottom: '6px' },
  noSearchText: { maxWidth: '400px', margin: '0 auto', fontSize: '13px', lineHeight: '1.6' },
  
  // Kết quả chi tiết CSS
  resultCard: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
    overflow: 'hidden'
  },
  resultCardHeader: { padding: '16px 24px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', gap: '10px' },
  resultCardTitle: { fontSize: '14px', fontWeight: '800', color: 'var(--text-main)' },
  patientGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px 32px', fontSize: '13.5px' },
  patientName: { color: 'var(--primary)', fontWeight: '750', textTransform: 'uppercase' },
  patientHistoryRow: { gridColumn: '1 / -1', borderTop: '1px dashed #e2e8f0', paddingTop: '12px', marginTop: '4px' },
  noDataText: { padding: '24px', border: '1px dashed #cbd5e1', borderRadius: '8px', color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center' },
  apptItem: {
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fafafa'
  },
  badgeWait: { background: '#cbd5e1', color: '#475569' },
  badgeCancel: { background: '#fee2e2', color: '#ef4444' },
  
  // Visit history items CSS
  visitItem: {
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '20px',
    backgroundColor: '#ffffff',
    boxShadow: '0 2px 8px rgba(0,0,0,0.015)'
  },
  visitItemHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', marginBottom: '16px' },
  visitTime: { fontSize: '12.5px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' },
  visitGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 24px', fontSize: '13px', color: 'var(--text-main)' },
  visitDocText: { margin: '4px 0 0 0', fontWeight: '600', fontSize: '13.5px', color: 'var(--primary)' },
  visitReasonText: { margin: '4px 0 0 0', color: 'var(--text-main)', fontSize: '13px', backgroundColor: '#f8fafc', padding: '8px 12px', borderRadius: '6px' },
  visitSectionBorder: { gridColumn: 'span 2', borderTop: '1px solid #f1f5f9', paddingTop: '12px' },
  diagnosisText: { margin: '4px 0 0 0', fontSize: '13.5px', color: '#ef4444', fontWeight: '700' },
  subSectionTitle: { display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' },
  subSectionTitleGreen: { display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' },
  emptyText: { margin: 0, fontStyle: 'italic', color: 'var(--text-muted)' },
  clsBadge: {
    backgroundColor: 'var(--primary-light)',
    color: 'var(--primary)',
    padding: '4px 10px',
    borderRadius: '15px',
    fontSize: '12px',
    fontWeight: '600'
  },
  medTable: { width: '100%', borderCollapse: 'collapse', marginTop: '8px' },
  medTableHeader: { background: '#f8fafc', textAlign: 'left', borderBottom: '1px solid #e2e8f0' },
  medTh: { padding: '8px', fontSize: '12px', fontWeight: '700' },
  medThCenter: { padding: '8px', fontSize: '12px', fontWeight: '700', width: '90px', textAlign: 'center' },
  adviceRow: { gridColumn: 'span 2', borderTop: '1px solid #f1f5f9', paddingTop: '12px', color: 'var(--text-muted)', fontSize: '12.5px', fontStyle: 'italic' },
  
  // Search error Box CSS
  searchErrorBox: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '48px 24px',
    border: '1px solid #e2e8f0',
    textAlign: 'center',
    color: 'var(--text-muted)'
  },
  searchErrorIcon: { strokeWidth: 1, color: '#f87171', marginBottom: '16px' },
  searchErrorTitle: { fontWeight: '800', fontSize: '16px', color: '#ef4444', marginBottom: '6px' },
  searchErrorText: { maxWidth: '360px', margin: '0 auto', fontSize: '13px', lineHeight: '1.6' },

  // Footer CSS
  footer: {
    backgroundColor: '#0f172a',
    color: '#94a3b8',
    padding: '30px 24px',
    textAlign: 'center',
    borderTop: '1px solid #1e293b',
    fontSize: '13px'
  },
  footerBrand: { color: '#ffffff', fontSize: '14px', display: 'block', marginBottom: '6px' },
  footerCopy: { margin: '20px 0 0 0', fontSize: '11px', opacity: 0.6 }
};

export default DatLichPublic;
