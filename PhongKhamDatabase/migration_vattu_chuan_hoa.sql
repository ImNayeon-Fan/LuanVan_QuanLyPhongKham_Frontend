-- PhongKhamDatabase/migration_vattu_chuan_hoa.sql
-- Chuẩn hóa sơ đồ quan hệ của vật tư y tế giống như thuốc:
-- Danh mục vật tư liên kết với Lô vật tư, Lô vật tư liên kết với Nhà cung cấp.

-- 1. Xóa các cột MaNcc và DonGia thừa trong DanhMucVatTu (đã được tạo ở file migration_vattu_ncc.sql cũ)
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_DanhMucVatTu_NhaCungCap')
BEGIN
    ALTER TABLE DanhMucVatTu DROP CONSTRAINT FK_DanhMucVatTu_NhaCungCap;
END

IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('DanhMucVatTu') AND name = 'MaNcc')
BEGIN
    ALTER TABLE DanhMucVatTu DROP COLUMN MaNcc;
END

IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('DanhMucVatTu') AND name = 'DonGia')
BEGIN
    ALTER TABLE DanhMucVatTu DROP COLUMN DonGia;
END

-- 2. Đảm bảo bảng LoVatTu tồn tại và liên kết đúng logic
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'LoVatTu')
BEGIN
    CREATE TABLE LoVatTu (
        MaLo varchar(50) NOT NULL,
        MaVatTu varchar(20) NOT NULL,
        MaNcc int NOT NULL,
        SoLuongNhap int NOT NULL,
        SoLuongTon int NOT NULL,
        GiaNhap decimal(18, 2) NOT NULL,
        GiaBan decimal(18, 2) NOT NULL,
        NgaySanXuat date NULL,
        HanSuDung date NOT NULL,
        CONSTRAINT PK_LoVatTu PRIMARY KEY (MaLo),
        CONSTRAINT FK_LoVatTu_DanhMucVatTu FOREIGN KEY (MaVatTu) REFERENCES DanhMucVatTu(MaVatTu),
        CONSTRAINT FK_LoVatTu_NhaCungCap FOREIGN KEY (MaNcc) REFERENCES NhaCungCap(MaNcc)
    );

    -- Thêm dữ liệu mẫu ban đầu để kiểm thử
    INSERT INTO LoVatTu (MaLo, MaVatTu, MaNcc, SoLuongNhap, SoLuongTon, GiaNhap, GiaBan, NgaySanXuat, HanSuDung)
    VALUES 
    ('LVT26001', 'VT001', 1, 2000, 1800, 1500, 3000, '2026-01-05', '2029-01-05'),
    ('LVT26002', 'VT002', 2, 5000, 5000, 800, 1500, '2025-12-10', '2028-12-10'),
    ('LVT26003', 'VT003', 1, 1000, 200, 12000, 20000, '2026-02-15', '2027-02-15'),
    ('LVT26004', 'VT004', 3, 800, 0, 6000, 10000, '2025-05-20', '2026-05-20');
    
    PRINT 'Đã tạo thành công bảng LoVatTu!';
END
ELSE
BEGIN
    PRINT 'Bảng LoVatTu đã tồn tại sẵn!';
END
