/* ============================================================================
   QuanLyPhongKham_DB - SCRIPT CHÈN DỮ LIỆU MẪU (DEMO DATA CHO BUỔI THUYẾT TRÌNH)
   ----------------------------------------------------------------------------
   Tài khoản đăng nhập demo (email + mật khẩu chung: "1"):
     - Admin           : mxp1803.admin@gmail.com
     - Bac si (3 tk)   : mxp1803.bacsi1@gmail.com / bacsi2 / bacsi3
     - Le tan (2 tk)   : mxp1803.letan1@gmail.com / letan2
     - Thu ngan        : mxp1803.thungan1@gmail.com
     - Quan ly kho     : mxp1803.quanlykho1@gmail.com

   Mật khẩu "1" đã được băm bằng BCrypt (cost=11, cùng chuẩn với
   BCrypt.Net-Next đang dùng trong dự án). Hash dưới đây GIỐNG NHAU cho
   tất cả tài khoản vì cùng mật khẩu demo "1":
     $2a$11$iXOJctEK0HkgDUaLajgVSu3ySsIKkJD8gcecGdHrjm4/IyS7Xi8oi
============================================================================ */

USE [QuanLyPhongKham_DB]
GO
SET NOCOUNT ON
GO

/* ================== 0. XÓA DỮ LIỆU CŨ VÀ RESET IDENTITY SEEDS ================== */
EXEC sp_MSforeachtable "ALTER TABLE ? NOCHECK CONSTRAINT ALL";
GO

DELETE FROM [dbo].[ChiTietVatTu_Lo];
DELETE FROM [dbo].[ChiTietVatTuPhieuKham];
DELETE FROM [dbo].[ChiTietDonThuoc_Lo];
DELETE FROM [dbo].[ChiTietDonThuoc];
DELETE FROM [dbo].[DonThuoc];
DELETE FROM [dbo].[DichVuYTe];
DELETE FROM [dbo].[ChiTietPhieuKhamICD];
DELETE FROM [dbo].[PhieuKham];
DELETE FROM [dbo].[HoaDon];
DELETE FROM [dbo].[DatLichKham];
DELETE FROM [dbo].[LichLamViec];
DELETE FROM [dbo].[LoVatTu];
DELETE FROM [dbo].[LoThuoc];
DELETE FROM [dbo].[NhaCungCap];
DELETE FROM [dbo].[ChiTietDichVuYTe];
DELETE FROM [dbo].[DanhMucICD];
DELETE FROM [dbo].[DanhMucVatTu];
DELETE FROM [dbo].[DanhMucThuoc];
DELETE FROM [dbo].[BenhNhan];
DELETE FROM [dbo].[NhanVien];
DELETE FROM [dbo].[DanhMucKhoa];
DELETE FROM [dbo].[Users];
DELETE FROM [dbo].[Roles];
GO

DBCC CHECKIDENT ('[dbo].[Roles]', RESEED, 0);
DBCC CHECKIDENT ('[dbo].[Users]', RESEED, 0);
DBCC CHECKIDENT ('[dbo].[NhaCungCap]', RESEED, 0);
DBCC CHECKIDENT ('[dbo].[LichLamViec]', RESEED, 0);
DBCC CHECKIDENT ('[dbo].[DatLichKham]', RESEED, 0);
DBCC CHECKIDENT ('[dbo].[DichVuYTe]', RESEED, 0);
GO

EXEC sp_MSforeachtable "ALTER TABLE ? WITH CHECK CHECK CONSTRAINT ALL";
GO

/* ================== 1. ROLES (5 dong) ================== */
INSERT INTO [dbo].[Roles] ([RoleName]) VALUES
(N'Admin'),
(N'BacSi'),
(N'LeTan'),
(N'ThuNgan'),
(N'QuanLyKhoThuoc');
GO
-- RoleID sinh ra: 1=Admin, 2=BacSi, 3=LeTan, 4=ThuNgan, 5=QuanLyKhoThuoc

/* ================== 2. USERS (8 dong) ================== */
-- Mat khau demo cho tat ca: "1"  (hash BCrypt cost=11)
INSERT INTO [dbo].[Users] ([Username], [PasswordHash], [RoleID], [IsActive]) VALUES
(N'mxp1803.admin@gmail.com',       '$2a$11$iXOJctEK0HkgDUaLajgVSu3ySsIKkJD8gcecGdHrjm4/IyS7Xi8oi', 1, 1),
(N'mxp1803.bacsi1@gmail.com',      '$2a$11$iXOJctEK0HkgDUaLajgVSu3ySsIKkJD8gcecGdHrjm4/IyS7Xi8oi', 2, 1),
(N'mxp1803.bacsi2@gmail.com',      '$2a$11$iXOJctEK0HkgDUaLajgVSu3ySsIKkJD8gcecGdHrjm4/IyS7Xi8oi', 2, 1),
(N'mxp1803.bacsi3@gmail.com',      '$2a$11$iXOJctEK0HkgDUaLajgVSu3ySsIKkJD8gcecGdHrjm4/IyS7Xi8oi', 2, 1),
(N'mxp1803.letan1@gmail.com',      '$2a$11$iXOJctEK0HkgDUaLajgVSu3ySsIKkJD8gcecGdHrjm4/IyS7Xi8oi', 3, 1),
(N'mxp1803.letan2@gmail.com',      '$2a$11$iXOJctEK0HkgDUaLajgVSu3ySsIKkJD8gcecGdHrjm4/IyS7Xi8oi', 3, 1),
(N'mxp1803.thungan1@gmail.com',    '$2a$11$iXOJctEK0HkgDUaLajgVSu3ySsIKkJD8gcecGdHrjm4/IyS7Xi8oi', 4, 1),
(N'mxp1803.quanlykho1@gmail.com',  '$2a$11$iXOJctEK0HkgDUaLajgVSu3ySsIKkJD8gcecGdHrjm4/IyS7Xi8oi', 5, 1);
GO
-- UserID sinh ra: 1..8 theo dung thu tu tren

/* ================== 3. DANH MUC KHOA (5 dong) ================== */
INSERT INTO [dbo].[DanhMucKhoa] ([MaKhoa], [TenKhoa]) VALUES
('KH01', N'Noi tong quat'),
('KH02', N'Ngoai tong quat'),
('KH03', N'Nhi khoa'),
('KH04', N'San phu khoa'),
('KH05', N'Tai Mui Hong');
GO

/* ================== 4. NHAN VIEN (8 dong) ================== */
-- UserID tuong ung: 1=admin,2=bacsi1,3=bacsi2,4=bacsi3,5=letan1,6=letan2,7=thungan1,8=quanlykho1
INSERT INTO [dbo].[NhanVien] ([MaNV], [UserID], [HoTen], [ChuyenMon], [SDT], [Email], [MaKhoa]) VALUES
('NV001', 1, N'Tran Van Quan',   N'Quan tri he thong', '0900000001', 'mxp1803.admin@gmail.com',      NULL),
('NV002', 2, N'Nguyen Van An',   N'Noi tong quat',      '0900000002', 'mxp1803.bacsi1@gmail.com',     'KH01'),
('NV003', 3, N'Le Thi Binh',     N'Ngoai tong quat',    '0900000003', 'mxp1803.bacsi2@gmail.com',     'KH02'),
('NV004', 4, N'Pham Minh Chau',  N'Nhi khoa',           '0900000004', 'mxp1803.bacsi3@gmail.com',     'KH03'),
('NV005', 5, N'Hoang Thi Duyen', N'Le tan',             '0900000005', 'mxp1803.letan1@gmail.com',     NULL),
('NV006', 6, N'Vu Thi Hoa',      N'Le tan',             '0900000006', 'mxp1803.letan2@gmail.com',     NULL),
('NV007', 7, N'Dang Van Khoa',   N'Thu ngan',           '0900000007', 'mxp1803.thungan1@gmail.com',   NULL),
('NV008', 8, N'Bui Thi Lan',     N'Quan ly kho thuoc',  '0900000008', 'mxp1803.quanlykho1@gmail.com', NULL);
GO

/* ================== 5. BENH NHAN (8 dong) ================== */
INSERT INTO [dbo].[BenhNhan] ([MaBN], [HoTen], [NgaySinh], [GioiTinh], [SDT], [DiaChi], [TienSuBenh]) VALUES
('BN001', N'Nguyen Thi Mai',  '1990-05-12', N'Nu',  '0901234567', N'12 Nguyen Trai, Q.1, TP.HCM',        N'Khong co tien su dac biet'),
('BN002', N'Tran Van Hung',   '1985-11-23', N'Nam', '0912345678', N'45 Le Loi, Q.3, TP.HCM',             N'Tang huyet ap'),
('BN003', N'Le Thi Hong',     '2001-02-08', N'Nu',  '0987654321', N'78 Cach Mang Thang 8, Q.10, TP.HCM', N'Di ung Penicillin'),
('BN004', N'Pham Van Duc',    '1975-09-30', N'Nam', '0977888999', N'22 Dien Bien Phu, Binh Thanh, TP.HCM', N'Dai thao duong type 2'),
('BN005', N'Do Thi Kim',      '1995-07-19', N'Nu',  '0933222111', N'9 Truong Chinh, Tan Binh, TP.HCM',   N'Khong'),
('BN006', N'Vu Minh Tuan',    '2010-01-15', N'Nam', '0966555444', N'56 Phan Xich Long, Phu Nhuan, TP.HCM', N'Hen suyen'),
('BN007', N'Ngo Thi Lan',     '1988-12-03', N'Nu',  '0944333222', N'31 Nguyen Oanh, Go Vap, TP.HCM',     N'Khong'),
('BN008', N'Bui Van Nam',     '1960-04-25', N'Nam', '0911222333', N'14 Hoang Van Thu, Tan Binh, TP.HCM', N'Tang huyet ap, viem khop');
GO

/* ================== 6. DANH MUC THUOC (8 dong) ================== */
INSERT INTO [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES
('TH001', N'Paracetamol 500mg', N'Paracetamol', N'Vien', 1),
('TH002', N'Amoxicillin 500mg', N'Amoxicillin', N'Vien', 1),
('TH003', N'Vitamin C 500mg',   N'Ascorbic acid', N'Vien', 1),
('TH004', N'Omeprazole 20mg',   N'Omeprazole', N'Vien', 1),
('TH005', N'Cetirizine 10mg',   N'Cetirizine', N'Vien', 1),
('TH006', N'Salbutamol xit',    N'Salbutamol', N'Chai', 1),
('TH007', N'Metformin 500mg',   N'Metformin', N'Vien', 1),
('TH008', N'Amlodipine 5mg',    N'Amlodipine', N'Vien', 1);
GO

/* ================== 7. DANH MUC VAT TU (6 dong) ================== */
INSERT INTO [dbo].[DanhMucVatTu] ([MaVatTu], [TenVatTu], [QuyCach], [DonViTinh], [IsActive]) VALUES
('VT001', N'Bom kim tiem 5ml',      N'Hop 100 cai', N'Cai',  1),
('VT002', N'Bang gac y te',         N'Cuon 5m',     N'Cuon', 1),
('VT003', N'Gang tay y te',         N'Hop 100 cai', N'Doi',  1),
('VT004', N'Bong y te',             N'Goi 500g',    N'Goi',  1),
('VT005', N'Khau trang y te',       N'Hop 50 cai',  N'Cai',  1),
('VT006', N'Con sat trung 90 do',   N'Chai 500ml',  N'Chai', 1);
GO

/* ================== 8. DANH MUC ICD (8 dong) ================== */
INSERT INTO [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES
('J00',    N'Viem mui hong cap (cam lanh thong thuong)'),
('I10',    N'Tang huyet ap vo can (nguyen phat)'),
('E11',    N'Dai thao duong type 2'),
('J45',    N'Hen phe quan'),
('K29.7',  N'Viem da day, khong xac dinh'),
('N39.0',  N'Nhiem khuan duong tiet nieu, vi tri khong xac dinh'),
('M54.5',  N'Dau that lung'),
('A09',    N'Tieu chay va viem da day ruot nghi do nhiem trung');
GO

/* ================== 9. CHI TIET DICH VU Y TE - danh muc dich vu (6 dong) ================== */
INSERT INTO [dbo].[ChiTietDichVuYTe] ([MaDV], [TenDV], [GiaTien], [TrangThai]) VALUES
('DV001', N'Kham tong quat',            150000, 1),
('DV002', N'Sieu am bung tong quat',    250000, 1),
('DV003', N'Xet nghiem cong thuc mau',  120000, 1),
('DV004', N'Chup X-quang nguc thang',   200000, 1),
('DV005', N'Do dien tim (ECG)',         100000, 1),
('DV006', N'Noi soi Tai Mui Hong',      180000, 1);
GO

/* ================== 10. NHA CUNG CAP (5 dong, IDENTITY) ================== */
INSERT INTO [dbo].[NhaCungCap] ([TenNCC], [SDT], [DiaChi]) VALUES
(N'Cong ty CP Duoc Hau Giang',            '02923891433', N'288 Bis Nguyen Van Cu, Can Tho'),
(N'Cong ty CP Traphaco',                  '02438533535', N'75 Yen Ninh, Ba Dinh, Ha Noi'),
(N'Cong ty TNHH Zuellig Pharma Viet Nam', '02838223344', N'20 Truong Son, Tan Binh, TP.HCM'),
(N'Cong ty CP Thiet bi Y te Viet Nhat',   '02839252525', N'125 Cach Mang Thang 8, TP.HCM'),
(N'Cong ty CP Duoc pham Domesco',         '02773851270', N'66 Quoc lo 30, Dong Thap');
GO
-- MaNCC sinh ra: 1=Duoc Hau Giang, 2=Traphaco, 3=Zuellig Pharma, 4=Thiet bi Y te Viet Nhat, 5=Domesco

/* ================== 11. LO THUOC (8 dong) ================== */
INSERT INTO [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES
('LO-TH-001', 'TH001', 1, 1000, 990, 500,  1000, '2026-01-10', '2028-01-10'),
('LO-TH-002', 'TH002', 2, 500,  486, 1200, 2500, '2026-02-15', '2027-08-15'),
('LO-TH-003', 'TH003', 1, 800,  790, 300,  700,  '2026-03-01', '2028-03-01'),
('LO-TH-004', 'TH004', 3, 600,  586, 800,  1800, '2026-01-20', '2027-12-20'),
('LO-TH-005', 'TH005', 2, 700,  700, 400,  900,  '2026-02-10', '2027-11-10'),
('LO-TH-006', 'TH006', 3, 300,  299, 15000,25000,'2026-04-01', '2027-10-01'),
('LO-TH-007', 'TH007', 5, 900,  870, 600,  1400, '2026-01-05', '2028-01-05'),
('LO-TH-008', 'TH008', 5, 500,  470, 900,  2000, '2026-03-15', '2028-03-15');
GO

/* ================== 12. LO VAT TU (6 dong) ================== */
INSERT INTO [dbo].[LoVatTu] ([MaLo], [MaVatTu], [MaNcc], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES
('LO-VT-001', 'VT001', 4, 200,  197, 50000, 70000, '2026-01-01', '2029-01-01'),
('LO-VT-002', 'VT002', 4, 300,  299, 15000, 20000, '2026-02-01', '2028-02-01'),
('LO-VT-003', 'VT003', 3, 500,  497, 80000, 100000,'2026-01-15', '2028-01-15'),
('LO-VT-004', 'VT004', 1, 400,  400, 10000, 15000, '2026-03-01', '2029-03-01'),
('LO-VT-005', 'VT005', 3, 1000, 999, 60000, 90000, '2026-02-20', '2027-02-20'),
('LO-VT-006', 'VT006', 5, 250,  249, 25000, 35000, '2026-01-10', '2028-01-10');
GO

/* ================== 13. LICH LAM VIEC (8 dong, IDENTITY) ================== */
INSERT INTO [dbo].[LichLamViec] ([MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES
('NV002', '2026-08-17', 'Sang',  N'Phong 101', NULL,             '2026-08-10'),
('NV002', '2026-08-19', 'Chieu', N'Phong 101', NULL,             '2026-08-10'),
('NV003', '2026-08-17', 'Chieu', N'Phong 102', NULL,             '2026-08-11'),
('NV003', '2026-08-20', 'Sang',  N'Phong 102', NULL,             '2026-08-11'),
('NV004', '2026-08-18', 'Sang',  N'Phong 103', N'Kham nhi',      '2026-08-12'),
('NV004', '2026-08-21', 'Chieu', N'Phong 103', NULL,             '2026-08-12'),
('NV002', '2026-08-24', 'Sang',  N'Phong 101', NULL,             '2026-08-15'),
('NV003', '2026-08-25', 'Sang',  N'Phong 102', NULL,             '2026-08-15');
GO

/* ================== 14. DAT LICH KHAM (6 dong, IDENTITY) ================== */
INSERT INTO [dbo].[DatLichKham] ([HoTenKhach], [SDT], [NgayHen], [YeuCauKham], [TrangThai], [MaNV], [CaHen]) VALUES
(N'Nguyen Thi Thu',  '0909111222', '2026-08-20', N'Kham tong quat dinh ky', 'ChoXacNhan', NULL,    'Sang'),
(N'Tran Van Long',   '0918222333', '2026-08-21', N'Dau bung vai ngay',      'DaXacNhan',  'NV002', 'Chieu'),
(N'Le Van Phuc',     '0922333444', '2026-08-18', N'Ho, sot nhe',            'DaTiepNhan', 'NV004', 'Sang'),
(N'Pham Thi Yen',    '0933444555', '2026-08-22', N'Kham thai dinh ky',      'ChoXacNhan', NULL,    'Sang'),
(N'Hoang Van Son',   '0944555666', '2026-08-15', N'Dau lung',               'DaHuy',      'NV003', 'Chieu'),
(N'Dang Thi Thao',   '0955666777', '2026-08-23', N'Kham tai mui hong',      'ChoXacNhan', NULL,    'Chieu');
GO

/* ================== 15. PHIEU KHAM (8 dong) ================== */
-- TrangThaiKham: 0 = Cho kham, 1 = Dang kham, 2 = Hoan tat
INSERT INTO [dbo].[PhieuKham] ([MaPhieu], [MaBN], [NgayKham], [Mach], [NhietDo], [HuyetAp], [CanNang], [ChieuCao], [KetLuan], [TrangThaiKham], [LyDoKham], [MaNV]) VALUES
('PK001', 'BN001', '2026-08-10 08:30', 78, 36.8, '120/80', 55.5, 160, N'Cam cum thong thuong, ke don thuoc dieu tri trieu chung', 2, N'Ho, so mui, dau hong', 'NV002'),
('PK002', 'BN002', '2026-08-11 09:00', 82, 36.6, '150/95', 72,   170, N'Tang huyet ap, can theo doi va dung thuoc deu dan',       2, N'Dau dau, chong mat',   'NV002'),
('PK003', 'BN003', '2026-08-11 10:15', 76, 37.0, '110/70', 48,   158, N'Viem da day nhe, ke thuoc va tu van che do an',           2, N'Dau bung vung thuong vi', 'NV003'),
('PK004', 'BN004', '2026-08-12 08:00', 80, 36.7, '130/85', 68,   165, N'Dai thao duong type 2, dieu chinh lieu Metformin',        2, N'Tai kham dinh ky dai thao duong', 'NV002'),
('PK005', 'BN005', '2026-08-13 14:00', 88, 38.2, '115/75', 52,   162, N'Viem hong cap, ke khang sinh va ha sot',                  2, N'Sot, dau hong',        'NV004'),
('PK006', 'BN006', '2026-08-14 09:30', 95, 37.1, '100/65', 30,   135, N'Con hen nhe, huong dan su dung thuoc xit',                2, N'Kho tho, ho ve dem',   'NV004'),
('PK007', 'BN007', '2026-08-14 15:00', 74, 36.5, '118/76', 54,   159, NULL,                                                       0, N'Dau bung duoi, chua ro nguyen nhan', 'NV003'),
('PK008', 'BN008', '2026-08-15 08:45', 84, 36.9, '145/90', 75,   168, NULL,                                                       1, N'Dau khop goi, tang huyet ap tai kham', 'NV002');
GO

/* ================== 16. CHI TIET PHIEU KHAM ICD (6 dong) ================== */
INSERT INTO [dbo].[ChiTietPhieuKhamICD] ([MaPhieu], [MaICD]) VALUES
('PK001', 'J00'),
('PK002', 'I10'),
('PK003', 'K29.7'),
('PK004', 'E11'),
('PK005', 'J00'),
('PK006', 'J45');
GO

/* ================== 17. DICH VU Y TE - da thuc hien (6 dong, IDENTITY) ================== */
-- TrangThaiDichVu: 0 = chua co ket qua, 1 = da co ket qua
INSERT INTO [dbo].[DichVuYTe] ([MaPhieu], [MaDV], [KetQua], [TrangThaiDichVu]) VALUES
('PK001', 'DV001', N'Binh thuong',                                   1),
('PK002', 'DV005', N'Nhip tim deu, khong phat hien bat thuong',      1),
('PK003', 'DV002', N'Niem mac da day viem nhe',                      1),
('PK004', 'DV003', N'Duong huyet cao hon binh thuong',               1),
('PK005', 'DV001', N'Hong do, amidan sung nhe',                      1),
('PK006', 'DV004', N'Phoi thong khi ro, khong tham nhiem',           1);
GO

/* ================== 18. DON THUOC (6 dong) ================== */
INSERT INTO [dbo].[DonThuoc] ([MaDonThuoc], [MaPhieu], [NgayKeDon], [LoiDan]) VALUES
('DT001', 'PK001', '2026-08-10', N'Uong thuoc sau an, tai kham neu khong do sau 3 ngay'),
('DT002', 'PK002', '2026-08-11', N'Uong thuoc deu dan theo gio, han che muoi'),
('DT003', 'PK003', '2026-08-11', N'Uong truoc an 30 phut, tranh do cay nong'),
('DT004', 'PK004', '2026-08-12', N'Uong thuoc dung lieu, tai kham sau 1 thang'),
('DT005', 'PK005', '2026-08-13', N'Uong du lieu khang sinh, tai kham neu sot keo dai'),
('DT006', 'PK006', '2026-08-14', N'Xit thuoc khi len con kho tho, tai kham sau 1 tuan');
GO

/* ================== 19. CHI TIET DON THUOC (7 dong) ================== */
INSERT INTO [dbo].[ChiTietDonThuoc] ([MaDonThuoc], [MaThuoc], [SoLuong], [CachDung], [TrangThaiPhatThuoc]) VALUES
('DT001', 'TH001', 10, N'Uong 1 vien khi sot, cach 6 gio',        1),
('DT001', 'TH003', 10, N'Uong 1 vien/ngay',                       1),
('DT002', 'TH008', 30, N'Uong 1 vien/ngay vao buoi sang',         1),
('DT003', 'TH004', 14, N'Uong 1 vien truoc an sang',              1),
('DT004', 'TH007', 30, N'Uong 1 vien x 2 lan/ngay sau an',        1),
('DT005', 'TH002', 14, N'Uong 1 vien x 2 lan/ngay',               1),
('DT006', 'TH006', 1,  N'Xit 2 nhat khi kho tho',                 0);
GO

/* ================== 20. CHI TIET DON THUOC - LO (7 dong) ================== */
INSERT INTO [dbo].[ChiTietDonThuoc_Lo] ([MaDonThuoc], [MaThuoc], [MaLo], [SoLuongTru]) VALUES
('DT001', 'TH001', 'LO-TH-001', 10),
('DT001', 'TH003', 'LO-TH-003', 10),
('DT002', 'TH008', 'LO-TH-008', 30),
('DT003', 'TH004', 'LO-TH-004', 14),
('DT004', 'TH007', 'LO-TH-007', 30),
('DT005', 'TH002', 'LO-TH-002', 14),
('DT006', 'TH006', 'LO-TH-006', 1);
GO

/* ================== 21. CHI TIET VAT TU PHIEU KHAM (6 dong) ================== */
INSERT INTO [dbo].[ChiTietVatTuPhieuKham] ([MaPhieu], [MaVatTu], [SoLuong], [DonGia]) VALUES
('PK001', 'VT001', 1, 3000),
('PK002', 'VT003', 2, 2000),
('PK003', 'VT002', 1, 15000),
('PK004', 'VT001', 1, 3000),
('PK005', 'VT005', 1, 5000),
('PK006', 'VT006', 1, 20000);
GO

/* ================== 22. CHI TIET VAT TU - LO (6 dong) ================== */
INSERT INTO [dbo].[ChiTietVatTu_Lo] ([MaPhieu], [MaVatTu], [MaLo], [SoLuongTru]) VALUES
('PK001', 'VT001', 'LO-VT-001', 1),
('PK002', 'VT003', 'LO-VT-003', 2),
('PK003', 'VT002', 'LO-VT-002', 1),
('PK004', 'VT001', 'LO-VT-001', 1),
('PK005', 'VT005', 'LO-VT-005', 1),
('PK006', 'VT006', 'LO-VT-006', 1);
GO

/* ================== 23. HOA DON (6 dong) ================== */
-- TrangThaiThanhToan: 0 = chua thanh toan, 1 = da thanh toan
INSERT INTO [dbo].[HoaDon] ([MaHoaDon], [MaPhieu], [NgayThanhToan], [TongTienDichVu], [TongTienThuoc], [ThanhTien], [TrangThaiThanhToan], [MaNV], [TongTienVatTu], [PhuongThucTT]) VALUES
('HD001', 'PK001', '2026-08-10', 150000, 8000,  161000, 1, 'NV007', 3000,  N'Tien mat'),
('HD002', 'PK002', '2026-08-11', 100000, 60000, 164000, 1, 'NV007', 4000,  N'Chuyen khoan'),
('HD003', 'PK003', '2026-08-11', 250000, 25200, 290200, 1, 'NV007', 15000, N'Tien mat'),
('HD004', 'PK004', '2026-08-12', 120000, 42000, 165000, 1, 'NV007', 3000,  N'Tien mat'),
('HD005', 'PK005', '2026-08-13', 150000, 35000, 190000, 1, 'NV007', 5000,  N'Tien mat'),
('HD006', 'PK006', '2026-08-14', 200000, 25000, 245000, 0, 'NV007', 20000, N'Chuyen khoan');
GO

PRINT N'Da chen xong du lieu mau cho QuanLyPhongKham_DB.';
GO
