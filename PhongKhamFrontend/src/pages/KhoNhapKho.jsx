import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Search, Database, Plus, Trash2, 
  Save, Users, X, Check
} from 'lucide-react';
import { useToast } from '../utils/ToastContext';

// Danh sách nhà cung cấp mặc định ban đầu
const DEFAULT_SUPPLIERS = [
  { maNCC: 'NCC001', tenNCC: 'Công ty Cổ phần Dược phẩm OPC', sdt: '02839600065', diaChi: '1017 Hồng Bàng, Q.6, TP.HCM' },
  { maNCC: 'NCC002', tenNCC: 'Công ty Cổ phần Dược Hậu Giang', sdt: '02923891433', diaChi: '288 Nguyễn Văn Cừ, Cần Thơ' },
  { maNCC: 'NCC003', tenNCC: 'Công ty TNHH Dược phẩm Takeda', sdt: '02838245558', diaChi: 'Quận 1, TP. Hồ Chí Minh' },
];

// Danh sách lô thuốc nhập kho mặc định ban đầu
const DEFAULT_LOTS = [
  { maLo: 'L26001', maThuoc: 'TH001', maNCC: 'NCC001', soLuongNhap: 1000, soLuongTon: 850, giaNhap: 500, giaBan: 1000, ngaySanXuat: '2026-01-10', hanSuDung: '2029-01-10' },
  { maLo: 'L26002', maThuoc: 'TH002', maNCC: 'NCC002', soLuongNhap: 500, soLuongTon: 500, giaNhap: 1200, giaBan: 2000, ngaySanXuat: '2026-02-15', hanSuDung: '2028-02-15' },
  { maLo: 'L26003', maThuoc: 'TH005', maNCC: 'NCC003', soLuongNhap: 200, soLuongTon: 120, giaNhap: 15000, giaBan: 22000, ngaySanXuat: '2026-03-01', hanSuDung: '2026-09-01' },
];

/**
 * Component Quản lý Nhập kho thuốc & Lô thuốc tại phòng khám
 */
function KhoNhapKho() {
  const navigate = useNavigate();
  const { showSuccess, showError, showWarning } = useToast();
  
  const [lots, setLots] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [drugs, setDrugs] = useState([]);
  
  const [selectedLot, setSelectedLot] = useState(null);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);

  // State thông tin form nhập kho lô thuốc
  const [formData, setFormData] = useState({
    maLo: '', maThuoc: '', maNCC: '', soLuongNhap: '', soLuongTon: '', giaNhap: '', giaBan: '', ngaySanXuat: '', hanSuDung: ''
  });

  // State thông tin form thêm mới nhà cung cấp
  const [supFormData, setSupFormData] = useState({
    maNCC: '', tenNCC: '', sdt: '', diaChi: ''
  });

  // Bộ lọc tìm kiếm lô thuốc
  const [filters, setFilters] = useState({
    maLo: '', tenThuoc: '', tenNCC: '', expiryStatus: '' // Trạng thái hạn sử dụng: 'All', 'Safe', 'Expiring', 'Expired'
  });

  // Phân trang danh sách lô thuốc
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Lấy dữ liệu danh mục thuốc, nhà cung cấp và lô thuốc nhập kho từ LocalStorage
  useEffect(() => {
    try {
      const storedDrugs = localStorage.getItem('danhMucThuoc');
      if (storedDrugs) {
        setDrugs(JSON.parse(storedDrugs));
      } else {
        const initialDrugs = [
          { maThuoc: 'TH001', tenThuoc: 'Paracetamol 500mg', hoatChat: 'Paracetamol', donViTinh: 'Viên' },
          { maThuoc: 'TH002', tenThuoc: 'Amoxicillin 500mg', hoatChat: 'Amoxicillin trihydrate', donViTinh: 'Viên' },
          { maThuoc: 'TH003', tenThuoc: 'Panadol Extra', hoatChat: 'Paracetamol + Caffeine', donViTinh: 'Viên' },
          { maThuoc: 'TH004', tenThuoc: 'Decolgen Forte', hoatChat: 'Paracetamol + Chlorpheniramine', donViTinh: 'Vỉ' },
          { maThuoc: 'TH005', tenThuoc: 'Gaviscon Dual Action', hoatChat: 'Sodium alginate + Calcium carbonate', donViTinh: 'Chai' },
        ];
        localStorage.setItem('danhMucThuoc', JSON.stringify(initialDrugs));
        setDrugs(initialDrugs);
      }
    } catch (e) {}

    try {
      const storedSups = localStorage.getItem('danhSachNhaCungCap');
      if (storedSups) {
        setSuppliers(JSON.parse(storedSups));
      } else {
        localStorage.setItem('danhSachNhaCungCap', JSON.stringify(DEFAULT_SUPPLIERS));
        setSuppliers(DEFAULT_SUPPLIERS);
      }
    } catch (e) {}

    try {
      const storedLots = localStorage.getItem('danhSachLoThuoc');
      if (storedLots) {
        setLots(JSON.parse(storedLots));
      } else {
        localStorage.setItem('danhSachLoThuoc', JSON.stringify(DEFAULT_LOTS));
        setLots(DEFAULT_LOTS);
      }
    } catch (e) {}
  }, []);

  // Đặt lại trang về 1 khi bộ lọc thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // Điền dữ liệu lô thuốc đã chọn vào form chi tiết
  useEffect(() => {
    if (selectedLot) {
      setFormData({
        maLo: selectedLot.maLo || '',
        maThuoc: selectedLot.maThuoc || '',
        maNCC: selectedLot.maNCC || '',
        soLuongNhap: selectedLot.soLuongNhap !== undefined ? selectedLot.soLuongNhap : '',
        soLuongTon: selectedLot.soLuongTon !== undefined ? selectedLot.soLuongTon : '',
        giaNhap: selectedLot.giaNhap !== undefined ? selectedLot.giaNhap : '',
        giaBan: selectedLot.giaBan !== undefined ? selectedLot.giaBan : '',
        ngaySanXuat: selectedLot.ngaySanXuat || '',
        hanSuDung: selectedLot.hanSuDung || ''
      });
    } else {
      setFormData({ maLo: '', maThuoc: '', maNCC: '', soLuongNhap: '', soLuongTon: '', giaNhap: '', giaBan: '', ngaySanXuat: '', hanSuDung: '' });
    }
  }, [selectedLot]);

  // Kiểm tra hạn sử dụng của lô thuốc y tế (Cảnh báo hạn ngắn dưới 6 tháng)
  const getExpiryStatus = (hsdString) => {
    if (!hsdString) return { text: 'N/A', class: 'safe', label: 'An toàn' };
    const hsdDate = new Date(hsdString);
    const today = new Date();
    
    if (hsdDate < today) {
      return { text: 'Expired', class: 'expired', label: 'Đã hết hạn!' };
    }
    
    const diffTime = hsdDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 180) { // Hạn ngắn dưới 6 tháng (180 ngày)
      return { text: 'Expiring', class: 'expiring', label: `Hạn ngắn (${Math.ceil(diffDays / 30)} th)` };
    }
    
    return { text: 'Safe', class: 'safe', label: 'An toàn' };
  };

  // Áp dụng bộ lọc tìm kiếm trên danh sách lô thuốc
  const filteredLots = lots.filter(item => {
    const drug = drugs.find(d => d.maThuoc === item.maThuoc) || {};
    const sup = suppliers.find(s => s.maNCC === item.maNCC) || {};
    const tenThuoc = drug.tenThuoc || '';
    const tenNCC = sup.tenNCC || '';
    const expStatus = getExpiryStatus(item.hanSuDung).text;

    const matchesMaLo = (item.maLo || '').toLowerCase().includes(filters.maLo.toLowerCase());
    const matchesThuoc = tenThuoc.toLowerCase().includes(filters.tenThuoc.toLowerCase());
    const matchesNCC = tenNCC.toLowerCase().includes(filters.tenNCC.toLowerCase());
    const matchesExp = !filters.expiryStatus || filters.expiryStatus === 'All' || expStatus === filters.expiryStatus;

    return matchesMaLo && matchesThuoc && matchesNCC && matchesExp;
  });

  // Tính toán phân trang
  const totalPages = Math.max(1, Math.ceil(filteredLots.length / itemsPerPage));
  const activePage = Math.min(currentPage, totalPages);
  const startIndex = (activePage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayedLots = filteredLots.slice(startIndex, endIndex);

  // Xử lý thay đổi input trên form thông tin
  const handleInputChange = (key, val) => {
    if (key === 'soLuongNhap' && !formData.soLuongTon) {
      setFormData({ ...formData, soLuongNhap: val, soLuongTon: val });
    } else {
      setFormData({ ...formData, [key]: val });
    }
  };

  // Xử lý thay đổi bộ lọc tìm kiếm
  const handleFilterChange = (key, val) => {
    setFilters({ ...filters, [key]: val });
  };

  // Khởi tạo một lô thuốc nhập kho mới với mã tự sinh (Lxxxxx)
  const handleAddNew = () => {
    const lotNumbers = lots
      .map(l => l.maLo)
      .filter(id => /^L\d+$/i.test(id))
      .map(id => parseInt(id.replace(/^L/i, ''), 10));
    const nextNum = lotNumbers.length > 0 ? Math.max(...lotNumbers) + 1 : 1;
    const newCode = `L${String(nextNum).padStart(5, '0')}`;

    setSelectedLot({
      maLo: newCode,
      maThuoc: drugs.length > 0 ? drugs[0].maThuoc : '',
      maNCC: suppliers.length > 0 ? suppliers[0].maNCC : '',
      soLuongNhap: '',
      soLuongTon: '',
      giaNhap: '',
      giaBan: '',
      ngaySanXuat: '',
      hanSuDung: '',
      isNew: true
    });
  };

  // Lưu thông tin lô thuốc nhập kho (Thêm mới hoặc Cập nhật)
  const handleSave = (e) => {
    if (e) e.preventDefault();
    if (!formData.maLo.trim()) {
      showError("Vui lòng nhập mã lô!");
      return;
    }
    if (!formData.maThuoc) {
      showError("Vui lòng chọn thuốc!");
      return;
    }
    if (!formData.maNCC) {
      showError("Vui lòng chọn nhà cung cấp!");
      return;
    }

    const slNhap = parseInt(formData.soLuongNhap, 10);
    const slTon = parseInt(formData.soLuongTon, 10);
    const gNhap = parseFloat(formData.giaNhap);
    const gBan = parseFloat(formData.giaBan);

    if (isNaN(slNhap) || slNhap < 0) {
      showError("Số lượng nhập phải là số không âm!");
      return;
    }
    if (isNaN(slTon) || slTon < 0 || slTon > slNhap) {
      showError("Số lượng tồn phải là số không âm và không vượt quá số lượng nhập!");
      return;
    }
    if (isNaN(gNhap) || gNhap < 0) {
      showError("Giá nhập phải là số không âm!");
      return;
    }
    if (isNaN(gBan) || gBan < 0) {
      showError("Giá bán phải là số không âm!");
      return;
    }
    if (formData.ngaySanXuat && formData.hanSuDung && new Date(formData.hanSuDung) <= new Date(formData.ngaySanXuat)) {
      showError("Hạn sử dụng phải sau Ngày sản xuất!");
      return;
    }

    const updatedLot = {
      maLo: formData.maLo.trim().toUpperCase(),
      maThuoc: formData.maThuoc,
      maNCC: formData.maNCC,
      soLuongNhap: slNhap,
      soLuongTon: slTon,
      giaNhap: gNhap,
      giaBan: gBan,
      ngaySanXuat: formData.ngaySanXuat,
      hanSuDung: formData.hanSuDung
    };

    let newList = [];
    const isEditingExisting = lots.some(l => l.maLo === updatedLot.maLo);

    if (isEditingExisting) {
      newList = lots.map(l => l.maLo === updatedLot.maLo ? updatedLot : l);
    } else {
      newList = [...lots, updatedLot];
    }

    setLots(newList);
    localStorage.setItem('danhSachLoThuoc', JSON.stringify(newList));
    setSelectedLot(updatedLot);
    showSuccess("Cập nhật lô thuốc nhập kho thành công!");
  };

  // Xóa lô thuốc khỏi dữ liệu nhập kho
  const handleDeleteLot = (maLo) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa lô thuốc: ${maLo} khỏi dữ liệu nhập kho?`)) {
      const newList = lots.filter(l => l.maLo !== maLo);
      setLots(newList);
      localStorage.setItem('danhSachLoThuoc', JSON.stringify(newList));
      if (selectedLot && selectedLot.maLo === maLo) {
        setSelectedLot(null);
      }
    }
  };

  // Mở modal quản lý danh sách nhà cung cấp
  const openSupplierModal = () => {
    const supNumbers = suppliers
      .map(s => s.maNCC)
      .filter(id => /^NCC\d+$/i.test(id))
      .map(id => parseInt(id.replace(/^NCC/i, ''), 10));
    const nextNum = supNumbers.length > 0 ? Math.max(...supNumbers) + 1 : 1;
    const newCode = `NCC${String(nextNum).padStart(3, '0')}`;

    setSupFormData({ maNCC: newCode, tenNCC: '', sdt: '', diaChi: '' });
    setIsSupplierModalOpen(true);
  };

  // Lưu mới nhà cung cấp dược phẩm trong modal
  const handleSaveSupplier = (e) => {
    e.preventDefault();
    if (!supFormData.tenNCC.trim()) {
      showError("Vui lòng nhập tên nhà cung cấp!");
      return;
    }

    const newSup = {
      maNCC: supFormData.maNCC,
      tenNCC: supFormData.tenNCC.trim(),
      sdt: supFormData.sdt.trim(),
      diaChi: supFormData.diaChi.trim()
    };

    const newList = [...suppliers, newSup];
    setSuppliers(newList);
    localStorage.setItem('danhSachNhaCungCap', JSON.stringify(newList));
    
    setFormData({ ...formData, maNCC: newSup.maNCC });
    showSuccess(`Đã thêm nhà cung cấp "${newSup.tenNCC}" thành công!`);
    setIsSupplierModalOpen(false);
  };

  // Xóa nhà cung cấp dược phẩm trong modal
  const handleDeleteSupplier = (maNCC, tenNCC) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa nhà cung cấp: ${tenNCC}?`)) {
      const newList = suppliers.filter(s => s.maNCC !== maNCC);
      setSuppliers(newList);
      localStorage.setItem('danhSachNhaCungCap', JSON.stringify(newList));
    }
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
          <Database size={18} style={{ marginRight: '6px' }} />
          <strong>Quản lý Nhập kho thuốc & Lô thuốc</strong>
        </div>
        <div style={styles.topbarRight}>
          <span>Trang chủ / Kho dược / Nhập kho thuốc</span>
        </div>
      </div>

      {/* Vùng làm việc chính */}
      <div className="kb-body" style={styles.body}>
        
        {/* CỘT TRÁI: Bảng danh sách lô thuốc nhập */}
        <div style={styles.leftCol}>
          <div style={styles.panelHeader}>
            <div style={styles.panelTitleContainer}>
              <Database size={16} style={{ color: 'var(--primary)' }} />
              <h3 style={styles.panelTitleText}>Danh sách Lô thuốc nhập kho</h3>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={openSupplierModal} className="btn-outline" style={styles.btnNcc}>
                <Users size={14} /> Nhà cung cấp
              </button>
              <button onClick={handleAddNew} className="btn-primary" style={styles.addBtn}>
                <Plus size={14} /> Nhập kho lô mới
              </button>
            </div>
          </div>

          {/* Bảng dữ liệu lô thuốc */}
          <div style={styles.tableContainer}>
            <table className="kb-table" style={styles.table}>
              <thead>
                <tr style={styles.tableHeaderRow}>
                  <th style={styles.thStt}>STT</th>
                  <th style={styles.thMaLo}>Mã lô</th>
                  <th style={styles.thDuoCPhan}>Dược phẩm</th>
                  <th style={styles.thNCC}>Nhà cung cấp</th>
                  <th style={styles.thNum}>SL Nhập</th>
                  <th style={styles.thNum}>SL Tồn</th>
                  <th style={styles.thGia}>Giá bán</th>
                  <th style={styles.thHsd}>Trạng thái HSD</th>
                  <th style={styles.thXoa}>Xóa</th>
                </tr>
                {/* Các ô tìm kiếm bộ lọc */}
                <tr style={styles.filterRow}>
                  <td></td>
                  <td style={styles.tdPadding4}>
                    <input 
                      type="text" placeholder="Mã..." className="form-input" style={styles.filterInputMa}
                      value={filters.maLo} onChange={e => handleFilterChange('maLo', e.target.value)}
                    />
                  </td>
                  <td style={styles.tdPadding4}>
                    <input 
                      type="text" placeholder="Tên thuốc..." className="form-input" style={styles.filterInputCommon}
                      value={filters.tenThuoc} onChange={e => handleFilterChange('tenThuoc', e.target.value)}
                    />
                  </td>
                  <td style={styles.tdPadding4}>
                    <input 
                      type="text" placeholder="Tên NCC..." className="form-input" style={styles.filterInputCommon}
                      value={filters.tenNCC} onChange={e => handleFilterChange('tenNCC', e.target.value)}
                    />
                  </td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td style={styles.tdPadding4}>
                    <select className="form-input" style={styles.filterSelect} value={filters.expiryStatus} onChange={e => handleFilterChange('expiryStatus', e.target.value)}>
                      <option value="All">Tất cả HSD</option>
                      <option value="Safe">An toàn</option>
                      <option value="Expiring">Hạn ngắn (&lt;6 th)</option>
                      <option value="Expired">Đã hết hạn</option>
                    </select>
                  </td>
                  <td></td>
                </tr>
              </thead>
              <tbody>
                {displayedLots.map((item, idx) => {
                  const isSelected = selectedLot && selectedLot.maLo === item.maLo;
                  const drug = drugs.find(d => d.maThuoc === item.maThuoc) || {};
                  const sup = suppliers.find(s => s.maNCC === item.maNCC) || {};
                  const expInfo = getExpiryStatus(item.hanSuDung);
                  
                  return (
                    <tr 
                      key={item.maLo} className="kb-table-row"
                      style={{ 
                        backgroundColor: isSelected ? 'var(--primary-light)' : 'transparent',
                        cursor: 'pointer', transition: 'background-color 0.15s'
                      }}
                      onClick={() => setSelectedLot(item)}
                    >
                      <td style={styles.tdStt}>{startIndex + idx + 1}</td>
                      <td style={{ fontWeight: '600', color: isSelected ? 'var(--primary-hover)' : 'var(--text-main)', padding: '10px 8px' }}>{item.maLo}</td>
                      <td style={{ fontWeight: '650', padding: '10px 8px' }}>
                        {drug.tenThuoc || 'Thuốc không xác định'}
                        <div style={{ fontSize: '11px', fontWeight: 'normal', color: 'var(--text-muted)' }}>{drug.hoatChat}</div>
                      </td>
                      <td style={{ padding: '10px 8px', fontSize: '12px' }}>{sup.tenNCC || 'NCC không xác định'}</td>
                      <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: '500' }}>{item.soLuongNhap}</td>
                      <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: '600', color: item.soLuongTon === 0 ? '#ef4444' : 'var(--text-main)' }}>{item.soLuongTon}</td>
                      <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: '600', color: 'var(--primary)' }}>{(item.giaBan || 0).toLocaleString()}đ</td>
                      <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                        <span style={{ 
                          fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '10px',
                          backgroundColor: expInfo.class === 'expired' ? '#fee2e2' : expInfo.class === 'expiring' ? '#ffedd5' : '#dcfce7',
                          color: expInfo.class === 'expired' ? '#ef4444' : expInfo.class === 'expiring' ? '#ea580c' : '#16a34a'
                        }}>{expInfo.label}</span>
                      </td>
                      <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                        <button 
                          className="kb-icon-btn kb-icon-btn--danger"
                          onClick={(e) => { e.stopPropagation(); handleDeleteLot(item.maLo); }}
                          title="Xóa lô thuốc" style={styles.deleteBtnIcon}
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filteredLots.length === 0 && (
                  <tr>
                    <td colSpan={9} style={styles.noDataTd}>Không tìm thấy lô thuốc trùng khớp với bộ lọc tìm kiếm</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Phân trang danh sách */}
          <div style={styles.pagination}>
            <div style={styles.pageBtnGroup}>
              <button 
                disabled={activePage === 1} onClick={() => setCurrentPage(activePage - 1)} className="btn-outline" 
                style={{ ...styles.pageNavBtn, cursor: activePage === 1 ? 'not-allowed' : 'pointer' }}
              >
                &lt;
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setCurrentPage(p)} className={p === activePage ? "btn-primary" : "btn-outline"} style={styles.pageNumberBtn}>{p}</button>
              ))}
              <button 
                disabled={activePage === totalPages} onClick={() => setCurrentPage(activePage + 1)} className="btn-outline" 
                style={{ ...styles.pageNavBtn, cursor: activePage === totalPages ? 'not-allowed' : 'pointer' }}
              >
                &gt;
              </button>
            </div>
            <span>Hiển thị {filteredLots.length === 0 ? 0 : startIndex + 1} - {Math.min(endIndex, filteredLots.length)} trên tổng {filteredLots.length} lô</span>
          </div>
        </div>

        {/* CỘT PHẢI: Form chi tiết & chỉnh sửa */}
        <div style={styles.rightCol}>
          <div style={styles.formHeader}>
            <Database size={16} />
            <span>NHẬP KHO VÀ ĐỊNH GIÁ LÔ THUỐC</span>
          </div>

          <div style={styles.formArea}>
            {selectedLot === null ? (
              <div style={styles.noSelected}>
                <Database size={48} style={styles.noSelectedIcon} />
                <div>
                  <h4 style={{ fontWeight: '600', color: 'var(--text-main)' }}>Chưa chọn lô thuốc</h4>
                  <p style={{ fontSize: '13px', marginTop: '4px' }}>Chọn một lô thuốc bên trái hoặc bấm "Nhập kho lô mới" để khai báo lô nhập dược phẩm.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSave} style={styles.form}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  
                  {/* Mã Lô & Dược Phẩm */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '12px' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: '12.5px' }}>Mã lô thuốc <span style={{ color: 'red' }}>*</span></label>
                      <input 
                        type="text" className="form-input" placeholder="VD: L26001" value={formData.maLo}
                        onChange={e => handleInputChange('maLo', e.target.value)} required disabled={!selectedLot.isNew}
                        style={styles.formMaLoInput}
                      />
                    </div>
                    
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: '12.5px' }}>Chọn Thuốc <span style={{ color: 'red' }}>*</span></label>
                      <select 
                        className="form-input" value={formData.maThuoc} onChange={e => handleInputChange('maThuoc', e.target.value)} required
                        style={styles.formSelectCommon}
                      >
                        <option value="">-- Chọn thuốc y tế --</option>
                        {drugs.map(d => (
                          <option key={d.maThuoc} value={d.maThuoc}>{d.tenThuoc} ({d.donViTinh})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Nhà cung cấp */}
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '12.5px' }}>Nhà cung cấp <span style={{ color: 'red' }}>*</span></label>
                    <select 
                      className="form-input" value={formData.maNCC} onChange={e => handleInputChange('maNCC', e.target.value)} required
                      style={styles.formSelectCommon}
                    >
                      <option value="">-- Chọn nhà cung cấp sản phẩm --</option>
                      {suppliers.map(s => (
                        <option key={s.maNCC} value={s.maNCC}>{s.tenNCC}</option>
                      ))}
                    </select>
                  </div>

                  {/* Số lượng */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: '12.5px' }}>Số lượng nhập <span style={{ color: 'red' }}>*</span></label>
                      <input 
                        type="number" min="0" className="form-input" placeholder="Số lượng" value={formData.soLuongNhap}
                        onChange={e => handleInputChange('soLuongNhap', e.target.value)} required style={styles.formNumInput}
                      />
                    </div>
                    
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: '12.5px' }}>Số lượng tồn kho <span style={{ color: 'red' }}>*</span></label>
                      <input 
                        type="number" min="0" className="form-input" placeholder="Số lượng tồn" value={formData.soLuongTon}
                        onChange={e => handleInputChange('soLuongTon', e.target.value)} required style={styles.formNumInput}
                      />
                    </div>
                  </div>

                  {/* Giá nhập & Giá bán */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: '12.5px' }}>Giá nhập đơn vị (đ) <span style={{ color: 'red' }}>*</span></label>
                      <input 
                        type="number" min="0" className="form-input" placeholder="Giá nhập" value={formData.giaNhap}
                        onChange={e => handleInputChange('giaNhap', e.target.value)} required style={styles.formNumInput}
                      />
                    </div>
                    
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: '12.5px' }}>Giá bán niêm yết (đ) <span style={{ color: 'red' }}>*</span></label>
                      <input 
                        type="number" min="0" className="form-input" placeholder="Giá bán" value={formData.giaBan}
                        onChange={e => handleInputChange('giaBan', e.target.value)} required style={styles.formNumInput}
                      />
                    </div>
                  </div>

                  {/* Ngày sản xuất & Hạn sử dụng */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: '12.5px' }}>Ngày sản xuất</label>
                      <input 
                        type="date" className="form-input" value={formData.ngaySanXuat}
                        onChange={e => handleInputChange('ngaySanXuat', e.target.value)} style={styles.formNumInput}
                      />
                    </div>
                    
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: '12.5px' }}>Hạn sử dụng <span style={{ color: 'red' }}>*</span></label>
                      <input 
                        type="date" className="form-input" value={formData.hanSuDung}
                        onChange={e => handleInputChange('hanSuDung', e.target.value)} required style={styles.formNumInput}
                      />
                    </div>
                  </div>
                </div>

                {/* Các nút hành động Form */}
                <div style={styles.formActionGroup}>
                  <button type="button" className="btn-outline" onClick={() => setSelectedLot(null)} style={styles.cancelBtn}>Hủy</button>
                  <button type="submit" className="btn-primary" style={styles.saveBtn}><Save size={16} /> Lưu</button>
                </div>
              </form>
            )}
          </div>
        </div>

      </div>

      {/* POPUP THÀNH VIÊN: NHÀ CUNG CẤP */}
      {isSupplierModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContainer}>
            {/* Modal Header */}
            <div style={styles.modalHeader}>
              <div style={styles.modalHeaderTitle}>
                <Users size={16} />
                <span>Quản lý Nhà cung cấp dược phẩm</span>
              </div>
              <button onClick={() => setIsSupplierModalOpen(false)} style={styles.modalCloseBtn}>
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={styles.modalBody}>
              {/* Form thêm nhà cung cấp */}
              <form onSubmit={handleSaveSupplier} style={styles.modalForm}>
                <h4 style={styles.modalFormTitle}>THÊM MỚI NHÀ CUNG CẤP DƯỢC PHẨM</h4>
                <div style={styles.modalFormGrid}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '12px' }}>Tên nhà cung cấp <span style={{ color: 'red' }}>*</span></label>
                    <input 
                      type="text" placeholder="Nhập tên công ty/đại lý..." className="form-input"
                      value={supFormData.tenNCC} onChange={e => setSupFormData({ ...supFormData, tenNCC: e.target.value })} required
                      style={styles.modalInput}
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '12px' }}>Số điện thoại liên lạc</label>
                    <input 
                      type="text" placeholder="Nhập số điện thoại..." className="form-input"
                      value={supFormData.sdt} onChange={e => setSupFormData({ ...supFormData, sdt: e.target.value })}
                      style={styles.modalInput}
                    />
                  </div>
                </div>
                <div className="form-group" style={{ margin: '0 0 12px 0' }}>
                  <label className="form-label" style={{ fontSize: '12px' }}>Địa chỉ trụ sở</label>
                  <input 
                    type="text" placeholder="Nhập số nhà, tên đường, khu vực..." className="form-input"
                    value={supFormData.diaChi} onChange={e => setSupFormData({ ...supFormData, diaChi: e.target.value })}
                    style={styles.modalInput}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                  <button type="button" className="btn-outline" onClick={() => setSupFormData({ maNCC: supFormData.maNCC, tenNCC: '', sdt: '', diaChi: '' })} style={styles.modalResetBtn}>Reset Form</button>
                  <button type="submit" className="btn-primary" style={styles.modalSubmitBtn}><Check size={14} /> Thêm & Chọn</button>
                </div>
              </form>

              {/* Bảng danh sách nhà cung cấp */}
              <div>
                <h4 style={styles.modalTableTitle}>Danh sách Nhà cung cấp hiện có</h4>
                <div style={styles.modalTableWrapper}>
                  <table className="kb-table" style={styles.modalTable}>
                    <thead>
                      <tr style={{ background: 'var(--bg-main)' }}>
                        <th style={styles.modalThStt}>STT</th>
                        <th style={styles.modalThMa}>Mã NCC</th>
                        <th style={{ padding: '6px' }}>Tên nhà cung cấp</th>
                        <th style={styles.modalThPhone}>Số điện thoại</th>
                        <th style={styles.modalThXoa}>Xóa</th>
                      </tr>
                    </thead>
                    <tbody>
                      {suppliers.map((sup, sidx) => (
                        <tr key={sup.maNCC} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ textAlign: 'center', padding: '8px 6px', color: 'var(--text-muted)' }}>{sidx + 1}</td>
                          <td style={{ fontWeight: '600', padding: '8px 6px' }}>{sup.maNCC}</td>
                          <td style={{ padding: '8px 6px', fontWeight: '500' }}>
                            {sup.tenNCC}
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 'normal' }}>{sup.diaChi}</div>
                          </td>
                          <td style={{ padding: '8px 6px' }}>{sup.sdt || '—'}</td>
                          <td style={{ padding: '8px 6px', textAlign: 'center' }}>
                            <button
                              type="button" onClick={() => handleDeleteSupplier(sup.maNCC, sup.tenNCC)}
                              className="kb-icon-btn kb-icon-btn--danger" style={{ margin: '0 auto' }}
                            >
                              <Trash2 size={12} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={styles.modalFooter}>
              <button onClick={() => setIsSupplierModalOpen(false)} className="btn-primary" style={styles.modalCloseFooterBtn}>Hoàn tất & Đóng</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Bảng cấu hình CSS inline cho giao diện KhoNhapKho
const styles = {
  wrapper: { height: '100vh', overflow: 'hidden', position: 'relative' },
  topbar: { height: '50px', padding: '0 20px' },
  topbarLeft: { flex: 1, display: 'flex', justifyContent: 'flex-start' },
  backBtn: { padding: '5px 10px' },
  topbarTitle: { flex: 1, display: 'flex', justifyContent: 'center', fontSize: '15px' },
  topbarRight: { flex: 1, display: 'flex', justifyContent: 'flex-end', fontSize: '12px', opacity: 0.85 },
  body: {
    display: 'flex',
    height: 'calc(100vh - 50px)',
    backgroundColor: 'var(--bg-main)',
    overflow: 'hidden'
  },
  leftCol: {
    flex: 1.3,
    display: 'flex',
    flexDirection: 'column',
    borderRight: '1px solid var(--border-color)',
    height: '100%',
    backgroundColor: '#ffffff'
  },
  panelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    borderBottom: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-main)'
  },
  panelTitleContainer: { display: 'flex', alignItems: 'center', gap: '6px' },
  panelTitleText: { fontSize: '14.5px', fontWeight: '750', color: 'var(--text-main)' },
  btnNcc: { height: '32px', fontSize: '12.5px', padding: '0 12px', display: 'flex', alignItems: 'center', gap: '4px', borderColor: 'var(--primary)', color: 'var(--primary)' },
  addBtn: { height: '32px', fontSize: '12.5px', padding: '0 12px', display: 'flex', alignItems: 'center', gap: '4px' },
  tableContainer: { flex: 1, overflowY: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
  tableHeaderRow: { position: 'sticky', top: 0, zIndex: 10, background: 'var(--bg-main)', borderBottom: '2px solid var(--border-color)' },
  thStt: { width: '50px', textAlign: 'center', padding: '8px' },
  thMaLo: { width: '80px', padding: '8px' },
  thDuoCPhan: { width: '160px', padding: '8px' },
  thNCC: { width: '160px', padding: '8px' },
  thNum: { width: '80px', padding: '8px', textAlign: 'right' },
  thGia: { width: '100px', padding: '8px', textAlign: 'right' },
  thHsd: { width: '120px', padding: '8px', textAlign: 'center' },
  thXoa: { width: '60px', padding: '8px', textAlign: 'center' },
  filterRow: { backgroundColor: 'var(--bg-main)', borderBottom: '1px solid var(--border-color)' },
  tdPadding4: { padding: '4px' },
  filterInputMa: { height: '26px', fontSize: '12px', padding: '2px 4px' },
  filterInputCommon: { height: '26px', fontSize: '12px', padding: '2px 6px' },
  filterSelect: { height: '26px', fontSize: '12px', padding: '0 4px' },
  tdStt: { textAlign: 'center', padding: '10px 8px', color: 'var(--text-muted)' },
  deleteBtnIcon: { margin: '0 auto' },
  noDataTd: { textAlign: 'center', padding: '40px', color: 'var(--text-muted)' },
  pagination: {
    borderTop: '1px solid var(--border-color)',
    padding: '8px 16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '12.5px',
    color: 'var(--text-muted)',
    backgroundColor: 'var(--bg-main)'
  },
  pageBtnGroup: { display: 'flex', gap: '4px', alignItems: 'center' },
  pageNavBtn: { height: '24px', width: '24px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  pageNumberBtn: { height: '24px', width: '24px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' },
  rightCol: {
    flex: 0.7,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: '#ffffff'
  },
  formHeader: {
    display: 'flex',
    backgroundColor: '#0284c7',
    padding: '12px 18px',
    height: '42px',
    alignItems: 'center',
    color: '#ffffff',
    fontSize: '13px',
    fontWeight: '700',
    gap: '8px'
  },
  formArea: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px',
    backgroundColor: '#ffffff'
  },
  noSelected: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-muted)',
    textAlign: 'center',
    gap: '12px'
  },
  noSelectedIcon: { opacity: 0.25, color: 'var(--primary)' },
  form: { height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' },
  formMaLoInput: { height: '36px', fontSize: '13px', textTransform: 'uppercase' },
  formSelectCommon: { height: '36px', fontSize: '13px', padding: '0 8px' },
  formNumInput: { height: '36px', fontSize: '13px' },
  formActionGroup: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '16px',
    marginTop: '20px'
  },
  cancelBtn: { width: '100px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, margin: 0 },
  saveBtn: { width: '120px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: 0, margin: 0 },
  
  // MODAL CSS
  modalOverlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 200
  },
  modalContainer: {
    width: '680px', maxHeight: '85vh',
    backgroundColor: '#ffffff', borderRadius: '8px',
    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
    overflow: 'hidden', display: 'flex', flexDirection: 'column'
  },
  modalHeader: {
    padding: '12px 18px', backgroundColor: 'var(--primary)', color: '#ffffff',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
  },
  modalHeaderTitle: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14.5px', fontWeight: 'bold' },
  modalCloseBtn: { background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer' },
  modalBody: { padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' },
  modalForm: {
    backgroundColor: 'var(--bg-main)', padding: '16px', borderRadius: '6px',
    border: '1px dashed var(--border-color)'
  },
  modalFormTitle: { fontSize: '13px', fontWeight: '750', color: 'var(--primary)', marginBottom: '12px' },
  modalFormGrid: { display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px', marginBottom: '12px' },
  modalInput: { height: '34px', fontSize: '12.5px' },
  modalResetBtn: { height: '30px', padding: '0 12px', fontSize: '12px' },
  modalSubmitBtn: { height: '30px', padding: '0 16px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' },
  modalTableTitle: { fontSize: '13px', fontWeight: '750', color: 'var(--text-main)', marginBottom: '8px' },
  modalTableWrapper: { border: '1px solid var(--border-color)', borderRadius: '4px', overflow: 'hidden' },
  modalTable: { width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' },
  modalThStt: { width: '50px', padding: '6px', textAlign: 'center' },
  modalThMa: { width: '80px', padding: '6px' },
  modalThPhone: { width: '110px', padding: '6px' },
  modalThXoa: { width: '50px', padding: '6px', textAlign: 'center' },
  modalFooter: {
    padding: '10px 20px', backgroundColor: 'var(--bg-main)',
    borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end'
  },
  modalCloseFooterBtn: { height: '32px', padding: '0 20px', fontSize: '12.5px' }
};

export default KhoNhapKho;
