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
      <div className="kb-wrapper h-screen flex justify-center items-center">
        <div className="text-center p-10 bg-[var(--bg-card)] rounded-[var(--radius-lg)] border border-[var(--border-color)] shadow-[var(--shadow-lg)] max-w-[400px]">
          <AlertCircle size={48} className="text-[var(--error)] mx-auto mb-4 block" />
          <h2 className="mb-2 text-[18px] font-semibold">Không tìm thấy bệnh nhân!</h2>
          <p className="text-[var(--text-muted)] text-sm mb-6">Hồ sơ bệnh án không tồn tại hoặc đã bị xóa khỏi hệ thống.</p>
          <button className="btn-primary py-2.5 px-5 w-full" onClick={() => navigate('/danh-sach-tiep-nhan')}>
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
    <div className="kb-wrapper h-screen overflow-hidden">
      {/* Topbar điều hướng */}
      <div className="kb-topbar h-[50px] px-5">
        <div className="flex-1 flex gap-2">
          <button className="kb-back-btn py-[5px] px-[10px]" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} /> Quay lại
          </button>
          <button className="kb-back-btn py-[5px] px-[10px] flex items-center gap-1" onClick={() => navigate('/')}>
            <Home size={14} /> Trang chủ
          </button>
        </div>
        <div className="kb-topbar-title flex-1 flex justify-center text-[15px]">
          <FileText size={18} className="mr-1.5" />
          <strong>Hồ sơ chi tiết người bệnh</strong>
        </div>
        <div className="flex-1 flex justify-end">
          <button className="kb-back-btn py-[5px] px-[10px] flex items-center gap-1" onClick={() => window.print()}>
            <Printer size={14} /> In bệnh án
          </button>
        </div>
      </div>

      {/* Vùng thân hiển thị thông tin chi tiết */}
      <div className="kb-body p-5 px-6 bg-[var(--bg-main)] h-[calc(100vh-50px)] overflow-y-auto flex flex-col gap-5">
        
        {/* Banner bệnh nhân dạng Gradient cao cấp */}
        <div className="bg-[linear-gradient(135deg,#0ea5e9_0%,#0284c7_60%,#0369a1_100%)] rounded-[var(--radius-lg)] p-6 text-white shadow-[var(--shadow-md)] flex flex-col gap-4 relative overflow-hidden">
          <div className="absolute -right-5 -top-5 w-[150px] h-[150px] rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute right-10 -bottom-10 w-[100px] h-[100px] rounded-full bg-white/[0.08] pointer-events-none" />

          <div className="flex gap-5 items-center flex-wrap">
            <div className="w-[72px] h-[72px] rounded-full bg-white/20 backdrop-blur-[10px] flex items-center justify-center text-[28px] font-bold border-[2.5px] border-white/40 shadow-[0_8px_16px_rgba(0,0,0,0.1)] [text-shadow:0_2px_4px_rgba(0,0,0,0.1)]">{initials}</div>

            <div className="flex-1 min-w-[220px]">
              <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                <h1 className="text-[22px] font-bold m-0 uppercase tracking-[0.5px]">{patient.hoTen}</h1>
                <span className="text-[12px] font-semibold py-1 px-2.5 rounded-[12px] inline-flex items-center gap-1 shadow-[0_2px_4px_rgba(0,0,0,0.05)] border border-black/5" style={{ color: status.color, backgroundColor: status.bg }}>
                  {status.icon} {status.label}
                </span>
              </div>
              <div className="flex flex-wrap gap-4 opacity-95 text-[13.5px]">
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

          <div className="border-t border-white/15 pt-3.5 flex justify-between flex-wrap gap-3 text-[13px] opacity-90">
            <span><Phone size={14} className="inline mr-1" /> <strong>Điện thoại:</strong> {patient.sdt}</span>
            <span><MapPin size={14} className="inline mr-1" /> <strong>Địa chỉ:</strong> {patient.diaChi || '—'}</span>
            <span><Calendar size={14} className="inline mr-1" /> <strong>Thời gian tiếp nhận:</strong> {formatTime(patient.ngayKham)}</span>
          </div>
        </div>

        {/* Bố cục Grid 2 cột */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(360px,1fr))] gap-5 items-start">
          
          {/* CỘT TRÁI: Chi tiết lâm sàng & Sinh hiệu */}
          <div className="flex flex-col gap-5">
            
            {/* Card Chi tiết tiếp nhận */}
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[var(--radius-lg)] p-4 px-5 shadow-[var(--shadow-sm)]">
              <div className="flex items-center gap-2 text-[15px] font-semibold text-[var(--primary)] border-b border-[var(--border-color)] pb-2.5 mb-3.5">
                <User size={16} />
                <span>Chi tiết tiếp nhận</span>
              </div>
              <div className="flex flex-col gap-3 text-sm">
                <div>
                  <span className="text-[var(--text-muted)] block text-[12px] font-medium mb-0.5">Bác sĩ khám phụ trách:</span>
                  <span className="font-semibold text-[var(--text-main)]">{patient.tenBacSi || 'Chưa phân công'}</span>
                </div>
                <div>
                  <span className="text-[var(--text-muted)] block text-[12px] font-medium mb-0.5">Lý do đến khám:</span>
                  <p className="font-medium text-[var(--text-main)] m-0 p-2 px-3 bg-[var(--bg-main)] rounded-[var(--radius-md)]">{patient.lyDoKham || 'Chưa nhập'}</p>
                </div>
                <div>
                  <span className="text-[var(--text-muted)] block text-[12px] font-medium mb-0.5">Tiền sử bệnh lý:</span>
                  {patient.tienSuBenh ? (
                    <div className="flex gap-2 items-start p-2 px-3 bg-[#fef3c7] rounded-[var(--radius-md)] text-[#b45309] border border-[#fde68a] font-medium">
                      <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                      <span>{patient.tienSuBenh}</span>
                    </div>
                  ) : (
                    <span className="text-[var(--text-muted)] italic">Không có tiền sử bệnh lý</span>
                  )}
                </div>
              </div>
            </div>

            {/* Card Chỉ số sinh hiệu */}
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[var(--radius-lg)] p-4 px-5 shadow-[var(--shadow-sm)]">
              <div className="flex items-center gap-2 text-[15px] font-semibold text-[var(--primary)] border-b border-[var(--border-color)] pb-2.5 mb-3.5">
                <Activity size={16} />
                <span>Các chỉ số sinh hiệu đo được</span>
              </div>
              {!hasVitalSigns ? (
                <div className="text-center p-6 text-[var(--text-muted)]">
                  <Info size={24} className="mx-auto mb-2 block opacity-40" />
                  <p className="text-[13.5px] italic">Chưa cập nhật sinh hiệu bên màn hình khám bệnh.</p>
                </div>
              ) : (
                <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3">
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
                      <div key={item.key} className="p-2.5 px-3 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-[var(--radius-md)] flex flex-col justify-between gap-1.5">
                        <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)] font-medium">
                          {item.icon} <span>{item.label}</span>
                        </div>
                        <div>
                          <strong className="text-[16px] text-[var(--text-main)]">{item.val || '—'}</strong>
                          {item.val && <span className="text-[11px] text-[var(--text-muted)] ml-1">{item.unit}</span>}
                        </div>
                        {item.val && (
                          <div className="text-[9.5px] font-semibold py-0.5 px-1.5 rounded-[8px] inline-block w-fit" style={{ color: vitalState.color, backgroundColor: vitalState.bg }}>
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
          <div className="flex flex-col gap-5">
            
            {/* Card Chẩn đoán */}
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[var(--radius-lg)] p-4 px-5 shadow-[var(--shadow-sm)]">
              <div className="flex items-center gap-2 text-[15px] font-semibold text-[var(--primary)] border-b border-[var(--border-color)] pb-2.5 mb-3.5">
                <ClipboardCheck size={16} />
                <span>Chẩn đoán & Lời dặn bệnh án</span>
              </div>
              <div className="flex flex-col gap-3 text-sm">
                <div>
                  <span className="text-[var(--text-muted)] block text-[12px] font-medium mb-0.5">Chẩn đoán xác định:</span>
                  {patient.chanDoan ? (
                    <div className="font-semibold text-[var(--text-main)] p-2.5 px-3.5 bg-[rgba(14,165,233,0.05)] border-l-4 border-[var(--primary)] rounded-r-[var(--radius-md)]">{patient.chanDoan}</div>
                  ) : (
                    <span className="text-[var(--text-muted)] italic">Chưa cập nhật chẩn đoán.</span>
                  )}
                </div>
                <div>
                  <span className="text-[var(--text-muted)] block text-[12px] font-medium mb-0.5">Lời dặn bác sĩ / Hướng điều trị:</span>
                  {patient.loiDan ? (
                    <div className="p-2.5 px-3.5 bg-[var(--bg-main)] rounded-[var(--radius-md)] text-[var(--text-main)] whitespace-pre-line leading-[1.5]">{patient.loiDan}</div>
                  ) : (
                    <span className="text-[var(--text-muted)] italic">Chưa có lời dặn/hướng dẫn điều trị.</span>
                  )}
                </div>
              </div>
            </div>

            {/* Card Cận lâm sàng */}
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[var(--radius-lg)] p-4 px-5 shadow-[var(--shadow-sm)]">
              <div className="flex items-center gap-2 text-[15px] font-semibold text-[var(--primary)] border-b border-[var(--border-color)] pb-2.5 mb-3.5">
                <FlaskConical size={16} />
                <span>Chỉ định cận lâm sàng / Dịch vụ kỹ thuật</span>
              </div>
              {!patient.chiDinh || patient.chiDinh.length === 0 ? (
                <p className="text-[var(--text-muted)] italic text-[13.5px] m-0 py-2.5">Bác sĩ không kê chỉ định cận lâm sàng nào.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {patient.chiDinh.map((c, i) => (
                    <div key={c.id} className="flex items-center gap-2.5 p-2 px-3 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-[var(--radius-md)] text-[13.5px]">
                      <span className="w-5 h-5 rounded-full bg-[var(--primary-light)] text-[var(--primary)] flex items-center justify-center text-[11px] font-semibold">{i + 1}</span>
                      <strong className="text-[var(--text-main)] flex-1">{c.tenXN}</strong>
                      <span className="text-[11.5px] text-[#10b981] bg-[#d1fae5] py-0.5 px-2 rounded-[10px] font-medium">Đã chỉ định</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Card Đơn thuốc */}
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[var(--radius-lg)] p-5 shadow-[var(--shadow-sm)] bg-[radial-gradient(var(--border-color)_0.5px,transparent_0.5px)] bg-[size:12px_12px] relative">
              <div className="flex items-center gap-2 text-[15px] font-semibold text-[var(--primary)] border-b border-[var(--border-color)] pb-2.5 mb-3.5">
                <Pill size={16} />
                <span>Đơn thuốc đã kê</span>
              </div>
              {!patient.donThuoc || patient.donThuoc.length === 0 ? (
                <p className="text-[var(--text-muted)] italic text-[13.5px] m-0 py-2.5">Bác sĩ chưa kê đơn thuốc nào cho lượt khám này.</p>
              ) : (
                <div>
                  <table className="kb-table w-full border-collapse text-[13.5px]">
                    <thead>
                      <tr>
                        <th className="pb-2 border-b-2 border-[var(--border-color)] text-[var(--text-muted)] text-left">STT</th>
                        <th className="pb-2 border-b-2 border-[var(--border-color)] text-[var(--text-muted)] text-left">Tên thuốc</th>
                        <th className="pb-2 border-b-2 border-[var(--border-color)] text-[var(--text-muted)] text-center">Số ngày</th>
                        <th className="pb-2 border-b-2 border-[var(--border-color)] text-[var(--text-muted)] text-left">Liều dùng & Cách dùng</th>
                      </tr>
                    </thead>
                    <tbody>
                      {patient.donThuoc.map((t, i) => (
                        <tr key={t.id} className="border-b border-[var(--border-color)]">
                          <td className="py-2.5 px-1 text-[var(--text-muted)] font-medium">{i + 1}</td>
                          <td className="py-2.5 px-1"><strong className="text-[var(--text-main)]">{t.tenThuoc}</strong></td>
                          <td className="py-2.5 px-1 text-center font-medium">{t.soNgay} ngày</td>
                          <td className="py-2.5 px-1 text-[var(--text-muted)] text-[13px]">{t.soLuong}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {/* Chữ ký bác sĩ */}
                  <div className="mt-6 flex justify-end text-[13px] text-[var(--text-muted)]">
                    <div className="text-center w-[200px]">
                      <p className="italic mb-10 text-[12px]">Ngày ..... tháng ..... năm 2026</p>
                      <p className="font-semibold text-[var(--text-main)] mb-1">Bác sĩ khám điều trị</p>
                      <p className="text-[11px] opacity-80">(Ký và ghi rõ họ tên)</p>
                      {patient.tenBacSi && (
                        <p className="mt-6 font-semibold text-[var(--primary)] italic">{patient.tenBacSi.split(' (')[0]}</p>
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

export default ChiTietBenhNhan;
