import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Search, User, Stethoscope, FlaskConical,
  Pill, ClipboardCheck, Plus, Trash2, Save, ChevronRight, X
} from 'lucide-react';
import { useToast } from '../utils/ToastContext';
import { 
  apiGetICDList, 
  apiGetDSBenhNhanChoKham, 
  apiGetChiTietPhieuKhamBenh, 
  apiCapNhatKhamBenh, 
  apiCapNhatTrangThaiCLS,
  apiGetDichVuCLSList, 
  apiGetThuocList 
} from '../utils/api';

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

  // Mặc định Từ ngày là 30 ngày trước, Đến ngày là hôm nay
  const [tuNgay, setTuNgay] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [denNgay, setDenNgay] = useState(() => new Date().toISOString().split('T')[0]);

  const [dsBenhNhan, setDsBenhNhan] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  
  const [selectedBN, setSelectedBN] = useState(null);
  const [activeMenu, setActiveMenu] = useState('sinhHieu');

  // Khai báo các state thông tin sinh hiệu, cận lâm sàng, đơn thuốc, kết luận
  const [sinhHieu, setSinhHieu] = useState({
    mach: '', nhietDo: '', huyetAp: '', canNang: '', chieuCao: ''
  });
  const [chiDinh, setChiDinh]   = useState([]);
  const [donThuoc, setDonThuoc] = useState([]);
  const [ketLuan, setKetLuan]   = useState({ chanDoan: '', loiDan: '' });

  const [danhMucICD, setDanhMucICD] = useState([]);
  const [selectedIcdList, setSelectedIcdList] = useState([]);
  const [icdQuery, setIcdQuery] = useState('');
  const [showIcdDropdown, setShowIcdDropdown] = useState(false);

  const [clsQuery, setClsQuery] = useState('');
  const [showClsDropdown, setShowClsDropdown] = useState(false);

  const [thuocQuery, setThuocQuery] = useState('');
  const [showThuocDropdown, setShowThuocDropdown] = useState(false);

  const [danhMucCLS, setDanhMucCLS] = useState([]);
  const [danhMucThuoc, setDanhMucThuoc] = useState([]);

  // Hàm chuyển đổi ngày tháng định dạng Việt Nam
  const formatDateVN = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  // Lấy danh sách các ngày trong khoảng
  const getDatesInRange = (startDate, endDate) => {
    if (!startDate || !endDate) return [];
    const dates = [];
    let curr = new Date(startDate);
    const end = new Date(endDate);
    let limitCount = 0;
    while (curr <= end && limitCount < 45) {
      dates.push(curr.toISOString().split('T')[0]);
      curr.setDate(curr.getDate() + 1);
      limitCount++;
    }
    return dates;
  };

  // Tải danh sách bệnh nhân chờ khám từ API theo khoảng ngày
  const fetchPatientList = async (searchQuery = '') => {
    setLoadingList(true);
    try {
      const dates = getDatesInRange(tuNgay, denNgay);
      if (dates.length === 0) {
        setDsBenhNhan([]);
        return;
      }

      // Gọi đồng thời API cho từng ngày trong khoảng đã chọn
      const requests = dates.map(date => 
        apiGetDSBenhNhanChoKham({ 
          search: searchQuery,
          ngayKham: date
        })
      );

      const responses = await Promise.all(requests);
      let mergedData = [];
      responses.forEach(res => {
        if (res && res.data) {
          mergedData = mergedData.concat(res.data);
        }
      });

      // Map trường trạng thái và sắp xếp theo ngày khám giảm dần
      const patients = mergedData.map(item => ({
        ...item,
        trangThai: item.trangThaiKham
      })).sort((a, b) => new Date(b.ngayKham) - new Date(a.ngayKham));

      setDsBenhNhan(patients);
      
      // Tự động chọn bệnh nhân đầu tiên nếu chưa chọn ai
      if (patients.length > 0 && !selectedBN) {
        setSelectedBN(patients[0]);
      }
    } catch (err) {
      console.error('Lỗi tải danh sách bệnh nhân chờ khám:', err);
      showError('Không thể tải danh sách bệnh nhân chờ khám từ máy chủ!');
      setDsBenhNhan([]);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchPatientList(search);
  }, [search, tuNgay, denNgay]);

  // Tải danh mục ICD, CLS, Thuốc từ API khi component mount
  useEffect(() => {
    const fetchCatalogs = async () => {
      // 1. Tải danh mục ICD
      try {
        const resIcd = await apiGetICDList('', '', 1, 1000);
        if (resIcd && resIcd.data) {
          setDanhMucICD(resIcd.data.map(item => ({
            maICD: item.MaICD || item.maICD || '',
            tenBenh: item.TenBenh || item.tenBenh || ''
          })));
        }
      } catch (err) {
        console.error('Lỗi tải danh mục ICD:', err);
      }

      // 2. Tải danh mục CLS (đổi true thành 1 để phù hợp kiểu dữ liệu int của C# Backend)
      try {
        const resCls = await apiGetDichVuCLSList('', '', 1, 1, 1000);
        if (resCls && resCls.data) {
          setDanhMucCLS(resCls.data);
        }
      } catch (err) {
        console.error('Lỗi tải danh mục CLS:', err);
      }

      // 3. Tải danh mục thuốc
      try {
        const resThuoc = await apiGetThuocList('', '', '', '', 1, 1000);
        if (resThuoc && resThuoc.data) {
          setDanhMucThuoc(resThuoc.data);
        }
      } catch (err) {
        console.error('Lỗi tải danh mục thuốc:', err);
      }
    };
    fetchCatalogs();
  }, []);

  // Cập nhật thông tin chi tiết khám bệnh mỗi khi đổi bệnh nhân từ API
  useEffect(() => {
    if (selectedBN && selectedBN.maPhieu) {
      const fetchDetail = async () => {
        setLoadingDetail(true);
        try {
          const res = await apiGetChiTietPhieuKhamBenh(selectedBN.maPhieu);
          if (res && res.data) {
            const data = res.data;
            setSinhHieu({
              mach: data.sinhHieu?.mach || '',
              nhietDo: data.sinhHieu?.nhietDo || '',
              huyetAp: data.sinhHieu?.huyetAp || '',
              canNang: data.sinhHieu?.canNang || '',
              chieuCao: data.sinhHieu?.chieuCao || ''
            });
            setChiDinh(data.chiDinhCLS ? data.chiDinhCLS.map(c => ({
              id: c.maChiTiet,
              maDV: c.maDV,
              tenXN: c.tenDV,
              ketQua: c.ketQua,
              trangThaiDichVu: c.trangThaiDichVu
            })) : []);
            setDonThuoc(data.donThuoc && data.donThuoc.chiTiet ? data.donThuoc.chiTiet.map(t => ({
              id: t.maThuoc,
              maThuoc: t.maThuoc,
              tenThuoc: t.tenThuoc,
              soLuong: t.soLuong,
              cachDung: t.cachDung,
              trangThaiPhatThuoc: t.trangThaiPhatThuoc
            })) : []);
            setKetLuan({
              chanDoan: data.ketLuan ? data.ketLuan.replace(/\s*\[CLS_STATUS:.*?\]/g, '') : '',
              loiDan: data.donThuoc?.loiDan || ''
            });
            setSelectedIcdList(data.icdList ? data.icdList.map(icd => ({
              maICD: icd.maICD,
              tenBenh: icd.tenBenh
            })) : []);
            setIcdQuery('');
            setShowIcdDropdown(false);
          }
        } catch (err) {
          console.error('Lỗi tải chi tiết phiếu khám:', err);
          showError('Không thể tải chi tiết bệnh án của bệnh nhân này!');
        } finally {
          setLoadingDetail(false);
        }
      };
      fetchDetail();
    } else {
      setSinhHieu({ mach: '', nhietDo: '', huyetAp: '', canNang: '', chieuCao: '' });
      setChiDinh([]);
      setDonThuoc([]);
      setKetLuan({ chanDoan: '', loiDan: '' });
      setSelectedIcdList([]);
      setIcdQuery('');
      setShowIcdDropdown(false);
    }
  }, [selectedBN?.maPhieu]);

  // Lưu thông tin khám bệnh lên Backend C#
  const luuPhieuKham = async (updatedTrangThai = null) => {
    if (!selectedBN) return;

    const newTrangThai = updatedTrangThai !== null ? updatedTrangThai : (selectedBN.trangThaiKham ?? selectedBN.trangThai);
    
    if (sinhHieu.huyetAp && !/^\d{2,3}\/\d{2,3}$/.test(sinhHieu.huyetAp.trim())) {
      showError('Huyết áp không đúng định dạng (VD: 120/80)!');
      return;
    }

    if (newTrangThai === 3 && !ketLuan.chanDoan.trim()) {
      showError('Vui lòng nhập kết luận chẩn đoán trước khi hoàn thành khám!');
      return;
    }

    const payload = {
      mach: sinhHieu.mach ? parseInt(sinhHieu.mach, 10) : null,
      nhietDo: sinhHieu.nhietDo ? parseFloat(sinhHieu.nhietDo) : null,
      huyetAp: sinhHieu.huyetAp ? sinhHieu.huyetAp.trim() : null,
      canNang: sinhHieu.canNang ? parseFloat(sinhHieu.canNang) : null,
      chieuCao: sinhHieu.chieuCao ? parseFloat(sinhHieu.chieuCao) : null,
      chiDinhCLSMoi: chiDinh.filter(c => c.isNew).map(c => c.maDV),
      loiDan: ketLuan.loiDan ? ketLuan.loiDan.trim() : null,
      // Chỉ gửi thuốc chưa phát — thuốc đã phát (trangThaiPhatThuoc=true) không được ghi đè
      donThuoc: donThuoc.filter(t => !t.trangThaiPhatThuoc).map(t => ({
        maThuoc: t.maThuoc,
        soLuong: parseInt(t.soLuong, 10),
        cachDung: t.cachDung.trim()
      })),
      ketLuan: ketLuan.chanDoan ? ketLuan.chanDoan.trim() : null,
      icdList: selectedIcdList.map(x => x.maICD),
      trangThaiKham: newTrangThai
    };

    try {
      const res = await apiCapNhatKhamBenh(selectedBN.maPhieu, payload);
      if (res && res.data) {
        showSuccess(res.message || 'Lưu thông tin khám bệnh thành công!');
        // Cập nhật lại trạng thái bệnh nhân đang chọn ngay lập tức
        setSelectedBN(prev => ({
          ...prev,
          trangThai: newTrangThai,
          trangThaiKham: newTrangThai
        }));
        // Tải lại danh sách bệnh nhân để sidebar phản ánh trạng thái mới
        fetchPatientList(search);
      }
    } catch (err) {
      showError(err.message || 'Không thể lưu thông tin khám bệnh, vui lòng thử lại.');
    }
  };

  // Bộ lọc tìm kiếm bệnh nhân trong danh sách chờ theo Tên, Mã BN, Mã Phiếu
  const dsBNFilter = dsBenhNhan.filter(bn =>
    bn.hoTen.toLowerCase().includes(search.toLowerCase()) ||
    bn.maBN?.includes(search) ||
    bn.maPhieu?.includes(search)
  );

  // Chọn một dịch vụ cận lâm sàng mới từ gợi ý tìm kiếm
  const chonCLS = (cls) => {
    if (chiDinh.some(x => x.maDV === cls.maDV)) {
      showError('Dịch vụ cận lâm sàng này đã được chỉ định rồi!');
      setClsQuery('');
      setShowClsDropdown(false);
      return;
    }
    setChiDinh([...chiDinh, {
      id: cls.maDV,
      maDV: cls.maDV,
      tenXN: cls.tenDV,
      ketQua: null,
      trangThaiDichVu: 0,
      isNew: true
    }]);
    setClsQuery('');
    setShowClsDropdown(false);
  };
  
  // Xóa chỉ định cận lâm sàng khỏi danh sách
  const xoaChiDinh = (id) => setChiDinh(chiDinh.filter(c => c.id !== id && c.maDV !== id));

  // Thay đổi trạng thái thực hiện của dịch vụ cận lâm sàng (Đã làm / Chưa thực hiện) qua API
  const toggleTrangThaiCLS = async (id) => {
    const cls = chiDinh.find(c => c.id === id || c.maDV === id);
    if (!cls || !selectedBN?.maPhieu) return;

    // Dịch vụ mới chưa lưu (isNew) thì chỉ toggle local, chưa có maChiTiet để gọi API
    if (cls.isNew) {
      setChiDinh(prev => prev.map(c =>
        c.id === id || c.maDV === id
          ? { ...c, trangThaiDichVu: c.trangThaiDichVu === 1 ? 0 : 1 }
          : c
      ));
      return;
    }

    const newTrangThai = cls.trangThaiDichVu === 1 ? 0 : 1;
    try {
      await apiCapNhatTrangThaiCLS(selectedBN.maPhieu, cls.id, newTrangThai);
      setChiDinh(prev => prev.map(c =>
        c.id === id || c.maDV === id
          ? { ...c, trangThaiDichVu: newTrangThai }
          : c
      ));
      showSuccess(newTrangThai === 1 ? 'Đã cập nhật: CLS hoàn thành!' : 'Đã cập nhật: CLS chưa thực hiện!');
    } catch (err) {
      showError(err.message || 'Không thể cập nhật trạng thái CLS, vui lòng thử lại.');
    }
  };

  // Chọn thuốc mới từ gợi ý tìm kiếm (tự động thêm vào đơn thuốc)
  const chonThuocMoi = (thuoc) => {
    if (donThuoc.some(x => x.maThuoc === thuoc.maThuoc)) {
      showError('Thuốc này đã được kê trong đơn thuốc của bệnh nhân!');
      setThuocQuery('');
      setShowThuocDropdown(false);
      return;
    }

    setDonThuoc([...donThuoc, {
      id: thuoc.maThuoc,
      maThuoc: thuoc.maThuoc,
      tenThuoc: thuoc.tenThuoc,
      soLuong: 1, // Mặc định số lượng là 1
      cachDung: 'Ngày uống 2 lần, mỗi lần 1 viên' // Mặc định hướng dẫn cách dùng
    }]);

    setThuocQuery('');
    setShowThuocDropdown(false);
  };

  // Cập nhật số lượng thuốc trực tiếp trên dòng bảng kê đơn
  const capNhatSoLuongThuoc = (id, val) => {
    setDonThuoc(prev => prev.map(t => t.id === id || t.maThuoc === id ? { ...t, soLuong: val } : t));
  };

  // Cập nhật hướng dẫn sử dụng thuốc trực tiếp trên dòng bảng kê đơn
  const capNhatCachDungThuoc = (id, val) => {
    setDonThuoc(prev => prev.map(t => t.id === id || t.maThuoc === id ? { ...t, cachDung: val } : t));
  };
  
  // Xóa thuốc đã kê khỏi đơn thuốc
  const xoaThuoc = (id) => setDonThuoc(donThuoc.filter(t => t.id !== id && t.maThuoc !== id));

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
              <button className="btn-primary !w-fit !mt-0 py-[10px] px-6 flex items-center gap-2" onClick={() => luuPhieuKham(1)}>
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
                    <span className="kb-list-text flex-1 text-left">{c.tenXN}</span>
                    <div className="flex items-center gap-2">
                      <button 
                        className={`px-3 py-1 text-[11px] font-semibold rounded-full border transition-all ${
                          c.trangThaiDichVu === 1
                            ? 'bg-[#e2fbeb] text-[#14532d] border-[#bbf7d0] hover:bg-[#bbf7d0] cursor-pointer'
                            : 'bg-[#fef9c3] text-[#713f12] border-[#fef08a] hover:bg-[#fef08a] cursor-pointer'
                        }`}
                        onClick={() => toggleTrangThaiCLS(c.id)}
                      >
                        {c.trangThaiDichVu === 1 ? 'Đã làm CLS' : 'Chưa thực hiện'}
                      </button>
                      <button className="kb-icon-btn kb-icon-btn--danger" onClick={() => xoaChiDinh(c.id)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="form-group relative mt-3">
              <label className="form-label font-semibold text-[13px] text-left block mb-1">Tìm kiếm dịch vụ cận lâm sàng</label>
              <div className="relative">
                <input
                  type="text"
                  className="form-input pl-3 w-full h-[38px] text-[13px]"
                  placeholder="Nhập mã hoặc tên dịch vụ siêu âm, xét nghiệm..."
                  value={clsQuery}
                  onFocus={() => setShowClsDropdown(true)}
                  onChange={e => {
                    setClsQuery(e.target.value);
                    setShowClsDropdown(true);
                  }}
                />
                {showClsDropdown && (
                  <>
                    <div onClick={() => setShowClsDropdown(false)} className="fixed inset-0 z-[998]" />
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-[var(--border-color)] rounded-[6px] shadow-lg max-h-[220px] overflow-y-auto z-[999] text-left">
                      {danhMucCLS
                        .filter(item => 
                          item.maDV.toLowerCase().includes(clsQuery.toLowerCase()) || 
                          item.tenDV.toLowerCase().includes(clsQuery.toLowerCase())
                        )
                        .map(item => (
                          <div
                            key={item.maDV}
                            className="p-2.5 hover:bg-[#f1f5f9] cursor-pointer border-b border-[#f1f5f9] text-[13px] transition-colors"
                            onClick={() => chonCLS(item)}
                          >
                            <span className="font-semibold text-[var(--primary)] mr-1">[{item.maDV}]</span>
                            <span>{item.tenDV}</span>
                            <span className="text-[var(--text-muted)] text-[12px] ml-2">({item.giaTien?.toLocaleString('vi-VN')}đ)</span>
                          </div>
                        ))}
                      {danhMucCLS.filter(item => 
                        item.maDV.toLowerCase().includes(clsQuery.toLowerCase()) || 
                        item.tenDV.toLowerCase().includes(clsQuery.toLowerCase())
                      ).length === 0 && (
                        <div className="p-3 text-[13px] text-[var(--text-muted)] text-center italic">Không tìm thấy dịch vụ nào phù hợp</div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="kb-action-row mt-4 border-t border-[var(--border-color)] pt-3.5">
              <button
                className="btn-primary !w-fit !mt-0 py-[10px] px-6 flex items-center gap-2"
                onClick={() => {
                  // Nếu tất cả CLS đã hoàn thành → trạng thái quay về 1 (đang khám) để tiếp tục kê thuốc / kết luận
                  // Nếu còn CLS chưa làm → giữ trạng thái 2 (chờ CLS)
                  const allDone = chiDinh.length > 0 && chiDinh.every(c => c.trangThaiDichVu === 1);
                  luuPhieuKham(allDone ? 1 : 2);
                }}
              >
                <Save size={16} />
                {chiDinh.length > 0 && chiDinh.every(c => c.trangThaiDichVu === 1)
                  ? 'Lưu & Tiếp tục khám'
                  : 'Lưu chỉ định CLS'}
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
                    <th style={{ width: '50px' }}>STT</th>
                    <th style={{ width: '220px' }}>Tên thuốc</th>
                    <th style={{ width: '100px' }}>Số lượng</th>
                    <th>Cách dùng</th>
                    <th style={{ width: '50px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {donThuoc.map((t, i) => (
                    <tr key={t.id} className={t.trangThaiPhatThuoc ? 'opacity-60 bg-[#f8fafc]' : ''}>
                      <td className="text-center">{i + 1}</td>
                      <td>
                        <span className="font-semibold text-[var(--primary)]">[{t.maThuoc}]</span> {t.tenThuoc}
                        {t.trangThaiPhatThuoc && <span className="ml-2 text-[11px] text-[#16a34a] font-semibold bg-[#dcfce7] px-1.5 py-0.5 rounded-full">Đã phát</span>}
                      </td>
                      <td>
                        <input 
                          type="number" 
                          min="1"
                          className="form-input py-1 px-2 text-[13px] w-20 text-center border border-[var(--border-color)] rounded-[var(--radius-md)] disabled:opacity-50 disabled:cursor-not-allowed" 
                          value={t.soLuong} 
                          disabled={!!t.trangThaiPhatThuoc}
                          onChange={e => capNhatSoLuongThuoc(t.id, e.target.value)} 
                        />
                      </td>
                      <td>
                        <input 
                          type="text" 
                          className="form-input py-1 px-3 text-[13px] w-full border border-[var(--border-color)] rounded-[var(--radius-md)] disabled:opacity-50 disabled:cursor-not-allowed" 
                          placeholder="Cách dùng (Ví dụ: Ngày uống 2 lần, mỗi lần 1 viên)..."
                          value={t.cachDung} 
                          disabled={!!t.trangThaiPhatThuoc}
                          onChange={e => capNhatCachDungThuoc(t.id, e.target.value)} 
                        />
                      </td>
                      <td className="text-center">
                        {!t.trangThaiPhatThuoc && (
                          <button className="kb-icon-btn kb-icon-btn--danger" onClick={() => xoaThuoc(t.id)}>
                            <Trash2 size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}

                </tbody>
              </table>
            )}

            
            <div className="form-group relative mt-3">
              <label className="form-label font-semibold text-[13px] text-left block mb-1">Tìm kiếm thuốc kê đơn</label>
              <div className="relative">
                <input
                  type="text"
                  className="form-input pl-3 w-full h-[38px] text-[13px]"
                  placeholder="Nhập mã hoặc tên thuốc cần kê đơn..."
                  value={thuocQuery}
                  onFocus={() => setShowThuocDropdown(true)}
                  onChange={e => {
                    setThuocQuery(e.target.value);
                    setShowThuocDropdown(true);
                  }}
                />
                {showThuocDropdown && (
                  <>
                    <div onClick={() => setShowThuocDropdown(false)} className="fixed inset-0 z-[998]" />
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-[var(--border-color)] rounded-[6px] shadow-lg max-h-[220px] overflow-y-auto z-[999] text-left">
                      {danhMucThuoc
                        .filter(item => 
                          item.maThuoc.toLowerCase().includes(thuocQuery.toLowerCase()) || 
                          item.tenThuoc.toLowerCase().includes(thuocQuery.toLowerCase())
                        )
                        .map(item => (
                          <div
                            key={item.maThuoc}
                            className="p-2.5 hover:bg-[#f1f5f9] cursor-pointer border-b border-[#f1f5f9] text-[13px] transition-colors"
                            onClick={() => chonThuocMoi(item)}
                          >
                            <span className="font-semibold text-[var(--primary)] mr-1">[{item.maThuoc}]</span>
                            <span>{item.tenThuoc}</span>
                            {item.hoatChat && <span className="text-[var(--text-muted)] text-[12px] ml-2">({item.hoatChat})</span>}
                            <span className="text-[var(--text-muted)] text-[12px] ml-2">[{item.donViTinh || 'đơn vị'}]</span>
                          </div>
                        ))}
                      {danhMucThuoc.filter(item => 
                        item.maThuoc.toLowerCase().includes(thuocQuery.toLowerCase()) || 
                        item.tenThuoc.toLowerCase().includes(thuocQuery.toLowerCase())
                      ).length === 0 && (
                        <div className="p-3 text-[13px] text-[var(--text-muted)] text-center italic">Không tìm thấy thuốc nào phù hợp</div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="kb-action-row mt-4 border-t border-[var(--border-color)] pt-3.5">
              <button className="btn-primary !w-fit !mt-0 py-[10px] px-6 flex items-center gap-2" onClick={() => luuPhieuKham(1)}>
                <Save size={16} /> Lưu đơn thuốc
              </button>
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
              {/* Nút đổi thành Kết thúc khám khi đã điền chanDoan và chọn ICD */}
              {ketLuan.chanDoan.trim() && selectedIcdList.length > 0 ? (
                <button
                  className="!w-fit !mt-0 py-[10px] px-6 flex items-center gap-2 font-semibold rounded-[var(--radius-md)] transition-all bg-[#16a34a] hover:bg-[#15803d] text-white border-none cursor-pointer text-[14px] shadow-md"
                  onClick={() => luuPhieuKham(3)}
                >
                  <ClipboardCheck size={16} /> Kết thúc khám
                </button>
              ) : (
                <button
                  className="btn-primary !w-fit !mt-0 py-[10px] px-6 flex items-center gap-2 opacity-70"
                  onClick={() => luuPhieuKham(1)}
                  title="Nhập đầy đủ chẩn đoán và mã ICD để hoàn thành khám"
                >
                  <Save size={16} /> Lưu kết luận
                </button>
              )}
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

          {/* Lọc theo khoảng ngày tiếp nhận */}
          <div className="px-4 py-3 border-b border-[var(--border-color)] flex flex-col gap-2.5 bg-white">
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-[var(--text-muted)] w-14 shrink-0 font-semibold text-left">Từ ngày:</span>
              <div className="relative flex-1 h-9">
                <input
                  type="date" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                  value={tuNgay} 
                  onChange={e => setTuNgay(e.target.value)}
                />
                <div className="form-input pl-3 pr-2 h-9 flex items-center text-[12.5px] bg-white border border-[var(--border-color)] rounded-[var(--radius-md)] pointer-events-none w-full font-medium shadow-[var(--shadow-sm)] justify-start">
                  {formatDateVN(tuNgay)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-[var(--text-muted)] w-14 shrink-0 font-semibold text-left">Đến ngày:</span>
              <div className="relative flex-1 h-9">
                <input
                  type="date" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                  value={denNgay} 
                  onChange={e => setDenNgay(e.target.value)}
                />
                <div className="form-input pl-3 pr-2 h-9 flex items-center text-[12.5px] bg-white border border-[var(--border-color)] rounded-[var(--radius-md)] pointer-events-none w-full font-medium shadow-[var(--shadow-sm)] justify-start">
                  {formatDateVN(denNgay)}
                </div>
              </div>
            </div>
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
