USE QuanLyPhongKham_DB;
GO

-- 1. Tạo bảng DanhMucKhoa nếu chưa tồn tại
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[DanhMucKhoa]') AND type in (N'U'))
BEGIN
    CREATE TABLE DanhMucKhoa (
        MaKhoa VARCHAR(20) PRIMARY KEY,
        TenKhoa NVARCHAR(100) NOT NULL UNIQUE
    );
    PRINT 'Da tao bang DanhMucKhoa!';
END
ELSE
BEGIN
    PRINT 'Bang DanhMucKhoa da ton tai!';
END
GO

-- 2. Thêm dữ liệu hạt giống cho DanhMucKhoa
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[DanhMucKhoa]') AND type in (N'U'))
BEGIN
    IF NOT EXISTS (SELECT * FROM DanhMucKhoa WHERE MaKhoa = 'KHOA01')
        INSERT INTO DanhMucKhoa (MaKhoa, TenKhoa) VALUES ('KHOA01', N'Nội tổng quát');
    IF NOT EXISTS (SELECT * FROM DanhMucKhoa WHERE MaKhoa = 'KHOA02')
        INSERT INTO DanhMucKhoa (MaKhoa, TenKhoa) VALUES ('KHOA02', N'Tim mạch');
    IF NOT EXISTS (SELECT * FROM DanhMucKhoa WHERE MaKhoa = 'KHOA03')
        INSERT INTO DanhMucKhoa (MaKhoa, TenKhoa) VALUES ('KHOA03', N'Nhi khoa');
    IF NOT EXISTS (SELECT * FROM DanhMucKhoa WHERE MaKhoa = 'KHOA04')
        INSERT INTO DanhMucKhoa (MaKhoa, TenKhoa) VALUES ('KHOA04', N'Tai Mũi Họng');
        
    PRINT 'Da nap du lieu hat giong cho DanhMucKhoa!';
END
GO

-- 3. Thêm cột MaKhoa vào bảng NhanVien nếu chưa tồn tại
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NhanVien]') AND name = 'MaKhoa')
BEGIN
    ALTER TABLE NhanVien ADD MaKhoa VARCHAR(20) FOREIGN KEY REFERENCES DanhMucKhoa(MaKhoa);
    PRINT 'Da them cot MaKhoa vao bang NhanVien!';
END
ELSE
BEGIN
    PRINT 'Cot MaKhoa da ton tai trong bang NhanVien!';
END
GO

-- 4. Ánh xạ dữ liệu ChuyenMon hien tai sang MaKhoa
UPDATE NhanVien SET MaKhoa = 'KHOA01' WHERE ChuyenMon = N'Nội tổng quát' AND MaKhoa IS NULL;
UPDATE NhanVien SET MaKhoa = 'KHOA02' WHERE ChuyenMon = N'Tim mạch' AND MaKhoa IS NULL;
UPDATE NhanVien SET MaKhoa = 'KHOA03' WHERE ChuyenMon = N'Nhi khoa' AND MaKhoa IS NULL;
UPDATE NhanVien SET MaKhoa = 'KHOA04' WHERE ChuyenMon = N'Tai Mũi Họng' AND MaKhoa IS NULL;
-- Nếu có chuyên môn khác hoặc chưa khớp, có thể mặc định là KHOA01 hoặc để NULL
UPDATE NhanVien SET MaKhoa = 'KHOA01' WHERE MaKhoa IS NULL;
PRINT 'Da anh xa du lieu ChuyenMon sang MaKhoa!';
GO
