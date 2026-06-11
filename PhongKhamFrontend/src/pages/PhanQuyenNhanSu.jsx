import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, User, ShieldCheck, Database, Plus,
  Save, Users, Key, Check, X
} from 'lucide-react';
import {
  apiGetStaffList,
  apiAddStaff,
  apiUpdateStaff,
  apiDeleteStaff
} from '../utils/api';
import { useToast } from '../utils/ToastContext';

// Danh sách vai trò cấu hình trong CSDL phòng khám
const ROLE_OPTIONS = [
  { value: 'Admin', label: 'Quản trị hệ thống (Admin)' },
  { value: 'BacSi', label: 'Bác sĩ (BacSi)' },
  { value: 'LeTan', label: 'Lễ tân tiếp đón (LeTan)' },
  { value: 'ThuNgan', label: 'Thu ngân (ThuNgan)' },
  { value: 'QuanLyKho', label: 'Quản lý kho dược (QuanLyKho)' }
];

const ROLE_NAME_TO_ID = {
  'Admin': 1,
  'BacSi': 2,
  'LeTan': 3,
  'ThuNgan': 4,
  'QuanLyKho': 5,
  'QuanLyKhoThuoc': 5
};

const ROLE_ID_TO_NAME = {
  1: 'Admin',
  2: 'BacSi',
  3: 'LeTan',
  4: 'ThuNgan',
  5: 'QuanLyKho'
};

/**
 * Component Quản lý và Phân quyền tài khoản Nhân sự trong phòng khám
 */
function PhanQuyenNhanSu() {
  const navigate = useNavigate();
  const [staffList, setStaffList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const { showToast } = useToast();
  const [isAdmin, setIsAdmin] = useState(true);
  const [danhMucKhoa, setDanhMucKhoa] = useState([]);

  // Tải danh mục chuyên khoa để gán cho Bác sĩ / Nhân viên y tế
  useEffect(() => {
    try {
      const stored = localStorage.getItem('danhMucKhoa');
      if (stored) {
        setDanhMucKhoa(JSON.parse(stored));
      } else {
        const DEFAULT_KHOA = [
          { maKhoa: 'KHOA01', tenKhoa: 'Nội tổng quát' },
          { maKhoa: 'KHOA02', tenKhoa: 'Tim mạch' },
          { maKhoa: 'KHOA03', tenKhoa: 'Nhi khoa' },
          { maKhoa: 'KHOA04', tenKhoa: 'Tai Mũi Họng' }
        ];
        localStorage.setItem('danhMucKhoa', JSON.stringify(DEFAULT_KHOA));
        setDanhMucKhoa(DEFAULT_KHOA);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Form chứa dữ liệu nhân viên đang được chỉnh sửa hoặc thêm mới
  const [formData, setFormData] = useState({
    maNV: '', hoTen: '', sdt: '', email: '', chuyenMon: '', username: '', passwordHash: '', roleName: 'BacSi', isActive: true
  });

  // State lưu trữ bộ lọc tìm kiếm trên danh sách
  const [filters, setFilters] = useState({
    maNV: '', username: '', hoTen: '', roleName: ''
  });

  // Quản lý phân trang danh sách nhân sự
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const [activeStatusFilter, setActiveStatusFilter] = useState('active');

  /**
   * Tải danh sách nhân sự từ Backend API
   */
  const loadStaffList = async (statusVal = activeStatusFilter) => {
    try {
      const response = await apiGetStaffList(statusVal, 1, 1000);
      if (response && response.data) {
        setStaffList(response.data);
      } else {
        setStaffList([]);
      }
    } catch (error) {
      console.error('Lỗi tải danh sách nhân viên:', error);
      showToast('Không thể tải danh sách nhân viên từ hệ thống: ' + (error.message || error), 'error');
      if (error.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        navigate('/login');
      }
    }
  };

  // Kiểm tra quyền Admin khi mở trang & Tải dữ liệu ban đầu
  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      try {
        const parsed = JSON.parse(currentUser);
        if (parsed.role !== 'Admin') {
          setIsAdmin(false);
          return;
        }
      } catch (e) {
        console.error(e);
      }
    }

    loadStaffList(activeStatusFilter);
  }, [navigate, activeStatusFilter]);

  // Đồng bộ hóa dữ liệu từ nhân viên được chọn sang form nhập liệu
  useEffect(() => {
    if (selectedStaff) {
      setFormData({
        maNV: selectedStaff.maNV || '',
        hoTen: selectedStaff.hoTen || '',
        sdt: selectedStaff.sdt || '',
        email: selectedStaff.email || '',
        chuyenMon: selectedStaff.chuyenMon || '',
        username: selectedStaff.username || '',
        passwordHash: '',
        roleName: ROLE_ID_TO_NAME[selectedStaff.roleID] || selectedStaff.roleName || 'BacSi',
        isActive: selectedStaff.isActive !== undefined ? selectedStaff.isActive : true
      });
    } else {
      setFormData({
        maNV: '', hoTen: '', sdt: '', email: '', chuyenMon: '', username: '', passwordHash: '', roleName: 'BacSi', isActive: true
      });
    }
  }, [selectedStaff]);

  // Thực hiện lọc danh sách nhân sự
  const filteredStaff = staffList.filter(item => {
    const normalizedRoleName = ROLE_ID_TO_NAME[item.roleID] || item.roleName || '';
    return (
      (item.maNV || '').toLowerCase().includes(filters.maNV.toLowerCase()) &&
      (item.username || '').toLowerCase().includes(filters.username.toLowerCase()) &&
      (item.hoTen || '').toLowerCase().includes(filters.hoTen.toLowerCase()) &&
      normalizedRoleName.toLowerCase().includes(filters.roleName.toLowerCase())
    );
  });

  // Tính toán phân trang
  const totalPages = Math.max(1, Math.ceil(filteredStaff.length / itemsPerPage));
  const activePage = Math.min(currentPage, totalPages);
  const startIndex = (activePage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayedStaff = filteredStaff.slice(startIndex, endIndex);

  const isEdit = staffList.some(s => s.maNV === formData.maNV);

  const handleFilterChange = (key, val) => {
    setFilters({ ...filters, [key]: val });
  };

  /**
   * Khởi tạo form thêm mới nhân sự (Tự động tính mã nhân viên tiếp theo)
   */
  const handleAddNew = () => {
    const nextStt = staffList.length + 1;
    const nvNumbers = staffList
      .map(s => s.maNV)
      .filter(id => /^NV\d+$/i.test(id))
      .map(id => parseInt(id.replace(/^NV/i, ''), 10));
    const nextNum = nvNumbers.length > 0 ? Math.max(...nvNumbers) + 1 : 1;
    const newCode = `NV${String(nextNum).padStart(3, '0')}`;
    setSelectedStaff({
      stt: nextStt,
      maNV: newCode,
      username: '',
      hoTen: '',
      sdt: '',
      email: '',
      roleName: 'BacSi',
      roleID: 2,
      isActive: true,
      passwordHash: ''
    });
  };

  /**
   * Lưu thông tin nhân viên (Thêm mới hoặc Cập nhật)
   */
  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (!formData.hoTen.trim()) {
      showToast('Vui lòng nhập Họ tên nhân viên!', 'error');
      return;
    }
    if (!formData.maNV.trim()) {
      showToast('Vui lòng nhập Mã nhân viên!', 'error');
      return;
    }
    if (!formData.sdt.trim()) {
      showToast('Vui lòng nhập Số điện thoại!', 'error');
      return;
    }
    const phoneRegex = /^(0\d{9})$/;
    if (!phoneRegex.test(formData.sdt.trim())) {
      showToast('Số điện thoại không đúng định dạng (phải gồm đúng 10 chữ số và bắt đầu bằng số 0)!', 'error');
      return;
    }
    if (!formData.username.trim()) {
      showToast('Vui lòng nhập Tên đăng nhập tài khoản!', 'error');
      return;
    }

    const isEdit = staffList.some(s => s.maNV === formData.maNV);
    if (!isEdit && !formData.passwordHash.trim()) {
      showToast('Vui lòng nhập Mật khẩu tài khoản!', 'error');
      return;
    }

    try {
      const mappedRoleID = ROLE_NAME_TO_ID[formData.roleName] || 2;
      if (isEdit) {
        const payload = {
          hoTen: formData.hoTen.trim(),
          sdt: formData.sdt.trim(),
          email: formData.email?.trim() || null,
          chuyenMon: formData.chuyenMon?.trim() || null,
          username: formData.username.trim(),
          password: formData.passwordHash ? formData.passwordHash : null,
          roleID: mappedRoleID,
          isActive: formData.isActive
        };
        await apiUpdateStaff(formData.maNV, payload);
        showToast('Cập nhật thông tin nhân sự thành công!', 'success');
      } else {
        const payload = {
          maNV: formData.maNV.trim(),
          hoTen: formData.hoTen.trim(),
          sdt: formData.sdt.trim(),
          email: formData.email?.trim() || null,
          chuyenMon: formData.chuyenMon?.trim() || null,
          username: formData.username.trim(),
          password: formData.passwordHash,
          roleID: mappedRoleID,
          isActive: formData.isActive
        };
        await apiAddStaff(payload);
        showToast('Thêm mới nhân sự thành công!', 'success');
      }

      await loadStaffList(activeStatusFilter);
      setSelectedStaff({
        ...formData,
        roleID: mappedRoleID,
        passwordHash: ''
      });
    } catch (error) {
      console.error('Lỗi khi lưu nhân viên:', error);
      showToast('Không thể lưu thông tin nhân sự: ' + (error.message || 'Lỗi hệ thống'), 'error');
    }
  };

  /**
   * Xóa nhân viên khỏi hệ thống (Hoặc đề xuất tạm khóa nếu có ràng buộc khóa ngoại dữ liệu)
   */
  const handleDeleteStaff = async (maNV, hoTen) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa nhân sự: ${hoTen} (Mã: ${maNV})?`)) {
      try {
        await apiDeleteStaff(maNV);
        showToast('Xóa nhân viên thành công!', 'success');
        await loadStaffList(activeStatusFilter);
        if (selectedStaff && selectedStaff.maNV === maNV) {
          setSelectedStaff(null);
        }
      } catch (error) {
        console.error('Lỗi khi xóa nhân viên:', error);
        
        if (error.status === 409 && error.data && error.data.suggestion) {
          if (window.confirm(`${error.message}\n\nBạn có muốn TẠM KHÓA tài khoản của nhân viên này thay thế không?`)) {
            const staffToLock = staffList.find(s => s.maNV === maNV);
            if (staffToLock) {
              try {
                const payload = {
                  hoTen: staffToLock.hoTen,
                  sdt: staffToLock.sdt || '',
                  email: staffToLock.email || null,
                  chuyenMon: null,
                  username: staffToLock.username,
                  password: null,
                  roleID: ROLE_NAME_TO_ID[staffToLock.roleName] || staffToLock.roleID || 2,
                  isActive: false
                };
                await apiUpdateStaff(maNV, payload);
                showToast('Đã tạm khóa tài khoản nhân viên thành công!', 'success');
                await loadStaffList(activeStatusFilter);
                if (selectedStaff && selectedStaff.maNV === maNV) {
                  setSelectedStaff(null);
                }
              } catch (lockErr) {
                showToast('Không thể tạm khóa tài khoản: ' + (lockErr.message || 'Lỗi hệ thống'), 'error');
              }
            }
          }
        } else {
          showToast('Không thể xóa nhân sự: ' + (error.message || 'Lỗi hệ thống'), 'error');
        }
      }
    }
  };

  /**
   * Đặt lại mật khẩu mặc định cho nhân viên y tế (STUCaoLo)
   */
  const handleResetToDefaultPassword = (e) => {
    e.preventDefault();
    if (!selectedStaff) return;
    setFormData({ ...formData, passwordHash: 'STUCaoLo' });
    showToast("Đã thiết lập mật khẩu về mặc định (STUCaoLo). Vui lòng nhấn 'Lưu' để hoàn tất cập nhật!", "warning");
  };

  const handleCancel = () => {
    setSelectedStaff(null);
  };

  if (!isAdmin) {
    return (
      <div className="h-screen bg-white flex flex-col items-center justify-center p-5 box-border relative">
        <button
          onClick={() => navigate('/')}
          className="btn-outline absolute top-5 left-5 flex items-center gap-2 py-2 px-4 bg-transparent border border-[var(--border-color)] rounded-lg cursor-pointer text-sm text-[var(--text-main)] font-semibold transition-all duration-200 m-0"
        >
          <ArrowLeft size={16} /> Quay về trang chủ
        </button>
        <div className="text-center max-w-[500px] flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#fee2e2] text-[#ef4444] flex items-center justify-center">
            <ShieldCheck size={36} />
          </div>
          <div>
            <h2 className="text-[18px] font-extrabold text-[#1e293b] mb-2">Không có quyền truy cập</h2>
            <p className="text-[14.5px] text-[#475569] font-semibold leading-[1.6]">Vai trò của bạn không có quyền truy cập vô chức năng này</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="kb-wrapper h-screen overflow-hidden">
      {/* Topbar điều hướng */}
      <div className="kb-topbar h-[50px] px-5 flex items-center justify-between">
        <div className="flex-1 flex justify-start">
          <button className="kb-back-btn py-[5px] px-[10px]" onClick={() => navigate('/')}>
            <ArrowLeft size={16} /> Quay về trang chủ
          </button>
        </div>
        <div className="kb-topbar-title flex-1 flex justify-center text-[15px]">
          <ShieldCheck size={18} className="mr-[6px]" />
          <strong>Phân quyền & Danh mục Nhân sự</strong>
        </div>
        <div className="flex-1 flex justify-end text-xs opacity-[0.85]">
          <span>Trang chủ / Quản lý hệ thống / Danh mục nhân viên</span>
        </div>
      </div>

      {/* Main split dashboard area */}
      <div className="kb-body flex h-[calc(100vh-50px)] bg-[var(--bg-main)] overflow-hidden">
        
        {/* CỘT TRÁI: Bảng danh sách nhân viên */}
        <div className="flex-[1.2] flex flex-col border-r border-[var(--border-color)] h-full bg-white">
          <div className="flex justify-between items-center py-3 px-4 border-b border-[var(--border-color)] bg-[var(--bg-main)]">
            <div className="flex items-center gap-[6px]">
              <Users size={16} className="text-[var(--primary)]" />
              <h3 className="text-[14.5px] font-[750] text-[var(--text-main)]">Danh mục nhân viên</h3>
            </div>
            <div>
              <button onClick={handleAddNew} className="btn-primary h-8 text-[12.5px] px-3 flex items-center gap-1">
                <Plus size={14} /> Thêm mới [F1]
              </button>
            </div>
          </div>

          {/* Table Container - Scrollable */}
          <div className="flex-1 overflow-y-auto">
            <table className="kb-table w-full border-collapse text-[13px]">
              <thead>
                <tr className="sticky top-0 z-10 bg-[var(--bg-main)] border-b-2 border-[var(--border-color)]">
                  <th className="w-[45px] text-center p-2">STT</th>
                  <th className="w-[100px] p-2">Mã NV</th>
                  <th className="w-[120px] p-2">Tên đăng nhập</th>
                  <th className="w-[160px] p-2">Họ tên</th>
                  <th className="w-[120px] p-2">Vai trò</th>
                  <th className="w-[120px] p-2 text-center">Trạng thái</th>
                </tr>
                {/* Hàng ô nhập lọc tìm kiếm */}
                <tr className="bg-[var(--bg-main)] border-b border-[var(--border-color)]">
                  <td></td>
                  <td className="p-1">
                    <input
                      type="text" placeholder="Lọc..." className="form-input h-[26px] text-xs py-0.5 px-1.5"
                      value={filters.maNV} onChange={e => handleFilterChange('maNV', e.target.value)}
                    />
                  </td>
                  <td className="p-1">
                    <input
                      type="text" placeholder="Lọc..." className="form-input h-[26px] text-xs py-0.5 px-1.5"
                      value={filters.username} onChange={e => handleFilterChange('username', e.target.value)}
                    />
                  </td>
                  <td className="p-1">
                    <input
                      type="text" placeholder="Lọc..." className="form-input h-[26px] text-xs py-0.5 px-1.5"
                      value={filters.hoTen} onChange={e => handleFilterChange('hoTen', e.target.value)}
                    />
                  </td>
                  <td className="p-1">
                    <select
                      className="form-input h-[26px] text-xs px-1"
                      value={filters.roleName} onChange={e => handleFilterChange('roleName', e.target.value)}
                    >
                      <option value="">Tất cả</option>
                      <option value="Admin">Admin</option>
                      <option value="BacSi">BacSi</option>
                      <option value="LeTan">LeTan</option>
                      <option value="ThuNgan">ThuNgan</option>
                      <option value="QuanLyKho">QuanLyKho</option>
                    </select>
                  </td>
                  <td className="p-1">
                    <select
                      className="form-input h-[26px] text-xs px-0.5 font-semibold"
                      value={activeStatusFilter}
                      onChange={e => {
                        setActiveStatusFilter(e.target.value);
                        setCurrentPage(1);
                        setSelectedStaff(null);
                      }}
                    >
                      <option value="active">Hoạt động</option>
                      <option value="inactive">Tạm khóa</option>
                    </select>
                  </td>
                </tr>
              </thead>
              <tbody>
                {displayedStaff.map((staff, idx) => {
                  const isSelected = selectedStaff && selectedStaff.maNV === staff.maNV;
                  const normalizedRoleName = ROLE_ID_TO_NAME[staff.roleID] || staff.roleName;
                  const roleObj = ROLE_OPTIONS.find(r => r.value === normalizedRoleName);
                  
                  return (
                    <tr
                      key={staff.maNV}
                      className={`kb-table-row cursor-pointer transition-[background-color] duration-150 ${
                        isSelected ? 'bg-[var(--primary-light)]' : 'bg-transparent'
                      }`}
                      onClick={() => setSelectedStaff(staff)}
                    >
                      <td className="text-center py-2.5 px-2 font-medium text-[var(--text-muted)]">{startIndex + idx + 1}</td>
                      <td className={`font-semibold py-2.5 px-2 ${isSelected ? 'text-[var(--primary-hover)]' : 'text-[var(--text-main)]'}`}>
                        {staff.maNV}
                      </td>
                      <td className="py-2.5 px-2">{staff.username || '—'}</td>
                      <td className="font-semibold py-2.5 px-2">{staff.hoTen}</td>
                      <td className="py-2.5 px-2 font-semibold">
                        <span className={`text-[11.5px] py-0.5 px-2 rounded-[10px] ${
                          normalizedRoleName === 'Admin'
                            ? 'text-[#ef4444] bg-[#fee2e2]'
                            : normalizedRoleName === 'BacSi'
                            ? 'text-[#0ea5e9] bg-[#e0f2fe]'
                            : 'text-[#10b981] bg-[#d1fae5]'
                        }`}>
                          {roleObj ? roleObj.value : normalizedRoleName}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        {staff.isActive ? (
                          <span className="text-[#10b981] font-semibold text-xs inline-flex items-center gap-[3px]">
                            <Check size={14} /> Hoạt động
                          </span>
                        ) : (
                          <span className="text-[var(--text-muted)] italic text-xs inline-flex items-center gap-[3px]">
                            <X size={14} /> Tạm khóa
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filteredStaff.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center p-10 text-[var(--text-muted)]">Không tìm thấy nhân viên trùng khớp với bộ lọc</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Phân trang danh sách */}
          <div className="border-t border-[var(--border-color)] py-2 px-4 flex justify-between items-center text-[12.5px] text-[var(--text-muted)] bg-[var(--bg-main)]">
            <div className="flex gap-1 items-center">
              <button
                disabled={activePage === 1}
                onClick={() => setCurrentPage(activePage - 1)}
                className={`btn-outline h-6 w-6 p-0 flex items-center justify-center ${
                  activePage === 1 ? 'cursor-not-allowed' : 'cursor-pointer'
                }`}
              >
                &lt;
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`${p === activePage ? "btn-primary" : "btn-outline"} h-6 w-6 p-0 flex items-center justify-center text-[11px] font-bold cursor-pointer`}
                >
                  {p}
                </button>
              ))}
              <button
                disabled={activePage === totalPages}
                onClick={() => setCurrentPage(activePage + 1)}
                className={`btn-outline h-6 w-6 p-0 flex items-center justify-center ${
                  activePage === totalPages ? 'cursor-not-allowed' : 'cursor-pointer'
                }`}
              >
                &gt;
              </button>
            </div>
            <span>Hiển thị {filteredStaff.length === 0 ? 0 : startIndex + 1} - {Math.min(endIndex, filteredStaff.length)} trên tổng {filteredStaff.length} nhân viên</span>
          </div>
        </div>

        {/* CỘT PHẢI: Form chi tiết */}
        <div className="flex-[0.9] flex flex-col h-full bg-white">
          <div className="flex bg-[#0052cc] py-3 px-[18px] h-[42px] items-center text-white text-[13px] font-bold gap-2">
            <Database size={16} />
            <span>THÔNG TIN NHÂN SỰ & TÀI KHOẢN</span>
          </div>

          <div className="flex-1 overflow-y-auto p-5 bg-white">
            {selectedStaff === null ? (
              <div className="h-full flex flex-col items-center justify-center text-[var(--text-muted)] text-center gap-3">
                <User size={48} className="opacity-25 text-[var(--primary)]" />
                <div>
                  <h4 className="font-semibold text-[var(--text-main)]">Chưa chọn nhân sự</h4>
                  <p className="text-[13px] mt-1">Chọn một nhân viên bên bảng danh mục hoặc bấm "Thêm mới [F1]" để quản trị tài khoản hệ thống.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSave} className="h-full flex flex-col justify-between">
                <div className="flex flex-col gap-4">

                  {/* Nhóm 1: Thông tin nhân viên */}
                  <div className="border-b border-dashed border-[var(--border-color)] pb-4">
                    <h4 className="text-[13px] font-bold text-[var(--primary)] mb-3 flex items-center gap-1.5">
                      <User size={14} /> THÔNG TIN HỒ SƠ NHÂN VIÊN
                    </h4>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                      <div className="form-group m-0">
                        <label className="form-label text-[12.5px]">Mã nhân viên <span className="text-red-500">*</span></label>
                        <input
                          type="text" className="form-input h-[34px] text-[13px]" placeholder="VD: NV001, BS001" value={formData.maNV}
                          onChange={e => setFormData({ ...formData, maNV: e.target.value })} required
                          disabled={staffList.some(s => s.maNV === selectedStaff.maNV && selectedStaff.username !== '')}
                        />
                      </div>

                      <div className="form-group m-0">
                        <label className="form-label text-[12.5px]">Họ và tên <span className="text-red-500">*</span></label>
                        <input
                          type="text" className="form-input h-[34px] text-[13px]" placeholder="Họ và tên" value={formData.hoTen}
                          onChange={e => setFormData({ ...formData, hoTen: e.target.value })} required
                        />
                      </div>

                      <div className="form-group m-0">
                        <label className="form-label text-[12.5px]">Số điện thoại <span className="text-red-500">*</span></label>
                        <input
                          type="text" className="form-input h-[34px] text-[13px]" placeholder="Số điện thoại" value={formData.sdt}
                          onChange={e => setFormData({ ...formData, sdt: e.target.value })} required
                        />
                      </div>

                      <div className="form-group m-0">
                        <label className="form-label text-[12.5px]">Khoa (Chuyên môn)</label>
                        <select
                          className="form-input h-[34px] text-[13px] px-2" value={formData.chuyenMon || ''}
                          onChange={e => setFormData({ ...formData, chuyenMon: e.target.value })}
                        >
                          <option value="">— Chọn khoa / chuyên môn —</option>
                          {danhMucKhoa.map(k => (
                            <option key={k.maKhoa} value={k.tenKhoa}>{k.tenKhoa}</option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group m-0 col-span-2">
                        <label className="form-label text-[12.5px]">Địa chỉ Email</label>
                        <input
                          type="email" className="form-input h-[34px] text-[13px]" placeholder="Email liên lạc" value={formData.email || ''}
                          onChange={e => setFormData({ ...formData, email: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Nhóm 2: Tài khoản người dùng */}
                  <div>
                    <h4 className="text-[13px] font-bold text-[var(--primary)] mb-3 flex items-center gap-1.5">
                      <Key size={14} /> TÀI KHOẢN HỆ THỐNG & PHÂN QUYỀN
                    </h4>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                      <div className="form-group m-0">
                        <label className="form-label text-[12.5px]">Tên đăng nhập <span className="text-red-500">*</span></label>
                        <input
                          type="text" className="form-input h-[34px] text-[13px]" placeholder="Tên đăng nhập" value={formData.username}
                          onChange={e => setFormData({ ...formData, username: e.target.value })} required
                        />
                      </div>

                      <div className="form-group m-0">
                        <label className="form-label text-[12.5px]">
                          Mật khẩu đăng nhập {!isEdit && <span className="text-red-500">*</span>}
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="password" className="form-input h-[34px] text-[13px] flex-1" placeholder={isEdit ? "Bỏ trống nếu giữ nguyên" : "Nhập mật khẩu"}
                            value={formData.passwordHash} onChange={e => setFormData({ ...formData, passwordHash: e.target.value })}
                            required={!isEdit}
                          />
                          <button
                            type="button" onClick={handleResetToDefaultPassword}
                            className="btn-outline h-[34px] px-2.5 text-xs border-[#ef4444] text-[#ef4444] flex items-center gap-1 whitespace-nowrap"
                          >
                            Reset mặc định
                          </button>
                        </div>
                      </div>

                      <div className="form-group m-0">
                        <label className="form-label text-[12.5px]">Vai trò <span className="text-red-500">*</span></label>
                        <select
                          className="form-input h-[34px] text-[13px] px-2" value={formData.roleName}
                          onChange={e => setFormData({ ...formData, roleName: e.target.value })} required
                        >
                          {ROLE_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group m-0">
                        <label className="form-label text-[12.5px]">Trạng thái tài khoản <span className="text-red-500">*</span></label>
                        <select
                          className="form-input h-[34px] text-[13px] px-2" value={formData.isActive ? 'true' : 'false'}
                          onChange={e => setFormData({ ...formData, isActive: e.target.value === 'true' })} required
                        >
                          <option value="true">Cho phép hoạt động (Active)</option>
                          <option value="false">Tạm khóa tài khoản (Locked)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Action buttons */}
                <div className="flex justify-end gap-2.5 border-t border-[var(--border-color)] pt-4 mt-8">
                  <button type="button" className="btn-outline w-[100px] h-9 flex items-center justify-center p-0 m-0" onClick={handleCancel}>Hủy</button>
                  <button type="submit" className="btn-primary w-[120px] h-9 flex items-center justify-center gap-1.5 p-0 m-0"><Save size={16} /> Lưu [F4]</button>
                </div>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default PhanQuyenNhanSu;
