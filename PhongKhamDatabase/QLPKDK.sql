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

CREATE TABLE DichVuYTe (
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
    MaNV_TiepDon VARCHAR(20) FOREIGN KEY REFERENCES NhanVien(MaNV),
    MaBacSi VARCHAR(20) FOREIGN KEY REFERENCES NhanVien(MaNV),
    NgayKham DATETIME DEFAULT GETDATE(),
    -- Sinh hiệu
    Mach INT,
    NhietDo FLOAT,
    HuyetAp VARCHAR(20),
    CanNang FLOAT,
    ChieuCao FLOAT,
    -- Chẩn đoán
    MaICD VARCHAR(20) FOREIGN KEY REFERENCES DanhMucICD(MaICD),
    KetLuan NVARCHAR(MAX),
    LyDoKham NVARCHAR(MAX),   -- Lý do đến khám (lễ tân ghi khi tiếp nhận)
    TrangThaiKham INT DEFAULT 0 -- 0: Chờ khám, 1: Đang khám, 2: Chờ CLS, 3: Hoàn thành
);

CREATE TABLE ChiTietCanLamSang (
    MaChiTiet INT PRIMARY KEY IDENTITY,
    MaPhieu VARCHAR(20) FOREIGN KEY REFERENCES PhieuKham(MaPhieu),
    MaDV VARCHAR(20) FOREIGN KEY REFERENCES DichVuYTe(MaDV),
    KetQua NVARCHAR(MAX),
    TrangThaiCLS INT DEFAULT 0 -- 0: Chưa làm, 1: Đã làm, 2: BS đã đọc kết quả
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
    DonViTinh NVARCHAR(50) -- Viên, Vỉ, Hộp, Chai
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

-- =========================================================
-- 5. PHÂN HỆ THANH TOÁN & HÓA ĐƠN
-- =========================================================
CREATE TABLE HoaDon (
    MaHoaDon VARCHAR(20) PRIMARY KEY,
    MaPhieu VARCHAR(20) FOREIGN KEY REFERENCES PhieuKham(MaPhieu),
    MaNV_ThuNgan VARCHAR(20) FOREIGN KEY REFERENCES NhanVien(MaNV),
    NgayThanhToan DATETIME DEFAULT GETDATE(),
    TongTienDichVu DECIMAL(18, 2) DEFAULT 0,
    TongTienThuoc DECIMAL(18, 2) DEFAULT 0,
    ThanhTien DECIMAL(18, 2) NOT NULL,
    TrangThaiThanhToan BIT DEFAULT 0 -- 0: Chưa thanh toán, 1: Đã thanh toán
);