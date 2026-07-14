import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { 
  ArrowLeft, Search, User, Calendar, Receipt, Printer, CheckCircle, 
  AlertCircle, Plus, Trash2, FileText, Activity, Pill, ClipboardList, CreditCard
} from 'lucide-react';
import { useToast } from '../utils/ToastContext';
import { apiGetDichVuCLSList } from '../utils/api';


// Từ điển đơn giá dịch vụ cận lâm sàng dự phòng
const FALLBACK_SERVICE_PRICES = {
  'DV001': 150000,
  'DV002': 120000,
  'DV003': 90000,
  'DV004': 50000,
  'DV005': 80000,
  'DV006': 300000
};

// Từ điển đơn giá thuốc dự phòng
const FALLBACK_DRUG_PRICES = {
  'Paracetamol 500mg': 2000,
  'Amoxicillin 500mg': 4000,
  'Panadol Extra': 3000,
  'Decolgen Forte': 3500,
  'Gaviscon Dual Action': 25000,
  'Augmentin 1g': 18000,
  'default': 5000
};

// Từ điển vật tư y tế dự phòng
const FALLBACK_SUPPLY_PRICES = {
  'Găng tay y tế': 3000,
  'Bơm kim tiêm 5ml': 5000,
  'Bông băng cồn sát trùng': 15000,
  'Nước muối sinh lý': 12000,
  'default': 8000
};

// Hàm quy đổi liều dùng đơn thuốc sang tổng số lượng thuốc
const parseDrugQuantity = (soLuongStr, soNgay) => {
  const days = parseInt(soNgay, 10) || 1;
  if (!soLuongStr) return 2 * days;
  
  // Trích xuất dạng "X viên x Y lần"
  const match = soLuongStr.match(/(\d+)\s*(viên|gói|ống|chai|vỉ|hộp|tuýp)?\s*[x/*]\s*(\d+)/i);
  if (match) {
    const qtyPerTime = parseInt(match[1], 10) || 1;
    const timesPerDay = parseInt(match[3], 10) || 1;
    return qtyPerTime * timesPerDay * days;
  }
  
  // Trích xuất dạng "X viên/ngày"
  const matchDay = soLuongStr.match(/(\d+)\s*(viên|gói|ống|chai|vỉ|hộp|tuýp)?\s*\/\s*ngày/i);
  if (matchDay) {
    return (parseInt(matchDay[1], 10) || 1) * days;
  }
  
  // Lấy các chữ số bất kỳ
  const numbers = soLuongStr.match(/\d+/g);
  if (numbers && numbers.length >= 2) {
    return parseInt(numbers[0], 10) * parseInt(numbers[1], 10) * days;
  } else if (numbers && numbers.length === 1) {
    return parseInt(numbers[0], 10) * days;
  }
  
  return 2 * days;
};

/**
 * Component chính quản lý màn hình thanh toán hóa đơn viện phí
 */
function ThanhToanHoaDon() {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  
  // Các state lưu trữ danh sách phiếu khám và phiếu được chọn
  const [dsPhieuKham, setDsPhieuKham] = useState([]);
  const [selectedPhieu, setSelectedPhieu] = useState(null);
  
  // Các state lưu trữ danh mục từ LocalStorage
  const [danhMucDichVu, setDanhMucDichVu] = useState([]);
  const [danhMucThuoc, setDanhMucThuoc] = useState([]);
  const [danhMucVatTu, setDanhMucVatTu] = useState([]);
  
  // State quản lý phương thức thanh toán ('Tiền mặt' hoặc 'Chuyển khoản')
  const [phuongThucTT, setPhuongThucTT] = useState('Tiền mặt');
  
  // State quản lý việc thêm vật tư trực tiếp khi lập hóa đơn
  const [showVatTuModal, setShowVatTuModal] = useState(false);
  const [vatTuMoi, setVatTuMoi] = useState({ tenVT: '', soLuong: 1, donGia: 10000 });
  const [selectedLotVatTu, setSelectedLotVatTu] = useState('');

  // Các bộ lọc tìm kiếm danh sách phiếu thu
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All', 'Unpaid', 'Paid'

  // Thu ngân đang thao tác
  const [thuNgan, setThuNgan] = useState('Thu ngân hệ thống');

  // Banner thông báo thanh toán thành công không chặn màn hình
  const [successMessage, setSuccessMessage] = useState('');

  // Load danh sách dữ liệu từ LocalStorage khi khởi chạy
  useEffect(() => {
    // Lấy thông tin tài khoản hiện tại làm thu ngân
    try {
      const curUser = localStorage.getItem('currentUser');
      if (curUser) {
        const parsed = JSON.parse(curUser);
        if (parsed.name) setThuNgan(parsed.name);
      }
    } catch(e) {}

    // Khởi tạo/Load dữ liệu phiếu khám bệnh
    try {
      const storedPK = localStorage.getItem('danhSachPhieuKham');
      let currentList = [];
      const mockPK = [
        {
          maPhieu: 'PK_260527_001',
          maBN: 'BN260001',
          hoTen: 'NGUYỄN VĂN AN',
          ngaySinh: '15/03/1980',
          gioiTinh: 'Nam',
          sdt: '0901234567',
          diaChi: '123 Nguyễn Trãi, Phường 2, Quận 5, TP. Hồ Chí Minh',
          tienSuBenh: 'Tăng huyết áp, Đái tháo đường typ 2',
          maNV: 'NV002',
          tenBacSi: 'BS. CK1. Nguyễn Văn An (Nội tổng quát)',
          lyDoKham: 'Đau đầu, chóng mặt, mệt mỏi kéo dài',
          chanDoan: 'Tăng huyết áp vô căn (nguyên phát)',
          loiDan: 'Ăn nhạt, hạn chế mỡ động vật, uống thuốc đúng giờ.',
          ngayKham: '2026-05-27T11:00:00.000Z',
          trangThai: 3, // Trạng thái hoàn thành khám
          chiDinh: [
            { id: 1, tenXN: 'Siêu âm ổ bụng tổng quát' },
            { id: 2, tenXN: 'Xét nghiệm công thức máu toàn bộ (24 chỉ số)' }
          ],
          donThuoc: [
            { id: 101, tenThuoc: 'Paracetamol 500mg', soLuong: '1 viên x 3 lần', soNgay: 7 },
            { id: 102, tenThuoc: 'Decolgen Forte', soLuong: '1 viên x 2 lần', soNgay: 5 }
          ],
          vatTu: [
            { id: 201, tenVT: 'Găng tay y tế', soLuong: 2, donGia: 3000 },
            { id: 202, tenVT: 'Bơm kim tiêm 5ml', soLuong: 1, donGia: 5000 }
          ],
          daThanhToan: false
        },
        {
          maPhieu: 'PK_260527_002',
          maBN: 'BN260002',
          hoTen: 'TRẦN THỊ BÌNH',
          ngaySinh: '20/08/1992',
          gioiTinh: 'Nữ',
          sdt: '0918765432',
          diaChi: '456 Lê Lợi, Bến Nghé, Quận 1, TP. Hồ Chí Minh',
          tienSuBenh: 'Dị ứng thuốc Penicillin',
          maNV: 'NV003',
          tenBacSi: 'BS. CK2. Trần Thị Bình (Tim mạch)',
          lyDoKham: 'Tức ngực nhẹ, khó thở khi gắng sức',
          chanDoan: 'Nhịp tim nhanh không xác định',
          loiDan: 'Hạn chế vận động nặng, tái khám sau 1 tuần',
          ngayKham: '2026-05-27T12:30:00.000Z',
          trangThai: 3,
          chiDinh: [
            { id: 3, tenXN: 'Điện tâm đồ (ECG)' },
            { id: 4, tenXN: 'Siêu âm tim màu' }
          ],
          donThuoc: [
            { id: 103, tenThuoc: 'Panadol Extra', soLuong: '1 viên x 2 lần', soNgay: 3 }
          ],
          vatTu: [
            { id: 203, tenVT: 'Bông băng cồn sát trùng', soLuong: 1, donGia: 15000 }
          ],
          daThanhToan: true,
          phuongThucTT: 'Chuyển khoản',
          ngayThanhToan: '2026-05-27T13:45:00.000Z',
          tienChiTra: 380000,
          tienBHYT: 0,
          tienNguoiBenhTra: 380000,
          thuNgan: 'Mai Xuân Phát'
        }
      ];

      if (storedPK) {
        currentList = JSON.parse(storedPK);
        let needsSave = false;
        mockPK.forEach(mock => {
          const exists = currentList.some(item => item.maPhieu === mock.maPhieu);
          if (!exists) {
            currentList.push(mock);
            needsSave = true;
          }
        });
        if (needsSave) {
          localStorage.setItem('danhSachPhieuKham', JSON.stringify(currentList));
        }
      } else {
        currentList = mockPK;
        localStorage.setItem('danhSachPhieuKham', JSON.stringify(currentList));
      }
      setDsPhieuKham(currentList);

      // Mặc định chọn bệnh nhân đầu tiên chưa thanh toán
      const firstUnpaid = currentList.find(p => p.trangThai === 3 && !p.daThanhToan);
      if (firstUnpaid) {
        setSelectedPhieu(firstUnpaid);
      } else {
        const firstPaid = currentList.find(p => p.trangThai === 3);
        if (firstPaid) setSelectedPhieu(firstPaid);
      }
    } catch(e) {}

    // Fetch danh mục dịch vụ cận lâm sàng từ Backend
    const fetchDichVuCLS = async () => {
      try {
        const response = await apiGetDichVuCLSList('', '', null, 1, 100);
        if (response && response.data) {
          const mappedData = response.data.map(item => ({
            maDV: item.MaDV || item.maDV || '',
            tenDV: item.TenDV || item.tenDV || '',
            giaTien: item.GiaTien !== undefined && item.GiaTien !== null ? item.GiaTien : 0,
            trangThai: item.TrangThai !== undefined ? item.TrangThai : true
          }));
          setDanhMucDichVu(mappedData);
          return;
        }
      } catch (err) {
        console.error("Failed to load services from backend, using fallback:", err);
      }
      
      // Fallback
      try {
        const storedDV = localStorage.getItem('danhMucDichVuCLS');
        if (storedDV) setDanhMucDichVu(JSON.parse(storedDV));
      } catch (e) {}
    };

    fetchDichVuCLS();
    
    try {
      const storedThuoc = localStorage.getItem('danhMucThuoc');
      if (storedThuoc) setDanhMucThuoc(JSON.parse(storedThuoc));

      const storedVT = localStorage.getItem('danhMucVatTu');
      if (storedVT) setDanhMucVatTu(JSON.parse(storedVT));
    } catch(e) {}
  }, [navigate]);


  // Đồng bộ phương thức thanh toán của phiếu khi thay đổi bệnh nhân
  useEffect(() => {
    if (selectedPhieu) {
      setPhuongThucTT(selectedPhieu.phuongThucTT || 'Tiền mặt');
    }
  }, [selectedPhieu]);

  // Lắng nghe sự kiện bàn phím (F12 để thanh toán nhanh, F8 để in phiếu)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'F12') {
        e.preventDefault();
        if (selectedPhieu && !selectedPhieu.daThanhToan) {
          handleExecutePayment();
        }
      } else if (e.key === 'F8') {
        e.preventDefault();
        if (selectedPhieu && selectedPhieu.daThanhToan) {
          handlePrintInvoice();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  // Quy đổi định dạng ngày giờ tiếng Việt
  const getVietnameseDateString = (dateStr) => {
    const d = dateStr ? new Date(dateStr) : new Date();
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `Ngày ${day} tháng ${month} năm ${year} lúc ${hours}:${minutes}`;
  };

  // Tra cứu đơn giá dịch vụ cận lâm sàng
  const getServicePrice = (tenXN) => {
    const found = danhMucDichVu.find(dv => dv.tenDV.toLowerCase().trim() === tenXN.toLowerCase().trim());
    if (found) return found.giaTien;
    
    const defaultDichVuDataForLookup = [
      { maDV: 'DV001', tenDV: 'Siêu âm ổ bụng tổng quát' },
      { maDV: 'DV002', tenDV: 'X-Quang ngực thẳng (Kỹ thuật số)' },
      { maDV: 'DV003', tenDV: 'Xét nghiệm công thức máu toàn bộ (24 chỉ số)' },
      { maDV: 'DV004', tenDV: 'Xét nghiệm đường huyết (Glucose)' },
      { maDV: 'DV005', tenDV: 'Điện tâm đồ (ECG)' },
      { maDV: 'DV006', tenDV: 'Siêu âm tim màu' }
    ];

    for (const [key, value] of Object.entries(FALLBACK_SERVICE_PRICES)) {
      const fallbackItem = defaultDichVuDataForLookup.find(item => item.maDV === key);
      if (fallbackItem && fallbackItem.tenDV.toLowerCase().includes(tenXN.toLowerCase())) {
        return value;
      }
    }
    return 100000;
  };

  // Tra cứu đơn giá thuốc
  const getDrugPrice = (tenThuoc) => {
    const cleanName = Object.keys(FALLBACK_DRUG_PRICES).find(name => tenThuoc.toLowerCase().includes(name.toLowerCase()));
    if (cleanName) return FALLBACK_DRUG_PRICES[cleanName];
    return FALLBACK_DRUG_PRICES['default'];
  };

  // Tra cứu đơn giá vật tư
  const getSupplyPrice = (tenVT) => {
    const cleanName = Object.keys(FALLBACK_SUPPLY_PRICES).find(name => tenVT.toLowerCase().includes(name.toLowerCase()));
    if (cleanName) return FALLBACK_SUPPLY_PRICES[cleanName];
    return FALLBACK_SUPPLY_PRICES['default'];
  };

  // Tính toán tổng hợp chi phí hóa đơn chi tiết
  const getBillingDetails = (phieu) => {
    if (!phieu) return { services: [], drugs: [], supplies: [], totalServices: 0, totalDrugs: 0, totalSupplies: 0, grandTotal: 0 };

    const services = (phieu.chiDinh || []).map((c, idx) => {
      const price = getServicePrice(c.tenXN);
      return {
        stt: idx + 1,
        tenItem: c.tenXN,
        soLuong: 1,
        donGia: price,
        thanhTien: price,
        type: 'CLS'
      };
    });

    const drugs = (phieu.donThuoc || []).map((t, idx) => {
      const qty = parseDrugQuantity(t.soLuong, t.soNgay);
      const price = getDrugPrice(t.tenThuoc);
      const subTotal = qty * price;
      return {
        stt: idx + 1,
        tenItem: t.tenThuoc,
        soLuong: qty,
        lieuDung: t.soLuong,
        soNgay: t.soNgay,
        donGia: price,
        thanhTien: subTotal,
        type: 'Thuoc'
      };
    });

    const supplies = (phieu.vatTu || []).map((v, idx) => {
      const price = v.donGia || getSupplyPrice(v.tenVT);
      const subTotal = v.soLuong * price;
      return {
        id: v.id,
        stt: idx + 1,
        tenItem: v.tenVT,
        soLuong: v.soLuong,
        donGia: price,
        thanhTien: subTotal,
        type: 'VatTu'
      };
    });

    const totalServices = services.reduce((sum, item) => sum + item.thanhTien, 0);
    const totalDrugs = drugs.reduce((sum, item) => sum + item.thanhTien, 0);
    const totalSupplies = supplies.reduce((sum, item) => sum + item.thanhTien, 0);
    const grandTotal = totalServices + totalDrugs + totalSupplies;

    return { services, drugs, supplies, totalServices, totalDrugs, totalSupplies, grandTotal };
  };

  // Thêm vật tư y tế trực tiếp vào phiếu thu
  const handleAddSupply = (e) => {
    e.preventDefault();
    if (!vatTuMoi.tenVT) {
      showError("Vui lòng chọn hoặc điền tên vật tư y tế!");
      return;
    }
    if (vatTuMoi.soLuong <= 0) {
      showError("Số lượng vật tư phải lớn hơn 0!");
      return;
    }

    const price = getSupplyPrice(vatTuMoi.tenVT);
    const newSupplyItem = {
      id: Date.now(),
      tenVT: vatTuMoi.tenVT,
      soLuong: parseInt(vatTuMoi.soLuong, 10),
      donGia: price
    };

    const updatedVatTu = [...(selectedPhieu.vatTu || []), newSupplyItem];
    const updatedPhieu = { ...selectedPhieu, vatTu: updatedVatTu };

    const updatedList = dsPhieuKham.map(pk => pk.maPhieu === selectedPhieu.maPhieu ? updatedPhieu : pk);
    setDsPhieuKham(updatedList);
    setSelectedPhieu(updatedPhieu);
    localStorage.setItem('danhSachPhieuKham', JSON.stringify(updatedList));

    setVatTuMoi({ tenVT: '', soLuong: 1, donGia: 10000 });
    setSelectedLotVatTu('');
    setShowVatTuModal(false);
  };

  // Xóa vật tư tiêu hao khỏi danh sách kê
  const handleDeleteSupply = (vId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa vật tư này khỏi phiếu thu?")) {
      const updatedVatTu = (selectedPhieu.vatTu || []).filter(v => v.id !== vId);
      const updatedPhieu = { ...selectedPhieu, vatTu: updatedVatTu };
      const updatedList = dsPhieuKham.map(pk => pk.maPhieu === selectedPhieu.maPhieu ? updatedPhieu : pk);
      setDsPhieuKham(updatedList);
      setSelectedPhieu(updatedPhieu);
      localStorage.setItem('danhSachPhieuKham', JSON.stringify(updatedList));
    }
  };

  // Xác nhận và thực hiện thanh toán hóa đơn
  const handleExecutePayment = () => {
    if (!selectedPhieu) return;

    const { grandTotal } = getBillingDetails(selectedPhieu);
    const patientShare = grandTotal;

    const paidPhieu = {
      ...selectedPhieu,
      daThanhToan: true,
      phuongThucTT: phuongThucTT,
      ngayThanhToan: new Date().toISOString(),
      tienChiTra: grandTotal,
      tienBHYT: 0,
      tienNguoiBenhTra: patientShare,
      thuNgan: thuNgan
    };

    const updatedList = dsPhieuKham.map(pk => pk.maPhieu === selectedPhieu.maPhieu ? paidPhieu : pk);
    setDsPhieuKham(updatedList);
    setSelectedPhieu(paidPhieu);
    localStorage.setItem('danhSachPhieuKham', JSON.stringify(updatedList));

    setSuccessMessage(`Thanh toán thành công hóa đơn của bệnh nhân ${selectedPhieu.hoTen}! Số tiền: ${patientShare.toLocaleString('vi-VN')} đ`);
    setTimeout(() => {
      setSuccessMessage('');
    }, 5000);

    setTimeout(() => {
      window.print();
    }, 150);
  };

  // Lệnh in hóa đơn thanh toán
  const handlePrintInvoice = () => {
    window.print();
  };

  // Lọc danh sách theo truy vấn tìm kiếm
  const filteredPhieuKham = dsPhieuKham.filter(pk => {
    if (pk.trangThai !== 3) return false;

    const matchSearch = 
      pk.hoTen.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pk.maBN?.includes(searchQuery) ||
      pk.maPhieu?.includes(searchQuery);

    if (statusFilter === 'All') return matchSearch;
    if (statusFilter === 'Unpaid') return matchSearch && !pk.daThanhToan;
    if (statusFilter === 'Paid') return matchSearch && pk.daThanhToan;
    return matchSearch;
  });

  const { services, drugs, supplies, totalServices, totalDrugs, totalSupplies, grandTotal } = getBillingDetails(selectedPhieu);

  return (
    <div className="kb-wrapper h-screen overflow-hidden">
      
      {/* Topbar điều hướng */}
      <div className="kb-topbar hide-on-print h-[50px] px-5 flex items-center justify-between border-b border-[var(--border-color)] bg-white">
        <div className="flex-1 flex justify-start">
          <button className="kb-back-btn py-[5px] px-[10px]" onClick={() => navigate('/staff')}>
            <ArrowLeft size={16} /> Quay về trang chủ
          </button>
        </div>
        <div className="kb-topbar-title flex-1 flex justify-center items-center text-[15px]">
          <Receipt size={18} className="mr-[6px]" />
          <strong>Thanh toán & Xuất hóa đơn viện phí</strong>
        </div>
        <div className="flex-1 flex justify-end text-[12px] opacity-85">
          <span>Quầy thu ngân / {thuNgan}</span>
        </div>
      </div>

      {/* Main split dashboard area */}
      <div className="kb-body flex h-[calc(100vh-50px)] bg-[var(--bg-main)] overflow-hidden">
        
        {/* CỘT TRÁI: Danh sách phiếu thu */}
        <div className="hide-on-print flex-[1.1] flex flex-col border-r border-[var(--border-color)] h-full bg-white">
          <div className="p-[14px] border-b border-[var(--border-color)] bg-[var(--bg-main)]">
            <div className="flex items-center gap-[6px] mb-3">
              <Receipt size={16} style={{ color: 'var(--primary)' }} />
              <h3 className="text-[14px] font-[750] text-[var(--text-main)] m-0">DANH SÁCH PHIẾU THU VIỆN PHÍ</h3>
            </div>
            
            {/* Thanh tìm kiếm */}
            <div className="search-box mb-2.5 relative">
              <input 
                type="text" 
                placeholder="Tìm mã BN, mã hồ sơ, tên..." 
                className="form-input pl-8 h-8 text-[12.5px]" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <Search size={14} className="absolute left-2.5 top-[9px] text-[var(--text-muted)]" />
            </div>

            {/* Tab lọc trạng thái */}
            <div className="flex gap-1 bg-[#e2e8f0] p-[2px] rounded-[6px]">
              <button 
                onClick={() => setStatusFilter('All')}
                className={`flex-1 py-[5px] px-[5px] border-none text-[11.5px] font-semibold rounded-[4px] cursor-pointer transition-all duration-150 ${statusFilter === 'All' ? 'bg-white text-inherit' : 'bg-transparent text-inherit'}`}
              >
                Tất cả ({dsPhieuKham.filter(p => p.trangThai === 3).length})
              </button>
              <button 
                onClick={() => setStatusFilter('Unpaid')}
                className={`flex-1 py-[5px] px-[5px] border-none text-[11.5px] font-semibold rounded-[4px] cursor-pointer transition-all duration-150 ${statusFilter === 'Unpaid' ? 'bg-white text-[#dc2626]' : 'bg-transparent text-[#dc2626]'}`}
              >
                Chưa TT ({dsPhieuKham.filter(p => p.trangThai === 3 && !p.daThanhToan).length})
              </button>
              <button 
                onClick={() => setStatusFilter('Paid')}
                className={`flex-1 py-[5px] px-[5px] border-none text-[11.5px] font-semibold rounded-[4px] cursor-pointer transition-all duration-150 ${statusFilter === 'Paid' ? 'bg-white text-[#16a34a]' : 'bg-transparent text-[#16a34a]'}`}
              >
                Đã TT ({dsPhieuKham.filter(p => p.trangThai === 3 && p.daThanhToan).length})
              </button>
            </div>
          </div>

          {/* List Item container */}
          <div className="flex-1 overflow-y-auto p-2">
            {filteredPhieuKham.length === 0 ? (
              <div className="text-center p-[30px] text-[var(--text-muted)] text-[13px]">
                Không tìm thấy lượt khám nào cần thanh toán.
              </div>
            ) : (
              filteredPhieuKham.map(pk => {
                const isSelected = selectedPhieu && selectedPhieu.maPhieu === pk.maPhieu;
                const { grandTotal: amount } = getBillingDetails(pk);
                const isPaid = pk.daThanhToan;
                
                return (
                  <div 
                    key={pk.maPhieu}
                    onClick={() => setSelectedPhieu(pk)}
                    className={`p-3 rounded-lg border cursor-pointer mb-2 transition-all duration-150 ease-in-out ${isSelected ? 'border-[var(--primary)] bg-[var(--primary-light)]' : 'border-[var(--border-color)] bg-white'}`}
                  >
                    <div className="flex justify-between mb-1.5">
                      <span className="text-[11px] font-bold text-[var(--text-muted)]">{pk.maPhieu}</span>
                      {isPaid ? (
                        <span className="text-[11px] text-[#16a34a] bg-[#dcfce7] py-[1px] px-2 rounded-[10px] font-bold">Đã TT</span>
                      ) : (
                        <span className="text-[11px] text-[#dc2626] bg-[#fee2e2] py-[1px] px-2 rounded-[10px] font-bold">Chưa TT</span>
                      )}
                    </div>
                    <div className="text-[13.5px] font-bold text-[var(--text-main)] mb-1">{pk.hoTen}</div>
                    <div className="flex justify-between items-center text-[12px]">
                      <span className="text-[var(--text-muted)]">Mã NB: {pk.maBN}</span>
                      <strong className="text-[#0052cc] text-[13.5px]">{amount.toLocaleString('vi-VN')} đ</strong>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* CỘT PHẢI: Chi tiết phiếu thu & Hóa đơn */}
        <div className="flex-[1.9] flex flex-col h-full bg-white">
          {selectedPhieu === null ? (
            <div className="hide-on-print h-full flex flex-col items-center justify-center text-[var(--text-muted)] text-center gap-3">
              <Receipt size={48} className="opacity-25 text-[var(--primary)]" />
              <div>
                <h4 className="font-semibold text-[var(--text-main)]">Chưa chọn phiếu thu</h4>
                <p className="text-[13px] mt-1">Chọn một lượt khám bệnh bên trái để tiến hành lập hóa đơn thanh toán.</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full overflow-y-auto">
              
              {/* PHẦN IN PHIẾU THU KHỔ K57 (Chỉ xuất hiện khi in ấn) */}
              {createPortal(
                <div className="print-only w-[54mm] py-2 px-[1px] text-[9.5px] text-black font-mono leading-[1.25] mx-auto">
                  <div className="text-center mb-1.5">
                    <h3 className="m-0 mb-[2px] text-[11px] font-bold">PHÒNG KHÁM ĐA KHOA NHẬT TẢO</h3>
                    <p className="m-0 mb-[1px] text-[8.5px]">Đ/c: 123 Nhật Tảo, Phường 4, Quận 10, TP. HCM</p>
                    <p className="m-0 text-[8.5px]">Hotline: 090 123 4567</p>
                  </div>

                  <div className="border-b border-dashed border-black my-1.25" />

                  <div className="text-center mb-2">
                    <h2 className="m-0 mb-[3px] text-[12px] font-bold">HÓA ĐƠN THANH TOÁN</h2>
                    <p className="m-0 text-[8.5px] italic">
                      {getVietnameseDateString(selectedPhieu.ngayThanhToan)}
                    </p>
                  </div>

                  <div className="flex flex-col gap-[2px] mb-1.5 text-[9px]">
                    <div>Mã NB: <b>{selectedPhieu.maBN}</b></div>
                    <div>Mã hồ sơ: <b>{selectedPhieu.maPhieu}</b></div>
                    <div>Họ tên: <b>{selectedPhieu.hoTen}</b></div>
                    <div>Ngày sinh: {selectedPhieu.ngaySinh} — Nam/Nữ: {selectedPhieu.gioiTinh}</div>
                    <div>
                      Chẩn đoán: {selectedPhieu.icdList && selectedPhieu.icdList.length > 0 ? (
                        <span>
                          [{selectedPhieu.icdList.map(x => x.maICD).join(', ')}] {selectedPhieu.chanDoan || 'Khám tự nguyện'}
                        </span>
                      ) : selectedPhieu.maICD ? (
                        <span>
                          [{selectedPhieu.maICD}] {selectedPhieu.chanDoan || 'Khám tự nguyện'}
                        </span>
                      ) : (
                        selectedPhieu.chanDoan || 'Khám tự nguyện'
                      )}
                    </div>
                    <div>BS chỉ định: {selectedPhieu.tenBacSi}</div>
                  </div>

                  <div className="border-b border-dashed border-black my-1.25" />

                  {/* Dịch vụ CLS */}
                  {services.length > 0 && (
                    <div className="mb-1.25">
                      <div className="font-bold text-[9px] mb-[2px]">[DỊCH VỤ KỸ THUẬT & CLS]</div>
                      {services.map((item, idx) => (
                        <div key={idx} className="pl-[2px] mb-[2px]">
                          <div>{idx + 1}. {item.tenItem}</div>
                          <div className="flex justify-between pl-2 text-[8.5px] text-[#222]">
                            <span>{item.soLuong} x {item.donGia.toLocaleString('vi-VN')}</span>
                            <span>{item.thanhTien.toLocaleString('vi-VN')} đ</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Thuốc đã kê */}
                  {drugs.length > 0 && (
                    <div className="mb-1.25">
                      <div className="font-bold text-[9px] mb-[2px]">[ĐƠN THUỐC ĐÃ KÊ]</div>
                      {drugs.map((item, idx) => (
                        <div key={idx} className="pl-[2px] mb-[2px]">
                          <div>{idx + 1}. {item.tenItem}</div>
                          <div className="flex justify-between pl-2 text-[8.5px] text-[#222]">
                            <span>{item.soLuong} ({item.lieuDung})</span>
                            <span>{item.thanhTien.toLocaleString('vi-VN')} đ</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Vật tư tiêu hao */}
                  {supplies.length > 0 && (
                    <div className="mb-1.25">
                      <div className="font-bold text-[9px] mb-[2px]">[VẬT TƯ TIÊU HAO]</div>
                      {supplies.map((item, idx) => (
                        <div key={idx} className="pl-[2px] mb-[2px]">
                          <div>{idx + 1}. {item.tenItem}</div>
                          <div className="flex justify-between pl-2 text-[8.5px] text-[#222]">
                            <span>{item.soLuong} x {item.donGia.toLocaleString('vi-VN')}</span>
                            <span>{item.thanhTien.toLocaleString('vi-VN')} đ</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="border-b border-dashed border-black my-1.25" />

                  <div className="flex flex-col gap-[3px] text-[9px] text-right">
                    <div>Phương thức: <b>{selectedPhieu.phuongThucTT || phuongThucTT}</b></div>
                    <div>Thu ngân: <b>{selectedPhieu.thuNgan || thuNgan}</b></div>
                    <div className="flex justify-between text-[11px] font-bold mt-[3px]">
                      <span>TỔNG TIỀN:</span>
                      <span>{grandTotal.toLocaleString('vi-VN')} đ</span>
                    </div>
                  </div>

                  <div className="border-b border-dashed border-black my-1.25" />

                  <div className="text-center mt-2.5 text-[8.5px]">
                    <p className="m-0 mb-[3px] italic">Cảm ơn quý khách. Hẹn gặp lại!</p>
                    <p className="m-0 font-bold text-[9.5px] uppercase">PHÒNG KHÁM ĐA KHOA NHẬT TẢO</p>
                  </div>
                </div>,
                document.body
              )}

              {/* PHẦN HIỂN THỊ TRÊN MÀN HÌNH FRONTEND */}
              <div className="hide-on-print p-5 flex flex-col gap-5">
                
                {successMessage && (
                  <div className="bg-[#dcfce7] border border-[#bbf7d0] text-[#16a34a] py-3 px-4 rounded-[var(--radius-lg)] text-[13px] font-semibold flex items-center gap-2 animate-[fadeIn_0.2s_ease-in-out]">
                    <CheckCircle size={16} />
                    {successMessage}
                  </div>
                )}
                
                {/* 1. Header chi tiết phiếu thu */}
                <div className="flex justify-between items-center bg-[#f8fafc] border border-[var(--border-color)] rounded-[var(--radius-lg)] py-4 px-5">
                  <div className="flex items-center gap-3">
                    <div className="w-[46px] h-[46px] rounded-full bg-[var(--primary-light)] text-[var(--primary)] flex items-center justify-center text-[18px] font-bold">
                      {selectedPhieu.hoTen ? selectedPhieu.hoTen.split(' ').pop().charAt(0) : 'BN'}
                    </div>
                    <div>
                      <h3 className="m-0 text-[16px] font-[750] text-[var(--text-main)]">{selectedPhieu.hoTen}</h3>
                      <p className="m-0 mt-1 text-[12.5px] text-[var(--text-muted)]">
                        Mã người bệnh: <b style={{ color: 'var(--text-main)' }}>{selectedPhieu.maBN}</b> | Mã hồ sơ: <b style={{ color: 'var(--text-main)' }}>{selectedPhieu.maPhieu}</b>
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    {selectedPhieu.daThanhToan ? (
                      <div className="inline-flex items-center gap-1.5 text-[#16a34a] bg-[#dcfce7] py-1.5 px-3.5 rounded-[20px] font-bold text-[13px] border border-[#bbf7d0]">
                        <CheckCircle size={15} /> Đã thanh toán
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 text-[#dc2626] bg-[#fee2e2] py-1.5 px-3.5 rounded-[20px] font-bold text-[13px] border border-[#fecaca]">
                        <AlertCircle size={15} /> Chưa thanh toán
                      </div>
                    )}
                    {selectedPhieu.daThanhToan && selectedPhieu.ngayThanhToan && (
                      <p className="m-0 mt-1.5 text-[11px] text-[var(--text-muted)]">
                        TT lúc: {new Date(selectedPhieu.ngayThanhToan).toLocaleString('vi-VN')}
                      </p>
                    )}
                  </div>
                </div>

                {/* 2. Thông tin chẩn đoán lâm sàng */}
                <div className="grid grid-cols-[1.2fr_1fr_1fr] gap-4 border border-[var(--border-color)] rounded-[var(--radius-lg)] p-4 text-[13px]">
                   <div>
                    <span className="text-[var(--text-muted)]">Chẩn đoán bệnh lý (ICD):</span>
                    {selectedPhieu.icdList && selectedPhieu.icdList.length > 0 ? (
                      <div className="flex flex-wrap gap-1 mt-1 mb-1">
                        {selectedPhieu.icdList.map(item => (
                          <span key={item.maICD} className="bg-[#eff6ff] border border-[#bfdbfe] text-[#1e40af] px-1.5 py-[1px] rounded text-[11px] font-medium" title={item.tenBenh}>
                            {item.maICD}
                          </span>
                        ))}
                      </div>
                    ) : selectedPhieu.maICD ? (
                      <p className="m-0 mt-1 font-semibold text-[var(--text-main)] text-[12.5px]">
                        [{selectedPhieu.maICD}] {selectedPhieu.tenBenhICD}
                      </p>
                    ) : (
                      <p className="m-0 mt-1 text-[var(--text-muted)] italic text-[12.5px]">Chưa có ICD</p>
                    )}
                    <p className="m-0 mt-1.5 font-semibold text-[var(--text-main)]">{selectedPhieu.chanDoan || 'Bác sĩ chưa ghi chẩn đoán'}</p>
                  </div>
                  <div>
                    <span className="text-[var(--text-muted)]">Bác sĩ khám bệnh:</span>
                    <p className="m-0 mt-1 font-semibold text-[var(--text-main)]">{selectedPhieu.tenBacSi || 'Không rõ'}</p>
                  </div>
                  <div>
                    <span className="text-[var(--text-muted)]">Ngày chỉ định khám:</span>
                    <p className="m-0 mt-1 font-semibold text-[var(--text-main)]">
                      {selectedPhieu.ngayKham ? new Date(selectedPhieu.ngayKham).toLocaleDateString('vi-VN') : '—'}
                    </p>
                  </div>
                </div>

                {/* 3. BẢNG CHI TIẾT CÁC KHOẢN CHI PHÍ */}
                <div className="flex flex-col gap-4">
                  
                  {/* BẢNG 1: Dịch vụ y tế & Chỉ định cận lâm sàng */}
                  <div className="border border-[var(--border-color)] rounded-[var(--radius-lg)] overflow-hidden">
                    <div className="bg-[var(--bg-main)] py-2.5 px-3.5 border-b border-[var(--border-color)] flex items-center gap-1.5">
                      <Activity size={14} style={{ color: 'var(--primary)' }} />
                      <strong className="text-[13px] text-[var(--text-main)]">I. Dịch vụ cận lâm sàng & Chỉ định (CLS)</strong>
                    </div>
                    <table className="kb-table w-full border-collapse text-[13px]">
                      <thead>
                        <tr>
                          <th className="w-[50px] text-center">STT</th>
                          <th className="text-left">Tên dịch vụ kỹ thuật y tế</th>
                          <th className="w-[80px] text-center">SL</th>
                          <th className="w-[140px] text-right">Đơn giá (đ)</th>
                          <th className="w-[160px] text-right">Thành tiền (đ)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {services.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="text-center p-4 text-[var(--text-muted)] italic">
                              Không có chỉ định cận lâm sàng nào trong lượt khám này.
                            </td>
                          </tr>
                        ) : (
                          services.map((item, idx) => (
                            <tr key={idx}>
                              <td className="text-center">{idx + 1}</td>
                              <td style={{ fontWeight: '600' }}>{item.tenItem}</td>
                              <td className="text-center">{item.soLuong}</td>
                              <td className="text-right">{item.donGia.toLocaleString('vi-VN')}</td>
                              <td className="text-right font-[750] text-[var(--text-main)]">{item.thanhTien.toLocaleString('vi-VN')}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* BẢNG 2: Đơn thuốc đã kê */}
                  <div className="border border-[var(--border-color)] rounded-[var(--radius-lg)] overflow-hidden">
                    <div className="bg-[var(--bg-main)] py-2.5 px-3.5 border-b border-[var(--border-color)] flex items-center gap-1.5">
                      <Pill size={14} style={{ color: 'var(--primary)' }} />
                      <strong className="text-[13px] text-[var(--text-main)]">II. Danh mục dược phẩm & Thuốc điều trị</strong>
                    </div>
                    <table className="kb-table w-full border-collapse text-[13px]">
                      <thead>
                        <tr>
                          <th className="w-[50px] text-center">STT</th>
                          <th className="text-left">Tên biệt dược</th>
                          <th style={{ textAlign: 'left', width: '220px' }}>Liều dùng chỉ định</th>
                          <th style={{ width: '60px', textAlign: 'center' }}>Số ngày</th>
                          <th style={{ width: '80px', textAlign: 'center' }}>SL quy đổi</th>
                          <th style={{ width: '110px', textAlign: 'right' }}>Đơn giá (đ)</th>
                          <th className="w-[160px] text-right">Thành tiền (đ)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {drugs.length === 0 ? (
                          <tr>
                            <td colSpan="7" className="text-center p-4 text-[var(--text-muted)] italic">
                              Không có đơn thuốc nào được kê trong lượt khám này.
                            </td>
                          </tr>
                        ) : (
                          drugs.map((item, idx) => (
                            <tr key={idx}>
                              <td className="text-center">{idx + 1}</td>
                              <td style={{ fontWeight: '600' }}>{item.tenItem}</td>
                              <td style={{ fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '12px' }}>{item.lieuDung}</td>
                              <td className="text-center">{item.soNgay} ngày</td>
                              <td className="text-center">{item.soLuong}</td>
                              <td className="text-right">{item.donGia.toLocaleString('vi-VN')}</td>
                              <td className="text-right font-[750] text-[var(--text-main)]">{item.thanhTien.toLocaleString('vi-VN')}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* BẢNG 3: Vật tư y tế tiêu hao */}
                  <div className="border border-[var(--border-color)] rounded-[var(--radius-lg)] overflow-hidden">
                    <div className="bg-[var(--bg-main)] py-2 px-3.5 border-b border-[var(--border-color)] flex items-center justify-between">
                      <div className="flex items-center gap-[6px]">
                        <ClipboardList size={14} style={{ color: 'var(--primary)' }} />
                        <strong className="text-[13px] text-[var(--text-main)]">III. Vật tư y tế tiêu hao & Dụng cụ khám</strong>
                      </div>
                      
                      {!selectedPhieu.daThanhToan && (
                        <button 
                          onClick={() => {
                            if (danhMucVatTu.length > 0) {
                              setVatTuMoi({ tenVT: danhMucVatTu[0].tenVT, soLuong: 1, donGia: getSupplyPrice(danhMucVatTu[0].tenVT) });
                            } else {
                              setVatTuMoi({ tenVT: 'Găng tay y tế', soLuong: 1, donGia: 3000 });
                            }
                            setShowVatTuModal(true);
                          }}
                          className="btn-outline h-6 text-[11px] px-2 flex items-center gap-[3px]"
                        >
                          <Plus size={10} /> Thêm vật tư
                        </button>
                      )}
                    </div>
                    <table className="kb-table w-full border-collapse text-[13px]">
                      <thead>
                        <tr>
                          <th className="w-[50px] text-center">STT</th>
                          <th className="text-left">Tên vật tư tiêu hao</th>
                          <th style={{ width: '100px', textAlign: 'center' }}>Số lượng</th>
                          <th className="w-[140px] text-right">Đơn giá (đ)</th>
                          <th className="w-[160px] text-right">Thành tiền (đ)</th>
                          {!selectedPhieu.daThanhToan && <th style={{ width: '50px', textAlign: 'center' }}>Xóa</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {supplies.length === 0 ? (
                          <tr>
                            <td colSpan={selectedPhieu.daThanhToan ? 5 : 6} className="text-center p-4 text-[var(--text-muted)] italic">
                              Chưa ghi nhận sử dụng vật tư y tế tiêu hao.
                            </td>
                          </tr>
                        ) : (
                          supplies.map((item, idx) => (
                            <tr key={idx}>
                              <td className="text-center">{idx + 1}</td>
                              <td style={{ fontWeight: '600' }}>{item.tenItem}</td>
                              <td className="text-center">{item.soLuong}</td>
                              <td className="text-right">{item.donGia.toLocaleString('vi-VN')}</td>
                              <td className="text-right font-[750] text-[var(--text-main)]">{item.thanhTien.toLocaleString('vi-VN')}</td>
                              {!selectedPhieu.daThanhToan && (
                                <td className="text-center">
                                  <button 
                                    className="kb-icon-btn kb-icon-btn--danger"
                                    onClick={() => handleDeleteSupply(item.id)}
                                    title="Xóa vật tư"
                                    style={{ margin: '0 auto' }}
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </td>
                              )}
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                </div>

                {/* 4. PANEL BẢNG TỔNG HỢP CHI PHÍ & THANH TOÁN */}
                <div className="flex gap-5 mt-2.5">
                  
                  {/* Cấu hình phương thức thanh toán */}
                  <div className="flex-1 border border-[var(--border-color)] rounded-[var(--radius-lg)] p-[18px] flex flex-col gap-[14px] bg-[#fafafa]">
                    <h4 className="text-[13px] font-bold text-[var(--primary)] m-0 border-b border-dashed border-[var(--border-color)] pb-2">CẤU HÌNH PHƯƠNG THỨC THANH TOÁN</h4>
                    
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: '12px' }}>Phương thức thanh toán</label>
                      <div className="flex gap-2.5 mt-1.5">
                        <label className={`flex-1 flex items-center gap-2 py-2 px-3 border rounded-md text-[12.5px] font-semibold ${selectedPhieu.daThanhToan ? 'cursor-default' : 'cursor-pointer'} ${phuongThucTT === 'Tiền mặt' ? 'border-[var(--primary)] bg-[var(--primary-light)]' : 'border-[var(--border-color)] bg-white'}`}>
                          <input 
                            type="radio" 
                            name="paymentMethod" 
                            checked={phuongThucTT === 'Tiền mặt'} 
                            onChange={() => !selectedPhieu.daThanhToan && setPhuongThucTT('Tiền mặt')}
                            disabled={selectedPhieu.daThanhToan}
                          />
                          Tiền mặt
                        </label>
                        <label className={`flex-1 flex items-center gap-2 py-2 px-3 border rounded-md text-[12.5px] font-semibold ${selectedPhieu.daThanhToan ? 'cursor-default' : 'cursor-pointer'} ${phuongThucTT === 'Chuyển khoản' ? 'border-[var(--primary)] bg-[var(--primary-light)]' : 'border-[var(--border-color)] bg-white'}`}>
                          <input 
                            type="radio" 
                            name="paymentMethod" 
                            checked={phuongThucTT === 'Chuyển khoản'} 
                            onChange={() => !selectedPhieu.daThanhToan && setPhuongThucTT('Chuyển khoản')}
                            disabled={selectedPhieu.daThanhToan}
                          />
                          Chuyển khoản
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Chi tiết hóa đơn & Thu tiền */}
                  <div className="flex-[1.1] border border-[var(--border-color)] rounded-[var(--radius-lg)] p-[18px] flex flex-col gap-3 bg-[#f8fafc]">
                    <h4 className="text-[13px] font-bold text-[var(--primary)] m-0 border-b border-dashed border-[var(--border-color)] pb-2">CHI TIẾT PHIẾU THU & HÓA ĐƠN</h4>
                    
                    <div className="flex justify-between text-[13px] text-[var(--text-muted)]">
                      <span>Tổng chi phí lâm sàng:</span>
                      <strong style={{ color: 'var(--text-main)' }}>{totalServices.toLocaleString('vi-VN')} đ</strong>
                    </div>
                    
                    <div className="flex justify-between text-[13px] text-[var(--text-muted)]">
                      <span>Tổng chi phí đơn thuốc:</span>
                      <strong style={{ color: 'var(--text-main)' }}>{totalDrugs.toLocaleString('vi-VN')} đ</strong>
                    </div>

                    <div className="flex justify-between text-[13px] text-[var(--text-muted)]">
                      <span>Tổng chi phí vật tư y tế:</span>
                      <strong style={{ color: 'var(--text-main)' }}>{totalSupplies.toLocaleString('vi-VN')} đ</strong>
                    </div>

                    <div className="flex justify-between text-[15px] text-[var(--text-main)] border-t border-[var(--border-color)] pt-2.5 mt-1">
                      <span><strong>TỔNG TIỀN THANH TOÁN:</strong></span>
                      <strong className="text-[#0052cc] text-[18px]">
                        {grandTotal.toLocaleString('vi-VN')} VNĐ
                      </strong>
                    </div>

                    <div style={{ marginTop: '10px' }}>
                      {!selectedPhieu.daThanhToan ? (
                        <button 
                          onClick={handleExecutePayment}
                          className="btn-primary w-full h-[42px] text-[14px] font-bold flex items-center justify-center gap-2 shadow-[var(--shadow-md)]"
                        >
                          <CreditCard size={18} />
                          THU TIỀN & ĐÓNG PHIẾU [F12]
                        </button>
                      ) : (
                        <div className="flex gap-2">
                          <button 
                            onClick={handlePrintInvoice}
                            className="btn-outline flex-1 h-10 text-[13.5px] font-semibold border border-[#0052cc] text-[#0052cc] flex items-center justify-center gap-1.5"
                          >
                            <Printer size={16} />
                            IN PHIẾU THU [F8]
                          </button>
                          <button 
                            disabled
                            className="btn-outline flex-1 h-10 text-[13.5px] bg-[#e2e8f0] text-[var(--text-muted)] border-none cursor-not-allowed flex items-center justify-center"
                          >
                            ĐÃ THANH TOÁN
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                </div>

              </div>

            </div>
          )}
        </div>

      </div>

      {/* POPUP THÊM VẬT TƯ TIÊU HAO */}
      {showVatTuModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-[200] animate-[fadeIn_0.2s]">
          <div className="bg-white rounded-[var(--radius-lg)] w-[400px] shadow-[var(--shadow-lg)] border border-[var(--border-color)] overflow-hidden">
            <div className="bg-[var(--primary)] text-white py-3 px-4 flex justify-between items-center">
              <span className="text-[14px] font-bold">KÊ VẬT TƯ TIÊU HAO PHÁT SINH</span>
              <button 
                onClick={() => setShowVatTuModal(false)}
                className="bg-none border-none text-white cursor-pointer text-[16px]"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleAddSupply} className="p-4 flex flex-col gap-3.5">
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '12.5px' }}>Tên vật tư y tế</label>
                {danhMucVatTu.length > 0 ? (
                  <select 
                    className="form-input h-9 text-[13px] px-2" 
                    value={vatTuMoi.tenVT}
                    onChange={e => setVatTuMoi({ ...vatTuMoi, tenVT: e.target.value })}
                  >
                    {danhMucVatTu.map(vt => (
                      <option key={vt.maVT} value={vt.tenVT}>{vt.tenVT}</option>
                    ))}
                  </select>
                ) : (
                  <input 
                    type="text" 
                    className="form-input h-9 text-[13px]" 
                    placeholder="Điền tên vật tư tiêu hao..."
                    value={vatTuMoi.tenVT}
                    onChange={e => setVatTuMoi({ ...vatTuMoi, tenVT: e.target.value })}
                    required
                  />
                )}
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '12.5px' }}>Số lượng chỉ định dùng</label>
                <input 
                  type="number" 
                  min="1"
                  className="form-input h-9 text-[13px]" 
                  value={vatTuMoi.soLuong}
                  onChange={e => setVatTuMoi({ ...vatTuMoi, soLuong: parseInt(e.target.value, 10) || 1 })}
                  required
                />
              </div>

              <div className="flex gap-2.5 mt-2.5">
                <button type="submit" className="btn-primary flex-1 h-9 text-[13px]">
                  Xác nhận thêm
                </button>
                <button type="button" onClick={() => setShowVatTuModal(false)} className="btn-outline flex-1 h-9 text-[13px]">
                  Hủy bỏ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default ThanhToanHoaDon;
