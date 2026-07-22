import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { 
  ArrowLeft, Search, User, Calendar, Receipt, Printer, CheckCircle, 
  AlertCircle, Plus, Trash2, FileText, Activity, Pill, ClipboardList, CreditCard
} from 'lucide-react';
import { useToast } from '../utils/ToastContext';
import { 
  apiGetThanhToanList, 
  apiGetThanhToanChiTiet, 
  apiAddThanhToanVatTu, 
  apiDeleteThanhToanVatTu, 
  apiXacNhanThanhToan, 
  apiGetThanhToanPDF,
  apiGetVatTuList
} from '../utils/api';


// Giá tiền và số lượng quy đổi được lấy trực tiếp từ Backend API
const parseDaysFromCachDung = (cachDung) => {
  if (!cachDung) return '--';
  const match = cachDung.match(/(\d+)\s*ngày/i);
  if (match) return match[1];
  
  const numbers = cachDung.match(/\d+/g);
  if (numbers && numbers.length >= 3) {
    return numbers[2];
  }
  return '--';
};

/**
 * Component chính quản lý màn hình thanh toán hóa đơn viện phí
 */
function ThanhToanHoaDon() {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  
  // Các state lưu trữ danh sách phiếu khám và phiếu được chọn
  const [dsPhieuKham, setDsPhieuKham] = useState([]);
  const [selectedPhieu, setSelectedPhieu] = useState(null);
  const [billingDetails, setBillingDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Các state lưu trữ danh mục từ LocalStorage
  const [danhMucDichVu, setDanhMucDichVu] = useState([]);
  const [danhMucThuoc, setDanhMucThuoc] = useState([]);
  const [danhMucVatTu, setDanhMucVatTu] = useState([]);
  
  // State quản lý phương thức thanh toán ('Tiền mặt' hoặc 'Chuyển khoản')
  const [phuongThucTT, setPhuongThucTT] = useState('Tiền mặt');
  
  // State quản lý việc thêm vật tư trực tiếp khi lập hóa đơn
  const [showVatTuModal, setShowVatTuModal] = useState(false);
  const [vatTuMoi, setVatTuMoi] = useState({ maVatTu: '', soLuong: 1 });
  const [selectedLotVatTu, setSelectedLotVatTu] = useState('');

  // Các bộ lọc tìm kiếm danh sách phiếu thu
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All', 'Unpaid', 'Paid'

  // Thu ngân đang thao tác
  const [thuNgan, setThuNgan] = useState('Thu ngân hệ thống');

  // Banner thông báo thanh toán thành công không chặn màn hình
  const [successMessage, setSuccessMessage] = useState('');

  // Tải danh sách phiếu thu viện phí (lọc & tìm kiếm) từ máy chủ
  const loadDSPhieuKham = async (selectedCode = null) => {
    setIsLoading(true);
    try {
      const res = await apiGetThanhToanList({
        search: searchQuery.trim(),
        trangThai: statusFilter
      });
      if (res && res.data) {
        setDsPhieuKham(res.data);
        
        // Cập nhật selectedPhieu
        if (selectedCode) {
          const found = res.data.find(p => p.maPhieu === selectedCode);
          if (found) setSelectedPhieu(found);
        } else if (res.data.length > 0) {
          setSelectedPhieu(prev => {
            if (prev) {
              const updated = res.data.find(p => p.maPhieu === prev.maPhieu);
              return updated || res.data[0];
            }
            return res.data[0];
          });
        } else {
          setSelectedPhieu(null);
        }
      } else {
        setDsPhieuKham([]);
        setSelectedPhieu(null);
      }
    } catch (err) {
      console.error("Lỗi tải danh sách phiếu thu:", err);
      showError("Không thể tải danh sách phiếu thu từ máy chủ");
    } finally {
      setIsLoading(false);
    }
  };

  // Tải danh mục vật tư y tế phục vụ kê thêm
  const loadDanhMucVatTu = async () => {
    try {
      const res = await apiGetVatTuList('', '', 1, 100);
      if (res && res.data) {
        const mapped = res.data.map(item => ({
          maVatTu: item.maVatTu || item.MaVatTu,
          tenVatTu: item.tenVatTu || item.TenVatTu,
          donViTinh: item.donViTinh || item.DonViTinh,
          isActive: item.isActive || item.IsActive
        }));
        setDanhMucVatTu(mapped);
      }
    } catch (err) {
      console.error("Lỗi tải danh mục vật tư:", err);
    }
  };

  // Khởi chạy dữ liệu ban đầu
  useEffect(() => {
    // Lấy thông tin tài khoản hiện tại làm thu ngân
    try {
      const curUser = localStorage.getItem('currentUser');
      if (curUser) {
        const parsed = JSON.parse(curUser);
        if (parsed.name) setThuNgan(parsed.name);
      }
    } catch(e) {}

    loadDanhMucVatTu();
  }, []);

  // Lắng nghe bộ lọc tìm kiếm và trạng thái
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      loadDSPhieuKham();
    }, 250);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery, statusFilter]);

  // Lắng nghe selectedPhieu để fetch chi tiết hóa đơn từ backend
  useEffect(() => {
    if (selectedPhieu && selectedPhieu.maPhieu) {
      const fetchDetails = async () => {
        setLoadingDetails(true);
        try {
          const res = await apiGetThanhToanChiTiet(selectedPhieu.maPhieu);
          if (res) {
            setBillingDetails(res);
            setPhuongThucTT(res.phuongThucTT || 'Tiền mặt');
          }
        } catch (err) {
          console.error("Lỗi tải chi tiết hóa đơn:", err);
          showError("Không thể tải chi tiết hóa đơn");
          setBillingDetails(null);
        } finally {
          setLoadingDetails(false);
        }
      };
      fetchDetails();
    } else {
      setBillingDetails(null);
    }
  }, [selectedPhieu]);

  // Lắng nghe sự kiện bàn phím (F12 để thanh toán nhanh, F8 để in phiếu)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'F12') {
        e.preventDefault();
        if (selectedPhieu && !selectedPhieu.daThanhToan) {
          handleExecutePayment();
        }
      } else if (e.key === 'F8') {
        e.preventDefault();
        if (selectedPhieu && selectedPhieu.daThanhToan) {
          handlePrintInvoice();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  // Quy đổi định dạng ngày giờ tiếng Việt
  const getVietnameseDateString = (dateStr) => {
    const d = dateStr ? new Date(dateStr) : new Date();
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `Ngày ${day} tháng ${month} năm ${year} lúc ${hours}:${minutes}`;
  };

  // Thêm vật tư y tế trực tiếp vào phiếu thu (API thực tế)
  const handleAddSupply = async (e) => {
    if (e) e.preventDefault();
    if (!vatTuMoi.maVatTu) {
      showError("Vui lòng chọn vật tư y tế!");
      return;
    }
    if (vatTuMoi.soLuong <= 0) {
      showError("Số lượng vật tư phải lớn hơn 0!");
      return;
    }

    setIsLoading(true);
    try {
      await apiAddThanhToanVatTu(selectedPhieu.maPhieu, {
        maVatTu: vatTuMoi.maVatTu,
        soLuong: parseInt(vatTuMoi.soLuong, 10)
      });
      showSuccess("Kê thêm vật tư y tế thành công!");
      
      const updatedDetails = await apiGetThanhToanChiTiet(selectedPhieu.maPhieu);
      setBillingDetails(updatedDetails);
      loadDSPhieuKham(selectedPhieu.maPhieu);

      setVatTuMoi({ maVatTu: danhMucVatTu.length > 0 ? danhMucVatTu[0].maVatTu : '', soLuong: 1 });
      setShowVatTuModal(false);
    } catch (err) {
      console.error("Lỗi khi thêm vật tư:", err);
      showError(err.message || "Kê thêm vật tư thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  // Xóa vật tư tiêu hao khỏi danh sách kê (API thực tế)
  const handleDeleteSupply = async (maVatTu) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa vật tư này khỏi phiếu thu?")) {
      setIsLoading(true);
      try {
        await apiDeleteThanhToanVatTu(selectedPhieu.maPhieu, maVatTu);
        showSuccess("Xóa vật tư tiêu hao thành công!");
        
        const updatedDetails = await apiGetThanhToanChiTiet(selectedPhieu.maPhieu);
        setBillingDetails(updatedDetails);
        loadDSPhieuKham(selectedPhieu.maPhieu);
      } catch (err) {
        console.error("Lỗi khi xóa vật tư:", err);
        showError(err.message || "Xóa vật tư thất bại");
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Xác nhận và thực hiện thanh toán hóa đơn (API thực tế)
  const handleExecutePayment = async () => {
    if (!selectedPhieu) return;
    setIsLoading(true);
    try {
      const res = await apiXacNhanThanhToan({
        maPhieu: selectedPhieu.maPhieu,
        phuongThucTT
      });
      showSuccess(res.message || "Thanh toán viện phí và lập hóa đơn thành công!");
      
      await loadDSPhieuKham(selectedPhieu.maPhieu);
      const updatedDetails = await apiGetThanhToanChiTiet(selectedPhieu.maPhieu);
      setBillingDetails(updatedDetails);

      if (res.maHoaDon) {
        handlePrintInvoice(res.maHoaDon);
      }
    } catch (err) {
      console.error("Lỗi khi thanh toán:", err);
      showError(err.message || "Thanh toán viện phí thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  // Lệnh in hóa đơn thanh toán tải PDF từ máy chủ
  const handlePrintInvoice = async (maHoaDonOverride = null) => {
    const targetMaHoaDon = maHoaDonOverride || billingDetails?.maHoaDon;
    if (!targetMaHoaDon) {
      showError("Không tìm thấy mã hóa đơn để in!");
      return;
    }
    setIsLoading(true);
    try {
      const blob = await apiGetThanhToanPDF(targetMaHoaDon);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (err) {
      console.error("Lỗi in hóa đơn:", err);
      showError("Không thể tải file PDF hóa đơn");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPhieuKham = dsPhieuKham;

  const services = billingDetails?.cls || [];
  const drugs = billingDetails?.thuoc || [];
  const supplies = billingDetails?.vatTu || [];
  const totalServices = billingDetails?.tongTienDichVu || 0;
  const totalDrugs = billingDetails?.tongTienThuoc || 0;
  const totalSupplies = billingDetails?.tongTienVatTu || 0;
  const grandTotal = billingDetails?.tongTienThanhToan || 0;

  return (
    <div className="kb-wrapper h-screen overflow-hidden">
      
      {/* Topbar điều hướng */}
      <div className="kb-topbar hide-on-print h-[50px] px-5 flex items-center justify-between border-b border-[var(--border-color)] bg-white">
        <div className="flex-1 flex justify-start">
          <button className="kb-back-btn py-[5px] px-[10px]" onClick={() => navigate('/staff')}>
            <ArrowLeft size={16} /> Quay về trang chủ
          </button>
        </div>
        <div className="kb-topbar-title flex-1 flex justify-center items-center text-[15px]">
          <Receipt size={18} className="mr-[6px]" />
          <strong>Thanh toán & Xuất hóa đơn viện phí</strong>
        </div>
        <div className="flex-1 flex justify-end text-[12px] opacity-85">
          <span>Quầy thu ngân / {thuNgan}</span>
        </div>
      </div>

      {/* Main split dashboard area */}
      <div className="kb-body flex h-[calc(100vh-50px)] bg-[var(--bg-main)] overflow-hidden">
        
        {/* CỘT TRÁI: Danh sách phiếu thu */}
        <div className="hide-on-print flex-[1.1] flex flex-col border-r border-[var(--border-color)] h-full bg-white">
          <div className="p-[14px] border-b border-[var(--border-color)] bg-[var(--bg-main)]">
            <div className="flex items-center gap-[6px] mb-3">
              <Receipt size={16} style={{ color: 'var(--primary)' }} />
              <h3 className="text-[14px] font-[750] text-[var(--text-main)] m-0">DANH SÁCH PHIẾU THU VIỆN PHÍ</h3>
            </div>
            
            {/* Thanh tìm kiếm */}
            <div className="search-box mb-2.5 relative">
              <input 
                type="text" 
                placeholder="Tìm mã BN, mã hồ sơ, tên..." 
                className="form-input pl-8 h-8 text-[12.5px]" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <Search size={14} className="absolute left-2.5 top-[9px] text-[var(--text-muted)]" />
            </div>

            {/* Tab lọc trạng thái */}
            <div className="flex gap-1 bg-[#e2e8f0] p-[2px] rounded-[6px]">
              <button 
                onClick={() => setStatusFilter('All')}
                className={`flex-1 py-[5px] px-[5px] border-none text-[11.5px] font-semibold rounded-[4px] cursor-pointer transition-all duration-150 ${statusFilter === 'All' ? 'bg-white text-inherit' : 'bg-transparent text-inherit'}`}
              >
                Tất cả ({dsPhieuKham.length})
              </button>
              <button 
                onClick={() => setStatusFilter('Unpaid')}
                className={`flex-1 py-[5px] px-[5px] border-none text-[11.5px] font-semibold rounded-[4px] cursor-pointer transition-all duration-150 ${statusFilter === 'Unpaid' ? 'bg-white text-[#dc2626]' : 'bg-transparent text-[#dc2626]'}`}
              >
                Chưa TT ({dsPhieuKham.filter(p => !p.daThanhToan).length})
              </button>
              <button 
                onClick={() => setStatusFilter('Paid')}
                className={`flex-1 py-[5px] px-[5px] border-none text-[11.5px] font-semibold rounded-[4px] cursor-pointer transition-all duration-150 ${statusFilter === 'Paid' ? 'bg-white text-[#16a34a]' : 'bg-transparent text-[#16a34a]'}`}
              >
                Đã TT ({dsPhieuKham.filter(p => p.daThanhToan).length})
              </button>
            </div>
          </div>

          {/* List Item container */}
          <div className="flex-1 overflow-y-auto p-2">
            {filteredPhieuKham.length === 0 ? (
              <div className="text-center p-[30px] text-[var(--text-muted)] text-[13px]">
                Không tìm thấy lượt khám nào cần thanh toán.
              </div>
            ) : (
              filteredPhieuKham.map(pk => {
                const isSelected = selectedPhieu && selectedPhieu.maPhieu === pk.maPhieu;
                const isPaid = pk.daThanhToan;
                
                return (
                  <div 
                    key={pk.maPhieu}
                    onClick={() => setSelectedPhieu(pk)}
                    className={`p-3 rounded-lg border cursor-pointer mb-2 transition-all duration-150 ease-in-out ${isSelected ? 'border-[var(--primary)] bg-[var(--primary-light)]' : 'border-[var(--border-color)] bg-white'}`}
                  >
                    <div className="flex justify-between mb-1.5">
                       <span className="text-[11px] font-bold text-[var(--text-muted)]">{pk.maPhieu}</span>
                      {isPaid ? (
                        <span className="text-[11px] text-[#16a34a] bg-[#dcfce7] py-[1px] px-2 rounded-[10px] font-bold">Đã TT</span>
                      ) : (
                        <span className="text-[11px] text-[#dc2626] bg-[#fee2e2] py-[1px] px-2 rounded-[10px] font-bold">Chưa TT</span>
                      )}
                    </div>
                    <div className="text-[13.5px] font-bold text-[var(--text-main)] mb-1">{pk.hoTen}</div>
                    <div className="flex justify-between items-center text-[12px]">
                      <span className="text-[var(--text-muted)]">Mã NB: {pk.maBN}</span>
                      <strong className="text-[#0052cc] text-[13.5px]">
                        {isSelected && billingDetails ? `${billingDetails.tongTienThanhToan.toLocaleString('vi-VN')} đ` : 'Xem chi tiết'}
                      </strong>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* CỘT PHẢI: Chi tiết phiếu thu & Hóa đơn */}
        <div className="flex-[1.9] flex flex-col h-full bg-white">
          {selectedPhieu === null ? (
            <div className="hide-on-print h-full flex flex-col items-center justify-center text-[var(--text-muted)] text-center gap-3">
              <Receipt size={48} className="opacity-25 text-[var(--primary)]" />
              <div>
                <h4 className="font-semibold text-[var(--text-main)]">Chưa chọn phiếu thu</h4>
                <p className="text-[13px] mt-1">Chọn một lượt khám bệnh bên trái để tiến hành lập hóa đơn thanh toán.</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full overflow-y-auto">
              
              {/* PHẦN IN PHIẾU THU KHỔ K57 (Chỉ xuất hiện khi in ấn) */}
              {createPortal(
                <div className="print-only w-[54mm] py-2 px-[1px] text-[9.5px] text-black font-mono leading-[1.25] mx-auto">
                  <div className="text-center mb-1.5">
                    <h3 className="m-0 mb-[2px] text-[11px] font-bold">PHÒNG KHÁM ĐA KHOA NHẬT TẢO</h3>
                    <p className="m-0 mb-[1px] text-[8.5px]">Đ/c: 123 Nhật Tảo, Phường 4, Quận 10, TP. HCM</p>
                    <p className="m-0 text-[8.5px]">Hotline: 090 123 4567</p>
                  </div>

                  <div className="border-b border-dashed border-black my-1.25" />

                  <div className="text-center mb-2">
                    <h2 className="m-0 mb-[3px] text-[12px] font-bold">HÓA ĐƠN THANH TOÁN</h2>
                    <p className="m-0 text-[8.5px] italic">
                      {getVietnameseDateString(selectedPhieu.ngayThanhToan)}
                    </p>
                  </div>

                  <div className="flex flex-col gap-[2px] mb-1.5 text-[9px]">
                    <div>Mã NB: <b>{selectedPhieu.maBN}</b></div>
                    <div>Mã hồ sơ: <b>{selectedPhieu.maPhieu}</b></div>
                    <div>Họ tên: <b>{selectedPhieu.hoTen}</b></div>
                    <div>Ngày sinh: {selectedPhieu.ngaySinh} — Nam/Nữ: {selectedPhieu.gioiTinh}</div>
                    <div>
                      Chẩn đoán: {selectedPhieu.icdList && selectedPhieu.icdList.length > 0 ? (
                        <span>
                          [{selectedPhieu.icdList.map(x => x.maICD).join(', ')}] {selectedPhieu.chanDoan || 'Khám tự nguyện'}
                        </span>
                      ) : selectedPhieu.maICD ? (
                        <span>
                          [{selectedPhieu.maICD}] {selectedPhieu.chanDoan || 'Khám tự nguyện'}
                        </span>
                      ) : (
                        selectedPhieu.chanDoan || 'Khám tự nguyện'
                      )}
                    </div>
                    <div>BS chỉ định: {selectedPhieu.tenBacSi}</div>
                  </div>

                  <div className="border-b border-dashed border-black my-1.25" />

                  {/* Dịch vụ CLS */}
                  {services.length > 0 && (
                    <div className="mb-1.25">
                      <div className="font-bold text-[9px] mb-[2px]">[DỊCH VỤ KỸ THUẬT & CLS]</div>
                      {services.map((item, idx) => (
                        <div key={idx} className="pl-[2px] mb-[2px]">
                          <div>{idx + 1}. {item.tenDV}</div>
                          <div className="flex justify-between pl-2 text-[8.5px] text-[#222]">
                            <span>{item.soLuong} x {item.donGia.toLocaleString('vi-VN')}</span>
                            <span>{item.thanhTien.toLocaleString('vi-VN')} đ</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Thuốc đã kê */}
                  {drugs.length > 0 && (
                    <div className="mb-1.25">
                      <div className="font-bold text-[9px] mb-[2px]">[ĐƠN THUỐC ĐÃ KÊ]</div>
                      {drugs.map((item, idx) => (
                        <div key={idx} className="pl-[2px] mb-[2px]">
                          <div>{idx + 1}. {item.tenThuoc}</div>
                          <div className="flex justify-between pl-2 text-[8.5px] text-[#222]">
                            <span>{item.soLuongQuyDoi} ({item.cachDung})</span>
                            <span>{item.thanhTien.toLocaleString('vi-VN')} đ</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Vật tư tiêu hao */}
                  {supplies.length > 0 && (
                    <div className="mb-1.25">
                      <div className="font-bold text-[9px] mb-[2px]">[VẬT TƯ TIÊU HAO]</div>
                      {supplies.map((item, idx) => (
                        <div key={idx} className="pl-[2px] mb-[2px]">
                          <div>{idx + 1}. {item.tenVatTu}</div>
                          <div className="flex justify-between pl-2 text-[8.5px] text-[#222]">
                            <span>{item.soLuong} x {item.donGia.toLocaleString('vi-VN')}</span>
                            <span>{item.thanhTien.toLocaleString('vi-VN')} đ</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="border-b border-dashed border-black my-1.25" />

                  <div className="flex flex-col gap-[3px] text-[9px] text-right">
                    <div>Phương thức: <b>{selectedPhieu.phuongThucTT || phuongThucTT}</b></div>
                    <div>Thu ngân: <b>{selectedPhieu.thuNgan || thuNgan}</b></div>
                    <div className="flex justify-between text-[11px] font-bold mt-[3px]">
                      <span>TỔNG TIỀN:</span>
                      <span>{grandTotal.toLocaleString('vi-VN')} đ</span>
                    </div>
                  </div>

                  <div className="border-b border-dashed border-black my-1.25" />

                  <div className="text-center mt-2.5 text-[8.5px]">
                    <p className="m-0 mb-[3px] italic">Cảm ơn quý khách. Hẹn gặp lại!</p>
                    <p className="m-0 font-bold text-[9.5px] uppercase">PHÒNG KHÁM ĐA KHOA NHẬT TẢO</p>
                  </div>
                </div>,
                document.body
              )}

              {/* PHẦN HIỂN THỊ TRÊN MÀN HÌNH FRONTEND */}
              <div className="hide-on-print p-5 flex flex-col gap-5">
                
                {successMessage && (
                  <div className="bg-[#dcfce7] border border-[#bbf7d0] text-[#16a34a] py-3 px-4 rounded-[var(--radius-lg)] text-[13px] font-semibold flex items-center gap-2 animate-[fadeIn_0.2s_ease-in-out]">
                    <CheckCircle size={16} />
                    {successMessage}
                  </div>
                )}
                
                {/* 1. Header chi tiết phiếu thu */}
                <div className="flex justify-between items-center bg-[#f8fafc] border border-[var(--border-color)] rounded-[var(--radius-lg)] py-4 px-5">
                  <div className="flex items-center gap-3">
                    <div className="w-[46px] h-[46px] rounded-full bg-[var(--primary-light)] text-[var(--primary)] flex items-center justify-center text-[18px] font-bold">
                      {selectedPhieu.hoTen ? selectedPhieu.hoTen.split(' ').pop().charAt(0) : 'BN'}
                    </div>
                    <div>
                      <h3 className="m-0 text-[16px] font-[750] text-[var(--text-main)]">{selectedPhieu.hoTen}</h3>
                      <p className="m-0 mt-1 text-[12.5px] text-[var(--text-muted)]">
                        Mã người bệnh: <b style={{ color: 'var(--text-main)' }}>{selectedPhieu.maBN}</b> | Mã hồ sơ: <b style={{ color: 'var(--text-main)' }}>{selectedPhieu.maPhieu}</b>
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    {selectedPhieu.daThanhToan ? (
                      <div className="inline-flex items-center gap-1.5 text-[#16a34a] bg-[#dcfce7] py-1.5 px-3.5 rounded-[20px] font-bold text-[13px] border border-[#bbf7d0]">
                        <CheckCircle size={15} /> Đã thanh toán
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 text-[#dc2626] bg-[#fee2e2] py-1.5 px-3.5 rounded-[20px] font-bold text-[13px] border border-[#fecaca]">
                        <AlertCircle size={15} /> Chưa thanh toán
                      </div>
                    )}
                    {selectedPhieu.daThanhToan && selectedPhieu.ngayThanhToan && (
                      <p className="m-0 mt-1.5 text-[11px] text-[var(--text-muted)]">
                        TT lúc: {new Date(selectedPhieu.ngayThanhToan).toLocaleString('vi-VN')}
                      </p>
                    )}
                  </div>
                </div>

                {/* 2. Thông tin chẩn đoán lâm sàng */}
                <div className="grid grid-cols-[1.2fr_1fr_1fr] gap-4 border border-[var(--border-color)] rounded-[var(--radius-lg)] p-4 text-[13px]">
                   <div>
                    <span className="text-[var(--text-muted)] font-medium">Chẩn đoán bệnh lý (ICD):</span>
                    {((billingDetails && billingDetails.icdList && billingDetails.icdList.length > 0) || (selectedPhieu.icdList && selectedPhieu.icdList.length > 0)) ? (
                      <div className="flex flex-wrap gap-1 mt-1 mb-1">
                        {((billingDetails && billingDetails.icdList) || selectedPhieu.icdList).map(item => (
                          <span key={item.maICD} className="bg-[#eff6ff] border border-[#bfdbfe] text-[#1e40af] px-2 py-[2px] rounded text-[11.5px] font-semibold" title={item.tenBenh}>
                            [{item.maICD}] {item.tenBenh}
                          </span>
                        ))}
                      </div>
                    ) : selectedPhieu.maICD ? (
                      <p className="m-0 mt-1 font-semibold text-[var(--text-main)] text-[12.5px]">
                        [{selectedPhieu.maICD}] {selectedPhieu.tenBenhICD}
                      </p>
                    ) : (
                      <p className="m-0 mt-1 text-[var(--text-muted)] italic text-[12.5px]">Chưa có ICD</p>
                    )}
                    <p className="m-0 mt-1.5 font-semibold text-[var(--text-main)]">{selectedPhieu.chanDoan || 'Bác sĩ chưa ghi chẩn đoán'}</p>
                  </div>
                  <div>
                    <span className="text-[var(--text-muted)]">Bác sĩ khám bệnh:</span>
                    <p className="m-0 mt-1 font-semibold text-[var(--text-main)]">{selectedPhieu.tenBacSi || 'Không rõ'}</p>
                  </div>
                  <div>
                    <span className="text-[var(--text-muted)]">Ngày chỉ định khám:</span>
                    <p className="m-0 mt-1 font-semibold text-[var(--text-main)]">
                      {selectedPhieu.ngayKham ? new Date(selectedPhieu.ngayKham).toLocaleDateString('vi-VN') : '—'}
                    </p>
                  </div>
                </div>

                {/* 3. BẢNG CHI TIẾT CÁC KHOẢN CHI PHÍ */}
                <div className="flex flex-col gap-4">
                  
                  {/* BẢNG 1: Dịch vụ y tế & Chỉ định cận lâm sàng */}
                  <div className="border border-[var(--border-color)] rounded-[var(--radius-lg)] overflow-hidden">
                    <div className="bg-[var(--bg-main)] py-2.5 px-3.5 border-b border-[var(--border-color)] flex items-center gap-1.5">
                      <Activity size={14} style={{ color: 'var(--primary)' }} />
                      <strong className="text-[13px] text-[var(--text-main)]">I. Dịch vụ cận lâm sàng & Chỉ định (CLS)</strong>
                    </div>
                    <table className="kb-table w-full border-collapse text-[13px]">
                      <thead>
                        <tr>
                          <th className="w-[50px] text-center">STT</th>
                          <th className="text-left">Tên dịch vụ kỹ thuật y tế</th>
                          <th className="w-[80px] text-center">SL</th>
                          <th className="w-[140px] text-right">Đơn giá (đ)</th>
                          <th className="w-[160px] text-right">Thành tiền (đ)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {services.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="text-center p-4 text-[var(--text-muted)] italic">
                              Không có chỉ định cận lâm sàng nào trong lượt khám này.
                            </td>
                          </tr>
                        ) : (
                          services.map((item, idx) => (
                            <tr key={idx}>
                              <td className="text-center">{idx + 1}</td>
                              <td style={{ fontWeight: '600' }}>{item.tenDV}</td>
                              <td className="text-center">{item.soLuong}</td>
                              <td className="text-right">{item.donGia.toLocaleString('vi-VN')}</td>
                              <td className="text-right font-[750] text-[var(--text-main)]">{item.thanhTien.toLocaleString('vi-VN')}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* BẢNG 2: Đơn thuốc đã kê */}
                  <div className="border border-[var(--border-color)] rounded-[var(--radius-lg)] overflow-hidden">
                    <div className="bg-[var(--bg-main)] py-2.5 px-3.5 border-b border-[var(--border-color)] flex items-center gap-1.5">
                      <Pill size={14} style={{ color: 'var(--primary)' }} />
                      <strong className="text-[13px] text-[var(--text-main)]">II. Danh mục dược phẩm & Thuốc điều trị</strong>
                    </div>
                    <table className="kb-table w-full border-collapse text-[13px]">
                      <thead>
                        <tr>
                          <th className="w-[50px] text-center">STT</th>
                          <th className="text-left">Tên biệt dược</th>
                          <th style={{ textAlign: 'left', width: '220px' }}>Liều dùng chỉ định</th>
                          <th style={{ width: '60px', textAlign: 'center' }}>Số ngày</th>
                          <th style={{ width: '80px', textAlign: 'center' }}>SL quy đổi</th>
                          <th style={{ width: '110px', textAlign: 'right' }}>Đơn giá (đ)</th>
                          <th className="w-[160px] text-right">Thành tiền (đ)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {drugs.length === 0 ? (
                          <tr>
                            <td colSpan="7" className="text-center p-4 text-[var(--text-muted)] italic">
                              Không có đơn thuốc nào được kê trong lượt khám này.
                            </td>
                          </tr>
                        ) : (
                          drugs.map((item, idx) => (
                            <tr key={idx}>
                              <td className="text-center">{idx + 1}</td>
                              <td style={{ fontWeight: '600' }}>{item.tenThuoc}</td>
                              <td style={{ fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '12px' }}>{item.cachDung}</td>
                              <td className="text-center">{parseDaysFromCachDung(item.cachDung)} ngày</td>
                              <td className="text-center">{item.soLuongQuyDoi}</td>
                              <td className="text-right">{item.donGia.toLocaleString('vi-VN')}</td>
                              <td className="text-right font-[750] text-[var(--text-main)]">{item.thanhTien.toLocaleString('vi-VN')}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* BẢNG 3: Vật tư y tế tiêu hao */}
                  <div className="border border-[var(--border-color)] rounded-[var(--radius-lg)] overflow-hidden">
                    <div className="bg-[var(--bg-main)] py-2 px-3.5 border-b border-[var(--border-color)] flex items-center justify-between">
                      <div className="flex items-center gap-[6px]">
                        <ClipboardList size={14} style={{ color: 'var(--primary)' }} />
                        <strong className="text-[13px] text-[var(--text-main)]">III. Vật tư y tế tiêu hao & Dụng cụ khám</strong>
                      </div>
                      
                      {!selectedPhieu.daThanhToan && (
                        <button 
                          onClick={() => {
                            if (danhMucVatTu.length > 0) {
                              setVatTuMoi({ tenVT: danhMucVatTu[0].tenVT, soLuong: 1, donGia: getSupplyPrice(danhMucVatTu[0].tenVT) });
                            } else {
                              setVatTuMoi({ tenVT: 'Găng tay y tế', soLuong: 1, donGia: 3000 });
                            }
                            setShowVatTuModal(true);
                          }}
                          className="btn-outline h-6 text-[11px] px-2 flex items-center gap-[3px]"
                        >
                          <Plus size={10} /> Thêm vật tư
                        </button>
                      )}
                    </div>
                    <table className="kb-table w-full border-collapse text-[13px]">
                      <thead>
                        <tr>
                          <th className="w-[50px] text-center">STT</th>
                          <th className="text-left">Tên vật tư tiêu hao</th>
                          <th style={{ width: '100px', textAlign: 'center' }}>Số lượng</th>
                          <th className="w-[140px] text-right">Đơn giá (đ)</th>
                          <th className="w-[160px] text-right">Thành tiền (đ)</th>
                          {!selectedPhieu.daThanhToan && <th style={{ width: '50px', textAlign: 'center' }}>Xóa</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {supplies.length === 0 ? (
                          <tr>
                            <td colSpan={selectedPhieu.daThanhToan ? 5 : 6} className="text-center p-4 text-[var(--text-muted)] italic">
                              Chưa ghi nhận sử dụng vật tư y tế tiêu hao.
                            </td>
                          </tr>
                        ) : (
                          supplies.map((item, idx) => (
                            <tr key={idx}>
                              <td className="text-center">{idx + 1}</td>
                              <td style={{ fontWeight: '600' }}>{item.tenVatTu}</td>
                              <td className="text-center">{item.soLuong}</td>
                              <td className="text-right">{item.donGia.toLocaleString('vi-VN')}</td>
                              <td className="text-right font-[750] text-[var(--text-main)]">{item.thanhTien.toLocaleString('vi-VN')}</td>
                              {!selectedPhieu.daThanhToan && (
                                <td className="text-center">
                                  <button 
                                    className="kb-icon-btn kb-icon-btn--danger"
                                    onClick={() => handleDeleteSupply(item.maVatTu)}
                                    title="Xóa vật tư"
                                    style={{ margin: '0 auto' }}
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </td>
                              )}
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                </div>

                {/* 4. PANEL BẢNG TỔNG HỢP CHI PHÍ & THANH TOÁN */}
                <div className="flex gap-5 mt-2.5">
                  
                  {/* Cấu hình phương thức thanh toán */}
                  <div className="flex-1 border border-[var(--border-color)] rounded-[var(--radius-lg)] p-[18px] flex flex-col gap-[14px] bg-[#fafafa]">
                    <h4 className="text-[13px] font-bold text-[var(--primary)] m-0 border-b border-dashed border-[var(--border-color)] pb-2">CẤU HÌNH PHƯƠNG THỨC THANH TOÁN</h4>
                    
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: '12px' }}>Phương thức thanh toán</label>
                      <div className="flex gap-2.5 mt-1.5">
                        <label className={`flex-1 flex items-center gap-2 py-2 px-3 border rounded-md text-[12.5px] font-semibold ${selectedPhieu.daThanhToan ? 'cursor-default' : 'cursor-pointer'} ${phuongThucTT === 'Tiền mặt' ? 'border-[var(--primary)] bg-[var(--primary-light)]' : 'border-[var(--border-color)] bg-white'}`}>
                          <input 
                            type="radio" 
                            name="paymentMethod" 
                            checked={phuongThucTT === 'Tiền mặt'} 
                            onChange={() => !selectedPhieu.daThanhToan && setPhuongThucTT('Tiền mặt')}
                            disabled={selectedPhieu.daThanhToan}
                          />
                          Tiền mặt
                        </label>
                        <label className={`flex-1 flex items-center gap-2 py-2 px-3 border rounded-md text-[12.5px] font-semibold ${selectedPhieu.daThanhToan ? 'cursor-default' : 'cursor-pointer'} ${phuongThucTT === 'Chuyển khoản' ? 'border-[var(--primary)] bg-[var(--primary-light)]' : 'border-[var(--border-color)] bg-white'}`}>
                          <input 
                            type="radio" 
                            name="paymentMethod" 
                            checked={phuongThucTT === 'Chuyển khoản'} 
                            onChange={() => !selectedPhieu.daThanhToan && setPhuongThucTT('Chuyển khoản')}
                            disabled={selectedPhieu.daThanhToan}
                          />
                          Chuyển khoản
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Chi tiết hóa đơn & Thu tiền */}
                  <div className="flex-[1.1] border border-[var(--border-color)] rounded-[var(--radius-lg)] p-[18px] flex flex-col gap-3 bg-[#f8fafc]">
                    <h4 className="text-[13px] font-bold text-[var(--primary)] m-0 border-b border-dashed border-[var(--border-color)] pb-2">CHI TIẾT PHIẾU THU & HÓA ĐƠN</h4>
                    
                    <div className="flex justify-between text-[13px] text-[var(--text-muted)]">
                      <span>Tổng chi phí lâm sàng:</span>
                      <strong style={{ color: 'var(--text-main)' }}>{totalServices.toLocaleString('vi-VN')} đ</strong>
                    </div>
                    
                    <div className="flex justify-between text-[13px] text-[var(--text-muted)]">
                      <span>Tổng chi phí đơn thuốc:</span>
                      <strong style={{ color: 'var(--text-main)' }}>{totalDrugs.toLocaleString('vi-VN')} đ</strong>
                    </div>

                    <div className="flex justify-between text-[13px] text-[var(--text-muted)]">
                      <span>Tổng chi phí vật tư y tế:</span>
                      <strong style={{ color: 'var(--text-main)' }}>{totalSupplies.toLocaleString('vi-VN')} đ</strong>
                    </div>

                    <div className="flex justify-between text-[15px] text-[var(--text-main)] border-t border-[var(--border-color)] pt-2.5 mt-1">
                      <span><strong>TỔNG TIỀN THANH TOÁN:</strong></span>
                      <strong className="text-[#0052cc] text-[18px]">
                        {grandTotal.toLocaleString('vi-VN')} VNĐ
                      </strong>
                    </div>

                    <div style={{ marginTop: '10px' }}>
                      {!selectedPhieu.daThanhToan ? (
                        <button 
                          onClick={handleExecutePayment}
                          className="btn-primary w-full h-[42px] text-[14px] font-bold flex items-center justify-center gap-2 shadow-[var(--shadow-md)]"
                        >
                          <CreditCard size={18} />
                          THU TIỀN & ĐÓNG PHIẾU [F12]
                        </button>
                      ) : (
                        <div className="flex gap-2">
                          <button 
                            onClick={handlePrintInvoice}
                            className="btn-outline flex-1 h-10 text-[13.5px] font-semibold border border-[#0052cc] text-[#0052cc] flex items-center justify-center gap-1.5"
                          >
                            <Printer size={16} />
                            IN PHIẾU THU [F8]
                          </button>
                          <button 
                            disabled
                            className="btn-outline flex-1 h-10 text-[13.5px] bg-[#e2e8f0] text-[var(--text-muted)] border-none cursor-not-allowed flex items-center justify-center"
                          >
                            ĐÃ THANH TOÁN
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                </div>

              </div>

            </div>
          )}
        </div>

      </div>

      {/* POPUP THÊM VẬT TƯ TIÊU HAO */}
      {showVatTuModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-[200] animate-[fadeIn_0.2s]">
          <div className="bg-white rounded-[var(--radius-lg)] w-[400px] shadow-[var(--shadow-lg)] border border-[var(--border-color)] overflow-hidden">
            <div className="bg-[var(--primary)] text-white py-3 px-4 flex justify-between items-center">
              <span className="text-[14px] font-bold">KÊ VẬT TƯ TIÊU HAO PHÁT SINH</span>
              <button 
                onClick={() => setShowVatTuModal(false)}
                className="bg-none border-none text-white cursor-pointer text-[16px]"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleAddSupply} className="p-4 flex flex-col gap-3.5">
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '12.5px' }}>Tên vật tư y tế</label>
                {danhMucVatTu.length > 0 ? (
                  <select 
                    className="form-input h-9 text-[13px] px-2" 
                    value={vatTuMoi.maVatTu}
                    onChange={e => setVatTuMoi({ ...vatTuMoi, maVatTu: e.target.value })}
                  >
                    {danhMucVatTu.map(vt => (
                      <option key={vt.maVatTu} value={vt.maVatTu}>{vt.tenVatTu} ({vt.donViTinh})</option>
                    ))}
                  </select>
                ) : (
                  <input 
                    type="text" 
                    className="form-input h-9 text-[13px]" 
                    placeholder="Điền mã vật tư tiêu hao..."
                    value={vatTuMoi.maVatTu}
                    onChange={e => setVatTuMoi({ ...vatTuMoi, maVatTu: e.target.value })}
                    required
                  />
                )}
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '12.5px' }}>Số lượng chỉ định dùng</label>
                <input 
                  type="number" 
                  min="1"
                  className="form-input h-9 text-[13px]" 
                  value={vatTuMoi.soLuong}
                  onChange={e => setVatTuMoi({ ...vatTuMoi, soLuong: parseInt(e.target.value, 10) || 1 })}
                  required
                />
              </div>

              <div className="flex gap-2.5 mt-2.5">
                <button type="submit" className="btn-primary flex-1 h-9 text-[13px]">
                  Xác nhận thêm
                </button>
                <button type="button" onClick={() => setShowVatTuModal(false)} className="btn-outline flex-1 h-9 text-[13px]">
                  Hủy bỏ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default ThanhToanHoaDon;
