import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { 
  ArrowLeft, Search, User, Calendar, Receipt, Printer, CheckCircle, 
  AlertCircle, Plus, Trash2, FileText, Activity, Pill, ClipboardList, CreditCard
} from 'lucide-react';
import { useToast } from '../utils/ToastContext';

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
          maBacSi: 'BS001',
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
          maBacSi: 'BS002',
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

    // Load các danh mục chuẩn
    try {
      const storedDV = localStorage.getItem('danhMucDichVuCLS');
      if (storedDV) setDanhMucDichVu(JSON.parse(storedDV));
      
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
    <div className="kb-wrapper" style={styles.wrapper}>
      
      {/* Topbar điều hướng */}
      <div className="kb-topbar hide-on-print" style={styles.topbar}>
        <div style={styles.topbarLeft}>
          <button className="kb-back-btn" onClick={() => navigate('/')} style={styles.backBtn}>
            <ArrowLeft size={16} /> Quay về trang chủ
          </button>
        </div>
        <div className="kb-topbar-title" style={styles.topbarTitle}>
          <Receipt size={18} style={styles.receiptIcon} />
          <strong>Thanh toán & Xuất hóa đơn viện phí</strong>
        </div>
        <div style={styles.topbarRight}>
          <span>Quầy thu ngân / {thuNgan}</span>
        </div>
      </div>

      {/* Main split dashboard area */}
      <div className="kb-body" style={styles.body}>
        
        {/* CỘT TRÁI: Danh sách phiếu thu */}
        <div className="hide-on-print" style={styles.leftCol}>
          <div style={styles.leftColHeader}>
            <div style={styles.leftColHeaderTitleWrapper}>
              <Receipt size={16} style={{ color: 'var(--primary)' }} />
              <h3 style={styles.leftColHeaderTitle}>DANH SÁCH PHIẾU THU VIỆN PHÍ</h3>
            </div>
            
            {/* Thanh tìm kiếm */}
            <div className="search-box" style={styles.searchBox}>
              <input 
                type="text" 
                placeholder="Tìm mã BN, mã hồ sơ, tên..." 
                className="form-input" 
                style={styles.searchInput}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <Search size={14} style={styles.searchIcon} />
            </div>

            {/* Tab lọc trạng thái */}
            <div style={styles.tabWrapper}>
              <button 
                onClick={() => setStatusFilter('All')}
                style={styles.getTabStyle(statusFilter === 'All')}
              >
                Tất cả ({dsPhieuKham.filter(p => p.trangThai === 3).length})
              </button>
              <button 
                onClick={() => setStatusFilter('Unpaid')}
                style={styles.getTabStyle(statusFilter === 'Unpaid', '#dc2626')}
              >
                Chưa TT ({dsPhieuKham.filter(p => p.trangThai === 3 && !p.daThanhToan).length})
              </button>
              <button 
                onClick={() => setStatusFilter('Paid')}
                style={styles.getTabStyle(statusFilter === 'Paid', '#16a34a')}
              >
                Đã TT ({dsPhieuKham.filter(p => p.trangThai === 3 && p.daThanhToan).length})
              </button>
            </div>
          </div>

          {/* List Item container */}
          <div style={styles.listContainer}>
            {filteredPhieuKham.length === 0 ? (
              <div style={styles.noDataLeft}>
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
                    style={styles.getListItemStyle(isSelected)}
                  >
                    <div style={styles.listItemHeader}>
                      <span style={styles.listItemMaPhieu}>{pk.maPhieu}</span>
                      {isPaid ? (
                        <span style={styles.badgePaid}>Đã TT</span>
                      ) : (
                        <span style={styles.badgeUnpaid}>Chưa TT</span>
                      )}
                    </div>
                    <div style={styles.listItemName}>{pk.hoTen}</div>
                    <div style={styles.listItemFooter}>
                      <span style={styles.listItemMaBN}>Mã NB: {pk.maBN}</span>
                      <strong style={styles.listItemAmount}>{amount.toLocaleString('vi-VN')} đ</strong>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* CỘT PHẢI: Chi tiết phiếu thu & Hóa đơn */}
        <div style={styles.rightCol}>
          {selectedPhieu === null ? (
            <div className="hide-on-print" style={styles.noDataRight}>
              <Receipt size={48} style={styles.noDataRightIcon} />
              <div>
                <h4 style={styles.noDataRightTitle}>Chưa chọn phiếu thu</h4>
                <p style={styles.noDataRightText}>Chọn một lượt khám bệnh bên trái để tiến hành lập hóa đơn thanh toán.</p>
              </div>
            </div>
          ) : (
            <div style={styles.rightColScrollable}>
              
              {/* PHẦN IN PHIẾU THU KHỔ K57 (Chỉ xuất hiện khi in ấn) */}
              {createPortal(
                <div className="print-only" style={styles.printOnly}>
                  <div style={styles.printHeader}>
                    <h3 style={styles.printHeaderTitle}>PHÒNG KHÁM ĐA KHOA NHẬT TẢO</h3>
                    <p style={styles.printHeaderSub1}>Đ/c: 123 Nhật Tảo, Phường 4, Quận 10, TP. HCM</p>
                    <p style={styles.printHeaderSub2}>Hotline: 090 123 4567</p>
                  </div>

                  <div style={styles.printDashedLine} />

                  <div style={styles.printTitleArea}>
                    <h2 style={styles.printTitle}>HÓA ĐƠN THANH TOÁN</h2>
                    <p style={styles.printTitleDate}>
                      {getVietnameseDateString(selectedPhieu.ngayThanhToan)}
                    </p>
                  </div>

                  <div style={styles.printPatientInfo}>
                    <div>Mã NB: <b>{selectedPhieu.maBN}</b></div>
                    <div>Mã hồ sơ: <b>{selectedPhieu.maPhieu}</b></div>
                    <div>Họ tên: <b>{selectedPhieu.hoTen}</b></div>
                    <div>Ngày sinh: {selectedPhieu.ngaySinh} — Nam/Nữ: {selectedPhieu.gioiTinh}</div>
                    <div>Chẩn đoán: {selectedPhieu.chanDoan || 'Khám tự nguyện'}</div>
                    <div>BS chỉ định: {selectedPhieu.tenBacSi}</div>
                  </div>

                  <div style={styles.printDashedLine} />

                  {/* Dịch vụ CLS */}
                  {services.length > 0 && (
                    <div style={styles.printSection}>
                      <div style={styles.printSectionTitle}>[DỊCH VỤ KỸ THUẬT & CLS]</div>
                      {services.map((item, idx) => (
                        <div key={idx} style={styles.printItemRow}>
                          <div>{idx + 1}. {item.tenItem}</div>
                          <div style={styles.printItemDetail}>
                            <span>{item.soLuong} x {item.donGia.toLocaleString('vi-VN')}</span>
                            <span>{item.thanhTien.toLocaleString('vi-VN')} đ</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Thuốc đã kê */}
                  {drugs.length > 0 && (
                    <div style={styles.printSection}>
                      <div style={styles.printSectionTitle}>[ĐƠN THUỐC ĐÃ KÊ]</div>
                      {drugs.map((item, idx) => (
                        <div key={idx} style={styles.printItemRow}>
                          <div>{idx + 1}. {item.tenItem}</div>
                          <div style={styles.printItemDetail}>
                            <span>{item.soLuong} ({item.lieuDung})</span>
                            <span>{item.thanhTien.toLocaleString('vi-VN')} đ</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Vật tư tiêu hao */}
                  {supplies.length > 0 && (
                    <div style={styles.printSection}>
                      <div style={styles.printSectionTitle}>[VẬT TƯ TIÊU HAO]</div>
                      {supplies.map((item, idx) => (
                        <div key={idx} style={styles.printItemRow}>
                          <div>{idx + 1}. {item.tenItem}</div>
                          <div style={styles.printItemDetail}>
                            <span>{item.soLuong} x {item.donGia.toLocaleString('vi-VN')}</span>
                            <span>{item.thanhTien.toLocaleString('vi-VN')} đ</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={styles.printDashedLine} />

                  <div style={styles.printSummary}>
                    <div>Phương thức: <b>{selectedPhieu.phuongThucTT || phuongThucTT}</b></div>
                    <div>Thu ngân: <b>{selectedPhieu.thuNgan || thuNgan}</b></div>
                    <div style={styles.printGrandTotalRow}>
                      <span>TỔNG TIỀN:</span>
                      <span>{grandTotal.toLocaleString('vi-VN')} đ</span>
                    </div>
                  </div>

                  <div style={styles.printDashedLine} />

                  <div style={styles.printFooter}>
                    <p style={styles.printFooterText1}>Cảm ơn quý khách. Hẹn gặp lại!</p>
                    <p style={styles.printFooterText2}>PHÒNG KHÁM ĐA KHOA NHẬT TẢO</p>
                  </div>
                </div>,
                document.body
              )}

              {/* PHẦN HIỂN THỊ TRÊN MÀN HÌNH FRONTEND */}
              <div className="hide-on-print" style={styles.mainContainer}>
                
                {successMessage && (
                  <div style={styles.successBanner}>
                    <CheckCircle size={16} />
                    {successMessage}
                  </div>
                )}
                
                {/* 1. Header chi tiết phiếu thu */}
                <div style={styles.detailsHeader}>
                  <div style={styles.detailsHeaderLeft}>
                    <div style={styles.avatar}>
                      {selectedPhieu.hoTen ? selectedPhieu.hoTen.split(' ').pop().charAt(0) : 'BN'}
                    </div>
                    <div>
                      <h3 style={styles.patientName}>{selectedPhieu.hoTen}</h3>
                      <p style={styles.patientSubText}>
                        Mã người bệnh: <b style={{ color: 'var(--text-main)' }}>{selectedPhieu.maBN}</b> | Mã hồ sơ: <b style={{ color: 'var(--text-main)' }}>{selectedPhieu.maPhieu}</b>
                      </p>
                    </div>
                  </div>

                  <div style={styles.detailsHeaderRight}>
                    {selectedPhieu.daThanhToan ? (
                      <div style={styles.statusPaidBadge}>
                        <CheckCircle size={15} /> Đã thanh toán
                      </div>
                    ) : (
                      <div style={styles.statusUnpaidBadge}>
                        <AlertCircle size={15} /> Chưa thanh toán
                      </div>
                    )}
                    {selectedPhieu.daThanhToan && selectedPhieu.ngayThanhToan && (
                      <p style={styles.billingTime}>
                        TT lúc: {new Date(selectedPhieu.ngayThanhToan).toLocaleString('vi-VN')}
                      </p>
                    )}
                  </div>
                </div>

                {/* 2. Thông tin chẩn đoán lâm sàng */}
                <div style={styles.diagnosticGrid}>
                  <div>
                    <span style={styles.metaLabel}>Chẩn đoán bệnh lý:</span>
                    <p style={styles.metaValue}>{selectedPhieu.chanDoan || 'Bác sĩ chưa ghi chẩn đoán'}</p>
                  </div>
                  <div>
                    <span style={styles.metaLabel}>Bác sĩ khám bệnh:</span>
                    <p style={styles.metaValue}>{selectedPhieu.tenBacSi || 'Không rõ'}</p>
                  </div>
                  <div>
                    <span style={styles.metaLabel}>Ngày chỉ định khám:</span>
                    <p style={styles.metaValue}>
                      {selectedPhieu.ngayKham ? new Date(selectedPhieu.ngayKham).toLocaleDateString('vi-VN') : '—'}
                    </p>
                  </div>
                </div>

                {/* 3. BẢNG CHI TIẾT CÁC KHOẢN CHI PHÍ */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  {/* BẢNG 1: Dịch vụ y tế & Chỉ định cận lâm sàng */}
                  <div style={styles.sectionTableWrapper}>
                    <div style={styles.sectionTableHeader}>
                      <Activity size={14} style={{ color: 'var(--primary)' }} />
                      <strong style={styles.sectionTableHeaderTitle}>I. Dịch vụ cận lâm sàng & Chỉ định (CLS)</strong>
                    </div>
                    <table className="kb-table" style={styles.tableCommon}>
                      <thead>
                        <tr>
                          <th style={styles.thStt}>STT</th>
                          <th style={styles.thItemName}>Tên dịch vụ kỹ thuật y tế</th>
                          <th style={styles.thQty}>SL</th>
                          <th style={styles.thPrice}>Đơn giá (đ)</th>
                          <th style={styles.thSubtotal}>Thành tiền (đ)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {services.length === 0 ? (
                          <tr>
                            <td colSpan="5" style={styles.noDataRow}>
                              Không có chỉ định cận lâm sàng nào trong lượt khám này.
                            </td>
                          </tr>
                        ) : (
                          services.map((item, idx) => (
                            <tr key={idx}>
                              <td style={styles.tdCenter}>{idx + 1}</td>
                              <td style={{ fontWeight: '600' }}>{item.tenItem}</td>
                              <td style={styles.tdCenter}>{item.soLuong}</td>
                              <td style={styles.tdRight}>{item.donGia.toLocaleString('vi-VN')}</td>
                              <td style={styles.tdBoldSubtotal}>{item.thanhTien.toLocaleString('vi-VN')}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* BẢNG 2: Đơn thuốc đã kê */}
                  <div style={styles.sectionTableWrapper}>
                    <div style={styles.sectionTableHeader}>
                      <Pill size={14} style={{ color: 'var(--primary)' }} />
                      <strong style={styles.sectionTableHeaderTitle}>II. Danh mục dược phẩm & Thuốc điều trị</strong>
                    </div>
                    <table className="kb-table" style={styles.tableCommon}>
                      <thead>
                        <tr>
                          <th style={styles.thStt}>STT</th>
                          <th style={styles.thItemName}>Tên biệt dược</th>
                          <th style={{ textAlign: 'left', width: '220px' }}>Liều dùng chỉ định</th>
                          <th style={{ width: '60px', textAlign: 'center' }}>Số ngày</th>
                          <th style={{ width: '80px', textAlign: 'center' }}>SL quy đổi</th>
                          <th style={{ width: '110px', textAlign: 'right' }}>Đơn giá (đ)</th>
                          <th style={styles.thSubtotal}>Thành tiền (đ)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {drugs.length === 0 ? (
                          <tr>
                            <td colSpan="7" style={styles.noDataRow}>
                              Không có đơn thuốc nào được kê trong lượt khám này.
                            </td>
                          </tr>
                        ) : (
                          drugs.map((item, idx) => (
                            <tr key={idx}>
                              <td style={styles.tdCenter}>{idx + 1}</td>
                              <td style={{ fontWeight: '600' }}>{item.tenItem}</td>
                              <td style={{ fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '12px' }}>{item.lieuDung}</td>
                              <td style={styles.tdCenter}>{item.soNgay} ngày</td>
                              <td style={styles.tdCenter}>{item.soLuong}</td>
                              <td style={styles.tdRight}>{item.donGia.toLocaleString('vi-VN')}</td>
                              <td style={styles.tdBoldSubtotal}>{item.thanhTien.toLocaleString('vi-VN')}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* BẢNG 3: Vật tư y tế tiêu hao */}
                  <div style={styles.sectionTableWrapper}>
                    <div style={styles.sectionTableVatTuHeader}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <ClipboardList size={14} style={{ color: 'var(--primary)' }} />
                        <strong style={styles.sectionTableHeaderTitle}>III. Vật tư y tế tiêu hao & Dụng cụ khám</strong>
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
                          className="btn-outline" 
                          style={styles.addSupplyBtn}
                        >
                          <Plus size={10} /> Thêm vật tư
                        </button>
                      )}
                    </div>
                    <table className="kb-table" style={styles.tableCommon}>
                      <thead>
                        <tr>
                          <th style={styles.thStt}>STT</th>
                          <th style={styles.thItemName}>Tên vật tư tiêu hao</th>
                          <th style={{ width: '100px', textAlign: 'center' }}>Số lượng</th>
                          <th style={styles.thPrice}>Đơn giá (đ)</th>
                          <th style={styles.thSubtotal}>Thành tiền (đ)</th>
                          {!selectedPhieu.daThanhToan && <th style={{ width: '50px', textAlign: 'center' }}>Xóa</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {supplies.length === 0 ? (
                          <tr>
                            <td colSpan={selectedPhieu.daThanhToan ? 5 : 6} style={styles.noDataRow}>
                              Chưa ghi nhận sử dụng vật tư y tế tiêu hao.
                            </td>
                          </tr>
                        ) : (
                          supplies.map((item, idx) => (
                            <tr key={idx}>
                              <td style={styles.tdCenter}>{idx + 1}</td>
                              <td style={{ fontWeight: '600' }}>{item.tenItem}</td>
                              <td style={styles.tdCenter}>{item.soLuong}</td>
                              <td style={styles.tdRight}>{item.donGia.toLocaleString('vi-VN')}</td>
                              <td style={styles.tdBoldSubtotal}>{item.thanhTien.toLocaleString('vi-VN')}</td>
                              {!selectedPhieu.daThanhToan && (
                                <td style={styles.tdCenter}>
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
                <div style={styles.summaryPanelRow}>
                  
                  {/* Cấu hình phương thức thanh toán */}
                  <div style={styles.summaryPanelLeft}>
                    <h4 style={styles.summaryTitle}>CẤU HÌNH PHƯƠNG THỨC THANH TOÁN</h4>
                    
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: '12px' }}>Phương thức thanh toán</label>
                      <div style={styles.paymentRadios}>
                        <label style={styles.getPaymentRadioLabelStyle(phuongThucTT === 'Tiền mặt', selectedPhieu.daThanhToan)}>
                          <input 
                            type="radio" 
                            name="paymentMethod" 
                            checked={phuongThucTT === 'Tiền mặt'} 
                            onChange={() => !selectedPhieu.daThanhToan && setPhuongThucTT('Tiền mặt')}
                            disabled={selectedPhieu.daThanhToan}
                          />
                          Tiền mặt
                        </label>
                        <label style={styles.getPaymentRadioLabelStyle(phuongThucTT === 'Chuyển khoản', selectedPhieu.daThanhToan)}>
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
                  <div style={styles.summaryPanelRight}>
                    <h4 style={styles.summaryTitle}>CHI TIẾT PHIẾU THU & HÓA ĐƠN</h4>
                    
                    <div style={styles.summaryRow}>
                      <span>Tổng chi phí lâm sàng:</span>
                      <strong style={{ color: 'var(--text-main)' }}>{totalServices.toLocaleString('vi-VN')} đ</strong>
                    </div>
                    
                    <div style={styles.summaryRow}>
                      <span>Tổng chi phí đơn thuốc:</span>
                      <strong style={{ color: 'var(--text-main)' }}>{totalDrugs.toLocaleString('vi-VN')} đ</strong>
                    </div>

                    <div style={styles.summaryRow}>
                      <span>Tổng chi phí vật tư y tế:</span>
                      <strong style={{ color: 'var(--text-main)' }}>{totalSupplies.toLocaleString('vi-VN')} đ</strong>
                    </div>

                    <div style={styles.summaryRowGrand}>
                      <span><strong>TỔNG TIỀN THANH TOÁN:</strong></span>
                      <strong style={styles.grandTotalText}>
                        {grandTotal.toLocaleString('vi-VN')} VNĐ
                      </strong>
                    </div>

                    <div style={{ marginTop: '10px' }}>
                      {!selectedPhieu.daThanhToan ? (
                        <button 
                          onClick={handleExecutePayment}
                          className="btn-primary" 
                          style={styles.payBtn}
                        >
                          <CreditCard size={18} />
                          THU TIỀN & ĐÓNG PHIẾU [F12]
                        </button>
                      ) : (
                        <div style={styles.paidActionsContainer}>
                          <button 
                            onClick={handlePrintInvoice}
                            className="btn-outline" 
                            style={styles.printBtn}
                          >
                            <Printer size={16} />
                            IN PHIẾU THU [F8]
                          </button>
                          <button 
                            disabled
                            className="btn-outline" 
                            style={styles.alreadyPaidBtn}
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
        <div style={styles.modalOverlay}>
          <div style={styles.modalContainer}>
            <div style={styles.modalHeader}>
              <span style={styles.modalHeaderTitle}>KÊ VẬT TƯ TIÊU HAO PHÁT SINH</span>
              <button 
                onClick={() => setShowVatTuModal(false)}
                style={styles.modalCloseBtn}
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleAddSupply} style={styles.modalForm}>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '12.5px' }}>Tên vật tư y tế</label>
                {danhMucVatTu.length > 0 ? (
                  <select 
                    className="form-input" 
                    value={vatTuMoi.tenVT}
                    onChange={e => setVatTuMoi({ ...vatTuMoi, tenVT: e.target.value })}
                    style={styles.modalFormSelect}
                  >
                    {danhMucVatTu.map(vt => (
                      <option key={vt.maVT} value={vt.tenVT}>{vt.tenVT}</option>
                    ))}
                  </select>
                ) : (
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Điền tên vật tư tiêu hao..."
                    value={vatTuMoi.tenVT}
                    onChange={e => setVatTuMoi({ ...vatTuMoi, tenVT: e.target.value })}
                    required
                    style={styles.modalFormInput}
                  />
                )}
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '12.5px' }}>Số lượng chỉ định dùng</label>
                <input 
                  type="number" 
                  min="1"
                  className="form-input" 
                  value={vatTuMoi.soLuong}
                  onChange={e => setVatTuMoi({ ...vatTuMoi, soLuong: parseInt(e.target.value, 10) || 1 })}
                  required
                  style={styles.modalFormInput}
                />
              </div>

              <div style={styles.modalActions}>
                <button type="submit" className="btn-primary" style={styles.modalSubmitBtn}>
                  Xác nhận thêm
                </button>
                <button type="button" onClick={() => setShowVatTuModal(false)} className="btn-outline" style={styles.modalCancelBtn}>
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

// Bảng chứa kiểu dáng tập trung cho giao diện thanh toán hóa đơn
const styles = {
  wrapper: { height: '100vh', overflow: 'hidden' },
  topbar: { height: '50px', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', backgroundColor: '#ffffff' },
  topbarLeft: { flex: 1, display: 'flex', justifyContent: 'flex-start' },
  backBtn: { padding: '5px 10px' },
  topbarTitle: { flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '15px' },
  receiptIcon: { marginRight: '6px' },
  topbarRight: { flex: 1, display: 'flex', justifyContent: 'flex-end', fontSize: '12px', opacity: 0.85 },
  body: {
    display: 'flex',
    height: 'calc(100vh - 50px)',
    backgroundColor: 'var(--bg-main)',
    overflow: 'hidden'
  },
  leftCol: {
    flex: 1.1,
    display: 'flex',
    flexDirection: 'column',
    borderRight: '1px solid var(--border-color)',
    height: '100%',
    backgroundColor: '#ffffff'
  },
  leftColHeader: { padding: '14px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)' },
  leftColHeaderTitleWrapper: { display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' },
  leftColHeaderTitle: { fontSize: '14px', fontWeight: '750', color: 'var(--text-main)', margin: 0 },
  searchBox: { marginBottom: '10px', position: 'relative' },
  searchInput: { paddingLeft: '32px', height: '32px', fontSize: '12.5px' },
  searchIcon: { position: 'absolute', left: '10px', top: '9px', color: 'var(--text-muted)' },
  tabWrapper: { display: 'flex', gap: '4px', backgroundColor: '#e2e8f0', padding: '2px', borderRadius: '6px' },
  getTabStyle: (isActive, color) => ({
    flex: 1,
    padding: '5px',
    border: 'none',
    background: isActive ? '#ffffff' : 'transparent',
    fontSize: '11.5px',
    fontWeight: '600',
    borderRadius: '4px',
    color: color || 'inherit',
    cursor: 'pointer',
    transition: '0.15s'
  }),
  listContainer: { flex: 1, overflowY: 'auto', padding: '8px' },
  noDataLeft: { textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontSize: '13px' },
  getListItemStyle: (isSelected) => ({
    padding: '12px',
    borderRadius: '8px',
    border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border-color)'}`,
    backgroundColor: isSelected ? 'var(--primary-light)' : '#ffffff',
    cursor: 'pointer',
    marginBottom: '8px',
    transition: 'all 0.15s ease'
  }),
  listItemHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '6px' },
  listItemMaPhieu: { fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)' },
  badgePaid: { fontSize: '11px', color: '#16a34a', backgroundColor: '#dcfce7', padding: '1px 8px', borderRadius: '10px', fontWeight: 'bold' },
  badgeUnpaid: { fontSize: '11px', color: '#dc2626', backgroundColor: '#fee2e2', padding: '1px 8px', borderRadius: '10px', fontWeight: 'bold' },
  listItemName: { fontSize: '13.5px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '4px' },
  listItemFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' },
  listItemMaBN: { color: 'var(--text-muted)' },
  listItemAmount: { color: '#0052cc', fontSize: '13.5px' },

  rightCol: {
    flex: 1.9,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: '#ffffff'
  },
  noDataRight: { height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', textAlign: 'center', gap: '12px' },
  noDataRightIcon: { opacity: 0.25, color: 'var(--primary)' },
  noDataRightTitle: { fontWeight: '600', color: 'var(--text-main)' },
  noDataRightText: { fontSize: '13px', marginTop: '4px' },
  rightColScrollable: { display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' },

  // PRINT TEMPLATE
  printOnly: {
    width: '54mm',
    padding: '8px 1px',
    fontSize: '9.5px',
    color: '#000000',
    fontFamily: 'monospace',
    lineHeight: '1.25',
    margin: '0 auto'
  },
  printHeader: { textAlign: 'center', marginBottom: '6px' },
  printHeaderTitle: { margin: '0 0 2px 0', fontSize: '11px', fontWeight: 'bold' },
  printHeaderSub1: { margin: '0 0 1px 0', fontSize: '8.5px' },
  printHeaderSub2: { margin: 0, fontSize: '8.5px' },
  printDashedLine: { borderBottom: '1px dashed #000', margin: '5px 0' },
  printTitleArea: { textAlign: 'center', marginBottom: '8px' },
  printTitle: { margin: '0 0 3px 0', fontSize: '12px', fontWeight: 'bold' },
  printTitleDate: { margin: 0, fontSize: '8.5px', fontStyle: 'italic' },
  printPatientInfo: { display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '6px', fontSize: '9px' },
  printSection: { marginBottom: '5px' },
  printSectionTitle: { fontWeight: 'bold', fontSize: '9px', marginBottom: '2px' },
  printItemRow: { paddingLeft: '2px', marginBottom: '2px' },
  printItemDetail: { display: 'flex', justifyContent: 'space-between', paddingLeft: '8px', fontSize: '8.5px', color: '#222' },
  printSummary: { display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '9px', textAlign: 'right' },
  printGrandTotalRow: { display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 'bold', marginTop: '3px' },
  printFooter: { textAlign: 'center', marginTop: '10px', fontSize: '8.5px' },
  printFooterText1: { margin: '0 0 3px 0', fontStyle: 'italic' },
  printFooterText2: { margin: 0, fontWeight: 'bold', fontSize: '9.5px', textTransform: 'uppercase' },

  // UI ELEMENTS
  mainContainer: { padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' },
  successBanner: {
    backgroundColor: '#dcfce7',
    border: '1px solid #bbf7d0',
    color: '#16a34a',
    padding: '12px 16px',
    borderRadius: 'var(--radius-lg)',
    fontSize: '13px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    animation: 'fadeIn 0.2s ease-in-out'
  },
  detailsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-lg)',
    padding: '16px 20px'
  },
  detailsHeaderLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
  avatar: {
    width: '46px',
    height: '46px',
    borderRadius: '50%',
    backgroundColor: 'var(--primary-light)',
    color: 'var(--primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    fontWeight: '700'
  },
  patientName: { margin: 0, fontSize: '16px', fontWeight: '750', color: 'var(--text-main)' },
  patientSubText: { margin: '4px 0 0 0', fontSize: '12.5px', color: 'var(--text-muted)' },
  detailsHeaderRight: { textAlign: 'right' },
  statusPaidBadge: { display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#16a34a', backgroundColor: '#dcfce7', padding: '6px 14px', borderRadius: '20px', fontWeight: '700', fontSize: '13px', border: '1px solid #bbf7d0' },
  statusUnpaidBadge: { display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#dc2626', backgroundColor: '#fee2e2', padding: '6px 14px', borderRadius: '20px', fontWeight: '700', fontSize: '13px', border: '1px solid #fecaca' },
  billingTime: { margin: '6px 0 0 0', fontSize: '11px', color: 'var(--text-muted)' },
  diagnosticGrid: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 1fr 1fr',
    gap: '16px',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-lg)',
    padding: '16px',
    fontSize: '13px'
  },
  metaLabel: { color: 'var(--text-muted)' },
  metaValue: { margin: '4px 0 0 0', fontWeight: '600', color: 'var(--text-main)' },
  sectionTableWrapper: { border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' },
  sectionTableHeader: { backgroundColor: 'var(--bg-main)', padding: '10px 14px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '6px' },
  sectionTableHeaderTitle: { fontSize: '13px', color: 'var(--text-main)' },
  tableCommon: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
  thStt: { width: '50px', textAlign: 'center' },
  thItemName: { textAlign: 'left' },
  thQty: { width: '80px', textAlign: 'center' },
  thPrice: { width: '140px', textAlign: 'right' },
  thSubtotal: { width: '160px', textAlign: 'right' },
  tdCenter: { textAlign: 'center' },
  tdRight: { textAlign: 'right' },
  tdBoldSubtotal: { textAlign: 'right', fontWeight: '750', color: 'var(--text-main)' },
  noDataRow: { textAlign: 'center', padding: '16px', color: 'var(--text-muted)', fontStyle: 'italic' },
  sectionTableVatTuHeader: {
    backgroundColor: 'var(--bg-main)',
    padding: '8px 14px',
    borderBottom: '1px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  addSupplyBtn: { height: '24px', fontSize: '11px', padding: '0 8px', display: 'flex', alignItems: 'center', gap: '3px' },
  summaryPanelRow: { display: 'flex', gap: '20px', marginTop: '10px' },
  summaryPanelLeft: {
    flex: 1,
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-lg)',
    padding: '18px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    backgroundColor: '#fafafa'
  },
  summaryPanelRight: {
    flex: 1.1,
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-lg)',
    padding: '18px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    backgroundColor: '#f8fafc'
  },
  summaryTitle: { fontSize: '13px', fontWeight: '700', color: 'var(--primary)', margin: 0, borderBottom: '1px dashed var(--border-color)', paddingBottom: '8px' },
  paymentRadios: { display: 'flex', gap: '10px', marginTop: '6px' },
  getPaymentRadioLabelStyle: (isSelected, disabled) => ({
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border-color)'}`,
    borderRadius: '6px',
    cursor: disabled ? 'default' : 'pointer',
    backgroundColor: isSelected ? 'var(--primary-light)' : '#ffffff',
    fontSize: '12.5px',
    fontWeight: '600'
  }),
  summaryRow: { display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-muted)' },
  summaryRowGrand: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '15px',
    color: 'var(--text-main)',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '10px',
    marginTop: '4px'
  },
  grandTotalText: { color: '#0052cc', fontSize: '18px' },
  payBtn: {
    width: '100%',
    height: '42px',
    fontSize: '14px',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    boxShadow: 'var(--shadow-md)'
  },
  paidActionsContainer: { display: 'flex', gap: '8px' },
  printBtn: {
    flex: 1,
    height: '40px',
    fontSize: '13.5px',
    fontWeight: '600',
    borderColor: '#0052cc',
    color: '#0052cc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px'
  },
  alreadyPaidBtn: {
    flex: 1,
    height: '40px',
    fontSize: '13.5px',
    backgroundColor: '#e2e8f0',
    color: 'var(--text-muted)',
    border: 'none',
    cursor: 'not-allowed',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 200,
    animation: 'fadeIn 0.2s'
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 'var(--radius-lg)',
    width: '400px',
    boxShadow: 'var(--shadow-lg)',
    border: '1px solid var(--border-color)',
    overflow: 'hidden'
  },
  modalHeader: { backgroundColor: 'var(--primary)', color: '#ffffff', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  modalHeaderTitle: { fontSize: '14px', fontWeight: 'bold' },
  modalCloseBtn: { background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', fontSize: '16px' },
  modalForm: { padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' },
  modalFormSelect: { height: '36px', fontSize: '13px', padding: '0 8px' },
  modalFormInput: { height: '36px', fontSize: '13px' },
  modalActions: { display: 'flex', gap: '10px', marginTop: '10px' },
  modalSubmitBtn: { flex: 1, height: '36px', fontSize: '13px' },
  modalCancelBtn: { flex: 1, height: '36px', fontSize: '13px' }
};

export default ThanhToanHoaDon;
