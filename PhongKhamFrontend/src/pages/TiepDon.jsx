import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft, User, Stethoscope, Save, UserPlus, CheckCircle, AlertCircle
} from 'lucide-react';
import { useToast } from '../utils/ToastContext';
import { apiTraCuuBenhNhan, apiTiepNhanBenhNhan, apiGetStaffList } from '../utils/api';

// Hàm kiểm tra định dạng ngày sinh hợp lệ (DD/MM/YYYY)
const isValidDate = (dateStr) => {
  if (!dateStr) return true;
  const parts = dateStr.split('/');
  if (parts.length !== 3) return false;
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);
  
  if (isNaN(day) || isNaN(month) || isNaN(year)) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  if (year < 1900 || year > new Date().getFullYear()) return false;
  
  const daysInMonth = new Date(year, month, 0).getDate();
  return day <= daysInMonth;
};

// Dữ liệu gợi ý ICD-10 mặc định
const defaultICDData = [
  { maICD: 'A09', tenBenh: 'Tiêu chảy và viêm dạ dày ruột do nhiễm khuẩn' },
  { maICD: 'I10', tenBenh: 'Tăng huyết áp vô căn (nguyên phát)' },
  { maICD: 'E11', tenBenh: 'Đái tháo đường không phụ thuộc insulin (Typ 2)' },
  { maICD: 'J06', tenBenh: 'Nhiễm khuẩn đường hô hấp trên cấp tính nhiều vị trí' },
  { maICD: 'K29', tenBenh: 'Viêm dạ dày và tá tràng' },
  { maICD: 'M54', tenBenh: 'Đau lưng' },
  { maICD: 'N39', tenBenh: 'Nhiễm trùng đường tiết niệu (không xác định vị trí)' },
  { maICD: 'R05', tenBenh: 'Ho' }
];

function TiepDon() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showSuccess, showError } = useToast();
  
  // Danh sách bác sĩ tải động từ backend và các danh mục gợi ý
  const [danhSachBacSi, setDanhSachBacSi] = useState([]);
  const [danhMucICD, setDanhMucICD] = useState([]);
  
  // Trạng thái biểu mẫu nhập liệu
  const [formData, setFormData] = useState({
    sdt: '',
    hoTen: '',
    ngaySinh: '', // Định dạng hiển thị: DD/MM/YYYY
    gioiTinh: 'Nam',
    diaChi: '',
    tienSuBenh: '',
    maBacSi: '',
    lyDoKham: '',
    maICD: '',
    tenBenhICD: ''
  });

  const [notification, setNotification] = useState(null); // Banner thông báo thành công
  const [foundPatient, setFoundPatient] = useState(null); // Thông tin bệnh nhân cũ tìm thấy
  const [icdQuery, setIcdQuery] = useState('');
  const [showIcdDropdown, setShowIcdDropdown] = useState(false);

  // 1. Tải danh sách bác sĩ đang hoạt động từ backend
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await apiGetStaffList('active', 1, 100, '', 2); // RoleID 2 là Bác sĩ
        if (res && res.data) setDanhSachBacSi(res.data);
      } catch (err) {
        console.error('Không thể tải danh sách bác sĩ:', err);
        showError('Không thể tải danh sách bác sĩ từ máy chủ!');
      }
    };
    fetchDoctors();
    
    // Tải danh mục ICD từ LocalStorage
    try {
      const stored = localStorage.getItem('danhMucICD');
      setDanhMucICD(stored ? JSON.parse(stored) : defaultICDData);
    } catch (e) {
      setDanhMucICD(defaultICDData);
    }
  }, []);

  // 2. Tự động điền dữ liệu nếu chuyển hướng từ trang Lịch đặt khám
  useEffect(() => {
    if (location.state) {
      const { hoTen, sdt, lyDoKham } = location.state;
      setFormData(prev => ({ ...prev, hoTen: hoTen || '', sdt: sdt || '', lyDoKham: lyDoKham || '' }));

      if (sdt && sdt.length === 10 && sdt.startsWith('0')) {
        apiTraCuuBenhNhan(sdt)
          .then(res => {
            if (res && res.found && res.data) {
              setFoundPatient(res.data);
              showSuccess('Đã tự động tìm thấy hồ sơ bệnh nhân cũ từ lịch đặt khám!');
            }
          })
          .catch(err => console.error('Lỗi tự động tra cứu:', err));
      }
    }
  }, [location.state]);

  // 3. Phím tắt: F4 để Lưu tiếp nhận, F2 để Điền nhanh thông tin bệnh nhân cũ
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'F4') {
        e.preventDefault();
        handleSave();
      } else if (e.key === 'F2') {
        e.preventDefault();
        if (foundPatient) handleAutoFill();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [formData, foundPatient]);

  // 4. Tra cứu bệnh nhân cũ theo SĐT khi nhập đủ 10 chữ số
  const handleSdtChange = async (val) => {
    const cleanVal = val.replace(/\D/g, ''); // Loại bỏ ký tự không phải số
    setFormData(prev => ({ ...prev, sdt: cleanVal }));
    
    if (cleanVal.length === 10 && cleanVal.startsWith('0')) {
      try {
        const res = await apiTraCuuBenhNhan(cleanVal);
        if (res && res.found && res.data) {
          setFoundPatient(res.data);
          showSuccess(`Tìm thấy BN cũ: ${res.data.hoTen}! Bấm F2 để điền nhanh.`);
        } else {
          setFoundPatient(null);
        }
      } catch (err) {
        setFoundPatient(null);
      }
    } else {
      setFoundPatient(null);
    }
  };

  // 5. Tự động định dạng dấu gạch chéo ngày sinh (DD/MM/YYYY) khi gõ
  const handleNgaySinhChange = (e) => {
    let val = e.target.value;
    const isDeleting = e.nativeEvent.inputType === 'deleteContentBackward';
    
    if (!isDeleting) {
      const digits = val.replace(/\D/g, '');
      if (digits.length > 0) {
        if (digits.length <= 2) val = digits;
        else if (digits.length <= 4) val = `${digits.slice(0, 2)}/${digits.slice(2)}`;
        else val = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
      }
    }
    if (val.length <= 10) setFormData(prev => ({ ...prev, ngaySinh: val }));
  };

  const handleNgaySinhBlur = () => {
    let val = formData.ngaySinh.trim();
    const digits = val.replace(/\D/g, '');
    if (digits.length === 8) {
      val = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
      setFormData(prev => ({ ...prev, ngaySinh: val }));
    }
  };

  // 6. Điền nhanh thông tin bệnh nhân cũ (F2)
  const handleAutoFill = () => {
    if (foundPatient) {
      let displayDob = '';
      if (foundPatient.ngaySinh) {
        const parts = foundPatient.ngaySinh.split('-');
        displayDob = parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : foundPatient.ngaySinh;
      }
      setFormData(prev => ({
        ...prev,
        hoTen: foundPatient.hoTen,
        ngaySinh: displayDob,
        gioiTinh: foundPatient.gioiTinh,
        diaChi: foundPatient.diaChi || '',
        tienSuBenh: foundPatient.tienSuBenh || ''
      }));
      setNotification({
        type: 'success',
        message: `Đã điền thông tin bệnh nhân cũ: ${foundPatient.hoTen} (${foundPatient.maBN})`
      });
      setFoundPatient(null);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  // Tính tuổi tự động từ chuỗi DD/MM/YYYY
  const getAge = () => {
    if (!formData.ngaySinh || formData.ngaySinh.length !== 10) return '—';
    const parts = formData.ngaySinh.split('/');
    if (parts.length !== 3) return '—';
    const birthDate = new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
    if (isNaN(birthDate.getTime())) return '—';
    
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age >= 0 ? `${age} tuổi` : '—';
  };

  const handleCancel = () => {
    setFormData({
      sdt: '', hoTen: '', ngaySinh: '', gioiTinh: 'Nam',
      diaChi: '', tienSuBenh: '', maBacSi: '', lyDoKham: '',
      maICD: '', tenBenhICD: ''
    });
    setIcdQuery('');
    setFoundPatient(null);
  };

  // 7. Gửi yêu cầu lưu tiếp nhận lên Backend C#
  const handleSave = async () => {
    if (!formData.hoTen.trim()) return showError('Vui lòng nhập Họ và tên bệnh nhân!');
    if (!formData.sdt.trim()) return showError('Vui lòng nhập Số điện thoại!');
    if (!formData.ngaySinh.trim()) return showError('Vui lòng nhập Ngày tháng năm sinh!');
    if (!isValidDate(formData.ngaySinh) || formData.ngaySinh.length !== 10) {
      return showError('Ngày sinh không hợp lệ (Định dạng đúng: DD/MM/YYYY)!');
    }

    // Chuyển đổi định dạng ngày sang YYYY-MM-DD trước khi gửi lên API
    let formattedNgaySinh = '';
    const parts = formData.ngaySinh.split('/');
    if (parts.length === 3) {
      formattedNgaySinh = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }

    const payload = {
      maBN: foundPatient?.maBN || null,
      hoTen: formData.hoTen.trim(),
      ngaySinh: formattedNgaySinh,
      gioiTinh: formData.gioiTinh,
      sdt: formData.sdt.trim(),
      diaChi: formData.diaChi.trim() || null,
      tienSuBenh: formData.tienSuBenh.trim() || null,
      maBacSi: formData.maBacSi || null,
      lyDoKham: formData.lyDoKham.trim(),
      maICD: formData.maICD || null
    };

    try {
      const res = await apiTiepNhanBenhNhan(payload);
      if (res && res.data) {
        setNotification({
          type: 'success',
          message: `Lưu tiếp nhận thành công! Mã BN: ${res.data.maBN}, Mã Phiếu: ${res.data.maPhieu}`
        });
        showSuccess('Tiếp nhận bệnh nhân thành công!');
        handleCancel();
        setTimeout(() => setNotification(null), 5000);
      }
    } catch (err) {
      showError(err.message || 'Lỗi kết nối máy chủ, vui lòng thử lại.');
    }
  };

  const dateWarning = formData.ngaySinh.length === 10 && !isValidDate(formData.ngaySinh) ? 'Ngày sinh không hợp lệ' : '';
  const filteredICDs = danhMucICD.filter(item => 
    item.maICD.toLowerCase().includes((icdQuery || formData.maICD).toLowerCase()) ||
    item.tenBenh.toLowerCase().includes((icdQuery || formData.tenBenhICD).toLowerCase())
  );

  return (
    <div className="kb-wrapper" style={styles.wrapper}>
      {/* Thanh công cụ định hướng phía trên */}
      <div className="kb-topbar" style={styles.topbar}>
        <div style={{ flex: 1, display: 'flex' }}>
          <button className="kb-back-btn" onClick={() => navigate('/')} style={{ padding: '5px 10px' }}>
            <ArrowLeft size={16} /> Quay về trang chủ
          </button>
        </div>
        <div className="kb-topbar-title" style={styles.topbarTitle}>
          <UserPlus size={18} style={{ marginRight: '6px' }} />
          <strong>Tiếp đón & Tiếp nhận Bệnh nhân mới</strong>
        </div>
        <div style={{ flex: 1 }}></div>
      </div>

      {/* Vùng thân chính chứa biểu mẫu */}
      <div className="kb-body" style={styles.body}>
        {notification && (
          <div style={styles.alertSuccess}>
            <CheckCircle size={16} />
            <span style={{ fontWeight: '500' }}>{notification.message}</span>
          </div>
        )}

        <div style={styles.gridContainer}>
          {/* CỘT TRÁI: NHẬP THÔNG TIN CÁ NHÂN */}
          <div style={styles.column}>
            <div>
              <div style={styles.columnHeader}>
                <User size={16} style={{ color: 'var(--primary)' }} />
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main)' }}>Thông tin cá nhân (Hành chính)</h3>
              </div>

              <div style={styles.formGrid}>
                {/* Số điện thoại & nút F2 điền nhanh */}
                <div className="form-group" style={{ gridColumn: 'span 2', marginBottom: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="form-label" style={{ fontWeight: '600', fontSize: '13px' }}>
                      Số điện thoại <span style={{ color: 'red' }}>*</span>
                    </label>
                    {foundPatient && (
                      <button onClick={handleAutoFill} style={styles.autoFillBtn}>
                        <AlertCircle size={10} /> BN cũ: Điền nhanh [F2]
                      </button>
                    )}
                  </div>
                  <input
                    type="text" className="form-input" style={{ paddingLeft: '12px', height: '36px' }}
                    placeholder="Nhập SĐT để tra cứu hoặc tiếp đón mới..."
                    value={formData.sdt} onChange={e => handleSdtChange(e.target.value)}
                  />
                </div>

                {/* Họ và tên (Tự động in hoa) */}
                <div className="form-group" style={{ gridColumn: 'span 2', marginBottom: 0 }}>
                  <label className="form-label" style={{ fontWeight: '600', fontSize: '13px' }}>
                    Họ và tên bệnh nhân <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input
                    type="text" className="form-input" style={{ paddingLeft: '12px', height: '36px' }}
                    placeholder="NHẬP HỌ VÀ TÊN (CHỮ HOA)..."
                    value={formData.hoTen}
                    onChange={e => setFormData({ ...formData, hoTen: e.target.value.toUpperCase() })}
                  />
                </div>

                {/* Giới tính */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontWeight: '600', fontSize: '13px' }}>Giới tính *</label>
                  <select
                    className="form-input" style={{ paddingLeft: '12px', height: '36px' }}
                    value={formData.gioiTinh} onChange={e => setFormData({ ...formData, gioiTinh: e.target.value })}
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>

                {/* Ngày sinh */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontWeight: '600', fontSize: '13px' }}>Ngày sinh (DD/MM/YYYY) *</label>
                  <input
                    type="text" className={`form-input ${dateWarning ? 'form-input-warning' : ''}`}
                    style={{ paddingLeft: '12px', height: '36px' }} placeholder="VD: 15/03/1980" maxLength={10}
                    value={formData.ngaySinh} onChange={handleNgaySinhChange} onBlur={handleNgaySinhBlur}
                  />
                  {dateWarning && <span className="form-warning">{dateWarning}</span>}
                </div>

                {/* Tuổi (tự động tính) */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '13px' }}>Tuổi (tự động)</label>
                  <input
                    type="text" className="form-input" style={styles.disabledInput}
                    disabled value={getAge()}
                  />
                </div>

                {/* Địa chỉ */}
                <div className="form-group" style={{ gridColumn: 'span 2', marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '13px' }}>Địa chỉ thường trú</label>
                  <input
                    type="text" className="form-input" style={{ paddingLeft: '12px', height: '36px' }}
                    placeholder="Số nhà, đường, xã, huyện, tỉnh/thành..."
                    value={formData.diaChi} onChange={e => setFormData({ ...formData, diaChi: e.target.value })}
                  />
                </div>

                {/* Tiền sử bệnh */}
                <div className="form-group" style={{ gridColumn: 'span 2', marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '13px' }}>Tiền sử bệnh án</label>
                  <textarea
                    className="form-input" style={styles.textareaMini}
                    placeholder="Tiền sử dị ứng, tim mạch, huyết áp..."
                    value={formData.tienSuBenh} onChange={e => setFormData({ ...formData, tienSuBenh: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: CHỈ ĐỊNH PHÒNG KHÁM & BÁC SĨ */}
          <div style={styles.column}>
            <div>
              <div style={styles.columnHeader}>
                <Stethoscope size={16} style={{ color: 'var(--primary)' }} />
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main)' }}>Chỉ định khám & Phân phòng</h3>
              </div>

              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label" style={{ fontWeight: '600', fontSize: '13px' }}>
                  Lý do đến khám <span style={{ color: 'red' }}>*</span>
                </label>
                <textarea
                  className="form-input" style={styles.textareaBig}
                  placeholder="Nhập lý do đến khám bệnh hoặc triệu chứng lâm sàng..."
                  value={formData.lyDoKham} onChange={e => setFormData({ ...formData, lyDoKham: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label" style={{ fontWeight: '600', fontSize: '13px' }}>Bác sĩ khám (Phòng khám chỉ định)</label>
                <select
                  className="form-input" style={{ paddingLeft: '12px', height: '36px' }}
                  value={formData.maBacSi} onChange={e => setFormData({ ...formData, maBacSi: e.target.value })}
                >
                  <option value="">-- Chọn Bác sĩ khám / Tự động phân phòng --</option>
                  {danhSachBacSi.map(doc => (
                    <option key={doc.maNV} value={doc.maNV}>{doc.hoTen}</option>
                  ))}
                </select>
              </div>

              {/* Nhập mã ICD gợi ý */}
              <div className="form-group" style={{ marginBottom: 0, position: 'relative' }}>
                <label className="form-label" style={{ fontWeight: '600', fontSize: '13px' }}>Mã bệnh & Chẩn đoán ban đầu (ICD)</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text" className="form-input" style={styles.icdCodeInput}
                    placeholder="Mã bệnh" value={formData.maICD}
                    onChange={e => {
                      const val = e.target.value.toUpperCase();
                      const found = danhMucICD.find(item => item.maICD.toUpperCase() === val);
                      setFormData(prev => ({ 
                        ...prev, maICD: val, tenBenhICD: found ? found.tenBenh : prev.tenBenhICD 
                      }));
                    }}
                  />
                  <input
                    type="text" className="form-input" style={{ paddingLeft: '10px', height: '36px', flex: 0.7 }}
                    placeholder="Tìm chẩn đoán bệnh lý hoặc nhập tay..."
                    value={icdQuery || formData.tenBenhICD}
                    onFocus={() => setShowIcdDropdown(true)}
                    onChange={e => {
                      const val = e.target.value;
                      setIcdQuery(val);
                      setFormData(prev => ({ ...prev, tenBenhICD: val }));
                      setShowIcdDropdown(true);
                    }}
                  />
                </div>

                {/* Dropdown danh sách gợi ý ICD */}
                {showIcdDropdown && (
                  <>
                    <div onClick={() => setShowIcdDropdown(false)} style={styles.backdrop} />
                    <div style={styles.dropdownList}>
                      {filteredICDs.map(item => (
                        <div 
                          key={item.maICD} style={styles.dropdownItem}
                          onClick={() => {
                            setFormData(prev => ({ ...prev, maICD: item.maICD, tenBenhICD: item.tenBenh }));
                            setIcdQuery('');
                            setShowIcdDropdown(false);
                          }}
                          onMouseEnter={e => e.target.style.backgroundColor = 'var(--bg-main)'}
                          onMouseLeave={e => e.target.style.backgroundColor = 'transparent'}
                        >
                          <strong style={{ color: 'var(--primary)' }}>{item.maICD}</strong> - {item.tenBenh}
                        </div>
                      ))}
                      {filteredICDs.length === 0 && (
                        <div style={styles.dropdownEmpty}>Không tìm thấy bệnh lý khớp. Bạn tự gõ tự do.</div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div style={styles.guideBox}>
              <strong>Hướng dẫn nhanh:</strong> Nhấn <strong>F4</strong> để lưu tiếp nhận hiện tại, nhấn <strong>F2</strong> để tự động điền thông tin khi phát hiện số điện thoại bệnh nhân cũ.
            </div>
          </div>
        </div>
      </div>

      {/* THANH THAO TÁC CỐ ĐỊNH Ở DƯỚI */}
      <div style={styles.bottomBar}>
        <button className="btn-outline" onClick={handleCancel} style={styles.cancelBtn}>
          Hủy tiếp nhận
        </button>
        <button className="btn-primary" onClick={handleSave} style={styles.saveBtn}>
          <Save size={16} /> Lưu tiếp đón [F4]
        </button>
      </div>
    </div>
  );
}

// Tập hợp các đối tượng CSS Styles tập trung giúp JSX gọn gàng, thẩm mỹ
const styles = {
  wrapper: { height: '100vh', overflow: 'hidden' },
  topbar: { height: '50px', padding: '0 20px' },
  topbarTitle: { flex: 1, display: 'flex', justifyContent: 'center', fontSize: '15px' },
  body: {
    padding: '16px',
    backgroundColor: 'var(--bg-main)',
    height: 'calc(100vh - 118px)',
    overflowY: 'auto',
    display: 'block'
  },
  alertSuccess: {
    backgroundColor: '#dcfce7', borderLeft: '4px solid #22c55e', color: '#15803d',
    padding: '8px 12px', borderRadius: '6px', marginBottom: '12px',
    display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px',
    animation: 'fadeIn 0.2s ease-in-out'
  },
  gridContainer: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '16px', height: '100%'
  },
  column: {
    backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-lg)', padding: '16px 20px', boxShadow: 'var(--shadow-sm)',
    display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
  },
  columnHeader: {
    display: 'flex', alignItems: 'center', gap: '6px',
    borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '12px'
  },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 14px' },
  disabledInput: { paddingLeft: '12px', height: '36px', backgroundColor: '#f1f5f9', fontWeight: 'bold' },
  textareaMini: { paddingLeft: '12px', minHeight: '44px', height: '44px', resize: 'none', padding: '6px 12px' },
  textareaBig: { paddingLeft: '12px', minHeight: '120px', resize: 'none', padding: '8px 12px' },
  icdCodeInput: { paddingLeft: '10px', height: '36px', flex: 0.3, textTransform: 'uppercase' },
  autoFillBtn: {
    backgroundColor: '#0ea5e9', color: 'white', border: 'none', borderRadius: '4px',
    padding: '2px 8px', fontSize: '11px', fontWeight: '600', cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: '4px', animation: 'pulse 1.5s infinite'
  },
  backdrop: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 998 },
  dropdownList: {
    position: 'absolute', bottom: '40px', left: 0, right: 0,
    backgroundColor: '#ffffff', border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)',
    maxHeight: '180px', overflowY: 'auto', zIndex: 999
  },
  dropdownItem: {
    padding: '8px 12px', cursor: 'pointer', fontSize: '12.5px',
    borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-main)'
  },
  dropdownEmpty: { padding: '8px 12px', fontSize: '12.5px', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'left' },
  guideBox: {
    backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)', padding: '10px 12px', marginTop: '16px',
    fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4'
  },
  bottomBar: {
    position: 'fixed', bottom: 0, left: 0, right: 0, height: '68px',
    backgroundColor: '#ffffff', borderTop: '1px solid var(--border-color)',
    display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
    padding: '0 24px', gap: '12px', zIndex: 100, boxShadow: '0 -2px 10px rgba(0,0,0,0.05)'
  },
  cancelBtn: { width: 'auto', padding: '10px 20px', margin: 0 },
  saveBtn: {
    width: 'auto', padding: '10px 24px', margin: 0,
    display: 'flex', alignItems: 'center', gap: '8px',
    backgroundColor: '#22c55e', borderColor: '#22c55e'
  }
};

export default TiepDon;
