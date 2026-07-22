// Cấu hình URL cơ sở cho API (kết nối với Backend .NET chạy trên cổng 5025)
export const API_BASE_URL = 'http://localhost:5025/api';

// Lấy token xác thực từ LocalStorage
export const getToken = () => localStorage.getItem('token');

// Lưu phiên đăng nhập của người dùng vào LocalStorage
export const setSession = (token, user) => {
  localStorage.setItem('token', token);
  localStorage.setItem('currentUser', JSON.stringify({
    ...user,
    name: user.hoTen || user.name,
    username: user.username,
    role: user.roleName || user.role || 'Admin',
    token: token
  }));
};

// Xóa phiên đăng nhập khỏi LocalStorage
export const clearSession = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('currentUser');
};

// Hàm gọi API chung tự động đính kèm Token (Giữ nguyên cấu trúc để tích hợp sau)
export const apiFetch = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const config = {
    ...options,
    headers,
  };
  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  let data = null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    const text = await response.text();
    data = text ? { message: text } : {};
  }
  if (!response.ok) {
    const error = new Error(data?.message || `Lỗi API: ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
};

// ==========================================
// MOCK API FUNCTIONS USING LOCALSTORAGE
// ==========================================

// API Đăng nhập kết nối với Backend thực tế qua SQL Server
export const apiLogin = async (email, password) => {
  const data = await apiFetch('/xacthuc/DangNhap', { // Gọi endpoint DangNhap của Backend qua phương thức POST để xác thực tài khoản
    method: 'POST', // Sử dụng phương thức POST để gửi thông tin đăng nhập trong request body bảo mật hơn
    body: JSON.stringify({ email, password }) // Chuyển đổi email và mật khẩu thành chuỗi JSON gửi lên server
  }); // Nhận dữ liệu phản hồi chứa JWT Token và thông tin người dùng được truy xuất từ SQL Server

  const user = { // Khởi tạo đối tượng người dùng từ kết quả trả về của backend
    userID: data.userID, // Lưu ID người dùng từ cơ sở dữ liệu
    maNV: data.maNV, // Lưu mã nhân viên tương ứng từ cơ sở dữ liệu SQL Server
    hoTen: data.hoTen, // Lưu họ và tên của nhân sự
    username: email, // Sử dụng email đăng nhập làm tên người dùng chính thức trong hệ thống
    roleID: data.roleID, // Lưu ID của vai trò phân quyền
    roleName: data.roleName, // Lưu tên vai trò của nhân sự (Admin, BacSi, LeTan...)
    sdt: data.sdt, // Lưu số điện thoại từ cơ sở dữ liệu SQL Server của backend trả về
    email: data.email, // Lưu địa chỉ email từ cơ sở dữ liệu SQL Server của backend trả về
    chuyenMon: data.chuyenMon, // Lưu khoa chuyên môn từ cơ sở dữ liệu SQL Server của backend trả về
  }; // Hoàn thiện đối tượng người dùng phù hợp với cấu trúc lưu trữ và sử dụng ở phía Frontend

  setSession(data.token, user); // Lưu trữ JWT Token và thông tin người dùng vào LocalStorage để duy trì phiên làm việc
  return { token: data.token, user, ...user }; // Trả về kết quả đăng nhập thành công chứa cả object user và các trường phẳng hóa cho Login.jsx
};

// API Đăng xuất kết nối với Backend thực tế
export const apiLogout = async () => {
  try { // Đặt trong khối try-catch để ngăn lỗi mạng làm gián đoạn tiến trình xóa session ở client
    await apiFetch('/xacthuc/DangXuat', { // Gọi endpoint DangXuat của Backend để thêm token hiện tại vào blacklist
      method: 'POST' // Sử dụng phương thức POST theo đúng định nghĩa routing của API
    }); // Đợi Backend xử lý cập nhật blacklist token trong MemoryCache
  } catch (error) { // Bắt lỗi nếu API gặp sự cố hoặc máy chủ không phản hồi
    console.error('Logout error:', error); // Ghi nhận lỗi đăng xuất ra console để hỗ trợ debug khi cần thiết
  } finally { // Luôn thực thi phần xóa dữ liệu phiên đăng nhập ở client bất kể API có thành công hay không
    clearSession(); // Thực hiện xóa sạch token và thông tin currentUser khỏi LocalStorage của trình duyệt
  } // Hoàn tất quy trình đăng xuất để chuyển hướng người dùng về màn hình đăng nhập
};

// API Đổi mật khẩu kết nối với Backend thực tế qua SQL Server (yêu cầu xác thực JWT)
export const apiChangePassword = async (matKhauCu, matKhauMoi, nhapLaiMatKhauMoi) => {
  return await apiFetch('/NhanSu/DoiMatKhau', {
    method: 'PUT',
    body: JSON.stringify({ 
      matKhauCu: matKhauCu.trim(), 
      matKhauMoi: matKhauMoi.trim(), 
      nhapLaiMatKhauMoi: nhapLaiMatKhauMoi.trim() 
    })
  });
};

// API Gửi OTP quên mật khẩu
export const apiSendOtpForgotPass = async (email, soDienThoai) => {
  return await apiFetch('/xacthuc/GuiOtpQuenMatKhau', {
    method: 'POST',
    body: JSON.stringify({ 
      email: email.trim(), 
      soDienThoai: soDienThoai.trim() 
    })
  });
};

// API Xác nhận OTP và đổi mật khẩu mới
export const apiVerifyOtpAndResetPass = async (email, otp, matKhauMoi, nhapLaiMatKhauMoi) => {
  return await apiFetch('/xacthuc/XacNhanOtpVaDoiMatKhau', {
    method: 'POST',
    body: JSON.stringify({
      email: email.trim(),
      otp: otp.trim(),
      matKhauMoi: matKhauMoi.trim(),
      nhapLaiMatKhauMoi: nhapLaiMatKhauMoi.trim()
    })
  });
};

// API Lấy danh sách nhân viên kết nối với Backend thực tế qua SQL Server
export const apiGetStaffList = async (status = 'active', page = 1, limit = 20, search = '', roleID = null) => {
  if (status === 'all') {
    const [activeRes, inactiveRes] = await Promise.all([
      apiFetch(`/nhan-su?status=active&page=1&limit=100${search ? `&search=${encodeURIComponent(search)}` : ''}${roleID ? `&roleID=${roleID}` : ''}`),
      apiFetch(`/nhan-su?status=inactive&page=1&limit=100${search ? `&search=${encodeURIComponent(search)}` : ''}${roleID ? `&roleID=${roleID}` : ''}`)
    ]);
    const combined = [...(activeRes?.data || []), ...(inactiveRes?.data || [])];
    return { data: combined, total: combined.length };
  }

  const queryParams = new URLSearchParams();
  queryParams.append('status', status);
  queryParams.append('page', page);
  queryParams.append('limit', limit > 100 ? 100 : limit);
  if (search) queryParams.append('search', search);
  if (roleID) queryParams.append('roleID', roleID);

  const response = await apiFetch(`/nhan-su?${queryParams.toString()}`);
  return { data: response?.data || [], total: response?.pagination?.total || 0 };
};

// API Thêm nhân viên mới kết nối với Backend thực tế qua SQL Server
export const apiAddStaff = async (staffData) => {
  return await apiFetch('/nhan-su', {
    method: 'POST',
    body: JSON.stringify(staffData)
  });
};

// API Cập nhật nhân viên kết nối với Backend thực tế qua SQL Server
export const apiUpdateStaff = async (maNV, staffData) => {
  return await apiFetch(`/nhan-su/${maNV}`, {
    method: 'PUT',
    body: JSON.stringify(staffData)
  });
};

// API Xóa nhân viên kết nối với Backend thực tế qua SQL Server
export const apiDeleteStaff = async (maNV) => {
  return await apiFetch(`/nhan-su/${maNV}`, {
    method: 'DELETE'
  });
};

// API Lấy danh sách bác sĩ phục vụ Tiếp đón & Khám bệnh (Lấy từ DanhSachController mới của Backend v2)
export const apiGetBacSiList = async () => {
  return await apiFetch('/DanhSach/bac-si');
};

// API Lấy danh sách vật tư y tế khả dụng còn tồn kho từ DanhSachController
export const apiGetDanhSachVatTu = async () => {
  return await apiFetch('/DanhSach/vat-tu');
};

// API Lấy danh sách mã ICD-10 từ DanhSachController
export const apiGetDanhSachICD = async () => {
  return await apiFetch('/DanhSach/icd');
};


// API Tra cứu bệnh nhân cũ theo SĐT kết nối với Backend thực tế
export const apiTraCuuBenhNhan = async (sdt) => {
  return await apiFetch(`/TiepDon/tra-cuu?sdt=${encodeURIComponent(sdt)}`);
};

// API Tiếp nhận bệnh nhân mới/cũ kết nối với Backend thực tế
export const apiTiepNhanBenhNhan = async (payload) => {
  let ngaySinhFormatted = payload.ngaySinh;
  if (payload.ngaySinh && payload.ngaySinh.includes('-')) {
    const parts = payload.ngaySinh.split('-');
    if (parts.length === 3) {
      ngaySinhFormatted = `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
  }

  const requestData = {
    maBN: payload.maBN,
    hoTen: payload.hoTen,
    ngaySinh: ngaySinhFormatted,
    gioiTinh: payload.gioiTinh,
    sdt: payload.sdt,
    diaChi: payload.diaChi,
    tienSuBenh: payload.tienSuBenh,
    maNVBacSi: payload.maBacSi || payload.maNV,
    lyDoKham: payload.lyDoKham
    // Gỡ bỏ danhSachICD vì Backend v2 chỉ cho phép Bác sĩ chỉ định ICD ở bước Khám
  };

  const res = await apiFetch('/TiepDon', {
    method: 'POST',
    body: JSON.stringify(requestData)
  });

  if (res && res.data) {
    // Đồng bộ vào localStorage để KhamBenh.jsx và ThanhToanHoaDon.jsx có thể sử dụng (giả lập liên thông)
    const stored = localStorage.getItem('danhSachPhieuKham') || '[]';
    let list = [];
    try { list = JSON.parse(stored); } catch(e) {}

    const newPhieu = {
      maPhieu: res.data.maPhieu,
      maBN: res.data.maBN,
      hoTen: res.data.hoTen,
      ngaySinh: ngaySinhFormatted,
      gioiTinh: payload.gioiTinh,
      sdt: payload.sdt,
      diaChi: payload.diaChi,
      tienSuBenh: payload.tienSuBenh,
      maBacSi: requestData.maNVBacSi,
      maNV: requestData.maNVBacSi,
      lyDoKham: res.data.lyDoKham,
      trangThai: 0, // Chờ khám
      trangThaiKham: 0,
      daThanhToan: false,
      ngayKham: res.data.ngayKham,
      icdList: []
    };
    list.push(newPhieu);
    localStorage.setItem('danhSachPhieuKham', JSON.stringify(list));
  }

  return res;
};

// API Lấy danh sách bệnh nhân đã tiếp đón từ Backend thực tế
export const apiGetDanhSachTiepNhan = async ({ search = '', maNV = '', trangThai = '', ngayKham = '', page = 1, limit = 50 } = {}) => {
  const queryParams = new URLSearchParams();
  if (search) queryParams.append('search', search);
  if (maNV) queryParams.append('maBacSi', maNV);
  if (trangThai !== '' && trangThai !== null && trangThai !== undefined) queryParams.append('trangThai', trangThai);
  if (ngayKham) queryParams.append('ngayKham', ngayKham);
  queryParams.append('page', page);
  queryParams.append('limit', limit);

  const res = await apiFetch(`/TiepDon/danh-sach?${queryParams.toString()}`);
  if (res && res.data) {
    res.data = res.data.map(item => ({
      ...item,
      maBacSi: item.maBacSi || item.maNV,
      tenBacSi: item.tenBacSi || item.tenNhanVien,
      trangThai: item.trangThaiKham,
      trangThaiKham: item.trangThaiKham
    }));
  }
  return res;
};

// API Lấy chi tiết hồ sơ bệnh nhân từ Backend thực tế
export const apiGetChiTietPhieuKham = async (maPhieu) => {
  const data = await apiFetch(`/TiepDon/${maPhieu}`);
  if (data) {
    return {
      ...data,
      trangThaiKham: data.trangThaiKham,
      trangThai: data.trangThaiKham,
      tenBacSi: data.tenBacSi || data.tenNhanVien,
      maBacSi: data.maBacSi || data.maNV,
      maICD: data.danhSachICD && data.danhSachICD.length > 0 ? data.danhSachICD[0].maICD : null,
      tenBenhICD: data.danhSachICD && data.danhSachICD.length > 0 ? data.danhSachICD[0].tenBenh : null,
      icdList: data.danhSachICD || [],
      loiDan: data.donThuoc?.loiDanDonThuoc ?? null,
      canLamSang: data.dichVuYTe ? data.dichVuYTe.map(dv => ({
        maChiTiet: dv.maChiTiet,
        maDV: dv.maDV,
        tenDV: dv.tenDV,
        ketQua: dv.ketQua,
        trangThaiCLS: dv.trangThaiDichVu
      })) : []
    };
  }
  return data;
};

// API Lấy danh sách danh mục bệnh lý ICD-10 kết nối với Backend thực tế
export const apiGetICDList = async (maICD = '', tenBenh = '', page = 1, pageSize = 10) => {
  const queryParams = new URLSearchParams();
  if (maICD) queryParams.append('maICD', maICD);
  if (tenBenh) queryParams.append('tenBenh', tenBenh);
  queryParams.append('page', page);
  queryParams.append('pageSize', pageSize);

  return await apiFetch(`/BenhLyICD?${queryParams.toString()}`);
};

// API Thêm mới bệnh lý ICD-10 kết nối với Backend thực tế
export const apiAddICD = async (icdData) => {
  return await apiFetch('/BenhLyICD', {
    method: 'POST',
    body: JSON.stringify(icdData)
  });
};

// API Cập nhật bệnh lý ICD-10 kết nối với Backend thực tế
export const apiUpdateICD = async (maICD, icdData) => {
  return await apiFetch(`/BenhLyICD/${maICD}`, {
    method: 'PUT',
    body: JSON.stringify(icdData)
  });
};

// API Xóa bệnh lý ICD-10 kết nối với Backend thực tế
export const apiDeleteICD = async (maICD) => {
  return await apiFetch(`/BenhLyICD/${maICD}`, {
    method: 'DELETE'
  });
};

// API Lấy danh sách danh mục dịch vụ y tế CLS kết nối với Backend thực tế
export const apiGetDichVuCLSList = async (maDV = '', tenDV = '', trangThai = null, page = 1, pageSize = 10) => {
  const queryParams = new URLSearchParams();
  if (maDV) queryParams.append('maDV', maDV);
  if (tenDV) queryParams.append('tenDV', tenDV);
  if (trangThai !== null && trangThai !== undefined && trangThai !== '') {
    queryParams.append('trangThai', trangThai);
  }
  queryParams.append('page', page);
  queryParams.append('pageSize', pageSize);

  return await apiFetch(`/DichVuCLS?${queryParams.toString()}`);
};

// API Thêm mới dịch vụ y tế CLS kết nối với Backend thực tế
export const apiAddDichVuCLS = async (dichVuData) => {
  return await apiFetch('/DichVuCLS', {
    method: 'POST',
    body: JSON.stringify(dichVuData)
  });
};

// API Cập nhật dịch vụ y tế CLS kết nối với Backend thực tế
export const apiUpdateDichVuCLS = async (maDV, dichVuData) => {
  return await apiFetch(`/DichVuCLS/${maDV}`, {
    method: 'PUT',
    body: JSON.stringify(dichVuData)
  });
};

// API Xóa dịch vụ y tế CLS kết nối với Backend thực tế
export const apiDeleteDichVuCLS = async (maDV) => {
  return await apiFetch(`/DichVuCLS/${maDV}`, {
    method: 'DELETE'
  });
};

// API Lấy danh sách danh mục khoa phòng kết nối với Backend thực tế
export const apiGetKhoaList = async (maKhoa = '', tenKhoa = '', page = 1, pageSize = 10) => {
  const queryParams = new URLSearchParams();
  if (maKhoa) queryParams.append('maKhoa', maKhoa);
  if (tenKhoa) queryParams.append('tenKhoa', tenKhoa);
  queryParams.append('page', page);
  queryParams.append('pageSize', pageSize);

  return await apiFetch(`/Khoa?${queryParams.toString()}`);
};

// API Thêm mới khoa phòng kết nối với Backend thực tế
export const apiAddKhoa = async (khoaData) => {
  return await apiFetch('/Khoa', {
    method: 'POST',
    body: JSON.stringify(khoaData)
  });
};

// API Cập nhật khoa phòng kết nối với Backend thực tế
export const apiUpdateKhoa = async (maKhoa, khoaData) => {
  return await apiFetch(`/Khoa/${maKhoa}`, {
    method: 'PUT',
    body: JSON.stringify(khoaData)
  });
};

// API Xóa khoa phòng kết nối với Backend thực tế
export const apiDeleteKhoa = async (maKhoa) => {
  return await apiFetch(`/Khoa/${maKhoa}`, {
    method: 'DELETE'
  });
};

// API Lấy danh sách danh mục thuốc kết nối với Backend thực tế qua SQL Server
export const apiGetThuocList = async (maThuoc = '', tenThuoc = '', hoatChat = '', donViTinh = '', page = 1, pageSize = 10) => {
  const queryParams = new URLSearchParams();
  if (maThuoc) queryParams.append('maThuoc', maThuoc);
  if (tenThuoc) queryParams.append('tenThuoc', tenThuoc);
  if (hoatChat) queryParams.append('hoatChat', hoatChat);
  if (donViTinh) queryParams.append('donViTinh', donViTinh);
  queryParams.append('page', page);
  queryParams.append('pageSize', pageSize);

  return await apiFetch(`/Thuoc?${queryParams.toString()}`);
};

// API Thêm mới thuốc vào danh mục kết nối với Backend thực tế
export const apiAddThuoc = async (thuocData) => {
  return await apiFetch('/Thuoc', {
    method: 'POST',
    body: JSON.stringify(thuocData)
  });
};

// API Cập nhật thông tin thuốc kết nối với Backend thực tế
export const apiUpdateThuoc = async (maThuoc, thuocData) => {
  return await apiFetch(`/Thuoc/${maThuoc}`, {
    method: 'PUT',
    body: JSON.stringify(thuocData)
  });
};

// API Xóa thuốc khỏi danh mục (Soft Delete) kết nối với Backend thực tế
export const apiDeleteThuoc = async (maThuoc) => {
  return await apiFetch(`/Thuoc/${maThuoc}`, {
    method: 'DELETE'
  });
};

// ==========================================
// API NHÀ CUNG CẤP KẾT NỐI VỚI BACKEND THỰC TẾ
// ==========================================

// API Lấy danh sách nhà cung cấp kết nối với Backend thực tế
export const apiGetNhaCungCapList = async (tenNCC = '', page = 1, pageSize = 10) => {
  const queryParams = new URLSearchParams();
  if (tenNCC) queryParams.append('tenNCC', tenNCC);
  queryParams.append('page', page);
  queryParams.append('pageSize', pageSize);

  return await apiFetch(`/NhaCungCap?${queryParams.toString()}`);
};

// API Thêm mới nhà cung cấp kết nối với Backend thực tế
export const apiAddNhaCungCap = async (nhaCungCapData) => {
  return await apiFetch('/NhaCungCap', {
    method: 'POST',
    body: JSON.stringify(nhaCungCapData)
  });
};

// API Cập nhật nhà cung cấp kết nối với Backend thực tế
export const apiUpdateNhaCungCap = async (maNCC, nhaCungCapData) => {
  return await apiFetch(`/NhaCungCap/${maNCC}`, {
    method: 'PUT',
    body: JSON.stringify(nhaCungCapData)
  });
};

// API Xóa nhà cung cấp kết nối với Backend thực tế
export const apiDeleteNhaCungCap = async (maNCC) => {
  return await apiFetch(`/NhaCungCap/${maNCC}`, {
    method: 'DELETE'
  });
};

// ==========================================
// API LÔ THUỐC (KHOTHUOC) KẾT NỐI VỚI BACKEND THỰC TẾ
// ==========================================

// API Lấy danh sách lô thuốc
export const apiGetLoThuocList = async (maLo = '', tenThuoc = '', tenNCC = '', hanSuDung = '', page = 1, pageSize = 10) => {
  const queryParams = new URLSearchParams();
  if (maLo) queryParams.append('maLo', maLo);
  if (tenThuoc) queryParams.append('tenThuoc', tenThuoc);
  if (tenNCC) queryParams.append('tenNCC', tenNCC);
  if (hanSuDung && hanSuDung !== 'All' && hanSuDung !== 'Tất cả') {
    let mapping = hanSuDung;
    if (hanSuDung === 'Safe') mapping = 'An toàn';
    else if (hanSuDung === 'Expiring') mapping = 'Hạn ngắn (<6 th)';
    else if (hanSuDung === 'Expired') mapping = 'Đã hết hạn';
    queryParams.append('hanSuDung', mapping);
  } else if (hanSuDung === 'All' || hanSuDung === 'Tất cả') {
    queryParams.append('hanSuDung', 'Tất cả');
  }
  queryParams.append('page', page);
  queryParams.append('pageSize', pageSize);

  return await apiFetch(`/KhoThuoc?${queryParams.toString()}`);
};

// API Thêm mới lô thuốc
export const apiAddLoThuoc = async (loThuocData) => {
  return await apiFetch('/KhoThuoc', {
    method: 'POST',
    body: JSON.stringify(loThuocData)
  });
};

// API Cập nhật thông tin lô thuốc
export const apiUpdateLoThuoc = async (maLo, loThuocData) => {
  return await apiFetch(`/KhoThuoc/${maLo}`, {
    method: 'PUT',
    body: JSON.stringify(loThuocData)
  });
};

// API Xóa lô thuốc (Hard Delete)
export const apiDeleteLoThuoc = async (maLo) => {
  return await apiFetch(`/KhoThuoc/${maLo}`, {
    method: 'DELETE'
  });
};

// API Lấy danh sách bệnh nhân chờ khám (phân trang & lọc)
export const apiGetDSBenhNhanChoKham = async ({ search = '', trangThai = '', maBacSi = '', ngayKham = '', page = 1, limit = 50 } = {}) => {
  const queryParams = new URLSearchParams();
  if (search) queryParams.append('search', search);
  if (trangThai !== '' && trangThai !== null) queryParams.append('trangThai', trangThai);
  if (maBacSi) queryParams.append('maBacSi', maBacSi);
  if (ngayKham) queryParams.append('ngayKham', ngayKham);
  queryParams.append('page', page);
  queryParams.append('limit', limit);
  return await apiFetch(`/KhamBenh/danh-sach?` + queryParams.toString());
};

// API Lấy chi tiết phiếu khám bệnh lâm sàng
export const apiGetChiTietPhieuKhamBenh = async (maPhieu) => {
  return await apiFetch(`/KhamBenh/${maPhieu}`);
};

// API Cập nhật thông tin khám bệnh (sinh hiệu, chẩn đoán, toa thuốc, CLS)
export const apiCapNhatKhamBenh = async (maPhieu, payload) => {
  return await apiFetch(`/KhamBenh/${maPhieu}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
};

// API Tra cứu hồ sơ bệnh án hành chính theo mã/họ tên/SĐT
export const apiTraCuuHoSoBenhAn = async (query) => {
  return await apiFetch(`/HoSoBenhAn/tra-cuu?query=${encodeURIComponent(query)}`);
};

// API Lấy danh sách bệnh nhân khám gần đây (tối đa 5 người)
export const apiGetBenhNhanGanDay = async () => {
  return await apiFetch('/HoSoBenhAn/gan-day');
};

// API Lấy lịch sử khám bệnh của bệnh nhân theo mã bệnh nhân
export const apiGetLichSuKhamBenh = async (maBN) => {
  return await apiFetch(`/HoSoBenhAn/${maBN}/lich-su`);
};

// API Công khai - Lấy danh sách bác sĩ đang hoạt động (anonymous)
export const apiGetBacSiCongKhai = async () => {
  return await apiFetch('/CongKhai/bac-si');
};

// API Công khai - Tra cứu hồ sơ bệnh án bằng mã bệnh nhân và số điện thoại (anonymous)
export const apiTraCuuHoSoCongKhai = async (maBN, sdt) => {
  return await apiFetch(`/CongKhai/tra-cuu-ho-so?maBN=${encodeURIComponent(maBN)}&sdt=${encodeURIComponent(sdt)}`);
};

// API Lấy danh sách danh mục vật tư y tế (có hỗ trợ tìm kiếm và phân trang)
export const apiGetVatTuList = async (query = '', donViTinh = '', page = 1, pageSize = 100) => {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString()
  });
  if (query) queryParams.append('tenVatTu', query);
  if (donViTinh) queryParams.append('donViTinh', donViTinh);
  return await apiFetch(`/VatTu?` + queryParams.toString());
};

// ==========================================
// API QUẢN LÝ LÔ VẬT TƯ (KhoVatTuController)
// ==========================================

export const apiGetVatTuLotList = async (maLo = '', tenVatTu = '', tenNCC = '', hanSuDung = '', page = 1, pageSize = 10) => {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString()
  });
  if (maLo) queryParams.append('maLo', maLo);
  if (tenVatTu) queryParams.append('tenVatTu', tenVatTu);
  if (tenNCC) queryParams.append('tenNCC', tenNCC);
  if (hanSuDung && hanSuDung !== 'All' && hanSuDung !== 'Tất cả') {
    queryParams.append('hanSuDung', hanSuDung);
  }
  return await apiFetch(`/KhoVatTu?` + queryParams.toString());
};

export const apiAddVatTuLot = async (payload) => {
  return await apiFetch('/KhoVatTu', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
};

export const apiUpdateVatTuLot = async (maLo, payload) => {
  return await apiFetch(`/KhoVatTu/${maLo}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
};

export const apiDeleteVatTuLot = async (maLo) => {
  return await apiFetch(`/KhoVatTu/${maLo}`, {
    method: 'DELETE'
  });
};

// ==========================================
// API THANH TOÁN & HÓA ĐƠN (ThanhToanController)
// ==========================================

export const apiGetThanhToanList = async ({ search = '', trangThai = 'All', page = 1, pageSize = 20 } = {}) => {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString()
  });
  if (search) queryParams.append('search', search);
  if (trangThai) queryParams.append('trangThai', trangThai);
  return await apiFetch(`/ThanhToan/danh-sach?` + queryParams.toString());
};

export const apiGetThanhToanChiTiet = async (maPhieu) => {
  return await apiFetch(`/ThanhToan/${maPhieu}/chi-tiet`);
};

export const apiAddThanhToanVatTu = async (maPhieu, payload) => {
  return await apiFetch(`/ThanhToan/${maPhieu}/vat-tu`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
};

export const apiDeleteThanhToanVatTu = async (maPhieu, maVatTu) => {
  return await apiFetch(`/ThanhToan/${maPhieu}/vat-tu/${maVatTu}`, {
    method: 'DELETE'
  });
};

export const apiXacNhanThanhToan = async (payload) => {
  return await apiFetch('/ThanhToan/xac-nhan', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
};

export const apiGetThanhToanPDF = async (maHoaDon) => {
  const token = getToken();
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const response = await fetch(`${API_BASE_URL}/ThanhToan/${maHoaDon}/pdf`, {
    headers
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Lỗi tải PDF hóa đơn: ${response.status}`);
  }
  return await response.blob();
};

// ==========================================
// API ĐẶT LỊCH HẸN KHÁM & XẾP LỊCH TRỰC
// ==========================================

export const apiGetAvailableDoctorsOnSchedule = async (ngayHen, maKhoa, caHen = '') => {
  const queryParams = new URLSearchParams({ ngayHen, maKhoa });
  if (caHen) queryParams.append('caHen', caHen);
  return await apiFetch('/DanhSach/bac-si-lich-trong?' + queryParams.toString());
};

export const apiCreateDatLichKham = async (payload) => {
  return await apiFetch('/DatLichKham', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
};

export const apiGetDatLichKham = async ({ trangThai = '', ngayHen = '', search = '', page = 1, pageSize = 20 } = {}) => {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString()
  });
  if (trangThai) queryParams.append('trangThai', trangThai);
  if (ngayHen) queryParams.append('ngayHen', ngayHen);
  if (search) queryParams.append('search', search);
  return await apiFetch('/DatLichKham?' + queryParams.toString());
};

export const apiXacNhanDatLich = async (maDatLich) => {
  return await apiFetch(`/DatLichKham/${maDatLich}/xac-nhan`, {
    method: 'PUT'
  });
};

export const apiHuyDatLich = async (maDatLich) => {
  return await apiFetch(`/DatLichKham/${maDatLich}/huy`, {
    method: 'PUT'
  });
};

export const apiTiepNhanDatLich = async (maDatLich, payload) => {
  return await apiFetch(`/DatLichKham/${maDatLich}/tiep-nhan`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
};

export const apiGetLichLamViec = async ({ tuNgay = '', denNgay = '', maKhoa = '', maNV = '' } = {}) => {
  const queryParams = new URLSearchParams();
  if (tuNgay) queryParams.append('tuNgay', tuNgay);
  if (denNgay) queryParams.append('denNgay', denNgay);
  if (maKhoa) queryParams.append('maKhoa', maKhoa);
  if (maNV) queryParams.append('maNV', maNV);
  return await apiFetch('/LichLamViec?' + queryParams.toString());
};

export const apiCreateLichLamViec = async (payload) => {
  return await apiFetch('/LichLamViec', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
};

export const apiDeleteLichLamViec = async (maLich) => {
  return await apiFetch(`/LichLamViec/${maLich}`, {
    method: 'DELETE'
  });
};
