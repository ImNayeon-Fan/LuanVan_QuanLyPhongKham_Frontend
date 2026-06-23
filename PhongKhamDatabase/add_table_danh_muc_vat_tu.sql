USE QuanLyPhongKham_DB;
GO

IF OBJECT_ID('DanhMucVatTu', 'U') IS NOT NULL
    DROP TABLE DanhMucVatTu;
GO

CREATE TABLE DanhMucVatTu (
    MaVatTu VARCHAR(20) PRIMARY KEY,
    TenVatTu NVARCHAR(255) NOT NULL,
    QuyCach NVARCHAR(255) NULL,
    DonViTinh NVARCHAR(50) NOT NULL,
    IsActive BIT NOT NULL DEFAULT 1
);
GO

-- Nap du lieu mau ban dau
INSERT INTO DanhMucVatTu (MaVatTu, TenVatTu, QuyCach, DonViTinh, IsActive) VALUES 
('VT001', N'Găng tay y tế có bột', N'Hộp 100 cái (size M)', N'Hộp', 1),
('VT002', N'Băng thun cuộn y tế', N'Cuộn 10cm x 5m', N'Cuộn', 1),
('VT003', N'Kim tiêm dùng một lần 5ml', N'Hộp 100 cây (Vinahankook)', N'Hộp', 1),
('VT004', N'Bông gòn y tế kháng khuẩn', N'Gói 500g', N'Gói', 1),
('VT005', N'Cồn sát trùng 70 độ', N'Chai 500ml', N'Chai', 1),
('VT006', N'Khẩu trang y tế 4 lớp', N'Hộp 50 cái', N'Hộp', 1);
GO
