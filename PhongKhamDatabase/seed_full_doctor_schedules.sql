USE [QuanLyPhongKham_DB]
GO
SET NOCOUNT ON
GO

-- 1. Thêm tài khoản Bác sĩ Sản phụ khoa (NV009) & Tai Mũi Họng (NV010) nếu chưa có
IF NOT EXISTS (SELECT * FROM [dbo].[Users] WHERE Username = N'mxp1803.bacsi4@gmail.com')
BEGIN
    INSERT INTO [dbo].[Users] ([Username], [PasswordHash], [RoleID], [IsActive])
    VALUES (N'mxp1803.bacsi4@gmail.com', '$2a$11$iXOJctEK0HkgDUaLajgVSu3ySsIKkJD8gcecGdHrjm4/IyS7Xi8oi', 2, 1);
    DECLARE @uid4 INT = SCOPE_IDENTITY();
    INSERT INTO [dbo].[NhanVien] ([MaNV], [UserID], [HoTen], [ChuyenMon], [SDT], [Email], [MaKhoa])
    VALUES ('NV009', @uid4, N'Tran Hoai Nam', N'San phu khoa', '0900000009', 'mxp1803.bacsi4@gmail.com', 'KH04');
END
GO

IF NOT EXISTS (SELECT * FROM [dbo].[Users] WHERE Username = N'mxp1803.bacsi5@gmail.com')
BEGIN
    INSERT INTO [dbo].[Users] ([Username], [PasswordHash], [RoleID], [IsActive])
    VALUES (N'mxp1803.bacsi5@gmail.com', '$2a$11$iXOJctEK0HkgDUaLajgVSu3ySsIKkJD8gcecGdHrjm4/IyS7Xi8oi', 2, 1);
    DECLARE @uid5 INT = SCOPE_IDENTITY();
    INSERT INTO [dbo].[NhanVien] ([MaNV], [UserID], [HoTen], [ChuyenMon], [SDT], [Email], [MaKhoa])
    VALUES ('NV010', @uid5, N'Hoang Bich Ngoc', N'Tai Mui Hong', '0900000010', 'mxp1803.bacsi5@gmail.com', 'KH05');
END
GO

-- 2. Xóa và nạp lại lịch làm việc bác sĩ cho tất cả các khoa mỗi ngày trong tuần
DELETE FROM [dbo].[LichLamViec];
DBCC CHECKIDENT ('[dbo].[LichLamViec]', RESEED, 0);
GO

-- Nạp lịch làm việc đầy đủ các khoa cho các ngày từ 10/08/2026 đến 30/08/2026
-- KH01 (NV002): Phòng 101 - Nội tổng quát
-- KH02 (NV003): Phòng 102 - Ngoại tổng quát
-- KH03 (NV004): Phòng 103 - Nhi khoa
-- KH04 (NV009): Phòng 104 - Sản phụ khoa
-- KH05 (NV010): Phòng 105 - Tai Mũi Họng

INSERT INTO [dbo].[LichLamViec] ([MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES
-- Tuần 17/08/2026 - 23/08/2026 (Tuần demo chính)
('NV002', '2026-08-17', 'Sang',  N'Phong 101', N'Kham Noi tong quat', '2026-08-15'),
('NV003', '2026-08-17', 'Chieu', N'Phong 102', N'Kham Ngoai tong quat', '2026-08-15'),
('NV004', '2026-08-17', 'Sang',  N'Phong 103', N'Kham Nhi khoa', '2026-08-15'),
('NV009', '2026-08-17', 'Chieu', N'Phong 104', N'Kham San phu khoa', '2026-08-15'),
('NV010', '2026-08-17', 'Sang',  N'Phong 105', N'Kham Tai Mui Hong', '2026-08-15'),

('NV002', '2026-08-18', 'Chieu', N'Phong 101', N'Kham Noi tong quat', '2026-08-15'),
('NV003', '2026-08-18', 'Sang',  N'Phong 102', N'Kham Ngoai tong quat', '2026-08-15'),
('NV004', '2026-08-18', 'Chieu', N'Phong 103', N'Kham Nhi khoa', '2026-08-15'),
('NV009', '2026-08-18', 'Sang',  N'Phong 104', N'Kham San phu khoa', '2026-08-15'),
('NV010', '2026-08-18', 'Chieu', N'Phong 105', N'Kham Tai Mui Hong', '2026-08-15'),

('NV002', '2026-08-19', 'Sang',  N'Phong 101', N'Kham Noi tong quat', '2026-08-15'),
('NV003', '2026-08-19', 'Chieu', N'Phong 102', N'Kham Ngoai tong quat', '2026-08-15'),
('NV004', '2026-08-19', 'Sang',  N'Phong 103', N'Kham Nhi khoa', '2026-08-15'),
('NV009', '2026-08-19', 'Chieu', N'Phong 104', N'Kham San phu khoa', '2026-08-15'),
('NV010', '2026-08-19', 'Sang',  N'Phong 105', N'Kham Tai Mui Hong', '2026-08-15'),

('NV002', '2026-08-20', 'Chieu', N'Phong 101', N'Kham Noi tong quat', '2026-08-15'),
('NV003', '2026-08-20', 'Sang',  N'Phong 102', N'Kham Ngoai tong quat', '2026-08-15'),
('NV004', '2026-08-20', 'Chieu', N'Phong 103', N'Kham Nhi khoa', '2026-08-15'),
('NV009', '2026-08-20', 'Sang',  N'Phong 104', N'Kham San phu khoa', '2026-08-15'),
('NV010', '2026-08-20', 'Chieu', N'Phong 105', N'Kham Tai Mui Hong', '2026-08-15'),

('NV002', '2026-08-21', 'Sang',  N'Phong 101', N'Kham Noi tong quat', '2026-08-15'),
('NV003', '2026-08-21', 'Chieu', N'Phong 102', N'Kham Ngoai tong quat', '2026-08-15'),
('NV004', '2026-08-21', 'Sang',  N'Phong 103', N'Kham Nhi khoa', '2026-08-15'),
('NV009', '2026-08-21', 'Chieu', N'Phong 104', N'Kham San phu khoa', '2026-08-15'),
('NV010', '2026-08-21', 'Sang',  N'Phong 105', N'Kham Tai Mui Hong', '2026-08-15'),

('NV002', '2026-08-22', 'Chieu', N'Phong 101', N'Kham Noi tong quat', '2026-08-15'),
('NV003', '2026-08-22', 'Sang',  N'Phong 102', N'Kham Ngoai tong quat', '2026-08-15'),
('NV004', '2026-08-22', 'Chieu', N'Phong 103', N'Kham Nhi khoa', '2026-08-15'),
('NV009', '2026-08-22', 'Sang',  N'Phong 104', N'Kham San phu khoa', '2026-08-15'),
('NV010', '2026-08-22', 'Chieu', N'Phong 105', N'Kham Tai Mui Hong', '2026-08-15'),

('NV002', '2026-08-23', 'Sang',  N'Phong 101', N'Kham Truc Nhat', '2026-08-15'),
('NV003', '2026-08-23', 'Chieu', N'Phong 102', N'Kham Truc Nhat', '2026-08-15'),
('NV004', '2026-08-23', 'Sang',  N'Phong 103', N'Kham Truc Nhat', '2026-08-15'),
('NV009', '2026-08-23', 'Chieu', N'Phong 104', N'Kham Truc Nhat', '2026-08-15'),
('NV010', '2026-08-23', 'Sang',  N'Phong 105', N'Kham Truc Nhat', '2026-08-15'),

-- Tuần 24/08/2026 - 30/08/2026 (Tuần tiếp theo)
('NV002', '2026-08-24', 'Sang',  N'Phong 101', N'Kham Noi tong quat', '2026-08-15'),
('NV003', '2026-08-24', 'Chieu', N'Phong 102', N'Kham Ngoai tong quat', '2026-08-15'),
('NV004', '2026-08-24', 'Sang',  N'Phong 103', N'Kham Nhi khoa', '2026-08-15'),
('NV009', '2026-08-24', 'Chieu', N'Phong 104', N'Kham San phu khoa', '2026-08-15'),
('NV010', '2026-08-24', 'Sang',  N'Phong 105', N'Kham Tai Mui Hong', '2026-08-15'),

('NV002', '2026-08-25', 'Chieu', N'Phong 101', N'Kham Noi tong quat', '2026-08-15'),
('NV003', '2026-08-25', 'Sang',  N'Phong 102', N'Kham Ngoai tong quat', '2026-08-15'),
('NV004', '2026-08-25', 'Chieu', N'Phong 103', N'Kham Nhi khoa', '2026-08-15'),
('NV009', '2026-08-25', 'Sang',  N'Phong 104', N'Kham San phu khoa', '2026-08-15'),
('NV010', '2026-08-25', 'Chieu', N'Phong 105', N'Kham Tai Mui Hong', '2026-08-15'),

('NV002', '2026-08-26', 'Sang',  N'Phong 101', N'Kham Noi tong quat', '2026-08-15'),
('NV003', '2026-08-26', 'Chieu', N'Phong 102', N'Kham Ngoai tong quat', '2026-08-15'),
('NV004', '2026-08-26', 'Sang',  N'Phong 103', N'Kham Nhi khoa', '2026-08-15'),
('NV009', '2026-08-26', 'Chieu', N'Phong 104', N'Kham San phu khoa', '2026-08-15'),
('NV010', '2026-08-26', 'Sang',  N'Phong 105', N'Kham Tai Mui Hong', '2026-08-15'),

('NV002', '2026-08-27', 'Chieu', N'Phong 101', N'Kham Noi tong quat', '2026-08-15'),
('NV003', '2026-08-27', 'Sang',  N'Phong 102', N'Kham Ngoai tong quat', '2026-08-15'),
('NV004', '2026-08-27', 'Chieu', N'Phong 103', N'Kham Nhi khoa', '2026-08-15'),
('NV009', '2026-08-27', 'Sang',  N'Phong 104', N'Kham San phu khoa', '2026-08-15'),
('NV010', '2026-08-27', 'Chieu', N'Phong 105', N'Kham Tai Mui Hong', '2026-08-15'),

('NV002', '2026-08-28', 'Sang',  N'Phong 101', N'Kham Noi tong quat', '2026-08-15'),
('NV003', '2026-08-28', 'Chieu', N'Phong 102', N'Kham Ngoai tong quat', '2026-08-15'),
('NV004', '2026-08-28', 'Sang',  N'Phong 103', N'Kham Nhi khoa', '2026-08-15'),
('NV009', '2026-08-28', 'Chieu', N'Phong 104', N'Kham San phu khoa', '2026-08-15'),
('NV010', '2026-08-28', 'Sang',  N'Phong 105', N'Kham Tai Mui Hong', '2026-08-15'),

('NV002', '2026-08-29', 'Chieu', N'Phong 101', N'Kham Noi tong quat', '2026-08-15'),
('NV003', '2026-08-29', 'Sang',  N'Phong 102', N'Kham Ngoai tong quat', '2026-08-15'),
('NV004', '2026-08-29', 'Chieu', N'Phong 103', N'Kham Nhi khoa', '2026-08-15'),
('NV009', '2026-08-29', 'Sang',  N'Phong 104', N'Kham San phu khoa', '2026-08-15'),
('NV010', '2026-08-29', 'Chieu', N'Phong 105', N'Khám Tai Mui Hong', '2026-08-15'),

('NV002', '2026-08-30', 'Sang',  N'Phong 101', N'Kham Truc Nhat', '2026-08-15'),
('NV003', '2026-08-30', 'Chieu', N'Phong 102', N'Kham Truc Nhat', '2026-08-15'),
('NV004', '2026-08-30', 'Sang',  N'Phong 103', N'Kham Truc Nhat', '2026-08-15'),
('NV009', '2026-08-30', 'Chieu', N'Phong 104', N'Kham Truc Nhat', '2026-08-15'),
('NV010', '2026-08-30', 'Sang',  N'Phong 105', N'Kham Truc Nhat', '2026-08-15');
GO

PRINT N'Da cap nhat xong lich truc bac si khong bi loi font.';
GO
