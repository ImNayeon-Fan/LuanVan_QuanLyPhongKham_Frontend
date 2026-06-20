USE QuanLyPhongKham_DB;
GO

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
-- Hash BCrypt của Phat@18032003 là: $2a$11$k4U5kRMwZN3LDZWgzffGTeW9YrzORXdIhb.Oz8lYnVjVzZdwa7v5K
DECLARE @AdminUserID INT;

IF NOT EXISTS (SELECT * FROM Users WHERE Username = 'maixuanphat')
BEGIN
    INSERT INTO Users (Username, PasswordHash, RoleID, IsActive)
    VALUES ('maixuanphat', '$2a$11$k4U5kRMwZN3LDZWgzffGTeW9YrzORXdIhb.Oz8lYnVjVzZdwa7v5K', 1, 1);
    
    SET @AdminUserID = SCOPE_IDENTITY();

    -- Thêm thông tin Nhân viên liên kết với tài khoản trên
    INSERT INTO NhanVien (MaNV, UserID, HoTen, ChuyenMon, MaKhoa, SDT, Email)
    VALUES ('NV001', @AdminUserID, N'Mai Xuân Phát', N'Quản trị hệ thống', 'KHOA01', '0896421137', 'mxp1803@gmail.com');
    
    PRINT 'Da tao tai khoan maixuanphat thanh cong!';
END
ELSE
BEGIN
    PRINT 'Tai khoan maixuanphat da ton tai!';
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
