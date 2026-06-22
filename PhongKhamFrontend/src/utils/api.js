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

// API Quên mật khẩu / Đổi mật khẩu kết nối với Backend thực tế qua SQL Server
export const apiResetPassword = async (email, soDienThoai, matKhauMoi, nhapLaiMatKhauMoi) => {
  return await apiFetch('/xacthuc/QuenMatKhau', {
    method: 'POST',
    body: JSON.stringify({ 
      email: email.trim(), 
      soDienThoai: soDienThoai.trim(), 
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

// API Tra cứu bệnh nhân cũ theo SĐT giả lập
export const apiTraCuuBenhNhan = async (sdt) => {
  await new Promise(resolve => setTimeout(resolve, 150));
  
  const stored = localStorage.getItem('danhSachPhieuKham') || '[]';
  let list = [];
  try { list = JSON.parse(stored); } catch(e) {}
  
  const found = list.find(item => item.sdt === sdt);
  if (found) {
    return { data: found };
  }
  return { data: null };
};

// API Tiếp nhận bệnh nhân mới/cũ giả lập
export const apiTiepNhanBenhNhan = async (payload) => {
  await new Promise(resolve => setTimeout(resolve, 250));
  
  const stored = localStorage.getItem('danhSachPhieuKham') || '[]';
  let list = [];
  try { list = JSON.parse(stored); } catch(e) {}
  
  const newPhieu = {
    maPhieu: 'PK_' + new Date().toISOString().slice(2,10).replace(/-/g,'') + '_' + String(list.length + 1).padStart(3, '0'),
    trangThai: 1, // 1: Chờ khám
    daThanhToan: false,
    ngayKham: new Date().toISOString(),
    ...payload
  };
  list.push(newPhieu);
  localStorage.setItem('danhSachPhieuKham', JSON.stringify(list));
  return newPhieu;
};

// API Lấy danh sách bệnh nhân đã tiếp đón giả lập
export const apiGetDanhSachTiepNhan = async ({ search = '', maBacSi = '', trangThai = '', ngayKham = '', page = 1, limit = 50 } = {}) => {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const stored = localStorage.getItem('danhSachPhieuKham') || '[]';
  let list = [];
  try { list = JSON.parse(stored); } catch(e) {}

  let filtered = list;
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(p => p.hoTen.toLowerCase().includes(q) || p.maBN?.includes(search) || p.maPhieu?.includes(search));
  }
  if (maBacSi) {
    filtered = filtered.filter(p => p.maBacSi === maBacSi);
  }
  if (trangThai !== '' && trangThai !== null && trangThai !== undefined) {
    filtered = filtered.filter(p => p.trangThai === Number(trangThai));
  }
  
  return { data: filtered, total: filtered.length };
};

// API Lấy chi tiết hồ sơ bệnh nhân theo mã phiếu khám giả lập
export const apiGetChiTietPhieuKham = async (maPhieu) => {
  await new Promise(resolve => setTimeout(resolve, 150));
  
  const stored = localStorage.getItem('danhSachPhieuKham') || '[]';
  let list = [];
  try { list = JSON.parse(stored); } catch(e) {}
  
  const found = list.find(p => p.maPhieu === maPhieu);
  if (found) return found;
  throw new Error('Không tìm thấy hồ sơ bệnh án');
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


