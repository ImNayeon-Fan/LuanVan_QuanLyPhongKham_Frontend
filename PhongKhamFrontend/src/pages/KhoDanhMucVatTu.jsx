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
    <div className="kb-wrapper" style={styles.wrapper}>
      {/* Topbar điều hướng */}
      <div className="kb-topbar" style={styles.topbar}>
        <div style={styles.topbarLeft}>
          <button className="kb-back-btn" onClick={() => navigate('/')} style={styles.backBtn}>
            <ArrowLeft size={16} /> Quay về trang chủ
          </button>
        </div>
        <div className="kb-topbar-title" style={styles.topbarTitle}>
          <ClipboardList size={18} style={{ marginRight: '6px' }} />
          <strong>Quản lý danh mục vật tư y tế</strong>
        </div>
        <div style={styles.topbarRight}>
          <span>Trang chủ / Kho dược / Danh mục vật tư</span>
        </div>
      </div>

      {/* Vùng làm việc chính */}
      <div className="kb-body" style={styles.body}>
        
        {/* CỘT TRÁI: Bảng danh sách vật tư */}
        <div style={styles.leftCol}>
          {/* Tiêu đề & nút Thêm mới */}
          <div style={styles.panelHeader}>
            <div style={styles.panelTitleContainer}>
              <ClipboardList size={16} style={{ color: 'var(--primary)' }} />
              <h3 style={styles.panelTitleText}>
                Danh mục vật tư tiêu hao hiện có
              </h3>
            </div>
            <button 
              onClick={handleAddNew}
              className="btn-primary" 
              style={styles.addBtn}
            >
              <Plus size={14} /> Thêm vật tư mới
            </button>
          </div>

          {/* Bảng dữ liệu vật tư */}
          <div style={styles.tableContainer}>
            <table className="kb-table" style={styles.table}>
              <thead>
                <tr style={styles.tableHeaderRow}>
                  <th style={styles.thStt}>STT</th>
                  <th style={styles.thMa}>Mã vật tư</th>
                  <th style={styles.thTen}>Tên vật tư</th>
                  <th style={{ padding: '8px' }}>Quy cách đóng gói</th>
                  <th style={styles.thDvt}>Đơn vị tính</th>
                  <th style={styles.thXoa}>Xóa</th>
                </tr>
                {/* Lọc tìm kiếm */}
                <tr style={styles.filterRow}>
                  <td></td>
                  <td style={styles.tdPadding4}>
                    <input 
                      type="text" 
                      placeholder="Lọc..." 
                      className="form-input" 
                      style={styles.filterInput}
                      value={filters.maVT}
                      onChange={e => handleFilterChange('maVT', e.target.value)}
                    />
                  </td>
                  <td style={styles.tdPadding4}>
                    <input 
                      type="text" 
                      placeholder="Lọc..." 
                      className="form-input" 
                      style={styles.filterInput}
                      value={filters.tenVT}
                      onChange={e => handleFilterChange('tenVT', e.target.value)}
                    />
                  </td>
                  <td style={styles.tdPadding4}>
                    <input 
                      type="text" 
                      placeholder="Lọc..." 
                      className="form-input" 
                      style={styles.filterInput}
                      value={filters.quyCach}
                      onChange={e => handleFilterChange('quyCach', e.target.value)}
                    />
                  </td>
                  <td style={styles.tdPadding4}>
                    <select 
                      className="form-input" 
                      style={styles.filterSelect}
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
                      className="kb-table-row"
                      style={{ 
                        backgroundColor: isSelected ? 'var(--primary-light)' : 'transparent',
                        cursor: 'pointer',
                        transition: 'background-color 0.15s'
                      }}
                      onClick={() => setSelectedSupply(item)}
                    >
                      <td style={styles.tdStt}>
                        {startIndex + idx + 1}
                      </td>
                      <td style={{ fontWeight: '600', color: isSelected ? 'var(--primary-hover)' : 'var(--text-main)', padding: '10px 8px' }}>
                        {item.maVT}
                      </td>
                      <td style={{ fontWeight: '650', padding: '10px 8px' }}>{item.tenVT}</td>
                      <td style={{ padding: '10px 8px', fontStyle: item.quyCach ? 'normal' : 'italic', color: item.quyCach ? 'var(--text-main)' : 'var(--text-muted)' }}>
                        {item.quyCach || '—'}
                      </td>
                      <td style={{ padding: '10px 8px', fontWeight: '500' }}>{item.donViTinh}</td>
                      <td style={styles.tdXoa}>
                        <button 
                          className="kb-icon-btn kb-icon-btn--danger"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSupply(item.maVT, item.tenVT);
                          }}
                          title="Xóa vật tư"
                          style={styles.deleteBtnIcon}
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filteredSupplies.length === 0 && (
                  <tr>
                    <td colSpan={6} style={styles.noDataTd}>
                      Không tìm thấy vật tư trùng khớp với bộ lọc tìm kiếm
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Phân trang dưới bảng */}
          <div style={styles.pagination}>
            <div style={styles.pageBtnGroup}>
              <button 
                disabled={activePage === 1} 
                onClick={() => setCurrentPage(activePage - 1)}
                className="btn-outline" 
                style={{ ...styles.pageNavBtn, cursor: activePage === 1 ? 'not-allowed' : 'pointer' }}
              >
                &lt;
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={p === activePage ? "btn-primary" : "btn-outline"}
                  style={styles.pageNumberBtn}
                >
                  {p}
                </button>
              ))}
              <button 
                disabled={activePage === totalPages} 
                onClick={() => setCurrentPage(activePage + 1)}
                className="btn-outline" 
                style={{ ...styles.pageNavBtn, cursor: activePage === totalPages ? 'not-allowed' : 'pointer' }}
              >
                &gt;
              </button>
            </div>
            <span>Hiển thị {filteredSupplies.length === 0 ? 0 : startIndex + 1} - {Math.min(endIndex, filteredSupplies.length)} trên tổng {filteredSupplies.length} vật tư</span>
          </div>
        </div>

        {/* CỘT PHẢI: Form chi tiết */}
        <div style={styles.rightCol}>
          <div style={styles.formHeader}>
            <Database size={16} />
            <span>CHI TIẾT DANH MỤC VẬT TƯ TIÊU HAO</span>
          </div>

          <div style={styles.formArea}>
            {selectedSupply === null ? (
              <div style={styles.noSelected}>
                <ClipboardList size={48} style={styles.noSelectedIcon} />
                <div>
                  <h4 style={{ fontWeight: '600', color: 'var(--text-main)' }}>Chưa chọn vật tư</h4>
                  <p style={{ fontSize: '13px', marginTop: '4px' }}>Chọn một loại vật tư bên trái hoặc click "Thêm vật tư mới" để nhập thông tin vật tư tiêu hao.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSave} style={styles.form}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  <div style={styles.formSection}>
                    <h4 style={styles.formSectionTitle}>
                      <ClipboardList size={14} /> THÔNG TIN VẬT TƯ Y TẾ
                    </h4>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ fontSize: '12.5px' }}>Mã vật tư <span style={{ color: 'red' }}>*</span></label>
                        <input 
                          type="text" 
                          className="form-input" 
                          placeholder="Mã vật tư (VD: VT001)"
                          value={formData.maVT}
                          onChange={e => handleInputChange('maVT', e.target.value)}
                          required
                          disabled={!selectedSupply.isNew}
                          style={styles.maInput}
                        />
                      </div>

                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ fontSize: '12.5px' }}>Tên vật tư y tế <span style={{ color: 'red' }}>*</span></label>
                        <input 
                          type="text" 
                          className="form-input" 
                          placeholder="Nhập tên vật tư tiêu hao..."
                          value={formData.tenVT}
                          onChange={e => handleInputChange('tenVT', e.target.value)}
                          required
                          style={styles.formInputCommon}
                        />
                      </div>

                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ fontSize: '12.5px' }}>Quy cách đóng gói</label>
                        <input 
                          type="text" 
                          className="form-input" 
                          placeholder="Quy cách đóng gói (VD: Hộp 100 cái)..."
                          value={formData.quyCach}
                          onChange={e => handleInputChange('quyCach', e.target.value)}
                          style={styles.formInputCommon}
                        />
                      </div>

                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ fontSize: '12.5px' }}>Đơn vị tính <span style={{ color: 'red' }}>*</span></label>
                        <select 
                          className="form-input" 
                          value={formData.donViTinh}
                          onChange={e => handleInputChange('donViTinh', e.target.value)}
                          required
                          style={styles.formSelectCommon}
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
                <div style={styles.formActionGroup}>
                  <button 
                    type="button" 
                    className="btn-outline" 
                    onClick={() => setSelectedSupply(null)}
                    style={styles.cancelBtn}
                  >
                    Hủy
                  </button>
                  <button 
                    type="submit" 
                    className="btn-primary" 
                    style={styles.saveBtn}
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

// Bảng cấu hình CSS inline cho giao diện KhoDanhMucVatTu
const styles = {
  wrapper: { height: '100vh', overflow: 'hidden' },
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
    flex: 1.2,
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
  addBtn: { height: '32px', fontSize: '12.5px', padding: '0 12px', display: 'flex', alignItems: 'center', gap: '4px' },
  tableContainer: { flex: 1, overflowY: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
  tableHeaderRow: { position: 'sticky', top: 0, zIndex: 10, background: 'var(--bg-main)', borderBottom: '2px solid var(--border-color)' },
  thStt: { width: '50px', textAlign: 'center', padding: '8px' },
  thMa: { width: '100px', padding: '8px' },
  thTen: { width: '220px', padding: '8px' },
  thDvt: { width: '100px', padding: '8px' },
  thXoa: { width: '60px', padding: '8px', textAlign: 'center' },
  filterRow: { backgroundColor: 'var(--bg-main)', borderBottom: '1px solid var(--border-color)' },
  tdPadding4: { padding: '4px' },
  filterInput: { height: '26px', fontSize: '12px', padding: '2px 6px' },
  filterSelect: { height: '26px', fontSize: '12px', padding: '0 4px' },
  tdStt: { textAlign: 'center', padding: '10px 8px', color: 'var(--text-muted)' },
  tdXoa: { padding: '10px 8px', textAlign: 'center' },
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
    flex: 0.8,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: '#ffffff'
  },
  formHeader: {
    display: 'flex',
    backgroundColor: '#10b981',
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
    padding: '24px',
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
  noSelectedIcon: { opacity: 0.25, color: '#10b981' },
  form: { height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' },
  formSection: { borderBottom: '1px dashed var(--border-color)', paddingBottom: '16px' },
  formSectionTitle: { fontSize: '13px', fontWeight: '700', color: '#10b981', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' },
  maInput: { height: '36px', fontSize: '13px', textTransform: 'uppercase' },
  formInputCommon: { height: '36px', fontSize: '13px' },
  formSelectCommon: { height: '36px', fontSize: '13px', padding: '0 8px' },
  formActionGroup: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '16px',
    marginTop: '24px'
  },
  cancelBtn: { width: '100px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, margin: 0 },
  saveBtn: { width: '120px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', backgroundColor: '#10b981', padding: 0, margin: 0 }
};

export default KhoDanhMucVatTu;
