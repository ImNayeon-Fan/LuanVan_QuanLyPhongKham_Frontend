import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, User, Calendar, Phone, MapPin, 
  Activity, Thermometer, Heart, Scale, Ruler, Wind, Timer, 
  FlaskConical, Pill, ClipboardCheck, Info, FileText, CheckCircle, Clock, AlertTriangle, AlertCircle, Printer, Home
} from 'lucide-react';
import { apiGetChiTietPhieuKham } from '../utils/api';

// Các trạng thái khám và nhãn badge tương ứng
const trangThaiLabel = {
  0: { label: 'Chờ khám',   color: '#f59e0b', bg: '#fef3c7', icon: <Clock size={16} /> },
  1: { label: 'Đang khám',  color: '#0ea5e9', bg: '#e0f2fe', icon: <Activity size={16} /> },
  2: { label: 'Chờ CLS',    color: '#8b5cf6', bg: '#ede9fe', icon: <FlaskConical size={16} /> },
  3: { label: 'Hoàn thành', color: '#22c55e', bg: '#dcfce7', icon: <CheckCircle size={16} /> },
};

// Đánh giá tình trạng sinh hiệu (Màu cảnh báo)
const getVitalStatus = (key, value) => {
  if (!value) return { status: 'normal', text: 'Chưa đo', color: '#64748b', bg: '#f1f5f9' };
  const num = parseFloat(value);
  if (isNaN(num)) {
    if (key === 'huyetAp') {
      const parts = value.trim().split('/');
      if (parts.length === 2 && !isNaN(parts[0].trim()) && !isNaN(parts[1].trim())) {
        const sbp = parseFloat(parts[0]);
        const dbp = parseFloat(parts[1]);
        if (sbp >= 140 || dbp >= 90) return { status: 'danger', text: 'Cao (≥140/90)', color: '#ef4444', bg: '#fee2e2' };
        if (sbp < 90 || dbp < 60) return { status: 'warning', text: 'Thấp (<90/60)', color: '#f59e0b', bg: '#fef3c7' };
        return { status: 'success', text: 'Bình thường', color: '#10b981', bg: '#d1fae5' };
      }
      return { status: 'invalid', text: 'Sai định dạng', color: '#ef4444', bg: '#fee2e2' };
    }
    return { status: 'invalid', text: 'Lỗi nhập liệu', color: '#ef4444', bg: '#fee2e2' };
  }
  
  switch (key) {
    case 'mach':
      if (num < 60) return { status: 'warning', text: 'Mạch chậm (<60)', color: '#f59e0b', bg: '#fef3c7' };
      if (num > 100) return { status: 'danger', text: 'Mạch nhanh (>100)', color: '#ef4444', bg: '#fee2e2' };
      return { status: 'success', text: 'Bình thường', color: '#10b981', bg: '#d1fae5' };
    case 'nhietDo':
      if (num < 36.0) return { status: 'warning', text: 'Thân nhiệt thấp', color: '#f59e0b', bg: '#fef3c7' };
      if (num > 37.5) return { status: 'danger', text: 'Sốt (>37.5°C)', color: '#ef4444', bg: '#fee2e2' };
      return { status: 'success', text: 'Bình thường', color: '#10b981', bg: '#d1fae5' };
    case 'spo2':
      if (num < 95) return { status: 'danger', text: 'SpO2 thấp (<95%)', color: '#ef4444', bg: '#fee2e2' };
      return { status: 'success', text: 'Bình thường', color: '#10b981', bg: '#d1fae5' };
    case 'nhipTho':
      if (num < 12) return { status: 'warning', text: 'Thở chậm (<12)', color: '#f59e0b', bg: '#fef3c7' };
      if (num > 20) return { status: 'danger', text: 'Thở nhanh (>20)', color: '#ef4444', bg: '#fee2e2' };
      return { status: 'success', text: 'Bình thường', color: '#10b981', bg: '#d1fae5' };
    default:
      return { status: 'success', text: 'Bình thường', color: '#10b981', bg: '#d1fae5' };
  }
};

function ChiTietBenhNhan() {
  const { maPhieu } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null); // Thông tin hồ sơ bệnh nhân

  // Tải chi tiết bệnh án từ Backend API khi tải trang
  useEffect(() => {
    let active = true;
    const fetchDetail = async () => {
      try {
        const data = await apiGetChiTietPhieuKham(maPhieu);
        if (active && data) {
          // Chuẩn hóa dữ liệu tương thích với giao diện React
          setPatient({
            ...data,
            trangThai: data.trangThaiKham,
            ngaySinh: data.ngaySinh ? data.ngaySinh.split('-').reverse().join('/') : '—',
            chiDinh: data.canLamSang ? data.canLamSang.map(cls => ({
              id: cls.maChiTiet,
              tenXN: cls.tenDV,
              ketQua: cls.ketQua,
              trangThaiCLS: cls.trangThaiCLS
            })) : [],
            donThuoc: data.donThuoc && data.donThuoc.chiTiet ? data.donThuoc.chiTiet.map((ct, idx) => ({
              id: idx,
              tenThuoc: ct.tenThuoc,
              soNgay: 7, // Mặc định kê đơn 7 ngày
              soLuong: `${ct.soLuong} ${ct.donViTinh || ''} (${ct.cachDung || ''})`
            })) : [],
            chanDoan: data.maICD ? `[${data.maICD}] ${data.tenBenh || ''}${data.ketLuan ? ` - ${data.ketLuan}` : ''}` : data.ketLuan
          });
        }
      } catch (err) {
        console.error('Không thể tải chi tiết bệnh nhân từ API:', err);
        if (active) setPatient(null);
      }
    };
    fetchDetail();
    return () => { active = false; };
  }, [maPhieu]);

  // Nếu không thấy hồ sơ bệnh nhân, hiển thị thông báo lỗi
  if (!patient) {
    return (
      <div className="kb-wrapper" style={{ height: '100vh', justifyContent: 'center', alignItems: 'center' }}>
        <div style={styles.errorCard}>
          <AlertCircle size={48} style={{ color: 'var(--error)', margin: '0 auto 16px', display: 'block' }} />
          <h2 style={{ marginBottom: '8px', fontSize: '18px', fontWeight: 600 }}>Không tìm thấy bệnh nhân!</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>Hồ sơ bệnh án không tồn tại hoặc đã bị xóa khỏi hệ thống.</p>
          <button className="btn-primary" onClick={() => navigate('/danh-sach-tiep-nhan')} style={{ padding: '10px 20px', width: '100%' }}>
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  const status = trangThaiLabel[patient.trangThai] || trangThaiLabel[0];
  const initials = patient.hoTen ? patient.hoTen.trim().split(' ').pop().charAt(0).toUpperCase() : 'BN';

  const formatTime = (isoString) => {
    if (!isoString) return '—';
    return new Date(isoString).toLocaleString('vi-VN', { 
      hour: '2-digit', minute: '2-digit', 
      day: '2-digit', month: '2-digit', year: 'numeric' 
    });
  };

  const hasVitalSigns = patient.mach || patient.nhietDo || patient.huyetAp || patient.canNang || patient.chieuCao || patient.spo2 || patient.nhipTho;

  return (
    <div className="kb-wrapper" style={styles.wrapper}>
      {/* Topbar điều hướng */}
      <div className="kb-topbar" style={styles.topbar}>
        <div style={{ flex: 1, display: 'flex', gap: '8px' }}>
          <button className="kb-back-btn" onClick={() => navigate(-1)} style={{ padding: '5px 10px' }}>
            <ArrowLeft size={16} /> Quay lại
          </button>
          <button className="kb-back-btn" onClick={() => navigate('/')} style={{ padding: '5px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Home size={14} /> Trang chủ
          </button>
        </div>
        <div className="kb-topbar-title" style={styles.topTitle}>
          <FileText size={18} style={{ marginRight: '6px' }} />
          <strong>Hồ sơ chi tiết người bệnh</strong>
        </div>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
          <button className="kb-back-btn" onClick={() => window.print()} style={{ padding: '5px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Printer size={14} /> In bệnh án
          </button>
        </div>
      </div>

      {/* Vùng thân hiển thị thông tin chi tiết */}
      <div className="kb-body" style={styles.body}>
        
        {/* Banner bệnh nhân dạng Gradient cao cấp */}
        <div style={styles.patientBanner}>
          <div style={styles.decor1} />
          <div style={styles.decor2} />

          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={styles.avatar}>{initials}</div>

            <div style={{ flex: 1, minWidth: '220px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px', flexWrap: 'wrap' }}>
                <h1 style={styles.patientName}>{patient.hoTen}</h1>
                <span style={{ ...styles.badge, color: status.color, backgroundColor: status.bg }}>
                  {status.icon} {status.label}
                </span>
              </div>
              <div style={styles.patientMeta}>
                <span><strong>Mã hồ sơ:</strong> {patient.maPhieu}</span>
                <span>•</span>
                <span><strong>Mã BN:</strong> {patient.maBN || 'Chưa tạo'}</span>
                <span>•</span>
                <span><strong>Giới tính:</strong> {patient.gioiTinh}</span>
                <span>•</span>
                <span><strong>Ngày sinh:</strong> {patient.ngaySinh}</span>
              </div>
            </div>
          </div>

          <div style={styles.bannerContact}>
            <span><Phone size={14} /> <strong>Điện thoại:</strong> {patient.sdt}</span>
            <span><MapPin size={14} /> <strong>Địa chỉ:</strong> {patient.diaChi || '—'}</span>
            <span><Calendar size={14} /> <strong>Thời gian tiếp nhận:</strong> {formatTime(patient.ngayKham)}</span>
          </div>
        </div>

        {/* Bố cục Grid 2 cột */}
        <div style={styles.gridContainer}>
          
          {/* CỘT TRÁI: Chi tiết lâm sàng & Sinh hiệu */}
          <div style={styles.flexColumn}>
            
            {/* Card Chi tiết tiếp nhận */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <User size={16} />
                <span>Chi tiết tiếp nhận</span>
              </div>
              <div style={styles.cardBody}>
                <div>
                  <span style={styles.fieldLabel}>Bác sĩ khám phụ trách:</span>
                  <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{patient.tenBacSi || 'Chưa phân công'}</span>
                </div>
                <div>
                  <span style={styles.fieldLabel}>Lý do đến khám:</span>
                  <p style={styles.reasonBox}>{patient.lyDoKham || 'Chưa nhập'}</p>
                </div>
                <div>
                  <span style={styles.fieldLabel}>Tiền sử bệnh lý:</span>
                  {patient.tienSuBenh ? (
                    <div style={styles.historyWarning}>
                      <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{patient.tienSuBenh}</span>
                    </div>
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Không có tiền sử bệnh lý</span>
                  )}
                </div>
              </div>
            </div>

            {/* Card Chỉ số sinh hiệu */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <Activity size={16} />
                <span>Các chỉ số sinh hiệu đo được</span>
              </div>
              {!hasVitalSigns ? (
                <div style={styles.emptyCardBody}>
                  <Info size={24} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.4 }} />
                  <p style={{ fontSize: '13.5px', fontStyle: 'italic' }}>Chưa cập nhật sinh hiệu bên màn hình khám bệnh.</p>
                </div>
              ) : (
                <div style={styles.vitalsGrid}>
                  {[
                    { label: 'Mạch', val: patient.mach, unit: 'lần/phút', icon: <Activity size={16} color="#ef4444" />, key: 'mach' },
                    { label: 'Nhiệt độ', val: patient.nhietDo, unit: '°C', icon: <Thermometer size={16} color="#f97316" />, key: 'nhietDo' },
                    { label: 'Huyết áp', val: patient.huyetAp, unit: 'mmHg', icon: <Heart size={16} color="#db2777" />, key: 'huyetAp' },
                    { label: 'SpO2', val: patient.spo2, unit: '%', icon: <Wind size={16} color="#0ea5e9" />, key: 'spo2' },
                    { label: 'Cân nặng', val: patient.canNang, unit: 'kg', icon: <Scale size={16} color="#6366f1" />, key: 'canNang' },
                    { label: 'Chiều cao', val: patient.chieuCao, unit: 'cm', icon: <Ruler size={16} color="#22c55e" />, key: 'chieuCao' },
                    { label: 'Nhịp thở', val: patient.nhipTho, unit: 'lần/phút', icon: <Timer size={16} color="#8b5cf6" />, key: 'nhipTho' }
                  ].map(item => {
                    const vitalState = getVitalStatus(item.key, item.val);
                    return (
                      <div key={item.key} style={styles.vitalItem}>
                        <div style={styles.vitalHeader}>
                          {item.icon} <span>{item.label}</span>
                        </div>
                        <div>
                          <strong style={{ fontSize: '16px', color: 'var(--text-main)' }}>{item.val || '—'}</strong>
                          {item.val && <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '4px' }}>{item.unit}</span>}
                        </div>
                        {item.val && (
                          <div style={{ ...styles.vitalBadge, color: vitalState.color, backgroundColor: vitalState.bg }}>
                            {vitalState.text}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* CỘT PHẢI: Chẩn đoán, Cận lâm sàng & Đơn thuốc */}
          <div style={styles.flexColumn}>
            
            {/* Card Chẩn đoán */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <ClipboardCheck size={16} />
                <span>Chẩn đoán & Lời dặn bệnh án</span>
              </div>
              <div style={styles.cardBody}>
                <div>
                  <span style={styles.fieldLabel}>Chẩn đoán xác định:</span>
                  {patient.chanDoan ? (
                    <div style={styles.diagnosisBox}>{patient.chanDoan}</div>
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Chưa cập nhật chẩn đoán.</span>
                  )}
                </div>
                <div>
                  <span style={styles.fieldLabel}>Lời dặn bác sĩ / Hướng điều trị:</span>
                  {patient.loiDan ? (
                    <div style={styles.instructionsBox}>{patient.loiDan}</div>
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Chưa có lời dặn/hướng dẫn điều trị.</span>
                  )}
                </div>
              </div>
            </div>

            {/* Card Cận lâm sàng */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <FlaskConical size={16} />
                <span>Chỉ định cận lâm sàng / Dịch vụ kỹ thuật</span>
              </div>
              {!patient.chiDinh || patient.chiDinh.length === 0 ? (
                <p style={styles.emptyText}>Bác sĩ không kê chỉ định cận lâm sàng nào.</p>
              ) : (
                <div style={styles.clsList}>
                  {patient.chiDinh.map((c, i) => (
                    <div key={c.id} style={styles.clsItem}>
                      <span style={styles.clsNumber}>{i + 1}</span>
                      <strong style={{ color: 'var(--text-main)', flex: 1 }}>{c.tenXN}</strong>
                      <span style={styles.clsBadge}>Đã chỉ định</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Card Đơn thuốc */}
            <div style={styles.prescriptionCard}>
              <div style={styles.cardHeader}>
                <Pill size={16} />
                <span>Đơn thuốc đã kê</span>
              </div>
              {!patient.donThuoc || patient.donThuoc.length === 0 ? (
                <p style={styles.emptyText}>Bác sĩ chưa kê đơn thuốc nào cho lượt khám này.</p>
              ) : (
                <div>
                  <table className="kb-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' }}>
                    <thead>
                      <tr>
                        <th style={styles.tableHeaderCol}>STT</th>
                        <th style={styles.tableHeaderCol}>Tên thuốc</th>
                        <th style={{ ...styles.tableHeaderCol, textAlign: 'center' }}>Số ngày</th>
                        <th style={styles.tableHeaderCol}>Liều dùng & Cách dùng</th>
                      </tr>
                    </thead>
                    <tbody>
                      {patient.donThuoc.map((t, i) => (
                        <tr key={t.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '10px 4px', color: 'var(--text-muted)', fontWeight: '500' }}>{i + 1}</td>
                          <td style={{ padding: '10px 4px' }}><strong style={{ color: 'var(--text-main)' }}>{t.tenThuoc}</strong></td>
                          <td style={{ padding: '10px 4px', textAlign: 'center', fontWeight: '500' }}>{t.soNgay} ngày</td>
                          <td style={{ padding: '10px 4px', color: 'var(--text-muted)', fontSize: '13px' }}>{t.soLuong}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {/* Chữ ký bác sĩ */}
                  <div style={styles.signatureContainer}>
                    <div style={{ textAlign: 'center', width: '200px' }}>
                      <p style={{ fontStyle: 'italic', marginBottom: '40px', fontSize: '12px' }}>Ngày ..... tháng ..... năm 2026</p>
                      <p style={{ fontWeight: '600', color: 'var(--text-main)', marginBottom: '4px' }}>Bác sĩ khám điều trị</p>
                      <p style={{ fontSize: '11px', opacity: 0.8 }}>(Ký và ghi rõ họ tên)</p>
                      {patient.tenBacSi && (
                        <p style={styles.doctorSignature}>{patient.tenBacSi.split(' (')[0]}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

// Tập hợp kiểu dáng CSS (inline stylesheet) giúp thu gọn hàm render JSX
const styles = {
  wrapper: { height: '100vh', overflow: 'hidden' },
  topbar: { height: '50px', padding: '0 20px' },
  topTitle: { flex: 1, display: 'flex', justifyContent: 'center', fontSize: '15px' },
  body: {
    padding: '20px 24px', backgroundColor: 'var(--bg-main)',
    height: 'calc(100vh - 50px)', overflowY: 'auto',
    display: 'flex', flexDirection: 'column', gap: '20px'
  },
  errorCard: {
    textAlign: 'center', padding: '40px', backgroundColor: 'var(--bg-card)',
    borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)',
    boxShadow: 'var(--shadow-lg)', maxWidth: '400px'
  },
  patientBanner: {
    background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 60%, #0369a1 100%)',
    borderRadius: 'var(--radius-lg)', padding: '24px', color: 'white',
    boxShadow: 'var(--shadow-md)', display: 'flex', flexDirection: 'column',
    gap: '16px', position: 'relative', overflow: 'hidden'
  },
  decor1: { position: 'absolute', right: '-20px', top: '-20px', width: '150px', height: '150px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.05)', pointerEvents: 'none' },
  decor2: { position: 'absolute', right: '40px', bottom: '-40px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.08)', pointerEvents: 'none' },
  avatar: {
    width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '28px', fontWeight: '700', border: '2.5px solid rgba(255, 255, 255, 0.4)',
    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)', textShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  patientName: { fontSize: '22px', fontWeight: '700', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' },
  badge: {
    fontSize: '12px', fontWeight: '600', padding: '4px 10px', borderRadius: '12px',
    display: 'inline-flex', alignItems: 'center', gap: '4px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.05)'
  },
  patientMeta: { display: 'flex', flexWrap: 'wrap', gap: '16px', opacity: 0.95, fontSize: '13.5px' },
  bannerContact: {
    borderTop: '1px solid rgba(255, 255, 255, 0.15)', paddingTop: '14px',
    display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px',
    fontSize: '13px', opacity: 0.9
  },
  gridContainer: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px', alignItems: 'start' },
  flexColumn: { display: 'flex', flexDirection: 'column', gap: '20px' },
  card: { backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '16px 20px', boxShadow: 'var(--shadow-sm)' },
  cardHeader: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: '600', color: 'var(--primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '14px' },
  cardBody: { display: 'flex', flexType: 'column', flexDirection: 'column', gap: '12px', fontSize: '14px' },
  emptyCardBody: { textAlign: 'center', padding: '24px', color: 'var(--text-muted)' },
  fieldLabel: { color: 'var(--text-muted)', display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '2px' },
  reasonBox: { fontWeight: '500', color: 'var(--text-main)', margin: 0, padding: '8px 12px', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-md)' },
  historyWarning: { display: 'flex', gap: '8px', alignItems: 'flex-start', padding: '8px 12px', backgroundColor: '#fef3c7', borderRadius: 'var(--radius-md)', color: '#b45309', border: '1px solid #fde68a', fontWeight: '500' },
  vitalsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' },
  vitalItem: { padding: '10px 12px', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '6px' },
  vitalHeader: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: '500' },
  vitalBadge: { fontSize: '9.5px', fontWeight: '600', padding: '1.5px 6px', borderRadius: '8px', display: 'inline-block', width: 'fit-content' },
  diagnosisBox: { fontWeight: '600', color: 'var(--text-main)', padding: '10px 14px', backgroundColor: 'rgba(14, 165, 233, 0.05)', borderLeft: '4px solid var(--primary)', borderRadius: '0 var(--radius-md) var(--radius-md) 0' },
  instructionsBox: { padding: '10px 14px', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-md)', color: 'var(--text-main)', whiteSpace: 'pre-line', lineHeight: '1.5' },
  emptyText: { color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '13.5px', margin: 0, padding: '10px 0' },
  clsList: { display: 'flex', flexDirection: 'column', gap: '8px' },
  clsItem: { display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', fontSize: '13.5px' },
  clsNumber: { width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '600' },
  clsBadge: { fontSize: '11.5px', color: '#10b981', backgroundColor: '#d1fae5', padding: '2px 8px', borderRadius: '10px', fontWeight: '500' },
  prescriptionCard: {
    backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '20px', boxShadow: 'var(--shadow-sm)',
    backgroundImage: 'radial-gradient(var(--border-color) 0.5px, transparent 0.5px)', backgroundSize: '12px 12px', position: 'relative'
  },
  tableHeaderCol: { paddingBottom: '8px', borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)' },
  signatureContainer: { marginTop: '24px', display: 'flex', justifyContent: 'flex-end', fontSize: '13px', color: 'var(--text-muted)' },
  doctorSignature: { marginTop: '24px', fontWeight: '600', color: 'var(--primary)', fontStyle: 'italic' }
};

export default ChiTietBenhNhan;
