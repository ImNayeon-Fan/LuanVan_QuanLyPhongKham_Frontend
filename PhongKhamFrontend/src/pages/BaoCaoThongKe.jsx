import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, BarChart3, Users, DollarSign, 
  Calendar, Filter, RefreshCw,
  Pill, Activity, CheckCircle, ClipboardList, Clock
} from 'lucide-react';
import { 
  apiGetStaffList, 
  apiGetDoanhThuTongQuan,
  apiGetLuotKhamGanDay,
  apiGetDanhSachTiepNhan
} from '../utils/api';
import { useToast } from '../utils/ToastContext';

// Component Chọn Ngày Chuẩn Định Dạng Việt Nam (DD/MM/YYYY - Ngày / Tháng / Năm)
const DatePickerVN = ({ value, onChange, placeholder = 'dd/mm/yyyy' }) => {
  const displayVal = (() => {
    if (!value) return '';
    const parts = value.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`; // DD/MM/YYYY
    }
    return value;
  })();

  return (
    <div className="relative inline-flex items-center">
      <input
        type="text"
        readOnly
        value={displayVal}
        placeholder={placeholder}
        onClick={(e) => {
          const next = e.currentTarget.nextSibling;
          if (next && next.showPicker) {
            next.showPicker();
          } else if (next) {
            next.focus();
            next.click();
          }
        }}
        className="border border-slate-300 rounded-lg pl-3 pr-8 py-1.5 text-xs outline-none focus:border-sky-500 font-inherit bg-white cursor-pointer w-[130px] font-semibold text-slate-700 shadow-sm"
      />
      <input
        type="date"
        lang="vi-VN"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="absolute right-0 opacity-0 w-8 h-full cursor-pointer z-10"
      />
      <Calendar size={14} className="absolute right-2.5 text-slate-400 pointer-events-none z-0" />
    </div>
  );
};

function BaoCaoThongKe() {
  const navigate = useNavigate();
  const { showError } = useToast();

  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('month'); // 'today' | 'week' | 'month' | 'all'

  // Stats data từ Backend API apiGetDoanhThuTongQuan
  const [stats, setStats] = useState({
    tongDoanhThu: 0,
    tongLuotKham: 0,
    doanhThuDichVu: 0,
    doanhThuThuoc: 0,
    doanhThuVatTu: 0,
    percentCLS: 0,
    percentThuoc: 0,
    percentVatTu: 0
  });

  const [danhSachPhieu, setDanhSachPhieu] = useState([]);
  const [danhSachBacSi, setDanhSachBacSi] = useState([]);

  // Filter states cho bảng lượt khám
  const [filterTuNgay, setFilterTuNgay] = useState('');
  const [filterDenNgay, setFilterDenNgay] = useState('');
  const [filterBacSi, setFilterBacSi] = useState('');

  // 1. Tải danh sách bác sĩ để chọn lọc
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const resStaff = await apiGetStaffList('active', 1, 1000);
        const docs = (resStaff?.data || []).filter(s => s.roleID === 2 || s.roleName === 'BacSi');
        setDanhSachBacSi(docs);
      } catch (e) {
        console.warn('Không lấy được danh sách bác sĩ:', e);
      }
    };
    fetchStaff();
  }, []);

  // 2. Tải Doanh thu tổng quan từ Backend dựa vào timeRange
  useEffect(() => {
    loadDoanhThuTongQuan();
  }, [timeRange]);

  // 3. Tải Danh sách Lượt khám gần đây từ Backend theo các tiêu chí lọc
  useEffect(() => {
    loadLuotKhamGanDay();
  }, [filterTuNgay, filterDenNgay, filterBacSi]);

  const loadDoanhThuTongQuan = async () => {
    setLoading(true);
    try {
      const res = await apiGetDoanhThuTongQuan(timeRange);
      if (res) {
        setStats({
          tongDoanhThu: res.tongDoanhThu || 0,
          tongLuotKham: res.tongLuotKham || 0,
          doanhThuDichVu: res.doanhThuTheoHangMuc?.canLamSang?.soTien || 0,
          doanhThuThuoc: res.doanhThuTheoHangMuc?.thuocKeDon?.soTien || 0,
          doanhThuVatTu: res.doanhThuTheoHangMuc?.vatTuYTe?.soTien || 0,
          percentCLS: res.doanhThuTheoHangMuc?.canLamSang?.phanTram || 0,
          percentThuoc: res.doanhThuTheoHangMuc?.thuocKeDon?.phanTram || 0,
          percentVatTu: res.doanhThuTheoHangMuc?.vatTuYTe?.phanTram || 0,
        });
        return;
      }
      
      // Fallback nếu Backend trả 404 (do máy chủ .NET chưa build/restart lại ThongKeController mới)
      const resPhieu = await apiGetDanhSachTiepNhan({ page: 1, limit: 1000 });
      let listPhieu = resPhieu?.data || [];
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];

      let filteredPhieu = listPhieu;
      if (timeRange === 'today') {
        filteredPhieu = listPhieu.filter(p => p.ngayKham && p.ngayKham.startsWith(todayStr));
      } else if (timeRange === 'week') {
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        filteredPhieu = listPhieu.filter(p => p.ngayKham && p.ngayKham >= sevenDaysAgo);
      } else if (timeRange === 'month') {
        const firstDayMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
        filteredPhieu = listPhieu.filter(p => p.ngayKham && p.ngayKham >= firstDayMonth);
      }

      const luotKham = filteredPhieu.length;
      let sumCLS = 0, sumThuoc = 0, sumVatTu = 0;
      filteredPhieu.forEach(p => {
        sumCLS += (p.tongTienCLS || p.tongTienDichVu || 0);
        sumThuoc += (p.tongTienThuoc || 0);
        sumVatTu += (p.tongTienVatTu || 0);
      });
      const tongTien = sumCLS + sumThuoc + sumVatTu;
      const percentCLS = tongTien > 0 ? Math.round((sumCLS / tongTien) * 100) : 0;
      const percentThuoc = tongTien > 0 ? Math.round((sumThuoc / tongTien) * 100) : 0;
      const percentVatTu = tongTien > 0 ? Math.round((sumVatTu / tongTien) * 100) : 0;

      setStats({
        tongDoanhThu: tongTien,
        tongLuotKham: luotKham,
        doanhThuDichVu: sumCLS,
        doanhThuThuoc: sumThuoc,
        doanhThuVatTu: sumVatTu,
        percentCLS,
        percentThuoc,
        percentVatTu
      });

    } catch (err) {
      console.error('Không nạp được doanh thu tổng quan:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadLuotKhamGanDay = async () => {
    try {
      const res = await apiGetLuotKhamGanDay({
        tuNgay: filterTuNgay,
        denNgay: filterDenNgay,
        maBacSi: filterBacSi
      });
      if (res && res.danhSach) {
        setDanhSachPhieu(res.danhSach);
        return;
      }

      // Fallback nếu Backend 404
      const resPhieu = await apiGetDanhSachTiepNhan({ page: 1, limit: 1000 });
      let listPhieu = resPhieu?.data || [];
      let filtered = listPhieu;
      if (filterTuNgay) filtered = filtered.filter(p => p.ngayKham && p.ngayKham.slice(0, 10) >= filterTuNgay);
      if (filterDenNgay) filtered = filtered.filter(p => p.ngayKham && p.ngayKham.slice(0, 10) <= filterDenNgay);
      if (filterBacSi) filtered = filtered.filter(p => (p.maBacSi || p.maNV) === filterBacSi);
      
      setDanhSachPhieu(filtered.map(p => ({
        maPhieu: p.maPhieu,
        hoTenBenhNhan: p.hoTen || p.hoTenKhach,
        maBacSi: p.maBacSi || p.maNV,
        tenBacSi: p.tenBacSi || p.tenNhanVien,
        ngayKham: p.ngayKham,
        trangThaiThanhToan: p.daThanhToan ? 'DaThanhToan' : 'ChuaThanhToan'
      })));
    } catch (err) {
      console.error('Không nạp được lượt khám gần đây:', err);
    }
  };

  const formatMoney = (amount) => {
    return (amount || 0).toLocaleString('vi-VN') + ' đ';
  };

  return (
    <div className="kb-wrapper h-screen overflow-hidden flex flex-col bg-[#f8fafc]">
      {/* Topbar điều hướng */}
      <div className="kb-topbar h-[50px] px-5 flex items-center justify-between bg-white border-b border-slate-200">
        <div className="flex-1 flex justify-start">
          <button className="kb-back-btn py-[5px] px-[10px] text-slate-700 hover:text-sky-600 flex items-center gap-1.5 cursor-pointer border-none bg-transparent" onClick={() => navigate('/staff')}>
            <ArrowLeft size={16} /> Quay về trang chủ
          </button>
        </div>
        <div className="kb-topbar-title flex-1 flex justify-center items-center text-[15px] font-bold text-slate-800">
          <BarChart3 size={18} className="mr-1.5 text-sky-600" />
          Báo Cáo & Thống Kê Quản Trị
        </div>
        <div className="flex-1"></div>
      </div>

      {/* Vùng nội dung chính */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Bộ lọc mốc thời gian */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-slate-500" />
            <span className="text-sm font-semibold text-slate-700">Mốc thời gian thống kê:</span>
          </div>

          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setTimeRange('today')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all border-none cursor-pointer ${
                timeRange === 'today' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-600 hover:text-slate-900 bg-transparent'
              }`}
            >
              Hôm nay
            </button>
            <button
              onClick={() => setTimeRange('week')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all border-none cursor-pointer ${
                timeRange === 'week' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-600 hover:text-slate-900 bg-transparent'
              }`}
            >
              7 ngày qua
            </button>
            <button
              onClick={() => setTimeRange('month')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all border-none cursor-pointer ${
                timeRange === 'month' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-600 hover:text-slate-900 bg-transparent'
              }`}
            >
              Tháng này
            </button>
            <button
              onClick={() => setTimeRange('all')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all border-none cursor-pointer ${
                timeRange === 'all' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-600 hover:text-slate-900 bg-transparent'
              }`}
            >
              Tất cả thời gian
            </button>
          </div>

          <button
            onClick={() => {
              loadDoanhThuTongQuan();
              loadLuotKhamGanDay();
            }}
            disabled={loading}
            className="text-xs font-medium text-slate-600 hover:text-sky-600 flex items-center gap-1 bg-transparent border-none cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Làm mới
          </button>
        </div>

        {/* 2 Thẻ KPI chính */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <DollarSign size={24} />
            </div>
            <div>
              <div className="text-xs font-medium text-slate-500">Tổng doanh thu thực tế</div>
              <div className="text-xl font-bold text-slate-800 mt-0.5">{formatMoney(stats.tongDoanhThu)}</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              <Users size={24} />
            </div>
            <div>
              <div className="text-xs font-medium text-slate-500">Lượt khám bệnh trong mốc</div>
              <div className="text-xl font-bold text-slate-800 mt-0.5">{stats.tongLuotKham} lượt</div>
            </div>
          </div>
        </div>

        {/* Biểu đồ Thống kê Doanh thu (Cận lâm sàng, Tiền thuốc, Tiền vật tư) từ Backend */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800 m-0 flex items-center gap-2">
              <Activity size={18} className="text-sky-600" />
              Biểu Đồ Thống Kê Doanh Thu Theo Hạng Mục
            </h3>
            <span className="text-xs text-slate-500 font-medium">Đồng bộ chuẩn xác từ Backend REST API</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* 1. Tiền Cận Lâm Sàng */}
            <div className="p-4 rounded-xl bg-sky-50/60 border border-sky-100 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-sky-800">
                  <span className="flex items-center gap-1.5">
                    <Activity size={16} className="text-sky-600" />
                    Tiền Cận Lâm Sàng (CLS)
                  </span>
                  {stats.tongDoanhThu > 0 && <span className="font-bold text-sky-700">{stats.percentCLS}%</span>}
                </div>
                <div className="text-xl font-extrabold text-slate-800 mt-2.5">
                  {formatMoney(stats.doanhThuDichVu)}
                </div>
              </div>
              <div className="w-full bg-sky-200 h-2.5 rounded-full overflow-hidden mt-4">
                <div className="bg-sky-600 h-full transition-all duration-500 rounded-full" style={{ width: `${stats.tongDoanhThu > 0 ? stats.percentCLS : 0}%` }} />
              </div>
            </div>

            {/* 2. Tiền Thuốc Kê Đơn */}
            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-emerald-800">
                  <span className="flex items-center gap-1.5">
                    <Pill size={16} className="text-emerald-600" />
                    Tiền Thuốc Kê Đơn
                  </span>
                  {stats.tongDoanhThu > 0 && <span className="font-bold text-emerald-700">{stats.percentThuoc}%</span>}
                </div>
                <div className="text-xl font-extrabold text-slate-800 mt-2.5">
                  {formatMoney(stats.doanhThuThuoc)}
                </div>
              </div>
              <div className="w-full bg-emerald-200 h-2.5 rounded-full overflow-hidden mt-4">
                <div className="bg-emerald-600 h-full transition-all duration-500 rounded-full" style={{ width: `${stats.tongDoanhThu > 0 ? stats.percentThuoc : 0}%` }} />
              </div>
            </div>

            {/* 3. Tiền Vật Tư Y Tế */}
            <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-100 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-amber-800">
                  <span className="flex items-center gap-1.5">
                    <ClipboardList size={16} className="text-amber-600" />
                    Tiền Vật Tư Y Tế
                  </span>
                  {stats.tongDoanhThu > 0 && <span className="font-bold text-amber-700">{stats.percentVatTu}%</span>}
                </div>
                <div className="text-xl font-extrabold text-slate-800 mt-2.5">
                  {formatMoney(stats.doanhThuVatTu)}
                </div>
              </div>
              <div className="w-full bg-amber-200 h-2.5 rounded-full overflow-hidden mt-4">
                <div className="bg-amber-500 h-full transition-all duration-500 rounded-full" style={{ width: `${stats.tongDoanhThu > 0 ? stats.percentVatTu : 0}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Bảng danh sách phiếu khám kết nối với API GET /api/ThongKe/LuotKhamGanDay */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-slate-800 m-0 flex items-center gap-1.5">
              <Calendar size={16} className="text-sky-600" />
              Danh Sách Lượt Khám Gần Đây ({danhSachPhieu.length})
            </h3>
            
            {/* Thanh Bộ lọc */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                <span>Từ ngày:</span>
                <DatePickerVN
                  value={filterTuNgay}
                  onChange={(val) => setFilterTuNgay(val)}
                  placeholder="dd/mm/yyyy"
                />
              </div>

              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                <span>Đến ngày:</span>
                <DatePickerVN
                  value={filterDenNgay}
                  onChange={(val) => setFilterDenNgay(val)}
                  placeholder="dd/mm/yyyy"
                />
              </div>

              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                <span>Bác sĩ khám:</span>
                <select
                  value={filterBacSi}
                  onChange={(e) => setFilterBacSi(e.target.value)}
                  className="border border-slate-300 rounded-lg px-2.5 py-1 text-xs outline-none focus:border-sky-500 font-inherit bg-white min-w-[160px]"
                >
                  <option value="">-- Tất cả bác sĩ --</option>
                  {danhSachBacSi.map(doc => (
                    <option key={doc.maNV} value={doc.maNV}>
                      {doc.hoTen} ({doc.chuyenMon || doc.maKhoa || doc.maNV})
                    </option>
                  ))}
                </select>
              </div>

              {(filterTuNgay || filterDenNgay || filterBacSi) && (
                <button
                  onClick={() => {
                    setFilterTuNgay('');
                    setFilterDenNgay('');
                    setFilterBacSi('');
                  }}
                  className="text-xs text-red-500 hover:text-red-700 font-bold underline bg-transparent border-none cursor-pointer"
                >
                  Xóa lọc
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                  <th className="p-3">STT</th>
                  <th className="p-3">Mã phiếu</th>
                  <th className="p-3">Họ và tên bệnh nhân</th>
                  <th className="p-3">Bác sĩ khám</th>
                  <th className="p-3">Ngày khám</th>
                  <th className="p-3">Trạng thái thanh toán</th>
                </tr>
              </thead>
              <tbody>
                {danhSachPhieu.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-slate-400">
                      Chưa có lượt khám nào trong khoảng thời gian hoặc bộ lọc đã chọn.
                    </td>
                  </tr>
                ) : (
                  danhSachPhieu.map((p, i) => (
                    <tr key={p.maPhieu || i} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-3">{i + 1}</td>
                      <td className="p-3 font-semibold text-sky-600">{p.maPhieu}</td>
                      <td className="p-3 font-bold text-slate-800">{p.hoTenBenhNhan || p.hoTen || 'N/A'}</td>
                      <td className="p-3">{p.tenBacSi || 'Chưa chỉ định'}</td>
                      <td className="p-3 font-medium text-slate-600">
                        {p.ngayKham ? new Date(p.ngayKham).toLocaleString('vi-VN') : 'N/A'}
                      </td>
                      <td className="p-3">
                        {p.trangThaiThanhToan === 'DaThanhToan' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <CheckCircle size={12} /> Đã thanh toán
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            <Clock size={12} /> Chưa thanh toán
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BaoCaoThongKe;
