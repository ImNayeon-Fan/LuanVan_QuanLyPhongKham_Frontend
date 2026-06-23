USE QuanLyPhongKham_DB;
GO

-- Thêm cột IsActive vào bảng DanhMucThuoc nếu chưa tồn tại
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[DanhMucThuoc]') AND name = 'IsActive')
BEGIN
    ALTER TABLE DanhMucThuoc ADD IsActive BIT NOT NULL DEFAULT 1;
    PRINT 'Da them cot IsActive vao bang DanhMucThuoc!';
END
ELSE
BEGIN
    PRINT 'Cot IsActive da ton tai trong bang DanhMucThuoc!';
END
GO
