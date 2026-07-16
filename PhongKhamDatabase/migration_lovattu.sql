-- migration_lovattu.sql
-- Thêm bảng LoVatTu để quản lý nhập kho và lô vật tư y tế

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

    -- Thêm dữ liệu mẫu ban đầu trùng khớp với mock data trên Frontend để test
    INSERT INTO LoVatTu (MaLo, MaVatTu, MaNcc, SoLuongNhap, SoLuongTon, GiaNhap, GiaBan, NgaySanXuat, HanSuDung)
    VALUES 
    ('LVT26001', 'VT001', 1, 2000, 1800, 1500, 3000, '2026-01-05', '2029-01-05'),
    ('LVT26002', 'VT002', 2, 5000, 5000, 800, 1500, '2025-12-10', '2028-12-10'),
    ('LVT26003', 'VT003', 1, 1000, 200, 12000, 20000, '2026-02-15', '2027-02-15'),
    ('LVT26004', 'VT004', 3, 800, 0, 6000, 10000, '2025-05-20', '2026-05-20');
    
    PRINT 'Đã tạo thành công bảng LoVatTu và thêm dữ liệu mẫu!';
END
ELSE
BEGIN
    PRINT 'Bảng LoVatTu đã tồn tại trong Database!';
END
