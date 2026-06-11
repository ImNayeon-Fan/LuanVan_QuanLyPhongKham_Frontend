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
    <div className="kb-wrapper" style={styles.wrapper}>
      {/* Topbar điều hướng */}
      <div className="kb-topbar" style={styles.topbar}>
        <div style={styles.topbarLeft}>
          <button className="kb-back-btn" onClick={() => navigate('/')} style={styles.backBtn}>
            <ArrowLeft size={16} /> Quay về trang chủ
          </button>
        </div>
        <div className="kb-topbar-title" style={styles.topbarTitle}>
          <Pill size={18} style={{ marginRight: '6px' }} />
          <strong>Quản lý danh mục thuốc</strong>
        </div>
        <div style={styles.topbarRight}>
          <span>Trang chủ / Kho dược / Danh mục thuốc</span>
        </div>
      </div>

      {/* Vùng làm việc chính */}
      <div className="kb-body" style={styles.body}>
        
        {/* CỘT TRÁI: Bảng danh sách */}
        <div style={styles.leftCol}>
          {/* Tiêu đề & nút Thêm mới */}
          <div style={styles.panelHeader}>
            <div style={styles.panelTitleContainer}>
              <Pill size={16} style={{ color: 'var(--primary)' }} />
              <h3 style={styles.panelTitleText}>
                Danh mục dược phẩm hiện tại
              </h3>
            </div>
            <button 
              onClick={handleAddNew}
              className="btn-primary" 
              style={styles.addBtn}
            >
              <Plus size={14} /> Thêm thuốc mới
            </button>
          </div>

          {/* Bảng dữ liệu thuốc */}
          <div style={styles.tableContainer}>
            <table className="kb-table" style={styles.table}>
              <thead>
                <tr style={styles.tableHeaderRow}>
                  <th style={styles.thStt}>STT</th>
                  <th style={styles.thMa}>Mã thuốc</th>
                  <th style={styles.thTen}>Tên thuốc</th>
                  <th style={{ padding: '8px' }}>Hoạt chất chính</th>
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
                      value={filters.maThuoc}
                      onChange={e => handleFilterChange('maThuoc', e.target.value)}
                    />
                  </td>
                  <td style={styles.tdPadding4}>
                    <input 
                      type="text" 
                      placeholder="Lọc..." 
                      className="form-input" 
                      style={styles.filterInput}
                      value={filters.tenThuoc}
                      onChange={e => handleFilterChange('tenThuoc', e.target.value)}
                    />
                  </td>
                  <td style={styles.tdPadding4}>
                    <input 
                      type="text" 
                      placeholder="Lọc..." 
                      className="form-input" 
                      style={styles.filterInput}
                      value={filters.hoatChat}
                      onChange={e => handleFilterChange('hoatChat', e.target.value)}
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
                {displayedDrugs.map((drug, idx) => {
                  const isSelected = selectedDrug && selectedDrug.maThuoc === drug.maThuoc;
                  return (
                    <tr 
                      key={drug.maThuoc}
                      className="kb-table-row"
                      style={{ 
                        backgroundColor: isSelected ? 'var(--primary-light)' : 'transparent',
                        cursor: 'pointer',
                        transition: 'background-color 0.15s'
                      }}
                      onClick={() => setSelectedDrug(drug)}
                    >
                      <td style={styles.tdStt}>
                        {startIndex + idx + 1}
                      </td>
                      <td style={{ fontWeight: '600', color: isSelected ? 'var(--primary-hover)' : 'var(--text-main)', padding: '10px 8px' }}>
                        {drug.maThuoc}
                      </td>
                      <td style={{ fontWeight: '650', padding: '10px 8px' }}>{drug.tenThuoc}</td>
                      <td style={{ padding: '10px 8px', fontStyle: drug.hoatChat ? 'normal' : 'italic', color: drug.hoatChat ? 'var(--text-main)' : 'var(--text-muted)' }}>
                        {drug.hoatChat || '—'}
                      </td>
                      <td style={{ padding: '10px 8px', fontWeight: '500' }}>{drug.donViTinh}</td>
                      <td style={styles.tdXoa}>
                        <button 
                          className="kb-icon-btn kb-icon-btn--danger"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteDrug(drug.maThuoc, drug.tenThuoc);
                          }}
                          title="Xóa thuốc"
                          style={styles.deleteBtnIcon}
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filteredDrugs.length === 0 && (
                  <tr>
                    <td colSpan={6} style={styles.noDataTd}>
                      Không tìm thấy thuốc trùng khớp với bộ lọc tìm kiếm
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
            <span>Hiển thị {filteredDrugs.length === 0 ? 0 : startIndex + 1} - {Math.min(endIndex, filteredDrugs.length)} trên tổng {filteredDrugs.length} thuốc</span>
          </div>
        </div>

        {/* CỘT PHẢI: Form chi tiết */}
        <div style={styles.rightCol}>
          <div style={styles.formHeader}>
            <Database size={16} />
            <span>CHI TIẾT DANH MỤC THUỐC Y KHOA</span>
          </div>

          <div style={styles.formArea}>
            {selectedDrug === null ? (
              <div style={styles.noSelected}>
                <Pill size={48} style={styles.noSelectedIcon} />
                <div>
                  <h4 style={{ fontWeight: '600', color: 'var(--text-main)' }}>Chưa chọn thuốc</h4>
                  <p style={{ fontSize: '13px', marginTop: '4px' }}>Chọn một loại thuốc bên trái hoặc click "Thêm thuốc mới" để nhập thông tin dược phẩm.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSave} style={styles.form}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  <div style={styles.formSection}>
                    <h4 style={styles.formSectionTitle}>
                      <Pill size={14} /> THÔNG TIN DƯỢC PHẨM CHUNG
                    </h4>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ fontSize: '12.5px' }}>Mã thuốc <span style={{ color: 'red' }}>*</span></label>
                        <input 
                          type="text" 
                          className="form-input" 
                          placeholder="Mã thuốc (VD: TH001)"
                          value={formData.maThuoc}
                          onChange={e => handleInputChange('maThuoc', e.target.value)}
                          required
                          disabled={!selectedDrug.isNew}
                          style={styles.maInput}
                        />
                      </div>

                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ fontSize: '12.5px' }}>Tên thuốc (Biệt dược) <span style={{ color: 'red' }}>*</span></label>
                        <input 
                          type="text" 
                          className="form-input" 
                          placeholder="Nhập tên biệt dược..."
                          value={formData.tenThuoc}
                          onChange={e => handleInputChange('tenThuoc', e.target.value)}
                          required
                          style={styles.formInputCommon}
                        />
                      </div>

                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ fontSize: '12.5px' }}>Hoạt chất chính</label>
                        <input 
                          type="text" 
                          className="form-input" 
                          placeholder="Hoạt chất chính/hàm lượng (VD: Paracetamol 500mg)..."
                          value={formData.hoatChat}
                          onChange={e => handleInputChange('hoatChat', e.target.value)}
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
                    onClick={() => setSelectedDrug(null)}
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

// Bảng cấu hình CSS inline cho giao diện KhoDanhMucThuoc
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
  noSelectedIcon: { opacity: 0.25, color: 'var(--primary)' },
  form: { height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' },
  formSection: { borderBottom: '1px dashed var(--border-color)', paddingBottom: '16px' },
  formSectionTitle: { fontSize: '13px', fontWeight: '700', color: 'var(--primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' },
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
  saveBtn: { width: '120px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: 0, margin: 0 }
};

export default KhoDanhMucThuoc;
