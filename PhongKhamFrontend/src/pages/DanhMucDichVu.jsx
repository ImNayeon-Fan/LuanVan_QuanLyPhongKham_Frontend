import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Plus, Trash2, Save, Check, X, Database, Activity
} from 'lucide-react';
import { useToast } from '../utils/ToastContext';
import { 
  apiGetDichVuCLSList,
  apiAddDichVuCLS,
  apiUpdateDichVuCLS,
  apiDeleteDichVuCLS
} from '../utils/api';

// Dữ liệu mẫu dịch vụ cận lâm sàng gốc (dự phòng)
const defaultDichVuData = [
  { maDV: 'DV001', tenDV: 'Siêu âm ổ bụng tổng quát', giaTien: 150000, trangThai: true },
  { maDV: 'DV002', tenDV: 'X-Quang ngực thẳng (Kỹ thuật số)', giaTien: 120000, trangThai: true },
  { maDV: 'DV003', tenDV: 'Xét nghiệm công thức máu toàn bộ (24 chỉ số)', giaTien: 90000, trangThai: true },
  { maDV: 'DV004', tenDV: 'Xét nghiệm đường huyết (Glucose)', giaTien: 50000, trangThai: true },
  { maDV: 'DV005', tenDV: 'Điện tâm đồ (ECG)', giaTien: 80000, trangThai: true },
  { maDV: 'DV006', tenDV: 'Siêu âm tim màu', giaTien: 300000, trangThai: true }
];

/**
 * Component Quản lý Danh mục Dịch vụ Y tế (Cận lâm sàng)
 */
function DanhMucDichVu() {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  // Các state lưu trữ danh sách dịch vụ y tế và trạng thái thao tác
  const [allDvList, setAllDvList] = useState([]);
  const [selectedDV, setSelectedDV] = useState(null);
  const [dvForm, setDvForm] = useState({ maDV: '', tenDV: '', giaTien: '', trangThai: true });
  const [dvFilters, setDvFilters] = useState({ maDV: '', tenDV: '' });
  const [dvPage, setDvPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Tải danh sách dịch vụ y tế từ Backend API (Tải 1 lần trên client)
  const loadDVList = async () => {
    try {
      setIsLoading(true);
      const response = await apiGetDichVuCLSList('', '', null, 1, 1000);
      if (response && response.data) {
        const mappedData = response.data.map(item => ({
          maDV: item.MaDV || item.maDV || '',
          tenDV: item.TenDV || item.tenDV || '',
          giaTien: item.giaTien !== undefined && item.giaTien !== null ? item.giaTien : (item.GiaTien !== undefined && item.GiaTien !== null ? item.GiaTien : 0),
          trangThai: item.trangThai !== undefined ? item.trangThai : (item.TrangThai !== undefined ? item.TrangThai : true)
        }));
        setAllDvList(mappedData);
      } else {
        setAllDvList([]);
      }
    } catch (error) {
      console.error('Lỗi tải danh mục dịch vụ CLS:', error);
      showError('Không thể tải danh mục dịch vụ từ hệ thống: ' + (error.message || error));
      if (error.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        navigate('/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Tải danh sách khi component mount
  useEffect(() => {
    loadDVList();
  }, []);

  // Reset trang về 1 khi đổi bộ lọc tìm kiếm hoặc kích thước trang
  useEffect(() => {
    setDvPage(1);
  }, [dvFilters.maDV, dvFilters.tenDV, itemsPerPage]);

  // Đồng bộ thông tin form khi người dùng chọn một hàng trong danh sách
  useEffect(() => {
    if (selectedDV) {
      setDvForm({
        maDV: selectedDV.maDV || '',
        tenDV: selectedDV.tenDV || '',
        giaTien: selectedDV.giaTien !== undefined ? selectedDV.giaTien : '',
        trangThai: selectedDV.trangThai !== undefined ? selectedDV.trangThai : true
      });
    } else {
      setDvForm({ maDV: '', tenDV: '', giaTien: '', trangThai: true });
    }
  }, [selectedDV]);

  // Lọc danh sách dịch vụ y tế trên client theo cả mã hoặc tên
  const filteredDvList = allDvList.filter(item => 
    (item.maDV || '').toLowerCase().includes((dvFilters.maDV || '').toLowerCase().trim()) &&
    (item.tenDV || '').toLowerCase().includes((dvFilters.tenDV || '').toLowerCase().trim())
  );

  const totalCount = filteredDvList.length;
  const totalDvPages = Math.max(1, Math.ceil(totalCount / itemsPerPage));
  const activeDvPage = Math.min(dvPage, totalDvPages);
  const dvStartIdx = (activeDvPage - 1) * itemsPerPage;
  const displayedDV = filteredDvList.slice(dvStartIdx, dvStartIdx + itemsPerPage);

  const getPaginationItems = () => {
    const pages = [];
    if (totalDvPages <= 7) {
      for (let i = 1; i <= totalDvPages; i++) {
        pages.push(i);
      }
    } else {
      if (activeDvPage <= 4) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalDvPages);
      } else if (activeDvPage >= totalDvPages - 3) {
        pages.push(1);
        pages.push('...');
        for (let i = totalDvPages - 4; i <= totalDvPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(activeDvPage - 1);
        pages.push(activeDvPage);
        pages.push(activeDvPage + 1);
        pages.push('...');
        pages.push(totalDvPages);
      }
    }
    return pages;
  };

  // Thay đổi bộ lọc tìm kiếm và reset trang về 1
  const handleDvFilterChange = (key, val) => {
    setDvFilters({ ...dvFilters, [key]: val });
    setDvPage(1);
  };

  // Khởi tạo một dịch vụ mới với mã tăng tự động
  const handleAddNewDv = () => {
    const nextNum = allDvList.length + 1;
    const newCode = `DV${String(nextNum).padStart(3, '0')}`;
    setSelectedDV({ maDV: newCode, tenDV: '', giaTien: 100000, trangThai: true, isNew: true });
  };

  // Xử lý lưu thông tin (Thêm mới hoặc Cập nhật)
  const handleSaveDv = async (e) => {
    e.preventDefault();
    if (!dvForm.maDV.trim()) {
      showError('Vui lòng nhập Mã dịch vụ!');
      return;
    }
    if (!dvForm.tenDV.trim()) {
      showError('Vui lòng nhập Tên dịch vụ y tế!');
      return;
    }
    if (dvForm.giaTien === '' || isNaN(dvForm.giaTien) || parseFloat(dvForm.giaTien) < 0) {
      showError('Giá tiền dịch vụ phải là một số dương hợp lệ!');
      return;
    }

    const updatedRecord = {
      maDV: dvForm.maDV.trim().toUpperCase(),
      tenDV: dvForm.tenDV.trim(),
      giaTien: parseFloat(dvForm.giaTien),
      trangThai: dvForm.trangThai
    };

    try {
      if (selectedDV?.isNew) {
        await apiAddDichVuCLS(updatedRecord);
        showSuccess('Thêm mới dịch vụ cận lâm sàng & xét nghiệm thành công!');
      } else {
        await apiUpdateDichVuCLS(selectedDV.maDV, {
          tenDV: updatedRecord.tenDV,
          giaTien: updatedRecord.giaTien,
          trangThai: updatedRecord.trangThai
        });
        showSuccess('Cập nhật dịch vụ y tế CLS thành công!');
      }
      setSelectedDV(updatedRecord);
      loadDVList();
    } catch (error) {
      console.error('Lỗi khi lưu dịch vụ CLS:', error);
      showError('Không thể lưu thông tin dịch vụ: ' + (error.message || 'Lỗi hệ thống'));
    }
  };

  // Xóa dịch vụ y tế khỏi danh mục
  const handleDeleteDv = async (maDV) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa dịch vụ ${maDV} khỏi danh mục?`)) {
      try {
        await apiDeleteDichVuCLS(maDV);
        showSuccess('Xóa dịch vụ y tế CLS thành công!');
        if (selectedDV && selectedDV.maDV === maDV) {
          setSelectedDV(null);
        }
        loadDVList();
      } catch (error) {
        console.error('Lỗi khi xóa dịch vụ CLS:', error);
        showError('Không thể xóa dịch vụ: ' + (error.message || 'Lỗi hệ thống'));
      }
    }
  };


  return (
    <div className="kb-wrapper h-screen overflow-hidden">
      {/* Topbar điều hướng */}
      <div className="kb-topbar h-[50px] px-5 flex items-center">
        <div className="flex-1 flex justify-start">
          <button className="kb-back-btn py-[5px] px-[10px]" onClick={() => navigate('/staff')}>
            <ArrowLeft size={16} /> Quay về trang chủ
          </button>
        </div>
        <div className="kb-topbar-title flex-1 flex justify-center text-[15px]">
          <Activity size={18} className="mr-1.5" />
          <strong>Danh mục dịch vụ y tế (CLS)</strong>
        </div>
        <div className="flex-1 flex justify-end text-[12px] opacity-85">
          <span>Trang chủ / Quản lý danh mục / Dịch vụ y tế (CLS)</span>
        </div>
      </div>

      {/* Vùng làm việc chính */}
      <div className="kb-body flex h-[calc(100vh-50px)] bg-[var(--bg-main)] overflow-hidden">
        
        {/* CỘT TRÁI: Bảng danh sách dịch vụ */}
        <div className="flex-[1.3] flex flex-col border-r border-[var(--border-color)] h-full bg-white">
          <div className="flex justify-between items-center py-3 px-[18px] bg-[var(--bg-main)] border-b border-[var(--border-color)]">
            <div className="flex items-center gap-[6px] shrink-0">
              <Activity size={16} className="text-[var(--primary)] shrink-0" />
              <h3 className="text-[14.5px] font-[750] text-[var(--text-main)] whitespace-nowrap">
                DANH SÁCH KỸ THUẬT & DỊCH VỤ CẬN LÂM SÀNG
              </h3>
            </div>
            <button 
              onClick={handleAddNewDv}
              className="btn-primary h-8 text-[12.5px] px-3 flex items-center gap-1 !w-auto !mt-0 shrink-0"
            >
              <Plus size={14} /> Thêm danh mục
            </button>
          </div>

          {/* Container chứa bảng cuộn */}
          <div className="flex-1 overflow-y-auto">
            <table className="kb-table w-full border-collapse text-[13px]">
              <thead>
                <tr className="sticky top-0 z-10 bg-[var(--bg-main)] border-b-2 border-[var(--border-color)]">
                  <th className="w-[50px] text-center p-2">STT</th>
                  <th className="w-[150px] p-2">Mã dịch vụ</th>
                  <th className="p-2">Tên dịch vụ kỹ thuật y tế</th>
                  <th className="w-[150px] p-2 text-right">Giá niêm yết (đ)</th>
                  <th className="w-[120px] p-2 text-center">Trạng thái</th>
                  <th className="w-[60px] p-2 text-center">Xóa</th>
                </tr>
                <tr className="bg-[var(--bg-main)] border-b border-[var(--border-color)]">
                  <td></td>
                  <td className="p-1">
                    <input 
                      type="text" 
                      placeholder="Lọc mã..." 
                      className="form-input h-[26px] text-[12px] py-0.5 px-1.5" 
                      value={dvFilters.maDV}
                      onChange={e => handleDvFilterChange('maDV', e.target.value)}
                    />
                  </td>
                  <td className="p-1">
                    <input 
                      type="text" 
                      placeholder="Lọc tên dịch vụ..." 
                      className="form-input h-[26px] text-[12px] py-0.5 px-1.5" 
                      value={dvFilters.tenDV}
                      onChange={e => handleDvFilterChange('tenDV', e.target.value)}
                    />
                  </td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="6" className="text-center p-[30px] text-[var(--text-muted)]">
                      Đang tải danh mục dịch vụ cận lâm sàng...
                    </td>
                  </tr>
                ) : displayedDV.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center p-[30px] text-[var(--text-muted)]">
                      Không tìm thấy dịch vụ nào khớp với bộ lọc.
                    </td>
                  </tr>
                ) : (
                  displayedDV.map((item, idx) => {
                    const isSelected = selectedDV && selectedDV.maDV === item.maDV;
                    return (
                      <tr 
                        key={item.maDV}
                        className={`kb-table-row cursor-pointer transition-colors duration-150 ${
                          isSelected ? 'bg-[var(--primary-light)]' : 'bg-transparent'
                        }`}
                        onClick={() => setSelectedDV(item)}
                      >
                        <td className="text-center py-2.5 px-2 font-medium text-[var(--text-muted)]">
                          {dvStartIdx + idx + 1}
                        </td>
                        <td className="font-bold text-[var(--primary-hover)] py-2.5 px-2">
                          {item.maDV}
                        </td>
                        <td className="font-medium py-2.5 px-2">{item.tenDV}</td>
                        <td className="text-right font-bold py-2.5 px-2 text-[#0052cc]">
                          {item.giaTien.toLocaleString('vi-VN')}
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          {item.trangThai ? (
                            <span className="text-[#10b981] font-semibold text-[11.5px] inline-flex items-center gap-[3px] bg-[#d1fae5] py-0.5 px-2 rounded-[10px]">
                              <Check size={12} /> Áp dụng
                            </span>
                          ) : (
                            <span className="text-[var(--text-muted)] italic text-[11.5px] inline-flex items-center gap-[3px] bg-[#e5e7eb] py-0.5 px-2 rounded-[10px]">
                              <X size={12} /> Tạm ngừng
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          <button 
                            className="kb-icon-btn kb-icon-btn--danger mx-auto"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteDv(item.maDV);
                            }}
                            title="Xóa dịch vụ CLS"
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

          {/* Bộ điều khiển phân trang */}
          <div className="h-[45px] bg-white border-t border-[var(--border-color)] flex items-center justify-between px-5 text-[13px] shrink-0">
            <div className="flex items-center gap-4">
              <span className="text-[var(--text-muted)]">
                Hiển thị từ <b>{totalCount === 0 ? 0 : dvStartIdx + 1}</b> đến <b>{Math.min(dvStartIdx + itemsPerPage, totalCount)}</b> trong tổng số <b>{totalCount}</b> dịch vụ
              </span>
              <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] whitespace-nowrap">
                <span>| Hiển thị:</span>
                <select
                  value={itemsPerPage}
                  onChange={e => {
                    setItemsPerPage(Number(e.target.value));
                    setDvPage(1);
                  }}
                  className="form-input h-[26px] !py-0 !px-1.5 text-xs w-[85px] font-semibold border-[var(--border-color)] rounded bg-white cursor-pointer"
                >
                  <option value={10}>10 hàng</option>
                  <option value={50}>50 hàng</option>
                  <option value={100}>100 hàng</option>
                </select>
              </div>
            </div>
            <div className="flex gap-1 items-center">
              <button 
                disabled={activeDvPage === 1}
                onClick={() => setDvPage(activeDvPage - 1)}
                className={`h-6 w-6 rounded border border-[#0ea5e9] flex items-center justify-center text-[11px] font-bold transition-all ${
                  activeDvPage === 1 
                    ? 'opacity-40 cursor-not-allowed text-[#0ea5e9] bg-transparent' 
                    : 'text-[#0ea5e9] bg-transparent hover:bg-[#e0f2fe] cursor-pointer'
                }`}
              >
                &lt;
              </button>
              {getPaginationItems().map((p, index) => {
                if (p === '...') {
                  return (
                    <span key={`dots-${index}`} className="px-1 text-[var(--text-muted)] select-none">
                      ...
                    </span>
                  );
                }
                return (
                  <button
                    key={p}
                    onClick={() => setDvPage(p)}
                    className={`h-6 w-6 rounded border flex items-center justify-center text-[11px] font-bold transition-all cursor-pointer ${
                      p === activeDvPage
                        ? "bg-[#0ea5e9] text-white border-[#0ea5e9]"
                        : "bg-transparent text-[#0ea5e9] border-[#0ea5e9] hover:bg-[#e0f2fe]"
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
              <button 
                disabled={activeDvPage === totalDvPages}
                onClick={() => setDvPage(activeDvPage + 1)}
                className={`h-6 w-6 rounded border border-[#0ea5e9] flex items-center justify-center text-[11px] font-bold transition-all ${
                  activeDvPage === totalDvPages 
                    ? 'opacity-40 cursor-not-allowed text-[#0ea5e9] bg-transparent' 
                    : 'text-[#0ea5e9] bg-transparent hover:bg-[#e0f2fe] cursor-pointer'
                }`}
              >
                &gt;
              </button>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: Form biểu mẫu nhập liệu chi tiết */}
        <div className="flex-[0.7] flex flex-col h-full bg-white">
          <div className="flex bg-[#0052cc] py-3 px-[18px] h-[42px] items-center text-white text-[13px] font-bold gap-2">
            <Database size={16} />
            <span>CHI TIẾT DỊCH VỤ Y TẾ (CLS)</span>
          </div>

          <div className="flex-1 overflow-y-auto p-5 bg-white">
            {selectedDV === null ? (
              <div className="h-full flex flex-col items-center justify-center text-[var(--text-muted)] text-center gap-2">
                <Activity size={32} className="opacity-40 mb-2 text-[var(--primary)]" />
                <p className="text-[13px]">Chọn một dịch vụ cận lâm sàng hoặc click nút <b>"Thêm danh mục"</b> để tạo mới.</p>
              </div>
            ) : (
              <form onSubmit={handleSaveDv} className="h-full flex flex-col justify-between">
                <div className="flex flex-col gap-4">
                  <div className="border-b border-dashed border-[var(--border-color)] pb-4">
                    <h4 className="text-[13px] font-bold text-[var(--primary)] mb-3">
                      DỊCH VỤ CẬN LÂM SÀNG & XÉT NGHIỆM
                    </h4>
                    <div className="flex flex-col gap-3">
                      <div className="form-group">
                        <label className="form-label text-[12.5px]">Mã dịch vụ y tế <span className="text-red-500">*</span></label>
                        <input 
                          type="text" 
                          className="form-input h-[34px] text-[13px] pl-3 uppercase" 
                          placeholder="Ví dụ: DV001, XQ001..."
                          value={dvForm.maDV}
                          onChange={e => setDvForm({ ...dvForm, maDV: e.target.value })}
                          required
                          disabled={!selectedDV.isNew}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label text-[12.5px]">Tên dịch vụ kỹ thuật <span className="text-red-500">*</span></label>
                        <input 
                          type="text" 
                          className="form-input h-[34px] text-[13px] pl-3" 
                          placeholder="Ví dụ: Siêu âm tim màu..."
                          value={dvForm.tenDV}
                          onChange={e => setDvForm({ ...dvForm, tenDV: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label text-[12.5px]">Đơn giá niêm yết (VNĐ) <span className="text-red-500">*</span></label>
                        <input 
                          type="number" 
                          className="form-input h-[34px] text-[13px] pl-3" 
                          placeholder="Nhập giá tiền dịch vụ..."
                          value={dvForm.giaTien}
                          onChange={e => setDvForm({ ...dvForm, giaTien: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group flex items-center gap-2 mt-2.5">
                        <input 
                          type="checkbox" 
                          id="trangThaiDV"
                          checked={dvForm.trangThai}
                          onChange={e => setDvForm({ ...dvForm, trangThai: e.target.checked })}
                          className="w-4 h-4 cursor-pointer"
                        />
                        <label htmlFor="trangThaiDV" className="text-[13px] font-semibold text-[var(--text-main)] cursor-pointer">
                          Đang áp dụng cung cấp tại phòng khám
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Các nút Lưu/Hủy */}
                <div className="flex gap-3 border-t border-[var(--border-color)] pt-4 mt-5">
                  <button type="submit" className="btn-primary flex-1 h-9 text-[13px] flex items-center justify-center gap-1.5 p-0 m-0">
                    <Save size={16} /> Lưu thông tin [F4]
                  </button>
                  <button type="button" onClick={() => setSelectedDV(null)} className="btn-outline flex-1 h-9 text-[13px] flex items-center justify-center p-0 m-0">
                    Hủy bỏ
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default DanhMucDichVu;
