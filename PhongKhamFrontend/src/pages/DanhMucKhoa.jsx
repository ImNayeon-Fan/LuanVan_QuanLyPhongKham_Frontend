import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Search, Plus, Trash2, Save, Database, 
  Users, User, Award
} from 'lucide-react';
import { apiGetStaffList } from '../utils/api';
import { useToast } from '../utils/ToastContext';

// Danh sách khoa mặc định
const DEFAULT_KHOA = [
  { maKhoa: 'KHOA01', tenKhoa: 'Nội tổng quát' },
  { maKhoa: 'KHOA02', tenKhoa: 'Tim mạch' },
  { maKhoa: 'KHOA03', tenKhoa: 'Nhi khoa' },
  { maKhoa: 'KHOA04', tenKhoa: 'Tai Mũi Họng' }
];

/**
 * Component Quản lý Danh mục Khoa / Chuyên môn
 */
function DanhMucKhoa() {
  const navigate = useNavigate();
  const { showSuccess, showError, showWarning } = useToast();

  // Các state lưu danh sách khoa, danh sách bác sĩ, và khoa đang chọn
  const [khoaList, setKhoaList] = useState([]);
  const [doctorsList, setDoctorsList] = useState([]); // Chỉ chứa nhân sự có vai trò bác sĩ
  const [selectedKhoa, setSelectedKhoa] = useState(null);
  
  const [khoaForm, setKhoaForm] = useState({ maKhoa: '', tenKhoa: '' });
  const [searchQuery, setSearchQuery] = useState('');

  // Tải danh mục khoa và bác sĩ khi component mount
  useEffect(() => {
    loadKhoaList();
    loadDoctors();
  }, []);

  // Đồng bộ form khi người dùng chọn khoa thay đổi
  useEffect(() => {
    if (selectedKhoa) {
      setKhoaForm({
        maKhoa: selectedKhoa.maKhoa,
        tenKhoa: selectedKhoa.tenKhoa
      });
    } else {
      setKhoaForm({ maKhoa: '', tenKhoa: '' });
    }
  }, [selectedKhoa]);

  // Tải danh mục khoa từ localStorage
  const loadKhoaList = () => {
    try {
      const stored = localStorage.getItem('danhMucKhoa');
      if (stored) {
        setKhoaList(JSON.parse(stored));
      } else {
        localStorage.setItem('danhMucKhoa', JSON.stringify(DEFAULT_KHOA));
        setKhoaList(DEFAULT_KHOA);
      }
    } catch (e) {
      console.error(e);
      setKhoaList(DEFAULT_KHOA);
    }
  };

  // Tải danh sách bác sĩ từ hệ thống Backend API
  const loadDoctors = async () => {
    try {
      const response = await apiGetStaffList('active', 1, 1000);
      if (response && response.data) {
        // Lọc nhân viên có vai trò bác sĩ (roleID === 2 hoặc roleName === 'BacSi')
        const docs = response.data.filter(s => s.roleID === 2 || s.roleName === 'BacSi');
        setDoctorsList(docs);
      }
    } catch (err) {
      console.warn('Lỗi tải bác sĩ từ API:', err);
    }
  };

  // Đếm số bác sĩ thuộc một khoa (dựa theo tên khoa chuyên môn)
  const getDoctorCount = (tenKhoa) => {
    return doctorsList.filter(d => (d.chuyenMon || '').toLowerCase() === tenKhoa.toLowerCase()).length;
  };

  // Lấy danh sách bác sĩ thuộc khoa được chọn
  const getDoctorsInKhoa = (tenKhoa) => {
    return doctorsList.filter(d => (d.chuyenMon || '').toLowerCase() === tenKhoa.toLowerCase());
  };

  // Khởi tạo thêm mới khoa phòng với mã khoa tự tăng
  const handleAddNew = () => {
    const nextIdx = khoaList.length + 1;
    const khoaNumbers = khoaList
      .map(k => k.maKhoa)
      .filter(id => /^KHOA\d+$/i.test(id))
      .map(id => parseInt(id.replace(/^KHOA/i, ''), 10));
    const nextNum = khoaNumbers.length > 0 ? Math.max(...khoaNumbers) + 1 : nextIdx;
    const newCode = `KHOA${String(nextNum).padStart(2, '0')}`;

    setSelectedKhoa({
      maKhoa: newCode,
      tenKhoa: '',
      isNew: true
    });
  };

  // Lưu thông tin khoa (Thêm mới hoặc Cập nhật)
  const handleSave = (e) => {
    e.preventDefault();
    const { maKhoa, tenKhoa } = khoaForm;

    if (!tenKhoa.trim()) {
      showError('Vui lòng nhập Tên khoa / Chuyên môn!');
      return;
    }

    const updatedRecord = {
      maKhoa: maKhoa.trim().toUpperCase(),
      tenKhoa: tenKhoa.trim()
    };

    let newList = [];
    try {
      if (selectedKhoa?.isNew) {
        // Kiểm tra trùng tên khoa hoặc mã khoa
        const isDuplicateCode = khoaList.some(k => k.maKhoa === updatedRecord.maKhoa);
        const isDuplicateName = khoaList.some(k => k.tenKhoa.toLowerCase() === updatedRecord.tenKhoa.toLowerCase());

        if (isDuplicateCode) {
          showError('Mã khoa này đã tồn tại trong danh mục!');
          return;
        }
        if (isDuplicateName) {
          showWarning('Tên khoa / Chuyên môn này đã tồn tại!');
          return;
        }

        newList = [...khoaList, updatedRecord];
        showSuccess('Thêm mới khoa thành công!');
      } else {
        // Cập nhật tên khoa
        const isDuplicateName = khoaList.some(k => 
          k.tenKhoa.toLowerCase() === updatedRecord.tenKhoa.toLowerCase() && 
          k.maKhoa !== updatedRecord.maKhoa
        );
        if (isDuplicateName) {
          showWarning('Tên khoa / Chuyên môn khác đã sử dụng tên này!');
          return;
        }

        newList = khoaList.map(k => k.maKhoa === selectedKhoa.maKhoa ? updatedRecord : k);
        showSuccess('Cập nhật thông tin khoa thành công!');
      }

      localStorage.setItem('danhMucKhoa', JSON.stringify(newList));
      setKhoaList(newList);
      setSelectedKhoa(updatedRecord);
    } catch (err) {
      showError('Không thể lưu thông tin khoa!');
    }
  };

  // Xóa khoa khỏi danh mục (Chỉ cho phép xóa khi không có bác sĩ trực thuộc)
  const handleDelete = (maKhoa, tenKhoa) => {
    const docCount = getDoctorCount(tenKhoa);
    if (docCount > 0) {
      showError(`Không thể xóa khoa này vì đang có ${docCount} bác sĩ đang trực thuộc!`);
      return;
    }

    if (window.confirm(`Bạn có chắc chắn muốn xóa khoa: ${tenKhoa} (Mã: ${maKhoa})?`)) {
      try {
        const newList = khoaList.filter(k => k.maKhoa !== maKhoa);
        localStorage.setItem('danhMucKhoa', JSON.stringify(newList));
        setKhoaList(newList);
        if (selectedKhoa && selectedKhoa.maKhoa === maKhoa) {
          setSelectedKhoa(null);
        }
        showSuccess('Xóa khoa thành công!');
      } catch (err) {
        showError('Không thể xóa khoa!');
      }
    }
  };

  // Bộ lọc tìm kiếm khoa
  const filteredKhoa = khoaList.filter(k => 
    (k.maKhoa || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (k.tenKhoa || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <strong>Danh mục Khoa / Chuyên môn</strong>
        </div>
        <div style={styles.topbarRight}>
          <span>Trang chủ / Danh mục dùng chung / Quản lý khoa</span>
        </div>
      </div>

      {/* Vùng làm việc chính */}
      <div className="kb-body" style={styles.body}>
        
        {/* CỘT TRÁI: Bảng danh sách Khoa */}
        <div style={styles.leftCol}>
          {/* Header Action row */}
          <div style={styles.panelHeader}>
            <div style={styles.panelTitleContainer}>
              <Database size={16} style={{ color: 'var(--primary)' }} />
              <h3 style={styles.panelTitleText}>
                Danh sách khoa phòng chuyên môn
              </h3>
            </div>
            <button
              onClick={handleAddNew}
              className="btn-primary"
              style={styles.addBtn}
            >
              <Plus size={14} /> Thêm mới
            </button>
          </div>

          {/* Ô tìm kiếm khoa */}
          <div style={styles.searchContainer}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Tìm khoa theo mã hoặc tên..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
                style={styles.searchInput}
              />
              <Search size={14} style={styles.searchIcon} />
            </div>
          </div>

          {/* Bảng danh sách khoa cuộn được */}
          <div style={styles.tableContainer}>
            <table className="kb-table" style={styles.table}>
              <thead>
                <tr style={styles.tableHeaderRow}>
                  <th style={styles.thStt}>STT</th>
                  <th style={styles.thMa}>Mã khoa</th>
                  <th style={{ padding: '8px' }}>Tên khoa phòng / Chuyên môn</th>
                  <th style={styles.thDocCount}>Số lượng Bác sĩ</th>
                  <th style={styles.thXoa}>Xóa</th>
                </tr>
              </thead>
              <tbody>
                {filteredKhoa.map((k, idx) => (
                  <tr 
                    key={k.maKhoa}
                    onClick={() => setSelectedKhoa(k)}
                    className={selectedKhoa?.maKhoa === k.maKhoa ? 'kb-patient-item--active' : ''}
                    style={{ 
                      borderBottom: '1px solid var(--border-color)', 
                      cursor: 'pointer',
                      backgroundColor: selectedKhoa?.maKhoa === k.maKhoa ? 'var(--primary-light)' : 'transparent'
                    }}
                  >
                    <td style={{ textAlign: 'center', padding: '8px' }}>{idx + 1}</td>
                    <td style={{ padding: '8px', fontWeight: '600' }}>{k.maKhoa}</td>
                    <td style={{ padding: '8px', fontWeight: '700' }}>{k.tenKhoa}</td>
                    <td style={styles.tdDocCount}>
                      {getDoctorCount(k.tenKhoa)} bác sĩ
                    </td>
                    <td style={{ padding: '8px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleDelete(k.maKhoa, k.tenKhoa)}
                        className="btn-danger"
                        style={styles.deleteBtn}
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* CỘT PHẢI: Form chi tiết & danh sách bác sĩ thuộc khoa */}
        <div style={styles.rightCol}>
          {selectedKhoa === null ? (
            <div style={styles.noSelected}>
              <Award size={48} style={styles.noSelectedIcon} />
              <div>
                <h4 style={{ fontWeight: '600', color: 'var(--text-main)' }}>Chưa chọn khoa chuyên môn</h4>
                <p style={{ fontSize: '13px', marginTop: '4px', maxWidth: '300px' }}>
                  Vui lòng chọn một khoa từ bảng danh sách bên trái hoặc bấm "Thêm mới" để cập nhật thông tin.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSave} style={styles.form}>
              <div style={styles.formArea}>
                <h4 style={styles.formSectionTitle}>
                  <Award size={16} /> CHI TIẾT KHOA PHÒNG & CHUYÊN MÔN
                </h4>

                <div style={styles.formRow}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '12.5px' }}>Mã khoa phòng <span style={{ color: 'red' }}>*</span></label>
                    <input
                      type="text"
                      className="form-input"
                      value={khoaForm.maKhoa}
                      onChange={e => setKhoaForm({ ...khoaForm, maKhoa: e.target.value })}
                      required
                      disabled={true}
                      style={{ height: '34px', fontSize: '13px' }}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '12.5px' }}>Tên khoa / Chuyên môn <span style={{ color: 'red' }}>*</span></label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Nhập tên khoa phòng..."
                      value={khoaForm.tenKhoa}
                      onChange={e => setKhoaForm({ ...khoaForm, tenKhoa: e.target.value })}
                      required
                      style={{ height: '34px', fontSize: '13px' }}
                    />
                  </div>
                </div>

                {/* Danh sách Bác sĩ thuộc khoa phòng */}
                {!selectedKhoa.isNew && (
                  <div style={{ marginTop: '20px' }}>
                    <h4 style={styles.doctorSectionTitle}>
                      <Users size={16} style={{ color: 'var(--primary)' }} />
                      Danh sách Bác sĩ thuộc khoa ({getDoctorsInKhoa(selectedKhoa.tenKhoa).length})
                    </h4>
                    
                    {getDoctorsInKhoa(selectedKhoa.tenKhoa).length === 0 ? (
                      <div style={styles.noDoctors}>
                        Khoa này hiện tại chưa có bác sĩ trực thuộc.
                      </div>
                    ) : (
                      <div style={styles.doctorScrollList}>
                        {getDoctorsInKhoa(selectedKhoa.tenKhoa).map((doc) => (
                          <div key={doc.maNV} style={styles.doctorItem}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <User size={14} style={{ color: 'var(--primary)' }} />
                              <div>
                                <strong style={{ color: 'var(--text-main)' }}>{doc.hoTen}</strong>
                                <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>Mã NV: {doc.maNV} | ĐT: {doc.sdt}</div>
                              </div>
                            </div>
                            <span className="status-badge status-active">Hoạt động</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Các nút Hủy/Lưu của Form */}
              <div style={styles.formActionGroup}>
                <button
                  type="button"
                  onClick={() => setSelectedKhoa(null)}
                  className="btn-outline"
                  style={styles.cancelBtn}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={styles.saveBtn}
                >
                  <Save size={14} style={{ marginRight: '6px' }} /> Lưu
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}

// Cấu hình CSS inline cho giao diện DanhMucKhoa
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
  panelTitleText: { fontSize: '14.5px', fontWeight: '750', color: 'var(--text-main)', margin: 0 },
  addBtn: { height: '32px', fontSize: '12.5px', padding: '0 12px', display: 'flex', alignItems: 'center', gap: '4px', width: 'auto', marginTop: 0, margin: 0 },
  searchContainer: { padding: '8px 16px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)' },
  searchInput: { height: '30px', fontSize: '12.5px', paddingLeft: '30px' },
  searchIcon: { position: 'absolute', left: '8px', top: '8px', color: 'var(--text-muted)' },
  tableContainer: { flex: 1, overflowY: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
  tableHeaderRow: { position: 'sticky', top: 0, zIndex: 10, background: 'var(--bg-main)', borderBottom: '2px solid var(--border-color)' },
  thStt: { width: '50px', textAlign: 'center', padding: '8px' },
  thMa: { width: '120px', padding: '8px' },
  thDocCount: { width: '130px', padding: '8px', textAlign: 'center' },
  thXoa: { width: '60px', padding: '8px', textAlign: 'center' },
  tdDocCount: { padding: '8px', textAlign: 'center', fontWeight: '600', color: 'var(--primary)' },
  deleteBtn: { padding: '4px 8px', margin: 0, height: 'auto', display: 'inline-flex' },
  rightCol: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
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
  formArea: { display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px', flex: 1, overflowY: 'auto' },
  formSectionTitle: { fontSize: '13.5px', fontWeight: '750', color: 'var(--primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' },
  formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 16px' },
  doctorSectionTitle: { fontSize: '13px', fontWeight: '750', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' },
  noDoctors: { padding: '16px', border: '1px dashed var(--border-color)', borderRadius: '8px', color: 'var(--text-muted)', fontSize: '12.5px', textAlign: 'center' },
  doctorScrollList: { display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' },
  doctorItem: {
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '10px 14px',
    fontSize: '12.5px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'var(--bg-main)'
  },
  formActionGroup: {
    padding: '12px 20px',
    borderTop: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-main)',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px'
  },
  cancelBtn: { height: '34px', fontSize: '13px', margin: 0, padding: '0 16px', display: 'flex', alignItems: 'center' },
  saveBtn: { height: '34px', fontSize: '13px', margin: 0, padding: '0 20px', display: 'flex', alignItems: 'center', width: 'auto', marginTop: 0 }
};

export default DanhMucKhoa;
