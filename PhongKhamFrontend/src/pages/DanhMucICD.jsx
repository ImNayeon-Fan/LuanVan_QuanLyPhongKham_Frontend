import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Plus, Trash2, Save, Database, ListCollapse
} from 'lucide-react';
import { useToast } from '../utils/ToastContext';

// Dữ liệu mẫu ICD-10 gốc
const defaultICDData = [
  { maICD: 'A09', tenBenh: 'Tiêu chảy và viêm dạ dày ruột do nhiễm khuẩn' },
  { maICD: 'I10', tenBenh: 'Tăng huyết áp vô căn (nguyên phát)' },
  { maICD: 'E11', tenBenh: 'Đái tháo đường không phụ thuộc insulin (Typ 2)' },
  { maICD: 'J06', tenBenh: 'Nhiễm khuẩn đường hô hấp trên cấp tính nhiều vị trí' },
  { maICD: 'K29', tenBenh: 'Viêm dạ dày và tá tràng' },
  { maICD: 'M54', tenBenh: 'Đau lưng' },
  { maICD: 'N39', tenBenh: 'Nhiễm trùng đường tiết niệu (không xác định vị trí)' },
  { maICD: 'R05', tenBenh: 'Ho' }
];

/**
 * Component Quản lý Danh mục Bệnh lý (ICD-10)
 */
function DanhMucICD() {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  // Các state quản lý danh sách ICD, form biểu mẫu và bộ lọc tìm kiếm
  const [icdList, setIcdList] = useState([]);
  const [selectedICD, setSelectedICD] = useState(null);
  const [icdForm, setIcdForm] = useState({ maICD: '', tenBenh: '' });
  const [icdFilters, setIcdFilters] = useState({ maICD: '', tenBenh: '' });
  const [icdPage, setIcdPage] = useState(1);

  const itemsPerPage = 10;

  // Khởi chạy lấy danh sách từ LocalStorage
  useEffect(() => {
    const storedICD = localStorage.getItem('danhMucICD');
    if (storedICD) {
      setIcdList(JSON.parse(storedICD));
    } else {
      localStorage.setItem('danhMucICD', JSON.stringify(defaultICDData));
      setIcdList(defaultICDData);
    }
  }, []);

  // Cập nhật form khi chọn bệnh lý thay đổi
  useEffect(() => {
    if (selectedICD) {
      setIcdForm({
        maICD: selectedICD.maICD || '',
        tenBenh: selectedICD.tenBenh || ''
      });
    } else {
      setIcdForm({ maICD: '', tenBenh: '' });
    }
  }, [selectedICD]);

  // Bộ lọc danh sách ICD
  const filteredICD = icdList.filter(item => 
    (item.maICD || '').toLowerCase().includes(icdFilters.maICD.toLowerCase()) &&
    (item.tenBenh || '').toLowerCase().includes(icdFilters.tenBenh.toLowerCase())
  );

  // Tính toán phân trang
  const totalIcdPages = Math.max(1, Math.ceil(filteredICD.length / itemsPerPage));
  const activeIcdPage = Math.min(icdPage, totalIcdPages);
  const icdStartIdx = (activeIcdPage - 1) * itemsPerPage;
  const displayedICD = filteredICD.slice(icdStartIdx, icdStartIdx + itemsPerPage);

  // Xử lý khi bộ lọc thay đổi
  const handleIcdFilterChange = (key, val) => {
    setIcdFilters({ ...icdFilters, [key]: val });
    setIcdPage(1);
  };

  // Khởi tạo thêm mới mã bệnh lý
  const handleAddNewIcd = () => {
    setSelectedICD({ maICD: '', tenBenh: '', isNew: true });
  };

  // Lưu dữ liệu vào danh sách (Thêm mới hoặc cập nhật)
  const handleSaveIcd = (e) => {
    e.preventDefault();
    if (!icdForm.maICD.trim()) {
      showError('Vui lòng nhập Mã bệnh lý (ICD)!');
      return;
    }
    if (!icdForm.tenBenh.trim()) {
      showError('Vui lòng nhập Tên chẩn đoán bệnh!');
      return;
    }

    const updatedRecord = {
      maICD: icdForm.maICD.trim().toUpperCase(),
      tenBenh: icdForm.tenBenh.trim()
    };

    let newList = [];
    if (selectedICD?.isNew) {
      const exists = icdList.some(item => item.maICD.toUpperCase() === updatedRecord.maICD);
      if (exists) {
        showError('Mã ICD này đã tồn tại trong danh mục!');
        return;
      }
      newList = [...icdList, updatedRecord];
    } else {
      newList = icdList.map(item => item.maICD === selectedICD.maICD ? updatedRecord : item);
    }

    setIcdList(newList);
    localStorage.setItem('danhMucICD', JSON.stringify(newList));
    setSelectedICD(updatedRecord);
    showSuccess('Lưu danh mục Mã bệnh lý thành công!');
  };

  // Xóa mã bệnh lý khỏi danh mục
  const handleDeleteIcd = (maICD) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa mã bệnh ${maICD} khỏi danh mục?`)) {
      const newList = icdList.filter(item => item.maICD !== maICD);
      setIcdList(newList);
      localStorage.setItem('danhMucICD', JSON.stringify(newList));
      if (selectedICD && selectedICD.maICD === maICD) {
        setSelectedICD(null);
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
          <Database size={18} style={{ marginRight: '6px' }} />
          <strong>Danh mục bệnh lý (ICD-10)</strong>
        </div>
        <div style={styles.topbarRight}>
          <span>Trang chủ / Quản lý danh mục / Bệnh lý (ICD)</span>
        </div>
      </div>

      {/* Vùng làm việc chính */}
      <div className="kb-body" style={styles.body}>
        
        {/* CỘT TRÁI: Bảng danh sách ICD */}
        <div style={styles.leftCol}>
          <div style={styles.panelHeader}>
            <div style={styles.panelTitleContainer}>
              <ListCollapse size={16} style={{ color: 'var(--primary)' }} />
              <h3 style={styles.panelTitleText}>
                DANH SÁCH MÃ CHẨN ĐOÁN & TÊN BỆNH
              </h3>
            </div>
            <button 
              onClick={handleAddNewIcd}
              className="btn-primary" 
              style={styles.addBtn}
            >
              <Plus size={12} /> Thêm danh mục
            </button>
          </div>

          {/* Bảng dữ liệu */}
          <div style={styles.tableContainer}>
            <table className="kb-table" style={styles.table}>
              <thead>
                <tr style={styles.tableHeaderRow}>
                  <th style={styles.thStt}>STT</th>
                  <th style={styles.thMa}>Mã bệnh lý (ICD)</th>
                  <th style={{ padding: '8px' }}>Tên phân loại chẩn đoán bệnh</th>
                  <th style={styles.thXoa}>Xóa</th>
                </tr>
                <tr style={styles.filterRow}>
                  <td></td>
                  <td style={styles.tdPadding4}>
                    <input 
                      type="text" 
                      placeholder="Lọc mã..." 
                      className="form-input" 
                      style={styles.filterInput}
                      value={icdFilters.maICD}
                      onChange={e => handleIcdFilterChange('maICD', e.target.value)}
                    />
                  </td>
                  <td style={styles.tdPadding4}>
                    <input 
                      type="text" 
                      placeholder="Lọc tên bệnh..." 
                      className="form-input" 
                      style={styles.filterInput}
                      value={icdFilters.tenBenh}
                      onChange={e => handleIcdFilterChange('tenBenh', e.target.value)}
                    />
                  </td>
                  <td></td>
                </tr>
              </thead>
              <tbody>
                {displayedICD.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={styles.noDataTd}>
                      Không tìm thấy mã bệnh nào khớp với bộ lọc.
                    </td>
                  </tr>
                ) : (
                  displayedICD.map((item, idx) => {
                    const isSelected = selectedICD && selectedICD.maICD === item.maICD;
                    return (
                      <tr 
                        key={item.maICD}
                        className="kb-table-row"
                        style={{ 
                          backgroundColor: isSelected ? 'var(--primary-light)' : 'transparent',
                          cursor: 'pointer',
                          transition: 'background-color 0.15s'
                        }}
                        onClick={() => setSelectedICD(item)}
                      >
                        <td style={styles.tdStt}>
                          {icdStartIdx + idx + 1}
                        </td>
                        <td style={styles.tdMa}>
                          {item.maICD}
                        </td>
                        <td style={styles.tdTen}>{item.tenBenh}</td>
                        <td style={styles.tdXoa}>
                          <button 
                            className="kb-icon-btn kb-icon-btn--danger"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteIcd(item.maICD);
                            }}
                            title="Xóa mã ICD"
                            style={styles.deleteBtnIcon}
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Điều khiển phân trang */}
          <div style={styles.pagination}>
            <span style={{ color: 'var(--text-muted)' }}>
              Hiển thị từ <b>{icdStartIdx + 1}</b> đến <b>{Math.min(icdStartIdx + itemsPerPage, filteredICD.length)}</b> trong tổng số <b>{filteredICD.length}</b> mã ICD
            </span>
            <div style={{ display: 'flex', gap: '5px' }}>
              <button 
                disabled={icdPage === 1}
                onClick={() => setIcdPage(p => p - 1)}
                style={{
                  ...styles.pageBtn,
                  backgroundColor: icdPage === 1 ? '#f3f4f6' : '#ffffff',
                  cursor: icdPage === 1 ? 'not-allowed' : 'pointer'
                }}
              >
                Trước
              </button>
              <span style={styles.pageIndicator}>
                Trang {icdPage} / {totalIcdPages}
              </span>
              <button 
                disabled={icdPage === totalIcdPages}
                onClick={() => setIcdPage(p => p + 1)}
                style={{
                  ...styles.pageBtn,
                  backgroundColor: icdPage === totalIcdPages ? '#f3f4f6' : '#ffffff',
                  cursor: icdPage === totalIcdPages ? 'not-allowed' : 'pointer'
                }}
              >
                Sau
              </button>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: Form chi tiết */}
        <div style={styles.rightCol}>
          <div style={styles.formHeader}>
            <Database size={16} />
            <span>CHI TIẾT DANH MỤC BỆNH LÝ</span>
          </div>

          <div style={styles.formArea}>
            {selectedICD === null ? (
              <div style={styles.noSelected}>
                <ListCollapse size={32} style={styles.noSelectedIcon} />
                <p style={{ fontSize: '13px' }}>Chọn một mã ICD bên bảng danh sách hoặc click nút <b>"Thêm danh mục"</b> để tạo mới.</p>
              </div>
            ) : (
              <form onSubmit={handleSaveIcd} style={styles.form}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={styles.formSection}>
                    <h4 style={styles.formSectionTitle}>
                      THÔNG TIN MÃ BỆNH LÝ (ICD-10)
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: '12.5px' }}>Mã bệnh lý (ICD) <span style={{ color: 'red' }}>*</span></label>
                        <input 
                          type="text" 
                          className="form-input" 
                          placeholder="Ví dụ: J00, I10, E11..."
                          value={icdForm.maICD}
                          onChange={e => setIcdForm({ ...icdForm, maICD: e.target.value })}
                          required
                          disabled={!selectedICD.isNew}
                          style={styles.maInput}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: '12.5px' }}>Tên phân loại chẩn đoán bệnh <span style={{ color: 'red' }}>*</span></label>
                        <input 
                          type="text" 
                          className="form-input" 
                          placeholder="Ví dụ: Tăng huyết áp vô căn..."
                          value={icdForm.tenBenh}
                          onChange={e => setIcdForm({ ...icdForm, tenBenh: e.target.value })}
                          required
                          style={styles.formInputCommon}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Các nút Lưu/Hủy */}
                <div style={styles.formActionGroup}>
                  <button type="submit" className="btn-primary" style={styles.saveBtn}>
                    <Save size={16} /> Lưu thông tin [F4]
                  </button>
                  <button type="button" onClick={() => setSelectedICD(null)} className="btn-outline" style={styles.cancelBtn}>
                    Hủy bỏ
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

// Cấu hình CSS inline cho giao diện DanhMucICD
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
    padding: '12px 18px',
    backgroundColor: 'var(--bg-main)',
    borderBottom: '1px solid var(--border-color)'
  },
  panelTitleContainer: { display: 'flex', alignItems: 'center', gap: '6px' },
  panelTitleText: { fontSize: '14.5px', fontWeight: '750', color: 'var(--text-main)' },
  addBtn: { height: '28px', fontSize: '12px', padding: '0 10px', display: 'flex', alignItems: 'center', gap: '4px', width: 'auto' },
  tableContainer: { flex: 1, overflowY: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
  tableHeaderRow: { position: 'sticky', top: 0, zIndex: 10, background: 'var(--bg-main)', borderBottom: '2px solid var(--border-color)' },
  thStt: { width: '50px', textAlign: 'center', padding: '8px' },
  thMa: { width: '150px', padding: '8px' },
  thXoa: { width: '60px', padding: '8px', textAlign: 'center' },
  filterRow: { backgroundColor: 'var(--bg-main)', borderBottom: '1px solid var(--border-color)' },
  tdPadding4: { padding: '4px' },
  filterInput: { height: '26px', fontSize: '12px', padding: '2px 6px' },
  noDataTd: { textAlign: 'center', padding: '30px', color: 'var(--text-muted)' },
  tdStt: { textAlign: 'center', padding: '10px 8px', fontWeight: '500', color: 'var(--text-muted)' },
  tdMa: { fontWeight: '700', color: 'var(--primary-hover)', padding: '10px 8px' },
  tdTen: { fontWeight: '500', padding: '10px 8px' },
  tdXoa: { padding: '10px 8px', textAlign: 'center' },
  deleteBtnIcon: { margin: '0 auto' },
  pagination: {
    height: '45px',
    backgroundColor: '#ffffff',
    borderTop: '1px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 20px',
    fontSize: '13px'
  },
  pageBtn: { padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-color)' },
  pageIndicator: { display: 'flex', alignItems: 'center', padding: '0 8px', fontWeight: '600' },
  rightCol: {
    flex: 0.7,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: '#ffffff'
  },
  formHeader: {
    display: 'flex',
    backgroundColor: '#0052cc',
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
  noSelected: { height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', textAlign: 'center', gap: '8px' },
  noSelectedIcon: { opacity: 0.4, marginBottom: '8px', color: 'var(--primary)' },
  form: { height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' },
  formSection: { borderBottom: '1px dashed var(--border-color)', paddingBottom: '16px' },
  formSectionTitle: { fontSize: '13px', fontWeight: '700', color: 'var(--primary)', marginBottom: '12px' },
  maInput: { height: '34px', fontSize: '13px', paddingLeft: '12px', textTransform: 'uppercase' },
  formInputCommon: { height: '34px', fontSize: '13px', paddingLeft: '12px' },
  formActionGroup: {
    display: 'flex',
    gap: '12px',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '16px',
    marginTop: '20px'
  },
  saveBtn: { flex: 1, height: '36px', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: 0, margin: 0 },
  cancelBtn: { flex: 1, height: '36px', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, margin: 0 }
};

export default DanhMucICD;
