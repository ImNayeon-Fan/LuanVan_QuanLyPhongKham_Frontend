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

// API Đổi mật khẩu giả lập
export const apiChangePassword = async (oldPassword, newPassword, confirmPassword) => {
  await new Promise(resolve => setTimeout(resolve, 200)); // Giả lập độ trễ mạng để tạo cảm giác thực tế cho người dùng
  return { message: 'Đổi mật khẩu thành công!' }; // Trả về thông báo thành công giả lập
};

// API Quên mật khẩu / Đổi mật khẩu kết nối với Backend thực tế qua SQL Server
export const apiResetPassword = async (email, sdt, newPassword) => {
  return await apiFetch('/xacthuc/QuenMatKhau', {
    method: 'POST',
    body: JSON.stringify({ email: email.trim(), sdt: sdt.trim(), newPassword: newPassword.trim() })
  });
};

// API Lấy danh sách nhân viên giả lập
export const apiGetStaffList = async (status = 'active', page = 1, limit = 20, search = '', roleID = null) => {
  await new Promise(resolve => setTimeout(resolve, 150));
  
  const stored = localStorage.getItem('danhSachNhanVien');
  let list = [];
  if (stored) {
    try { 
      list = JSON.parse(stored); 
      // Tự động dọn dẹp nếu phát hiện dữ liệu cũ chưa đồng bộ
      const testUser = list.find(u => u.username === 'maixuanphat' || u.username === 'thungan');
      if (testUser && (testUser.maNV === 'NV003' || testUser.email === 'maixuanphat@phongkham.vn' || testUser.role === 'Thu ngân')) {
        list = [];
      }
    } catch(e) {}
  }

  if (list.length === 0) {
    list = [
      { maNV: 'NV001', hoTen: 'Mai Xuân Phát', username: 'maixuanphat', role: 'Admin', trangThai: 'active', roleID: 1, sdt: '0896421137', email: 'mxp1803@gmail.com' },
      { maNV: 'BS001', hoTen: 'BS. CK1. Nguyễn Văn An', username: 'bsan', role: 'Bác sĩ', trangThai: 'active', roleID: 2, sdt: '0912345678', email: 'nguyenvanan@phongkham.vn', khoa: 'Khoa Nội' },
      { maNV: 'BS002', hoTen: 'BS. CK2. Trần Thị Bình', username: 'bsbinh', role: 'Bác sĩ', trangThai: 'active', roleID: 2, sdt: '0987654321', email: 'tranthibinh@phongkham.vn', khoa: 'Khoa Sản' }
    ];
    localStorage.setItem('danhSachNhanVien', JSON.stringify(list));
  }

  let filtered = list;
  if (status && status !== 'all') {
    filtered = filtered.filter(u => u.trangThai === status);
  }
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(u => u.hoTen.toLowerCase().includes(q) || u.maNV.toLowerCase().includes(q));
  }
  if (roleID) {
    filtered = filtered.filter(u => u.roleID === Number(roleID) || (Number(roleID) === 2 && u.role === 'Bác sĩ'));
  }
  
  return { data: filtered, total: filtered.length };
};

// API Thêm nhân viên mới giả lập
export const apiAddStaff = async (staffData) => {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const stored = localStorage.getItem('danhSachNhanVien') || '[]';
  let list = [];
  try { list = JSON.parse(stored); } catch(e) {}
  
  const newStaff = {
    maNV: 'NV' + String(list.length + 1).padStart(3, '0'),
    trangThai: 'active',
    ...staffData
  };
  list.push(newStaff);
  localStorage.setItem('danhSachNhanVien', JSON.stringify(list));
  return newStaff;
};

// API Cập nhật nhân viên giả lập
export const apiUpdateStaff = async (maNV, staffData) => {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const stored = localStorage.getItem('danhSachNhanVien') || '[]';
  let list = [];
  try { list = JSON.parse(stored); } catch(e) {}
  
  list = list.map(item => item.maNV === maNV ? { ...item, ...staffData } : item);
  localStorage.setItem('danhSachNhanVien', JSON.stringify(list));
  return { message: 'Cập nhật thành công' };
};

// API Xóa nhân viên giả lập
export const apiDeleteStaff = async (maNV) => {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const stored = localStorage.getItem('danhSachNhanVien') || '[]';
  let list = [];
  try { list = JSON.parse(stored); } catch(e) {}
  
  list = list.filter(item => item.maNV !== maNV);
  localStorage.setItem('danhSachNhanVien', JSON.stringify(list));
  return { message: 'Xóa nhân viên thành công' };
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
