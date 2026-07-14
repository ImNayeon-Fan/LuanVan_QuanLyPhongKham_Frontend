import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Search, Database, Plus, Trash2, 
  Save, Users, X, Check, ClipboardList
} from 'lucide-react';
import { useToast } from '../utils/ToastContext';
import {
  apiGetNhaCungCapList,
  apiAddNhaCungCap,
  apiUpdateNhaCungCap,
  apiDeleteNhaCungCap,
  apiGetThuocList,
  apiGetLoThuocList,
  apiAddLoThuoc,
  apiUpdateLoThuoc,
  apiDeleteLoThuoc
} from '../utils/api';

// Danh sách lô thuốc nhập kho mặc định ban đầu (fallback)
const DEFAULT_LOTS = [
  { maLo: 'L26001', maThuoc: 'TH001', maNCC: '1', soLuongNhap: 1000, soLuongTon: 850, giaNhap: 500, giaBan: 1000, ngaySanXuat: '2026-01-10', hanSuDung: '2029-01-10' },
  { maLo: 'L26002', maThuoc: 'TH002', maNCC: '2', soLuongNhap: 500, soLuongTon: 500, giaNhap: 1200, giaBan: 2000, ngaySanXuat: '2026-02-15', hanSuDung: '2028-02-15' },
  { maLo: 'L26003', maThuoc: 'TH005', maNCC: '3', soLuongNhap: 200, soLuongTon: 120, giaNhap: 15000, giaBan: 22000, ngaySanXuat: '2026-03-01', hanSuDung: '2026-09-01' },
];

/**
 * Component Quản lý Nhập kho thuốc, Lô thuốc và Nhà cung cấp
 */
function KhoNhapKho() {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  
  // Tab hiện tại ('lots' hoặc 'suppliers')
  const [activeTab, setActiveTab] = useState('lots');

  // Phân quyền vai trò quản trị kho
  const [isManager, setIsManager] = useState(false);

  // States dữ liệu
  const [lots, setLots] = useState([]);
  const [allSuppliers, setAllSuppliers] = useState([]); // Toàn bộ để chọn & map
  const [suppliers, setSuppliers] = useState([]);       // Phân trang ở tab 2
  const [drugs, setDrugs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Chọn dòng chi tiết
  const [selectedLot, setSelectedLot] = useState(null);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  // State form Lô thuốc
  const [formData, setFormData] = useState({
    maLo: '', maThuoc: '', maNCC: '', soLuongNhap: '', soLuongTon: '', giaNhap: '', giaBan: '', ngaySanXuat: '', hanSuDung: ''
  });

  // State form Nhà cung cấp
  const [supFormData, setSupFormData] = useState({
    maNCC: '', tenNCC: '', sDT: '', diaChi: ''
  });

  // Bộ lọc Lô thuốc
  const [filters, setFilters] = useState({
    maLo: '', tenThuoc: '', tenNCC: '', expiryStatus: ''
  });

  // Bộ lọc Nhà cung cấp
  const [supFilters, setSupFilters] = useState({
    tenNCC: ''
  });

  // Phân trang Lô thuốc
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [totalLots, setTotalLots] = useState(0);

  // Phân trang Nhà cung cấp
  const [supPage, setSupPage] = useState(1);
  const [supPageSize, setSupPageSize] = useState(10);
  const [totalSuppliers, setTotalSuppliers] = useState(0);

  // Kiểm tra vai trò của người dùng
  useEffect(() => {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        const role = u.roleName || u.role || 'Admin';
        setIsManager(role === 'Admin' || role === 'QuanLyKhoThuoc');
      } catch (e) {
        setIsManager(false);
      }
    }
  }, []);

  // Tải danh mục thuốc (Dropdown)
  const loadDrugs = async () => {
    try {
      const res = await apiGetThuocList('', '', '', '', 1, 1000);
      if (res && res.data) {
        setDrugs(res.data);
      }
    } catch (err) {
      console.error('Lỗi tải danh mục thuốc từ máy chủ:', err);
    }
  };

  // Tải toàn bộ nhà cung cấp phục vụ dropdown và hiển thị
  const loadAllSuppliers = async () => {
    try {
      const res = await apiGetNhaCungCapList('', 1, 1000);
      if (res && res.data) {
        setAllSuppliers(res.data);
      }
    } catch (err) {
      console.error('Lỗi tải danh sách nhà cung cấp:', err);
    }
  };

  // Tải danh sách nhà cung cấp phân trang cho bảng bên trái (Tab 2)
  const loadSuppliersData = async () => {
    setIsLoading(true);
    try {
      const res = await apiGetNhaCungCapList(supFilters.tenNCC.trim(), supPage, supPageSize);
      if (res && res.data) {
        setSuppliers(res.data);
        setTotalSuppliers(res.total || 0);
      } else {
        setSuppliers([]);
        setTotalSuppliers(0);
      }
    } catch (err) {
      console.error('Lỗi tải nhà cung cấp phân trang:', err);
      showError('Không thể tải danh sách nhà cung cấp từ máy chủ');
    } finally {
      setIsLoading(false);
    }
  };

  // Tải danh sách lô thuốc phân trang & lọc từ máy chủ
  const loadLotsData = async () => {
    setIsLoading(true);
    try {
      const res = await apiGetLoThuocList(
        filters.maLo.trim(),
        filters.tenThuoc.trim(),
        filters.tenNCC.trim(),
        filters.expiryStatus,
        currentPage,
        itemsPerPage
      );
      if (res && res.data) {
        setLots(res.data);
        setTotalLots(res.total || 0);
      } else {
        setLots([]);
        setTotalLots(0);
      }
    } catch (err) {
      console.error('Lỗi tải danh sách lô thuốc từ máy chủ:', err);
      showError('Không thể tải danh sách lô thuốc từ máy chủ');
    } finally {
      setIsLoading(false);
    }
  };

  // Khởi chạy dữ liệu ban đầu
  useEffect(() => {
    loadDrugs();
    loadAllSuppliers();
  }, []);

  // Gọi tải lô thuốc ở Tab 1 khi lọc/phân trang thay đổi
  useEffect(() => {
    if (activeTab === 'lots') {
      const delayDebounceFn = setTimeout(() => {
        loadLotsData();
      }, 250);
      return () => clearTimeout(delayDebounceFn);
    }
  }, [activeTab, filters.maLo, filters.tenThuoc, filters.tenNCC, filters.expiryStatus, currentPage]);

  // Gọi tải nhà cung cấp ở Tab 2 khi lọc/phân trang thay đổi
  useEffect(() => {
    if (activeTab === 'suppliers') {
      loadSuppliersData();
    }
  }, [activeTab, supFilters.tenNCC, supPage, supPageSize]);

  // Reset trang khi lọc thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [filters.maLo, filters.tenThuoc, filters.tenNCC, filters.expiryStatus]);

  useEffect(() => {
    setSupPage(1);
  }, [supFilters.tenNCC, supPageSize]);

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

  // Điền dữ liệu nhà cung cấp đã chọn vào form chi tiết
  useEffect(() => {
    if (selectedSupplier) {
      setSupFormData({
        maNCC: selectedSupplier.maNCC || '',
        tenNCC: selectedSupplier.tenNCC || '',
        sDT: selectedSupplier.sDT || selectedSupplier.sdt || '',
        diaChi: selectedSupplier.diaChi || ''
      });
    } else {
      setSupFormData({ maNCC: '', tenNCC: '', sDT: '', diaChi: '' });
    }
  }, [selectedSupplier]);

  // Cảnh báo hạn sử dụng lô thuốc
  const getExpiryStatus = (hsdString) => {
    if (!hsdString) return { text: 'N/A', class: 'safe', label: 'An toàn' };
    const hsdDate = new Date(hsdString);
    const today = new Date();
    
    if (hsdDate < today) {
      return { text: 'Expired', class: 'expired', label: 'Đã hết hạn!' };
    }
    
    const diffTime = hsdDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 180) {
      return { text: 'Expiring', class: 'expiring', label: `Hạn ngắn (${Math.ceil(diffDays / 30)} th)` };
    }
    
    return { text: 'Safe', class: 'safe', label: 'An toàn' };
  };

  // Phân trang Lô thuốc
  const totalPages = Math.max(1, Math.ceil(totalLots / itemsPerPage));
  const activePage = Math.min(currentPage, totalPages);
  const startIndex = (activePage - 1) * itemsPerPage;
  const endIndex = startIndex + lots.length;
  const displayedLots = lots;
  const filteredLots = lots; // Khai báo alias để tương thích với các dòng kiểm tra JSX bên dưới

  const getLotPaginationItems = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (activePage <= 4) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (activePage >= totalPages - 3) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(activePage - 1);
        pages.push(activePage);
        pages.push(activePage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  // Phân trang Nhà cung cấp (collapsed pagination)
  const totalSupPages = Math.max(1, Math.ceil(totalSuppliers / supPageSize));
  const activeSupPage = Math.min(supPage, totalSupPages);
  const supStartIndex = (activeSupPage - 1) * supPageSize;
  const supEndIndex = supStartIndex + suppliers.length;

  const getSupPaginationItems = () => {
    const pages = [];
    if (totalSupPages <= 7) {
      for (let i = 1; i <= totalSupPages; i++) {
        pages.push(i);
      }
    } else {
      if (activeSupPage <= 4) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalSupPages);
      } else if (activeSupPage >= totalSupPages - 3) {
        pages.push(1);
        pages.push('...');
        for (let i = totalSupPages - 4; i <= totalSupPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(activeSupPage - 1);
        pages.push(activeSupPage);
        pages.push(activeSupPage + 1);
        pages.push('...');
        pages.push(totalSupPages);
      }
    }
    return pages;
  };

  // Thay đổi input Lô thuốc
  const handleInputChange = (key, val) => {
    if (key === 'soLuongNhap' && !formData.soLuongTon) {
      setFormData({ ...formData, soLuongNhap: val, soLuongTon: val });
    } else {
      setFormData({ ...formData, [key]: val });
    }
  };

  // Thay đổi input Nhà cung cấp
  const handleSupInputChange = (key, val) => {
    setSupFormData({ ...supFormData, [key]: val });
  };

  // Thay đổi bộ lọc Lô thuốc
  const handleFilterChange = (key, val) => {
    setFilters({ ...filters, [key]: val });
  };

  // Thay đổi bộ lọc Nhà cung cấp
  const handleSupFilterChange = (key, val) => {
    setSupFilters({ ...supFilters, [key]: val });
  };

  // Thêm mới Lô thuốc
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
      maNCC: allSuppliers.length > 0 ? allSuppliers[0].maNCC : '',
      soLuongNhap: '',
      soLuongTon: '',
      giaNhap: '',
      giaBan: '',
      ngaySanXuat: '',
      hanSuDung: '',
      isNew: true
    });
  };

  // Thêm mới Nhà cung cấp
  const handleAddNewSupplier = () => {
    setSelectedSupplier({
      maNCC: '',
      tenNCC: '',
      sDT: '',
      diaChi: '',
      isNew: true
    });
  };

  // Lưu lô thuốc
  const handleSave = async (e) => {
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

    const payload = {
      maLo: formData.maLo.trim().toUpperCase(),
      maThuoc: formData.maThuoc,
      maNCC: parseInt(formData.maNCC, 10),
      soLuongNhap: slNhap,
      soLuongTon: slTon,
      giaNhap: gNhap,
      giaBan: gBan,
      ngaySanXuat: formData.ngaySanXuat || null,
      hanSuDung: formData.hanSuDung
    };

    setIsLoading(true);
    try {
      if (selectedLot?.isNew) {
        const res = await apiAddLoThuoc(payload);
        showSuccess(res.message || "Nhập kho lô thuốc mới thành công!");
        setSelectedLot(null);
      } else {
        const res = await apiUpdateLoThuoc(selectedLot.maLo, payload);
        showSuccess(res.message || "Cập nhật lô thuốc thành công!");
        setSelectedLot(null);
      }
      await loadLotsData();
    } catch (err) {
      console.error('Lỗi khi lưu lô thuốc:', err);
      showError(err.message || 'Lưu thông tin thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  // Lưu Nhà cung cấp
  const handleSaveSupplier = async (e) => {
    if (e) e.preventDefault();
    if (!supFormData.tenNCC.trim()) {
      showError("Vui lòng nhập tên nhà cung cấp!");
      return;
    }

    const payload = {
      TenNCC: supFormData.tenNCC.trim(),
      SDT: supFormData.sDT ? supFormData.sDT.trim() : null,
      DiaChi: supFormData.diaChi ? supFormData.diaChi.trim() : null
    };

    setIsLoading(true);
    try {
      if (selectedSupplier?.isNew) {
        const res = await apiAddNhaCungCap(payload);
        showSuccess(res.message || "Thêm mới nhà cung cấp thành công!");
        setSelectedSupplier(null);
      } else {
        const res = await apiUpdateNhaCungCap(selectedSupplier.maNCC, payload);
        showSuccess(res.message || "Cập nhật nhà cung cấp thành công!");
        setSelectedSupplier(null);
      }
      await loadAllSuppliers();
      await loadSuppliersData();
    } catch (err) {
      console.error('Lỗi lưu nhà cung cấp:', err);
      showError(err.message || 'Lưu thông tin thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  // Xóa lô thuốc
  const handleDeleteLot = async (maLo) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa lô thuốc: ${maLo} khỏi dữ liệu nhập kho?`)) {
      setIsLoading(true);
      try {
        await apiDeleteLoThuoc(maLo);
        showSuccess("Xóa lô thuốc thành công!");
        if (selectedLot && selectedLot.maLo === maLo) {
          setSelectedLot(null);
        }
        await loadLotsData();
      } catch (err) {
        console.error('Lỗi khi xóa lô thuốc:', err);
        showError(err.message || "Không thể xóa lô thuốc này!");
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Xóa Nhà cung cấp
  const handleDeleteSupplier = async (maNCC, tenNCC) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa nhà cung cấp: ${tenNCC}?`)) {
      setIsLoading(true);
      try {
        await apiDeleteNhaCungCap(maNCC);
        showSuccess("Xóa nhà cung cấp thành công!");
        if (selectedSupplier && selectedSupplier.maNCC === maNCC) {
          setSelectedSupplier(null);
        }
        await loadAllSuppliers();
        await loadSuppliersData();
      } catch (err) {
        console.error('Lỗi xóa nhà cung cấp:', err);
        showError(err.message || "Không thể xóa nhà cung cấp này (có thể do đang có lô thuốc liên kết)!");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="kb-wrapper h-screen overflow-hidden flex flex-col bg-[var(--bg-main)]">
      {/* Topbar điều hướng */}
      <div className="kb-topbar h-[50px] px-5 flex items-center justify-between shrink-0">
        <div className="flex-1 flex justify-start items-center">
          <button className="kb-back-btn py-[5px] px-[10px]" onClick={() => navigate('/staff')}>
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

      {/* Tab chuyển đổi thiết kế hiện đại */}
      <div className="flex items-center justify-between border-b border-[var(--border-color)] bg-white px-6 py-2.5 shrink-0">
        <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
          <button 
            className={`py-1.5 px-5 text-[12.5px] font-bold rounded-lg transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'lots' 
                ? 'bg-white text-[var(--primary-hover)] shadow-sm' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
            onClick={() => setActiveTab('lots')}
          >
            <Database size={15} />
            Lô thuốc nhập kho
          </button>
          <button 
            className={`py-1.5 px-5 text-[12.5px] font-bold rounded-lg transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'suppliers' 
                ? 'bg-white text-[var(--primary-hover)] shadow-sm' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
            onClick={() => {
              setActiveTab('suppliers');
              setSelectedSupplier(null);
            }}
          >
            <Users size={15} />
            Nhà cung cấp dược phẩm
          </button>
        </div>
      </div>

      {/* Vùng làm việc chính thay đổi theo Tab */}
      <div className="flex-1 flex overflow-hidden">
        
        {activeTab === 'lots' ? (
          // ==========================================
          // GIAO DIỆN TAB 1: LÔ THUỐC
          // ==========================================
          <>
            {/* Cột trái: Bảng danh sách lô thuốc */}
            <div className="flex-[1.3] flex flex-col border-r border-[var(--border-color)] h-full bg-white">
              <div className="flex justify-between items-center py-3 px-4 border-b border-[var(--border-color)] bg-[var(--bg-main)]">
                <div className="flex items-center gap-1.5">
                  <Database size={16} className="text-[var(--primary)]" />
                  <h3 className="text-[14px] font-[750] text-[var(--text-main)]">Danh sách Lô thuốc nhập kho</h3>
                </div>
                {isManager && (
                  <button onClick={handleAddNew} className="btn-primary h-8 text-[12.5px] px-3 flex items-center gap-1 !w-auto !mt-0 shrink-0">
                    <Plus size={14} /> Nhập kho lô mới
                  </button>
                )}
              </div>

              {/* Bảng lô thuốc */}
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
                      {isManager && <th className="w-[60px] p-2 text-center">Xóa</th>}
                    </tr>
                    <tr className="bg-[var(--bg-main)] border-b border-[var(--border-color)]">
                      <td></td>
                      <td className="p-1">
                        <input 
                          type="text" placeholder="Mã..." className="form-input h-[26px] text-[12px] py-[2px] !px-2 !pl-2"
                          value={filters.maLo} onChange={e => handleFilterChange('maLo', e.target.value)}
                        />
                      </td>
                      <td className="p-1">
                        <input 
                          type="text" placeholder="Tên thuốc..." className="form-input h-[26px] text-[12px] py-[2px] !px-2 !pl-2"
                          value={filters.tenThuoc} onChange={e => handleFilterChange('tenThuoc', e.target.value)}
                        />
                      </td>
                      <td className="p-1">
                        <input 
                          type="text" placeholder="Tên NCC..." className="form-input h-[26px] text-[12px] py-[2px] !px-2 !pl-2"
                          value={filters.tenNCC} onChange={e => handleFilterChange('tenNCC', e.target.value)}
                        />
                      </td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td className="p-1">
                        <select className="form-input h-[26px] text-[12px] py-0 !px-2 !pl-2" value={filters.expiryStatus} onChange={e => handleFilterChange('expiryStatus', e.target.value)}>
                          <option value="All">Tất cả HSD</option>
                          <option value="Safe">An toàn</option>
                          <option value="Expiring">Hạn ngắn (&lt;6 th)</option>
                          <option value="Expired">Đã hết hạn</option>
                        </select>
                      </td>
                      {isManager && <td></td>}
                    </tr>
                  </thead>
                  <tbody>
                    {displayedLots.map((item, idx) => {
                      const isSelected = selectedLot && selectedLot.maLo === item.maLo;
                      const drug = drugs.find(d => d.maThuoc === item.maThuoc) || {};
                      const sup = allSuppliers.find(s => String(s.maNCC) === String(item.maNCC) || String(s.maNCC) === String(item.maNCC).replace(/^NCC/i, '').replace(/^0+/, '')) || {};
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
                          {isManager && (
                            <td className="py-2.5 px-2 text-center">
                              <button 
                                className="kb-icon-btn kb-icon-btn--danger mx-auto"
                                onClick={(e) => { e.stopPropagation(); handleDeleteLot(item.maLo); }}
                                title="Xóa lô thuốc"
                              >
                                <Trash2 size={13} />
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                    {filteredLots.length === 0 && (
                      <tr>
                        <td colSpan={isManager ? 9 : 8} className="text-center p-10 text-[var(--text-muted)]">Không tìm thấy lô thuốc trùng khớp với bộ lọc tìm kiếm</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Phân trang Lô thuốc */}
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
                  {getLotPaginationItems().map((p, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => typeof p === 'number' && setCurrentPage(p)} 
                      disabled={p === '...'}
                      className={`h-6 w-6 rounded border flex items-center justify-center text-[11px] font-bold transition-all ${
                        p === '...' 
                          ? 'border-transparent text-[var(--text-muted)] bg-transparent cursor-default'
                          : p === activePage
                            ? "bg-[#0ea5e9] text-white border-[#0ea5e9] cursor-pointer"
                            : "bg-transparent text-[#0ea5e9] border-[#0ea5e9] hover:bg-[#e0f2fe] cursor-pointer"
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

            {/* Cột phải: Form chi tiết Lô thuốc */}
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
                      
                      <div className="grid grid-cols-[1fr_1.2fr] gap-3">
                        <div className="form-group m-0">
                          <label className="form-label text-[12.5px]">Mã lô thuốc <span className="text-red-500">*</span></label>
                          <input 
                            type="text" className="form-input h-9 text-[13px] uppercase !pl-3" placeholder="VD: L26001" value={formData.maLo}
                            onChange={e => handleInputChange('maLo', e.target.value)} required disabled={!selectedLot.isNew || !isManager}
                          />
                        </div>
                        
                        <div className="form-group m-0">
                          <label className="form-label text-[12.5px]">Chọn Thuốc <span className="text-red-500">*</span></label>
                          <select 
                            className="w-full h-9 text-[13px] px-3 border border-[var(--border-color)] rounded-[var(--radius-md)] bg-white text-[var(--text-main)] outline-none focus:border-[var(--primary)] transition-all cursor-pointer" 
                            value={formData.maThuoc} onChange={e => handleInputChange('maThuoc', e.target.value)} required disabled={!isManager}
                          >
                            <option value="">-- Chọn thuốc y tế --</option>
                            {drugs.map(d => (
                              <option key={d.maThuoc} value={d.maThuoc}>{d.tenThuoc} ({d.donViTinh})</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="form-group m-0">
                        <label className="form-label text-[12.5px]">Nhà cung cấp <span className="text-red-500">*</span></label>
                        <select 
                          className="w-full h-9 text-[13px] px-3 border border-[var(--border-color)] rounded-[var(--radius-md)] bg-white text-[var(--text-main)] outline-none focus:border-[var(--primary)] transition-all cursor-pointer" 
                          value={formData.maNCC} onChange={e => handleInputChange('maNCC', e.target.value)} required disabled={!isManager}
                        >
                          <option value="">-- Chọn nhà cung cấp sản phẩm --</option>
                          {allSuppliers.map(s => (
                            <option key={s.maNCC} value={s.maNCC}>{s.tenNCC}</option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="form-group m-0">
                          <label className="form-label text-[12.5px]">Số lượng nhập <span className="text-red-500">*</span></label>
                          <input 
                            type="number" min="0" className="form-input h-9 text-[13px] !pl-3" placeholder="Số lượng" value={formData.soLuongNhap}
                            onChange={e => handleInputChange('soLuongNhap', e.target.value)} required disabled={!isManager}
                          />
                        </div>
                        
                        <div className="form-group m-0">
                          <label className="form-label text-[12.5px]">Số lượng tồn kho <span className="text-red-500">*</span></label>
                          <input 
                            type="number" min="0" className="form-input h-9 text-[13px] !pl-3" placeholder="Số lượng tồn" value={formData.soLuongTon}
                            onChange={e => handleInputChange('soLuongTon', e.target.value)} required disabled={!isManager}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="form-group m-0">
                          <label className="form-label text-[12.5px]">Giá nhập đơn vị (đ) <span className="text-red-500">*</span></label>
                          <input 
                            type="number" min="0" className="form-input h-9 text-[13px] !pl-3" placeholder="Giá nhập" value={formData.giaNhap}
                            onChange={e => handleInputChange('giaNhap', e.target.value)} required disabled={!isManager}
                          />
                        </div>
                        
                        <div className="form-group m-0">
                          <label className="form-label text-[12.5px]">Giá bán niêm yết (đ) <span className="text-red-500">*</span></label>
                          <input 
                            type="number" min="0" className="form-input h-9 text-[13px] !pl-3" placeholder="Giá bán" value={formData.giaBan}
                            onChange={e => handleInputChange('giaBan', e.target.value)} required disabled={!isManager}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="form-group m-0">
                          <label className="form-label text-[12.5px]">Ngày sản xuất</label>
                          <input 
                            type="date" className="form-input h-9 text-[13px] !pl-3" value={formData.ngaySanXuat}
                            onChange={e => handleInputChange('ngaySanXuat', e.target.value)} disabled={!isManager}
                          />
                        </div>
                        
                        <div className="form-group m-0">
                          <label className="form-label text-[12.5px]">Hạn sử dụng <span className="text-red-500">*</span></label>
                          <input 
                            type="date" className="form-input h-9 text-[13px] !pl-3" value={formData.hanSuDung}
                            onChange={e => handleInputChange('hanSuDung', e.target.value)} required disabled={!isManager}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2.5 border-t border-[var(--border-color)] pt-4 mt-5">
                      <button type="button" className="btn-outline w-[100px] h-9 flex items-center justify-center p-0 m-0" onClick={() => setSelectedLot(null)}>
                        {isManager ? "Hủy" : "Đóng"}
                      </button>
                      {isManager && (
                        <button type="submit" className="btn-primary w-[120px] h-9 flex items-center justify-center gap-1.5 p-0 m-0"><Save size={16} /> Lưu</button>
                      )}
                    </div>
                  </form>
                )}
              </div>
            </div>
          </>
        ) : (
          // ==========================================
          // GIAO DIỆN TAB 2: NHÀ CUNG CẤP (API)
          // ==========================================
          <>
            {/* Cột trái: Bảng danh sách nhà cung cấp */}
            <div className="flex-[1.3] flex flex-col border-r border-[var(--border-color)] h-full bg-white">
              <div className="flex justify-between items-center py-3 px-4 border-b border-[var(--border-color)] bg-[var(--bg-main)]">
                <div className="flex items-center gap-1.5">
                  <Users size={16} className="text-[#0ea5e9]" />
                  <h3 className="text-[14px] font-[750] text-[var(--text-main)]">Danh sách Nhà cung cấp</h3>
                </div>
                {isManager && (
                  <button onClick={handleAddNewSupplier} className="btn-primary h-8 text-[12.5px] px-3 flex items-center gap-1 !w-auto !mt-0 shrink-0 bg-[#0ea5e9] hover:bg-[#0284c7]">
                    <Plus size={14} /> Thêm nhà cung cấp
                  </button>
                )}
              </div>

              {/* Bảng nhà cung cấp */}
              <div className="flex-1 overflow-y-auto">
                <table className="kb-table w-full border-collapse text-[13px]">
                  <thead>
                    <tr className="sticky top-0 z-10 bg-[var(--bg-main)] border-b-2 border-[var(--border-color)]">
                      <th className="w-[50px] text-center p-2">STT</th>
                      <th className="w-[100px] p-2">Mã NCC</th>
                      <th className="p-2">Tên nhà cung cấp</th>
                      <th className="w-[160px] p-2">Số điện thoại</th>
                      <th className="p-2">Địa chỉ trụ sở</th>
                      {isManager && <th className="w-[60px] p-2 text-center">Xóa</th>}
                    </tr>
                    <tr className="bg-[var(--bg-main)] border-b border-[var(--border-color)]">
                      <td></td>
                      <td></td>
                      <td className="p-1">
                        <input 
                          type="text" placeholder="Lọc theo tên..." className="form-input h-[26px] text-[12px] py-[2px] !px-2 !pl-2"
                          value={supFilters.tenNCC} onChange={e => handleSupFilterChange('tenNCC', e.target.value)}
                        />
                      </td>
                      <td></td>
                      <td></td>
                      {isManager && <td></td>}
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={isManager ? 6 : 5} className="text-center p-10 text-[var(--text-muted)]">Đang tải danh sách nhà cung cấp...</td>
                      </tr>
                    ) : suppliers.length === 0 ? (
                      <tr>
                        <td colSpan={isManager ? 6 : 5} className="text-center p-10 text-[var(--text-muted)]">Không tìm thấy nhà cung cấp nào</td>
                      </tr>
                    ) : (
                      suppliers.map((sup, idx) => {
                        const isSelected = selectedSupplier && selectedSupplier.maNCC === sup.maNCC;
                        return (
                          <tr 
                            key={sup.maNCC} 
                            className={`kb-table-row cursor-pointer transition-colors duration-150 ${isSelected ? 'bg-[var(--primary-light)]' : 'bg-transparent'}`}
                            onClick={() => setSelectedSupplier(sup)}
                          >
                            <td className="text-center py-2.5 px-2 text-[var(--text-muted)]">{supStartIndex + idx + 1}</td>
                            <td className={`font-semibold py-2.5 px-2 ${isSelected ? 'text-[var(--primary-hover)]' : 'text-[var(--text-main)]'}`}>{sup.maNCC}</td>
                            <td className="font-[650] py-2.5 px-2">{sup.tenNCC}</td>
                            <td className="py-2.5 px-2 font-medium">{sup.sDT || sup.sdt || '—'}</td>
                            <td className="py-2.5 px-2 text-[12px] text-gray-600">{sup.diaChi || '—'}</td>
                            {isManager && (
                              <td className="py-2.5 px-2 text-center">
                                <button 
                                  className="kb-icon-btn kb-icon-btn--danger mx-auto"
                                  onClick={(e) => { e.stopPropagation(); handleDeleteSupplier(sup.maNCC, sup.tenNCC); }}
                                  title="Xóa nhà cung cấp"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </td>
                            )}
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Phân trang Nhà cung cấp */}
              <div className="border-t border-[var(--border-color)] py-2 px-4 flex justify-between items-center text-[12.5px] text-[var(--text-muted)] bg-[var(--bg-main)]">
                <div className="flex gap-1 items-center">
                  <button 
                    disabled={activeSupPage === 1} 
                    onClick={() => setSupPage(activeSupPage - 1)} 
                    className={`h-6 w-6 rounded border border-[#0ea5e9] flex items-center justify-center text-[11px] font-bold transition-all ${
                      activeSupPage === 1 
                        ? 'opacity-40 cursor-not-allowed text-[#0ea5e9] bg-transparent' 
                        : 'text-[#0ea5e9] bg-transparent hover:bg-[#e0f2fe] cursor-pointer'
                    }`}
                  >
                    &lt;
                  </button>
                  {getSupPaginationItems().map((p, index) => {
                    if (p === '...') {
                      return <span key={`dots-${index}`} className="px-1 text-[var(--text-muted)] select-none">...</span>;
                    }
                    return (
                      <button 
                        key={p} 
                        onClick={() => setSupPage(p)} 
                        className={`h-6 w-6 rounded border flex items-center justify-center text-[11px] font-bold transition-all cursor-pointer ${
                          p === activeSupPage
                            ? "bg-[#0ea5e9] text-white border-[#0ea5e9]"
                            : "bg-transparent text-[#0ea5e9] border-[#0ea5e9] hover:bg-[#e0f2fe]"
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                  <button 
                    disabled={activeSupPage === totalSupPages} 
                    onClick={() => setSupPage(activeSupPage + 1)} 
                    className={`h-6 w-6 rounded border border-[#0ea5e9] flex items-center justify-center text-[11px] font-bold transition-all ${
                      activeSupPage === totalSupPages 
                        ? 'opacity-40 cursor-not-allowed text-[#0ea5e9] bg-transparent' 
                        : 'text-[#0ea5e9] bg-transparent hover:bg-[#e0f2fe] cursor-pointer'
                    }`}
                  >
                    &gt;
                  </button>
                </div>
                <span>Hiển thị {totalSuppliers === 0 ? 0 : supStartIndex + 1} - {Math.min(supEndIndex, totalSuppliers)} trên tổng {totalSuppliers} nhà cung cấp</span>
              </div>
            </div>

            {/* Cột phải: Form chi tiết Nhà cung cấp */}
            <div className="flex-[0.7] flex flex-col h-full bg-white">
              <div className="flex bg-[#0ea5e9] py-3 px-[18px] h-[42px] items-center text-white text-[13px] font-bold gap-2">
                <Users size={16} />
                <span>CHI TIẾT THÔNG TIN NHÀ CUNG CẤP</span>
              </div>

              <div className="flex-1 overflow-y-auto p-5 bg-white">
                {selectedSupplier === null ? (
                  <div className="h-full flex flex-col items-center justify-center text-[var(--text-muted)] text-center gap-3">
                    <Users size={48} className="opacity-25 text-[#0ea5e9]" />
                    <div>
                      <h4 className="font-semibold text-[var(--text-main)]">Chưa chọn nhà cung cấp</h4>
                      <p className="text-[13px] mt-1">Chọn một nhà cung cấp bên trái hoặc bấm "Thêm nhà cung cấp" để khai báo thông tin mới.</p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSaveSupplier} className="h-full flex flex-col justify-between">
                    <div className="flex flex-col gap-3.5">
                      
                      <div className="form-group m-0">
                        <label className="form-label text-[12.5px]">Mã nhà cung cấp</label>
                        <input 
                          type="text" className="form-input h-9 text-[13px] uppercase !pl-3" placeholder="Tự sinh tự động" value={supFormData.maNCC}
                          disabled required
                        />
                      </div>

                      <div className="form-group m-0">
                        <label className="form-label text-[12.5px]">Tên nhà cung cấp <span className="text-red-500">*</span></label>
                        <input 
                          type="text" className="form-input h-9 text-[13px] !pl-3" placeholder="Nhập tên công ty/đại lý cung ứng..." value={supFormData.tenNCC}
                          onChange={e => handleSupInputChange('tenNCC', e.target.value)} required disabled={!isManager}
                        />
                      </div>

                      <div className="form-group m-0">
                        <label className="form-label text-[12.5px]">Số điện thoại liên lạc</label>
                        <input 
                          type="text" className="form-input h-9 text-[13px] !pl-3" placeholder="Nhập số điện thoại..." value={supFormData.sDT}
                          onChange={e => handleSupInputChange('sDT', e.target.value)} disabled={!isManager}
                        />
                      </div>

                      <div className="form-group m-0">
                        <label className="form-label text-[12.5px]">Địa chỉ trụ sở</label>
                        <input 
                          type="text" className="form-input h-9 text-[13px] !pl-3" placeholder="Nhập địa chỉ trụ sở..." value={supFormData.diaChi}
                          onChange={e => handleSupInputChange('diaChi', e.target.value)} disabled={!isManager}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2.5 border-t border-[var(--border-color)] pt-4 mt-5">
                      <button type="button" className="btn-outline w-[100px] h-9 flex items-center justify-center p-0 m-0" onClick={() => setSelectedSupplier(null)}>
                        {isManager ? "Hủy" : "Đóng"}
                      </button>
                      {isManager && (
                        <button type="submit" className="btn-primary w-[120px] h-9 flex items-center justify-center gap-1.5 p-0 m-0 bg-[#0ea5e9] hover:bg-[#0284c7]"><Save size={16} /> Lưu</button>
                      )}
                    </div>
                  </form>
                )}
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}

export default KhoNhapKho;
