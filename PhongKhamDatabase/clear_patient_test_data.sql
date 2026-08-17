USE [QuanLyPhongKham_DB]
GO
SET NOCOUNT ON
GO

-- Tắt tất cả ràng buộc khóa ngoại tạm thời
EXEC sp_MSforeachtable "ALTER TABLE ? NOCHECK CONSTRAINT ALL";
GO

-- Xóa dữ liệu các bảng liên quan bệnh nhân, phiếu khám, lịch đặt, đơn thuốc và hóa đơn
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
DELETE FROM [dbo].[BenhNhan];
GO

-- Reset mã tự tăng (Identity) cho DatLichKham và DichVuYTe
DBCC CHECKIDENT ('[dbo].[DatLichKham]', RESEED, 0);
DBCC CHECKIDENT ('[dbo].[DichVuYTe]', RESEED, 0);
GO

-- Bật lại tất cả ràng buộc khóa ngoại
EXEC sp_MSforeachtable "ALTER TABLE ? WITH CHECK CHECK CONSTRAINT ALL";
GO

PRINT N'Da xoa sach toan bo du lieu benh nhan va luot kham cu.';
GO
