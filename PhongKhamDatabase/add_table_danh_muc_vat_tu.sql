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

-- Nap du lieu mau ban dau (30 loai vat tu y te da dang, tranh loi font chu voi N'...')
INSERT INTO DanhMucVatTu (MaVatTu, TenVatTu, QuyCach, DonViTinh, IsActive) VALUES 
('VT001', N'Găng tay y tế không bột (Size M)', N'Hộp 100 cái', N'Hộp', 1),
('VT002', N'Băng thun cuộn y tế', N'Cuộn 10cm x 5m', N'Cuộn', 1),
('VT003', N'Kim tiêm dùng một lần 5ml', N'Hộp 100 cây (Vinahankook)', N'Hộp', 1),
('VT004', N'Bông gòn y tế kháng khuẩn', N'Gói 500g', N'Gói', 1),
('VT005', N'Cồn sát trùng 70 độ', N'Chai 500ml', N'Chai', 1),
('VT006', N'Khẩu trang y tế 4 lớp', N'Hộp 50 cái', N'Hộp', 1),
('VT007', N'Kim tiêm dùng một lần 3ml', N'Hộp 100 cây (Vinahankook)', N'Hộp', 1),
('VT008', N'Nước muối sinh lý NaCl 0.9%', N'Chai 500ml', N'Chai', 1),
('VT009', N'Băng cá nhân vô trùng Urgosteril', N'Hộp 50 miếng', N'Hộp', 1),
('VT010', N'Gạc phẫu thuật tiệt trùng', N'Gói 10 miếng (8x10cm)', N'Gói', 1),
('VT011', N'Dây truyền dịch vô trùng', N'Bịch 1 bộ', N'Bộ', 1),
('VT012', N'Que đè lưỡi gỗ tiệt trùng', N'Hộp 100 cái', N'Hộp', 1),
('VT013', N'Chỉ khâu phẫu thuật tự tiêu 3/0', N'Hộp 12 tép (Vycril)', N'Hộp', 1),
('VT014', N'Cồn đỏ Povidine 10%', N'Chai 90ml', N'Chai', 1),
('VT015', N'Bơm tiêm dùng một lần 10ml', N'Hộp 100 cây (Vinahankook)', N'Hộp', 1),
('VT016', N'Băng keo cuộn giấy y tế', N'Cuộn 2.5cm x 5m', N'Cuộn', 1),
('VT017', N'Khăn ướt cồn Alcohol Pads', N'Hộp 100 miếng', N'Hộp', 1),
('VT018', N'Ống lấy máu chân không EDTA', N'Khay 100 ống (xanh dương)', N'Khay', 1),
('VT019', N'Ống lấy máu chân không Serum', N'Khay 100 ống (đỏ)', N'Khay', 1),
('VT020', N'Que thử thai nhanh (Quickstrip)', N'Hộp 1 cái', N'Hộp', 1),
('VT021', N'Gel siêu âm y tế', N'Bình 5 lít', N'Bình', 1),
('VT022', N'Mũ phẫu thuật con sâu', N'Bịch 100 cái', N'Bịch', 1),
('VT023', N'Tấm lót y tế chống thấm', N'Gói 10 miếng (60x90cm)', N'Gói', 1),
('VT024', N'Ống thông tiểu Foley 2 nhánh', N'Sợi', N'Sợi', 1),
('VT025', N'Kim cánh bướm lấy máu 23G', N'Hộp 100 cái', N'Hộp', 1),
('VT026', N'Nhiệt kế điện tử hồng ngoại', N'Cái (Microlife)', N'Cái', 1),
('VT027', N'Dung dịch sát khuẩn tay nhanh', N'Chai 500ml (vòi nhấn)', N'Chai', 1),
('VT028', N'Băng cuộn y tế (băng gạc)', N'Cuộn 0.08m x 2m', N'Cuộn', 1),
('VT029', N'Kim châm cứu tiệt trùng', N'Hộp 100 cây (Khánh Phong)', N'Hộp', 1),
('VT030', N'Túi đựng rác thải y tế lây nhiễm', N'Xấp 1kg (màu vàng)', N'Xấp', 1);
GO
