import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft, User, Stethoscope, Save, UserPlus, CheckCircle, AlertCircle
} from 'lucide-react';
import { useToast } from '../utils/ToastContext';
import { apiTraCuuBenhNhan, apiTiepNhanBenhNhan, apiGetBacSiList, apiGetKhoaList } from '../utils/api';

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



function TiepDon() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showSuccess, showError } = useToast();
  
  // Danh sách bác sĩ tải động từ backend và bản đồ khoa phòng
  const [danhSachBacSi, setDanhSachBacSi] = useState([]);
  const [khoaMapping, setKhoaMapping] = useState({});
  
  // Trạng thái biểu mẫu nhập liệu (Khởi tạo từ location.state nếu chuyển từ trang Lịch đặt khám)
  const [formData, setFormData] = useState(() => {
    const state = location.state || {};
    return {
      sdt: state.sdt || '',
      hoTen: state.hoTen || '',
      ngaySinh: '', // Định dạng hiển thị: DD/MM/YYYY
      gioiTinh: 'Nam',
      diaChi: '',
      tienSuBenh: '',
      maBacSi: '',
      lyDoKham: state.lyDoKham || ''
    };
  });

  const [foundPatient, setFoundPatient] = useState(null); // Thông tin bệnh nhân cũ tìm thấy

  // Tra cứu bệnh nhân cũ theo SĐT khi nhập đủ 10 chữ số
  const handleSdtChange = async (val) => {
    const cleanVal = val.replace(/\D/g, ''); // Loại bỏ ký tự không phải số
    setFormData(prev => ({ ...prev, sdt: cleanVal }));
    
    if (cleanVal.length === 10 && cleanVal.startsWith('0')) {
      try {
        const res = await apiTraCuuBenhNhan(cleanVal);
        if (res && res.found && res.data) {
          setFoundPatient(res.data);
          showSuccess(`Tìm thấy hồ sơ bệnh nhân cũ: ${res.data.hoTen}. Đã tự động điền thông tin!`);
          
          // Tự động điền dữ liệu hành chính từ hồ sơ bệnh nhân cũ tìm thấy
          let displayDob = '';
          if (res.data.ngaySinh) {
            const separator = res.data.ngaySinh.includes('-') ? '-' : '/';
            const parts = res.data.ngaySinh.split(separator);
            if (parts.length === 3) {
              if (parts[0].length === 4) {
                displayDob = `${parts[2]}/${parts[1]}/${parts[0]}`;
              } else {
                displayDob = `${parts[0]}/${parts[1]}/${parts[2]}`;
              }
            } else {
              displayDob = res.data.ngaySinh;
            }
          }
          setFormData(prev => ({
            ...prev,
            hoTen: res.data.hoTen,
            ngaySinh: displayDob,
            gioiTinh: res.data.gioiTinh || 'Nam',
            diaChi: res.data.diaChi || '',
            tienSuBenh: res.data.tienSuBenh || ''
          }));
        } else {
          setFoundPatient(null);
        }
      } catch (err) {
        console.error('Lỗi tra cứu SĐT:', err);
        setFoundPatient(null);
      }
    } else {
      // Nếu số điện thoại bị thay đổi và không còn khớp 10 số, reset foundPatient và xóa form
      setFoundPatient(null);
      setFormData(prev => ({
        ...prev,
        hoTen: '',
        ngaySinh: '',
        gioiTinh: 'Nam',
        diaChi: '',
        tienSuBenh: ''
      }));
    }
  };

  // Tự động định dạng dấu gạch chéo ngày sinh (DD/MM/YYYY) khi gõ
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

  // Điền nhanh thông tin bệnh nhân cũ (F2)
  const handleAutoFill = () => {
    if (foundPatient) {
      let displayDob = '';
      if (foundPatient.ngaySinh) {
        const separator = foundPatient.ngaySinh.includes('-') ? '-' : '/';
        const parts = foundPatient.ngaySinh.split(separator);
        if (parts.length === 3) {
          if (parts[0].length === 4) {
            // Định dạng: YYYY-MM-DD -> DD/MM/YYYY
            displayDob = `${parts[2]}/${parts[1]}/${parts[0]}`;
          } else {
            // Định dạng: DD-MM-YYYY -> DD/MM/YYYY
            displayDob = `${parts[0]}/${parts[1]}/${parts[2]}`;
          }
        } else {
          displayDob = foundPatient.ngaySinh;
        }
      }
      setFormData(prev => ({
        ...prev,
        hoTen: foundPatient.hoTen,
        ngaySinh: displayDob,
        gioiTinh: foundPatient.gioiTinh,
        diaChi: foundPatient.diaChi || '',
        tienSuBenh: foundPatient.tienSuBenh || ''
      }));
      showSuccess(`Đã điền thông tin bệnh nhân cũ: ${foundPatient.hoTen} (${foundPatient.maBN})`);
      setFoundPatient(null);
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
      diaChi: '', tienSuBenh: '', maBacSi: '', lyDoKham: ''
    });
    setFoundPatient(null);
  };

  // Gửi yêu cầu lưu tiếp nhận lên Backend C#
  const handleSave = async () => {
    if (!formData.hoTen.trim()) return showError('Vui lòng nhập Họ và tên bệnh nhân!');
    if (!formData.sdt.trim()) return showError('Vui lòng nhập Số điện thoại!');
    if (!formData.ngaySinh.trim()) return showError('Vui lòng nhập Ngày tháng năm sinh!');
    if (!isValidDate(formData.ngaySinh) || formData.ngaySinh.length !== 10) {
      return showError('Ngày sinh không hợp lệ (Định dạng đúng: DD/MM/YYYY)!');
    }
    if (!formData.maBacSi) {
      return showError('Vui lòng chỉ định Bác sĩ khám cho bệnh nhân!');
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
      maNV: formData.maBacSi || null,
      lyDoKham: formData.lyDoKham.trim()
    };

    try {
      const res = await apiTiepNhanBenhNhan(payload);
      if (res && res.data) {
        showSuccess(`Tiếp nhận bệnh nhân thành công! Mã BN: ${res.data.maBN}, Mã Phiếu: ${res.data.maPhieu}`, 5000);
        handleCancel();
      }
    } catch (err) {
      let errMsg = err.message || 'Lỗi kết nối máy chủ, vui lòng thử lại.';
      if (errMsg.includes('chưa hoàn tất') || errMsg.includes('chua hoan tat') || errMsg.includes('phiếu khám chưa hoàn tất')) {
        errMsg = 'Hồ sơ cũ ở trạng thái chưa khám xong vui lòng kiểm tra';
      }
      showError(errMsg);
    }
  };

  // 1. Tải danh sách bác sĩ và danh mục khoa phòng từ backend
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await apiGetBacSiList();
        if (res && res.data) setDanhSachBacSi(res.data);
      } catch (err) {
        console.error('Không thể tải danh sách bác sĩ:', err);
        showError('Không thể tải danh sách bác sĩ từ máy chủ!');
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
        console.error('Không thể tải danh sách khoa:', err);
      }
    };
    fetchDoctors();
    fetchKhoas();
  }, []);

  // 2. Tự động điền dữ liệu nếu chuyển hướng từ trang Lịch đặt khám
  useEffect(() => {
    if (location.state) {
      const { sdt } = location.state;
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

  const dateWarning = formData.ngaySinh.length === 10 && !isValidDate(formData.ngaySinh) ? 'Ngày sinh không hợp lệ' : '';

  return (
    <div className="kb-wrapper h-screen overflow-hidden">
      {/* Thanh công cụ định hướng phía trên */}
      <div className="kb-topbar h-[50px] px-5 flex items-center">
        <div className="flex-1 flex">
          <button className="kb-back-btn py-[5px] px-[10px]" onClick={() => navigate('/staff')}>
            <ArrowLeft size={16} /> Quay về trang chủ
          </button>
        </div>
        <div className="kb-topbar-title flex-1 flex justify-center text-[15px]">
          <UserPlus size={18} className="mr-1.5" />
          <strong>Tiếp đón & Tiếp nhận Bệnh nhân mới</strong>
        </div>
        <div className="flex-1"></div>
      </div>

      {/* Vùng thân chính chứa biểu mẫu */}
      <div 
        className="kb-body p-4 bg-[var(--bg-main)] h-[calc(100vh-106px)] block"
        style={{ overflowY: 'auto', display: 'block' }}
      >


        <div className="grid grid-cols-2 gap-4 h-full">
          {/* CỘT TRÁI: NHẬP THÔNG TIN CÁ NHÂN */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[var(--radius-lg)] py-4 px-5 shadow-[var(--shadow-sm)] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 border-b border-[var(--border-color)] pb-2 mb-3">
                <User size={16} className="text-[var(--primary)]" />
                <h3 className="text-[14px] font-semibold text-[var(--text-main)]">Thông tin cá nhân (Hành chính)</h3>
              </div>

              <div className="grid grid-cols-3 gap-x-[14px] gap-y-[10px]">
                {/* Số điện thoại & nút F2 điền nhanh */}
                <div className="form-group col-span-3 mb-0">
                  <div className="flex justify-between items-center">
                    <label className="form-label font-semibold text-[13px]">
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    {foundPatient && (
                      <button onClick={handleAutoFill} className="bg-[#0ea5e9] text-white border-none rounded-[4px] py-0.5 px-2 text-[11px] font-semibold cursor-pointer flex items-center gap-1 animate-[pulse_1.5s_infinite]">
                        <AlertCircle size={10} /> BN cũ: Điền nhanh [F2]
                      </button>
                    )}
                  </div>
                  <input
                    type="text" className="form-input pl-3 h-9"
                    placeholder="Nhập SĐT để tra cứu hoặc tiếp đón mới..."
                    value={formData.sdt} onChange={e => handleSdtChange(e.target.value)}
                  />
                </div>

                {/* Họ và tên (Tự động in hoa) */}
                <div className="form-group col-span-3 mb-0">
                  <label className="form-label font-semibold text-[13px]">
                    Họ và tên bệnh nhân <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text" className="form-input pl-3 h-9"
                    placeholder="NHẬP HỌ VÀ TÊN (CHỮ HOA)..."
                    value={formData.hoTen}
                    onChange={e => setFormData({ ...formData, hoTen: e.target.value.toUpperCase() })}
                  />
                </div>

                {/* Giới tính */}
                <div className="form-group mb-0">
                  <label className="form-label font-semibold text-[13px]">Giới tính *</label>
                  <select
                    className="form-input pl-3 h-10 py-1.5"
                    value={formData.gioiTinh} onChange={e => setFormData({ ...formData, gioiTinh: e.target.value })}
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>

                {/* Ngày sinh */}
                <div className="form-group mb-0">
                  <label className="form-label font-semibold text-[13px]">Ngày sinh *</label>
                  <input
                    type="text" className={`form-input pl-3 h-9 ${dateWarning ? 'form-input-warning' : ''}`}
                    placeholder="DD/MM/YYYY" maxLength={10}
                    value={formData.ngaySinh} onChange={handleNgaySinhChange} onBlur={handleNgaySinhBlur}
                  />
                  {dateWarning && <span className="form-warning">{dateWarning}</span>}
                </div>

                {/* Tuổi (tự động tính) */}
                <div className="form-group mb-0">
                  <label className="form-label text-[13px]">Tuổi (tự động)</label>
                  <input
                    type="text" className="form-input pl-3 h-9 bg-[#f1f5f9] font-bold"
                    disabled value={getAge()}
                  />
                </div>

                {/* Địa chỉ */}
                <div className="form-group col-span-3 mb-0">
                  <label className="form-label text-[13px]">Địa chỉ thường trú</label>
                  <input
                    type="text" className="form-input pl-3 h-9"
                    placeholder="Số nhà, đường, xã, huyện, tỉnh/thành..."
                    value={formData.diaChi} onChange={e => setFormData({ ...formData, diaChi: e.target.value })}
                  />
                </div>

                {/* Tiền sử bệnh */}
                <div className="form-group col-span-3 mb-0">
                  <label className="form-label text-[13px]">Tiền sử bệnh án</label>
                  <textarea
                    className="form-input pl-3 min-h-[44px] h-[44px] resize-none py-1.5 px-3"
                    placeholder="Tiền sử dị ứng, tim mạch, huyết áp..."
                    value={formData.tienSuBenh} onChange={e => setFormData({ ...formData, tienSuBenh: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: CHỈ ĐỊNH PHÒNG KHÁM & BÁC SĨ */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[var(--radius-lg)] py-4 px-5 shadow-[var(--shadow-sm)] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 border-b border-[var(--border-color)] pb-2 mb-3">
                <Stethoscope size={16} className="text-[var(--primary)]" />
                <h3 className="text-[14px] font-semibold text-[var(--text-main)]">Chỉ định khám & Phân phòng</h3>
              </div>

              <div className="form-group mb-3">
                <label className="form-label font-semibold text-[13px]">
                  Lý do đến khám <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="form-input pl-3 min-h-[120px] resize-none py-2 px-3"
                  placeholder="Nhập lý do đến khám bệnh hoặc triệu chứng lâm sàng..."
                  value={formData.lyDoKham} onChange={e => setFormData({ ...formData, lyDoKham: e.target.value })}
                />
              </div>

              <div className="form-group mb-0">
                <label className="form-label font-semibold text-[13px]">Bác sĩ khám (Bắt buộc)</label>
                <select
                  className="form-input pl-3 h-10 py-1.5"
                  value={formData.maBacSi} onChange={e => setFormData({ ...formData, maBacSi: e.target.value })}
                >
                  <option value="">-- Chọn Bác sĩ khám (Bắt buộc) --</option>
                  {danhSachBacSi.map(doc => {
                    const tenKhoa = khoaMapping[doc.maKhoa] || doc.maKhoa || 'Khoa lâm sàng';
                    return (
                      <option key={doc.maNV} value={doc.maNV}>
                        {doc.hoTen} - {tenKhoa}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* THANH THAO TÁC CỐ ĐỊNH Ở DƯỚI */}
      <div className="fixed bottom-0 left-0 right-0 h-[56px] bg-white border-t border-[var(--border-color)] flex items-center justify-end px-6 gap-3 z-[100] shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        <button 
          className="!w-auto !h-9 !px-4 !py-0 !m-0 !text-[13px] !font-semibold flex items-center justify-center bg-transparent border border-[var(--primary)] text-[var(--primary)] rounded-[var(--radius-md)] hover:bg-[var(--primary-light)] transition-all cursor-pointer" 
          onClick={handleCancel}
        >
          Hủy tiếp nhận
        </button>
        <button 
          className="!w-auto !h-9 !px-5 !py-0 !m-0 !text-[13px] !font-semibold flex items-center justify-center gap-1.5 bg-[#22c55e] hover:bg-[#16a34a] text-white border-none rounded-[var(--radius-md)] transition-all cursor-pointer" 
          onClick={handleSave}
        >
          <Save size={14} /> Lưu tiếp đón
        </button>
      </div>
    </div>
  );
}

export default TiepDon;
