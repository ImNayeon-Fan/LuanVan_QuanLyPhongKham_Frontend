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
    <div className="kb-wrapper h-screen overflow-hidden">
      {/* Topbar điều hướng */}
      <div className="kb-topbar h-[50px] px-5">
        <div className="flex-1 flex">
          <button className="kb-back-btn py-[5px] px-[10px]" onClick={() => navigate('/')}>
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
      <div className="kb-body py-4 px-6 bg-[var(--bg-main)] h-[calc(100vh-50px)] overflow-y-auto flex flex-col gap-4">
        
        {/* Bộ lọc nâng cao */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[var(--radius-lg)] py-3 px-4 flex gap-4 items-center flex-wrap shadow-[var(--shadow-sm)]">
          {/* Ô tìm kiếm thông tin */}
          <div className="flex items-center gap-2 flex-[2] min-w-[240px] relative">
            <Search size={16} className="absolute left-3 text-[var(--text-muted)]" />
            <input
              type="text" className="form-input pl-[34px] h-9"
              placeholder="Tìm họ tên, SĐT, mã bệnh nhân..."
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Lọc theo bác sĩ */}
          <div className="flex-1 min-w-[180px]">
            <select
              className="form-input pl-3 h-9"
              value={selectedDoctor} onChange={e => setSelectedDoctor(e.target.value)}
            >
              <option value="">-- Lọc theo Bác sĩ chỉ định --</option>
              {docList.map(doc => (
                <option key={doc.maNV} value={doc.maNV}>{doc.hoTen}</option>
              ))}
            </select>
          </div>

          {/* Lọc theo ngày tiếp đón */}
          <div className="flex-1 min-w-[160px] flex items-center gap-2 relative">
            <Calendar size={16} className="absolute left-3 text-[var(--text-muted)]" />
            <input
              type="date" className="form-input pl-[34px] h-9"
              value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
            />
          </div>

          {/* Lọc theo trạng thái khám */}
          <div className="flex-1 min-w-[160px]">
            <select
              className="form-input pl-3 h-9"
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
