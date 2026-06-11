import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Search, User, Stethoscope, FlaskConical,
  Pill, ClipboardCheck, Plus, Trash2, Save, ChevronRight
} from 'lucide-react';
import { useToast } from '../utils/ToastContext';

// Khớp với PhieuKham.TrangThaiKham trong C# SQL Database
const trangThaiLabel = {
  0: { label: 'Chờ khám',   color: '#f59e0b', bg: '#fef3c7' },
  1: { label: 'Đang khám',  color: '#0ea5e9', bg: '#e0f2fe' },
  2: { label: 'Chờ CLS',    color: '#8b5cf6', bg: '#ede9fe' },
  3: { label: 'Hoàn thành', color: '#22c55e', bg: '#dcfce7' },
};

// Hàm cảnh báo chỉ số sinh hiệu bất thường phục vụ việc chăm sóc bệnh nhân
const getSinhHieuWarning = (key, value) => {
  if (!value) return '';
  
  if (key === 'huyetAp') {
    const cleanVal = value.trim();
    const parts = cleanVal.split('/');
    if (parts.length !== 2 || isNaN(parts[0].trim()) || isNaN(parts[1].trim()) || !parts[0].trim() || !parts[1].trim()) {
      return 'Huyết áp không đúng định dạng (VD: 120/80)';
    }
    const sbp = parseFloat(parts[0]);
    const dbp = parseFloat(parts[1]);
    if (sbp >= 140 || dbp >= 90) {
      return 'Huyết áp cao (≥ 140/90 mmHg)';
    }
    if (sbp < 90 || dbp < 60) {
      return 'Huyết áp thấp (< 90/60 mmHg)';
    }
    return '';
  }

  const num = parseFloat(value);
  if (isNaN(num)) {
    return 'Vui lòng nhập số hợp lệ';
  }

  switch (key) {
    case 'mach':
      if (num < 60) return 'Mạch chậm (< 60 lần/phút)';
      if (num > 100) return 'Mạch nhanh (> 100 lần/phút)';
      break;
    case 'nhietDo':
      if (num < 36.0) return 'Thân nhiệt thấp (< 36.0 °C)';
      if (num > 37.5) return 'Sốt (> 37.5 °C)';
      break;
    case 'spo2':
      if (num < 95) return 'SpO2 thấp (< 95%)';
      if (num > 100) return 'SpO2 không hợp lệ (> 100%)';
      break;
    case 'nhipTho':
      if (num < 12) return 'Nhịp thở chậm (< 12 lần/phút)';
      if (num > 20) return 'Nhịp thở nhanh (> 20 lần/phút)';
      break;
    default:
      return '';
  }
  return '';
};

// Danh mục menu điều hướng cột phải
const MENU_ITEMS = [
  { key: 'sinhHieu',  label: 'Thông tin khám cơ bản',     icon: <Stethoscope size={18} /> },
  { key: 'chiDinh',   label: 'Chỉ định cận lâm sàng',     icon: <FlaskConical size={18} /> },
  { key: 'donThuoc',  label: 'Đơn thuốc',                  icon: <Pill size={18} /> },
  { key: 'ketLuan',   label: 'Kết luận khám',              icon: <ClipboardCheck size={18} /> },
];

/**
 * Component Khám bệnh dành cho bác sĩ tại phòng khám
 */
function KhamBenh() {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [search, setSearch]       = useState('');

  // Tải danh sách bệnh nhân chờ khám từ LocalStorage
  const [dsBenhNhan, setDsBenhNhan] = useState(() => {
    let list = [];
    try {
      list = JSON.parse(localStorage.getItem('danhSachPhieuKham') || '[]');
    } catch(e) {
      list = [];
    }
    if (list.length === 0) {
      const defaultData = [
        {
          maPhieu: 'PK_250525_001',
          maBN: 'BN260001',
          hoTen: 'NGUYỄN VĂN AN',
          ngaySinh: '15/03/1980',
          gioiTinh: 'Nam',
          sdt: '0901234567',
          diaChi: '123 Nguyễn Trãi, Phường 2, Quận 5, TP. Hồ Chí Minh',
          tienSuBenh: 'Tăng huyết áp, Đái tháo đường typ 2',
          maBacSi: 'BS001',
          tenBacSi: 'BS. CK1. Nguyễn Văn An (Nội tổng quát)',
          lyDoKham: 'Đau đầu, chóng mặt, mệt mỏi kéo dài',
          ngayKham: '2026-05-25T12:00:00.000Z',
          trangThai: 1
        }
      ];
      localStorage.setItem('danhSachPhieuKham', JSON.stringify(defaultData));
      return defaultData;
    }
    return list;
  });

  const [selectedBN, setSelectedBN] = useState(dsBenhNhan[0] || null);
  const [activeMenu, setActiveMenu] = useState('sinhHieu');

  // Khai báo các state thông tin sinh hiệu, cận lâm sàng, đơn thuốc, kết luận
  const [sinhHieu, setSinhHieu] = useState({
    mach: '', nhietDo: '', huyetAp: '', canNang: '', chieuCao: '', spo2: '', nhipTho: ''
  });
  const [chiDinh, setChiDinh]   = useState([]);
  const [chiDinhMoi, setChiDinhMoi] = useState('');
  const [donThuoc, setDonThuoc] = useState([]);
  const [thuocMoi, setThuocMoi] = useState({ tenThuoc: '', soLuong: '', soNgay: '' });
  const [ketLuan, setKetLuan]   = useState({ chanDoan: '', loiDan: '' });

  // Cập nhật thông tin chi tiết khám bệnh mỗi khi đổi bệnh nhân
  useEffect(() => {
    if (selectedBN) {
      setSinhHieu({
        mach: selectedBN.mach || '',
        nhietDo: selectedBN.nhietDo || '',
        huyetAp: selectedBN.huyetAp || '',
        canNang: selectedBN.canNang || '',
        chieuCao: selectedBN.chieuCao || '',
        spo2: selectedBN.spo2 || '',
        nhipTho: selectedBN.nhipTho || ''
      });
      setChiDinh(selectedBN.chiDinh || []);
      setDonThuoc(selectedBN.donThuoc || []);
      setKetLuan({
        chanDoan: selectedBN.chanDoan || '',
        loiDan: selectedBN.loiDan || ''
      });
    } else {
      setSinhHieu({ mach: '', nhietDo: '', huyetAp: '', canNang: '', chieuCao: '', spo2: '', nhipTho: '' });
      setChiDinh([]);
      setDonThuoc([]);
      setKetLuan({ chanDoan: '', loiDan: '' });
    }
  }, [selectedBN]);

  // Lưu thông tin khám bệnh (đồng bộ với danh sách bệnh nhân)
  const luuPhieuKham = (updatedTrangThai = null) => {
    if (!selectedBN) return;

    const newTrangThai = updatedTrangThai !== null ? updatedTrangThai : selectedBN.trangThai;
    const updatedRecord = {
      ...selectedBN,
      ...sinhHieu,
      chiDinh,
      donThuoc,
      ...ketLuan,
      trangThai: newTrangThai
    };

    const updatedList = dsBenhNhan.map(bn => 
      bn.maPhieu === selectedBN.maPhieu ? updatedRecord : bn
    );

    setDsBenhNhan(updatedList);
    setSelectedBN(updatedRecord);

    localStorage.setItem('danhSachPhieuKham', JSON.stringify(updatedList));
    showSuccess('Đã lưu thông tin khám bệnh thành công!');
  };

  // Bộ lọc tìm kiếm bệnh nhân trong danh sách chờ
  const dsBNFilter = dsBenhNhan.filter(bn =>
    bn.hoTen.toLowerCase().includes(search.toLowerCase()) ||
    bn.maBN?.includes(search) ||
    bn.maPhieu?.includes(search)
  );

  const themChiDinh = () => {
    if (!chiDinhMoi.trim()) return;
    setChiDinh([...chiDinh, { id: Date.now(), tenXN: chiDinhMoi }]);
    setChiDinhMoi('');
  };
  const xoaChiDinh = (id) => setChiDinh(chiDinh.filter(c => c.id !== id));

  const themThuoc = () => {
    if (!thuocMoi.tenThuoc.trim()) return;
    setDonThuoc([...donThuoc, { id: Date.now(), ...thuocMoi }]);
    setThuocMoi({ tenThuoc: '', soLuong: '', soNgay: '' });
  };
  const xoaThuoc = (id) => setDonThuoc(donThuoc.filter(t => t.id !== id));

  // Render giao diện theo menu bác sĩ đang chọn
  const renderContent = () => {
    if (!selectedBN) return (
      <div className="kb-empty">
        <User size={48} style={{ color: 'var(--border-color)' }} />
        <p>Chọn bệnh nhân để bắt đầu khám</p>
      </div>
    );

    switch (activeMenu) {
      case 'sinhHieu':
        return (
          <div className="kb-content-inner">
            <div className="kb-content-title">
              <Stethoscope size={18} /> Thông tin khám cơ bản (Sinh hiệu)
            </div>

            {selectedBN.maICD ? (
              <div style={styles.icdAlertBox}>
                <span style={{ fontWeight: '600', color: '#1e40af' }}>Mã bệnh & Chẩn đoán sơ bộ (Tiếp đón):</span>
                <span style={styles.icdCodeBadge}>
                  {selectedBN.maICD}
                </span>
                <span style={{ fontWeight: '500', color: '#1e40af' }}>{selectedBN.tenBenhICD}</span>
              </div>
            ) : (
              <div style={styles.icdEmptyBox}>
                Chưa có thông tin mã bệnh ICD / Chẩn đoán sơ bộ từ khâu Tiếp đón.
              </div>
            )}

            <div className="kb-grid-2">
              {[
                { label: 'Mạch (lần/phút)',    key: 'mach',     placeholder: '' },
                { label: 'Nhiệt độ (°C)',       key: 'nhietDo',  placeholder: '' },
                { label: 'Huyết áp (mmHg)',     key: 'huyetAp',  placeholder: '' },
                { label: 'Cân nặng (kg)',        key: 'canNang',  placeholder: '' },
                { label: 'Chiều cao (cm)',       key: 'chieuCao', placeholder: '' },
                { label: 'SpO2 (%)',             key: 'spo2',     placeholder: '' },
                { label: 'Nhịp thở (lần/phút)', key: 'nhipTho',  placeholder: '' },
              ].map(f => {
                const warning = getSinhHieuWarning(f.key, sinhHieu[f.key]);
                return (
                  <div key={f.key} className="form-group">
                    <label className="form-label">{f.label}</label>
                    <input
                      type="text"
                      className={`form-input ${warning ? 'form-input-warning' : ''}`}
                      style={{ paddingLeft: 12 }}
                      placeholder={f.placeholder}
                      value={sinhHieu[f.key]}
                      onChange={e => setSinhHieu({ ...sinhHieu, [f.key]: e.target.value })}
                    />
                    {warning && <span className="form-warning">{warning}</span>}
                  </div>
                );
              })}
            </div>
            <div className="kb-action-row">
              <button className="btn-primary" onClick={() => luuPhieuKham(1)} style={styles.saveBtnCenter}>
                <Save size={16} /> Lưu sinh hiệu
              </button>
            </div>
          </div>
        );

      case 'chiDinh':
        return (
          <div className="kb-content-inner">
            <div className="kb-content-title">
              <FlaskConical size={18} /> Chỉ định cận lâm sàng
            </div>
            {chiDinh.length === 0 ? (
              <div className="kb-empty-inline">Chưa có chỉ định nào được thêm.</div>
            ) : (
              <div className="kb-list">
                {chiDinh.map((c, i) => (
                  <div key={c.id} className="kb-list-item">
                    <span className="kb-list-no">{i + 1}</span>
                    <span className="kb-list-text">{c.tenXN}</span>
                    <button className="kb-icon-btn kb-icon-btn--danger" onClick={() => xoaChiDinh(c.id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="kb-add-row" style={{ marginTop: 12 }}>
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: 12, flex: 1 }}
                placeholder="Nhập tên xét nghiệm / dịch vụ CLS..."
                value={chiDinhMoi}
                onChange={e => setChiDinhMoi(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && themChiDinh()}
              />
              <button className="kb-add-btn" onClick={themChiDinh}>
                <Plus size={16} /> Thêm
              </button>
            </div>
          </div>
        );

      case 'donThuoc':
        return (
          <div className="kb-content-inner">
            <div className="kb-content-title">
              <Pill size={18} /> Đơn thuốc
            </div>
            {donThuoc.length === 0 ? (
              <div className="kb-empty-inline">Chưa có thuốc nào được kê.</div>
            ) : (
              <table className="kb-table">
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Tên thuốc</th>
                    <th>Cách dùng</th>
                    <th>Số ngày</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {donThuoc.map((t, i) => (
                    <tr key={t.id}>
                      <td>{i + 1}</td>
                      <td>{t.tenThuoc}</td>
                      <td>{t.soLuong}</td>
                      <td>{t.soNgay} ngày</td>
                      <td>
                        <button className="kb-icon-btn kb-icon-btn--danger" onClick={() => xoaThuoc(t.id)}>
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <div className="kb-add-row" style={styles.addMedRow}>
              <input type="text" className="form-input" style={styles.medInputText}
                placeholder="Tên thuốc..." value={thuocMoi.tenThuoc}
                onChange={e => setThuocMoi({ ...thuocMoi, tenThuoc: e.target.value })} />
              <input type="text" className="form-input" style={styles.medInputQty}
                placeholder="Cách dùng (VD: 1 viên x 3 lần)" value={thuocMoi.soLuong}
                onChange={e => setThuocMoi({ ...thuocMoi, soLuong: e.target.value })} />
              <input type="number" className="form-input" style={styles.medInputDays}
                placeholder="Số ngày" value={thuocMoi.soNgay}
                onChange={e => setThuocMoi({ ...thuocMoi, soNgay: e.target.value })} />
              <button className="kb-add-btn" onClick={themThuoc}><Plus size={16} /> Thêm</button>
            </div>
          </div>
        );

      case 'ketLuan':
        return (
          <div className="kb-content-inner">
            <div className="kb-content-title">
              <ClipboardCheck size={18} /> Kết luận khám
            </div>
            <div className="form-group">
              <div style={styles.diagnosisLabelRow}>
                <label className="form-label" style={{ margin: 0 }}>Chẩn đoán</label>
                {selectedBN.maICD && (
                  <button 
                    type="button"
                    onClick={() => setKetLuan({ ...ketLuan, chanDoan: `${selectedBN.maICD} - ${selectedBN.tenBenhICD}` })}
                    style={styles.btnTakeIcd}
                  >
                    Lấy chẩn đoán tiếp đón ({selectedBN.maICD})
                  </button>
                )}
              </div>
              <textarea className="form-input kb-textarea" placeholder="Nhập chẩn đoán bệnh..."
                value={ketLuan.chanDoan} onChange={e => setKetLuan({ ...ketLuan, chanDoan: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Lời dặn / Hướng điều trị</label>
              <textarea className="form-input kb-textarea" placeholder="Nhập lời dặn cho bệnh nhân..."
                value={ketLuan.loiDan} onChange={e => setKetLuan({ ...ketLuan, loiDan: e.target.value })} />
            </div>
            <div className="kb-action-row">
              <button className="btn-outline" onClick={() => setSelectedBN(null)}>Hủy</button>
              <button className="btn-primary" onClick={() => luuPhieuKham(3)} style={styles.saveBtnCenter}>
                <Save size={16} /> Hoàn thành khám
              </button>
            </div>
          </div>
        );

      default: return null;
    }
  };

  return (
    <div className="kb-wrapper">
      {/* Thanh tiêu đề topbar */}
      <div className="kb-topbar">
        <button className="kb-back-btn" onClick={() => navigate('/')}>
          <ArrowLeft size={18} /> Quay về trang chủ
        </button>
        <div className="kb-topbar-title">
          <Stethoscope size={20} />
          <span>Khám bệnh cho bệnh nhân</span>
        </div>
        <button className="kb-save-btn" onClick={() => luuPhieuKham()}>
          <Save size={16} /> Lưu phiếu khám
        </button>
      </div>

      <div className="kb-body">

        {/* CỘT TRÁI: Danh sách bệnh nhân chờ khám */}
        <div className="kb-left">
          <div className="kb-left-search">
            <Search size={16} className="kb-search-icon" />
            <input type="text" placeholder="Tìm bệnh nhân..." value={search}
              onChange={e => setSearch(e.target.value)} className="kb-search-input" />
          </div>
          <p className="kb-section-label">Danh sách chờ khám</p>
          <div className="kb-patient-list">
            {dsBNFilter.length === 0 ? (
              <div style={styles.emptyPatientsBox}>
                <User size={32} style={styles.emptyPatientsIcon} />
                Chưa có bệnh nhân chờ khám
              </div>
            ) : (
              dsBNFilter.map(bn => {
                const ts = trangThaiLabel[bn.trangThai] ?? trangThaiLabel[0];
                const isSelected = selectedBN?.maPhieu === bn.maPhieu;
                return (
                  <div key={bn.maPhieu}
                    className={`kb-patient-item ${isSelected ? 'kb-patient-item--active' : ''}`}
                    onClick={() => setSelectedBN(bn)}>
                    <div className="kb-patient-avatar"><User size={20} /></div>
                    <div className="kb-patient-info">
                      <p className="kb-patient-name">{bn.hoTen}</p>
                      <p className="kb-patient-meta">{bn.maBN} · {bn.gioiTinh}</p>
                      <p className="kb-patient-reason">{bn.lyDoKham || '—'}</p>
                    </div>
                    <div>
                      <span className="kb-status-badge" style={{ color: ts.color, backgroundColor: ts.bg }}>{ts.label}</span>
                      {isSelected && <ChevronRight size={16} style={styles.arrowActive} />}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* CỘT GIỮA: Vùng khám bệnh chi tiết */}
        <div className="kb-center">
          {selectedBN && (
            <div className="kb-patient-header">
              <div className="kb-patient-avatar kb-patient-avatar--lg"><User size={28} /></div>
              <div>
                <h2>{selectedBN.hoTen}</h2>
                <p>{selectedBN.maBN} · {selectedBN.gioiTinh}</p>
                <p style={styles.patientReasonSub}>Lý do khám: {selectedBN.lyDoKham || '—'}</p>
              </div>
            </div>
          )}
          {renderContent()}
        </div>

        {/* CỘT PHẢI: Menu các chức năng khám */}
        <div className="kb-right-menu">
          <p className="kb-section-label" style={{ padding: '16px 14px 8px' }}>Chức năng</p>
          {MENU_ITEMS.map(item => (
            <button
              key={item.key}
              className={`kb-menu-btn ${activeMenu === item.key ? 'kb-menu-btn--active' : ''}`}
              onClick={() => { setActiveMenu(item.key); }}
            >
              <span className="kb-menu-icon">{item.icon}</span>
              <span className="kb-menu-label">{item.label}</span>
              {activeMenu === item.key && <ChevronRight size={16} style={{ marginLeft: 'auto' }} />}
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}

// Bảng cấu hình CSS Inline tối ưu hóa dung lượng của file KhamBenh
const styles = {
  icdAlertBox: {
    backgroundColor: '#eff6ff',
    border: '1px solid #bfdbfe',
    borderRadius: '6px',
    padding: '10px 14px',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px'
  },
  icdCodeBadge: { color: '#1e3a8a', backgroundColor: '#dbeafe', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' },
  icdEmptyBox: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    padding: '10px 14px',
    marginBottom: '16px',
    fontSize: '13px',
    color: 'var(--text-muted)',
    fontStyle: 'italic',
    textAlign: 'left'
  },
  saveBtnCenter: { width: 'auto', padding: '10px 24px', display: 'flex', alignItems: 'center', gap: 8 },
  addMedRow: { flexWrap: 'wrap', gap: 8, marginTop: 12 },
  medInputText: { paddingLeft: 12, flex: 2, minWidth: 160 },
  medInputQty: { paddingLeft: 12, flex: 2, minWidth: 140 },
  medInputDays: { paddingLeft: 12, flex: 1, minWidth: 80 },
  diagnosisLabelRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' },
  btnTakeIcd: {
    border: 'none',
    background: 'none',
    color: 'var(--primary)',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    textDecoration: 'underline',
    padding: 0
  },
  emptyPatientsBox: { padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 },
  emptyPatientsIcon: { margin: '0 auto 12px', display: 'block', opacity: 0.3 },
  arrowActive: { color: 'var(--primary)', marginTop: 4 },
  patientReasonSub: { color: '#6b7280', fontSize: 13 }
};

export default KhamBenh;
