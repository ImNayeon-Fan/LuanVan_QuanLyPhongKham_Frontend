-- PhongKhamDatabase/migration_hoadon_phuongthuctt.sql
-- Thêm cột PhuongThucTT vào bảng HoaDon

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('HoaDon') AND name = 'PhuongThucTT')
BEGIN
    ALTER TABLE HoaDon ADD PhuongThucTT nvarchar(20) NULL;
    PRINT 'Đã thêm cột PhuongThucTT vào bảng HoaDon thành công!';
END
ELSE
BEGIN
    PRINT 'Cột PhuongThucTT đã tồn tại trong bảng HoaDon!';
END
