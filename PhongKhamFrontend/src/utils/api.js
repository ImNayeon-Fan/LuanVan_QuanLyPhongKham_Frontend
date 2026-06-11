// Cấu hình URL cơ sở cho API (khi kết nối backend thực tế)
export const API_BASE_URL = 'http://localhost:5024/api';

// Lấy token xác thực từ LocalStorage
export const getToken = () => localStorage.getItem('token');

// Lưu phiên đăng nhập của người dùng vào LocalStorage
export const setSession = (token, user) => {
  localStorage.setItem('token', token);
  localStorage.setItem('currentUser', JSON.stringify({
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

// API Đăng nhập giả lập
export const apiLogin = async (username, password) => {
  // Trễ nhẹ giả lập mạng
  await new Promise(resolve => setTimeout(resolve, 300));

  const storedUsers = localStorage.getItem('danhSachNhanVien');
  let users = [];
  if (storedUsers) {
    try { users = JSON.parse(storedUsers); } catch(e) {}
  } else {
    // Tạo sẵn danh sách nhân viên mặc định nếu chưa có
    users = [
      { maNV: 'BS001', hoTen: 'BS. CK1. Nguyễn Văn An', username: 'bsan', role: 'Bác sĩ', trangThai: 'active', roleID: 2 },
      { maNV: 'BS002', hoTen: 'BS. CK2. Trần Thị Bình', username: 'bsbinh', role: 'Bác sĩ', trangThai: 'active', roleID: 2 },
      { maNV: 'NV003', hoTen: 'Mai Xuân Phát', username: 'maixuanphat', role: 'Thu ngân', trangThai: 'active', roleID: 3 }
    ];
    localStorage.setItem('danhSachNhanVien', JSON.stringify(users));
  }

  let foundUser = users.find(u => u.username.toLowerCase() === username.toLowerCase());
  
  // Nếu không tìm thấy trong danh sách mặc định, tự động tạo mới để đăng nhập thành công luôn
  if (!foundUser) {
    let role = 'Admin';
    let roleID = 1;
    let hoTen = username;
    
    const lowerUser = username.toLowerCase();
    if (lowerUser.includes('bs') || lowerUser.includes('bacsi') || lowerUser.includes('an') || lowerUser.includes('binh')) {
      role = 'Bác sĩ';
      roleID = 2;
      hoTen = 'Bác sĩ ' + username;
    } else if (lowerUser.includes('phat') || lowerUser.includes('thungan') || lowerUser.includes('cashier')) {
      role = 'Thu ngân';
      roleID = 3;
      hoTen = 'Mai Xuân Phát';
    }
    
    foundUser = {
      maNV: 'NV' + String(users.length + 1).padStart(3, '0'),
      hoTen: hoTen,
      username: username,
      role: role,
      trangThai: 'active',
      roleID: roleID
    };
    
    users.push(foundUser);
    localStorage.setItem('danhSachNhanVien', JSON.stringify(users));
  }

  const token = 'mock-jwt-token-for-' + username;
  setSession(token, foundUser);
  return { token, user: foundUser };
};

// API Đăng xuất giả lập
export const apiLogout = async () => {
  clearSession();
};

// API Đổi mật khẩu giả lập
export const apiChangePassword = async (oldPassword, newPassword, confirmPassword) => {
  await new Promise(resolve => setTimeout(resolve, 200));
  return { message: 'Đổi mật khẩu thành công!' };
};

// API Lấy danh sách nhân viên giả lập
export const apiGetStaffList = async (status = 'active', page = 1, limit = 20, search = '', roleID = null) => {
  await new Promise(resolve => setTimeout(resolve, 150));
  
  const stored = localStorage.getItem('danhSachNhanVien');
  let list = [];
  if (stored) {
    try { list = JSON.parse(stored); } catch(e) {}
  } else {
    list = [
      { maNV: 'BS001', hoTen: 'BS. CK1. Nguyễn Văn An', username: 'bsan', role: 'Bác sĩ', trangThai: 'active', roleID: 2 },
      { maNV: 'BS002', hoTen: 'BS. CK2. Trần Thị Bình', username: 'bsbinh', role: 'Bác sĩ', trangThai: 'active', roleID: 2 },
      { maNV: 'NV003', hoTen: 'Mai Xuân Phát', username: 'thungan', role: 'Thu ngân', trangThai: 'active', roleID: 3 }
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
