import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Search, Plus, Trash2, Save, Database, 
  Users, User, Award
} from 'lucide-react';
import { 
  apiGetStaffList,
  apiGetKhoaList,
  apiAddKhoa,
  apiUpdateKhoa,
  apiDeleteKhoa
} from '../utils/api';
import { useToast } from '../utils/ToastContext';

// Danh sách khoa mặc định (dự phòng)
const DEFAULT_KHOA = [
  { maKhoa: 'KHOA01', tenKhoa: 'Nội tổng quát' },
  { maKhoa: 'KHOA02', tenKhoa: 'Tim mạch' },
  { maKhoa: 'KHOA03', tenKhoa: 'Nhi khoa' },
  { maKhoa: 'KHOA04', tenKhoa: 'Tai Mũi Họng' }
];

/**
 * Component Quản lý Danh mục Khoa / Chuyên môn
 */
function DanhMucKhoa() {
  const navigate = useNavigate();
  const { showSuccess, showError, showWarning } = useToast();

  // Các state lưu danh sách khoa, danh sách bác sĩ, và khoa đang chọn
  const [khoaList, setKhoaList] = useState([]);
  const [doctorsList, setDoctorsList] = useState([]); // Chỉ chứa nhân sự có vai trò bác sĩ
  const [selectedKhoa, setSelectedKhoa] = useState(null);
  
  const [khoaForm, setKhoaForm] = useState({ maKhoa: '', tenKhoa: '' });
  const [searchQuery, setSearchQuery] = useState('');

  // Các state phân trang & loading
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Tải danh mục khoa và bác sĩ khi component mount
  useEffect(() => {
    loadDoctors();
  }, []);

  // Đồng bộ form khi người dùng chọn khoa thay đổi
  useEffect(() => {
    if (selectedKhoa) {
      setKhoaForm({
        maKhoa: selectedKhoa.maKhoa,
        tenKhoa: selectedKhoa.tenKhoa
      });
    } else {
      setKhoaForm({ maKhoa: '', tenKhoa: '' });
    }
  }, [selectedKhoa]);

  // Tải danh mục khoa từ Backend API
  const loadKhoaList = async () => {
    try {
      setIsLoading(true);
      const response = await apiGetKhoaList('', searchQuery, page, pageSize);
      if (response && response.data) {
        const mappedData = response.data.map(item => ({
          maKhoa: item.MaKhoa || item.maKhoa || '',
          tenKhoa: item.TenKhoa || item.tenKhoa || ''
        }));
        setKhoaList(mappedData);
        setTotalCount(response.total || 0);
      } else {
        setKhoaList([]);
        setTotalCount(0);
      }
    } catch (e) {
      console.error('Lỗi tải danh mục khoa:', e);
      showError('Không thể tải danh mục khoa từ hệ thống: ' + (e.message || e));
    } finally {
      setIsLoading(false);
    }
  };

  // Cơ chế Debounce (250ms) cho tìm kiếm và đồng bộ trang
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadKhoaList();
    }, 250);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, page, pageSize]);

  // Tải danh sách bác sĩ từ hệ thống Backend API
  const loadDoctors = async () => {
    try {
      const response = await apiGetStaffList('active', 1, 1000);
      if (response && response.data) {
        // Lọc nhân viên có vai trò bác sĩ (roleID === 2 hoặc roleName === 'BacSi')
        const docs = response.data.filter(s => s.roleID === 2 || s.roleName === 'BacSi');
        setDoctorsList(docs);
      }
    } catch (err) {
      console.warn('Lỗi tải bác sĩ từ API:', err);
    }
  };

  // Đếm số bác sĩ thuộc một khoa (dựa theo mã khoa hoặc tên khoa)
  const getDoctorCount = (khoaItem) => {
    return doctorsList.filter(d => 
      (d.maKhoa && d.maKhoa === khoaItem.maKhoa) ||
      (!d.maKhoa && (d.chuyenMon || '').toLowerCase() === khoaItem.tenKhoa.toLowerCase())
    ).length;
  };

  // Lấy danh sách bác sĩ thuộc khoa được chọn
  const getDoctorsInKhoa = (khoaItem) => {
    return doctorsList.filter(d => 
      (d.maKhoa && d.maKhoa === khoaItem.maKhoa) ||
      (!d.maKhoa && (d.chuyenMon || '').toLowerCase() === khoaItem.tenKhoa.toLowerCase())
    );
  };

  // Khởi tạo thêm mới khoa phòng với mã khoa tự tăng
  const handleAddNew = () => {
    const nextNum = totalCount + 1;
    const newCode = `KHOA${String(nextNum).padStart(2, '0')}`;

    setSelectedKhoa({
      maKhoa: newCode,
      tenKhoa: '',
      isNew: true
    });
  };

  // Lưu thông tin khoa (Thêm mới hoặc Cập nhật)
  const handleSave = async (e) => {
    e.preventDefault();
    const { maKhoa, tenKhoa } = khoaForm;

    if (!tenKhoa.trim()) {
      showError('Vui lòng nhập Tên khoa / Chuyên môn!');
      return;
    }

    const updatedRecord = {
      maKhoa: maKhoa.trim().toUpperCase(),
      tenKhoa: tenKhoa.trim()
    };

    try {
      if (selectedKhoa?.isNew) {
        await apiAddKhoa(updatedRecord);
        showSuccess('Thêm mới khoa thành công!');
      } else {
        await apiUpdateKhoa(selectedKhoa.maKhoa, {
          tenKhoa: updatedRecord.tenKhoa
        });
        showSuccess('Cập nhật thông tin khoa thành công!');
      }

      setSelectedKhoa(updatedRecord);
      loadKhoaList();
    } catch (err) {
      console.error('Lỗi lưu khoa:', err);
      showError('Không thể lưu thông tin khoa: ' + (err.message || 'Lỗi hệ thống'));
    }
  };

  // Xóa khoa khỏi danh mục (Chỉ cho phép xóa khi không có bác sĩ trực thuộc)
  const handleDelete = async (maKhoa, tenKhoa) => {
    const docCount = getDoctorCount({ maKhoa, tenKhoa });
    if (docCount > 0) {
      showError(`Không thể xóa khoa này vì đang có ${docCount} bác sĩ đang trực thuộc!`);
      return;
    }

    if (window.confirm(`Bạn có chắc chắn muốn xóa khoa: ${tenKhoa} (Mã: ${maKhoa})?`)) {
      try {
        await apiDeleteKhoa(maKhoa);
        showSuccess('Xóa khoa thành công!');
        if (selectedKhoa && selectedKhoa.maKhoa === maKhoa) {
          setSelectedKhoa(null);
        }
        loadKhoaList();
      } catch (err) {
        console.error('Lỗi khi xóa khoa:', err);
        showError('Không thể xóa khoa: ' + (err.message || 'Lỗi hệ thống'));
      }
    }
  };

  return (
    <div className="kb-wrapper h-screen overflow-hidden">
      {/* Topbar điều hướng */}
      <div className="kb-topbar h-[50px] px-5">
        <div className="flex-1 flex justify-start">
          <button className="kb-back-btn py-[5px] px-[10px]" onClick={() => navigate('/')}>
            <ArrowLeft size={16} /> Quay về trang chủ
          </button>
        </div>
        <div className="kb-topbar-title flex-1 flex justify-center items-center text-[15px]">
          <Database size={18} className="mr-1.5" />
          <strong>Danh mục Khoa / Chuyên môn</strong>
        </div>
        <div className="flex-1 flex justify-end items-center text-[12px] opacity-85">
          <span>Trang chủ / Danh mục dùng chung / Quản lý khoa</span>
        </div>
      </div>

      {/* Vùng làm việc chính */}
      <div className="kb-body flex h-[calc(100vh-50px)] bg-[var(--bg-main)] overflow-hidden">
        
        {/* CỘT TRÁI: Bảng danh sách Khoa */}
        <div className="flex-[1.2] flex flex-col border-r border-[var(--border-color)] h-full bg-white">
          {/* Header Action row */}
          <div className="flex justify-between items-center py-3 px-4 border-b border-[var(--border-color)] bg-[var(--bg-main)]">
            <div className="flex items-center gap-[6px] shrink-0">
              <Database size={16} className="text-[var(--primary)] shrink-0" />
              <h3 className="text-[14.5px] font-[750] text-[var(--text-main)] m-0 whitespace-nowrap">
                Danh sách khoa phòng chuyên môn
              </h3>
            </div>
            <button
              onClick={handleAddNew}
              className="btn-primary h-8 text-[12.5px] px-3 flex items-center gap-1 !w-auto !mt-0 shrink-0"
            >
              <Plus size={14} /> Thêm mới
            </button>
          </div>

          {/* Ô tìm kiếm khoa */}
          <div className="py-2 px-4 border-b border-[var(--border-color)] bg-[var(--bg-main)]">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm khoa theo mã hoặc tên..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input h-[30px] text-[12.5px] pl-[30px]"
              />
              <Search size={14} className="absolute left-2 top-2 text-[var(--text-muted)]" />
            </div>
          </div>

          {/* Bảng danh sách khoa cuộn được */}
          <div className="flex-1 overflow-y-auto">
            <table className="kb-table w-full border-collapse text-[13px]">
              <thead>
                <tr className="sticky top-0 z-10 bg-[var(--bg-main)] border-b-2 border-[var(--border-color)]">
                  <th className="w-[50px] text-center p-2">STT</th>
                  <th className="w-[120px] p-2">Mã khoa</th>
                  <th className="p-2">Tên khoa phòng / Chuyên môn</th>
                  <th className="w-[130px] p-2 text-center">Số lượng Bác sĩ</th>
                  <th className="w-[60px] p-2 text-center">Xóa</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="5" className="text-center p-[30px] text-[var(--text-muted)]">
                      Đang tải danh mục khoa phòng...
                    </td>
                  </tr>
                ) : khoaList.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center p-[30px] text-[var(--text-muted)]">
                      Không tìm thấy khoa phòng nào khớp với bộ lọc.
                    </td>
                  </tr>
                ) : (
                  khoaList.map((k, idx) => {
                    const isSelected = selectedKhoa?.maKhoa === k.maKhoa;
                    return (
                      <tr 
                        key={k.maKhoa}
                        onClick={() => setSelectedKhoa(k)}
                        className={`border-b border-[var(--border-color)] cursor-pointer ${
                          isSelected 
                            ? 'kb-patient-item--active bg-[var(--primary-light)]' 
                            : 'bg-transparent'
                        }`}
                      >
                        <td className="text-center p-2">{(page - 1) * pageSize + idx + 1}</td>
                        <td className="p-2 font-semibold">{k.maKhoa}</td>
                        <td className="p-2 font-bold">{k.tenKhoa}</td>
                        <td className="p-2 text-center font-semibold text-[var(--primary)]">
                          {getDoctorCount(k)} bác sĩ
                        </td>
                        <td className="p-2 text-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleDelete(k.maKhoa, k.tenKhoa)}
                            className="btn-danger py-1 px-2 m-0 h-auto inline-flex"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Điều khiển phân trang */}
          <div className="h-[45px] bg-white border-t border-[var(--border-color)] flex items-center justify-between px-5 text-[13px] shrink-0">
            <div className="flex items-center gap-4">
              <span className="text-[var(--text-muted)]">
                Hiển thị từ <b>{totalCount === 0 ? 0 : (page - 1) * pageSize + 1}</b> đến <b>{Math.min((page - 1) * pageSize + pageSize, totalCount)}</b> trong tổng số <b>{totalCount}</b> khoa
              </span>
              <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] whitespace-nowrap">
                <span>| Hiển thị:</span>
                <select
                  value={pageSize}
                  onChange={e => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                  className="form-input h-[26px] !py-0 !px-1.5 text-xs w-[85px] font-semibold border-[var(--border-color)] rounded bg-white cursor-pointer"
                >
                  <option value={10}>10 hàng</option>
                  <option value={50}>50 hàng</option>
                  <option value={100}>100 hàng</option>
                </select>
              </div>
            </div>
            <div className="flex gap-[5px]">
              <button 
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className={`py-1 px-2 rounded border border-[var(--border-color)] ${
                  page === 1 ? 'bg-[#f3f4f6] cursor-not-allowed' : 'bg-white cursor-pointer'
                }`}
              >
                Trước
              </button>
              <span className="flex items-center px-2 font-semibold">
                Trang {page} / {Math.max(1, Math.ceil(totalCount / pageSize))}
              </span>
              <button 
                disabled={page === Math.max(1, Math.ceil(totalCount / pageSize))}
                onClick={() => setPage(p => p + 1)}
                className={`py-1 px-2 rounded border border-[var(--border-color)] ${
                  page === Math.max(1, Math.ceil(totalCount / pageSize)) ? 'bg-[#f3f4f6] cursor-not-allowed' : 'bg-white cursor-pointer'
                }`}
              >
                Sau
              </button>
            </div>
          </div>
        </div>


        {/* CỘT PHẢI: Form chi tiết & danh sách bác sĩ thuộc khoa */}
        <div className="flex-1 flex flex-col h-full bg-white">
          {selectedKhoa === null ? (
            <div className="h-full flex flex-col items-center justify-center text-[var(--text-muted)] text-center gap-3">
              <Award size={48} className="opacity-25 text-[var(--primary)]" />
              <div>
                <h4 className="font-semibold text-[var(--text-main)]">Chưa chọn khoa chuyên môn</h4>
                <p className="text-[13px] mt-1 max-w-[300px]">
                  Vui lòng chọn một khoa từ bảng danh sách bên trái hoặc bấm "Thêm mới" để cập nhật thông tin.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSave} className="h-full flex flex-col justify-between">
              <div className="flex flex-col gap-4 p-5 flex-1 overflow-y-auto">
                <h4 className="text-[13.5px] font-[750] text-[var(--primary)] border-b border-[var(--border-color)] pb-2 flex items-center gap-1.5">
                  <Award size={16} /> CHI TIẾT KHOA PHÒNG & CHUYÊN MÔN
                </h4>

                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  <div className="form-group m-0">
                    <label className="form-label text-[12.5px]">Mã khoa phòng <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      className="form-input h-[34px] text-[13px]"
                      value={khoaForm.maKhoa}
                      onChange={e => setKhoaForm({ ...khoaForm, maKhoa: e.target.value })}
                      required
                      disabled={true}
                    />
                  </div>

                  <div className="form-group m-0">
                    <label className="form-label text-[12.5px]">Tên khoa / Chuyên môn <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      className="form-input h-[34px] text-[13px]"
                      placeholder="Nhập tên khoa phòng..."
                      value={khoaForm.tenKhoa}
                      onChange={e => setKhoaForm({ ...khoaForm, tenKhoa: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Danh sách Bác sĩ thuộc khoa phòng */}
                {!selectedKhoa.isNew && (
                  <div className="mt-5">
                    <h4 className="text-[13px] font-[750] text-[var(--text-main)] flex items-center gap-1.5 mb-2.5">
                      <Users size={16} className="text-[var(--primary)]" />
                      Danh sách Bác sĩ thuộc khoa ({getDoctorsInKhoa(selectedKhoa).length})
                    </h4>
                    
                    {getDoctorsInKhoa(selectedKhoa).length === 0 ? (
                      <div className="p-4 border border-dashed border-[var(--border-color)] rounded-lg text-[var(--text-muted)] text-[12.5px] text-center">
                        Khoa này hiện tại chưa có bác sĩ trực thuộc.
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto">
                        {getDoctorsInKhoa(selectedKhoa).map((doc) => (
                          <div key={doc.maNV} className="border border-[var(--border-color)] rounded-lg py-2.5 px-3.5 text-[12.5px] flex justify-between items-center bg-[var(--bg-main)]">
                            <div className="flex items-center gap-2">
                              <User size={14} className="text-[var(--primary)]" />
                              <div>
                                <strong className="text-[var(--text-main)]">{doc.hoTen}</strong>
                                <div className="text-[10.5px] text-[var(--text-muted)]">Mã NV: {doc.maNV} | ĐT: {doc.sdt}</div>
                              </div>
                            </div>
                            <span className="status-badge status-active">Hoạt động</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Các nút Hủy/Lưu của Form */}
              <div className="py-3 px-5 border-t border-[var(--border-color)] bg-[var(--bg-main)] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedKhoa(null)}
                  className="btn-outline h-[34px] text-[13px] m-0 px-4 flex items-center"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-primary h-[34px] text-[13px] m-0 px-5 flex items-center w-auto mt-0"
                >
                  <Save size={14} className="mr-1.5" /> Lưu
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}

export default DanhMucKhoa;
