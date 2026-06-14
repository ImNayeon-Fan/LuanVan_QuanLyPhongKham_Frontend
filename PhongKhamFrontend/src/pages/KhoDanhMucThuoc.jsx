import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Plus, Trash2, Save, Database, Pill
} from 'lucide-react';
import { useToast } from '../utils/ToastContext';

// Dữ liệu mẫu danh mục thuốc ban đầu
const DEFAULT_DRUGS = [
  { maThuoc: 'TH001', tenThuoc: 'Paracetamol 500mg', hoatChat: 'Paracetamol', donViTinh: 'Viên' },
  { maThuoc: 'TH002', tenThuoc: 'Amoxicillin 500mg', hoatChat: 'Amoxicillin trihydrate', donViTinh: 'Viên' },
  { maThuoc: 'TH003', tenThuoc: 'Panadol Extra', hoatChat: 'Paracetamol + Caffeine', donViTinh: 'Viên' },
  { maThuoc: 'TH004', tenThuoc: 'Decolgen Forte', hoatChat: 'Paracetamol + Chlorpheniramine', donViTinh: 'Vỉ' },
  { maThuoc: 'TH005', tenThuoc: 'Gaviscon Dual Action', hoatChat: 'Sodium alginate + Calcium carbonate', donViTinh: 'Chai' },
  { maThuoc: 'TH006', tenThuoc: 'Augmentin 1g', hoatChat: 'Amoxicillin + Clavulanic acid', donViTinh: 'Hộp' },
];

const DON_VI_OPTIONS = ['Viên', 'Vỉ', 'Hộp', 'Chai', 'Gói', 'Ống', 'Tuýp'];

/**
 * Component Quản lý Danh mục Thuốc trong phòng khám
 */
function KhoDanhMucThuoc() {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  
  const [drugs, setDrugs] = useState([]);
  const [selectedDrug, setSelectedDrug] = useState(null);

  // State thông tin form điền
  const [formData, setFormData] = useState({
    maThuoc: '',
    tenThuoc: '',
    hoatChat: '',
    donViTinh: 'Viên'
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
  const itemsPerPage = 10;

  // Lấy dữ liệu thuốc từ LocalStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('danhMucThuoc');
      if (stored) {
        setDrugs(JSON.parse(stored));
      } else {
        localStorage.setItem('danhMucThuoc', JSON.stringify(DEFAULT_DRUGS));
        setDrugs(DEFAULT_DRUGS);
      }
    } catch (e) {
      setDrugs(DEFAULT_DRUGS);
    }
  }, []);

  // Reset trang về 1 khi đổi bộ lọc
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // Điền thông tin vào form mỗi khi chọn một loại thuốc khác
  useEffect(() => {
    if (selectedDrug) {
      setFormData({
        maThuoc: selectedDrug.maThuoc || '',
        tenThuoc: selectedDrug.tenThuoc || '',
        hoatChat: selectedDrug.hoatChat || '',
        donViTinh: selectedDrug.donViTinh || 'Viên'
      });
    } else {
      setFormData({
        maThuoc: '',
        tenThuoc: '',
        hoatChat: '',
        donViTinh: 'Viên'
      });
    }
  }, [selectedDrug]);

  // Bộ lọc danh mục thuốc
  const filteredDrugs = drugs.filter(item => {
    return (
      (item.maThuoc || '').toLowerCase().includes(filters.maThuoc.toLowerCase()) &&
      (item.tenThuoc || '').toLowerCase().includes(filters.tenThuoc.toLowerCase()) &&
      (item.hoatChat || '').toLowerCase().includes(filters.hoatChat.toLowerCase()) &&
      (item.donViTinh || '').toLowerCase().includes(filters.donViTinh.toLowerCase())
    );
  });

  // Tính toán phân trang
  const totalPages = Math.max(1, Math.ceil(filteredDrugs.length / itemsPerPage));
  const activePage = Math.min(currentPage, totalPages);
  const startIndex = (activePage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayedDrugs = filteredDrugs.slice(startIndex, endIndex);

  // Xử lý khi thay đổi input trên form nhập
  const handleInputChange = (key, val) => {
    setFormData({ ...formData, [key]: val });
  };

  // Xử lý khi thay đổi bộ lọc tìm kiếm thuốc
  const handleFilterChange = (key, val) => {
    setFilters({ ...filters, [key]: val });
  };

  // Khởi tạo thêm mới thuốc với mã tự sinh tăng dần (THxxx)
  const handleAddNew = () => {
    const drugNumbers = drugs
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
      isNew: true
    });
  };

  // Lưu thông tin thuốc (Thêm mới hoặc Cập nhật)
  const handleSave = (e) => {
    if (e) e.preventDefault();
    if (!formData.tenThuoc.trim()) {
      showError("Vui lòng nhập tên thuốc!");
      return;
    }
    if (!formData.maThuoc.trim()) {
      showError("Mã thuốc không được để trống!");
      return;
    }

    const updatedDrug = {
      maThuoc: formData.maThuoc.trim().toUpperCase(),
      tenThuoc: formData.tenThuoc.trim(),
      hoatChat: formData.hoatChat.trim(),
      donViTinh: formData.donViTinh
    };

    let newList = [];
    const isEditingExisting = drugs.some(d => d.maThuoc === updatedDrug.maThuoc);

    if (isEditingExisting) {
      newList = drugs.map(d => d.maThuoc === updatedDrug.maThuoc ? updatedDrug : d);
    } else {
      newList = [...drugs, updatedDrug];
    }

    setDrugs(newList);
    localStorage.setItem('danhMucThuoc', JSON.stringify(newList));
    setSelectedDrug(updatedDrug);
    showSuccess("Lưu thông tin danh mục thuốc thành công!");
  };

  // Xóa thuốc khỏi danh mục
  const handleDeleteDrug = (maThuoc, tenThuoc) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa thuốc: ${tenThuoc} (Mã: ${maThuoc})?`)) {
      const newList = drugs.filter(d => d.maThuoc !== maThuoc);
      setDrugs(newList);
      localStorage.setItem('danhMucThuoc', JSON.stringify(newList));
      if (selectedDrug && selectedDrug.maThuoc === maThuoc) {
        setSelectedDrug(null);
      }
    }
  };

  return (
    <div className="kb-wrapper h-screen overflow-hidden">
      {/* Topbar điều hướng */}
      <div className="kb-topbar h-[50px] px-5">
        <div className="flex-1 flex justify-start">
          <button className="kb-back-btn py-[5px] px-[10px]" onClick={() => navigate('/')}>
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
            <button 
              onClick={handleAddNew}
              className="btn-primary h-8 text-[12.5px] px-3 flex items-center gap-1 !w-auto !mt-0 shrink-0"
            >
              <Plus size={14} /> Thêm thuốc mới
            </button>
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
                  <th className="w-[60px] p-2 text-center">Xóa</th>
                </tr>
                {/* Lọc tìm kiếm */}
                <tr className="bg-[var(--bg-main)] border-b border-[var(--border-color)]">
                  <td></td>
                  <td className="p-1">
                    <input 
                      type="text" 
                      placeholder="Lọc..." 
                      className="form-input h-[26px] text-[12px] py-0.5 px-1.5" 
                      value={filters.maThuoc}
                      onChange={e => handleFilterChange('maThuoc', e.target.value)}
                    />
                  </td>
                  <td className="p-1">
                    <input 
                      type="text" 
                      placeholder="Lọc..." 
                      className="form-input h-[26px] text-[12px] py-0.5 px-1.5" 
                      value={filters.tenThuoc}
                      onChange={e => handleFilterChange('tenThuoc', e.target.value)}
                    />
                  </td>
                  <td className="p-1">
                    <input 
                      type="text" 
                      placeholder="Lọc..." 
                      className="form-input h-[26px] text-[12px] py-0.5 px-1.5" 
                      value={filters.hoatChat}
                      onChange={e => handleFilterChange('hoatChat', e.target.value)}
                    />
                  </td>
                  <td className="p-1">
                    <select 
                      className="form-input h-[26px] text-[12px] px-1" 
                      value={filters.donViTinh}
                      onChange={e => handleFilterChange('donViTinh', e.target.value)}
                    >
                      <option value="">Tất cả</option>
                      {DON_VI_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </td>
                  <td></td>
                </tr>
              </thead>
              <tbody>
                {displayedDrugs.map((drug, idx) => {
                  const isSelected = selectedDrug && selectedDrug.maThuoc === drug.maThuoc;
                  return (
                    <tr 
                      key={drug.maThuoc}
                      className={`kb-table-row cursor-pointer transition-colors duration-150 ${isSelected ? 'bg-[var(--primary-light)]' : 'bg-transparent'}`}
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
                      <td className="py-2.5 px-2 text-center">
                        <button 
                          className="kb-icon-btn kb-icon-btn--danger mx-auto"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteDrug(drug.maThuoc, drug.tenThuoc);
                          }}
                          title="Xóa thuốc"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filteredDrugs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center p-10 text-[var(--text-muted)]">
                      Không tìm thấy thuốc trùng khớp với bộ lọc tìm kiếm
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
            <span>Hiển thị {filteredDrugs.length === 0 ? 0 : startIndex + 1} - {Math.min(endIndex, filteredDrugs.length)} trên tổng {filteredDrugs.length} thuốc</span>
          </div>
        </div>

        {/* CỘT PHẢI: Form chi tiết */}
        <div className="flex-[0.8] flex flex-col h-full bg-white">
          <div className="flex bg-[#0284c7] py-3 px-[18px] h-[42px] items-center text-white text-[13px] font-bold gap-2">
            <Database size={16} />
            <span>CHI TIẾT DANH MỤC THUỐC Y KHOA</span>
          </div>

          <div className="flex-1 overflow-y-auto p-6 bg-white">
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
                <div className="flex flex-col gap-[18px]">
                  <div className="border-b border-dashed border-[var(--border-color)] pb-4">
                    <h4 className="text-[13px] font-bold text-[var(--primary)] mb-4 flex items-center gap-1.5">
                      <Pill size={14} /> THÔNG TIN DƯỢC PHẨM CHUNG
                    </h4>
                    
                    <div className="flex flex-col gap-[14px]">
                      <div className="form-group m-0">
                        <label className="form-label text-[12.5px]">Mã thuốc <span className="text-red-500">*</span></label>
                        <input 
                          type="text" 
                          className="form-input h-9 text-[13px] uppercase" 
                          placeholder="Mã thuốc (VD: TH001)"
                          value={formData.maThuoc}
                          onChange={e => handleInputChange('maThuoc', e.target.value)}
                          required
                          disabled={!selectedDrug.isNew}
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
                        />
                      </div>

                      <div className="form-group m-0">
                        <label className="form-label text-[12.5px]">Hoạt chất chính</label>
                        <input 
                          type="text" 
                          className="form-input h-9 text-[13px]" 
                          placeholder="Hoạt chất chính/hàm lượng (VD: Paracetamol 500mg)..."
                          value={formData.hoatChat}
                          onChange={e => handleInputChange('hoatChat', e.target.value)}
                        />
                      </div>

                      <div className="form-group m-0">
                        <label className="form-label text-[12.5px]">Đơn vị tính <span className="text-red-500">*</span></label>
                        <select 
                          className="form-input h-9 text-[13px] px-2" 
                          value={formData.donViTinh}
                          onChange={e => handleInputChange('donViTinh', e.target.value)}
                          required
                        >
                          {DON_VI_OPTIONS.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Các nút Hủy/Lưu */}
                <div className="flex justify-end gap-2.5 border-t border-[var(--border-color)] pt-4 mt-6">
                  <button 
                    type="button" 
                    className="btn-outline w-[100px] h-9 flex items-center justify-center p-0 m-0" 
                    onClick={() => setSelectedDrug(null)}
                  >
                    Hủy
                  </button>
                  <button 
                    type="submit" 
                    className="btn-primary w-[120px] h-9 flex items-center justify-center gap-1.5 p-0 m-0" 
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

export default KhoDanhMucThuoc;
