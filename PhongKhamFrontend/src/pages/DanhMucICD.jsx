import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Plus, Trash2, Save, Database, ListCollapse
} from 'lucide-react';
import { useToast } from '../utils/ToastContext';

// Dữ liệu mẫu ICD-10 gốc
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

/**
 * Component Quản lý Danh mục Bệnh lý (ICD-10)
 */
function DanhMucICD() {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  // Các state quản lý danh sách ICD, form biểu mẫu và bộ lọc tìm kiếm
  const [icdList, setIcdList] = useState([]);
  const [selectedICD, setSelectedICD] = useState(null);
  const [icdForm, setIcdForm] = useState({ maICD: '', tenBenh: '' });
  const [icdFilters, setIcdFilters] = useState({ maICD: '', tenBenh: '' });
  const [icdPage, setIcdPage] = useState(1);

  const itemsPerPage = 10;

  // Khởi chạy lấy danh sách từ LocalStorage
  useEffect(() => {
    const storedICD = localStorage.getItem('danhMucICD');
    if (storedICD) {
      setIcdList(JSON.parse(storedICD));
    } else {
      localStorage.setItem('danhMucICD', JSON.stringify(defaultICDData));
      setIcdList(defaultICDData);
    }
  }, []);

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

  // Bộ lọc danh sách ICD
  const filteredICD = icdList.filter(item => 
    (item.maICD || '').toLowerCase().includes(icdFilters.maICD.toLowerCase()) &&
    (item.tenBenh || '').toLowerCase().includes(icdFilters.tenBenh.toLowerCase())
  );

  // Tính toán phân trang
  const totalIcdPages = Math.max(1, Math.ceil(filteredICD.length / itemsPerPage));
  const activeIcdPage = Math.min(icdPage, totalIcdPages);
  const icdStartIdx = (activeIcdPage - 1) * itemsPerPage;
  const displayedICD = filteredICD.slice(icdStartIdx, icdStartIdx + itemsPerPage);

  // Xử lý khi bộ lọc thay đổi
  const handleIcdFilterChange = (key, val) => {
    setIcdFilters({ ...icdFilters, [key]: val });
    setIcdPage(1);
  };

  // Khởi tạo thêm mới mã bệnh lý
  const handleAddNewIcd = () => {
    setSelectedICD({ maICD: '', tenBenh: '', isNew: true });
  };

  // Lưu dữ liệu vào danh sách (Thêm mới hoặc cập nhật)
  const handleSaveIcd = (e) => {
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

    let newList = [];
    if (selectedICD?.isNew) {
      const exists = icdList.some(item => item.maICD.toUpperCase() === updatedRecord.maICD);
      if (exists) {
        showError('Mã ICD này đã tồn tại trong danh mục!');
        return;
      }
      newList = [...icdList, updatedRecord];
    } else {
      newList = icdList.map(item => item.maICD === selectedICD.maICD ? updatedRecord : item);
    }

    setIcdList(newList);
    localStorage.setItem('danhMucICD', JSON.stringify(newList));
    setSelectedICD(updatedRecord);
    showSuccess('Lưu danh mục Mã bệnh lý thành công!');
  };

  // Xóa mã bệnh lý khỏi danh mục
  const handleDeleteIcd = (maICD) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa mã bệnh ${maICD} khỏi danh mục?`)) {
      const newList = icdList.filter(item => item.maICD !== maICD);
      setIcdList(newList);
      localStorage.setItem('danhMucICD', JSON.stringify(newList));
      if (selectedICD && selectedICD.maICD === maICD) {
        setSelectedICD(null);
      }
    }
  };

  return (
    <div className="kb-wrapper h-screen overflow-hidden">
      {/* Topbar điều hướng */}
      <div className="kb-topbar h-[50px] px-5 flex items-center justify-between">
        <div className="flex-1 flex justify-start">
          <button className="kb-back-btn py-[5px] px-[10px]" onClick={() => navigate('/')}>
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
          <div className="h-[45px] bg-white border-t border-[var(--border-color)] flex items-center justify-between px-5 text-[13px]">
            <span className="text-[var(--text-muted)]">
              Hiển thị từ <b>{icdStartIdx + 1}</b> đến <b>{Math.min(icdStartIdx + itemsPerPage, filteredICD.length)}</b> trong tổng số <b>{filteredICD.length}</b> mã ICD
            </span>
            <div className="flex gap-[5px]">
              <button 
                disabled={icdPage === 1}
                onClick={() => setIcdPage(p => p - 1)}
                className={`py-1 px-2 rounded border border-[var(--border-color)] ${
                  icdPage === 1 ? 'bg-[#f3f4f6] cursor-not-allowed' : 'bg-white cursor-pointer'
                }`}
              >
                Trước
              </button>
              <span className="flex items-center px-2 font-semibold">
                Trang {icdPage} / {totalIcdPages}
              </span>
              <button 
                disabled={icdPage === totalIcdPages}
                onClick={() => setIcdPage(p => p + 1)}
                className={`py-1 px-2 rounded border border-[var(--border-color)] ${
                  icdPage === totalIcdPages ? 'bg-[#f3f4f6] cursor-not-allowed' : 'bg-white cursor-pointer'
                }`}
              >
                Sau
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
