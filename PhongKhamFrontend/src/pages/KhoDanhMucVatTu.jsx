import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Plus, Trash2, Save, Database, ClipboardList
} from 'lucide-react';
import { useToast } from '../utils/ToastContext';

// Dữ liệu mẫu danh mục vật tư y tế ban đầu
const DEFAULT_SUPPLIES = [
  { maVT: 'VT001', tenVT: 'Găng tay y tế có bột', quyCach: 'Hộp 100 cái (size M)', donViTinh: 'Hộp' },
  { maVT: 'VT002', tenVT: 'Băng thun cuộn y tế', quyCach: 'Cuộn 10cm x 5m', donViTinh: 'Cuộn' },
  { maVT: 'VT003', tenVT: 'Kim tiêm dùng một lần 5ml', quyCach: 'Hộp 100 cây (Vinahankook)', donViTinh: 'Hộp' },
  { maVT: 'VT004', tenVT: 'Bông gòn y tế kháng khuẩn', quyCach: 'Gói 500g', donViTinh: 'Gói' },
  { maVT: 'VT005', tenVT: 'Cồn sát trùng 70 độ', quyCach: 'Chai 500ml', donViTinh: 'Chai' },
  { maVT: 'VT006', tenVT: 'Khẩu trang y tế 4 lớp', quyCach: 'Hộp 50 cái', donViTinh: 'Hộp' },
];

const DON_VI_OPTIONS = ['Cái', 'Hộp', 'Cuộn', 'Gói', 'Chai', 'Thùng', 'Bộ'];

/**
 * Component Quản lý Danh mục Vật tư tiêu hao tại phòng khám
 */
function KhoDanhMucVatTu() {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  
  const [supplies, setSupplies] = useState([]);
  const [selectedSupply, setSelectedSupply] = useState(null);

  // State thông tin form điền
  const [formData, setFormData] = useState({
    maVT: '',
    tenVT: '',
    quyCach: '',
    donViTinh: 'Hộp'
  });

  // State bộ lọc tìm kiếm
  const [filters, setFilters] = useState({
    maVT: '',
    tenVT: '',
    quyCach: '',
    donViTinh: ''
  });

  // State quản lý phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Tải danh sách vật tư y tế từ LocalStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('danhMucVatTu');
      if (stored) {
        setSupplies(JSON.parse(stored));
      } else {
        localStorage.setItem('danhMucVatTu', JSON.stringify(DEFAULT_SUPPLIES));
        setSupplies(DEFAULT_SUPPLIES);
      }
    } catch (e) {
      setSupplies(DEFAULT_SUPPLIES);
    }
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
        donViTinh: selectedSupply.donViTinh || 'Hộp'
      });
    } else {
      setFormData({
        maVT: '',
        tenVT: '',
        quyCach: '',
        donViTinh: 'Hộp'
      });
    }
  }, [selectedSupply]);

  // Bộ lọc danh mục vật tư y tế
  const filteredSupplies = supplies.filter(item => {
    return (
      (item.maVT || '').toLowerCase().includes(filters.maVT.toLowerCase()) &&
      (item.tenVT || '').toLowerCase().includes(filters.tenVT.toLowerCase()) &&
      (item.quyCach || '').toLowerCase().includes(filters.quyCach.toLowerCase()) &&
      (item.donViTinh || '').toLowerCase().includes(filters.donViTinh.toLowerCase())
    );
  });

  // Tính toán phân trang
  const totalPages = Math.max(1, Math.ceil(filteredSupplies.length / itemsPerPage));
  const activePage = Math.min(currentPage, totalPages);
  const startIndex = (activePage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayedSupplies = filteredSupplies.slice(startIndex, endIndex);

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
      isNew: true
    });
  };

  // Lưu thông tin vật tư y tế (Thêm mới hoặc Cập nhật)
  const handleSave = (e) => {
    if (e) e.preventDefault();
    if (!formData.tenVT.trim()) {
      showError("Vui lòng nhập tên vật tư!");
      return;
    }
    if (!formData.maVT.trim()) {
      showError("Mã vật tư không được để trống!");
      return;
    }

    const updatedSupply = {
      maVT: formData.maVT.trim().toUpperCase(),
      tenVT: formData.tenVT.trim(),
      quyCach: formData.quyCach.trim(),
      donViTinh: formData.donViTinh
    };

    let newList = [];
    const isEditingExisting = supplies.some(s => s.maVT === updatedSupply.maVT);

    if (isEditingExisting) {
      newList = supplies.map(s => s.maVT === updatedSupply.maVT ? updatedSupply : s);
    } else {
      newList = [...supplies, updatedSupply];
    }

    setSupplies(newList);
    localStorage.setItem('danhMucVatTu', JSON.stringify(newList));
    setSelectedSupply(updatedSupply);
    showSuccess("Lưu thông tin danh mục vật tư thành công!");
  };

  // Xóa vật tư y tế khỏi danh mục
  const handleDeleteSupply = (maVT, tenVT) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa vật tư: ${tenVT} (Mã: ${maVT})?`)) {
      const newList = supplies.filter(s => s.maVT !== maVT);
      setSupplies(newList);
      localStorage.setItem('danhMucVatTu', JSON.stringify(newList));
      if (selectedSupply && selectedSupply.maVT === maVT) {
        setSelectedSupply(null);
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
            <div className="flex items-center gap-[6px]">
              <ClipboardList size={16} className="text-[var(--primary)]" />
              <h3 className="text-[14.5px] font-[750] text-[var(--text-main)]">
                Danh mục vật tư tiêu hao hiện có
              </h3>
            </div>
            <button 
              onClick={handleAddNew}
              className="btn-primary h-8 text-[12.5px] px-3 flex items-center gap-1"
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
                  <th className="w-[220px] p-2">Tên vật tư</th>
                  <th className="p-2">Quy cách đóng gói</th>
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
                      value={filters.maVT}
                      onChange={e => handleFilterChange('maVT', e.target.value)}
                    />
                  </td>
                  <td className="p-1">
                    <input 
                      type="text" 
                      placeholder="Lọc..." 
                      className="form-input h-[26px] text-[12px] py-0.5 px-1.5" 
                      value={filters.tenVT}
                      onChange={e => handleFilterChange('tenVT', e.target.value)}
                    />
                  </td>
                  <td className="p-1">
                    <input 
                      type="text" 
                      placeholder="Lọc..." 
                      className="form-input h-[26px] text-[12px] py-0.5 px-1.5" 
                      value={filters.quyCach}
                      onChange={e => handleFilterChange('quyCach', e.target.value)}
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
                {displayedSupplies.map((item, idx) => {
                  const isSelected = selectedSupply && selectedSupply.maVT === item.maVT;
                  return (
                    <tr 
                      key={item.maVT}
                      className={`kb-table-row cursor-pointer transition-colors duration-150 ${isSelected ? 'bg-[var(--primary-light)]' : 'bg-transparent'}`}
                      onClick={() => setSelectedSupply(item)}
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
                      <td className="py-2.5 px-2 text-center">
                        <button 
                          className="kb-icon-btn kb-icon-btn--danger mx-auto"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSupply(item.maVT, item.tenVT);
                          }}
                          title="Xóa vật tư"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filteredSupplies.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center p-10 text-[var(--text-muted)]">
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
                className={`btn-outline h-6 w-6 p-0 flex items-center justify-center ${activePage === 1 ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              >
                &lt;
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`${p === activePage ? "btn-primary" : "btn-outline"} h-6 w-6 p-0 flex items-center justify-center text-[11px] font-bold cursor-pointer`}
                >
                  {p}
                </button>
              ))}
              <button 
                disabled={activePage === totalPages} 
                onClick={() => setCurrentPage(activePage + 1)}
                className={`btn-outline h-6 w-6 p-0 flex items-center justify-center ${activePage === totalPages ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              >
                &gt;
              </button>
            </div>
            <span>Hiển thị {filteredSupplies.length === 0 ? 0 : startIndex + 1} - {Math.min(endIndex, filteredSupplies.length)} trên tổng {filteredSupplies.length} vật tư</span>
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
                          disabled={!selectedSupply.isNew}
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
                    onClick={() => setSelectedSupply(null)}
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
