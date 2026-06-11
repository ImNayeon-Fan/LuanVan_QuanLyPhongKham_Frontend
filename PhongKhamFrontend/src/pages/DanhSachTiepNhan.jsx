import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Search, User, Calendar, RefreshCw, ClipboardList, Eye
} from 'lucide-react';
import { apiGetDanhSachTiepNhan, apiGetStaffList } from '../utils/api';
import { useToast } from '../utils/ToastContext';

// Cấu hình nhãn trạng thái và màu sắc đi kèm
const trangThaiLabel = {
  0: { label: 'Chờ khám',   color: '#f59e0b', bg: '#fef3c7' },
  1: { label: 'Đang khám',  color: '#0ea5e9', bg: '#e0f2fe' },
  2: { label: 'Chờ CLS',    color: '#8b5cf6', bg: '#ede9fe' },
  3: { label: 'Hoàn thành', color: '#22c55e', bg: '#dcfce7' },
};

function DanhSachTiepNhan() {
  const navigate = useNavigate();
  const { showError } = useToast();
  
  // Trạng thái lưu trữ bộ lọc trên giao diện
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]); // Mặc định là ngày hôm nay

  const [dsPhieuKham, setDsPhieuKham] = useState([]); // Danh sách phiếu khám tải từ backend
  const [docList, setDocList] = useState([]); // Danh sách bác sĩ phục vụ bộ lọc
  const [loading, setLoading] = useState(false);

  // 1. Tải danh sách bác sĩ đang hoạt động để đưa vào bộ lọc
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await apiGetStaffList('active', 1, 100, '', 2); // 2 là vai trò Bác sĩ
        if (res && res.data) setDocList(res.data);
      } catch (err) {
        console.error('Lỗi tải danh sách bác sĩ:', err);
      }
    };
    fetchDoctors();
  }, []);

  // 2. Tải danh sách bệnh nhân đã tiếp tiếp nhận từ Backend
  const fetchDanhSachTiepNhan = async () => {
    setLoading(true);
    try {
      const res = await apiGetDanhSachTiepNhan({
        search: searchQuery,
        maBacSi: selectedDoctor,
        trangThai: selectedStatus,
        ngayKham: selectedDate,
        page: 1,
        limit: 100
      });
      if (res && res.data) setDsPhieuKham(res.data);
    } catch (err) {
      console.error('Lỗi tải danh sách tiếp nhận:', err);
      showError('Không thể kết nối dữ liệu từ máy chủ. Xin hãy thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Tự động tải lại khi bất kỳ bộ lọc nào thay đổi
  useEffect(() => {
    fetchDanhSachTiepNhan();
  }, [searchQuery, selectedDoctor, selectedStatus, selectedDate]);

  // Hỗ trợ hàm format thời gian tiếp nhận
  const formatTime = (isoString) => {
    if (!isoString) return '—';
    return new Date(isoString).toLocaleString('vi-VN', { 
      hour: '2-digit', minute: '2-digit', 
      day: '2-digit', month: '2-digit', year: 'numeric' 
    });
  };

  // Định dạng hiển thị ngày sinh bệnh nhân
  const formatNgaySinh = (dateStr) => {
    if (!dateStr) return '—';
    const parts = dateStr.split('-');
    return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dateStr;
  };

  return (
    <div className="kb-wrapper" style={styles.wrapper}>
      {/* Topbar điều hướng */}
      <div className="kb-topbar" style={styles.topbar}>
        <div style={{ flex: 1, display: 'flex' }}>
          <button className="kb-back-btn" onClick={() => navigate('/')} style={{ padding: '5px 10px' }}>
            <ArrowLeft size={16} /> Quay về trang chủ
          </button>
        </div>
        <div className="kb-topbar-title" style={styles.topTitle}>
          <ClipboardList size={18} style={{ marginRight: '6px' }} />
          <strong>Danh sách bệnh nhân đã tiếp đón</strong>
        </div>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
          <button className="kb-back-btn" onClick={fetchDanhSachTiepNhan} style={styles.reloadBtn}>
            <RefreshCw size={14} className={loading ? 'spin-animation' : ''} /> Làm mới
          </button>
        </div>
      </div>

      {/* Main body chứa danh sách */}
      <div className="kb-body" style={styles.body}>
        
        {/* Bộ lọc nâng cao */}
        <div style={styles.filterBar}>
          {/* Ô tìm kiếm thông tin */}
          <div style={styles.searchContainer}>
            <Search size={16} style={styles.searchIcon} />
            <input
              type="text" className="form-input" style={{ paddingLeft: '34px', height: '36px' }}
              placeholder="Tìm họ tên, SĐT, mã bệnh nhân..."
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Lọc theo bác sĩ */}
          <div style={{ flex: 1, minWidth: '180px' }}>
            <select
              className="form-input" style={{ paddingLeft: '12px', height: '36px' }}
              value={selectedDoctor} onChange={e => setSelectedDoctor(e.target.value)}
            >
              <option value="">-- Lọc theo Bác sĩ chỉ định --</option>
              {docList.map(doc => (
                <option key={doc.maNV} value={doc.maNV}>{doc.hoTen}</option>
              ))}
            </select>
          </div>

          {/* Lọc theo ngày tiếp đón */}
          <div style={styles.dateFilterContainer}>
            <Calendar size={16} style={styles.calendarIcon} />
            <input
              type="date" className="form-input" style={{ paddingLeft: '34px', height: '36px' }}
              value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
            />
          </div>

          {/* Lọc theo trạng thái khám */}
          <div style={{ flex: 1, minWidth: '160px' }}>
            <select
              className="form-input" style={{ paddingLeft: '12px', height: '36px' }}
              value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}
            >
              <option value="">-- Tất cả trạng thái --</option>
              <option value="0">Chờ khám</option>
              <option value="1">Đang khám</option>
              <option value="2">Chờ CLS</option>
              <option value="3">Hoàn thành</option>
            </select>
          </div>
        </div>

        {/* Bảng hiển thị dữ liệu */}
        <div style={styles.tableCard}>
          {dsPhieuKham.length === 0 ? (
            <div style={styles.emptyContainer}>
              <User size={48} style={{ margin: '0 auto 16px', display: 'block', opacity: 0.3 }} />
              <p style={{ fontSize: '15px', fontWeight: '500' }}>Không tìm thấy bệnh nhân nào khớp với bộ lọc</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto', flex: 1 }}>
              <table className="kb-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={styles.tableHeaderRow}>
                    <th style={{ width: '50px', textAlign: 'center' }}>STT</th>
                    <th>Thời gian tiếp nhận</th>
                    <th>Mã Bệnh Nhân</th>
                    <th>Họ và Tên</th>
                    <th>Ngày Sinh</th>
                    <th>Giới Tính</th>
                    <th>Số điện thoại</th>
                    <th>Địa chỉ</th>
                    <th>Bác sĩ chỉ định</th>
                    <th>Trạng thái khám</th>
                    <th style={{ width: '80px', textAlign: 'center' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {dsPhieuKham.map((item, index) => {
                    const status = trangThaiLabel[item.trangThaiKham] || trangThaiLabel[0];
                    return (
                      <tr key={item.maPhieu} className="kb-table-row" style={{ transition: 'background 0.2s' }}>
                        <td style={styles.centerMutedCell}>{index + 1}</td>
                        <td style={styles.timeCell}>{formatTime(item.ngayKham)}</td>
                        <td style={styles.maBnCell}>{item.maBN}</td>
                        <td 
                          className="kb-patient-name-link" style={{ fontWeight: '600' }}
                          onClick={() => navigate(`/ho-so-chi-tiet/${item.maPhieu}`)} title="Xem chi tiết bệnh án"
                        >
                          {item.hoTen}
                        </td>
                        <td>{formatNgaySinh(item.ngaySinh)}</td>
                        <td>{item.gioiTinh}</td>
                        <td>{item.sdt}</td>
                        <td style={styles.addressCell} title={item.diaChi}>
                          {item.diaChi || '—'}
                        </td>
                        <td style={{ fontWeight: '500' }}>{item.tenBacSi || 'Chưa chỉ định'}</td>
                        <td>
                          <span className="kb-status-badge" style={{ color: status.color, backgroundColor: status.bg, fontSize: '11px' }}>
                            {status.label}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button 
                              className="kb-icon-btn kb-icon-btn--primary" title="Xem chi tiết bệnh án"
                              onClick={() => navigate(`/ho-so-chi-tiet/${item.maPhieu}`)} 
                            >
                              <Eye size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer đếm số lượng */}
          <div style={styles.tableFooter}>
            <span>Tổng cộng: {dsPhieuKham.length} lượt tiếp đón</span>
          </div>
        </div>
        
      </div>
    </div>
  );
}

// Tập hợp CSS style tập trung cho trang Danh sách tiếp nhận
const styles = {
  wrapper: { height: '100vh', overflow: 'hidden' },
  topbar: { height: '50px', padding: '0 20px' },
  topTitle: { flex: 1, display: 'flex', justifyContent: 'center', fontSize: '15px' },
  reloadBtn: { padding: '5px 10px', display: 'flex', alignItems: 'center', gap: '4px' },
  body: {
    padding: '16px 24px', backgroundColor: 'var(--bg-main)',
    height: 'calc(100vh - 50px)', overflowY: 'auto',
    display: 'flex', flexDirection: 'column', gap: '16px'
  },
  filterBar: {
    backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-lg)', padding: '12px 16px', display: 'flex',
    gap: '16px', alignItems: 'center', flexWrap: 'wrap', boxShadow: 'var(--shadow-sm)'
  },
  searchContainer: { display: 'flex', alignItems: 'center', gap: '8px', flex: 2, minWidth: '240px', position: 'relative' },
  searchIcon: { position: 'absolute', left: '12px', color: 'var(--text-muted)' },
  dateFilterContainer: { flex: 1, minWidth: '160px', display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' },
  calendarIcon: { position: 'absolute', left: '12px', color: 'var(--text-muted)' },
  tableCard: {
    backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)',
    flex: 1, display: 'flex', flexDirection: 'column'
  },
  emptyContainer: { padding: '64px', textAlign: 'center', color: 'var(--text-muted)' },
  tableHeaderRow: { position: 'sticky', top: 0, zIndex: 10, background: 'var(--bg-main)' },
  centerMutedCell: { textAlign: 'center', fontWeight: '500', color: 'var(--text-muted)' },
  timeCell: { fontSize: '13px', color: 'var(--text-muted)' },
  maBnCell: { fontWeight: '600', color: 'var(--primary)' },
  addressCell: { maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  tableFooter: {
    borderTop: '1px solid var(--border-color)', padding: '12px 20px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500', backgroundColor: 'var(--bg-main)'
  }
};

export default DanhSachTiepNhan;
