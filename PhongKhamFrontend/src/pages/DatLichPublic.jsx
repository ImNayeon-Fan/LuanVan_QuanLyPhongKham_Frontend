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
        return <span className="status-badge status-completed bg-[#f59e0b] text-white">Chờ thanh toán</span>;
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
        return <span className="status-badge status-waiting bg-[#cbd5e1] text-[#475569]">Chờ xác nhận</span>;
      case 'DaXacNhan':
        return <span className="status-badge status-active">Đã xác nhận</span>;
      case 'DaKham':
        return <span className="status-badge status-completed">Đã khám</span>;
      case 'DaHuy':
        return <span className="status-badge status-danger bg-[#fee2e2] text-[#ef4444]">Đã hủy</span>;
      default:
        return <span className="status-badge status-waiting">Chờ xử lý</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 1. Header & Navigation */}
      <header className="bg-white border-b border-slate-200 py-3 px-6 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1200px] mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/dat-lich-kham')}>
            <div className="w-10 h-10 rounded-lg bg-[var(--primary)] text-white flex items-center justify-center font-bold text-xl">NT</div>
            <div>
              <h1 className="text-base font-[850] text-[var(--primary)] m-0">PHÒNG KHÁM ĐA KHOA NHẬT TẢO</h1>
              <p className="text-[11px] text-[var(--text-muted)] m-0">Cổng thông tin Đăng ký & Tra cứu y khoa trực tuyến</p>
            </div>
          </div>
          <div className="flex gap-5 text-[13.5px] font-semibold">
            <span>Hotline: <strong className="text-[var(--primary)]">1900 6868</strong></span>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-white py-12 px-6 text-center">
        <div className="max-w-[800px] mx-auto">
          <h2 className="text-[28px] font-[850] mb-3 tracking-[-0.5px]">Chào mừng bạn đến với Cổng y tế trực tuyến</h2>
          <p className="text-[15px] opacity-85 mb-6 font-normal leading-relaxed">
            Nhanh chóng đăng ký lịch hẹn khám và chủ động quản lý, tra cứu hồ sơ bệnh án cá nhân chỉ với vài bước đơn giản.
          </p>

          {/* Các tab chuyển hướng */}
          <div className="inline-flex bg-white/10 p-1.5 rounded-xl gap-2">
            <button
              onClick={() => setActiveTab('book')}
              className={`py-2.5 px-6 rounded-lg border-none font-bold text-sm cursor-pointer transition-all duration-200 ease-in-out flex items-center gap-2 ${
                activeTab === 'book' ? 'bg-white text-[var(--primary)]' : 'bg-transparent text-white'
              }`}
            >
              <Calendar size={16} /> Đăng ký đặt lịch khám
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={`py-2.5 px-6 rounded-lg border-none font-bold text-sm cursor-pointer transition-all duration-200 ease-in-out flex items-center gap-2 ${
                activeTab === 'search' ? 'bg-white text-[var(--primary)]' : 'bg-transparent text-white'
              }`}
            >
              <Search size={16} /> Tra cứu bệnh án & Lịch hẹn
            </button>
          </div>
        </div>
      </section>

      {/* 3. Vùng xử lý chính */}
      <main className="max-w-[1000px] mx-auto my-10 px-5 pb-20">
        
        {/* TAB 1: ĐẶT LỊCH HẸN KHÁM */}
        {activeTab === 'book' && (
          <div className="bg-white rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-slate-200 overflow-hidden">
            <div className="py-5 px-6 border-b border-slate-200 bg-slate-50 flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-[var(--primary-light)] text-[var(--primary)]">
                <UserCheck size={20} />
              </div>
              <div>
                <h3 className="text-base font-extrabold m-0 text-[var(--text-main)]">ĐĂNG KÝ HỒ SƠ ĐẶT HẸN KHÁM BỆNH</h3>
                <p className="text-xs text-[var(--text-muted)] m-0">Thông tin lịch hẹn sẽ được gửi đến bộ phận Tiếp đón của phòng khám</p>
              </div>
            </div>

            <div className="py-8 px-6">
              <form onSubmit={handleBookAppointment} className="grid grid-cols-2 gap-6">
                <div className="form-group !m-0">
                  <label className="form-label font-bold text-[13px] mb-2 flex items-center gap-1.5">
                    <User size={14} className="text-[var(--text-muted)]" /> Họ tên người bệnh <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="hoTenKhach"
                    value={bookingForm.hoTenKhach}
                    onChange={handleInputChange}
                    placeholder="Nhập đầy đủ họ và tên của bạn..."
                    className="form-input uppercase h-10 text-[13.5px]"
                    required
                  />
                </div>

                <div className="form-group !m-0">
                  <label className="form-label font-bold text-[13px] mb-2 flex items-center gap-1.5">
                    <Phone size={14} className="text-[var(--text-muted)]" /> Số điện thoại liên lạc <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="sdt"
                    value={bookingForm.sdt}
                    onChange={handleInputChange}
                    placeholder="Nhập số điện thoại (ví dụ: 0912345678)..."
                    className="form-input h-10 text-[13.5px]"
                    required
                  />
                </div>

                <div className="form-group !m-0 col-span-2">
                  <label className="form-label font-bold text-[13px] mb-2 flex items-center gap-1.5">
                    <Calendar size={14} className="text-[var(--text-muted)]" /> Chọn ngày hẹn khám bệnh <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="ngayHen"
                    value={bookingForm.ngayHen}
                    onChange={handleInputChange}
                    className="form-input h-10 text-[13.5px]"
                    required
                  />
                </div>

                <div className="form-group !m-0 col-span-2">
                  <label className="form-label font-bold text-[13px] mb-2 flex items-center gap-1.5">
                    <FileText size={14} className="text-[var(--text-muted)]" /> Lý do khám / Triệu chứng bệnh lý
                  </label>
                  <textarea
                    name="yeuCauKham"
                    value={bookingForm.yeuCauKham}
                    onChange={handleInputChange}
                    placeholder="Vui lòng miêu tả ngắn gọn triệu chứng hoặc nhu cầu khám (ví dụ: Đau họng, khám sức khỏe định kỳ)..."
                    className="form-input min-h-[120px] resize-y font-inherit p-3 text-[13.5px]"
                  />
                </div>

                <div className="col-span-2 flex justify-end gap-4 mt-3">
                  <button
                    type="button"
                    onClick={() => setBookingForm(prev => ({ ...prev, hoTenKhach: '', sdt: '', yeuCauKham: '' }))}
                    className="btn-outline h-[42px] px-6 text-[13.5px] font-bold"
                  >
                    Nhập lại
                  </button>
                  <button
                    type="submit"
                    className="btn-primary h-[42px] px-8 text-[13.5px] font-bold w-auto mt-0"
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
          <div className="flex flex-col gap-6">
            {/* Thanh Tìm kiếm */}
            <div className="bg-white rounded-2xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-slate-200">
              <h3 className="text-[15px] font-[850] text-[var(--text-main)] mb-4">TRA CỨU HỒ SƠ BỆNH ÁN & LỊCH HẸN TRỰC TUYẾN</h3>
              <form onSubmit={handleSearch} className="flex gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Điền mã người bệnh (BN...) hoặc mã hồ sơ khám (PK...)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="form-input pl-10 h-11 w-full text-sm"
                  />
                  <Search size={18} className="absolute left-3.5 top-[13px] text-[var(--text-muted)]" />
                </div>
                <button type="submit" className="btn-primary h-11 px-7 m-0 flex items-center text-sm font-bold w-auto mt-0 shrink-0">
                  Tìm Kiếm
                </button>
              </form>
            </div>

            {/* Hiển thị chi tiết Kết quả */}
            {!searched ? (
              <div className="bg-white rounded-2xl py-12 px-6 border border-slate-200 text-center text-[var(--text-muted)]">
                <ClipboardList size={54} className="stroke-[1] text-[var(--primary-light)] mb-4 mx-auto" />
                <h4 className="font-extrabold text-base text-[var(--text-main)] mb-1.5">Vui lòng nhập thông tin tra cứu</h4>
                <p className="max-w-[400px] mx-auto text-[13px] leading-relaxed">
                  Nhập chính xác mã người bệnh (BN...) hoặc mã hồ sơ khám bệnh (PK...) được ghi trên phiếu tiếp nhận để xem kết quả chẩn đoán và đơn thuốc.
                </p>
              </div>
            ) : searchResult ? (
              <div className="flex flex-col gap-[30px]">
                
                {/* 1. Thông tin bệnh nhân */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_4px_12px_rgba(0,0,0,0.02)] overflow-hidden">
                  <div className="py-4 px-6 border-b border-slate-200 bg-slate-50 flex items-center gap-2.5">
                    <UserRound size={18} className="text-[var(--primary)]" />
                    <strong className="text-sm font-extrabold text-[var(--text-main)]">HỒ SƠ HÀNH CHÍNH NGƯỜI BỆNH</strong>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-x-8 gap-y-4 text-[13.5px]">
                      <div><strong>Họ và tên:</strong> <span className="text-[var(--primary)] font-[750] uppercase">{searchResult.patient.hoTen}</span></div>
                      <div><strong>Mã người bệnh:</strong> <span className="font-semibold">{searchResult.patient.maBN}</span></div>
                      <div><strong>Ngày sinh:</strong> {searchResult.patient.ngaySinh || 'N/A'}</div>
                      <div><strong>Giới tính:</strong> {searchResult.patient.gioiTinh || 'N/A'}</div>
                      <div><strong>Số điện thoại:</strong> {searchResult.patient.sdt}</div>
                      <div><strong>Địa chỉ:</strong> {searchResult.patient.diaChi || 'N/A'}</div>
                      <div className="col-span-full border-t border-dashed border-slate-200 pt-3 mt-1">
                        <strong>Tiền sử bệnh lý cá nhân:</strong>{' '}
                        <span className="text-[#ef4444] font-semibold">{searchResult.patient.tienSuBenh || 'Không'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Lịch đặt khám sắp tới */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_4px_12px_rgba(0,0,0,0.02)] overflow-hidden">
                  <div className="py-4 px-6 border-b border-slate-200 bg-slate-50 flex items-center gap-2.5">
                    <Clock size={18} className="text-[var(--primary)]" />
                    <strong className="text-sm font-extrabold text-[var(--text-main)]">LỊCH HẸN ĐÃ ĐĂNG KÝ ({searchResult.appointments.length})</strong>
                  </div>
                  <div className="p-5">
                    {searchResult.appointments.length === 0 ? (
                      <div className="p-6 border border-dashed border-slate-300 rounded-lg text-[var(--text-muted)] text-[13px] text-center">
                        Người bệnh hiện không có lịch hẹn trực tuyến nào.
                      </div>
                    ) : (
                      <div className="grid gap-3">
                        {searchResult.appointments.map((appt, i) => (
                          <div key={i} className="border border-slate-200 rounded-xl p-4 flex justify-between items-center bg-[#fafafa]">
                            <div>
                              <div className="font-bold text-[14.5px] text-[var(--text-main)] mb-1">
                                Ngày hẹn khám: {appt.ngayHen}
                              </div>
                              <div className="text-[var(--text-muted)] text-[12.5px]">
                                Mã đặt lịch: <strong className="text-[var(--text-main)]">{appt.maDatLich}</strong> | Lý do khám: {appt.yeuCauKham}
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
                <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_4px_12px_rgba(0,0,0,0.02)] overflow-hidden">
                  <div className="py-4 px-6 border-b border-slate-200 bg-slate-50 flex items-center gap-2.5">
                    <History size={18} className="text-[var(--primary)]" />
                    <strong className="text-sm font-extrabold text-[var(--text-main)]">HỒ SƠ LỊCH SỬ CHỮA BỆNH ({searchResult.visits.length})</strong>
                  </div>
                  <div className="p-6 flex flex-col gap-6">
                    {searchResult.visits.length === 0 ? (
                      <div className="p-6 border border-dashed border-slate-300 rounded-lg text-[var(--text-muted)] text-[13px] text-center">
                        Chưa tìm thấy lịch sử hồ sơ bệnh án cũ của bệnh nhân này.
                      </div>
                    ) : (
                      searchResult.visits.map((visit, i) => (
                        <div key={i} className="border border-slate-200 rounded-xl p-5 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.015)]">
                          {/* Mã phiếu & Ngày khám */}
                          <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
                            <span className="font-extrabold text-[var(--primary)] text-sm">MÃ HỒ SƠ: {visit.maPhieu}</span>
                            <span className="text-[12.5px] text-[var(--text-muted)] flex items-center gap-1">
                              <Clock size={13} /> {new Date(visit.ngayKham).toLocaleDateString('vi-VN')} {new Date(visit.ngayKham).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          {/* Chi tiết hồ sơ bệnh */}
                          <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-[13px] text-[var(--text-main)]">
                            <div>
                              <strong>Bác sĩ chuyên khoa khám:</strong>
                              <p className="mt-1 mb-0 mx-0 font-semibold text-[13.5px] text-[var(--primary)]">{visit.tenBacSi}</p>
                            </div>
                            <div>
                              <strong>Trạng thái hồ sơ:</strong>
                              <div className="mt-1">{getStatusBadge(visit.trangThai)}</div>
                            </div>
                            <div className="col-span-2">
                              <strong>Triệu chứng / Lý do nhập viện khám:</strong>
                              <p className="mt-1 mb-0 mx-0 text-[var(--text-main)] text-[13px] bg-slate-50 p-2.5 px-3 rounded-md">{visit.lyDoKham}</p>
                            </div>
                            
                            {/* Kết luận & chẩn đoán bệnh */}
                            <div className="col-span-2 border-t border-slate-100 pt-3">
                              <strong>Chẩn đoán bệnh (ICD):</strong>
                              <p className="mt-1 mb-0 mx-0 text-[13.5px] text-[#ef4444] font-bold">
                                {visit.maICD ? `${visit.maICD} - ${visit.tenBenhICD}` : (visit.chanDoan || 'Chưa có kết luận chẩn đoán')}
                              </p>
                            </div>

                            {/* Chỉ định cận lâm sàng */}
                            <div className="col-span-2 border-t border-slate-100 pt-3">
                              <strong className="flex items-center gap-1.5 mb-2">
                                <ClipboardList size={14} className="text-[var(--primary)]" />
                                Danh mục Xét nghiệm & Cận lâm sàng chỉ định
                              </strong>
                              {!visit.chiDinh || visit.chiDinh.length === 0 ? (
                                <p className="m-0 italic text-[var(--text-muted)]">Không có chỉ định cận lâm sàng.</p>
                              ) : (
                                <div className="flex flex-wrap gap-2">
                                  {visit.chiDinh.map((item, idx) => (
                                    <span key={idx} className="bg-[var(--primary-light)] text-[var(--primary)] py-1 px-2.5 rounded-full text-xs font-semibold">
                                      {item.tenXN}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Toa thuốc kê */}
                            <div className="col-span-2 border-t border-slate-100 pt-3">
                              <strong className="flex items-center gap-1.5 mb-2">
                                <Pill size={14} className="text-[#10b981]" />
                                Đơn thuốc được bác sĩ kê toa
                              </strong>
                              {!visit.donThuoc || visit.donThuoc.length === 0 ? (
                                <p className="m-0 italic text-[var(--text-muted)]">Không có đơn thuốc nào được kê.</p>
                              ) : (
                                <table className="w-full border-collapse mt-2">
                                  <thead>
                                    <tr className="bg-slate-50 text-left border-b border-slate-200">
                                      <th className="p-2 text-xs font-bold">Tên thuốc</th>
                                      <th className="p-2 text-xs font-bold w-[90px] text-center">Số lượng</th>
                                      <th className="p-2 text-xs font-bold w-[90px] text-center">Số ngày</th>
                                      <th className="p-2 text-xs font-bold">Hướng dẫn sử dụng</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {visit.donThuoc.map((med, idx) => (
                                      <tr key={idx} className="border-b border-[#f1f5f9]">
                                        <td className="p-2 font-semibold">{med.tenThuoc}</td>
                                        <td className="p-2 text-center">{med.soLuong}</td>
                                        <td className="p-2 text-center">{med.soNgay} ngày</td>
                                        <td className="p-2 text-[var(--text-muted)]">{med.cachDung || 'Uống theo chỉ dẫn'}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              )}
                            </div>

                            {/* Lời dặn dò */}
                            {visit.loiDan && (
                              <div className="col-span-2 border-t border-slate-100 pt-3 text-[var(--text-muted)] text-[12.5px] italic">
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
              <div className="bg-white rounded-2xl py-12 px-6 border border-slate-200 text-center text-[var(--text-muted)]">
                <ShieldAlert size={54} className="stroke-[1] text-red-400 mb-4 mx-auto" />
                <h4 className="font-extrabold text-base text-red-500 mb-1.5">Không tìm thấy hồ sơ người bệnh</h4>
                <p className="max-w-[360px] mx-auto text-[13px] leading-relaxed">
                  Không tìm thấy thông tin bệnh án hay lịch đặt lịch khám nào trùng khớp với mã bạn vừa điền. Vui lòng kiểm tra lại chính xác.
                </p>
              </div>
            )}
          </div>
        )}

      </main>

      {/* 4. Footer */}
      <footer className="bg-[#0f172a] text-[#94a3b8] py-[30px] px-6 text-center border-t border-[#1e293b] text-[13px]">
        <div className="max-w-[1200px] mx-auto">
          <strong className="text-white text-sm block mb-1.5">PHÒNG KHÁM ĐA KHOA NHẬT TẢO</strong>
          <p className="my-1">Địa chỉ: 123 Đường Nhật Tảo, Phường 4, Quận 10, TP. Hồ Chí Minh</p>
          <p className="my-1">Email: contact@nhattaoclinic.vn | Hotline hỗ trợ: 1900 6868</p>
          <p className="mt-5 mb-0 mx-0 text-[11px] opacity-60">&copy; {new Date().getFullYear()} Phòng khám đa khoa Nhật Tảo.</p>
        </div>
      </footer>
    </div>
  );
}

export default DatLichPublic;
