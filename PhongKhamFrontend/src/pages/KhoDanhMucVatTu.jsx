import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Plus, Trash2, Save, Database, ClipboardList
} from 'lucide-react';
import { useToast } from '../utils/ToastContext';
import {
  apiGetVatTuList,
  apiAddVatTu,
  apiUpdateVatTu,
  apiDeleteVatTu
} from '../utils/api';

const DON_VI_OPTIONS = ['Cái', 'Hộp', 'Cuộn', 'Gói', 'Chai', 'Thùng', 'Bộ', 'Sợi', 'Khay', 'Bình', 'Bịch', 'Xấp'];

/**
 * Component Quản lý Danh mục Vật tư tiêu hao tại phòng khám (Đã đồng bộ giao diện & Trạng thái với Danh mục Thuốc)
 */
function KhoDanhMucVatTu() {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  
  const [supplies, setSupplies] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedSupply, setSelectedSupply] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [loading, setLoading] = useState(false);

  // State thông tin form điền
  const [formData, setFormData] = useState({
    maVT: '',
    tenVT: '',
    quyCach: '',
    donViTinh: 'Hộp',
    isActive: true
  });

  // State bộ lọc tìm kiếm
  const [filters, setFilters] = useState({
    maVT: '',
    tenVT: '',
    quyCach: '',
    donViTinh: '',
    trangThai: ''
  });

  // State quản lý phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  /**
   * Tải danh sách vật tư y tế từ Backend API theo phân trang và bộ lọc
   */
  const loadVatTuList = async () => {
    setLoading(true);
    try {
      const res = await apiGetVatTuList({
        maVatTu: filters.maVT,
        tenVatTu: filters.tenVT,
        quyCach: filters.quyCach,
        donViTinh: filters.donViTinh,
        page: 1,
        pageSize: 1000
      });

      if (res && res.data) {
        const mapped = res.data.map(item => ({
          maVT: item.maVatTu || item.maVT,
          tenVT: item.tenVatTu || item.tenVT,
          quyCach: item.quyCach || '',
          donViTinh: item.donViTinh || 'Hộp',
          isActive: item.isActive !== false && item.IsActive !== false
        }));
        setSupplies(mapped);
        setTotalItems(mapped.length);
      } else {
        setSupplies([]);
        setTotalItems(0);
      }
    } catch (error) {
      console.error('Lỗi tải danh mục vật tư:', error);
      showError('Không thể nạp danh mục vật tư từ hệ thống: ' + (error.message || 'Lỗi kết nối'));
    } finally {
      setLoading(false);
    }
  };

  // Nạp dữ liệu khi mount
  useEffect(() => {
    loadVatTuList();
  }, []);

  // Reset trang về 1 khi đổi bộ lọc
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // Điền thông tin vào form mỗi khi chọn một loại vật tư khác
  useEffect(() => {
    if (selectedSupply) {
      setFormData({
        maVT: selectedSupply.maVT || '',
        tenVT: selectedSupply.tenVT || '',
        quyCach: selectedSupply.quyCach || '',
        donViTinh: selectedSupply.donViTinh || 'Hộp',
        isActive: selectedSupply.isActive !== false
      });
    } else {
      setFormData({
        maVT: '',
        tenVT: '',
        quyCach: '',
        donViTinh: 'Hộp',
        isActive: true
      });
    }
  }, [selectedSupply]);

  // Lọc danh sách vật tư trên client theo tiêu chí (mã, tên, quy cách, ĐVT, trạng thái)
  const filteredSupplies = supplies.filter(item => {
    const matchMa = (item.maVT || '').toLowerCase().includes((filters.maVT || '').toLowerCase().trim());
    const matchTen = (item.tenVT || '').toLowerCase().includes((filters.tenVT || '').toLowerCase().trim());
    const matchQuyCach = (item.quyCach || '').toLowerCase().includes((filters.quyCach || '').toLowerCase().trim());
    const matchDvt = !filters.donViTinh || (item.donViTinh || '').toLowerCase() === filters.donViTinh.toLowerCase();
    
    let matchStatus = true;
    if (filters.trangThai === 'active') matchStatus = item.isActive !== false;
    if (filters.trangThai === 'inactive') matchStatus = item.isActive === false;

    return matchMa && matchTen && matchQuyCach && matchDvt && matchStatus;
  });

  // Tính toán phân trang
  const totalCount = filteredSupplies.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / itemsPerPage));
  const activePage = Math.min(currentPage, totalPages);
  const startIndex = (activePage - 1) * itemsPerPage;
  const displayedSupplies = filteredSupplies.slice(startIndex, startIndex + itemsPerPage);

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

  // Xử lý khi thay đổi bộ lọc tìm kiếm vật tư
  const handleFilterChange = (key, val) => {
    setFilters({ ...filters, [key]: val });
  };

  // Khởi tạo thêm mới vật tư y tế với mã tự sinh tăng dần (VTxxx)
  const handleAddNew = () => {
    setIsAddingNew(true);
    const supplyNumbers = supplies
      .map(s => s.maVT)
      .filter(id => /^VT\d+$/i.test(id))
      .map(id => parseInt(id.replace(/^VT/i, ''), 10));
    const nextNum = supplyNumbers.length > 0 ? Math.max(...supplyNumbers) + 1 : 1;
    const newCode = `VT${String(nextNum).padStart(3, '0')}`;

    setSelectedSupply({
      maVT: newCode,
      tenVT: '',
      quyCach: '',
      donViTinh: 'Hộp',
      isActive: true,
      isNew: true
    });
  };

  // Lưu thông tin vật tư y tế (Thêm mới POST hoặc Cập nhật PUT qua API)
  const handleSave = async (e) => {
    if (e) e.preventDefault();

    const maVT = formData.maVT.trim().toUpperCase();
    const tenVT = formData.tenVT.trim();
    const quyCach = formData.quyCach.trim();
    const donViTinh = formData.donViTinh.trim();

    // 1. Validate Mã vật tư
    if (!maVT) {
      showError("Vui lòng nhập mã vật tư!");
      return;
    }
    if (maVT.length > 10) {
      showError("Mã vật tư không được vượt quá 10 ký tự!");
      return;
    }
    if (/\s/.test(maVT)) {
      showError("Mã vật tư không được chứa khoảng trắng!");
      return;
    }
    if (!/^[A-Za-z0-9]+$/.test(maVT)) {
      showError("Mã vật tư chỉ được chứa chữ cái và chữ số, không chứa ký tự đặc biệt!");
      return;
    }

    // 2. Validate Tên vật tư
    if (!tenVT) {
      showError("Vui lòng nhập tên vật tư!");
      return;
    }
    if (tenVT.length > 100) {
      showError("Tên vật tư không được vượt quá 100 ký tự!");
      return;
    }

    // 3. Validate Quy cách đóng gói
    if (quyCach && quyCach.length > 100) {
      showError("Quy cách đóng gói của vật tư không được vượt quá 100 ký tự!");
      return;
    }

    // 4. Validate Đơn vị tính
    if (!donViTinh) {
      showError("Vui lòng chọn đơn vị tính!");
      return;
    }

    try {
      if (isAddingNew) {
        const payload = {
          maVatTu: maVT,
          tenVatTu: tenVT,
          quyCach: quyCach || null,
          donViTinh: donViTinh,
          isActive: formData.isActive
        };
        await apiAddVatTu(payload);
        showSuccess("Thêm mới danh mục vật tư thành công!");
      } else {
        const payload = {
          tenVatTu: tenVT,
          quyCach: quyCach || null,
          donViTinh: donViTinh,
          isActive: formData.isActive
        };
        await apiUpdateVatTu(maVT, payload);
        showSuccess("Cập nhật thông tin danh mục vật tư thành công!");
      }

      await loadVatTuList();
      setIsAddingNew(false);
      setSelectedSupply({
        maVT: maVT,
        tenVT: tenVT,
        quyCach: quyCach,
        donViTinh: donViTinh,
        isActive: formData.isActive,
        isNew: false
      });
    } catch (error) {
      console.error("Lỗi khi lưu vật tư:", error);
      showError("Không thể lưu thông tin vật tư: " + (error.message || 'Lỗi hệ thống'));
    }
  };

  // Xóa (Ngừng sử dụng) vật tư y tế khỏi danh mục qua Backend API (DELETE)
  const handleDeleteSupply = async (maVT, tenVT) => {
    if (window.confirm(`Bạn có chắc chắn muốn ngừng sử dụng vật tư: ${tenVT} (Mã: ${maVT})?`)) {
      try {
        await apiDeleteVatTu(maVT);
        showSuccess("Ngừng sử dụng vật tư thành công!");
        await loadVatTuList();
        if (selectedSupply && selectedSupply.maVT === maVT) {
          setSelectedSupply(null);
          setIsAddingNew(false);
        }
      } catch (error) {
        console.error("Lỗi khi xóa vật tư:", error);
        showError("Không thể ngừng sử dụng vật tư: " + (error.message || 'Lỗi hệ thống'));
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
          <ClipboardList size={18} className="mr-[6px]" />
          <strong>Quản lý danh mục vật tư y tế</strong>
        </div>
        <div className="flex-1 flex justify-end text-[12px] opacity-[0.85]">
          <span>Trang chủ / Kho dược / Danh mục vật tư</span>
        </div>
      </div>

      {/* Vùng làm việc chính */}
      <div className="kb-body flex h-[calc(100vh-50px)] bg-[var(--bg-main)] overflow-hidden">
        
        {/* CỘT TRÁI: Bảng danh sách vật tư */}
        <div className="flex-[1.2] flex flex-col border-r border-[var(--border-color)] h-full bg-white">
          {/* Tiêu đề & nút Thêm mới */}
          <div className="flex justify-between items-center py-3 px-4 border-b border-[var(--border-color)] bg-[var(--bg-main)]">
            <div className="flex items-center gap-[6px] shrink-0">
              <ClipboardList size={16} className="text-[var(--primary)] shrink-0" />
              <h3 className="text-[14.5px] font-[750] text-[var(--text-main)] whitespace-nowrap">
                Danh mục vật tư tiêu hao hiện có
              </h3>
            </div>
            <button 
              onClick={handleAddNew}
              className="btn-primary h-8 text-[12.5px] px-3 flex items-center gap-1 !w-auto !mt-0 shrink-0"
            >
              <Plus size={14} /> Thêm vật tư mới
            </button>
          </div>

          {/* Bảng dữ liệu vật tư */}
          <div className="flex-1 overflow-y-auto">
            <table className="kb-table w-full border-collapse text-[13px]">
              <thead>
                <tr className="sticky top-0 z-10 bg-[var(--bg-main)] border-b-2 border-[var(--border-color)]">
                  <th className="w-[50px] text-center p-2">STT</th>
                  <th className="w-[100px] p-2">Mã vật tư</th>
                  <th className="w-[200px] p-2">Tên vật tư</th>
                  <th className="p-2">Quy cách đóng gói</th>
                  <th className="w-[100px] p-2">Đơn vị tính</th>
                  <th className="w-[140px] p-2 text-center">Trạng thái</th>
                  <th className="w-[60px] p-2 text-center">Xóa</th>
                </tr>
                {/* Lọc tìm kiếm */}
                <tr className="bg-[var(--bg-main)] border-b border-[var(--border-color)]">
                  <td></td>
                  <td className="p-1">
                    <input 
                      type="text" 
                      className="form-input h-[30px] text-[12px] py-1 px-2 text-center w-full" 
                      value={filters.maVT}
                      onChange={e => handleFilterChange('maVT', e.target.value)}
                    />
                  </td>
                  <td className="p-1">
                    <input 
                      type="text" 
                      className="form-input h-[30px] text-[12px] py-1 px-2 text-center w-full" 
                      value={filters.tenVT}
                      onChange={e => handleFilterChange('tenVT', e.target.value)}
                    />
                  </td>
                  <td className="p-1">
                    <input 
                      type="text" 
                      className="form-input h-[30px] text-[12px] py-1 px-2 text-center w-full" 
                      value={filters.quyCach}
                      onChange={e => handleFilterChange('quyCach', e.target.value)}
                    />
                  </td>
                  <td className="p-1" style={{minWidth: '100px'}}>
                    <select 
                      className="form-input h-[30px] text-[12px] px-2 py-0.5 text-center w-full" 
                      value={filters.donViTinh}
                      onChange={e => handleFilterChange('donViTinh', e.target.value)}
                    >
                      <option value="">All</option>
                      {DON_VI_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-1" style={{minWidth: '130px'}}>
                    <select 
                      className="form-input h-[30px] text-[12px] px-2 py-0.5 text-center w-full" 
                      value={filters.trangThai}
                      onChange={e => handleFilterChange('trangThai', e.target.value)}
                    >
                      <option value="">All</option>
                      <option value="active">Đang được sử dụng</option>
                      <option value="inactive">Ngừng sử dụng</option>
                    </select>
                  </td>
                  <td></td>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center p-10 text-[var(--text-muted)]">
                      Đang nạp dữ liệu danh mục vật tư từ hệ thống...
                    </td>
                  </tr>
                ) : displayedSupplies.map((item, idx) => {
                  const isSelected = selectedSupply && selectedSupply.maVT === item.maVT;
                  return (
                    <tr 
                      key={item.maVT}
                      className={`kb-table-row cursor-pointer transition-colors duration-150 ${isSelected ? 'bg-[var(--primary-light)]' : 'bg-transparent'} ${item.isActive === false ? 'opacity-65' : ''}`}
                      onClick={() => {
                        setIsAddingNew(false);
                        setSelectedSupply(item);
                      }}
                    >
                      <td className="text-center py-2.5 px-2 text-[var(--text-muted)]">
                        {startIndex + idx + 1}
                      </td>
                      <td className={`font-semibold py-2.5 px-2 ${isSelected ? 'text-[var(--primary-hover)]' : 'text-[var(--text-main)]'}`}>
                        {item.maVT}
                      </td>
                      <td className="font-[650] py-2.5 px-2">{item.tenVT}</td>
                      <td className={`py-2.5 px-2 ${item.quyCach ? 'not-italic text-[var(--text-main)]' : 'italic text-[var(--text-muted)]'}`}>
                        {item.quyCach || '—'}
                      </td>
                      <td className="py-2.5 px-2 font-medium">{item.donViTinh}</td>
                      <td className="py-2.5 px-2 text-center font-medium">
                        {item.isActive !== false ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-green-100 text-green-700 whitespace-nowrap">
                            Đang được sử dụng
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-500 whitespace-nowrap">
                            Ngừng sử dụng
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <button 
                          className={`kb-icon-btn kb-icon-btn--danger mx-auto ${item.isActive === false ? 'opacity-30 cursor-not-allowed' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (item.isActive !== false) {
                              handleDeleteSupply(item.maVT, item.tenVT);
                            }
                          }}
                          disabled={item.isActive === false}
                          title={item.isActive === false ? "Vật tư đã ngừng sử dụng" : "Ngừng sử dụng vật tư"}
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {!loading && displayedSupplies.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center p-10 text-[var(--text-muted)]">
                      Không tìm thấy vật tư trùng khớp với bộ lọc tìm kiếm
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Phân trang dưới bảng */}
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
            <span>Hiển thị {totalCount === 0 ? 0 : startIndex + 1} - {Math.min(startIndex + displayedSupplies.length, totalCount)} trên tổng {totalCount} vật tư</span>
          </div>
        </div>

        {/* CỘT PHẢI: Form chi tiết */}
        <div className="flex-[0.8] flex flex-col h-full bg-white">
          <div className="flex bg-[#10b981] py-3 px-[18px] h-[42px] items-center text-white text-[13px] font-bold gap-2">
            <Database size={16} />
            <span>CHI TIẾT DANH MỤC VẬT TƯ TIÊU HAO</span>
          </div>

          <div className="flex-1 overflow-y-auto p-6 bg-white">
            {selectedSupply === null ? (
              <div className="h-full flex flex-col items-center justify-center text-[var(--text-muted)] text-center gap-3">
                <ClipboardList size={48} className="opacity-25 text-[#10b981]" />
                <div>
                  <h4 className="font-semibold text-[var(--text-main)]">Chưa chọn vật tư</h4>
                  <p className="text-[13px] mt-1">Chọn một loại vật tư bên trái hoặc click "Thêm vật tư mới" để nhập thông tin vật tư tiêu hao.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSave} className="h-full flex flex-col justify-between">
                <div className="flex flex-col gap-[18px]">
                  <div className="border-b border-dashed border-[var(--border-color)] pb-4">
                    <h4 className="text-[13px] font-bold text-[#10b981] mb-4 flex items-center gap-[6px]">
                      <ClipboardList size={14} /> THÔNG TIN VẬT TƯ Y TẾ
                    </h4>
                    
                    <div className="flex flex-col gap-[14px]">
                      <div className="form-group m-0">
                        <label className="form-label text-[12.5px]">Mã vật tư <span className="text-red-500">*</span></label>
                        <input 
                          type="text" 
                          className="form-input h-9 text-[13px] uppercase" 
                          placeholder="Mã vật tư (VD: VT001)"
                          value={formData.maVT}
                          onChange={e => handleInputChange('maVT', e.target.value)}
                          required
                          maxLength={10}
                          disabled={!isAddingNew}
                        />
                      </div>

                      <div className="form-group m-0">
                        <label className="form-label text-[12.5px]">Tên vật tư y tế <span className="text-red-500">*</span></label>
                        <input 
                          type="text" 
                          className="form-input h-9 text-[13px]" 
                          placeholder="Nhập tên vật tư tiêu hao..."
                          value={formData.tenVT}
                          onChange={e => handleInputChange('tenVT', e.target.value)}
                          required
                          maxLength={100}
                        />
                      </div>

                      <div className="form-group m-0">
                        <label className="form-label text-[12.5px]">Quy cách đóng gói</label>
                        <input 
                          type="text" 
                          className="form-input h-9 text-[13px]" 
                          placeholder="Quy cách đóng gói (VD: Hộp 100 cái)..."
                          value={formData.quyCach}
                          onChange={e => handleInputChange('quyCach', e.target.value)}
                          maxLength={100}
                        />
                      </div>

                      <div className="form-group m-0">
                        <label className="form-label text-[12.5px]">Đơn vị tính <span className="text-red-500">*</span></label>
                        <select 
                          className="form-input h-10 text-[13px] px-2 py-1" 
                          value={formData.donViTinh}
                          onChange={e => handleInputChange('donViTinh', e.target.value)}
                          required
                        >
                          {DON_VI_OPTIONS.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group m-0 mt-2">
                        <label className="flex items-center gap-2 cursor-pointer text-[12.5px] font-medium text-slate-700">
                          <input 
                            type="checkbox"
                            checked={formData.isActive}
                            onChange={(e) => handleInputChange('isActive', e.target.checked)}
                            className="w-4 h-4 text-[#10b981] rounded border-gray-300 focus:ring-[#10b981] cursor-pointer"
                          />
                          <span>Trạng thái hoạt động (Đang được sử dụng)</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Các nút Hủy/Lưu */}
                <div className="flex justify-end gap-2.5 border-t border-[var(--border-color)] pt-4 mt-6">
                  <button 
                    type="button" 
                    className="btn-outline w-[100px] h-9 flex items-center justify-center p-0 m-0" 
                    onClick={() => {
                      setIsAddingNew(false);
                      setSelectedSupply(null);
                    }}
                  >
                    Hủy
                  </button>
                  <button 
                    type="submit" 
                    className="btn-primary w-[120px] h-9 flex items-center justify-center gap-1.5 bg-[#10b981] p-0 m-0" 
                  >
                    <Save size={16} /> Lưu
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default KhoDanhMucVatTu;
