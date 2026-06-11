import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Plus, Trash2, Save, Check, X, Database, Activity
} from 'lucide-react';
import { useToast } from '../utils/ToastContext';

// Dữ liệu mẫu dịch vụ cận lâm sàng gốc
const defaultDichVuData = [
  { maDV: 'DV001', tenDV: 'Siêu âm ổ bụng tổng quát', giaTien: 150000, trangThai: true },
  { maDV: 'DV002', tenDV: 'X-Quang ngực thẳng (Kỹ thuật số)', giaTien: 120000, trangThai: true },
  { maDV: 'DV003', tenDV: 'Xét nghiệm công thức máu toàn bộ (24 chỉ số)', giaTien: 90000, trangThai: true },
  { maDV: 'DV004', tenDV: 'Xét nghiệm đường huyết (Glucose)', giaTien: 50000, trangThai: true },
  { maDV: 'DV005', tenDV: 'Điện tâm đồ (ECG)', giaTien: 80000, trangThai: true },
  { maDV: 'DV006', tenDV: 'Siêu âm tim màu', giaTien: 300000, trangThai: true }
];

/**
 * Component Quản lý Danh mục Dịch vụ Y tế (Cận lâm sàng)
 */
function DanhMucDichVu() {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  // Các state lưu trữ danh sách dịch vụ y tế và trạng thái thao tác
  const [dvList, setDvList] = useState([]);
  const [selectedDV, setSelectedDV] = useState(null);
  const [dvForm, setDvForm] = useState({ maDV: '', tenDV: '', giaTien: '', trangThai: true });
  const [dvFilters, setDvFilters] = useState({ maDV: '', tenDV: '' });
  const [dvPage, setDvPage] = useState(1);

  const itemsPerPage = 10;

  // Tải dữ liệu từ LocalStorage khi khởi tạo trang
  useEffect(() => {
    const storedDV = localStorage.getItem('danhMucDichVuCLS');
    if (storedDV) {
      setDvList(JSON.parse(storedDV));
    } else {
      localStorage.setItem('danhMucDichVuCLS', JSON.stringify(defaultDichVuData));
      setDvList(defaultDichVuData);
    }
  }, []);

  // Đồng bộ thông tin form khi người dùng chọn một hàng trong danh sách
  useEffect(() => {
    if (selectedDV) {
      setDvForm({
        maDV: selectedDV.maDV || '',
        tenDV: selectedDV.tenDV || '',
        giaTien: selectedDV.giaTien || '',
        trangThai: selectedDV.trangThai !== undefined ? selectedDV.trangThai : true
      });
    } else {
      setDvForm({ maDV: '', tenDV: '', giaTien: '', trangThai: true });
    }
  }, [selectedDV]);

  // Hàm lọc tìm kiếm theo mã hoặc tên dịch vụ
  const filteredDV = dvList.filter(item => 
    (item.maDV || '').toLowerCase().includes(dvFilters.maDV.toLowerCase()) &&
    (item.tenDV || '').toLowerCase().includes(dvFilters.tenDV.toLowerCase())
  );

  // Tính toán phân trang cho danh sách hiển thị
  const totalDvPages = Math.max(1, Math.ceil(filteredDV.length / itemsPerPage));
  const activeDvPage = Math.min(dvPage, totalDvPages);
  const dvStartIdx = (activeDvPage - 1) * itemsPerPage;
  const displayedDV = filteredDV.slice(dvStartIdx, dvStartIdx + itemsPerPage);

  // Thay đổi bộ lọc tìm kiếm và reset trang về 1
  const handleDvFilterChange = (key, val) => {
    setDvFilters({ ...dvFilters, [key]: val });
    setDvPage(1);
  };

  // Khởi tạo một dịch vụ mới với mã tăng tự động
  const handleAddNewDv = () => {
    const nextNum = dvList.length + 1;
    const newCode = `DV${String(nextNum).padStart(3, '0')}`;
    setSelectedDV({ maDV: newCode, tenDV: '', giaTien: 100000, trangThai: true, isNew: true });
  };

  // Xử lý lưu thông tin (Thêm mới hoặc Cập nhật)
  const handleSaveDv = (e) => {
    e.preventDefault();
    if (!dvForm.maDV.trim()) {
      showError('Vui lòng nhập Mã dịch vụ!');
      return;
    }
    if (!dvForm.tenDV.trim()) {
      showError('Vui lòng nhập Tên dịch vụ y tế!');
      return;
    }
    if (dvForm.giaTien === '' || isNaN(dvForm.giaTien) || parseFloat(dvForm.giaTien) < 0) {
      showError('Giá tiền dịch vụ phải là một số dương hợp lệ!');
      return;
    }

    const updatedRecord = {
      maDV: dvForm.maDV.trim().toUpperCase(),
      tenDV: dvForm.tenDV.trim(),
      giaTien: parseFloat(dvForm.giaTien),
      trangThai: dvForm.trangThai
    };

    let newList = [];
    if (selectedDV?.isNew) {
      const exists = dvList.some(item => item.maDV.toUpperCase() === updatedRecord.maDV);
      if (exists) {
        showError('Mã dịch vụ này đã tồn tại trong danh mục!');
        return;
      }
      newList = [...dvList, updatedRecord];
    } else {
      newList = dvList.map(item => item.maDV === selectedDV.maDV ? updatedRecord : item);
    }

    setDvList(newList);
    localStorage.setItem('danhMucDichVuCLS', JSON.stringify(newList));
    setSelectedDV(updatedRecord);
    showSuccess('Lưu danh mục dịch vụ cận lâm sàng thành công!');
  };

  // Xóa dịch vụ y tế khỏi danh mục
  const handleDeleteDv = (maDV) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa dịch vụ ${maDV} khỏi danh mục?`)) {
      const newList = dvList.filter(item => item.maDV !== maDV);
      setDvList(newList);
      localStorage.setItem('danhMucDichVuCLS', JSON.stringify(newList));
      if (selectedDV && selectedDV.maDV === maDV) {
        setSelectedDV(null);
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
          <Activity size={18} style={{ marginRight: '6px' }} />
          <strong>Danh mục dịch vụ y tế (CLS)</strong>
        </div>
        <div style={styles.topbarRight}>
          <span>Trang chủ / Quản lý danh mục / Dịch vụ y tế (CLS)</span>
        </div>
      </div>

      {/* Vùng làm việc chính */}
      <div className="kb-body" style={styles.body}>
        
        {/* CỘT TRÁI: Bảng danh sách dịch vụ */}
        <div style={styles.leftCol}>
          <div style={styles.panelHeader}>
            <div style={styles.panelTitleContainer}>
              <Activity size={16} style={{ color: 'var(--primary)' }} />
              <h3 style={styles.panelTitleText}>
                DANH SÁCH KỸ THUẬT & DỊCH VỤ CẬN LÂM SÀNG
              </h3>
            </div>
            <button 
              onClick={handleAddNewDv}
              className="btn-primary" 
              style={styles.addBtn}
            >
              <Plus size={14} /> Thêm danh mục
            </button>
          </div>

          {/* Container chứa bảng cuộn */}
          <div style={styles.tableContainer}>
            <table className="kb-table" style={styles.table}>
              <thead>
                <tr style={styles.tableHeaderRow}>
                  <th style={styles.thStt}>STT</th>
                  <th style={styles.thMa}>Mã dịch vụ</th>
                  <th style={{ padding: '8px' }}>Tên dịch vụ kỹ thuật y tế</th>
                  <th style={styles.thGia}>Giá niêm yết (đ)</th>
                  <th style={styles.thTrangThai}>Trạng thái</th>
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
                      value={dvFilters.maDV}
                      onChange={e => handleDvFilterChange('maDV', e.target.value)}
                    />
                  </td>
                  <td style={styles.tdPadding4}>
                    <input 
                      type="text" 
                      placeholder="Lọc tên dịch vụ..." 
                      className="form-input" 
                      style={styles.filterInput}
                      value={dvFilters.tenDV}
                      onChange={e => handleDvFilterChange('tenDV', e.target.value)}
                    />
                  </td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
              </thead>
              <tbody>
                {displayedDV.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={styles.noDataTd}>
                      Không tìm thấy dịch vụ nào khớp với bộ lọc.
                    </td>
                  </tr>
                ) : (
                  displayedDV.map((item, idx) => {
                    const isSelected = selectedDV && selectedDV.maDV === item.maDV;
                    return (
                      <tr 
                        key={item.maDV}
                        className="kb-table-row"
                        style={{ 
                          backgroundColor: isSelected ? 'var(--primary-light)' : 'transparent',
                          cursor: 'pointer',
                          transition: 'background-color 0.15s'
                        }}
                        onClick={() => setSelectedDV(item)}
                      >
                        <td style={styles.tdStt}>
                          {dvStartIdx + idx + 1}
                        </td>
                        <td style={styles.tdMa}>
                          {item.maDV}
                        </td>
                        <td style={styles.tdTen}>{item.tenDV}</td>
                        <td style={styles.tdGia}>
                          {item.giaTien.toLocaleString('vi-VN')}
                        </td>
                        <td style={styles.tdStatus}>
                          {item.trangThai ? (
                            <span style={styles.badgeActive}>
                              <Check size={12} /> Áp dụng
                            </span>
                          ) : (
                            <span style={styles.badgeInactive}>
                              <X size={12} /> Tạm ngừng
                            </span>
                          )}
                        </td>
                        <td style={styles.tdXoa}>
                          <button 
                            className="kb-icon-btn kb-icon-btn--danger"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteDv(item.maDV);
                            }}
                            title="Xóa dịch vụ CLS"
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

          {/* Bộ điều khiển phân trang */}
          <div style={styles.pagination}>
            <span style={{ color: 'var(--text-muted)' }}>
              Hiển thị từ <b>{dvStartIdx + 1}</b> đến <b>{Math.min(dvStartIdx + itemsPerPage, filteredDV.length)}</b> trong tổng số <b>{filteredDV.length}</b> dịch vụ
            </span>
            <div style={{ display: 'flex', gap: '5px' }}>
              <button 
                disabled={dvPage === 1}
                onClick={() => setDvPage(p => p - 1)}
                style={{
                  ...styles.pageBtn,
                  backgroundColor: dvPage === 1 ? '#f3f4f6' : '#ffffff',
                  cursor: dvPage === 1 ? 'not-allowed' : 'pointer'
                }}
              >
                Trước
              </button>
              <span style={styles.pageIndicator}>
                Trang {dvPage} / {totalDvPages}
              </span>
              <button 
                disabled={dvPage === totalDvPages}
                onClick={() => setDvPage(p => p + 1)}
                style={{
                  ...styles.pageBtn,
                  backgroundColor: dvPage === totalDvPages ? '#f3f4f6' : '#ffffff',
                  cursor: dvPage === totalDvPages ? 'not-allowed' : 'pointer'
                }}
              >
                Sau
              </button>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: Form biểu mẫu nhập liệu chi tiết */}
        <div style={styles.rightCol}>
          <div style={styles.formHeader}>
            <Database size={16} />
            <span>CHI TIẾT DỊCH VỤ Y TẾ (CLS)</span>
          </div>

          <div style={styles.formArea}>
            {selectedDV === null ? (
              <div style={styles.noSelectedDv}>
                <Activity size={32} style={styles.noSelectedIcon} />
                <p style={{ fontSize: '13px' }}>Chọn một dịch vụ cận lâm sàng hoặc click nút <b>"Thêm danh mục"</b> để tạo mới.</p>
              </div>
            ) : (
              <form onSubmit={handleSaveDv} style={styles.form}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={styles.formSection}>
                    <h4 style={styles.formSectionTitle}>
                      DỊCH VỤ CẬN LÂM SÀNG & XÉT NGHIỆM
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: '12.5px' }}>Mã dịch vụ y tế <span style={{ color: 'red' }}>*</span></label>
                        <input 
                          type="text" 
                          className="form-input" 
                          placeholder="Ví dụ: DV001, XQ001..."
                          value={dvForm.maDV}
                          onChange={e => setDvForm({ ...dvForm, maDV: e.target.value })}
                          required
                          disabled={!selectedDV.isNew}
                          style={styles.maInput}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: '12.5px' }}>Tên dịch vụ kỹ thuật <span style={{ color: 'red' }}>*</span></label>
                        <input 
                          type="text" 
                          className="form-input" 
                          placeholder="Ví dụ: Siêu âm tim màu..."
                          value={dvForm.tenDV}
                          onChange={e => setDvForm({ ...dvForm, tenDV: e.target.value })}
                          required
                          style={styles.formInputCommon}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: '12.5px' }}>Đơn giá niêm yết (VNĐ) <span style={{ color: 'red' }}>*</span></label>
                        <input 
                          type="number" 
                          className="form-input" 
                          placeholder="Nhập giá tiền dịch vụ..."
                          value={dvForm.giaTien}
                          onChange={e => setDvForm({ ...dvForm, giaTien: e.target.value })}
                          required
                          style={styles.formInputCommon}
                        />
                      </div>
                      <div className="form-group" style={styles.checkboxGroup}>
                        <input 
                          type="checkbox" 
                          id="trangThaiDV"
                          checked={dvForm.trangThai}
                          onChange={e => setDvForm({ ...dvForm, trangThai: e.target.checked })}
                          style={styles.checkbox}
                        />
                        <label htmlFor="trangThaiDV" style={styles.checkboxLabel}>
                          Đang áp dụng cung cấp tại phòng khám
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Các nút Lưu/Hủy */}
                <div style={styles.formActionGroup}>
                  <button type="submit" className="btn-primary" style={styles.saveBtn}>
                    <Save size={16} /> Lưu thông tin [F4]
                  </button>
                  <button type="button" onClick={() => setSelectedDV(null)} className="btn-outline" style={styles.cancelBtn}>
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

// Cấu hình CSS inline cho giao diện DanhMucDichVu
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
  addBtn: { height: '32px', fontSize: '12.5px', padding: '0 12px', display: 'flex', alignItems: 'center', gap: '4px' },
  tableContainer: { flex: 1, overflowY: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
  tableHeaderRow: { position: 'sticky', top: 0, zIndex: 10, background: 'var(--bg-main)', borderBottom: '2px solid var(--border-color)' },
  thStt: { width: '50px', textAlign: 'center', padding: '8px' },
  thMa: { width: '150px', padding: '8px' },
  thGia: { width: '150px', padding: '8px', textAlign: 'right' },
  thTrangThai: { width: '120px', padding: '8px', textAlign: 'center' },
  thXoa: { width: '60px', padding: '8px', textAlign: 'center' },
  filterRow: { backgroundColor: 'var(--bg-main)', borderBottom: '1px solid var(--border-color)' },
  tdPadding4: { padding: '4px' },
  filterInput: { height: '26px', fontSize: '12px', padding: '2px 6px' },
  noDataTd: { textAlign: 'center', padding: '30px', color: 'var(--text-muted)' },
  tdStt: { textAlign: 'center', padding: '10px 8px', fontWeight: '500', color: 'var(--text-muted)' },
  tdMa: { fontWeight: '700', color: 'var(--primary-hover)', padding: '10px 8px' },
  tdTen: { fontWeight: '500', padding: '10px 8px' },
  tdGia: { textAlign: 'right', fontWeight: '700', padding: '10px 8px', color: '#0052cc' },
  tdStatus: { padding: '10px 8px', textAlign: 'center' },
  badgeActive: { color: '#10b981', fontWeight: '600', fontSize: '11.5px', display: 'inline-flex', alignItems: 'center', gap: '3px', backgroundColor: '#d1fae5', padding: '2px 8px', borderRadius: '10px' },
  badgeInactive: { color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '11.5px', display: 'inline-flex', alignItems: 'center', gap: '3px', backgroundColor: '#e5e7eb', padding: '2px 8px', borderRadius: '10px' },
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
  noSelectedDv: { height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', textAlign: 'center', gap: '8px' },
  noSelectedIcon: { opacity: 0.4, marginBottom: '8px', color: 'var(--primary)' },
  form: { height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' },
  formSection: { borderBottom: '1px dashed var(--border-color)', paddingBottom: '16px' },
  formSectionTitle: { fontSize: '13px', fontWeight: '700', color: 'var(--primary)', marginBottom: '12px' },
  maInput: { height: '34px', fontSize: '13px', paddingLeft: '12px', textTransform: 'uppercase' },
  formInputCommon: { height: '34px', fontSize: '13px', paddingLeft: '12px' },
  checkboxGroup: { display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' },
  checkbox: { width: '16px', height: '16px', cursor: 'pointer' },
  checkboxLabel: { fontSize: '13px', fontWeight: '600', color: 'var(--text-main)', cursor: 'pointer' },
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

export default DanhMucDichVu;
