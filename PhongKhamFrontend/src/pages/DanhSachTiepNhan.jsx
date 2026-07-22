import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Search, User, Calendar, RefreshCw, ClipboardList, Eye
} from 'lucide-react';
import { apiGetDanhSachTiepNhan, apiGetBacSiList, apiGetKhoaList } from '../utils/api';
import { useToast } from '../utils/ToastContext';

// Cấu hình nhãn trạng thái và màu sắc đi kèm
const trangThaiLabel = {
  0: { label: 'Chờ khám',   color: '#f59e0b', bg: '#fef3c7' },
  1: { label: 'Đang khám',  color: '#0ea5e9', bg: '#e0f2fe' },
  2: { label: 'Chờ CLS',    color: '#8b5cf6', bg: '#ede9fe' },
  3: { label: 'Hoàn thành', color: '#22c55e', bg: '#dcfce7' },
};

const formatDateVN = (dateStr) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

function DanhSachTiepNhan() {
  const navigate = useNavigate();
  const { showError } = useToast();
  
  // Trạng thái lưu trữ bộ lọc trên giao diện
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  
  // Mặc định Từ ngày và Đến ngày là hôm nay (Cho phép chọn Từ ngày - Đến ngày để xem hồ sơ cũ)
  const todayStr = new Date().toISOString().split('T')[0];
  const [tuNgay, setTuNgay] = useState(todayStr);
  const [denNgay, setDenNgay] = useState(todayStr);

  const [dsPhieuKham, setDsPhieuKham] = useState([]); // Danh sách phiếu khám tải từ backend
  const [docList, setDocList] = useState([]); // Danh sách bác sĩ phục vụ bộ lọc
  const [khoaMapping, setKhoaMapping] = useState({}); // Bản đồ ánh xạ khoa phòng
  const [loading, setLoading] = useState(false);

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

  // 1. Tải danh sách bác sĩ và danh mục khoa phòng để đưa vào bộ lọc
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await apiGetBacSiList();
        if (res && res.data) setDocList(res.data);
      } catch (err) {
        console.error('Lỗi tải danh sách bác sĩ:', err);
      }
    };
    const fetchKhoas = async () => {
      try {
        const res = await apiGetKhoaList('', '', 1, 1000);
        if (res && res.data) {
          const mapping = {};
          res.data.forEach(k => {
            mapping[k.maKhoa] = k.tenKhoa;
          });
          setKhoaMapping(mapping);
        }
      } catch (err) {
        console.error('Lỗi tải danh sách khoa:', err);
      }
    };
    fetchDoctors();
    fetchKhoas();
  }, []);

  // 2. Tải danh sách bệnh nhân đã tiếp nhận từ Backend theo khoảng ngày
  const fetchDanhSachTiepNhan = async () => {
    setLoading(true);
    try {
      const dates = getDatesInRange(tuNgay, denNgay);
      if (dates.length === 0) {
        setDsPhieuKham([]);
        return;
      }

      // Gọi đồng thời API cho từng ngày trong khoảng đã chọn
      const requests = dates.map(date => 
        apiGetDanhSachTiepNhan({
          search: searchQuery,
          maNV: selectedDoctor,
          trangThai: selectedStatus,
          ngayKham: date,
          page: 1,
          limit: 100
        })
      );

      const responses = await Promise.all(requests);
      let mergedData = [];
      responses.forEach(res => {
        if (res && res.data) {
          mergedData = mergedData.concat(res.data);
        }
      });

      // Sắp xếp giảm dần theo ngày khám để các lượt khám mới nhất hiển thị lên đầu
      mergedData.sort((a, b) => new Date(b.ngayKham) - new Date(a.ngayKham));
      setDsPhieuKham(mergedData);
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
  }, [searchQuery, selectedDoctor, selectedStatus, tuNgay, denNgay]);

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
    <div className="kb-wrapper h-screen overflow-hidden">
      {/* Topbar điều hướng */}
      <div className="kb-topbar h-[50px] px-5">
        <div className="flex-1 flex">
          <button className="kb-back-btn py-[5px] px-[10px]" onClick={() => navigate('/staff')}>
            <ArrowLeft size={16} /> Quay về trang chủ
          </button>
        </div>
        <div className="kb-topbar-title flex-1 flex justify-center text-[15px]">
          <ClipboardList size={18} className="mr-[6px]" />
          <strong>Danh sách bệnh nhân đã tiếp đón</strong>
        </div>
        <div className="flex-1 flex justify-end">
          <button className="kb-back-btn py-[5px] px-[10px] flex items-center gap-1" onClick={fetchDanhSachTiepNhan}>
            <RefreshCw size={14} className={loading ? 'spin-animation' : ''} /> Làm mới
          </button>
        </div>
      </div>

      {/* Main body chứa danh sách */}
      <div 
        className="kb-body py-4 px-6 bg-[var(--bg-main)] h-[calc(100vh-50px)] flex flex-col gap-4"
        style={{ overflowY: 'auto', flexDirection: 'column' }}
      >
        
        {/* Bộ lọc nâng cao */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[var(--radius-lg)] py-2.5 px-4 flex gap-3 items-center flex-wrap shadow-[var(--shadow-sm)]">
          {/* Ô tìm kiếm thông tin - Thu gọn kích thước để nhường chỗ cho Từ ngày - Đến ngày */}
          <div className="flex items-center gap-2 flex-1 min-w-[170px] max-w-[210px] relative">
            <Search size={15} className="absolute left-3 text-[var(--text-muted)]" />
            <input
              type="text" className="form-input pl-[32px] pr-2 h-9 text-[13px]"
              placeholder="Tìm tên, SĐT, mã BN..."
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Lọc theo bác sĩ */}
          <div className="flex-1 min-w-[160px]">
            <select
              className="form-input px-2.5 h-9 text-[13px]"
              value={selectedDoctor} onChange={e => setSelectedDoctor(e.target.value)}
            >
              <option value="">-- Tất cả bác sĩ chỉ định --</option>
              {docList.map(doc => {
                const tenKhoa = khoaMapping[doc.maKhoa] || doc.maKhoa || 'Khoa lâm sàng';
                return (
                  <option key={doc.maNV} value={doc.maNV}>
                    {doc.hoTen} - {tenKhoa}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Lọc theo khoảng thời gian tiếp đón (Cho phép chọn Từ ngày - Đến ngày, Mặc định ngày hôm nay) */}
          <div className="flex items-center gap-2 bg-white border border-[var(--border-color)] p-1 rounded-[var(--radius-md)] shadow-[var(--shadow-sm)]">
            <Calendar size={14} className="text-[var(--primary)] shrink-0 ml-1.5" />
            <div className="flex items-center gap-1">
              <span className="text-[var(--text-muted)] text-[12px] font-semibold shrink-0">Từ:</span>
              <input
                type="date" 
                className="form-input h-7 text-[12px] px-1.5 border border-slate-200 bg-[var(--bg-main)] rounded cursor-pointer font-medium"
                value={tuNgay} 
                onChange={e => setTuNgay(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[var(--text-muted)] text-[12px] font-semibold shrink-0">Đến:</span>
              <input
                type="date" 
                className="form-input h-7 text-[12px] px-1.5 border border-slate-200 bg-[var(--bg-main)] rounded cursor-pointer font-medium"
                value={denNgay} 
                onChange={e => setDenNgay(e.target.value)}
              />
            </div>
          </div>

          {/* Lọc theo trạng thái khám */}
          <div className="flex-1 min-w-[140px]">
            <select
              className="form-input px-2.5 h-9 text-[13px]"
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
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[var(--radius-lg)] overflow-hidden shadow-[var(--shadow-sm)] flex-1 flex flex-col">
          {dsPhieuKham.length === 0 ? (
            <div className="p-16 text-center text-[var(--text-muted)]">
              <User size={48} className="mx-auto mb-4 block opacity-30" />
              <p className="text-[15px] font-medium">Không tìm thấy bệnh nhân nào khớp với bộ lọc</p>
            </div>
          ) : (
            <div className="overflow-x-auto flex-1">
              <table className="kb-table w-full border-collapse">
                <thead>
                  <tr className="sticky top-0 z-10 bg-[var(--bg-main)]">
                    <th className="w-[50px] text-center">STT</th>
                    <th>Thời gian tiếp nhận</th>
                    <th>Mã Bệnh Nhân</th>
                    <th>Họ và Tên</th>
                    <th>Ngày Sinh</th>
                    <th>Giới Tính</th>
                    <th>Số điện thoại</th>
                    <th>Địa chỉ</th>
                    <th>Bác sĩ chỉ định</th>
                    <th>Trạng thái khám</th>
                    <th className="w-[80px] text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {dsPhieuKham.map((item, index) => {
                    const status = trangThaiLabel[item.trangThaiKham] || trangThaiLabel[0];
                    return (
                      <tr key={item.maPhieu} className="kb-table-row transition-colors duration-200">
                        <td className="text-center font-medium text-[var(--text-muted)]">{index + 1}</td>
                        <td className="text-[13px] text-[var(--text-muted)]">{formatTime(item.ngayKham)}</td>
                        <td className="font-semibold text-[var(--primary)]">{item.maBN}</td>
                        <td 
                          className="kb-patient-name-link font-semibold"
                          onClick={() => navigate(`/ho-so-chi-tiet/${item.maPhieu}`)} title="Xem chi tiết bệnh án"
                        >
                          {item.hoTen}
                        </td>
                        <td>{formatNgaySinh(item.ngaySinh)}</td>
                        <td>{item.gioiTinh}</td>
                        <td>{item.sdt}</td>
                        <td className="max-w-[240px] overflow-hidden text-ellipsis whitespace-nowrap" title={item.diaChi}>
                          {item.diaChi || '—'}
                        </td>
                        <td className="font-medium">{item.tenBacSi || 'Chưa chỉ định'}</td>
                        <td>
                          <span className="kb-status-badge text-[11px]" style={{ color: status.color, backgroundColor: status.bg }}>
                            {status.label}
                          </span>
                        </td>
                        <td>
                          <div className="flex gap-2 justify-center">
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
          <div className="border-t border-[var(--border-color)] py-3 px-5 flex justify-between items-center text-[13px] text-[var(--text-muted)] font-medium bg-[var(--bg-main)]">
            <span>Tổng cộng: {dsPhieuKham.length} lượt tiếp đón</span>
          </div>
        </div>
        
      </div>
    </div>
  );
}

export default DanhSachTiepNhan;
