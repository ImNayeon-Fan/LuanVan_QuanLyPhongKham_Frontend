import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Search, User, Clock, ChevronRight, AlertCircle, RefreshCw, ClipboardList, FileText
} from 'lucide-react';

// Cấu hình nhãn trạng thái của phiếu khám
const trangThaiLabel = {
  0: { label: 'Chờ khám',   color: '#f59e0b', bg: '#fef3c7' },
  1: { label: 'Đang khám',  color: '#0ea5e9', bg: '#e0f2fe' },
  2: { label: 'Chờ CLS',    color: '#8b5cf6', bg: '#ede9fe' },
  3: { label: 'Hoàn thành', color: '#22c55e', bg: '#dcfce7' },
};

/**
 * Component Tra cứu và Hiển thị Hồ sơ Bệnh án / Lịch sử khám của Bệnh nhân
 */
function HoSoBenhAn() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [allRecords, setAllRecords] = useState([]);
  
  // Trạng thái tìm kiếm
  const [selectedPatient, setSelectedPatient] = useState(null); // Thông tin hành chính bệnh nhân đang chọn
  const [patientHistory, setPatientHistory] = useState([]); // Danh sách các lượt khám của bệnh nhân đó
  const [searchError, setSearchError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  // Load danh sách từ localStorage khi component mount
  useEffect(() => {
    loadData();
  }, []);

  // Tải danh sách tất cả phiếu khám từ bộ nhớ LocalStorage
  const loadData = () => {
    try {
      const list = JSON.parse(localStorage.getItem('danhSachPhieuKham') || '[]');
      setAllRecords(list);
    } catch (e) {
      console.error(e);
      setAllRecords([]);
    }
  };

  // Trích xuất danh sách bệnh nhân duy nhất vừa khám gần nhất
  const getRecentPatients = () => {
    const patientsMap = {};
    const sortedRecords = [...allRecords].sort((a, b) => new Date(b.ngayKham) - new Date(a.ngayKham));
    
    sortedRecords.forEach(rec => {
      const key = rec.maBN || `${rec.hoTen}_${rec.sdt}`;
      if (!patientsMap[key]) {
        patientsMap[key] = {
          maBN: rec.maBN,
          hoTen: rec.hoTen,
          ngaySinh: rec.ngaySinh,
          gioiTinh: rec.gioiTinh,
          sdt: rec.sdt,
          diaChi: rec.diaChi,
          tienSuBenh: rec.tienSuBenh,
          lastVisit: rec.ngayKham
        };
      }
    });
    return Object.values(patientsMap).slice(0, 5); // Lấy tối đa 5 bệnh nhân gần đây
  };

  // Tìm kiếm bệnh nhân theo mã, số điện thoại, tên, hoặc mã phiếu
  const handleSearch = (e) => {
    if (e) e.preventDefault();
    setSearchError('');
    setHasSearched(true);

    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      setSearchError('Vui lòng nhập mã bệnh nhân hoặc mã hồ sơ khám bệnh!');
      setSelectedPatient(null);
      setPatientHistory([]);
      return;
    }

    const matchedRecord = allRecords.find(rec => 
      (rec.maPhieu && rec.maPhieu.toLowerCase() === query) ||
      (rec.maBN && rec.maBN.toLowerCase() === query)
    ) || allRecords.find(rec =>
      (rec.maPhieu && rec.maPhieu.toLowerCase().includes(query)) ||
      (rec.maBN && rec.maBN.toLowerCase().includes(query)) ||
      (rec.hoTen && rec.hoTen.toLowerCase().includes(query)) ||
      (rec.sdt && rec.sdt.includes(query))
    );

    if (!matchedRecord) {
      setSearchError('Không tìm thấy thông tin bệnh nhân nào trùng khớp!');
      setSelectedPatient(null);
      setPatientHistory([]);
      return;
    }

    const targetPatient = {
      maBN: matchedRecord.maBN,
      hoTen: matchedRecord.hoTen,
      ngaySinh: matchedRecord.ngaySinh,
      gioiTinh: matchedRecord.gioiTinh,
      sdt: matchedRecord.sdt,
      diaChi: matchedRecord.diaChi,
      tienSuBenh: matchedRecord.tienSuBenh
    };
    setSelectedPatient(targetPatient);

    // Lọc toàn bộ lịch sử các lượt khám cũ của bệnh nhân này
    const history = allRecords.filter(rec => {
      if (targetPatient.maBN && rec.maBN) {
        return rec.maBN === targetPatient.maBN;
      }
      return rec.hoTen === targetPatient.hoTen && rec.sdt === targetPatient.sdt;
    }).sort((a, b) => new Date(b.ngayKham) - new Date(a.ngayKham));

    setPatientHistory(history);
  };

  // Chọn nhanh bệnh nhân từ danh sách vừa tiếp nhận gần đây
  const handleSelectRecent = (pat) => {
    setSearchQuery(pat.maBN || pat.hoTen);
    setSelectedPatient({
      maBN: pat.maBN,
      hoTen: pat.hoTen,
      ngaySinh: pat.ngaySinh,
      gioiTinh: pat.gioiTinh,
      sdt: pat.sdt,
      diaChi: pat.diaChi,
      tienSuBenh: pat.tienSuBenh
    });

    const history = allRecords.filter(rec => {
      if (pat.maBN && rec.maBN) {
        return rec.maBN === pat.maBN;
      }
      return rec.hoTen === pat.hoTen && rec.sdt === pat.sdt;
    }).sort((a, b) => new Date(b.ngayKham) - new Date(a.ngayKham));

    setPatientHistory(history);
    setHasSearched(true);
    setSearchError('');
  };

  // Định dạng hiển thị ngày giờ thân thiện
  const formatTime = (isoString) => {
    if (!isoString) return '—';
    const date = new Date(isoString);
    return date.toLocaleString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit', 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  const recentPatients = getRecentPatients();

  return (
    <div className="kb-wrapper" style={styles.wrapper}>
      {/* Topbar điều hướng */}
      <div className="kb-topbar" style={styles.topbar}>
        <div style={styles.topbarLeft}>
          <button className="kb-back-btn" onClick={() => navigate('/')} style={{ padding: '5px 10px' }}>
            <ArrowLeft size={16} /> Quay lại trang chủ
          </button>
        </div>
        <div className="kb-topbar-title" style={styles.topbarTitle}>
          <ClipboardList size={18} style={{ marginRight: '6px' }} />
          <strong>Hồ sơ bệnh án & Lịch sử khám</strong>
        </div>
        <div style={styles.topbarRight}>
          <button 
            className="kb-back-btn" 
            onClick={loadData} 
            style={styles.refreshBtn}
          >
            <RefreshCw size={14} /> Làm mới
          </button>
        </div>
      </div>

      {/* Vùng thân chính */}
      <div className="kb-body" style={styles.body}>

        {/* Ô Tìm kiếm Bệnh nhân */}
        <div style={styles.searchCard}>
          <div style={{ textAlign: 'center', marginBottom: '8px' }}>
            <h2 style={styles.searchHeaderTitle}>Tra cứu lịch sử khám bệnh</h2>
            <p style={styles.searchHeaderSub}>Nhập mã bệnh nhân, mã hồ sơ khám bệnh để tra cứu toàn bộ lịch sử bệnh án</p>
          </div>

          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px' }}>
            <div style={styles.searchInputWrapper}>
              <Search size={18} style={styles.searchIcon} />
              <input
                type="text"
                className="form-input"
                style={styles.searchInput}
                placeholder="Nhập mã bệnh nhân (VD: BN260001) hoặc mã hồ sơ (VD: PK_...)"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-primary" style={styles.searchBtn}>
              <Search size={16} /> Tìm kiếm
            </button>
          </form>

          {searchError && (
            <div style={styles.errorBox}>
              <AlertCircle size={16} />
              <span>{searchError}</span>
            </div>
          )}

          {/* Gợi ý bệnh nhân tiếp nhận gần đây */}
          {recentPatients.length > 0 && (
            <div style={styles.recentPatientsSection}>
              <span style={styles.recentLabel}>
                Bệnh nhân vừa tiếp đón/khám gần đây:
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {recentPatients.map(pat => (
                  <button
                    key={pat.maBN || pat.hoTen}
                    type="button"
                    onClick={() => handleSelectRecent(pat)}
                    style={styles.recentBtn}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--primary)';
                      e.currentTarget.style.backgroundColor = 'var(--primary-light)';
                      e.currentTarget.style.color = 'var(--primary-hover)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-color)';
                      e.currentTarget.style.backgroundColor = 'var(--bg-main)';
                      e.currentTarget.style.color = 'var(--text-main)';
                    }}
                  >
                    <User size={13} style={{ color: 'var(--primary)' }} />
                    <span>{pat.hoTen}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>({pat.maBN || 'Chưa tạo'})</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Kết quả truy vấn thông tin & lịch sử các lần khám */}
        {hasSearched && selectedPatient && (
          <div style={styles.resultContainer}>
            {/* 1. Thẻ thông tin hành chính bệnh nhân */}
            <div style={styles.infoCard}>
              <div style={styles.infoCardHeader}>
                <User size={16} />
                <span>Thông tin hành chính bệnh nhân</span>
              </div>

              <div style={styles.infoGrid}>
                <div>
                  <span style={styles.infoLabel}>Họ và tên:</span>
                  <strong style={styles.infoValueName}>{selectedPatient.hoTen}</strong>
                </div>
                <div>
                  <span style={styles.infoLabel}>Mã bệnh nhân:</span>
                  <strong style={{ color: 'var(--primary)' }}>{selectedPatient.maBN || 'Chưa tạo'}</strong>
                </div>
                <div>
                  <span style={styles.infoLabel}>Ngày sinh:</span>
                  <strong style={{ color: 'var(--text-main)' }}>{selectedPatient.ngaySinh}</strong>
                </div>
                <div>
                  <span style={styles.infoLabel}>Giới tính:</span>
                  <strong style={{ color: 'var(--text-main)' }}>{selectedPatient.gioiTinh}</strong>
                </div>
                <div>
                  <span style={styles.infoLabel}>Số điện thoại:</span>
                  <strong style={{ color: 'var(--text-main)' }}>{selectedPatient.sdt}</strong>
                </div>
                <div>
                  <span style={styles.infoLabel}>Địa chỉ:</span>
                  <strong style={{ color: 'var(--text-main)' }}>{selectedPatient.diaChi || '—'}</strong>
                </div>
                {selectedPatient.tienSuBenh && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <span style={styles.infoLabel}>Tiền sử bệnh lý:</span>
                    <span style={styles.historyBadge}>
                      {selectedPatient.tienSuBenh}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* 2. Danh sách lượt khám lịch sử */}
            <div style={styles.historyCard}>
              <div style={styles.historyCardHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: '600', color: 'var(--primary)' }}>
                  <FileText size={16} />
                  <span>Lịch sử khám bệnh</span>
                </div>
                <span style={styles.historyCountBadge}>
                  Có {patientHistory.length} hồ sơ khám
                </span>
              </div>

              {patientHistory.length === 0 ? (
                <div style={styles.emptyHistory}>
                  Chưa có lịch sử khám bệnh.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {patientHistory.map((rec) => {
                    const st = trangThaiLabel[rec.trangThai] || trangThaiLabel[0];
                    return (
                      <div
                        key={rec.maPhieu}
                        onClick={() => navigate(`/ho-so-chi-tiet/${rec.maPhieu}`)}
                        style={styles.historyItem}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = 'var(--primary)';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                          e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'var(--border-color)';
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--primary)' }}>{rec.maPhieu}</span>
                            <span style={styles.historyItemTime}>
                              <Clock size={12} />
                              {formatTime(rec.ngayKham)}
                            </span>
                            <span style={{ 
                              fontSize: '11px', 
                              color: st.color, 
                              backgroundColor: st.bg, 
                              padding: '1.5px 6px', 
                              borderRadius: '8px', 
                              fontWeight: '600' 
                            }}>
                              {st.label}
                            </span>
                          </div>
                          <div style={{ fontSize: '13px', marginTop: '2px' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Bác sĩ khám: </span>
                            <strong style={{ color: 'var(--text-main)' }}>{rec.tenBacSi || 'Chưa phân công'}</strong>
                          </div>
                          <div style={{ fontSize: '13px' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Chẩn đoán: </span>
                            <strong style={{ color: 'var(--text-main)' }}>{rec.chanDoan || 'Chưa cập nhật'}</strong>
                          </div>
                        </div>
                        <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                          <ChevronRight size={18} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Trạng thái chưa nhập thông tin */}
        {!hasSearched && (
          <div style={styles.guideBox}>
            <FileText size={48} style={styles.guideIcon} />
            <h3 style={styles.guideTitle}>Chưa có thông tin tra cứu</h3>
            <p style={{ fontSize: '13.5px', lineHeight: '1.6' }}>Nhập mã bệnh nhân hoặc mã hồ sơ ở thanh tìm kiếm phía trên để hiển thị lịch sử bệnh án và các lượt khám tương ứng.</p>
          </div>
        )}

      </div>
    </div>
  );
}

// Cấu hình CSS inline cho giao diện HoSoBenhAn
const styles = {
  wrapper: { height: '100vh', overflow: 'hidden' },
  topbar: { height: '50px', padding: '0 20px' },
  topbarLeft: { flex: 1, display: 'flex', justifyContent: 'flex-start' },
  topbarTitle: { flex: 1, display: 'flex', justifyContent: 'center', fontSize: '15px' },
  topbarRight: { flex: 1, display: 'flex', justifyContent: 'flex-end' },
  refreshBtn: { padding: '5px 10px', display: 'flex', alignItems: 'center', gap: '4px' },
  body: {
    padding: '20px 24px',
    backgroundColor: 'var(--bg-main)',
    height: 'calc(100vh - 50px)',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  searchCard: {
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-lg)',
    padding: '24px',
    boxShadow: 'var(--shadow-sm)',
    maxWidth: '800px',
    width: '100%',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  searchHeaderTitle: { fontSize: '18px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '6px' },
  searchHeaderSub: { color: 'var(--text-muted)', fontSize: '13px' },
  searchInputWrapper: { display: 'flex', alignItems: 'center', gap: '8px', flex: 1, position: 'relative' },
  searchIcon: { position: 'absolute', left: '14px', color: 'var(--text-muted)' },
  searchInput: { paddingLeft: '40px', height: '42px', fontSize: '14px' },
  searchBtn: { width: '120px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' },
  errorBox: {
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px', 
    color: 'var(--error)', 
    fontSize: '13.5px', 
    backgroundColor: '#fee2e2', 
    padding: '10px 14px', 
    borderRadius: 'var(--radius-md)',
    fontWeight: '500'
  },
  recentPatientsSection: { borderTop: '1px solid var(--border-color)', paddingTop: '14px' },
  recentLabel: { fontSize: '12.5px', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' },
  recentBtn: {
    padding: '6px 12px',
    backgroundColor: 'var(--bg-main)',
    border: '1px solid var(--border-color)',
    borderRadius: '16px',
    fontSize: '12.5px',
    fontWeight: '500',
    color: 'var(--text-main)',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  resultContainer: {
    maxWidth: '800px',
    width: '100%',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  infoCard: {
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-lg)',
    padding: '20px',
    boxShadow: 'var(--shadow-sm)',
    position: 'relative'
  },
  infoCardHeader: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px', 
    fontSize: '15px', 
    fontWeight: '600', 
    color: 'var(--primary)',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '8px',
    marginBottom: '14px'
  },
  infoGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', fontSize: '13.5px' },
  infoLabel: { color: 'var(--text-muted)', display: 'block', fontSize: '12px' },
  infoValueName: { fontSize: '15px', textTransform: 'uppercase', color: 'var(--text-main)' },
  historyBadge: { color: '#b45309', fontWeight: '600', backgroundColor: '#fef3c7', padding: '4px 8px', borderRadius: '4px', display: 'inline-block', marginTop: '2px', border: '1px solid #fde68a' },
  historyCard: {
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-lg)',
    padding: '20px',
    boxShadow: 'var(--shadow-sm)'
  },
  historyCardHeader: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '10px',
    marginBottom: '16px'
  },
  historyCountBadge: { fontSize: '12.5px', color: 'var(--text-muted)', fontWeight: '600', backgroundColor: 'var(--bg-main)', padding: '4px 10px', borderRadius: '12px' },
  emptyHistory: { textAlign: 'center', padding: '32px', color: 'var(--text-muted)' },
  historyItem: {
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    padding: '14px 16px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    transition: 'all 0.2s',
    backgroundColor: 'var(--bg-card)'
  },
  historyItemTime: { display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-muted)' },
  guideBox: {
    textAlign: 'center',
    padding: '64px',
    color: 'var(--text-muted)',
    maxWidth: '500px',
    width: '100%',
    margin: '40px auto 0'
  },
  guideIcon: { margin: '0 auto 16px', display: 'block', opacity: 0.3 },
  guideTitle: { fontSize: '16px', fontWeight: '600', color: 'var(--text-main)', marginBottom: '8px' }
};

export default HoSoBenhAn;
