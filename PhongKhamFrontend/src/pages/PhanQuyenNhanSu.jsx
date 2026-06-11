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
      <div style={styles.restrictWrapper}>
        <button onClick={() => navigate('/')} style={styles.restrictBackBtn} className="btn-outline">
          <ArrowLeft size={16} /> Quay về trang chủ
        </button>
        <div style={styles.restrictContent}>
          <div style={styles.restrictIconWrapper}>
            <ShieldCheck size={36} />
          </div>
          <div>
            <h2 style={styles.restrictTitle}>Không có quyền truy cập</h2>
            <p style={styles.restrictDesc}>Vai trò của bạn không có quyền truy cập vô chức năng này</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="kb-wrapper" style={styles.wrapper}>
      {/* Topbar điều hướng */}
      <div className="kb-topbar" style={styles.topbar}>
        <div style={styles.topbarLeft}>
          <button className="kb-back-btn" onClick={() => navigate('/')} style={styles.backBtn}>
            <ArrowLeft size={16} /> Quay về trang chủ
          </button>
        </div>
        <div className="kb-topbar-title" style={styles.topbarTitle}>
          <ShieldCheck size={18} style={{ marginRight: '6px' }} />
          <strong>Phân quyền & Danh mục Nhân sự</strong>
        </div>
        <div style={styles.topbarRight}>
          <span>Trang chủ / Quản lý hệ thống / Danh mục nhân viên</span>
        </div>
      </div>

      {/* Main split dashboard area */}
      <div className="kb-body" style={styles.body}>
        
        {/* CỘT TRÁI: Bảng danh sách nhân viên */}
        <div style={styles.leftCol}>
          <div style={styles.panelHeader}>
            <div style={styles.panelTitleContainer}>
              <Users size={16} style={{ color: 'var(--primary)' }} />
              <h3 style={styles.panelTitleText}>Danh mục nhân viên</h3>
            </div>
            <div>
              <button onClick={handleAddNew} className="btn-primary" style={styles.addBtn}>
                <Plus size={14} /> Thêm mới [F1]
              </button>
            </div>
          </div>

          {/* Table Container - Scrollable */}
          <div style={styles.tableContainer}>
            <table className="kb-table" style={styles.table}>
              <thead>
                <tr style={styles.tableHeaderRow}>
                  <th style={styles.thStt}>STT</th>
                  <th style={styles.thMaNV}>Mã NV</th>
                  <th style={styles.thUsername}>Tên đăng nhập</th>
                  <th style={styles.thHoTen}>Họ tên</th>
                  <th style={styles.thVaiTro}>Vai trò</th>
                  <th style={styles.thTrangThai}>Trạng thái</th>
                </tr>
                {/* Hàng ô nhập lọc tìm kiếm */}
                <tr style={styles.filterRow}>
                  <td></td>
                  <td style={styles.tdPadding4}>
                    <input
                      type="text" placeholder="Lọc..." className="form-input" style={styles.filterInput}
                      value={filters.maNV} onChange={e => handleFilterChange('maNV', e.target.value)}
                    />
                  </td>
                  <td style={styles.tdPadding4}>
                    <input
                      type="text" placeholder="Lọc..." className="form-input" style={styles.filterInput}
                      value={filters.username} onChange={e => handleFilterChange('username', e.target.value)}
                    />
                  </td>
                  <td style={styles.tdPadding4}>
                    <input
                      type="text" placeholder="Lọc..." className="form-input" style={styles.filterInput}
                      value={filters.hoTen} onChange={e => handleFilterChange('hoTen', e.target.value)}
                    />
                  </td>
                  <td style={styles.tdPadding4}>
                    <select
                      className="form-input" style={styles.filterSelect}
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
                  <td style={styles.tdPadding4}>
                    <select
                      className="form-input" style={styles.statusFilterSelect}
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
                      key={staff.maNV} className="kb-table-row"
                      style={{
                        backgroundColor: isSelected ? 'var(--primary-light)' : 'transparent',
                        cursor: 'pointer', transition: 'background-color 0.15s'
                      }}
                      onClick={() => setSelectedStaff(staff)}
                    >
                      <td style={styles.tdStt}>{startIndex + idx + 1}</td>
                      <td style={{ fontWeight: '600', color: isSelected ? 'var(--primary-hover)' : 'var(--text-main)', padding: '10px 8px' }}>
                        {staff.maNV}
                      </td>
                      <td style={{ padding: '10px 8px' }}>{staff.username || '—'}</td>
                      <td style={{ fontWeight: '600', padding: '10px 8px' }}>{staff.hoTen}</td>
                      <td style={{ padding: '10px 8px', fontWeight: '600' }}>
                        <span style={{
                          fontSize: '11.5px',
                          color: normalizedRoleName === 'Admin' ? '#ef4444' : normalizedRoleName === 'BacSi' ? '#0ea5e9' : '#10b981',
                          backgroundColor: normalizedRoleName === 'Admin' ? '#fee2e2' : normalizedRoleName === 'BacSi' ? '#e0f2fe' : '#d1fae5',
                          padding: '2px 8px', borderRadius: '10px'
                        }}>
                          {roleObj ? roleObj.value : normalizedRoleName}
                        </span>
                      </td>
                      <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                        {staff.isActive ? (
                          <span style={styles.statusActive}>
                            <Check size={14} /> Hoạt động
                          </span>
                        ) : (
                          <span style={styles.statusLocked}>
                            <X size={14} /> Tạm khóa
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filteredStaff.length === 0 && (
                  <tr>
                    <td colSpan={6} style={styles.noData}>Không tìm thấy nhân viên trùng khớp với bộ lọc</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Phân trang danh sách */}
          <div style={styles.pagination}>
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              <button
                disabled={activePage === 1} onClick={() => setCurrentPage(activePage - 1)} className="btn-outline"
                style={{ ...styles.pageNavBtn, cursor: activePage === 1 ? 'not-allowed' : 'pointer' }}
              >
                &lt;
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p} onClick={() => setCurrentPage(p)} className={p === activePage ? "btn-primary" : "btn-outline"}
                  style={styles.pageNumberBtn}
                >
                  {p}
                </button>
              ))}
              <button
                disabled={activePage === totalPages} onClick={() => setCurrentPage(activePage + 1)} className="btn-outline"
                style={{ ...styles.pageNavBtn, cursor: activePage === totalPages ? 'not-allowed' : 'pointer' }}
              >
                &gt;
              </button>
            </div>
            <span>Hiển thị {filteredStaff.length === 0 ? 0 : startIndex + 1} - {Math.min(endIndex, filteredStaff.length)} trên tổng {filteredStaff.length} nhân viên</span>
          </div>
        </div>

        {/* CỘT PHẢI: Form chi tiết */}
        <div style={styles.rightCol}>
          <div style={styles.formHeader}>
            <Database size={16} />
            <span>THÔNG TIN NHÂN SỰ & TÀI KHOẢN</span>
          </div>

          <div style={styles.formArea}>
            {selectedStaff === null ? (
              <div style={styles.noSelected}>
                <User size={48} style={styles.noSelectedIcon} />
                <div>
                  <h4 style={{ fontWeight: '600', color: 'var(--text-main)' }}>Chưa chọn nhân sự</h4>
                  <p style={{ fontSize: '13px', marginTop: '4px' }}>Chọn một nhân viên bên bảng danh mục hoặc bấm "Thêm mới [F1]" để quản trị tài khoản hệ thống.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSave} style={styles.form}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                  {/* Nhóm 1: Thông tin nhân viên */}
                  <div style={styles.formSection}>
                    <h4 style={styles.formSectionTitle}>
                      <User size={14} /> THÔNG TIN HỒ SƠ NHÂN VIÊN
                    </h4>
                    <div style={styles.formGrid}>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ fontSize: '12.5px' }}>Mã nhân viên <span style={{ color: 'red' }}>*</span></label>
                        <input
                          type="text" className="form-input" placeholder="VD: NV001, BS001" value={formData.maNV}
                          onChange={e => setFormData({ ...formData, maNV: e.target.value })} required
                          disabled={staffList.some(s => s.maNV === selectedStaff.maNV && selectedStaff.username !== '')}
                          style={styles.formInputStyle}
                        />
                      </div>

                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ fontSize: '12.5px' }}>Họ và tên <span style={{ color: 'red' }}>*</span></label>
                        <input
                          type="text" className="form-input" placeholder="Họ và tên" value={formData.hoTen}
                          onChange={e => setFormData({ ...formData, hoTen: e.target.value })} required
                          style={styles.formInputStyle}
                        />
                      </div>

                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ fontSize: '12.5px' }}>Số điện thoại <span style={{ color: 'red' }}>*</span></label>
                        <input
                          type="text" className="form-input" placeholder="Số điện thoại" value={formData.sdt}
                          onChange={e => setFormData({ ...formData, sdt: e.target.value })} required
                          style={styles.formInputStyle}
                        />
                      </div>

                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ fontSize: '12.5px' }}>Khoa (Chuyên môn)</label>
                        <select
                          className="form-input" value={formData.chuyenMon || ''}
                          onChange={e => setFormData({ ...formData, chuyenMon: e.target.value })}
                          style={styles.formSelectStyle}
                        >
                          <option value="">— Chọn khoa / chuyên môn —</option>
                          {danhMucKhoa.map(k => (
                            <option key={k.maKhoa} value={k.tenKhoa}>{k.tenKhoa}</option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group" style={{ margin: 0, gridColumn: '1 / -1' }}>
                        <label className="form-label" style={{ fontSize: '12.5px' }}>Địa chỉ Email</label>
                        <input
                          type="email" className="form-input" placeholder="Email liên lạc" value={formData.email || ''}
                          onChange={e => setFormData({ ...formData, email: e.target.value })}
                          style={styles.formInputStyle}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Nhóm 2: Tài khoản người dùng */}
                  <div>
                    <h4 style={styles.formSectionTitle}>
                      <Key size={14} /> TÀI KHOẢN HỆ THỐNG & PHÂN QUYỀN
                    </h4>
                    <div style={styles.formGrid}>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ fontSize: '12.5px' }}>Tên đăng nhập <span style={{ color: 'red' }}>*</span></label>
                        <input
                          type="text" className="form-input" placeholder="Tên đăng nhập" value={formData.username}
                          onChange={e => setFormData({ ...formData, username: e.target.value })} required
                          style={styles.formInputStyle}
                        />
                      </div>

                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ fontSize: '12.5px' }}>
                          Mật khẩu đăng nhập {!isEdit && <span style={{ color: 'red' }}>*</span>}
                        </label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input
                            type="password" className="form-input" placeholder={isEdit ? "Bỏ trống nếu giữ nguyên" : "Nhập mật khẩu"}
                            value={formData.passwordHash} onChange={e => setFormData({ ...formData, passwordHash: e.target.value })}
                            required={!isEdit} style={styles.formInputStyleFlex}
                          />
                          <button
                            type="button" onClick={handleResetToDefaultPassword} className="btn-outline"
                            style={styles.resetPasswordBtn}
                          >
                            Reset mặc định
                          </button>
                        </div>
                      </div>

                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ fontSize: '12.5px' }}>Vai trò <span style={{ color: 'red' }}>*</span></label>
                        <select
                          className="form-input" value={formData.roleName}
                          onChange={e => setFormData({ ...formData, roleName: e.target.value })} required
                          style={styles.formSelectStyle}
                        >
                          {ROLE_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ fontSize: '12.5px' }}>Trạng thái tài khoản <span style={{ color: 'red' }}>*</span></label>
                        <select
                          className="form-input" value={formData.isActive ? 'true' : 'false'}
                          onChange={e => setFormData({ ...formData, isActive: e.target.value === 'true' })} required
                          style={styles.formSelectStyle}
                        >
                          <option value="true">Cho phép hoạt động (Active)</option>
                          <option value="false">Tạm khóa tài khoản (Locked)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Action buttons */}
                <div style={styles.formActionRow}>
                  <button type="button" className="btn-outline" onClick={handleCancel} style={styles.cancelBtn}>Hủy</button>
                  <button type="submit" className="btn-primary" style={styles.saveBtn}><Save size={16} /> Lưu [F4]</button>
                </div>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

// Bảng cấu hình CSS inline tập trung cho trang PhanQuyenNhanSu
const styles = {
  restrictWrapper: {
    height: '100vh',
    backgroundColor: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    boxSizing: 'border-box',
    position: 'relative'
  },
  restrictBackBtn: {
    position: 'absolute',
    top: '20px',
    left: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    backgroundColor: 'transparent',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    color: 'var(--text-main)',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    margin: 0
  },
  restrictContent: {
    textAlign: 'center',
    maxWidth: '500px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px'
  },
  restrictIconWrapper: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    backgroundColor: '#fee2e2',
    color: '#ef4444',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  restrictTitle: { fontSize: '18px', fontWeight: '800', color: '#1e293b', marginBottom: '8px' },
  restrictDesc: { fontSize: '14.5px', color: '#475569', fontWeight: '600', lineHeight: '1.6' },

  wrapper: { height: '100vh', overflow: 'hidden' },
  topbar: { height: '50px', padding: '0 20px' },
  topbarLeft: { flex: 1, display: 'flex', justifyContent: 'flex-start' },
  backBtn: { padding: '5px 10px' },
  topbarTitle: { flex: 1, display: 'flex', justifyContent: 'center', fontSize: '15px' },
  topbarRight: { flex: 1, display: 'flex', justifyContent: 'flex-end', fontSize: '12px', opacity: 0.85 },

  body: {
    display: 'flex',
    height: 'calc(100vh - 50px)',
    backgroundColor: 'var(--bg-main)',
    overflow: 'hidden'
  },
  leftCol: {
    flex: 1.2,
    display: 'flex',
    flexDirection: 'column',
    borderRight: '1px solid var(--border-color)',
    height: '100%',
    backgroundColor: '#ffffff'
  },
  panelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    borderBottom: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-main)'
  },
  panelTitleContainer: { display: 'flex', alignItems: 'center', gap: '6px' },
  panelTitleText: { fontSize: '14.5px', fontWeight: '750', color: 'var(--text-main)' },
  addBtn: { height: '32px', fontSize: '12.5px', padding: '0 12px', display: 'flex', alignItems: 'center', gap: '4px' },
  tableContainer: { flex: 1, overflowY: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
  tableHeaderRow: { position: 'sticky', top: 0, zIndex: 10, background: 'var(--bg-main)', borderBottom: '2px solid var(--border-color)' },
  thStt: { width: '45px', textAlign: 'center', padding: '8px' },
  thMaNV: { width: '100px', padding: '8px' },
  thUsername: { width: '120px', padding: '8px' },
  thHoTen: { width: '160px', padding: '8px' },
  thVaiTro: { width: '120px', padding: '8px' },
  thTrangThai: { width: '120px', padding: '8px', textAlign: 'center' },
  filterRow: { backgroundColor: 'var(--bg-main)', borderBottom: '1px solid var(--border-color)' },
  tdPadding4: { padding: '4px' },
  filterInput: { height: '26px', fontSize: '12px', padding: '2px 6px' },
  filterSelect: { height: '26px', fontSize: '12px', padding: '0 4px' },
  statusFilterSelect: { height: '26px', fontSize: '12px', padding: '0 2px', fontWeight: '600' },
  tdStt: { textAlign: 'center', padding: '10px 8px', fontWeight: '500', color: 'var(--text-muted)' },
  statusActive: { color: '#10b981', fontWeight: '600', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '3px' },
  statusLocked: { color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '3px' },
  noData: { textAlign: 'center', padding: '40px', color: 'var(--text-muted)' },

  pagination: {
    borderTop: '1px solid var(--border-color)',
    padding: '8px 16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '12.5px',
    color: 'var(--text-muted)',
    backgroundColor: 'var(--bg-main)'
  },
  pageNavBtn: { height: '24px', width: '24px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  pageNumberBtn: {
    height: '24px', width: '24px', padding: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '11px', fontWeight: 'bold', cursor: 'pointer'
  },

  rightCol: {
    flex: 0.9,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: '#ffffff'
  },
  formHeader: {
    display: 'flex',
    backgroundColor: '#0052cc',
    padding: '12px 18px',
    height: '42px',
    alignItems: 'center',
    color: '#ffffff',
    fontSize: '13px',
    fontWeight: '700',
    gap: '8px'
  },
  formArea: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px',
    backgroundColor: '#ffffff'
  },
  noSelected: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-muted)',
    textAlign: 'center',
    gap: '12px'
  },
  noSelectedIcon: { opacity: 0.25, color: 'var(--primary)' },
  form: { height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' },
  formSection: { borderBottom: '1px dashed var(--border-color)', paddingBottom: '16px' },
  formSectionTitle: { fontSize: '13px', fontWeight: '700', color: 'var(--primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 16px' },
  formInputStyle: { height: '34px', fontSize: '13px' },
  formInputStyleFlex: { height: '34px', fontSize: '13px', flex: 1 },
  formSelectStyle: { height: '34px', fontSize: '13px', padding: '0 8px' },
  resetPasswordBtn: {
    height: '34px',
    padding: '0 10px',
    fontSize: '12px',
    borderColor: '#ef4444',
    color: '#ef4444',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    whiteSpace: 'nowrap'
  },
  formActionRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '16px',
    marginTop: '32px'
  },
  cancelBtn: { width: '100px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, margin: 0 },
  saveBtn: { width: '120px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: 0, margin: 0 }
};

export default PhanQuyenNhanSu;

