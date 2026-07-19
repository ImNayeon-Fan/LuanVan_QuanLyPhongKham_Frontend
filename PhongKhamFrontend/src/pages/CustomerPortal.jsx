import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, User, Phone, FileText, Search, Clock, 
  History, UserCheck, ShieldAlert, ClipboardList, Pill, 
  ArrowLeft, Heart, CheckCircle2, AlertCircle, Info, Activity
} from 'lucide-react';
import { useToast } from '../utils/ToastContext';
import { 
  apiGetBacSiCongKhai, 
  apiTraCuuHoSoCongKhai, 
  apiGetAvailableDoctorsOnSchedule, 
  apiCreateDatLichKham 
} from '../utils/api';

const DEPARTMENTS = [
  { maKhoa: 'KHOA01', tenKhoa: 'Nội tổng quát' },
  { maKhoa: 'KHOA02', tenKhoa: 'Tim mạch' },
  { maKhoa: 'KHOA03', tenKhoa: 'Nhi khoa' },
  { maKhoa: 'KHOA04', tenKhoa: 'Tai Mũi Họng' }
];



function CustomerPortal() {
  const navigate = useNavigate();
  const { showSuccess, showError, showWarning } = useToast();

  const [activeTab, setActiveTab] = useState('book'); // book | doctors | search

  // State biểu mẫu đăng ký lịch hẹn
  const [bookingForm, setBookingForm] = useState({
    hoTenKhach: '',
    sdt: '',
    gioiTinh: 'Nam',
    ngaySinh: '',
    diaChi: '',
    tienSuBenh: '',
    ngayHen: '',
    caHen: 'Sang',
    maKhoa: '',
    yeuCauKham: '',
    maNV: ''
  });

  // State phục vụ việc tra cứu lịch sử bệnh án / lịch hẹn
  const [searchMaBN, setSearchMaBN] = useState('');
  const [searchSdt, setSearchSdt] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [searched, setSearched] = useState(false);

  // State phục vụ load danh sách bác sĩ công khai từ API
  const [doctorsList, setDoctorsList] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);

  // State phục vụ lọc danh sách bác sĩ trực thực tế từ API theo Ngày + Khoa + Ca
  const [availableDoctors, setAvailableDoctors] = useState([]);
  const [loadingScheduleDoctors, setLoadingScheduleDoctors] = useState(false);

  // Tải danh sách bác sĩ có ca trực thỏa mãn Ngày + Khoa + Ca từ API
  useEffect(() => {
    const fetchAvailableDoctors = async () => {
      const { ngayHen, maKhoa, caHen } = bookingForm;
      if (!ngayHen || !maKhoa) {
        setAvailableDoctors([]);
        return;
      }
      setLoadingScheduleDoctors(true);
      try {
        const res = await apiGetAvailableDoctorsOnSchedule(ngayHen, maKhoa, caHen);
        if (Array.isArray(res)) {
          setAvailableDoctors(res);
        } else {
          setAvailableDoctors([]);
        }
      } catch (err) {
        console.error('Không thể tải danh sách bác sĩ trực từ API:', err);
        setAvailableDoctors([]);
      } finally {
        setLoadingScheduleDoctors(false);
      }
    };
    fetchAvailableDoctors();
  }, [bookingForm.ngayHen, bookingForm.maKhoa, bookingForm.caHen]);

  // Khi maKhoa thay đổi, reset maNV về trống
  useEffect(() => {
    setBookingForm(prev => ({ ...prev, maNV: '' }));
  }, [bookingForm.maKhoa]);

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoadingDoctors(true);
      try {
        const res = await apiGetBacSiCongKhai();
        if (res && res.data) {
          setDoctorsList(res.data);
        }
      } catch (err) {
        console.error('Không thể tải danh sách bác sĩ công khai từ API:', err);
      } finally {
        setLoadingDoctors(false);
      }
    };
    fetchDoctors();
  }, []);

  const displayDoctors = doctorsList.length > 0 
    ? doctorsList.map(doc => ({
        maNV: doc.maNV,
        hoTen: doc.hoTen,
        chuyenMon: doc.chuyenMon || 'Bác sĩ chuyên khoa',
        khoa: doc.tenKhoa || 'Phòng khám đa khoa',
        bangCap: 'Bác sĩ chuyên khoa tại Phòng khám Đa khoa Nhật Tảo',
        kinhNghiem: 'Nhiều năm kinh nghiệm trong lĩnh vực y tế và chăm sóc sức khỏe bệnh nhân.',
        status: 'Đang làm việc'
      }))
    : [];

  // Mặc định thiết lập ngày hẹn là ngày mai
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

  // Tự động định dạng dấu gạch chéo ngày sinh (DD/MM/YYYY) khi gõ trên cổng khách hàng
  const handleNgaySinhChange = (e) => {
    let val = e.target.value;
    const isDeleting = e.nativeEvent.inputType === 'deleteContentBackward';
    
    if (!isDeleting) {
      const digits = val.replace(/\D/g, '');
      if (digits.length > 0) {
        if (digits.length <= 2) val = digits;
        else if (digits.length <= 4) val = `${digits.slice(0, 2)}/${digits.slice(2)}`;
        else val = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
      }
    }
    if (val.length <= 10) setBookingForm(prev => ({ ...prev, ngaySinh: val }));
  };

  const handleNgaySinhBlur = () => {
    let val = bookingForm.ngaySinh.trim();
    const digits = val.replace(/\D/g, '');
    if (digits.length === 8) {
      val = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
      setBookingForm(prev => ({ ...prev, ngaySinh: val }));
    }
  };

  // Gửi thông tin đặt lịch khám trực tuyến
  const handleBookAppointment = async (e) => {
    e.preventDefault();
    const { hoTenKhach, sdt, gioiTinh, ngaySinh, diaChi, tienSuBenh, ngayHen, caHen, maKhoa, yeuCauKham, maNV } = bookingForm;

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
    if (!ngaySinh.trim()) {
      showError('Vui lòng nhập ngày sinh!');
      return;
    }
    const isValidDate = (dateStr) => {
      if (!dateStr) return false;
      const parts = dateStr.split('/');
      if (parts.length !== 3) return false;
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      const year = parseInt(parts[2], 10);
      
      if (isNaN(day) || isNaN(month) || isNaN(year)) return false;
      if (month < 1 || month > 12) return false;
      if (day < 1 || day > 31) return false;
      if (year < 1900 || year > new Date().getFullYear()) return false;
      
      const daysInMonth = new Date(year, month, 0).getDate();
      return day <= daysInMonth;
    };
    if (!isValidDate(ngaySinh) || ngaySinh.length !== 10) {
      showError('Ngày sinh không hợp lệ (Định dạng đúng: DD/MM/YYYY)!');
      return;
    }
    if (!ngayHen) {
      showError('Vui lòng chọn ngày hẹn khám!');
      return;
    }
    if (!maKhoa) {
      showError('Vui lòng chọn chuyên khoa khám!');
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    if (ngayHen < todayStr) {
      showWarning('Ngày hẹn khám không thể ở trong quá khứ!');
      return;
    }

    // Đóng gói thông tin hành chính mở rộng vào yeuCauKham phân tách bằng '###'
    const extraInfo = `###${gioiTinh}|${ngaySinh}|${(diaChi.trim() || '—')}|${(tienSuBenh.trim() || '—')}`;
    const fullYeuCauKham = (yeuCauKham.trim() || 'Khám tổng quát') + extraInfo;

    // Lấy tên bác sĩ từ availableDoctors
    const selectedDoc = availableDoctors.find(d => d.maNV === maNV);
    const tenBacSi = selectedDoc ? selectedDoc.hoTen : '';

    try {
      const payload = {
        hoTenKhach: hoTenKhach.trim(),
        sdt: sdt.trim(),
        ngayHen: ngayHen,
        caHen: caHen,
        yeuCauKham: fullYeuCauKham,
        maNV: maNV || null
      };

      const res = await apiCreateDatLichKham(payload);
      const maDatLichStr = String(res.maDatLich);

      const newAppointment = {
        maDatLich: maDatLichStr,
        hoTenKhach: hoTenKhach.trim().toUpperCase(),
        sdt: sdt.trim(),
        gioiTinh: gioiTinh,
        ngaySinh: ngaySinh,
        diaChi: diaChi.trim(),
        tienSuBenh: tienSuBenh.trim(),
        ngayHen: ngayHen,
        caHen: caHen,
        yeuCauKham: yeuCauKham.trim() || 'Khám tổng quát',
        trangThai: res.trangThai || 'ChoXacNhan',
        ngayTao: new Date().toISOString(),
        maNV: maNV || '',
        tenBacSi: tenBacSi
      };

      // Lưu bản sao cục bộ để tra cứu nhanh ở trình duyệt này
      const existing = JSON.parse(localStorage.getItem('danhSachDatLich') || '[]');
      const updated = [newAppointment, ...existing];
      localStorage.setItem('danhSachDatLich', JSON.stringify(updated));

      showSuccess(`Đặt lịch hẹn khám thành công! Mã lịch đặt: ${maDatLichStr}`);

      // Chuyển sang hiển thị kết quả tra cứu
      setSearchResult({
        patient: {
          maBN: 'Chưa có (Hồ sơ đăng ký trực tuyến)',
          hoTen: newAppointment.hoTenKhach,
          sdt: newAppointment.sdt,
          ngaySinh: newAppointment.ngaySinh,
          gioiTinh: newAppointment.gioiTinh,
          diaChi: newAppointment.diaChi || '—',
          tienSuBenh: newAppointment.tienSuBenh || '—'
        },
        visits: [],
        appointments: [newAppointment]
      });
      setActiveTab('search');
      setSearchMaBN('');
      setSearchSdt(newAppointment.sdt);
      setSearched(true);

      // Reset form
      setBookingForm({
        hoTenKhach: '',
        sdt: '',
        gioiTinh: 'Nam',
        ngaySinh: '',
        diaChi: '',
        tienSuBenh: '',
        ngayHen: ngayHen,
        caHen: 'Sang',
        maKhoa: '',
        yeuCauKham: '',
        maNV: ''
      });
    } catch (err) {
      console.error(err);
      showError(err.message || 'Không thể đăng ký đặt lịch khám với máy chủ!');
    }
  };  // Tra cứu lịch sử bệnh án / lịch hẹn
  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    
    const maBN = searchMaBN.trim();
    const sdt = searchSdt.trim();

    if (!maBN || !sdt) {
      showError('Vui lòng điền đầy đủ thông tin (cả Mã bệnh nhân và Số điện thoại)!');
      return;
    }

    setSearching(true);
    setSearched(false);
    setSearchResult(null);



    // 2. Tra cứu dữ liệu từ API công khai thực tế của Backend
    if (maBN && sdt) {
      try {
        const res = await apiTraCuuHoSoCongKhai(maBN, sdt);
        if (res && res.patient) {
          // Lấy lịch hẹn từ localStorage
          let matchedAppts = [];
          try {
            const allDatLich = JSON.parse(localStorage.getItem('danhSachDatLich') || '[]');
            matchedAppts = allDatLich.filter(appt => appt.sdt === sdt);
          } catch (err) {
            console.error(err);
          }

          setSearchResult({
            patient: {
              maBN: res.patient.maBN || res.patient.maBn,
              hoTen: res.patient.hoTen,
              ngaySinh: res.patient.ngaySinh,
              gioiTinh: res.patient.gioiTinh,
              diaChi: res.patient.diaChi,
              tienSuBenh: res.patient.tienSuBenh
            },
            visits: res.lastVisit ? [{
              maPhieu: res.lastVisit.maPhieu,
              ngayKham: res.lastVisit.ngayKham ? new Date(res.lastVisit.ngayKham).toLocaleString('vi-VN') : '—',
              tenBacSi: res.lastVisit.tenBacSi || 'Bác sĩ phòng khám',
              lyDoKham: res.lastVisit.lyDoKham || 'Khám bệnh',
              mach: res.lastVisit.mach,
              nhietDo: res.lastVisit.nhietDo,
              huyetAp: res.lastVisit.huyetAp,
              canNang: res.lastVisit.canNang,
              chieuCao: res.lastVisit.chieuCao,
              ketLuan: res.lastVisit.ketLuan || 'Bình thường',
              icdList: res.lastVisit.icdList || [],
              clsList: res.lastVisit.clsList || [],
              donThuoc: res.lastVisit.donThuoc || []
            }] : [],
            appointments: matchedAppts.sort((a, b) => new Date(b.ngayHen) - new Date(a.ngayHen))
          });
          showSuccess('Tìm thấy thông tin hồ sơ bệnh án từ hệ thống!');
          setSearched(true);
          setSearching(false);
          return;
        }
      } catch (err) {
        console.warn('Lỗi tra cứu API thực tế:', err);
      }
    }

    // 3. Nếu vẫn không thấy, tìm kiếm lịch hẹn theo SDT hoặc mã đặt lịch trong localStorage
    try {
      const queryStr = maBN.toLowerCase() || sdt;
      const allDatLich = JSON.parse(localStorage.getItem('danhSachDatLich') || '[]');
      const matchedAppts = allDatLich.filter(appt => 
        appt.maDatLich.toLowerCase() === queryStr ||
        appt.sdt === sdt ||
        appt.sdt === queryStr
      );

      if (matchedAppts.length > 0) {
        const first = matchedAppts[0];
        setSearchResult({
          patient: {
            maBN: 'Chưa có (Chờ lễ tân tiếp nhận)',
            hoTen: first.hoTenKhach,
            sdt: first.sdt,
            ngaySinh: '—',
            gioiTinh: '—',
            diaChi: '—',
            tienSuBenh: '—'
          },
          visits: [],
          appointments: matchedAppts.sort((a, b) => new Date(b.ngayHen) - new Date(a.ngayHen))
        });
        showSuccess('Tìm thấy thông tin lịch hẹn đăng ký khám!');
      } else {
        setSearchResult(null);
        showWarning('Không tìm thấy thông tin bệnh lý hoặc lịch hẹn nào trùng khớp!');
      }
    } catch (err) {
      console.error(err);
      showError('Có lỗi xảy ra khi tra cứu dữ liệu!');
    } finally {
      setSearched(true);
      setSearching(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ChoXacNhan':
        return <span className="bg-amber-50 text-amber-600 border border-amber-200 px-2 py-0.5 rounded text-xs font-semibold">Chờ xác nhận</span>;
      case 'DaXacNhan':
        return <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 py-0.5 rounded text-xs font-semibold">Đã xác nhận</span>;
      default:
        return <span className="bg-slate-50 text-slate-600 border border-slate-200 px-2 py-0.5 rounded text-xs font-semibold">Hủy hẹn</span>;
    }
  };

  return (
    <div className="h-screen bg-slate-50 flex flex-col justify-between relative overflow-hidden font-inherit">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/')} 
              className="p-2 hover:bg-slate-100 rounded-full transition-colors duration-200 text-slate-500 hover:text-slate-800"
              title="Quay về trang chủ điều hướng"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="h-6 w-[1.5px] bg-slate-200" />
            <div className="flex items-center gap-2.5">
              <img 
                src="/clinic_logo.png" 
                alt="Logo Phòng khám Đa khoa Nhật Tảo" 
                className="w-8 h-8 object-contain rounded-full"
              />
              <span className="font-bold text-slate-800 tracking-tight text-sm sm:text-base">
                Phòng Khám Đa Khoa Nhật Tảo
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className={`flex-1 max-w-7xl w-full mx-auto px-4 py-2 sm:py-3 flex flex-col ${activeTab === 'book' ? 'justify-center overflow-hidden' : 'overflow-y-auto'}`}>
        
        {/* Navigation Tabs */}
        <div className="flex bg-white rounded-2xl p-1 shadow-sm border border-slate-200 mb-3 max-w-2xl w-full mx-auto flex-shrink-0">
          <button
            onClick={() => setActiveTab('book')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
              activeTab === 'book'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Calendar size={16} />
            Đặt lịch khám
          </button>
          
          <button
            onClick={() => setActiveTab('doctors')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
              activeTab === 'doctors'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <User size={16} />
            Đội ngũ Bác sĩ
          </button>

          <button
            onClick={() => setActiveTab('search')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
              activeTab === 'search'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Search size={16} />
            Tra cứu hồ sơ
          </button>
        </div>

        {/* Tab 1: Đặt Lịch Khám */}
        {activeTab === 'book' && (
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm max-w-7xl w-full mx-auto">
            <div className="mb-4">
              <h2 className="text-[17px] font-bold text-slate-800 flex items-center gap-2">
                <Calendar size={18} className="text-blue-600 flex-shrink-0" />
                Đăng Ký Đặt Lịch Hẹn Khám Trực Tuyến
              </h2>
              <p className="text-slate-500 text-xs mt-1">
                Vui lòng nhập đầy đủ thông tin để đăng ký lịch hẹn khám. Lễ tân sẽ gọi điện thoại xác nhận trong vòng 15 phút.
              </p>
            </div>

            <form onSubmit={handleBookAppointment} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Cột trái: Thông tin cá nhân */}
              <div className="space-y-3.5 border-r border-slate-100 pr-0 md:pr-6">
                <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                  <User size={14} /> 1. Thông tin cá nhân (Hành chính)
                </h3>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Họ và tên người khám <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400"><User size={15} /></span>
                    <input 
                      type="text"
                      name="hoTenKhach"
                      value={bookingForm.hoTenKhach}
                      onChange={handleInputChange}
                      placeholder="NGUYỄN VĂN A"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-xs sm:text-sm transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Số điện thoại liên hệ <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400"><Phone size={15} /></span>
                    <input 
                      type="text"
                      name="sdt"
                      value={bookingForm.sdt}
                      onChange={handleInputChange}
                      placeholder="0901234567"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-xs sm:text-sm transition-all"
                    />
                  </div>
                </div>

                {/* Giới tính & Ngày sinh */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                      Giới tính <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-slate-400"><User size={15} /></span>
                      <select
                        name="gioiTinh"
                        value={bookingForm.gioiTinh}
                        onChange={handleInputChange}
                        className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-xs sm:text-sm transition-all bg-white"
                        required
                      >
                        <option value="Nam">Nam</option>
                        <option value="Nữ">Nữ</option>
                        <option value="Khác">Khác</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                      Ngày sinh <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-slate-400"><Clock size={15} /></span>
                      <input 
                        type="text"
                        name="ngaySinh"
                        placeholder="Ví dụ: 18/03/2003"
                        value={bookingForm.ngaySinh}
                        onChange={handleNgaySinhChange}
                        onBlur={handleNgaySinhBlur}
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-xs sm:text-sm transition-all"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Địa chỉ & Tiền sử */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                      Địa chỉ thường trú
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-slate-400"><FileText size={15} /></span>
                      <input 
                        type="text"
                        name="diaChi"
                        value={bookingForm.diaChi}
                        onChange={handleInputChange}
                        placeholder="Số nhà, đường, xã..."
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-xs sm:text-sm transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                      Tiền sử bệnh án
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-slate-400"><FileText size={15} /></span>
                      <input 
                        type="text"
                        name="tienSuBenh"
                        value={bookingForm.tienSuBenh}
                        onChange={handleInputChange}
                        placeholder="Dị ứng, tim mạch..."
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-xs sm:text-sm transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Cột phải: Chỉ định khám */}
              <div className="space-y-3.5 flex flex-col justify-between">
                <div className="space-y-3.5">
                  <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                    <Calendar size={14} /> 2. Thông tin đặt lịch khám
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                        Ngày muốn hẹn khám <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-slate-400"><Clock size={15} /></span>
                        <input 
                          type="date"
                          name="ngayHen"
                          value={bookingForm.ngayHen}
                          onChange={handleInputChange}
                          className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-xs sm:text-sm transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                        Ca khám mong muốn <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-slate-400"><Clock size={15} /></span>
                        <select
                          name="caHen"
                          value={bookingForm.caHen}
                          onChange={handleInputChange}
                          className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-xs sm:text-sm transition-all bg-white"
                          required
                        >
                          <option value="Sang">Ca Sáng (7:30 - 11:30)</option>
                          <option value="Chieu">Ca Chiều (13:30 - 17:30)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                        Chuyên khoa khám <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-slate-400"><Activity size={15} /></span>
                        <select
                          name="maKhoa"
                          value={bookingForm.maKhoa}
                          onChange={handleInputChange}
                          className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-xs sm:text-sm transition-all bg-white"
                          required
                        >
                          <option value="">Chọn chuyên khoa</option>
                          {DEPARTMENTS.map(dept => (
                            <option key={dept.maKhoa} value={dept.maKhoa}>
                              {dept.tenKhoa}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                        Bác sĩ khám mong muốn
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-slate-400"><User size={15} /></span>
                        <select
                          name="maNV"
                          value={bookingForm.maNV}
                          onChange={handleInputChange}
                          className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-xs sm:text-sm transition-all bg-white"
                          disabled={!bookingForm.maKhoa || loadingScheduleDoctors}
                        >
                          {!bookingForm.maKhoa ? (
                            <option value="">Chọn chuyên khoa trước</option>
                          ) : loadingScheduleDoctors ? (
                            <option value="">Đang tải bác sĩ...</option>
                          ) : availableDoctors.length === 0 ? (
                            <option value="">Không có bác sĩ trực ca này</option>
                          ) : (
                            <>
                              <option value="">Chọn bác sĩ (Tùy chọn)</option>
                              {availableDoctors.map(doc => (
                                <option key={doc.maNV} value={doc.maNV}>
                                  {doc.hoTen} ({doc.chuyenMon})
                                </option>
                              ))}
                            </>
                          )}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                      Lý do khám / Triệu chứng bệnh lý
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-slate-400"><FileText size={15} /></span>
                      <textarea 
                        name="yeuCauKham"
                        value={bookingForm.yeuCauKham}
                        onChange={handleInputChange}
                        rows="4"
                        placeholder="Mô tả sơ lược triệu chứng như: Đau họng, ho kéo dài, đau nhức..."
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-xs sm:text-sm transition-all resize-none"
                      />
                    </div>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-500/20 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 text-xs sm:text-sm mt-4 md:mt-0"
                >
                  <CheckCircle2 size={16} />
                  Đăng Ký Đặt Hẹn Ngay
                </button>
              </div>

            </form>
          </div>
        )}

        {/* Tab 2: Đội Ngũ Bác Sĩ */}
        {activeTab === 'doctors' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="mb-2">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <User size={20} className="text-blue-600" />
                Đội Ngũ Bác Sĩ Chuyên Khoa Phòng Khám
              </h2>
              <p className="text-slate-500 text-sm mt-0.5">
                Gặp gỡ đội ngũ thạc sĩ, bác sĩ giỏi chuyên môn, tận tâm phục vụ sức khỏe bệnh nhân.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {displayDoctors.map((doc) => (
                <div key={doc.maNV} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3.5 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center font-black text-lg">
                        {doc.hoTen.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 text-lg">{doc.hoTen}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-semibold">{doc.khoa}</span>
                          <span className="text-[11px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-semibold">{doc.status}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 text-xs sm:text-sm text-slate-600 border-t border-slate-100 pt-3">
                      <div>
                        <span className="font-bold text-slate-700 block mb-0.5">Học hàm học vị:</span>
                        <p className="text-slate-600">{doc.bangCap}</p>
                      </div>
                      <div>
                        <span className="font-bold text-slate-700 block mb-0.5">Lĩnh vực chuyên sâu:</span>
                        <p className="text-slate-500">{doc.chuyenMon}</p>
                      </div>
                      <div>
                        <span className="font-bold text-slate-700 block mb-0.5 font-bold">Kinh nghiệm lâm sàng:</span>
                        <p className="text-slate-500 leading-relaxed italic">"{doc.kinhNghiem}"</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Tra Cứu Hồ Sơ */}
        {activeTab === 'search' && (
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* Search Bar Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-3">
                <Search size={18} className="text-blue-600" />
                Tra Cứu Hồ Sơ Khám Bệnh & Đơn Thuốc Cá Nhân
              </h2>
              <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <span className="absolute left-3.5 top-3.5 text-slate-400"><User size={16} /></span>
                  <input 
                    type="text"
                    value={searchMaBN}
                    onChange={(e) => setSearchMaBN(e.target.value)}
                    placeholder="Nhập Mã bệnh nhân"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm transition-all"
                  />
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-3.5 text-slate-400"><Phone size={16} /></span>
                  <input 
                    type="text"
                    value={searchSdt}
                    onChange={(e) => setSearchSdt(e.target.value)}
                    placeholder="Nhập Số điện thoại"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm transition-all"
                  />
                </div>
                <div className="md:col-span-2 flex justify-end">
                  <button 
                    type="submit"
                    disabled={searching}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 px-8 rounded-xl text-sm transition-colors active:scale-95 flex items-center gap-2"
                  >
                    {searching ? 'Đang tra cứu...' : 'Tra cứu hồ sơ'}
                  </button>
                </div>
              </form>

            </div>

            {/* No Results Info */}
            {searched && !searchResult && (
              <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm text-center max-w-md mx-auto">
                <AlertCircle size={40} className="text-amber-500 mx-auto mb-3" />
                <h3 className="font-bold text-slate-800">Không tìm thấy thông tin</h3>
                <p className="text-slate-500 text-xs sm:text-sm mt-1 leading-relaxed">
                  Vui lòng kiểm tra lại từ khóa hoặc mã hồ sơ khám bệnh đã nhập. Đảm bảo đúng định dạng hoặc liên hệ hotline để được trợ giúp.
                </p>
              </div>
            )}

            {/* Results Display */}
            {searched && searchResult && (
              <div className="space-y-6">
                
                {/* 1. Patient Profile Card */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                  <div className="border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-1.5">
                      <User size={18} className="text-blue-600" />
                      Thông tin hành chính bệnh nhân
                    </h3>
                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-bold">{searchResult.patient.maBN}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6 text-xs sm:text-sm">
                    <div>
                      <span className="text-slate-400 block mb-0.5">Họ và tên bệnh nhân:</span>
                      <strong className="text-slate-800">{searchResult.patient.hoTen}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">Số điện thoại:</span>
                      <strong className="text-slate-800">{searchResult.patient.sdt}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">Ngày sinh:</span>
                      <strong className="text-slate-800">{searchResult.patient.ngaySinh}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">Giới tính:</span>
                      <strong className="text-slate-800">{searchResult.patient.gioiTinh}</strong>
                    </div>
                    <div className="md:col-span-2">
                      <span className="text-slate-400 block mb-0.5">Địa chỉ thường trú:</span>
                      <strong className="text-slate-800">{searchResult.patient.diaChi}</strong>
                    </div>
                    <div className="col-span-full border-t border-slate-100 pt-3 mt-1">
                      <span className="text-slate-400 block mb-0.5">Tiền sử bệnh án:</span>
                      <strong className="text-amber-700">{searchResult.patient.tienSuBenh || 'Chưa ghi nhận'}</strong>
                    </div>
                  </div>
                </div>

                {/* 2. Appointments status (if exists) */}
                {searchResult.appointments && searchResult.appointments.length > 0 && (
                  <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-1.5 border-b border-slate-100 pb-3 mb-4">
                      <Calendar size={18} className="text-blue-600" />
                      Lịch đăng ký khám trực tuyến gần đây
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs sm:text-sm">
                        <thead>
                          <tr className="text-slate-400 border-b border-slate-100">
                            <th className="pb-3 font-semibold">Mã lịch hẹn</th>
                            <th className="pb-3 font-semibold">Ngày đăng ký hẹn</th>
                            <th className="pb-3 font-semibold">Lý do khám</th>
                            <th className="pb-3 font-semibold text-center">Trạng thái</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {searchResult.appointments.map((appt) => (
                            <tr key={appt.maDatLich} className="text-slate-700">
                              <td className="py-3 font-semibold text-blue-600">{appt.maDatLich}</td>
                              <td className="py-3">{appt.ngayHen}</td>
                              <td className="py-3 max-w-[200px] truncate">{appt.yeuCauKham}</td>
                              <td className="py-3 text-center">{getStatusBadge(appt.trangThai)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 3. Visit History Details */}
                {searchResult.visits && searchResult.visits.length > 0 ? (
                  <div className="space-y-6">
                    <h3 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-1.5">
                      <History size={18} className="text-blue-600" />
                      Lịch sử bệnh án điều trị ({searchResult.visits.length} lượt khám)
                    </h3>
                    
                    {searchResult.visits.map((visit) => (
                      <div key={visit.maPhieu} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
                        <div className="flex justify-between items-center flex-wrap gap-2 border-b border-slate-100 pb-3">
                          <div>
                            <span className="text-xs text-slate-400">Mã lượt khám:</span>
                            <span className="font-bold text-slate-800 text-sm ml-1.5">{visit.maPhieu}</span>
                          </div>
                          <div>
                            <span className="text-xs text-slate-400">Ngày khám:</span>
                            <span className="font-semibold text-slate-700 text-xs sm:text-sm ml-1.5">{visit.ngayKham}</span>
                          </div>
                        </div>

                        {/* Vitals, Symptoms, Diagnosis */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col justify-between">
                            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1 mb-2">
                              <Activity size={14} className="text-blue-600" /> Chỉ số sinh hiệu
                            </span>
                            <div className="space-y-1.5 text-xs sm:text-sm text-slate-600">
                              <div className="flex justify-between"><span>Mạch:</span><strong>{visit.mach ? `${visit.mach} lần/phút` : '—'}</strong></div>
                              <div className="flex justify-between"><span>Huyết áp:</span><strong>{visit.huyetAp ? `${visit.huyetAp} mmHg` : '—'}</strong></div>
                              <div className="flex justify-between"><span>Nhiệt độ:</span><strong>{visit.nhietDo ? `${visit.nhietDo} °C` : '—'}</strong></div>
                              <div className="flex justify-between"><span>Cân nặng:</span><strong>{visit.canNang ? `${visit.canNang} kg` : '—'}</strong></div>
                            </div>
                          </div>

                          <div className="md:col-span-2 space-y-4">
                            <div>
                              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">
                                Triệu chứng ban đầu:
                              </span>
                              <p className="text-slate-700 text-xs sm:text-sm">{visit.lyDoKham}</p>
                            </div>
                            <div>
                              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">
                                Chẩn đoán và Kết luận của Bác sĩ:
                              </span>
                              <div className="bg-blue-50/50 border border-blue-100 p-3 rounded-xl">
                                <p className="text-slate-800 text-xs sm:text-sm font-semibold">{visit.ketLuan}</p>
                                {visit.icdList && visit.icdList.length > 0 && (
                                  <div className="flex flex-wrap gap-1.5 mt-2">
                                    {visit.icdList.map(icd => (
                                      <span key={icd.maICD} className="text-[10px] sm:text-xs font-semibold bg-white border border-blue-200 text-blue-600 px-2 py-0.5 rounded-full" title={icd.tenBenh}>
                                        [{icd.maICD}] {icd.tenBenh}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* CLS tests results */}
                        {visit.clsList && visit.clsList.length > 0 && (
                          <div className="border-t border-slate-100 pt-4">
                            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1 mb-2.5">
                              <ClipboardList size={14} className="text-blue-600" /> Kết quả dịch vụ kỹ thuật cận lâm sàng
                            </span>
                            <div className="space-y-2">
                              {visit.clsList.map((cls, idx) => (
                                <div key={idx} className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs sm:text-sm">
                                  <div className="flex justify-between font-semibold text-slate-800 mb-1">
                                    <span>{cls.tenDV}</span>
                                    <span className="text-emerald-600 text-xs bg-emerald-50 px-2 py-0.5 rounded-full">Đã thực hiện</span>
                                  </div>
                                  <p className="text-slate-500 italic">{cls.ketQua || 'Bình thường, không phát hiện dấu hiệu bất thường.'}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Prescription */}
                        {visit.donThuoc && visit.donThuoc.length > 0 && (
                          <div className="border-t border-slate-100 pt-4">
                            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1 mb-2.5">
                              <Pill size={14} className="text-blue-600" /> Đơn thuốc điều trị được cấp phát
                            </span>
                            <div className="overflow-x-auto">
                              <table className="w-full text-left text-xs sm:text-sm">
                                <thead>
                                  <tr className="text-slate-400 border-b border-slate-100">
                                    <th className="pb-2 font-semibold">Tên thuốc</th>
                                    <th className="pb-2 font-semibold text-center w-20">Số lượng</th>
                                    <th className="pb-2 font-semibold">Hướng dẫn sử dụng</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {visit.donThuoc.map((thuoc, idx) => (
                                    <tr key={idx} className="text-slate-700">
                                      <td className="py-2.5 font-semibold text-slate-800">{thuoc.tenThuoc}</td>
                                      <td className="py-2.5 text-center font-bold">{thuoc.soLuong} viên</td>
                                      <td className="py-2.5 text-slate-500 italic">{thuoc.cachDung}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm text-center">
                    <span className="text-xs text-slate-400 block">Lượt khám bệnh</span>
                    <strong className="text-slate-700 text-xs sm:text-sm mt-1 block">Bệnh nhân chưa có lịch sử lượt khám bệnh lý nào được lưu trữ.</strong>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="w-full max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 font-medium border-t border-slate-200/50 p-3 flex-shrink-0">
        <div>&copy; {new Date().getFullYear()} Phòng Khám Đa Khoa Nhật Tảo.</div>
      </footer>
    </div>
  );
}

export default CustomerPortal;
