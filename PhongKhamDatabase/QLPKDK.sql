CREATE DATABASE QuanLyPhongKham_DB;
GO
USE QuanLyPhongKham_DB;
GO

-- =========================================================
-- 1. PHÂN HỆ QUẢN TRỊ (PHÂN QUYỀN & NHÂN SỰ)
-- =========================================================
CREATE TABLE Roles (
    RoleID INT PRIMARY KEY IDENTITY,
    RoleName VARCHAR(50) UNIQUE NOT NULL -- Admin, BacSi, LeTan, ThuNgan, QuanLyKho
);

CREATE TABLE Users (
    UserID INT PRIMARY KEY IDENTITY,
    Username VARCHAR(50) UNIQUE NOT NULL,
    PasswordHash VARCHAR(255) NOT NULL,
    RoleID INT FOREIGN KEY REFERENCES Roles(RoleID),
    IsActive BIT DEFAULT 1
);

CREATE TABLE DanhMucKhoa (
    MaKhoa VARCHAR(20) PRIMARY KEY,
    TenKhoa NVARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE NhanVien (
    MaNV VARCHAR(20) PRIMARY KEY, -- NV001, BS001...
    UserID INT UNIQUE FOREIGN KEY REFERENCES Users(UserID),
    HoTen NVARCHAR(100) NOT NULL,
    ChuyenMon NVARCHAR(100),
    MaKhoa VARCHAR(20) FOREIGN KEY REFERENCES DanhMucKhoa(MaKhoa),
    SDT VARCHAR(15),
    Email VARCHAR(100)
);

-- =========================================================
-- 2. PHÂN HỆ DANH MỤC DÙNG CHUNG (TỪ ĐIỂN DỮ LIỆU)
-- =========================================================
CREATE TABLE DanhMucICD (
    MaICD VARCHAR(20) PRIMARY KEY, -- Ví dụ: J00, I10
    TenBenh NVARCHAR(255) NOT NULL
);

CREATE TABLE LoaiDichVu (
    MaLoaiDV INT PRIMARY KEY IDENTITY,
    TenLoai NVARCHAR(100) NOT NULL -- Khám lâm sàng, Xét nghiệm sinh hóa, Siêu âm, X-Quang
);

CREATE TABLE ChiTietDichVuYTe (
    MaDV VARCHAR(20) PRIMARY KEY,
    MaLoaiDV INT FOREIGN KEY REFERENCES LoaiDichVu(MaLoaiDV),
    TenDV NVARCHAR(255) NOT NULL,
    GiaTien DECIMAL(18, 2) NOT NULL,
    TrangThai BIT DEFAULT 1 -- 1: Đang áp dụng, 0: Ngừng cung cấp
);

-- =========================================================
-- 3. PHÂN HỆ TIẾP NHẬN & KHÁM BỆNH
-- =========================================================
CREATE TABLE DatLichKham (
    MaDatLich INT PRIMARY KEY IDENTITY,
    HoTenKhach NVARCHAR(100) NOT NULL,
    SDT VARCHAR(15) NOT NULL,
    NgayHen DATE,
    YeuCauKham NVARCHAR(MAX),
    TrangThai NVARCHAR(50) DEFAULT 'ChoXacNhan' -- ChoXacNhan, DaTiepDon, Huy
);

CREATE TABLE BenhNhan (
    MaBN VARCHAR(20) PRIMARY KEY, -- Cấu trúc PK + yyMMdd + stt
    HoTen NVARCHAR(100) NOT NULL,
    NgaySinh DATE,
    GioiTinh NVARCHAR(10),
    SDT VARCHAR(15),
    DiaChi NVARCHAR(255),
    TienSuBenh NVARCHAR(MAX) -- Bác sĩ sẽ xem thông tin này khi khám
);

CREATE TABLE PhieuKham (
    MaPhieu VARCHAR(20) PRIMARY KEY, -- PK_yyMMdd_stt
    MaBN VARCHAR(20) FOREIGN KEY REFERENCES BenhNhan(MaBN),
    MaNV VARCHAR(20) FOREIGN KEY REFERENCES NhanVien(MaNV),
    NgayKham DATETIME DEFAULT GETDATE(),
    -- Sinh hiệu
    Mach INT,
    NhietDo FLOAT,
    HuyetAp VARCHAR(20),
    CanNang FLOAT,
    ChieuCao FLOAT,
    -- Chẩn đoán
    KetLuan NVARCHAR(MAX),
    LyDoKham NVARCHAR(MAX),   -- Lý do đến khám (lễ tân ghi khi tiếp nhận)
    TrangThaiKham INT DEFAULT 0 -- 0: Chờ khám, 1: Đang khám, 2: Chờ CLS, 3: Hoàn thành
);

CREATE TABLE ChiTietPhieuKhamICD (
    MaPhieu VARCHAR(20) FOREIGN KEY REFERENCES PhieuKham(MaPhieu),
    MaICD VARCHAR(20) FOREIGN KEY REFERENCES DanhMucICD(MaICD),
    PRIMARY KEY (MaPhieu, MaICD)
);

CREATE TABLE DichVuYTe (
    MaChiTiet INT PRIMARY KEY IDENTITY,
    MaPhieu VARCHAR(20) FOREIGN KEY REFERENCES PhieuKham(MaPhieu),
    MaDV VARCHAR(20) FOREIGN KEY REFERENCES ChiTietDichVuYTe(MaDV),
    KetQua NVARCHAR(MAX),
    TrangThaiDichVu INT DEFAULT 0 -- 0: Chưa thực hiện, 1: Đã thực hiện, 2: BS đã đọc kết quả
);

-- =========================================================
-- 4. PHÂN HỆ QUẢN LÝ KHO DƯỢC
-- =========================================================
CREATE TABLE NhaCungCap (
    MaNCC INT PRIMARY KEY IDENTITY,
    TenNCC NVARCHAR(255) NOT NULL,
    SDT VARCHAR(15),
    DiaChi NVARCHAR(255)
);

CREATE TABLE DanhMucThuoc (
    MaThuoc VARCHAR(20) PRIMARY KEY,
    TenThuoc NVARCHAR(255) NOT NULL,
    HoatChat NVARCHAR(255),
    DonViTinh NVARCHAR(50), -- Viên, Vỉ, Hộp, Chai
    IsActive BIT NOT NULL DEFAULT 1
);

CREATE TABLE LoThuoc (
    MaLo VARCHAR(50) PRIMARY KEY,
    MaThuoc VARCHAR(20) FOREIGN KEY REFERENCES DanhMucThuoc(MaThuoc),
    MaNCC INT FOREIGN KEY REFERENCES NhaCungCap(MaNCC),
    SoLuongNhap INT,
    SoLuongTon INT,
    GiaNhap DECIMAL(18, 2),
    GiaBan DECIMAL(18, 2), -- Giá bán có thể thay đổi theo lô nhập
    NgaySanXuat DATE,
    HanSuDung DATE
);

CREATE TABLE DonThuoc (
    MaDonThuoc VARCHAR(20) PRIMARY KEY,
    MaPhieu VARCHAR(20) FOREIGN KEY REFERENCES PhieuKham(MaPhieu),
    NgayKeDon DATETIME DEFAULT GETDATE(),
    LoiDan NVARCHAR(MAX)
);

CREATE TABLE ChiTietDonThuoc (
    MaDonThuoc VARCHAR(20) FOREIGN KEY REFERENCES DonThuoc(MaDonThuoc),
    MaThuoc VARCHAR(20) FOREIGN KEY REFERENCES DanhMucThuoc(MaThuoc),
    SoLuong INT,
    CachDung NVARCHAR(255),
    TrangThaiPhatThuoc BIT DEFAULT 0, -- Đã phát thuốc trừ kho hay chưa
    PRIMARY KEY (MaDonThuoc, MaThuoc)
);

CREATE TABLE DanhMucVatTu (
    MaVatTu VARCHAR(20) PRIMARY KEY,
    TenVatTu NVARCHAR(255) NOT NULL,
    QuyCach NVARCHAR(255) NULL,
    DonViTinh NVARCHAR(50) NOT NULL,
    IsActive BIT NOT NULL DEFAULT 1
);

CREATE TABLE ChiTietVatTuPhieuKham (
    MaPhieu VARCHAR(20) FOREIGN KEY REFERENCES PhieuKham(MaPhieu),
    MaVatTu VARCHAR(20) FOREIGN KEY REFERENCES DanhMucVatTu(MaVatTu),
    SoLuong INT NOT NULL,
    DonGia DECIMAL(18, 2) NOT NULL,
    PRIMARY KEY (MaPhieu, MaVatTu)
);

-- =========================================================
-- 5. PHÂN HỆ THANH TOÁN & HÓA ĐƠN
-- =========================================================
CREATE TABLE HoaDon (
    MaHoaDon VARCHAR(20) PRIMARY KEY,
    MaPhieu VARCHAR(20) FOREIGN KEY REFERENCES PhieuKham(MaPhieu),
    MaNV VARCHAR(20) FOREIGN KEY REFERENCES NhanVien(MaNV),
    NgayThanhToan DATETIME DEFAULT GETDATE(),
    TongTienDichVu DECIMAL(18, 2) DEFAULT 0,
    TongTienThuoc DECIMAL(18, 2) DEFAULT 0,
    ThanhTien DECIMAL(18, 2) NOT NULL,
    TrangThaiThanhToan BIT DEFAULT 0 -- 0: Chưa thanh toán, 1: Đã thanh toán
);
GO

-- =========================================================
-- 6. DỮ LIỆU SEED (MẪU)
-- =========================================================
-- 1. Thêm các vai trò (Roles) mặc định nếu chưa có
IF NOT EXISTS (SELECT * FROM Roles WHERE RoleName = 'Admin')
BEGIN
    SET IDENTITY_INSERT Roles ON;
    INSERT INTO Roles (RoleID, RoleName) VALUES (1, 'Admin');
    INSERT INTO Roles (RoleID, RoleName) VALUES (2, 'BacSi');
    INSERT INTO Roles (RoleID, RoleName) VALUES (3, 'LeTan');
    INSERT INTO Roles (RoleID, RoleName) VALUES (4, 'ThuNgan');
    INSERT INTO Roles (RoleID, RoleName) VALUES (5, 'QuanLyKhoThuoc');
    SET IDENTITY_INSERT Roles OFF;
END
GO

-- 1.5. Thêm các khoa mặc định nếu chưa có
IF NOT EXISTS (SELECT * FROM DanhMucKhoa WHERE MaKhoa = 'KHOA01')
    INSERT INTO DanhMucKhoa (MaKhoa, TenKhoa) VALUES ('KHOA01', N'Nội tổng quát');
IF NOT EXISTS (SELECT * FROM DanhMucKhoa WHERE MaKhoa = 'KHOA02')
    INSERT INTO DanhMucKhoa (MaKhoa, TenKhoa) VALUES ('KHOA02', N'Tim mạch');
IF NOT EXISTS (SELECT * FROM DanhMucKhoa WHERE MaKhoa = 'KHOA03')
    INSERT INTO DanhMucKhoa (MaKhoa, TenKhoa) VALUES ('KHOA03', N'Nhi khoa');
IF NOT EXISTS (SELECT * FROM DanhMucKhoa WHERE MaKhoa = 'KHOA04')
    INSERT INTO DanhMucKhoa (MaKhoa, TenKhoa) VALUES ('KHOA04', N'Tai Mũi Họng');
GO

-- 2. Thêm tài khoản Admin của Mai Xuân Phát (mật khẩu mặc định: Phat@18032003)
DECLARE @AdminUserID INT;
IF NOT EXISTS (SELECT * FROM Users WHERE Username = 'maixuanphat')
BEGIN
    INSERT INTO Users (Username, PasswordHash, RoleID, IsActive)
    VALUES ('maixuanphat', '$2a$11$k4U5kRMwZN3LDZWgzffGTeW9YrzORXdIhb.Oz8lYnVjVzZdwa7v5K', 1, 1);
    SET @AdminUserID = SCOPE_IDENTITY();
    INSERT INTO NhanVien (MaNV, UserID, HoTen, ChuyenMon, MaKhoa, SDT, Email)
    VALUES ('NV001', @AdminUserID, N'Mai Xuân Phát', N'Quản trị hệ thống', 'KHOA01', '0896421137', 'mxp1803@gmail.com');
END
GO

-- Thêm tài khoản Bác sĩ mặc định nếu chưa có
DECLARE @DoctorUserID INT;
IF NOT EXISTS (SELECT * FROM Users WHERE Username = 'nguyenvanan')
BEGIN
    INSERT INTO Users (Username, PasswordHash, RoleID, IsActive)
    VALUES ('nguyenvanan', '$2a$11$k4U5kRMwZN3LDZWgzffGTeW9YrzORXdIhb.Oz8lYnVjVzZdwa7v5K', 2, 1);
    SET @DoctorUserID = SCOPE_IDENTITY();
    INSERT INTO NhanVien (MaNV, UserID, HoTen, ChuyenMon, MaKhoa, SDT, Email)
    VALUES ('NV002', @DoctorUserID, N'BS. CK1. Nguyễn Văn An', N'Nội tổng quát', 'KHOA01', '0901234567', 'nguyenvanan@phongkham.vn');
END
GO

-- 3. Thêm danh mục ICD mặc định nếu chưa có
IF NOT EXISTS (SELECT * FROM DanhMucICD WHERE MaICD = 'A09')
    INSERT INTO DanhMucICD (MaICD, TenBenh) VALUES ('A09', N'Tiêu chảy và viêm dạ dày ruột do nhiễm khuẩn');
IF NOT EXISTS (SELECT * FROM DanhMucICD WHERE MaICD = 'I10')
    INSERT INTO DanhMucICD (MaICD, TenBenh) VALUES ('I10', N'Tăng huyết áp vô căn (nguyên phát)');
IF NOT EXISTS (SELECT * FROM DanhMucICD WHERE MaICD = 'E11')
    INSERT INTO DanhMucICD (MaICD, TenBenh) VALUES ('E11', N'Đái tháo đường không phụ thuộc insulin (Typ 2)');
IF NOT EXISTS (SELECT * FROM DanhMucICD WHERE MaICD = 'J06')
    INSERT INTO DanhMucICD (MaICD, TenBenh) VALUES ('J06', N'Nhiễm khuẩn đường hô hấp trên cấp tính nhiều vị trí');
IF NOT EXISTS (SELECT * FROM DanhMucICD WHERE MaICD = 'K29')
    INSERT INTO DanhMucICD (MaICD, TenBenh) VALUES ('K29', N'Viêm dạ dày và tá tràng');
IF NOT EXISTS (SELECT * FROM DanhMucICD WHERE MaICD = 'M54')
    INSERT INTO DanhMucICD (MaICD, TenBenh) VALUES ('M54', N'Đau lưng');
IF NOT EXISTS (SELECT * FROM DanhMucICD WHERE MaICD = 'N39')
    INSERT INTO DanhMucICD (MaICD, TenBenh) VALUES ('N39', N'Nhiễm trùng đường tiết niệu (không xác định vị trí)');
IF NOT EXISTS (SELECT * FROM DanhMucICD WHERE MaICD = 'R05')
    INSERT INTO DanhMucICD (MaICD, TenBenh) VALUES ('R05', N'Ho');
GO

-- 4. Thêm 50 dịch vụ y tế mẫu vào bảng ChiTietDichVuYTe
IF NOT EXISTS (SELECT * FROM ChiTietDichVuYTe WHERE MaDV = 'DV001')
BEGIN
    INSERT INTO ChiTietDichVuYTe (MaDV, MaLoaiDV, TenDV, GiaTien, TrangThai) VALUES
    ('DV001', NULL, N'Siêu âm ổ bụng tổng quát', 150000.00, 1),
    ('DV002', NULL, N'Siêu âm tim màu', 350000.00, 1),
    ('DV003', NULL, N'Siêu âm tuyến giáp', 120000.00, 1),
    ('DV004', NULL, N'Siêu âm tuyến vú hai bên', 150000.00, 1),
    ('DV005', NULL, N'Siêu âm mạch máu chi dưới', 250000.00, 1),
    ('DV006', NULL, N'Siêu âm Thai 4D', 400000.00, 1),
    ('DV007', NULL, N'Siêu âm khớp gối', 180000.00, 1),
    ('DV008', NULL, N'X-quang ngực thẳng kỹ thuật số', 120000.00, 1),
    ('DV009', NULL, N'X-quang cột sống thắt lưng thẳng nghiêng', 200000.00, 1),
    ('DV010', NULL, N'X-quang xương đùi thẳng nghiêng', 150000.00, 1),
    ('DV011', NULL, N'X-quang khớp gối thẳng nghiêng', 150000.00, 1),
    ('DV012', NULL, N'X-quang sọ thẳng nghiêng', 180000.00, 1),
    ('DV013', NULL, N'X-quang xoang tư thế Blondeau Hirtz', 150000.00, 1),
    ('DV014', NULL, N'Nội soi tai mũi họng ống cứng', 200000.00, 1),
    ('DV015', NULL, N'Nội soi dạ dày tá tràng không gây mê', 450000.00, 1),
    ('DV016', NULL, N'Nội soi dạ dày tá tràng có gây mê', 900000.00, 1),
    ('DV017', NULL, N'Nội soi đại trực tràng có gây mê', 1200000.00, 1),
    ('DV018', NULL, N'Điện tâm đồ (ECG) 12 cần', 80000.00, 1),
    ('DV019', NULL, N'Điện não đồ (EEG) kỹ thuật số', 250000.00, 1),
    ('DV020', NULL, N'Điện cơ đồ (EMG)', 300000.00, 1),
    ('DV021', NULL, N'Xét nghiệm công thức máu toàn bộ (24 chỉ số)', 90000.00, 1),
    ('DV022', NULL, N'Xét nghiệm đường huyết lúc đói (Glucose)', 40000.00, 1),
    ('DV023', NULL, N'Xét nghiệm HbA1c', 150000.00, 1),
    ('DV024', NULL, N'Xét nghiệm chức năng gan AST (SGOT)', 40000.00, 1),
    ('DV025', NULL, N'Xét nghiệm chức năng gan ALT (SGPT)', 40000.00, 1),
    ('DV026', NULL, N'Xét nghiệm chức năng gan GGT', 50000.00, 1),
    ('DV027', NULL, N'Xét nghiệm Bilirubin toàn phần', 40000.00, 1),
    ('DV028', NULL, N'Xét nghiệm chức năng thận Ure', 40000.00, 1),
    ('DV029', NULL, N'Xét nghiệm chức năng thận Creatinin', 40000.00, 1),
    ('DV030', NULL, N'Xét nghiệm Acid Uric (Chẩn đoán Gút)', 50000.00, 1),
    ('DV031', NULL, N'Xét nghiệm Mỡ máu Cholesterol toàn phần', 45000.00, 1),
    ('DV032', NULL, N'Xét nghiệm Mỡ máu Triglyceride', 45000.00, 1),
    ('DV033', NULL, N'Xét nghiệm Mỡ máu HDL-Cholesterol', 45000.00, 1),
    ('DV034', NULL, N'Xét nghiệm Mỡ máu LDL-Cholesterol', 45000.00, 1),
    ('DV035', NULL, N'Xét nghiệm nước tiểu toàn bộ (10 thông số)', 50000.00, 1),
    ('DV036', NULL, N'Xét nghiệm nước tiểu vi thể', 60000.00, 1),
    ('DV037', NULL, N'Xét nghiệm viêm gan B HBsAg test nhanh', 80000.00, 1),
    ('DV038', NULL, N'Xét nghiệm viêm gan B HBsAg định lượng', 200000.00, 1),
    ('DV039', NULL, N'Xét nghiệm kháng thể viêm gan B Anti-HBs', 150000.00, 1),
    ('DV040', NULL, N'Xét nghiệm viêm gan C Anti-HCV test nhanh', 100000.00, 1),
    ('DV041', NULL, N'Xét nghiệm HIV test nhanh', 100000.00, 1),
    ('DV042', NULL, N'Xét nghiệm Giang mai Syphilis test nhanh', 90000.00, 1),
    ('DV043', NULL, N'Xét nghiệm chức năng tuyến giáp TSH', 120000.00, 1),
    ('DV044', NULL, N'Xét nghiệm chức năng tuyến giáp Free T3', 120000.00, 1),
    ('DV045', NULL, N'Xét nghiệm chức năng tuyến giáp Free T4', 120000.00, 1),
    ('DV046', NULL, N'Xét nghiệm định lượng Calci huyết thanh', 50000.00, 1),
    ('DV047', NULL, N'Xét nghiệm định lượng Sắt huyết thanh', 80000.00, 1),
    ('DV048', NULL, N'Test nhanh Helicobacter pylori (Hp) qua hơi thở', 600000.00, 1),
    ('DV049', NULL, N'Test nhanh HP qua phân', 200000.00, 1),
    ('DV050', NULL, N'Xét nghiệm đông máu đông cầm máu (PT/APTT)', 120000.00, 1);
END
GO

-- 5. Thêm vật tư y tế mẫu vào bảng DanhMucVatTu
IF NOT EXISTS (SELECT * FROM DanhMucVatTu WHERE MaVatTu = 'VT001')
BEGIN
    INSERT INTO DanhMucVatTu (MaVatTu, TenVatTu, QuyCach, DonViTinh, IsActive) VALUES
    ('VT001', N'Găng tay y tế không bột', N'Hộp 100 cái', N'Cái', 1),
    ('VT002', N'Bơm kim tiêm 5ml', N'Cái', N'Cái', 1),
    ('VT003', N'Bơm kim tiêm 10ml', N'Cái', N'Cái', 1),
    ('VT004', N'Bông hút nước y tế', N'Cuộn 500g', N'Cuộn', 1),
    ('VT005', N'Băng cuộn cá nhân', N'Cuộn', N'Cuộn', 1),
    ('VT006', N'Nước muối sinh lý rửa vết thương', N'Chai 500ml', N'Chai', 1);
END
GO