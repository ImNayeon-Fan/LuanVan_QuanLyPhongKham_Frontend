import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Search, User, Stethoscope, FlaskConical,
  Pill, ClipboardCheck, Plus, Trash2, Save, ChevronRight, X
} from 'lucide-react';
import { useToast } from '../utils/ToastContext';
import { apiGetICDList } from '../utils/api';

// Khớp với PhieuKham.TrangThaiKham trong C# SQL Database:
// 0: Chờ khám, 1: Đang khám, 2: Chờ CLS, 3: Hoàn thành
const trangThaiLabel = {
  0: { label: 'Chờ khám',   color: '#f59e0b', bg: '#fef3c7' },
  1: { label: 'Đang khám',  color: '#0ea5e9', bg: '#e0f2fe' },
  2: { label: 'Chờ CLS',    color: '#8b5cf6', bg: '#ede9fe' },
  3: { label: 'Hoàn thành', color: '#22c55e', bg: '#dcfce7' },
};

/**
 * Hàm kiểm tra và cảnh báo chỉ số sinh hiệu bất thường lâm sàng
 * giúp nhân viên y tế và bác sĩ theo dõi tình trạng sức khỏe bệnh nhân:
 * - Huyết áp: Bình thường quanh 120/80 mmHg, cảnh báo cao (≥ 140/90) hoặc thấp (< 90/60).
 * - Mạch: Bình thường 60 - 100 lần/phút.
 * - Thân nhiệt: Bình thường 36 - 37.5°C.
 * - SpO2: Bình thường ≥ 95%.
 * - Nhịp thở: Bình thường 12 - 20 lần/phút.
 */
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

// Danh mục menu điều hướng cột phải dùng để chuyển đổi giữa các phân hệ khám bệnh
const MENU_ITEMS = [
  { key: 'sinhHieu',  label: 'Thông tin khám cơ bản',     icon: <Stethoscope size={18} /> },
  { key: 'chiDinh',   label: 'Chỉ định cận lâm sàng',     icon: <FlaskConical size={18} /> },
  { key: 'donThuoc',  label: 'Đơn thuốc',                  icon: <Pill size={18} /> },
  { key: 'ketLuan',   label: 'Kết luận khám',              icon: <ClipboardCheck size={18} /> },
];

/**
 * Component Khám bệnh dành cho bác sĩ tại phòng khám
 * Quản lý toàn bộ quy trình từ kiểm tra sinh hiệu, chỉ định xét nghiệm/CLS, kê đơn thuốc và kết luận bệnh
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
      // Dữ liệu mẫu ban đầu nếu localStorage chưa có dữ liệu phiếu khám nào
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
          maNV: 'NV001',
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

  const [danhMucICD, setDanhMucICD] = useState([]);
  const [selectedIcdList, setSelectedIcdList] = useState([]);
  const [icdQuery, setIcdQuery] = useState('');
  const [showIcdDropdown, setShowIcdDropdown] = useState(false);

  // Tải danh mục ICD từ API khi component mount
  useEffect(() => {
    const fetchICD = async () => {
      try {
        const res = await apiGetICDList('', '', 1, 1000);
        if (res && res.data) {
          setDanhMucICD(res.data.map(item => ({
            maICD: item.MaICD || item.maICD || '',
            tenBenh: item.TenBenh || item.tenBenh || ''
          })));
        }
      } catch (err) {
        console.error('Lỗi tải danh mục ICD:', err);
      }
    };
    fetchICD();
  }, []);

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
      setSelectedIcdList(selectedBN.icdList || (selectedBN.maICD ? [{ maICD: selectedBN.maICD, tenBenh: selectedBN.tenBenhICD }] : []));
      setIcdQuery('');
      setShowIcdDropdown(false);
    } else {
      setSinhHieu({ mach: '', nhietDo: '', huyetAp: '', canNang: '', chieuCao: '', spo2: '', nhipTho: '' });
      setChiDinh([]);
      setDonThuoc([]);
      setKetLuan({ chanDoan: '', loiDan: '' });
      setSelectedIcdList([]);
      setIcdQuery('');
      setShowIcdDropdown(false);
    }
  }, [selectedBN]);

  // Lưu thông tin khám bệnh (đồng bộ với danh sách bệnh nhân và lưu vào LocalStorage)
  const luuPhieuKham = (updatedTrangThai = null) => {
    if (!selectedBN) return;

    const newTrangThai = updatedTrangThai !== null ? updatedTrangThai : selectedBN.trangThai;
    const updatedRecord = {
      ...selectedBN,
      ...sinhHieu,
      chiDinh,
      donThuoc,
      ...ketLuan,
      trangThai: newTrangThai,
      icdList: selectedIcdList,
      maICD: selectedIcdList.length > 0 ? selectedIcdList[0].maICD : null,
      tenBenhICD: selectedIcdList.length > 0 ? selectedIcdList[0].tenBenh : null
    };

    const updatedList = dsBenhNhan.map(bn => 
      bn.maPhieu === selectedBN.maPhieu ? updatedRecord : bn
    );

    setDsBenhNhan(updatedList);
    setSelectedBN(updatedRecord);

    localStorage.setItem('danhSachPhieuKham', JSON.stringify(updatedList));
    showSuccess('Đã lưu thông tin khám bệnh thành công!');
  };

  // Bộ lọc tìm kiếm bệnh nhân trong danh sách chờ theo Tên, Mã BN, Mã Phiếu
  const dsBNFilter = dsBenhNhan.filter(bn =>
    bn.hoTen.toLowerCase().includes(search.toLowerCase()) ||
    bn.maBN?.includes(search) ||
    bn.maPhieu?.includes(search)
  );

  // Thêm một chỉ định cận lâm sàng mới vào danh sách
  const themChiDinh = () => {
    if (!chiDinhMoi.trim()) return;
    setChiDinh([...chiDinh, { id: Date.now(), tenXN: chiDinhMoi }]);
    setChiDinhMoi('');
  };
  
  // Xóa chỉ định cận lâm sàng khỏi danh sách
  const xoaChiDinh = (id) => setChiDinh(chiDinh.filter(c => c.id !== id));

  // Thêm thuốc mới kê toa vào đơn thuốc của bệnh nhân
  const themThuoc = () => {
    if (!thuocMoi.tenThuoc.trim()) return;
    setDonThuoc([...donThuoc, { id: Date.now(), ...thuocMoi }]);
    setThuocMoi({ tenThuoc: '', soLuong: '', soNgay: '' });
  };
  
  // Xóa thuốc đã kê khỏi đơn thuốc
  const xoaThuoc = (id) => setDonThuoc(donThuoc.filter(t => t.id !== id));

  // Render giao diện nghiệp vụ theo menu bác sĩ đang chọn
  const renderContent = () => {
    if (!selectedBN) return (
      <div className="kb-empty">
        <User size={48} className="text-[var(--border-color)]" />
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

            {selectedBN.icdList && selectedBN.icdList.length > 0 ? (
              <div className="bg-[#eff6ff] border border-[#bfdbfe] rounded-[6px] py-[10px] px-[14px] mb-4 flex flex-col gap-2 text-[13px] text-left">
                <span className="font-semibold text-[#1e40af]">Mã bệnh & Chẩn đoán sơ bộ (Tiếp đón):</span>
                <div className="flex flex-wrap gap-2">
                  {selectedBN.icdList.map(item => (
                    <span key={item.maICD} className="bg-[#dbeafe] text-[#1e3a8a] py-[2px] px-2 rounded font-medium">
                      <strong>{item.maICD}</strong> - {item.tenBenh}
                    </span>
                  ))}
                </div>
              </div>
            ) : selectedBN.maICD ? (
              <div className="bg-[#eff6ff] border border-[#bfdbfe] rounded-[6px] py-[10px] px-[14px] mb-4 flex items-center gap-2 text-[13px]">
                <span className="font-semibold text-[#1e40af]">Mã bệnh & Chẩn đoán sơ bộ (Tiếp đón):</span>
                <span className="text-[#1e3a8a] bg-[#dbeafe] py-[2px] px-2 rounded font-bold">
                  {selectedBN.maICD}
                </span>
                <span className="font-medium text-[#1e40af]">{selectedBN.tenBenhICD}</span>
              </div>
            ) : (
              <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[6px] py-[10px] px-[14px] mb-4 text-[13px] text-[var(--text-muted)] italic text-left">
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
                      className={`form-input pl-3 ${warning ? 'form-input-warning' : ''}`}
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
              <button className="btn-primary w-auto py-[10px] px-6 flex items-center gap-2" onClick={() => luuPhieuKham(1)}>
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
            <div className="kb-add-row mt-3">
              <input
                type="text"
                className="form-input pl-3 flex-1"
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
            <div className="kb-add-row flex-wrap gap-2 mt-3">
              <input type="text" className="form-input pl-3 flex-[2] min-w-[160px]"
                placeholder="Tên thuốc..." value={thuocMoi.tenThuoc}
                onChange={e => setThuocMoi({ ...thuocMoi, tenThuoc: e.target.value })} />
              <input type="text" className="form-input pl-3 flex-[2] min-w-[140px]"
                placeholder="Cách dùng (VD: 1 viên x 3 lần)" value={thuocMoi.soLuong}
                onChange={e => setThuocMoi({ ...thuocMoi, soLuong: e.target.value })} />
              <input type="number" className="form-input pl-3 flex-1 min-w-[80px]"
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
            
            {/* Trình chọn mã ICD-10 */}
            <div className="form-group relative">
              <label className="form-label font-semibold text-[13px] text-left block">Danh sách mã bệnh ICD đã chọn</label>
              
              {/* Danh sách các mã bệnh đã chọn */}
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedIcdList.length === 0 ? (
                  <span className="text-[12.5px] text-[var(--text-muted)] italic text-left">Chưa chọn mã bệnh ICD nào cho kết luận khám.</span>
                ) : (
                  selectedIcdList.map(item => (
                    <span key={item.maICD} className="bg-[#eff6ff] border border-[#bfdbfe] text-[#1e40af] py-[4px] px-[8px] rounded-[4px] font-medium text-[12.5px] flex items-center gap-1.5">
                      <strong>{item.maICD}</strong> - {item.tenBenh}
                      <button 
                        type="button" 
                        onClick={() => setSelectedIcdList(selectedIcdList.filter(x => x.maICD !== item.maICD))}
                        className="bg-transparent border-none text-[#ef4444] cursor-pointer p-0 hover:text-red-700 flex items-center justify-center"
                      >
                        <X size={13} />
                      </button>
                    </span>
                  ))
                )}
              </div>

              {/* Ô tìm kiếm ICD */}
              <div className="flex gap-2">
                <div className="relative flex-1 text-left">
                  <input
                    type="text"
                    className="form-input pl-3 w-full"
                    placeholder="Tìm kiếm mã ICD hoặc tên bệnh lý..."
                    value={icdQuery}
                    onFocus={() => setShowIcdDropdown(true)}
                    onChange={e => {
                      setIcdQuery(e.target.value);
                      setShowIcdDropdown(true);
                    }}
                  />
                  {showIcdDropdown && (
                    <>
                      <div onClick={() => setShowIcdDropdown(false)} className="fixed inset-0 z-[998]" />
                      <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-[var(--border-color)] rounded-[6px] shadow-lg max-h-[220px] overflow-y-auto z-[999]">
                        {danhMucICD
                          .filter(item => 
                            item.maICD.toLowerCase().includes(icdQuery.toLowerCase()) || 
                            item.tenBenh.toLowerCase().includes(icdQuery.toLowerCase())
                          )
                          .slice(0, 30)
                          .map(item => (
                            <div
                              key={item.maICD}
                              className="py-2 px-3 cursor-pointer text-[12.5px] border-b border-[var(--border-color)] text-left hover:bg-slate-50 text-[var(--text-main)]"
                              onClick={() => {
                                if (!selectedIcdList.some(x => x.maICD === item.maICD)) {
                                  setSelectedIcdList([...selectedIcdList, item]);
                                }
                                setIcdQuery('');
                                setShowIcdDropdown(false);
                              }}
                            >
                              <strong className="text-[var(--primary)]">{item.maICD}</strong> - {item.tenBenh}
                            </div>
                          ))
                        }
                        {danhMucICD.filter(item => 
                          item.maICD.toLowerCase().includes(icdQuery.toLowerCase()) || 
                          item.tenBenh.toLowerCase().includes(icdQuery.toLowerCase())
                        ).length === 0 && (
                          <div className="py-3 px-3 text-center text-[12.5px] text-[var(--text-muted)] italic">Không tìm thấy mã ICD phù hợp.</div>
                        )}
                      </div>
                    </>
                  )}
                </div>
                
                {/* Sao chép từ tiếp đón */}
                {((selectedBN.icdList && selectedBN.icdList.length > 0) || selectedBN.maICD) && (
                  <button
                    type="button"
                    onClick={() => {
                      const fromReception = selectedBN.icdList || (selectedBN.maICD ? [{ maICD: selectedBN.maICD, tenBenh: selectedBN.tenBenhICD }] : []);
                      const newList = [...selectedIcdList];
                      fromReception.forEach(r => {
                        if (!newList.some(x => x.maICD === r.maICD)) {
                          newList.push(r);
                        }
                      });
                      setSelectedIcdList(newList);
                    }}
                    className="btn-outline text-xs py-2 px-3 font-semibold h-[38px] flex items-center justify-center shrink-0"
                  >
                    Lấy ICD tiếp đón
                  </button>
                )}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label text-left block">Ghi chú chẩn đoán chi tiết / Kết luận lâm sàng</label>
              <textarea className="form-input kb-textarea" placeholder="Nhập chẩn đoán lâm sàng chi tiết..."
                value={ketLuan.chanDoan} onChange={e => setKetLuan({ ...ketLuan, chanDoan: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label text-left block">Lời dặn / Hướng điều trị</label>
              <textarea className="form-input kb-textarea" placeholder="Nhập lời dặn cho bệnh nhân..."
                value={ketLuan.loiDan} onChange={e => setKetLuan({ ...ketLuan, loiDan: e.target.value })} />
            </div>
            <div className="kb-action-row">
              <button className="btn-outline" onClick={() => setSelectedBN(null)}>Hủy</button>
              <button className="btn-primary w-auto py-[10px] px-6 flex items-center gap-2" onClick={() => luuPhieuKham(3)}>
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
              <div className="py-8 px-4 text-center text-[var(--text-muted)] text-[14px]">
                <User size={32} className="mx-auto mb-3 block opacity-30 text-[var(--text-muted)]" />
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
                      {isSelected && <ChevronRight size={16} className="text-[var(--primary)] mt-1" />}
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
                <p className="text-[#6b7280] text-[13px]">Lý do khám: {selectedBN.lyDoKham || '—'}</p>
              </div>
            </div>
          )}
          {renderContent()}
        </div>

        {/* CỘT PHẢI: Menu các chức năng khám */}
        <div className="kb-right-menu">
          <p className="kb-section-label pt-4 px-[14px] pb-2">Chức năng</p>
          {MENU_ITEMS.map(item => (
            <button
              key={item.key}
              className={`kb-menu-btn ${activeMenu === item.key ? 'kb-menu-btn--active' : ''}`}
              onClick={() => { setActiveMenu(item.key); }}
            >
              <span className="kb-menu-icon">{item.icon}</span>
              <span className="kb-menu-label">{item.label}</span>
              {activeMenu === item.key && <ChevronRight size={16} className="ml-auto" />}
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}

export default KhamBenh;
