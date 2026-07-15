import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, User, Phone, FileText, Search, Clock, 
  History, UserCheck, ShieldAlert, ClipboardList, Pill, 
  ArrowLeft, Heart, CheckCircle2, AlertCircle, Info, Activity
} from 'lucide-react';
import { useToast } from '../utils/ToastContext';
import { apiGetBacSiCongKhai, apiTraCuuHoSoCongKhai } from '../utils/api';

// Mock doctors database for customer view
const MOCK_DOCTORS = [
  {
    maNV: 'NV003',
    hoTen: 'Mai Xuân Phúc',
    chuyenMon: 'Tim mạch / Nội khoa',
    khoa: 'Nội tổng quát',
    bangCap: 'Thạc sĩ, Bác sĩ chuyên khoa I - Đại học Y Dược TP.HCM',
    kinhNghiem: 'Hơn 10 năm kinh nghiệm trong chẩn đoán và điều trị bệnh lý tim mạch, cao huyết áp và rối loạn chuyển hóa.',
    status: 'Đang làm việc'
  },
  {
    maNV: 'MOCK001',
    hoTen: 'Nguyễn Thị Minh Thư',
    chuyenMon: 'Cận lâm sàng / Siêu âm',
    khoa: 'Chẩn đoán hình ảnh',
    bangCap: 'Bác sĩ Đa khoa - Đại học Y khoa Phạm Ngọc Thạch',
    kinhNghiem: '8 năm kinh nghiệm chuyên sâu về chẩn đoán hình ảnh, siêu âm màu tuyến giáp, tim mạch và ổ bụng tổng quát.',
    status: 'Đang làm việc'
  },
  {
    maNV: 'MOCK002',
    hoTen: 'Trần Hoàng Bách',
    chuyenMon: 'Tai Mũi Họng / Nội soi',
    khoa: 'Chuyên khoa lẻ',
    bangCap: 'Bác sĩ chuyên khoa I - Đại học Y Hà Nội',
    kinhNghiem: '12 năm kinh nghiệm khám lâm sàng và thực hiện thủ thuật nội soi điều trị viêm xoang, viêm tai giữa ở người lớn và trẻ em.',
    status: 'Đang làm việc'
  }
];

// Seeded patient medical history database for client-side lookup
const SEEDED_PATIENT_RECORDS = {
  'bn260714001': {
    patient: {
      maBN: 'BN260714001',
      hoTen: 'MAI XUÂN KIÊN',
      sdt: '0896421137',
      ngaySinh: '18/03/2003',
      gioiTinh: 'Nam',
      diaChi: '180 Cao Lỗ, Phường 4, Quận 8, TP.HCM',
      tienSuBenh: 'Không có tiền sử dị ứng thuốc'
    },
    visits: [
      {
        maPhieu: 'PK_260714_001',
        ngayKham: '14/07/2026 15:30',
        tenBacSi: 'Mai Xuân Phúc',
        lyDoKham: 'Kiểm tra sức khỏe tổng quát định kỳ',
        mach: '72',
        nhietDo: '36.8',
        huyetAp: '120/80',
        canNang: '68',
        chieuCao: '172',
        ketLuan: 'Sức khỏe lâm sàng bình thường, huyết áp ổn định',
        icdList: [{ maICD: 'Z00.0', tenBenh: 'Khám sức khỏe tổng quát định kỳ' }],
        clsList: [
          { tenDV: 'Siêu âm ổ bụng tổng quát', ketQua: 'Hình ảnh ổ bụng bình thường, chưa phát hiện bệnh lý', trangThaiDichVu: 1 }
        ],
        donThuoc: [
          { tenThuoc: 'Multivitamin tổng quát', soLuong: 30, cachDung: 'Uống 1 viên vào buổi sáng sau ăn' }
        ]
      }
    ]
  },
  '0896421137': {
    patient: {
      maBN: 'BN260714001',
      hoTen: 'MAI XUÂN KIÊN',
      sdt: '0896421137',
      ngaySinh: '18/03/2003',
      gioiTinh: 'Nam',
      diaChi: '180 Cao Lỗ, Phường 4, Quận 8, TP.HCM',
      tienSuBenh: 'Không có tiền sử dị ứng thuốc'
    },
    visits: [
      {
        maPhieu: 'PK_260714_001',
        ngayKham: '14/07/2026 15:30',
        tenBacSi: 'Mai Xuân Phúc',
        lyDoKham: 'Kiểm tra sức khỏe tổng quát định kỳ',
        mach: '72',
        nhietDo: '36.8',
        huyetAp: '120/80',
        canNang: '68',
        chieuCao: '172',
        ketLuan: 'Sức khỏe lâm sàng bình thường, huyết áp ổn định',
        icdList: [{ maICD: 'Z00.0', tenBenh: 'Khám sức khỏe tổng quát định kỳ' }],
        clsList: [
          { tenDV: 'Siêu âm ổ bụng tổng quát', ketQua: 'Hình ảnh ổ bụng bình thường, chưa phát hiện bệnh lý', trangThaiDichVu: 1 }
        ],
        donThuoc: [
          { tenThuoc: 'Multivitamin tổng quát', soLuong: 30, cachDung: 'Uống 1 viên vào buổi sáng sau ăn' }
        ]
      }
    ]
  },
  'bn260703001': {
    patient: {
      maBN: 'BN260703001',
      hoTen: 'PHAN NHẬT PHÁT',
      sdt: '0896431456',
      ngaySinh: '09/12/2007',
      gioiTinh: 'Nam',
      diaChi: '22/3A Nguyễn Tri Phương, Quận 5, TP.HCM',
      tienSuBenh: 'Thiếu máu nhẹ'
    },
    visits: [
      {
        maPhieu: 'PK_260703_001',
        ngayKham: '03/07/2026 21:54',
        tenBacSi: 'Mai Xuân Phúc',
        lyDoKham: 'Đau đầu dữ dội kèm chóng mặt ù tai',
        mach: '65',
        nhietDo: '37.0',
        huyetAp: '125/87',
        canNang: '80',
        chieuCao: '183',
        ketLuan: 'Thiểu năng tuần hoàn não cấp tính, cơ thể suy nhược do áp lực',
        icdList: [{ maICD: 'G45.9', tenBenh: 'Cơn thiếu máu não cục bộ thoáng qua, không xác định' }],
        clsList: [
          { tenDV: 'Siêu âm ổ bụng tổng quát', ketQua: 'Gan nhiễm mỡ nhẹ độ 1, nhu mô thận và lách bình thường', trangThaiDichVu: 1 },
          { tenDV: 'Siêu âm tim màu', ketQua: 'Chức năng tâm thu thất trái bình thường, các van tim thanh mảnh hoạt động tốt', trangThaiDichVu: 1 },
          { tenDV: 'Siêu âm tuyến giáp', ketQua: 'Chưa thấy nhân giáp bất thường, thùy tuyến giáp hai bên kích thước bình thường', trangThaiDichVu: 1 }
        ],
        donThuoc: [
          { tenThuoc: 'Paracetamol 500mg', soLuong: 10, cachDung: 'Ngày uống 2 lần, mỗi lần 1 viên sau ăn khi đau' },
          { tenThuoc: 'Piracetam 800mg', soLuong: 20, cachDung: 'Ngày uống 2 lần, mỗi lần 1 viên vào sáng và trưa' }
        ]
      }
    ]
  },
  '0896431456': {
    patient: {
      maBN: 'BN260703001',
      hoTen: 'PHAN NHẬT PHÁT',
      sdt: '0896431456',
      ngaySinh: '09/12/2007',
      gioiTinh: 'Nam',
      diaChi: '22/3A Nguyễn Tri Phương, Quận 5, TP.HCM',
      tienSuBenh: 'Thiếu máu nhẹ'
    },
    visits: [
      {
        maPhieu: 'PK_260703_001',
        ngayKham: '03/07/2026 21:54',
        tenBacSi: 'Mai Xuân Phúc',
        lyDoKham: 'Đau đầu dữ dội kèm chóng mặt ù tai',
        mach: '65',
        nhietDo: '37.0',
        huyetAp: '125/87',
        canNang: '80',
        chieuCao: '183',
        ketLuan: 'Thiểu năng tuần hoàn não cấp tính, cơ thể suy nhược do áp lực',
        icdList: [{ maICD: 'G45.9', tenBenh: 'Cơn thiếu máu não cục bộ thoáng qua, không xác định' }],
        clsList: [
          { tenDV: 'Siêu âm ổ bụng tổng quát', ketQua: 'Gan nhiễm mỡ nhẹ độ 1, nhu mô thận và lách bình thường', trangThaiDichVu: 1 },
          { tenDV: 'Siêu âm tim màu', ketQua: 'Chức năng tâm thu thất trái bình thường, các van tim thanh mảnh hoạt động tốt', trangThaiDichVu: 1 },
          { tenDV: 'Siêu âm tuyến giáp', ketQua: 'Chưa thấy nhân giáp bất thường, thùy tuyến giáp hai bên kích thước bình thường', trangThaiDichVu: 1 }
        ],
        donThuoc: [
          { tenThuoc: 'Paracetamol 500mg', soLuong: 10, cachDung: 'Ngày uống 2 lần, mỗi lần 1 viên sau ăn khi đau' },
          { tenThuoc: 'Piracetam 800mg', soLuong: 20, cachDung: 'Ngày uống 2 lần, mỗi lần 1 viên vào sáng và trưa' }
        ]
      }
    ]
  }
};

function CustomerPortal() {
  const navigate = useNavigate();
  const { showSuccess, showError, showWarning } = useToast();

  const [activeTab, setActiveTab] = useState('book'); // book | doctors | search

  // State biểu mẫu đăng ký lịch hẹn
  const [bookingForm, setBookingForm] = useState({
    hoTenKhach: '',
    sdt: '',
    ngayHen: '',
    yeuCauKham: ''
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
    : MOCK_DOCTORS;

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

      showSuccess(`Đặt lịch hẹn khám thành công! Mã lịch hẹn: ${nextCode}`);

      // Chuyển sang hiển thị chi tiết đặt lịch
      setSearchResult({
        patient: {
          maBN: 'Chưa có (Bệnh nhân mới)',
          hoTen: newAppointment.hoTenKhach,
          sdt: newAppointment.sdt,
          ngaySinh: '—',
          gioiTinh: '—',
          diaChi: '—',
          tienSuBenh: '—'
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
        ngayHen: ngayHen,
        yeuCauKham: ''
      });
    } catch (err) {
      console.error(err);
      showError('Không thể lưu lịch hẹn vào bộ nhớ!');
    }
  };

  // Tra cứu lịch sử bệnh án / lịch hẹn
  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    
    const maBN = searchMaBN.trim();
    const sdt = searchSdt.trim();

    if (!maBN && !sdt) {
      showError('Vui lòng nhập Mã bệnh nhân hoặc Số điện thoại để tra cứu!');
      return;
    }

    setSearching(true);
    setSearched(false);
    setSearchResult(null);

    // 1. Kiểm tra xem có khớp dữ liệu Seeded/Mock tĩnh không
    const mockKey = maBN.toLowerCase() || sdt;
    if (SEEDED_PATIENT_RECORDS[mockKey]) {
      const mockRecord = SEEDED_PATIENT_RECORDS[mockKey];
      // Nếu nhập cả hai, đảm bảo khớp cả SDT
      if (!maBN || !sdt || mockRecord.patient.sdt === sdt) {
        // Lấy lịch hẹn từ localStorage
        let matchedAppts = [];
        try {
          const allDatLich = JSON.parse(localStorage.getItem('danhSachDatLich') || '[]');
          matchedAppts = allDatLich.filter(appt => appt.sdt === mockRecord.patient.sdt);
        } catch (err) {
          console.error(err);
        }

        setSearchResult({
          patient: mockRecord.patient,
          visits: mockRecord.visits,
          appointments: matchedAppts.sort((a, b) => new Date(b.ngayHen) - new Date(a.ngayHen))
        });
        setSearched(true);
        setSearching(false);
        showSuccess('Tìm thấy thông tin hồ sơ bệnh lý người bệnh (Dữ liệu mẫu)!');
        return;
      }
    }

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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between relative overflow-hidden">
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
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* Navigation Tabs */}
        <div className="flex bg-white rounded-2xl p-1.5 shadow-sm border border-slate-200 mb-8 max-w-md mx-auto">
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
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm max-w-2xl mx-auto">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Calendar size={20} className="text-blue-600" />
                Đăng Ký Đặt Lịch Hẹn Khám Trực Tuyến
              </h2>
              <p className="text-slate-500 text-xs sm:text-sm mt-1">
                Vui lòng nhập đầy đủ thông tin để đăng ký lịch hẹn khám. Lễ tân sẽ gọi điện thoại xác nhận trong vòng 15 phút.
              </p>
            </div>

            <form onSubmit={handleBookAppointment} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                    Họ và tên người khám <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3.5 text-slate-400"><User size={16} /></span>
                    <input 
                      type="text"
                      name="hoTenKhach"
                      value={bookingForm.hoTenKhach}
                      onChange={handleInputChange}
                      placeholder="NGUYỄN VĂN A"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                    Số điện thoại liên hệ <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3.5 text-slate-400"><Phone size={16} /></span>
                    <input 
                      type="text"
                      name="sdt"
                      value={bookingForm.sdt}
                      onChange={handleInputChange}
                      placeholder="0901234567"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm transition-all"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Ngày muốn hẹn khám <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3.5 text-slate-400"><Clock size={16} /></span>
                  <input 
                    type="date"
                    name="ngayHen"
                    value={bookingForm.ngayHen}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Lý do khám / Triệu chứng bệnh lý
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3.5 text-slate-400"><FileText size={16} /></span>
                  <textarea 
                    name="yeuCauKham"
                    value={bookingForm.yeuCauKham}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Mô tả sơ lược triệu chứng như: Đau họng, ho kéo dài, đau nhức xương khớp..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm transition-all"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-500/20 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={18} />
                Đăng Ký Đặt Hẹn Ngay
              </button>
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
                    placeholder="Nhập Mã bệnh nhân (VD: BN260714001)"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm transition-all"
                  />
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-3.5 text-slate-400"><Phone size={16} /></span>
                  <input 
                    type="text"
                    value={searchSdt}
                    onChange={(e) => setSearchSdt(e.target.value)}
                    placeholder="Nhập Số điện thoại (VD: 0896421137)"
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

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 font-medium border-t border-slate-200/50 p-6">
        <div>&copy; {new Date().getFullYear()} Phòng Khám Đa Khoa Nhật Tảo. Bảo lưu mọi quyền.</div>
        <div className="flex gap-4 mt-2 sm:mt-0">
          <a href="#" className="hover:text-slate-600 transition-colors">Điều khoản dịch vụ</a>
          <span>&middot;</span>
          <a href="#" className="hover:text-slate-600 transition-colors">Chính sách bảo mật</a>
        </div>
      </footer>
    </div>
  );
}

export default CustomerPortal;
