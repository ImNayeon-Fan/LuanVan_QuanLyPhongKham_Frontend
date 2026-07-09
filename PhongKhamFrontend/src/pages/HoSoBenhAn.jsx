import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Search, User, Clock, ChevronRight, AlertCircle, RefreshCw, ClipboardList, FileText
} from 'lucide-react';
import { apiTraCuuHoSoBenhAn, apiGetBenhNhanGanDay, apiGetLichSuKhamBenh } from '../utils/api';

// Cấu hình nhãn trạng thái của phiếu khám
const trangThaiLabel = {
  0: { label: 'Chờ khám',   color: '#f59e0b', bg: '#fef3c7' },
  1: { label: 'Đang khám',  color: '#0ea5e9', bg: '#e0f2fe' },
  2: { label: 'Chờ CLS',    color: '#8b5cf6', bg: '#ede9fe' },
  3: { label: 'Hoàn thành', color: '#22c55e', bg: '#dcfce7' },
};

/**
 * Component Tra cứu và Hiển thị Hồ sơ Bệnh án / Lịch sử khám của Bệnh nhân
 */
function HoSoBenhAn() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Trạng thái tìm kiếm và tải dữ liệu
  const [recentPatients, setRecentPatients] = useState([]); // 5 bệnh nhân khám gần đây từ API
  const [selectedPatient, setSelectedPatient] = useState(null); // Thông tin hành chính bệnh nhân đang chọn
  const [patientHistory, setPatientHistory] = useState([]); // Danh sách các lượt khám của bệnh nhân đó
  const [searchError, setSearchError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Load danh sách bệnh nhân khám gần đây từ API khi component mount
  useEffect(() => {
    loadData();
  }, []);

  // Tải danh sách bệnh nhân gần đây từ API
  const loadData = async () => {
    setLoadingList(true);
    try {
      const res = await apiGetBenhNhanGanDay();
      if (res && res.data) {
        setRecentPatients(res.data);
      } else {
        setRecentPatients([]);
      }
    } catch (err) {
      console.error('Lỗi tải danh sách bệnh nhân gần đây:', err);
      setRecentPatients([]);
    } finally {
      setLoadingList(false);
    }
  };

  // Tìm kiếm bệnh nhân theo mã, số điện thoại, tên, hoặc mã phiếu từ API
  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setSearchError('');
    setHasSearched(true);

    const query = searchQuery.trim();
    if (!query) {
      setSearchError('Vui lòng nhập mã bệnh nhân hoặc mã hồ sơ khám bệnh để tìm kiếm!');
      setSelectedPatient(null);
      setPatientHistory([]);
      return;
    }

    setLoadingHistory(true);
    try {
      const resSearch = await apiTraCuuHoSoBenhAn(query);
      if (resSearch && resSearch.found && resSearch.data) {
        const patient = resSearch.data;
        // Chuẩn hóa ngày sinh
        if (patient.ngaySinh && patient.ngaySinh.includes('-')) {
          const parts = patient.ngaySinh.split('-');
          patient.ngaySinh = parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : patient.ngaySinh;
        }
        setSelectedPatient(patient);
        
        // Tải lịch sử khám bệnh của bệnh nhân
        const resHistory = await apiGetLichSuKhamBenh(patient.maBN);
        if (resHistory && resHistory.data) {
          setPatientHistory(resHistory.data);
        } else {
          setPatientHistory([]);
        }
      } else {
        setSearchError(resSearch.message || 'Không tìm thấy thông tin bệnh nhân nào trùng khớp!');
        setSelectedPatient(null);
        setPatientHistory([]);
      }
    } catch (err) {
      console.error('Lỗi tra cứu hồ sơ bệnh án:', err);
      setSearchError(err.message || 'Lỗi kết nối máy chủ, vui lòng thử lại.');
      setSelectedPatient(null);
      setPatientHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Chọn nhanh bệnh nhân từ danh sách vừa tiếp nhận gần đây
  const handleSelectRecent = async (pat) => {
    setSearchQuery(pat.maBN || pat.hoTen);
    
    // Chuẩn hóa ngày sinh nếu cần
    const patientData = { ...pat };
    if (patientData.ngaySinh && patientData.ngaySinh.includes('-')) {
      const parts = patientData.ngaySinh.split('-');
      patientData.ngaySinh = parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : patientData.ngaySinh;
    }
    
    setSelectedPatient(patientData);
    setHasSearched(true);
    setSearchError('');
    setLoadingHistory(true);
    try {
      const resHistory = await apiGetLichSuKhamBenh(pat.maBN);
      if (resHistory && resHistory.data) {
        setPatientHistory(resHistory.data);
      } else {
        setPatientHistory([]);
      }
    } catch (err) {
      console.error('Lỗi tải lịch sử khám bệnh:', err);
      setPatientHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Định dạng hiển thị ngày giờ thân thiện
  const formatTime = (isoString) => {
    if (!isoString) return '—';
    const date = new Date(isoString);
    return date.toLocaleString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit', 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  return (
    <div className="kb-wrapper h-screen overflow-hidden">
      {/* Topbar điều hướng */}
      <div className="kb-topbar h-[50px] px-5 flex items-center justify-between">
        <div className="flex-1 flex justify-start items-center">
          <button className="kb-back-btn py-[5px] px-[10px] flex items-center gap-1" onClick={() => navigate('/')}>
            <ArrowLeft size={16} /> Quay lại trang chủ
          </button>
        </div>
        <div className="kb-topbar-title flex-1 flex justify-center items-center text-[15px] font-semibold">
          <ClipboardList size={18} className="mr-1.5" />
          <strong>Hồ sơ bệnh án & Lịch sử khám</strong>
        </div>
        <div className="flex-1 flex justify-end items-center">
          <button 
            className="kb-back-btn py-1.5 px-2.5 flex items-center gap-1" 
            onClick={loadData}
          >
            <RefreshCw size={14} /> Làm mới
          </button>
        </div>
      </div>

      {/* Vùng thân chính */}
      <div className="kb-body p-5 md:px-6 bg-[var(--bg-main)] h-[calc(100vh-50px)] overflow-y-auto flex flex-col gap-5">

        {/* Ô Tìm kiếm Bệnh nhân */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[var(--radius-lg)] p-6 shadow-[var(--shadow-sm)] max-w-[800px] w-full mx-auto flex flex-col gap-4">
          <div className="text-center mb-2">
            <h2 className="text-[18px] font-bold text-[var(--text-main)] mb-1.5">Tra cứu lịch sử khám bệnh</h2>
            <p className="text-[var(--text-muted)] text-[13px]">Nhập mã bệnh nhân, mã hồ sơ khám bệnh để tra cứu toàn bộ lịch sử bệnh án</p>
          </div>

          <form onSubmit={handleSearch} className="flex gap-2.5">
            <div className="flex items-center gap-2 flex-1 relative">
              <Search size={18} className="absolute left-3.5 text-[var(--text-muted)]" />
              <input
                type="text"
                className="form-input pl-10 h-[42px] text-[14px]"
                placeholder="Nhập mã bệnh nhân (VD: BN260001) hoặc mã hồ sơ (VD: PK_...)"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-primary w-[120px] h-[42px] flex items-center justify-center gap-1.5">
              <Search size={16} /> Tìm kiếm
            </button>
          </form>

          {searchError && (
            <div className="flex items-center gap-2 text-[var(--error)] text-[13.5px] bg-red-100 p-2.5 px-3.5 rounded-[var(--radius-md)] font-medium">
              <AlertCircle size={16} />
              <span>{searchError}</span>
            </div>
          )}

          {/* Gợi ý bệnh nhân tiếp nhận gần đây */}
          {recentPatients.length > 0 && (
            <div className="border-t border-[var(--border-color)] pt-3.5">
              <span className="text-[12.5px] font-semibold text-[var(--text-muted)] block mb-2">
                Bệnh nhân vừa tiếp đón/khám gần đây:
              </span>
              <div className="flex flex-wrap gap-2">
                {recentPatients.map(pat => (
                  <button
                    key={pat.maBN || pat.hoTen}
                    type="button"
                    onClick={() => handleSelectRecent(pat)}
                    className="py-1.5 px-3 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-[16px] text-[12.5px] font-medium text-[var(--text-main)] cursor-pointer transition-all duration-200 flex items-center gap-1.5 hover:border-[var(--primary)] hover:bg-[var(--primary-light)] hover:text-[var(--primary-hover)]"
                  >
                    <User size={13} className="text-[var(--primary)]" />
                    <span>{pat.hoTen}</span>
                    <span className="text-[11px] text-[var(--text-muted)]">({pat.maBN || 'Chưa tạo'})</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Kết quả truy vấn thông tin & lịch sử các lần khám */}
        {hasSearched && selectedPatient && (
          <div className="max-w-[800px] w-full mx-auto flex flex-col gap-5">
            {/* 1. Thẻ thông tin hành chính bệnh nhân */}
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[var(--radius-lg)] p-5 shadow-[var(--shadow-sm)] relative">
              <div className="flex items-center gap-2 text-[15px] font-semibold text-[var(--primary)] border-b border-[var(--border-color)] pb-2 mb-3.5">
                <User size={16} />
                <span>Thông tin hành chính bệnh nhân</span>
              </div>

              <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3.5 text-[13.5px]">
                <div>
                  <span className="text-[var(--text-muted)] block text-[12px]">Họ và tên:</span>
                  <strong className="text-[15px] uppercase text-[var(--text-main)]">{selectedPatient.hoTen}</strong>
                </div>
                <div>
                  <span className="text-[var(--text-muted)] block text-[12px]">Mã bệnh nhân:</span>
                  <strong className="text-[var(--primary)]">{selectedPatient.maBN || 'Chưa tạo'}</strong>
                </div>
                <div>
                  <span className="text-[var(--text-muted)] block text-[12px]">Ngày sinh:</span>
                  <strong className="text-[var(--text-main)]">{selectedPatient.ngaySinh}</strong>
                </div>
                <div>
                  <span className="text-[var(--text-muted)] block text-[12px]">Giới tính:</span>
                  <strong className="text-[var(--text-main)]">{selectedPatient.gioiTinh}</strong>
                </div>
                <div>
                  <span className="text-[var(--text-muted)] block text-[12px]">Số điện thoại:</span>
                  <strong className="text-[var(--text-main)]">{selectedPatient.sdt}</strong>
                </div>
                <div>
                  <span className="text-[var(--text-muted)] block text-[12px]">Địa chỉ:</span>
                  <strong className="text-[var(--text-main)]">{selectedPatient.diaChi || '—'}</strong>
                </div>
                {selectedPatient.tienSuBenh && (
                  <div className="col-span-full">
                    <span className="text-[var(--text-muted)] block text-[12px]">Tiền sử bệnh lý:</span>
                    <span className="text-[#b45309] font-semibold bg-[#fef3c7] py-1 px-2 rounded inline-block mt-0.5 border border-[#fde68a]">
                      {selectedPatient.tienSuBenh}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* 2. Danh sách lượt khám lịch sử */}
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[var(--radius-lg)] p-5 shadow-[var(--shadow-sm)]">
              <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-2.5 mb-4">
                <div className="flex items-center gap-2 text-[15px] font-semibold text-[var(--primary)]">
                  <FileText size={16} />
                  <span>Lịch sử khám bệnh</span>
                </div>
                <span className="text-[12.5px] text-[var(--text-muted)] font-semibold bg-[var(--bg-main)] py-1 px-2.5 rounded-[12px]">
                  Có {patientHistory.length} hồ sơ khám
                </span>
              </div>

              {patientHistory.length === 0 ? (
                <div className="text-center p-8 text-[var(--text-muted)]">
                  Chưa có lịch sử khám bệnh.
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {patientHistory.map((rec) => {
                    const st = trangThaiLabel[rec.trangThai] || trangThaiLabel[0];
                    return (
                      <div
                        key={rec.maPhieu}
                        onClick={() => navigate(`/ho-so-chi-tiet/${rec.maPhieu}`)}
                        className="border border-[var(--border-color)] rounded-[var(--radius-md)] py-3.5 px-4 cursor-pointer flex items-center justify-between gap-4 transition-all duration-200 bg-[var(--bg-card)] hover:border-[var(--primary)] hover:-translate-y-px hover:shadow-[var(--shadow-md)]"
                      >
                        <div className="flex flex-col gap-1 flex-1">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="text-[14px] font-bold text-[var(--primary)]">{rec.maPhieu}</span>
                            <span className="flex items-center gap-1 text-[12px] text-[var(--text-muted)]">
                              <Clock size={12} />
                              {formatTime(rec.ngayKham)}
                            </span>
                            <span 
                              className="text-[11px] px-1.5 py-[1.5px] rounded-[8px] font-semibold"
                              style={{ 
                                color: st.color, 
                                backgroundColor: st.bg, 
                              }}
                            >
                              {st.label}
                            </span>
                          </div>
                          <div className="text-[13px] mt-0.5">
                            <span className="text-[var(--text-muted)]">Bác sĩ khám: </span>
                            <strong className="text-[var(--text-main)]">{rec.tenBacSi || 'Chưa phân công'}</strong>
                          </div>
                          <div className="text-[13px] flex flex-wrap gap-1.5 mt-1 items-center">
                            <span className="text-[var(--text-muted)]">Mã bệnh (ICD): </span>
                            {rec.icdList && rec.icdList.length > 0 ? (
                              rec.icdList.map(item => (
                                <span key={item.maICD} className="bg-[#eff6ff] border border-[#bfdbfe] text-[#1e40af] px-1.5 py-[1px] rounded text-[11.5px] font-medium" title={item.tenBenh}>
                                  {item.maICD}
                                </span>
                              ))
                            ) : rec.maICD ? (
                              <span className="bg-[#eff6ff] border border-[#bfdbfe] text-[#1e40af] px-1.5 py-[1px] rounded text-[11.5px] font-medium" title={rec.tenBenhICD}>
                                {rec.maICD}
                              </span>
                            ) : (
                              <span className="text-[var(--text-muted)] italic text-[12px]">Không có</span>
                            )}
                          </div>
                          <div className="text-[13px] mt-1 text-left">
                            <span className="text-[var(--text-muted)]">Chẩn đoán lâm sàng: </span>
                            <strong className="text-[var(--text-main)]">{rec.chanDoan || 'Chưa cập nhật'}</strong>
                          </div>
                        </div>
                        <div className="text-[var(--text-muted)] flex items-center">
                          <ChevronRight size={18} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Trạng thái chưa nhập thông tin */}
        {!hasSearched && (
          <div className="text-center p-16 text-[var(--text-muted)] max-w-[500px] w-full mx-auto mt-10">
            <FileText size={48} className="mx-auto mb-4 block opacity-30" />
            <h3 className="text-[16px] font-semibold text-[var(--text-main)] mb-2">Chưa có thông tin tra cứu</h3>
            <p className="text-[13.5px] leading-relaxed">Nhập mã bệnh nhân hoặc mã hồ sơ ở thanh tìm kiếm phía trên để hiển thị lịch sử bệnh án và các lượt khám tương ứng.</p>
          </div>
        )}

      </div>
    </div>
  );
}

export default HoSoBenhAn;
