import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Plus, Trash2, Save, Database, Pill
} from 'lucide-react';
import { useToast } from '../utils/ToastContext';
import {
  apiGetThuocList,
  apiAddThuoc,
  apiUpdateThuoc,
  apiDeleteThuoc
} from '../utils/api';

// Dữ liệu mẫu danh mục thuốc ban đầu
const DEFAULT_DRUGS = [
  { maThuoc: 'TH001', tenThuoc: 'Paracetamol 500mg', hoatChat: 'Paracetamol', donViTinh: 'Viên' },
  { maThuoc: 'TH002', tenThuoc: 'Amoxicillin 500mg', hoatChat: 'Amoxicillin trihydrate', donViTinh: 'Viên' },
  { maThuoc: 'TH003', tenThuoc: 'Panadol Extra', hoatChat: 'Paracetamol + Caffeine', donViTinh: 'Viên' },
  { maThuoc: 'TH004', tenThuoc: 'Decolgen Forte', hoatChat: 'Paracetamol + Chlorpheniramine', donViTinh: 'Viên' },
  { maThuoc: 'TH005', tenThuoc: 'Gaviscon Dual Action', hoatChat: 'Sodium alginate + Calcium carbonate', donViTinh: 'Chai' },
  { maThuoc: 'TH006', tenThuoc: 'Augmentin 1g', hoatChat: 'Amoxicillin + Clavulanic acid', donViTinh: 'Hộp' },
];

const DON_VI_OPTIONS = ['Viên', 'Hộp', 'Chai', 'Gói', 'Ống', 'Tuýp'];

/**
 * Component Quản lý Danh mục Thuốc trong phòng khám
 */
function KhoDanhMucThuoc() {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  
  const [allDrugsList, setAllDrugsList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDrug, setSelectedDrug] = useState(null);

  // Vai trò người dùng có quyền quản trị kho thuốc hay không (Admin, QuanLyKhoThuoc)
  const [isManager, setIsManager] = useState(false);

  // State thông tin form điền
  const [formData, setFormData] = useState({
    maThuoc: '',
    tenThuoc: '',
    hoatChat: '',
    donViTinh: 'Viên',
    isActive: true
  });

  // State bộ lọc tìm kiếm
  const [filters, setFilters] = useState({
    maThuoc: '',
    tenThuoc: '',
    hoatChat: '',
    donViTinh: ''
  });

  // State quản lý phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Kiểm tra vai trò của người dùng đăng nhập hiện tại từ LocalStorage
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

  // Lấy danh sách thuốc từ Backend API (Tải 1 lần về client)
  const loadDrugs = async () => {
    setIsLoading(true);
    try {
      const res = await apiGetThuocList('', '', '', '', 1, 1000);
      if (res && res.data) {
        const mappedData = res.data.map(item => ({
          maThuoc: item.maThuoc || item.MaThuoc || '',
          tenThuoc: item.tenThuoc || item.TenThuoc || '',
          hoatChat: item.hoatChat || item.HoatChat || '',
          donViTinh: item.donViTinh || item.DonViTinh || 'Viên',
          isActive: item.isActive !== false && item.IsActive !== false
        }));
        setAllDrugsList(mappedData);
      } else {
        setAllDrugsList([]);
      }
    } catch (err) {
      console.error('Lỗi tải danh mục thuốc từ máy chủ:', err);
      showError('Không thể tải danh mục thuốc từ máy chủ: ' + (err.message || err));
      if (err.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        navigate('/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Tải danh sách khi component mount
  useEffect(() => {
    loadDrugs();
  }, []);

  // Reset trang về 1 khi đổi bộ lọc hoặc đổi kích thước trang
  useEffect(() => {
    setCurrentPage(1);
  }, [filters.maThuoc, filters.tenThuoc, filters.hoatChat, filters.donViTinh, pageSize]);

  // Điền thông tin vào form mỗi khi chọn một loại thuốc khác
  useEffect(() => {
    if (selectedDrug) {
      setFormData({
        maThuoc: selectedDrug.maThuoc || '',
        tenThuoc: selectedDrug.tenThuoc || '',
        hoatChat: selectedDrug.hoatChat || '',
        donViTinh: selectedDrug.donViTinh || 'Viên',
        isActive: selectedDrug.isActive !== false
      });
    } else {
      setFormData({
        maThuoc: '',
        tenThuoc: '',
        hoatChat: '',
        donViTinh: 'Viên',
        isActive: true
      });
    }
  }, [selectedDrug]);

  // Lọc danh sách thuốc trên client theo các tiêu chí (mã, tên, hoạt chất, đơn vị tính)
  const filteredDrugs = allDrugsList.filter(item => 
    (item.maThuoc || '').toLowerCase().includes((filters.maThuoc || '').toLowerCase().trim()) &&
    (item.tenThuoc || '').toLowerCase().includes((filters.tenThuoc || '').toLowerCase().trim()) &&
    (item.hoatChat || '').toLowerCase().includes((filters.hoatChat || '').toLowerCase().trim()) &&
    (filters.donViTinh === '' || (item.donViTinh || '').toLowerCase() === filters.donViTinh.toLowerCase())
  );

  const totalCount = filteredDrugs.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const activePage = Math.min(currentPage, totalPages);
  const startIndex = (activePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalCount);
  const displayedDrugs = filteredDrugs.slice(startIndex, startIndex + pageSize);

  // Tính toán danh sách các trang hiển thị (collapsed pagination với dấu ba chấm)
  const getPaginationItems = () => {
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

  // Xử lý khi thay đổi input trên form nhập
  const handleInputChange = (key, val) => {
    setFormData({ ...formData, [key]: val });
  };

  // Xử lý khi thay đổi bộ lọc tìm kiếm thuốc
  const handleFilterChange = (key, val) => {
    setFilters({ ...filters, [key]: val });
  };

  // Khởi tạo thêm mới thuốc với mã tự sinh tăng dần dạng THxxx dựa trên toàn bộ thuốc hiện tại
  const handleAddNew = () => {
    const drugNumbers = allDrugsList
      .map(d => d.maThuoc)
      .filter(id => /^TH\d+$/i.test(id))
      .map(id => parseInt(id.replace(/^TH/i, ''), 10));
    const nextNum = drugNumbers.length > 0 ? Math.max(...drugNumbers) + 1 : 1;
    const newCode = `TH${String(nextNum).padStart(3, '0')}`;

    setSelectedDrug({
      maThuoc: newCode,
      tenThuoc: '',
      hoatChat: '',
      donViTinh: 'Viên',
      isActive: true,
      isNew: true
    });
  };

  // Lưu thông tin thuốc (Thêm mới hoặc Cập nhật) gọi qua API Backend
  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (!formData.tenThuoc.trim()) {
      showError("Vui lòng nhập tên thuốc!");
      return;
    }
    if (!formData.maThuoc.trim()) {
      showError("Mã thuốc không được để trống!");
      return;
    }

    const payload = {
      maThuoc: formData.maThuoc.trim().toUpperCase(),
      tenThuoc: formData.tenThuoc.trim(),
      hoatChat: formData.hoatChat ? formData.hoatChat.trim() : null,
      donViTinh: formData.donViTinh
    };

    setIsLoading(true);
    try {
      if (selectedDrug?.isNew) {
        // Gọi API thêm mới
        const res = await apiAddThuoc(payload);
        showSuccess(res.message || "Thêm mới danh mục thuốc thành công!");
        setSelectedDrug(null);
      } else {
        // Gọi API cập nhật thông tin chung bao gồm cả trạng thái isActive
        const updatePayload = {
          tenThuoc: payload.tenThuoc,
          hoatChat: payload.hoatChat,
          donViTinh: payload.donViTinh,
          isActive: formData.isActive
        };
        const res = await apiUpdateThuoc(payload.maThuoc, updatePayload);

        // Nếu chuyển đổi trạng thái từ Active sang Inactive (ngừng sử dụng)
        if (selectedDrug.isActive !== false && formData.isActive === false) {
          try {
            await apiDeleteThuoc(payload.maThuoc);
          } catch (delErr) {}
        }

        showSuccess(res.message || "Cập nhật thông tin danh mục thuốc thành công!");
        setSelectedDrug(null);
      }
      loadDrugs(); // Nạp lại danh sách
    } catch (error) {
      console.error('Lỗi lưu thông tin thuốc:', error);
      showError('Lưu thông tin thất bại: ' + (error.message || error));
    } finally {
      setIsLoading(false);
    }
  };

  // Vô hiệu hóa hoạt động của thuốc (Soft Delete)
  const handleDeleteDrug = async (maThuoc, tenThuoc) => {
    if (window.confirm(`Bạn có chắc chắn muốn ngừng hoạt động của thuốc: ${tenThuoc} (Mã: ${maThuoc})?`)) {
      setIsLoading(true);
      try {
        const res = await apiDeleteThuoc(maThuoc);
        showSuccess(res.message || "Đã ngừng hoạt động danh mục thuốc thành công!");
        if (selectedDrug && selectedDrug.maThuoc === maThuoc) {
          setSelectedDrug(null);
        }
        loadDrugs();
      } catch (error) {
        console.error('Lỗi ngừng hoạt động thuốc:', error);
        showError('Không thể thực hiện: ' + (error.message || error));
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="kb-wrapper h-screen overflow-hidden">
      {/* Topbar điều hướng */}
      <div className="kb-topbar h-[50px] px-5">
        <div className="flex-1 flex justify-start">
          <button className="kb-back-btn py-[5px] px-[10px]" onClick={() => navigate('/staff')}>
            <ArrowLeft size={16} /> Quay về trang chủ
          </button>
        </div>
        <div className="kb-topbar-title flex-1 flex justify-center text-[15px]">
          <Pill size={18} className="mr-1.5" />
          <strong>Quản lý danh mục thuốc</strong>
        </div>
        <div className="flex-1 flex justify-end text-[12px] opacity-85">
          <span>Trang chủ / Kho dược / Danh mục thuốc</span>
        </div>
      </div>

      {/* Vùng làm việc chính */}
      <div className="kb-body flex h-[calc(100vh-50px)] bg-[var(--bg-main)] overflow-hidden">
        
        {/* CỘT TRÁI: Bảng danh sách */}
        <div className="flex-[1.2] flex flex-col border-r border-[var(--border-color)] h-full bg-white">
          {/* Tiêu đề & nút Thêm mới */}
          <div className="flex justify-between items-center p-3 px-4 border-b border-[var(--border-color)] bg-[var(--bg-main)]">
            <div className="flex items-center gap-1.5 shrink-0">
              <Pill size={16} className="text-[var(--primary)] shrink-0" />
              <h3 className="text-[14.5px] font-[750] text-[var(--text-main)] whitespace-nowrap">
                Danh mục dược phẩm hiện tại
              </h3>
            </div>
            {isManager && (
              <button 
                onClick={handleAddNew}
                className="btn-primary h-8 text-[12.5px] px-3 flex items-center gap-1 !w-auto !mt-0 shrink-0"
              >
                <Plus size={14} /> Thêm thuốc mới
              </button>
            )}
          </div>

          {/* Bảng dữ liệu thuốc */}
          <div className="flex-1 overflow-y-auto">
            <table className="kb-table w-full border-collapse text-[13px]">
              <thead>
                <tr className="sticky top-0 z-10 bg-[var(--bg-main)] border-b-2 border-[var(--border-color)]">
                  <th className="w-[50px] text-center p-2">STT</th>
                  <th className="w-[100px] p-2">Mã thuốc</th>
                  <th className="w-[220px] p-2">Tên thuốc</th>
                  <th className="p-2">Hoạt chất chính</th>
                  <th className="w-[100px] p-2">Đơn vị tính</th>
                  {isManager && <th className="w-[155px] p-2 text-center">Trạng thái</th>}
                  {isManager && <th className="w-[60px] p-2 text-center">Xóa</th>}
                </tr>
                {/* Lọc tìm kiếm */}
                <tr className="bg-[var(--bg-main)] border-b border-[var(--border-color)]">
                  <td></td>
                  <td className="p-1">
                    <input 
                      type="text" 
                      placeholder="Lọc mã..." 
                      className="form-input h-[28px] text-[12px] py-0.5 px-2 text-left" 
                      value={filters.maThuoc}
                      onChange={e => handleFilterChange('maThuoc', e.target.value)}
                    />
                  </td>
                  <td className="p-1">
                    <input 
                      type="text" 
                      placeholder="Lọc tên thuốc..." 
                      className="form-input h-[28px] text-[12px] py-0.5 px-2 text-left" 
                      value={filters.tenThuoc}
                      onChange={e => handleFilterChange('tenThuoc', e.target.value)}
                    />
                  </td>
                  <td className="p-1">
                    <input 
                      type="text" 
                      placeholder="Lọc hoạt chất..." 
                      className="form-input h-[28px] text-[12px] py-0.5 px-2 text-left" 
                      value={filters.hoatChat}
                      onChange={e => handleFilterChange('hoatChat', e.target.value)}
                    />
                  </td>
                  <td className="p-1">
                    <select 
                      className="form-input h-[28px] text-[12px] px-2 text-left" 
                      value={filters.donViTinh}
                      onChange={e => handleFilterChange('donViTinh', e.target.value)}
                    >
                      <option value="">Tất cả ĐVT</option>
                      {DON_VI_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </td>
                  {isManager && <td></td>}
                  {isManager && <td></td>}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={isManager ? 7 : 5} className="text-center p-10 text-[var(--text-muted)]">
                      Đang tải danh mục thuốc...
                    </td>
                  </tr>
                ) : displayedDrugs.length === 0 ? (
                  <tr>
                    <td colSpan={isManager ? 7 : 5} className="text-center p-10 text-[var(--text-muted)]">
                      Không tìm thấy thuốc trùng khớp với bộ lọc tìm kiếm
                    </td>
                  </tr>
                ) : (
                  displayedDrugs.map((drug, idx) => {
                    const isSelected = selectedDrug && selectedDrug.maThuoc === drug.maThuoc;
                    return (
                      <tr 
                        key={drug.maThuoc}
                        className={`kb-table-row cursor-pointer transition-colors duration-150 ${isSelected ? 'bg-[var(--primary-light)]' : 'bg-transparent'} ${drug.isActive === false ? 'opacity-65' : ''}`}
                        onClick={() => setSelectedDrug(drug)}
                      >
                        <td className="text-center py-2.5 px-2 text-[var(--text-muted)]">
                          {startIndex + idx + 1}
                        </td>
                        <td className={`font-semibold py-2.5 px-2 ${isSelected ? 'text-[var(--primary-hover)]' : 'text-[var(--text-main)]'}`}>
                          {drug.maThuoc}
                        </td>
                        <td className="font-[650] py-2.5 px-2">{drug.tenThuoc}</td>
                        <td className={`py-2.5 px-2 ${drug.hoatChat ? 'not-italic text-[var(--text-main)]' : 'italic text-[var(--text-muted)]'}`}>
                          {drug.hoatChat || '—'}
                        </td>
                        <td className="py-2.5 px-2 font-medium">{drug.donViTinh}</td>
                        {isManager && (
                          <td className="py-2.5 px-2 text-center font-medium">
                            {drug.isActive !== false ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-green-100 text-green-700 whitespace-nowrap">
                                Đang được sử dụng
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-500 whitespace-nowrap">
                                Ngừng sử dụng
                              </span>
                            )}
                          </td>
                        )}
                        {isManager && (
                          <td className="py-2.5 px-2 text-center">
                            <button 
                              className={`kb-icon-btn kb-icon-btn--danger mx-auto ${drug.isActive === false ? 'opacity-30 cursor-not-allowed' : ''}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (drug.isActive !== false) {
                                  handleDeleteDrug(drug.maThuoc, drug.tenThuoc);
                                }
                              }}
                              disabled={drug.isActive === false}
                              title={drug.isActive === false ? "Thuốc đã ngừng sử dụng" : "Ngừng sử dụng thuốc"}
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

          {/* Phân trang dưới bảng */}
          <div className="border-t border-[var(--border-color)] py-2 px-4 flex justify-between items-center text-[12.5px] text-[var(--text-muted)] bg-[var(--bg-main)]">
            <div className="flex gap-3 items-center">
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
                {getPaginationItems().map((p, index) => {
                  if (p === '...') {
                    return (
                      <span key={`dots-${index}`} className="px-1 text-[var(--text-muted)] select-none">
                        ...
                      </span>
                    );
                  }
                  return (
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
                  );
                })}
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

              <div className="flex items-center gap-1.5 border-l border-[var(--border-color)] pl-3">
                <span className="whitespace-nowrap">Số dòng:</span>
                <select 
                  value={pageSize} 
                  onChange={e => setPageSize(Number(e.target.value))}
                  className="h-7 text-[12px] px-2 py-0 border border-gray-300 rounded bg-white text-gray-700 outline-none w-[65px] font-medium cursor-pointer"
                >
                  <option value={10}>10</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>
            <span>Hiển thị {totalCount === 0 ? 0 : startIndex + 1} - {Math.min(endIndex, totalCount)} trên tổng {totalCount} thuốc</span>
          </div>
        </div>

        {/* CỘT PHẢI: Form chi tiết */}
        <div className="flex-[0.8] flex flex-col h-full bg-white">
          <div className="flex bg-[#0284c7] py-3 px-[18px] h-[42px] items-center text-white text-[13px] font-bold gap-2">
            <Database size={16} />
            <span>CHI TIẾT DANH MỤC THUỐC Y KHOA</span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 bg-white">
            {selectedDrug === null ? (
              <div className="h-full flex flex-col items-center justify-center text-[var(--text-muted)] text-center gap-3">
                <Pill size={48} className="opacity-25 text-[var(--primary)]" />
                <div>
                  <h4 className="font-semibold text-[var(--text-main)]">Chưa chọn thuốc</h4>
                  <p className="text-[13px] mt-1">Chọn một loại thuốc bên trái hoặc click "Thêm thuốc mới" để nhập thông tin dược phẩm.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSave} className="h-full flex flex-col justify-between">
                <div className="flex flex-col gap-2.5">
                  <div className="border-b border-dashed border-[var(--border-color)] pb-2.5">
                    <h4 className="text-[13px] font-bold text-[var(--primary)] mb-2 flex items-center gap-1.5">
                      <Pill size={14} /> THÔNG TIN DƯỢC PHẨM CHUNG
                    </h4>
                    
                    <div className="flex flex-col gap-2">
                      <div className="form-group m-0">
                        <label className="form-label text-[12.5px]">Mã thuốc <span className="text-red-500">*</span></label>
                        <input 
                          type="text" 
                          className="form-input h-9 text-[13px] uppercase" 
                          placeholder="Mã thuốc (VD: TH001)"
                          value={formData.maThuoc}
                          onChange={e => handleInputChange('maThuoc', e.target.value)}
                          required
                          disabled={!selectedDrug.isNew || !isManager}
                        />
                      </div>

                      <div className="form-group m-0">
                        <label className="form-label text-[12.5px]">Tên thuốc (Biệt dược) <span className="text-red-500">*</span></label>
                        <input 
                          type="text" 
                          className="form-input h-9 text-[13px]" 
                          placeholder="Nhập tên biệt dược..."
                          value={formData.tenThuoc}
                          onChange={e => handleInputChange('tenThuoc', e.target.value)}
                          required
                          disabled={!isManager}
                        />
                      </div>

                      <div className="form-group m-0">
                        <label className="form-label text-[12.5px]">Hoạt chất chính</label>
                        <input 
                          type="text" 
                          className="form-input h-9 text-[13px]" 
                          placeholder="Hoạt chất chính/hàm lượng (VD: Paracetamol 500mg)..."
                          value={formData.hoatChat || ''}
                          onChange={e => handleInputChange('hoatChat', e.target.value)}
                          disabled={!isManager}
                        />
                      </div>

                      <div className="form-group m-0">
                        <label className="form-label text-[12.5px]">Đơn vị tính <span className="text-red-500">*</span></label>
                        <select 
                          className="w-full h-9 text-[13px] px-3 border border-[var(--border-color)] rounded-[var(--radius-md)] bg-white text-[var(--text-main)] outline-none focus:border-[var(--primary)] transition-all cursor-pointer" 
                          value={formData.donViTinh}
                          onChange={e => handleInputChange('donViTinh', e.target.value)}
                          required
                          disabled={!isManager}
                        >
                          {DON_VI_OPTIONS.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group m-0">
                        <label className="form-label text-[12.5px]">Trạng thái <span className="text-red-500">*</span></label>
                        <select 
                          className="w-full h-9 text-[13px] px-3 border border-[var(--border-color)] rounded-[var(--radius-md)] bg-white text-[var(--text-main)] outline-none focus:border-[var(--primary)] transition-all cursor-pointer" 
                          value={formData.isActive ? 'true' : 'false'}
                          onChange={e => handleInputChange('isActive', e.target.value === 'true')}
                          required
                          disabled={!isManager}
                        >
                          <option value="true">Đang được sử dụng</option>
                          <option value="false">Ngừng sử dụng</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Các nút Hủy/Lưu */}
                <div className="flex justify-end gap-2.5 border-t border-[var(--border-color)] pt-2.5 mt-3">
                  <button 
                    type="button" 
                    className="btn-outline w-[100px] h-9 flex items-center justify-center p-0 m-0" 
                    onClick={() => setSelectedDrug(null)}
                  >
                    {isManager ? "Hủy" : "Đóng"}
                  </button>
                  {isManager && (
                    <button 
                      type="submit" 
                      className="btn-primary w-[120px] h-9 flex items-center justify-center gap-1.5 p-0 m-0" 
                    >
                      <Save size={16} /> Lưu
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default KhoDanhMucThuoc;
