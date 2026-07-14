import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Plus, Trash2, Save, Users 
} from 'lucide-react';
import { useToast } from '../utils/ToastContext';
import {
  apiGetNhaCungCapList,
  apiAddNhaCungCap,
  apiUpdateNhaCungCap,
  apiDeleteNhaCungCap
} from '../utils/api';

/**
 * Component Quản lý Danh mục Nhà cung cấp dược phẩm, vật tư y tế độc lập
 */
function KhoNhaCungCap() {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  // Trạng thái tải dữ liệu
  const [isLoading, setIsLoading] = useState(false);
  const [isManager, setIsManager] = useState(false);

  // States danh sách & chọn dòng
  const [allSuppliersList, setAllSuppliersList] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  // State thông tin form nhập
  const [formData, setFormData] = useState({
    maNCC: '',
    tenNCC: '',
    sDT: '',
    diaChi: ''
  });

  // State bộ lọc tìm kiếm
  const [filters, setFilters] = useState({
    tenNCC: ''
  });

  // States quản lý phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Kiểm tra vai trò của người dùng từ LocalStorage để phân quyền
  useEffect(() => {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        const role = u.roleName || u.role || 'Admin';
        setIsManager(role === 'Admin' || role === 'QuanLyKhoThuoc');
      } catch (e) {
        setIsManager(false);
      }
    }
  }, []);

  // Tải danh sách nhà cung cấp từ Backend API (Tải 1 lần về client)
  const loadSuppliers = async () => {
    setIsLoading(true);
    try {
      const res = await apiGetNhaCungCapList('', 1, 1000);
      if (res && res.data) {
        setAllSuppliersList(res.data);
      } else {
        setAllSuppliersList([]);
      }
    } catch (err) {
      console.error('Lỗi tải danh mục nhà cung cấp:', err);
      showError('Không thể tải danh sách nhà cung cấp từ máy chủ');
    } finally {
      setIsLoading(false);
    }
  };

  // Tải danh sách khi component mount
  useEffect(() => {
    loadSuppliers();
  }, []);

  // Reset trang về 1 khi đổi bộ lọc tên hoặc kích thước trang
  useEffect(() => {
    setCurrentPage(1);
  }, [filters.tenNCC, pageSize]);

  // Điền thông tin vào form mỗi khi chọn một dòng khác
  useEffect(() => {
    if (selectedSupplier) {
      setFormData({
        maNCC: selectedSupplier.maNCC || '',
        tenNCC: selectedSupplier.tenNCC || '',
        sDT: selectedSupplier.sDT || selectedSupplier.sdt || '',
        diaChi: selectedSupplier.diaChi || ''
      });
    } else {
      setFormData({
        maNCC: '',
        tenNCC: '',
        sDT: '',
        diaChi: ''
      });
    }
  }, [selectedSupplier]);

  // Lọc danh sách nhà cung cấp trên client theo cả mã, tên hoặc số điện thoại (Chuyển đổi thành String để tránh lỗi .toLowerCase khi thuộc tính là kiểu số)
  const filteredSuppliers = allSuppliersList.filter(sup => 
    String(sup.maNCC || '').toLowerCase().includes(filters.tenNCC.toLowerCase().trim()) ||
    String(sup.tenNCC || '').toLowerCase().includes(filters.tenNCC.toLowerCase().trim()) ||
    String(sup.sDT || sup.sdt || '').toLowerCase().includes(filters.tenNCC.toLowerCase().trim())
  );

  const totalCount = filteredSuppliers.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const activePage = Math.min(currentPage, totalPages);
  const startIndex = (activePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalCount);
  const suppliers = filteredSuppliers.slice(startIndex, endIndex);

  // Xây dựng danh sách trang hiển thị collapsed (dấu ...)
  const getPaginationItems = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (activePage <= 4) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (activePage >= totalPages - 3) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(activePage - 1);
        pages.push(activePage);
        pages.push(activePage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  // Xử lý thay đổi input trên form
  const handleInputChange = (key, val) => {
    setFormData({ ...formData, [key]: val });
  };

  // Khởi chạy chế độ thêm mới nhà cung cấp
  const handleAddNew = () => {
    setSelectedSupplier({
      maNCC: '',
      tenNCC: '',
      sDT: '',
      diaChi: '',
      isNew: true
    });
  };

  // Lưu thông tin (Thêm mới hoặc Cập nhật)
  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (!formData.tenNCC.trim()) {
      showError('Vui lòng nhập tên nhà cung cấp!');
      return;
    }

    const payload = {
      TenNCC: formData.tenNCC.trim(),
      SDT: formData.sDT ? formData.sDT.trim() : null,
      DiaChi: formData.diaChi ? formData.diaChi.trim() : null
    };

    setIsLoading(true);
    try {
      if (selectedSupplier?.isNew) {
        const res = await apiAddNhaCungCap(payload);
        showSuccess(res.message || 'Thêm mới nhà cung cấp thành công!');
        setSelectedSupplier(null);
      } else {
        const res = await apiUpdateNhaCungCap(selectedSupplier.maNCC, payload);
        showSuccess(res.message || 'Cập nhật nhà cung cấp thành công!');
        setSelectedSupplier(null);
      }
      await loadSuppliers();
    } catch (err) {
      console.error('Lỗi khi lưu nhà cung cấp:', err);
      showError(err.message || 'Lưu thông tin thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  // Xóa nhà cung cấp khỏi cơ sở dữ liệu
  const handleDelete = async (maNCC, tenNCC) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa nhà cung cấp: ${tenNCC}?`)) {
      setIsLoading(true);
      try {
        await apiDeleteNhaCungCap(maNCC);
        showSuccess('Xóa nhà cung cấp thành công!');
        if (selectedSupplier && selectedSupplier.maNCC === maNCC) {
          setSelectedSupplier(null);
        }
        await loadSuppliers();
      } catch (err) {
        console.error('Lỗi khi xóa nhà cung cấp:', err);
        showError(err.message || 'Không thể xóa nhà cung cấp này (có thể do đang có lô thuốc liên kết)!');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="kb-wrapper h-screen overflow-hidden flex flex-col bg-[var(--bg-main)]">
      {/* Topbar điều hướng */}
      <div className="kb-topbar h-[50px] px-5 flex items-center justify-between shrink-0">
        <div className="flex-1 flex justify-start items-center">
          <button className="kb-back-btn py-[5px] px-[10px]" onClick={() => navigate('/staff')}>
            <ArrowLeft size={16} /> Quay về trang chủ
          </button>
        </div>
        <div className="kb-topbar-title flex-1 flex justify-center items-center text-[15px]">
          <Users size={18} className="mr-[6px]" />
          <strong>Quản lý danh mục nhà cung cấp</strong>
        </div>
        <div className="flex-1 flex justify-end items-center text-[12px] opacity-[0.85]">
          <span>Trang chủ / Kho dược / Danh mục nhà cung cấp</span>
        </div>
      </div>

      {/* Vùng làm việc chính */}
      <div className="kb-body flex h-[calc(100vh-50px)] overflow-hidden">
        
        {/* Cột trái: Bảng danh sách nhà cung cấp */}
        <div className="flex-[1.3] flex flex-col border-r border-[var(--border-color)] h-full bg-white">
          <div className="flex justify-between items-center py-3 px-4 border-b border-[var(--border-color)] bg-[var(--bg-main)]">
            <div className="flex items-center gap-1.5">
              <Users size={16} className="text-[#0ea5e9]" />
              <h3 className="text-[14px] font-[750] text-[var(--text-main)]">Danh sách Nhà cung cấp</h3>
            </div>
            {isManager && (
              <button onClick={handleAddNew} className="btn-primary h-8 text-[12.5px] px-3 flex items-center gap-1 !w-auto !mt-0 shrink-0 bg-[#0ea5e9] hover:bg-[#0284c7] cursor-pointer">
                <Plus size={14} /> Thêm nhà cung cấp
              </button>
            )}
          </div>

          {/* Bảng nhà cung cấp */}
          <div className="flex-1 overflow-y-auto">
            <table className="kb-table w-full border-collapse text-[13px]">
              <thead>
                <tr className="sticky top-0 z-10 bg-[var(--bg-main)] border-b-2 border-[var(--border-color)]">
                  <th className="w-[50px] text-center p-2">STT</th>
                  <th className="w-[100px] p-2">Mã NCC</th>
                  <th className="p-2">Tên nhà cung cấp</th>
                  <th className="w-[160px] p-2">Số điện thoại</th>
                  <th className="p-2">Địa chỉ trụ sở</th>
                  {isManager && <th className="w-[60px] p-2 text-center">Xóa</th>}
                </tr>
                <tr className="bg-[var(--bg-main)] border-b border-[var(--border-color)]">
                  <td></td>
                  <td></td>
                  <td className="p-1">
                    <input 
                      type="text" placeholder="Lọc theo tên..." className="form-input h-[26px] text-[12px] py-[2px] !px-2 !pl-2"
                      value={filters.tenNCC} onChange={e => setFilters({ ...filters, tenNCC: e.target.value })}
                    />
                  </td>
                  <td></td>
                  <td></td>
                  {isManager && <td></td>}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={isManager ? 6 : 5} className="text-center p-10 text-[var(--text-muted)]">Đang tải danh sách nhà cung cấp...</td>
                  </tr>
                ) : suppliers.length === 0 ? (
                  <tr>
                    <td colSpan={isManager ? 6 : 5} className="text-center p-10 text-[var(--text-muted)]">Không tìm thấy nhà cung cấp nào</td>
                  </tr>
                ) : (
                  suppliers.map((sup, idx) => {
                    const isSelected = selectedSupplier && selectedSupplier.maNCC === sup.maNCC;
                    return (
                      <tr 
                        key={sup.maNCC} 
                        className={`kb-table-row cursor-pointer transition-colors duration-150 ${isSelected ? 'bg-[var(--primary-light)]' : 'bg-transparent'}`}
                        onClick={() => setSelectedSupplier(sup)}
                      >
                        <td className="text-center py-2.5 px-2 text-[var(--text-muted)]">{startIndex + idx + 1}</td>
                        <td className={`font-semibold py-2.5 px-2 ${isSelected ? 'text-[var(--primary-hover)]' : 'text-[var(--text-main)]'}`}>{sup.maNCC}</td>
                        <td className="font-[650] py-2.5 px-2">{sup.tenNCC}</td>
                        <td className="py-2.5 px-2 font-medium">{sup.sDT || sup.sdt || '—'}</td>
                        <td className="py-2.5 px-2 text-[12px] text-gray-600">{sup.diaChi || '—'}</td>
                        {isManager && (
                          <td className="py-2.5 px-2 text-center">
                            <button 
                              className="kb-icon-btn kb-icon-btn--danger mx-auto"
                              onClick={(e) => { e.stopPropagation(); handleDelete(sup.maNCC, sup.tenNCC); }}
                              title="Xóa nhà cung cấp"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Phân trang Nhà cung cấp */}
          <div className="border-t border-[var(--border-color)] py-2 px-4 flex justify-between items-center text-[12.5px] text-[var(--text-muted)] bg-[var(--bg-main)]">
            <div className="flex gap-1 items-center">
              <button 
                disabled={activePage === 1} 
                onClick={() => setCurrentPage(activePage - 1)} 
                className={`h-6 w-6 rounded border border-[#0ea5e9] flex items-center justify-center text-[11px] font-bold transition-all ${
                  activePage === 1 
                    ? 'opacity-40 cursor-not-allowed text-[#0ea5e9] bg-transparent' 
                    : 'text-[#0ea5e9] bg-transparent hover:bg-[#e0f2fe] cursor-pointer'
                }`}
              >
                &lt;
              </button>
              {getPaginationItems().map((p, index) => {
                if (p === '...') {
                  return <span key={`dots-${index}`} className="px-1 text-[var(--text-muted)] select-none">...</span>;
                }
                return (
                  <button 
                    key={p} 
                    onClick={() => setCurrentPage(p)} 
                    className={`h-6 w-6 rounded border flex items-center justify-center text-[11px] font-bold transition-all cursor-pointer ${
                      p === activePage
                        ? "bg-[#0ea5e9] text-white border-[#0ea5e9]"
                        : "bg-transparent text-[#0ea5e9] border-[#0ea5e9] hover:bg-[#e0f2fe]"
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
              <button 
                disabled={activePage === totalPages} 
                onClick={() => setCurrentPage(activePage + 1)} 
                className={`h-6 w-6 rounded border border-[#0ea5e9] flex items-center justify-center text-[11px] font-bold transition-all ${
                  activePage === totalPages 
                    ? 'opacity-40 cursor-not-allowed text-[#0ea5e9] bg-transparent' 
                    : 'text-[#0ea5e9] bg-transparent hover:bg-[#e0f2fe] cursor-pointer'
                }`}
              >
                &gt;
              </button>
            </div>
            <span>Hiển thị {totalCount === 0 ? 0 : startIndex + 1} - {Math.min(endIndex, totalCount)} trên tổng {totalCount} nhà cung cấp</span>
          </div>
        </div>

        {/* Cột phải: Form chi tiết Nhà cung cấp */}
        <div className="flex-[0.7] flex flex-col h-full bg-white">
          <div className="flex bg-[#0ea5e9] py-3 px-[18px] h-[42px] items-center text-white text-[13px] font-bold gap-2">
            <Users size={16} />
            <span>CHI TIẾT THÔNG TIN NHÀ CUNG CẤP</span>
          </div>

          <div className="flex-1 overflow-y-auto p-5 bg-white">
            {selectedSupplier === null ? (
              <div className="h-full flex flex-col items-center justify-center text-[var(--text-muted)] text-center gap-3">
                <Users size={48} className="opacity-25 text-[#0ea5e9]" />
                <div>
                  <h4 className="font-semibold text-[var(--text-main)]">Chưa chọn nhà cung cấp</h4>
                  <p className="text-[13px] mt-1">Chọn một nhà cung cấp bên trái hoặc bấm "Thêm nhà cung cấp" để khai báo thông tin mới.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSave} className="h-full flex flex-col justify-between">
                <div className="flex flex-col gap-3.5">
                  
                  <div className="form-group m-0">
                    <label className="form-label text-[12.5px]">Mã nhà cung cấp</label>
                    <input 
                      type="text" className="form-input h-9 text-[13px] uppercase !pl-3" placeholder="Tự sinh tự động" value={formData.maNCC}
                      disabled required
                    />
                  </div>

                  <div className="form-group m-0">
                    <label className="form-label text-[12.5px]">Tên nhà cung cấp <span className="text-red-500">*</span></label>
                    <input 
                      type="text" className="form-input h-9 text-[13px] !pl-3" placeholder="Nhập tên công ty/đại lý cung ứng..." value={formData.tenNCC}
                      onChange={e => handleInputChange('tenNCC', e.target.value)} required disabled={!isManager}
                    />
                  </div>

                  <div className="form-group m-0">
                    <label className="form-label text-[12.5px]">Số điện thoại liên lạc</label>
                    <input 
                      type="text" className="form-input h-9 text-[13px] !pl-3" placeholder="Nhập số điện thoại..." value={formData.sDT}
                      onChange={e => handleInputChange('sDT', e.target.value)} disabled={!isManager}
                    />
                  </div>

                  <div className="form-group m-0">
                    <label className="form-label text-[12.5px]">Địa chỉ trụ sở</label>
                    <input 
                      type="text" className="form-input h-9 text-[13px] !pl-3" placeholder="Nhập địa chỉ trụ sở..." value={formData.diaChi}
                      onChange={e => handleInputChange('diaChi', e.target.value)} disabled={!isManager}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 border-t border-[var(--border-color)] pt-4 mt-5">
                  <button type="button" className="btn-outline w-[100px] h-9 flex items-center justify-center p-0 m-0 cursor-pointer" onClick={() => setSelectedSupplier(null)}>
                    {isManager ? "Hủy" : "Đóng"}
                  </button>
                  {isManager && (
                    <button type="submit" className="btn-primary w-[120px] h-9 flex items-center justify-center gap-1.5 p-0 m-0 bg-[#0ea5e9] hover:bg-[#0284c7] cursor-pointer"><Save size={16} /> Lưu</button>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default KhoNhaCungCap;
