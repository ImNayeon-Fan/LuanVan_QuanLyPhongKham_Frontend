import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Plus, Trash2, Save, Database, ListCollapse
} from 'lucide-react';
import { useToast } from '../utils/ToastContext';
import { 
  apiGetICDList,
  apiAddICD,
  apiUpdateICD,
  apiDeleteICD
} from '../utils/api';

/**
 * Component Quản lý Danh mục Bệnh lý (ICD-10)
 */
function DanhMucICD() {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  // Các state quản lý danh sách ICD, form biểu mẫu và bộ lọc tìm kiếm
  const [allIcdList, setAllIcdList] = useState([]);
  const [selectedICD, setSelectedICD] = useState(null);
  const [icdForm, setIcdForm] = useState({ maICD: '', tenBenh: '' });
  const [icdFilters, setIcdFilters] = useState({ maICD: '', tenBenh: '' });
  const [icdPage, setIcdPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Tải danh sách bệnh lý từ Backend API (Tải 1 lần về client)
  const loadICDList = async () => {
    try {
      setIsLoading(true);
      const response = await apiGetICDList('', '', 1, 1000);
      if (response && response.data) {
        const mappedData = response.data.map(item => ({
          maICD: item.MaICD || item.maICD || '',
          tenBenh: item.TenBenh || item.tenBenh || ''
        }));
        setAllIcdList(mappedData);
      } else {
        setAllIcdList([]);
      }
    } catch (error) {
      console.error('Lỗi tải danh mục ICD:', error);
      showError('Không thể tải danh mục ICD từ hệ thống: ' + (error.message || error));
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
    loadICDList();
  }, []);

  // Reset trang về 1 khi đổi bộ lọc tìm kiếm hoặc kích thước trang
  useEffect(() => {
    setIcdPage(1);
  }, [icdFilters.maICD, icdFilters.tenBenh, itemsPerPage]);

  // Cập nhật form khi chọn bệnh lý thay đổi
  useEffect(() => {
    if (selectedICD) {
      setIcdForm({
        maICD: selectedICD.maICD || '',
        tenBenh: selectedICD.tenBenh || ''
      });
    } else {
      setIcdForm({ maICD: '', tenBenh: '' });
    }
  }, [selectedICD]);

  // Lọc danh sách ICD trên client theo cả mã hoặc tên
  const filteredIcdList = allIcdList.filter(item => 
    (item.maICD || '').toLowerCase().includes((icdFilters.maICD || '').toLowerCase().trim()) &&
    (item.tenBenh || '').toLowerCase().includes((icdFilters.tenBenh || '').toLowerCase().trim())
  );

  const totalCount = filteredIcdList.length;
  const totalIcdPages = Math.max(1, Math.ceil(totalCount / itemsPerPage));
  const activeIcdPage = Math.min(icdPage, totalIcdPages);
  const icdStartIdx = (activeIcdPage - 1) * itemsPerPage;
  const displayedICD = filteredIcdList.slice(icdStartIdx, icdStartIdx + itemsPerPage);

  const getPaginationItems = () => {
    const pages = [];
    if (totalIcdPages <= 7) {
      for (let i = 1; i <= totalIcdPages; i++) {
        pages.push(i);
      }
    } else {
      if (activeIcdPage <= 4) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalIcdPages);
      } else if (activeIcdPage >= totalIcdPages - 3) {
        pages.push(1);
        pages.push('...');
        for (let i = totalIcdPages - 4; i <= totalIcdPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(activeIcdPage - 1);
        pages.push(activeIcdPage);
        pages.push(activeIcdPage + 1);
        pages.push('...');
        pages.push(totalIcdPages);
      }
    }
    return pages;
  };

  // Xử lý khi bộ lọc thay đổi
  const handleIcdFilterChange = (key, val) => {
    setIcdFilters({ ...icdFilters, [key]: val });
    setIcdPage(1);
  };

  // Khởi tạo thêm mới mã bệnh lý
  const handleAddNewIcd = () => {
    setSelectedICD({ maICD: '', tenBenh: '', isNew: true });
  };

  // Lưu dữ liệu vào danh sách (Thêm mới hoặc cập nhật qua API)
  const handleSaveIcd = async (e) => {
    e.preventDefault();
    if (!icdForm.maICD.trim()) {
      showError('Vui lòng nhập Mã bệnh lý (ICD)!');
      return;
    }
    if (!icdForm.tenBenh.trim()) {
      showError('Vui lòng nhập Tên chẩn đoán bệnh!');
      return;
    }

    const updatedRecord = {
      maICD: icdForm.maICD.trim().toUpperCase(),
      tenBenh: icdForm.tenBenh.trim()
    };

    try {
      if (selectedICD?.isNew) {
        await apiAddICD(updatedRecord);
        showSuccess('Thêm mới danh mục Mã bệnh lý thành công!');
      } else {
        await apiUpdateICD(selectedICD.maICD, {
          tenBenh: updatedRecord.tenBenh
        });
        showSuccess('Cập nhật thông tin bệnh lý thành công!');
      }
      setSelectedICD(updatedRecord);
      loadICDList();
    } catch (error) {
      console.error('Lỗi khi lưu ICD:', error);
      showError('Không thể lưu thông tin bệnh lý: ' + (error.message || 'Lỗi hệ thống'));
    }
  };

  // Xóa mã bệnh lý khỏi danh mục qua API
  const handleDeleteIcd = async (maICD) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa mã bệnh ${maICD} khỏi danh mục?`)) {
      try {
        await apiDeleteICD(maICD);
        showSuccess('Xóa mã bệnh lý thành công!');
        if (selectedICD && selectedICD.maICD === maICD) {
          setSelectedICD(null);
        }
        loadICDList();
      } catch (error) {
        console.error('Lỗi khi xóa ICD:', error);
        showError('Không thể xóa bệnh lý: ' + (error.message || 'Lỗi hệ thống'));
      }
    }
  };

  return (
    <div className="kb-wrapper h-screen overflow-hidden">
      {/* Topbar điều hướng */}
      <div className="kb-topbar h-[50px] px-5 flex items-center justify-between">
        <div className="flex-1 flex justify-start">
          <button className="kb-back-btn py-[5px] px-[10px]" onClick={() => navigate('/staff')}>
            <ArrowLeft size={16} /> Quay về trang chủ
          </button>
        </div>
        <div className="kb-topbar-title flex-1 flex justify-center text-[15px] items-center">
          <Database size={18} className="mr-[6px]" />
          <strong>Danh mục bệnh lý (ICD-10)</strong>
        </div>
        <div className="flex-1 flex justify-end text-[12px] opacity-[0.85]">
          <span>Trang chủ / Quản lý danh mục / Bệnh lý (ICD)</span>
        </div>
      </div>

      {/* Vùng làm việc chính */}
      <div className="kb-body flex h-[calc(100vh-50px)] bg-[var(--bg-main)] overflow-hidden">
        
        {/* CỘT TRÁI: Bảng danh sách ICD */}
        <div className="flex-[1.3] flex flex-col border-r border-[var(--border-color)] h-full bg-white">
          <div className="flex justify-between items-center py-3 px-[18px] bg-[var(--bg-main)] border-b border-[var(--border-color)]">
            <div className="flex items-center gap-[6px] shrink-0">
              <ListCollapse size={16} className="text-[var(--primary)] shrink-0" />
              <h3 className="text-[14.5px] font-[750] text-[var(--text-main)] whitespace-nowrap">
                DANH SÁCH MÃ CHẨN ĐOÁN & TÊN BỆNH
              </h3>
            </div>
            <button 
              onClick={handleAddNewIcd}
              className="btn-primary h-7 text-[12px] px-2.5 flex items-center gap-1 !w-auto !mt-0 shrink-0"
            >
              <Plus size={12} /> Thêm danh mục
            </button>
          </div>

          {/* Bảng dữ liệu */}
          <div className="flex-1 overflow-y-auto">
            <table className="kb-table w-full border-collapse text-[13px]">
              <thead>
                <tr className="sticky top-0 z-10 bg-[var(--bg-main)] border-b-2 border-[var(--border-color)]">
                  <th className="w-[50px] text-center p-2">STT</th>
                  <th className="w-[150px] p-2">Mã bệnh lý (ICD)</th>
                  <th className="p-2">Tên phân loại chẩn đoán bệnh</th>
                  <th className="w-[60px] p-2 text-center">Xóa</th>
                </tr>
                <tr className="bg-[var(--bg-main)] border-b border-[var(--border-color)]">
                  <td></td>
                  <td className="p-1">
                    <input 
                      type="text" 
                      placeholder="Lọc mã..." 
                      className="form-input h-[26px] text-[12px] !py-0.5 !pl-2 !pr-2"
                      value={icdFilters.maICD}
                      onChange={e => handleIcdFilterChange('maICD', e.target.value)}
                    />
                  </td>
                  <td className="p-1">
                    <input 
                      type="text" 
                      placeholder="Lọc tên bệnh..." 
                      className="form-input h-[26px] text-[12px] !py-0.5 !pl-2 !pr-2"
                      value={icdFilters.tenBenh}
                      onChange={e => handleIcdFilterChange('tenBenh', e.target.value)}
                    />
                  </td>
                  <td></td>
                </tr>
              </thead>
              <tbody>
                {displayedICD.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center p-[30px] text-[var(--text-muted)]">
                      Không tìm thấy mã bệnh nào khớp với bộ lọc.
                    </td>
                  </tr>
                ) : (
                  displayedICD.map((item, idx) => {
                    const isSelected = selectedICD && selectedICD.maICD === item.maICD;
                    return (
                      <tr 
                        key={item.maICD}
                        className={`kb-table-row cursor-pointer transition-colors duration-150 ${
                          isSelected ? 'bg-[var(--primary-light)]' : 'bg-transparent'
                        }`}
                        onClick={() => setSelectedICD(item)}
                      >
                        <td className="text-center py-2.5 px-2 font-medium text-[var(--text-muted)]">
                          {icdStartIdx + idx + 1}
                        </td>
                        <td className="font-bold text-[var(--primary-hover)] py-2.5 px-2">
                          {item.maICD}
                        </td>
                        <td className="font-medium py-2.5 px-2">{item.tenBenh}</td>
                        <td className="py-2.5 px-2 text-center">
                          <button 
                            className="kb-icon-btn kb-icon-btn--danger mx-auto"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteIcd(item.maICD);
                            }}
                            title="Xóa mã ICD"
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
                Hiển thị từ <b>{icdStartIdx + 1}</b> đến <b>{Math.min(icdStartIdx + itemsPerPage, totalCount)}</b> trong tổng số <b>{totalCount}</b> mã ICD
              </span>
              <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] whitespace-nowrap">
                <span>| Hiển thị:</span>
                <select
                  value={itemsPerPage}
                  onChange={e => {
                    setItemsPerPage(Number(e.target.value));
                    setIcdPage(1);
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
                disabled={activeIcdPage === 1}
                onClick={() => setIcdPage(activeIcdPage - 1)}
                className={`h-6 w-6 rounded border border-[#0ea5e9] flex items-center justify-center text-[11px] font-bold transition-all ${
                  activeIcdPage === 1 
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
                    onClick={() => setIcdPage(p)}
                    className={`h-6 w-6 rounded border flex items-center justify-center text-[11px] font-bold transition-all cursor-pointer ${
                      p === activeIcdPage
                        ? "bg-[#0ea5e9] text-white border-[#0ea5e9]"
                        : "bg-transparent text-[#0ea5e9] border-[#0ea5e9] hover:bg-[#e0f2fe]"
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
              <button 
                disabled={activeIcdPage === totalIcdPages}
                onClick={() => setIcdPage(activeIcdPage + 1)}
                className={`h-6 w-6 rounded border border-[#0ea5e9] flex items-center justify-center text-[11px] font-bold transition-all ${
                  activeIcdPage === totalIcdPages 
                    ? 'opacity-40 cursor-not-allowed text-[#0ea5e9] bg-transparent' 
                    : 'text-[#0ea5e9] bg-transparent hover:bg-[#e0f2fe] cursor-pointer'
                }`}
              >
                &gt;
              </button>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: Form chi tiết */}
        <div className="flex-[0.7] flex flex-col h-full bg-white">
          <div className="flex bg-[#0052cc] py-3 px-[18px] h-[42px] items-center text-white text-[13px] font-bold gap-2">
            <Database size={16} />
            <span>CHI TIẾT DANH MỤC BỆNH LÝ</span>
          </div>

          <div className="flex-1 overflow-y-auto p-5 bg-white">
            {selectedICD === null ? (
              <div className="h-full flex flex-col items-center justify-center text-[var(--text-muted)] text-center gap-2">
                <ListCollapse size={32} className="opacity-40 mb-2 text-[var(--primary)]" />
                <p className="text-[13px]">Chọn một mã ICD bên bảng danh sách hoặc click nút <b>"Thêm danh mục"</b> để tạo mới.</p>
              </div>
            ) : (
              <form onSubmit={handleSaveIcd} className="h-full flex flex-col justify-between">
                <div className="flex flex-col gap-4">
                  <div className="border-b border-dashed border-[var(--border-color)] pb-4">
                    <h4 className="text-[13px] font-bold text-[var(--primary)] mb-3">
                      THÔNG TIN MÃ BỆNH LÝ (ICD-10)
                    </h4>
                    <div className="flex flex-col gap-3">
                      <div className="form-group">
                        <label className="form-label text-[12.5px]">Mã bệnh lý (ICD) <span className="text-red-500">*</span></label>
                        <input 
                          type="text" 
                          className="form-input h-[34px] text-[13px] pl-3 uppercase"
                          placeholder="Ví dụ: J00, I10, E11..."
                          value={icdForm.maICD}
                          onChange={e => setIcdForm({ ...icdForm, maICD: e.target.value })}
                          required
                          disabled={!selectedICD.isNew}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label text-[12.5px]">Tên phân loại chẩn đoán bệnh <span className="text-red-500">*</span></label>
                        <input 
                          type="text" 
                          className="form-input h-[34px] text-[13px] pl-3"
                          placeholder="Ví dụ: Tăng huyết áp vô căn..."
                          value={icdForm.tenBenh}
                          onChange={e => setIcdForm({ ...icdForm, tenBenh: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Các nút Lưu/Hủy */}
                <div className="flex gap-3 border-t border-[var(--border-color)] pt-4 mt-5">
                  <button type="submit" className="btn-primary flex-1 h-9 text-[13px] flex items-center justify-center gap-1.5 p-0 m-0">
                    <Save size={16} /> Lưu thông tin [F4]
                  </button>
                  <button type="button" onClick={() => setSelectedICD(null)} className="btn-outline flex-1 h-9 text-[13px] flex items-center justify-center p-0 m-0">
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

export default DanhMucICD;
