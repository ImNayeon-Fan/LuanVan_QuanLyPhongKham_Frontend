USE [QuanLyPhongKham_DB]
GO

-- Xoá toàn bộ lịch làm việc cũ của tuần 03/08/2026 - 09/08/2026
DELETE FROM [dbo].[LichLamViec] 
WHERE NgayLamViec >= '2026-08-03' AND NgayLamViec <= '2026-08-09';
GO

-- Thêm lịch trực đầy đủ cho tuần này (không điền phòng khám, chỉ dùng 8 Bác sĩ thật trong CSDL)
-- KHOA01 (Nội tổng quát): NV003, NV005
-- KHOA02 (Tim mạch):      NV006, NV007
-- KHOA03 (Nhi khoa):      NV008, NV009
-- KHOA04 (Tai Mũi Họng):  NV010, NV011

INSERT INTO [dbo].[LichLamViec] ([MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES
-- === THỨ HAI (03/08/2026) ===
('NV003', '2026-08-03', 'Sang',  NULL, N'Khám Nội tổng quát', GETDATE()),
('NV006', '2026-08-03', 'Sang',  NULL, N'Khám Tim mạch',      GETDATE()),
('NV008', '2026-08-03', 'Sang',  NULL, N'Khám Nhi khoa',       GETDATE()),
('NV010', '2026-08-03', 'Sang',  NULL, N'Khám Tai Mũi Họng',   GETDATE()),
('NV005', '2026-08-03', 'Chieu', NULL, N'Khám Nội tổng quát', GETDATE()),
('NV007', '2026-08-03', 'Chieu', NULL, N'Khám Tim mạch',      GETDATE()),
('NV009', '2026-08-03', 'Chieu', NULL, N'Khám Nhi khoa',       GETDATE()),
('NV011', '2026-08-03', 'Chieu', NULL, N'Khám Tai Mũi Họng',   GETDATE()),

-- === THỨ BA (04/08/2026) ===
('NV005', '2026-08-04', 'Sang',  NULL, N'Khám Nội tổng quát', GETDATE()),
('NV007', '2026-08-04', 'Sang',  NULL, N'Khám Tim mạch',      GETDATE()),
('NV009', '2026-08-04', 'Sang',  NULL, N'Khám Nhi khoa',       GETDATE()),
('NV011', '2026-08-04', 'Sang',  NULL, N'Khám Tai Mũi Họng',   GETDATE()),
('NV003', '2026-08-04', 'Chieu', NULL, N'Khám Nội tổng quát', GETDATE()),
('NV006', '2026-08-04', 'Chieu', NULL, N'Khám Tim mạch',      GETDATE()),
('NV008', '2026-08-04', 'Chieu', NULL, N'Khám Nhi khoa',       GETDATE()),
('NV010', '2026-08-04', 'Chieu', NULL, N'Khám Tai Mũi Họng',   GETDATE()),

-- === THỨ TƯ (05/08/2026) ===
('NV003', '2026-08-05', 'Sang',  NULL, N'Khám Nội tổng quát', GETDATE()),
('NV006', '2026-08-05', 'Sang',  NULL, N'Khám Tim mạch',      GETDATE()),
('NV008', '2026-08-05', 'Sang',  NULL, N'Khám Nhi khoa',       GETDATE()),
('NV010', '2026-08-05', 'Sang',  NULL, N'Khám Tai Mũi Họng',   GETDATE()),
('NV005', '2026-08-05', 'Chieu', NULL, N'Khám Nội tổng quát', GETDATE()),
('NV007', '2026-08-05', 'Chieu', NULL, N'Khám Tim mạch',      GETDATE()),
('NV009', '2026-08-05', 'Chieu', NULL, N'Khám Nhi khoa',       GETDATE()),
('NV011', '2026-08-05', 'Chieu', NULL, N'Khám Tai Mũi Họng',   GETDATE()),

-- === THỨ NĂM (06/08/2026) ===
('NV005', '2026-08-06', 'Sang',  NULL, N'Khám Nội tổng quát', GETDATE()),
('NV007', '2026-08-06', 'Sang',  NULL, N'Khám Tim mạch',      GETDATE()),
('NV009', '2026-08-06', 'Sang',  NULL, N'Khám Nhi khoa',       GETDATE()),
('NV011', '2026-08-06', 'Sang',  NULL, N'Khám Tai Mũi Họng',   GETDATE()),
('NV003', '2026-08-06', 'Chieu', NULL, N'Khám Nội tổng quát', GETDATE()),
('NV006', '2026-08-06', 'Chieu', NULL, N'Khám Tim mạch',      GETDATE()),
('NV008', '2026-08-06', 'Chieu', NULL, N'Khám Nhi khoa',       GETDATE()),
('NV010', '2026-08-06', 'Chieu', NULL, N'Khám Tai Mũi Họng',   GETDATE()),

-- === THỨ SÁU (07/08/2026) ===
('NV003', '2026-08-07', 'Sang',  NULL, N'Khám Nội tổng quát', GETDATE()),
('NV006', '2026-08-07', 'Sang',  NULL, N'Khám Tim mạch',      GETDATE()),
('NV008', '2026-08-07', 'Sang',  NULL, N'Khám Nhi khoa',       GETDATE()),
('NV010', '2026-08-07', 'Sang',  NULL, N'Khám Tai Mũi Họng',   GETDATE()),
('NV005', '2026-08-07', 'Chieu', NULL, N'Khám Nội tổng quát', GETDATE()),
('NV007', '2026-08-07', 'Chieu', NULL, N'Khám Tim mạch',      GETDATE()),
('NV009', '2026-08-07', 'Chieu', NULL, N'Khám Nhi khoa',       GETDATE()),
('NV011', '2026-08-07', 'Chieu', NULL, N'Khám Tai Mũi Họng',   GETDATE()),

-- === THỨ BẢY (08/08/2026) ===
('NV005', '2026-08-08', 'Sang',  NULL, N'Khám Nội tổng quát', GETDATE()),
('NV007', '2026-08-08', 'Sang',  NULL, N'Khám Tim mạch',      GETDATE()),
('NV009', '2026-08-08', 'Sang',  NULL, N'Khám Nhi khoa',       GETDATE()),
('NV011', '2026-08-08', 'Sang',  NULL, N'Khám Tai Mũi Họng',   GETDATE()),
('NV003', '2026-08-08', 'Chieu', NULL, N'Khám Nội tổng quát', GETDATE()),
('NV006', '2026-08-08', 'Chieu', NULL, N'Khám Tim mạch',      GETDATE()),
('NV008', '2026-08-08', 'Chieu', NULL, N'Khám Nhi khoa',       GETDATE()),
('NV010', '2026-08-08', 'Chieu', NULL, N'Khám Tai Mũi Họng',   GETDATE()),

-- === CHỦ NHẬT (09/08/2026) ===
('NV003', '2026-08-09', 'Sang',  NULL, N'Khám Nội tổng quát', GETDATE()),
('NV006', '2026-08-09', 'Sang',  NULL, N'Khám Tim mạch',      GETDATE()),
('NV008', '2026-08-09', 'Sang',  NULL, N'Khám Nhi khoa',       GETDATE()),
('NV010', '2026-08-09', 'Sang',  NULL, N'Khám Tai Mũi Họng',   GETDATE()),
('NV005', '2026-08-09', 'Chieu', NULL, N'Khám Nội tổng quát', GETDATE()),
('NV007', '2026-08-09', 'Chieu', NULL, N'Khám Tim mạch',      GETDATE()),
('NV009', '2026-08-09', 'Chieu', NULL, N'Khám Nhi khoa',       GETDATE()),
('NV011', '2026-08-09', 'Chieu', NULL, N'Khám Tai Mũi Họng',   GETDATE());
GO
