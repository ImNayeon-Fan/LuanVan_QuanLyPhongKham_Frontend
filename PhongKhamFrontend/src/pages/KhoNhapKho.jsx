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
    <div className="kb-wrapper h-screen overflow-hidden relative">
      {/* Topbar điều hướng */}
      <div className="kb-topbar h-[50px] px-5 flex items-center justify-between">
        <div className="flex-1 flex justify-start items-center">
          <button className="kb-back-btn py-[5px] px-[10px]" onClick={() => navigate('/')}>
            <ArrowLeft size={16} /> Quay về trang chủ
          </button>
        </div>
        <div className="kb-topbar-title flex-1 flex justify-center items-center text-[15px]">
          <Database size={18} className="mr-[6px]" />
          <strong>Quản lý Nhập kho thuốc & Lô thuốc</strong>
        </div>
        <div className="flex-1 flex justify-end items-center text-[12px] opacity-85">
          <span>Trang chủ / Kho dược / Nhập kho thuốc</span>
        </div>
      </div>

      {/* Vùng làm việc chính */}
      <div className="kb-body flex h-[calc(100vh-50px)] bg-[var(--bg-main)] overflow-hidden">
        
        {/* CỘT TRÁI: Bảng danh sách lô thuốc nhập */}
        <div className="flex-[1.3] flex flex-col border-r border-[var(--border-color)] h-full bg-white">
          <div className="flex justify-between items-center py-3 px-4 border-b border-[var(--border-color)] bg-[var(--bg-main)]">
            <div className="flex items-center gap-1.5">
              <Database size={16} className="text-[var(--primary)]" />
              <h3 className="text-[14.5px] font-[750] text-[var(--text-main)]">Danh sách Lô thuốc nhập kho</h3>
            </div>
            <div className="flex gap-2">
              <button onClick={openSupplierModal} className="btn-outline h-8 text-[12.5px] px-3 flex items-center gap-1 border border-[var(--primary)] text-[var(--primary)]">
                <Users size={14} /> Nhà cung cấp
              </button>
              <button onClick={handleAddNew} className="btn-primary h-8 text-[12.5px] px-3 flex items-center gap-1">
                <Plus size={14} /> Nhập kho lô mới
              </button>
            </div>
          </div>

          {/* Bảng dữ liệu lô thuốc */}
          <div className="flex-1 overflow-y-auto">
            <table className="kb-table w-full border-collapse text-[13px]">
              <thead>
                <tr className="sticky top-0 z-10 bg-[var(--bg-main)] border-b-2 border-[var(--border-color)]">
                  <th className="w-[50px] text-center p-2">STT</th>
                  <th className="w-[80px] p-2">Mã lô</th>
                  <th className="w-[160px] p-2">Dược phẩm</th>
                  <th className="w-[160px] p-2">Nhà cung cấp</th>
                  <th className="w-[80px] p-2 text-right">SL Nhập</th>
                  <th className="w-[80px] p-2 text-right">SL Tồn</th>
                  <th className="w-[100px] p-2 text-right">Giá bán</th>
                  <th className="w-[120px] p-2 text-center">Trạng thái HSD</th>
                  <th className="w-[60px] p-2 text-center">Xóa</th>
                </tr>
                {/* Các ô tìm kiếm bộ lọc */}
                <tr className="bg-[var(--bg-main)] border-b border-[var(--border-color)]">
                  <td></td>
                  <td className="p-1">
                    <input 
                      type="text" placeholder="Mã..." className="form-input h-[26px] text-[12px] py-[2px] px-[4px]"
                      value={filters.maLo} onChange={e => handleFilterChange('maLo', e.target.value)}
                    />
                  </td>
                  <td className="p-1">
                    <input 
                      type="text" placeholder="Tên thuốc..." className="form-input h-[26px] text-[12px] py-[2px] px-[6px]"
                      value={filters.tenThuoc} onChange={e => handleFilterChange('tenThuoc', e.target.value)}
                    />
                  </td>
                  <td className="p-1">
                    <input 
                      type="text" placeholder="Tên NCC..." className="form-input h-[26px] text-[12px] py-[2px] px-[6px]"
                      value={filters.tenNCC} onChange={e => handleFilterChange('tenNCC', e.target.value)}
                    />
                  </td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td className="p-1">
                    <select className="form-input h-[26px] text-[12px] py-0 px-1" value={filters.expiryStatus} onChange={e => handleFilterChange('expiryStatus', e.target.value)}>
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
                      key={item.maLo} 
                      className={`kb-table-row cursor-pointer transition-colors duration-150 ${isSelected ? 'bg-[var(--primary-light)]' : 'bg-transparent'}`}
                      onClick={() => setSelectedLot(item)}
                    >
                      <td className="text-center py-2.5 px-2 text-[var(--text-muted)]">{startIndex + idx + 1}</td>
                      <td className={`font-semibold py-2.5 px-2 ${isSelected ? 'text-[var(--primary-hover)]' : 'text-[var(--text-main)]'}`}>{item.maLo}</td>
                      <td className="font-[650] py-2.5 px-2">
                        {drug.tenThuoc || 'Thuốc không xác định'}
                        <div className="text-[11px] font-normal text-[var(--text-muted)]">{drug.hoatChat}</div>
                      </td>
                      <td className="py-2.5 px-2 text-[12px]">{sup.tenNCC || 'NCC không xác định'}</td>
                      <td className="py-2.5 px-2 text-right font-medium">{item.soLuongNhap}</td>
                      <td className={`py-2.5 px-2 text-right font-semibold ${item.soLuongTon === 0 ? 'text-[#ef4444]' : 'text-[var(--text-main)]'}`}>{item.soLuongTon}</td>
                      <td className="py-2.5 px-2 text-right font-semibold text-[var(--primary)]">{(item.giaBan || 0).toLocaleString()}đ</td>
                      <td className="py-2.5 px-2 text-center">
                        <span className={`text-[11px] font-semibold py-0.5 px-2 rounded-[10px] ${
                          expInfo.class === 'expired' ? 'bg-[#fee2e2] text-[#ef4444]' : expInfo.class === 'expiring' ? 'bg-[#ffedd5] text-[#ea580c]' : 'bg-[#dcfce7] text-[#16a34a]'
                        }`}>{expInfo.label}</span>
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <button 
                          className="kb-icon-btn kb-icon-btn--danger mx-auto"
                          onClick={(e) => { e.stopPropagation(); handleDeleteLot(item.maLo); }}
                          title="Xóa lô thuốc"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filteredLots.length === 0 && (
                  <tr>
                    <td colSpan={9} className="text-center p-10 text-[var(--text-muted)]">Không tìm thấy lô thuốc trùng khớp với bộ lọc tìm kiếm</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Phân trang danh sách */}
          <div className="border-t border-[var(--border-color)] py-2 px-4 flex justify-between items-center text-[12.5px] text-[var(--text-muted)] bg-[var(--bg-main)]">
            <div className="flex gap-1 items-center">
              <button 
                disabled={activePage === 1} 
                onClick={() => setCurrentPage(activePage - 1)} 
                className={`h-6 w-6 rounded border border-[#0ea5e9] flex items-center justify-center text-[11px] font-bold transition-all ${
                  activePage === 1 
                    ? 'opacity-40 cursor-not-allowed text-[#0ea5e9] bg-transparent' 
                    : 'text-[#0ea5e9] bg-transparent hover:bg-[#e0f2fe] cursor-pointer'
                }`}
              >
                &lt;
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button 
                  key={p} 
                  onClick={() => setCurrentPage(p)} 
                  className={`h-6 w-6 rounded border flex items-center justify-center text-[11px] font-bold transition-all cursor-pointer ${
                    p === activePage
                      ? "bg-[#0ea5e9] text-white border-[#0ea5e9]"
                      : "bg-transparent text-[#0ea5e9] border-[#0ea5e9] hover:bg-[#e0f2fe]"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button 
                disabled={activePage === totalPages} 
                onClick={() => setCurrentPage(activePage + 1)} 
                className={`h-6 w-6 rounded border border-[#0ea5e9] flex items-center justify-center text-[11px] font-bold transition-all ${
                  activePage === totalPages 
                    ? 'opacity-40 cursor-not-allowed text-[#0ea5e9] bg-transparent' 
                    : 'text-[#0ea5e9] bg-transparent hover:bg-[#e0f2fe] cursor-pointer'
                }`}
              >
                &gt;
              </button>
            </div>
            <span>Hiển thị {filteredLots.length === 0 ? 0 : startIndex + 1} - {Math.min(endIndex, filteredLots.length)} trên tổng {filteredLots.length} lô</span>
          </div>
        </div>

        {/* CỘT PHẢI: Form chi tiết & chỉnh sửa */}
        <div className="flex-[0.7] flex flex-col h-full bg-white">
          <div className="flex bg-[#0284c7] py-3 px-[18px] h-[42px] items-center text-white text-[13px] font-bold gap-2">
            <Database size={16} />
            <span>NHẬP KHO VÀ ĐỊNH GIÁ LÔ THUỐC</span>
          </div>

          <div className="flex-1 overflow-y-auto p-5 bg-white">
            {selectedLot === null ? (
              <div className="h-full flex flex-col items-center justify-center text-[var(--text-muted)] text-center gap-3">
                <Database size={48} className="opacity-25 text-[var(--primary)]" />
                <div>
                  <h4 className="font-semibold text-[var(--text-main)]">Chưa chọn lô thuốc</h4>
                  <p className="text-[13px] mt-1">Chọn một lô thuốc bên trái hoặc bấm "Nhập kho lô mới" để khai báo lô nhập dược phẩm.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSave} className="h-full flex flex-col justify-between">
                <div className="flex flex-col gap-3.5">
                  
                  {/* Mã Lô & Dược Phẩm */}
                  <div className="grid grid-cols-[1fr_1.2fr] gap-3">
                    <div className="form-group m-0">
                      <label className="form-label text-[12.5px]">Mã lô thuốc <span className="text-red-500">*</span></label>
                      <input 
                        type="text" className="form-input h-9 text-[13px] uppercase" placeholder="VD: L26001" value={formData.maLo}
                        onChange={e => handleInputChange('maLo', e.target.value)} required disabled={!selectedLot.isNew}
                      />
                    </div>
                    
                    <div className="form-group m-0">
                      <label className="form-label text-[12.5px]">Chọn Thuốc <span className="text-red-500">*</span></label>
                      <select 
                        className="form-input h-9 text-[13px] px-2" value={formData.maThuoc} onChange={e => handleInputChange('maThuoc', e.target.value)} required
                      >
                        <option value="">-- Chọn thuốc y tế --</option>
                        {drugs.map(d => (
                          <option key={d.maThuoc} value={d.maThuoc}>{d.tenThuoc} ({d.donViTinh})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Nhà cung cấp */}
                  <div className="form-group m-0">
                    <label className="form-label text-[12.5px]">Nhà cung cấp <span className="text-red-500">*</span></label>
                    <select 
                      className="form-input h-9 text-[13px] px-2" value={formData.maNCC} onChange={e => handleInputChange('maNCC', e.target.value)} required
                    >
                      <option value="">-- Chọn nhà cung cấp sản phẩm --</option>
                      {suppliers.map(s => (
                        <option key={s.maNCC} value={s.maNCC}>{s.tenNCC}</option>
                      ))}
                    </select>
                  </div>

                  {/* Số lượng */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="form-group m-0">
                      <label className="form-label text-[12.5px]">Số lượng nhập <span className="text-red-500">*</span></label>
                      <input 
                        type="number" min="0" className="form-input h-9 text-[13px]" placeholder="Số lượng" value={formData.soLuongNhap}
                        onChange={e => handleInputChange('soLuongNhap', e.target.value)} required
                      />
                    </div>
                    
                    <div className="form-group m-0">
                      <label className="form-label text-[12.5px]">Số lượng tồn kho <span className="text-red-500">*</span></label>
                      <input 
                        type="number" min="0" className="form-input h-9 text-[13px]" placeholder="Số lượng tồn" value={formData.soLuongTon}
                        onChange={e => handleInputChange('soLuongTon', e.target.value)} required
                      />
                    </div>
                  </div>

                  {/* Giá nhập & Giá bán */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="form-group m-0">
                      <label className="form-label text-[12.5px]">Giá nhập đơn vị (đ) <span className="text-red-500">*</span></label>
                      <input 
                        type="number" min="0" className="form-input h-9 text-[13px]" placeholder="Giá nhập" value={formData.giaNhap}
                        onChange={e => handleInputChange('giaNhap', e.target.value)} required
                      />
                    </div>
                    
                    <div className="form-group m-0">
                      <label className="form-label text-[12.5px]">Giá bán niêm yết (đ) <span className="text-red-500">*</span></label>
                      <input 
                        type="number" min="0" className="form-input h-9 text-[13px]" placeholder="Giá bán" value={formData.giaBan}
                        onChange={e => handleInputChange('giaBan', e.target.value)} required
                      />
                    </div>
                  </div>

                  {/* Ngày sản xuất & Hạn sử dụng */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="form-group m-0">
                      <label className="form-label text-[12.5px]">Ngày sản xuất</label>
                      <input 
                        type="date" className="form-input h-9 text-[13px]" value={formData.ngaySanXuat}
                        onChange={e => handleInputChange('ngaySanXuat', e.target.value)}
                      />
                    </div>
                    
                    <div className="form-group m-0">
                      <label className="form-label text-[12.5px]">Hạn sử dụng <span className="text-red-500">*</span></label>
                      <input 
                        type="date" className="form-input h-9 text-[13px]" value={formData.hanSuDung}
                        onChange={e => handleInputChange('hanSuDung', e.target.value)} required
                      />
                    </div>
                  </div>
                </div>

                {/* Các nút hành động Form */}
                <div className="flex justify-end gap-2.5 border-t border-[var(--border-color)] pt-4 mt-5">
                  <button type="button" className="btn-outline w-[100px] h-9 flex items-center justify-center p-0 m-0" onClick={() => setSelectedLot(null)}>Hủy</button>
                  <button type="submit" className="btn-primary w-[120px] h-9 flex items-center justify-center gap-1.5 p-0 m-0"><Save size={16} /> Lưu</button>
                </div>
              </form>
            )}
          </div>
        </div>

      </div>

      {/* POPUP THÀNH VIÊN: NHÀ CUNG CẤP */}
      {isSupplierModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[200]">
          <div className="w-[680px] max-h-[85vh] bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="py-3 px-4.5 bg-[var(--primary)] text-white flex justify-between items-center">
              <div className="flex items-center gap-1.5 text-[14.5px] font-bold">
                <Users size={16} />
                <span>Quản lý Nhà cung cấp dược phẩm</span>
              </div>
              <button onClick={() => setIsSupplierModalOpen(false)} className="bg-none border-none text-white cursor-pointer">
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto flex flex-col gap-5">
              {/* Form thêm nhà cung cấp */}
              <form onSubmit={handleSaveSupplier} className="bg-[var(--bg-main)] p-4 rounded-md border border-dashed border-[var(--border-color)]">
                <h4 className="text-[13px] font-[750] text-[var(--primary)] mb-3">THÊM MỚI NHÀ CUNG CẤP DƯỢC PHẨM</h4>
                <div className="grid grid-cols-[1.2fr_1fr] gap-3 mb-3">
                  <div className="form-group m-0">
                    <label className="form-label text-[12px]">Tên nhà cung cấp <span className="text-red-500">*</span></label>
                    <input 
                      type="text" placeholder="Nhập tên công ty/đại lý..." className="form-input h-[34px] text-[12.5px]"
                      value={supFormData.tenNCC} onChange={e => setSupFormData({ ...supFormData, tenNCC: e.target.value })} required
                    />
                  </div>
                  <div className="form-group m-0">
                    <label className="form-label text-[12px]">Số điện thoại liên lạc</label>
                    <input 
                      type="text" placeholder="Nhập số điện thoại..." className="form-input h-[34px] text-[12.5px]"
                      value={supFormData.sdt} onChange={e => setSupFormData({ ...supFormData, sdt: e.target.value })}
                    />
                  </div>
                </div>
                <div className="form-group mb-3">
                  <label className="form-label text-[12px]">Địa chỉ trụ sở</label>
                  <input 
                    type="text" placeholder="Nhập số nhà, tên đường, khu vực..." className="form-input h-[34px] text-[12.5px]"
                    value={supFormData.diaChi} onChange={e => setSupFormData({ ...supFormData, diaChi: e.target.value })}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button type="button" className="btn-outline h-[30px] px-3 text-[12px]" onClick={() => setSupFormData({ maNCC: supFormData.maNCC, tenNCC: '', sdt: '', diaChi: '' })}>Reset Form</button>
                  <button type="submit" className="btn-primary h-[30px] px-4 text-[12px] flex items-center gap-1"><Check size={14} /> Thêm & Chọn</button>
                </div>
              </form>

              {/* Bảng danh sách nhà cung cấp */}
              <div>
                <h4 className="text-[13px] font-[750] text-[var(--text-main)] mb-2">Danh sách Nhà cung cấp hiện có</h4>
                <div className="border border-[var(--border-color)] rounded overflow-hidden">
                  <table className="kb-table w-full border-collapse text-[12.5px]">
                    <thead>
                      <tr className="bg-[var(--bg-main)]">
                        <th className="w-[50px] p-1.5 text-center">STT</th>
                        <th className="w-[80px] p-1.5">Mã NCC</th>
                        <th className="p-1.5">Tên nhà cung cấp</th>
                        <th className="w-[110px] p-1.5">Số điện thoại</th>
                        <th className="w-[50px] p-1.5 text-center">Xóa</th>
                      </tr>
                    </thead>
                    <tbody>
                      {suppliers.map((sup, sidx) => (
                        <tr key={sup.maNCC} className="border-b border-[var(--border-color)]">
                          <td className="text-center py-2 px-1.5 text-[var(--text-muted)]">{sidx + 1}</td>
                          <td className="font-semibold py-2 px-1.5">{sup.maNCC}</td>
                          <td className="py-2 px-1.5 font-medium">
                            {sup.tenNCC}
                            <div className="text-[11px] text-[var(--text-muted)] font-normal">{sup.diaChi}</div>
                          </td>
                          <td className="py-2 px-1.5">{sup.sdt || '—'}</td>
                          <td className="py-2 px-1.5 text-center">
                            <button
                              type="button" onClick={() => handleDeleteSupplier(sup.maNCC, sup.tenNCC)}
                              className="kb-icon-btn kb-icon-btn--danger mx-auto"
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
            <div className="py-2.5 px-5 bg-[var(--bg-main)] border-t border-[var(--border-color)] flex justify-end">
              <button onClick={() => setIsSupplierModalOpen(false)} className="btn-primary h-8 px-5 text-[12.5px]">Hoàn tất & Đóng</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default KhoNhapKho;
