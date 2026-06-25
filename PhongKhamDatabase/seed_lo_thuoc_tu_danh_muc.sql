-- Script tự động sinh lô thuốc nhập kho từ danh mục thuốc có sẵn
USE QuanLyPhongKham_DB;
GO

-- 1. Xóa hết dữ liệu lô cũ để làm mới hoàn toàn
DELETE FROM LoThuoc;
GO

-- 2. Thêm nhà cung cấp mẫu nếu chưa có
IF (SELECT COUNT(*) FROM NhaCungCap) = 0
BEGIN
    SET IDENTITY_INSERT NhaCungCap ON;
    INSERT INTO NhaCungCap (MaNCC, TenNCC, SDT, DiaChi) VALUES
    (1, N'Công ty Cổ phần Dược Hậu Giang (DHG)', '02923891433', N'288 Nguyễn Văn Cừ, P. An Hòa, Q. Ninh Kiều, Cần Thơ'),
    (2, N'Công ty Cổ phần Dược phẩm OPC', '02839601057', N'1017 Hồng Bàng, Phường 12, Quận 6, TP. Hồ Chí Minh'),
    (3, N'Công ty Cổ phần Traphaco', '18006612', N'75 Yên Ninh, Ba Đình, Hà Nội'),
    (4, N'Tổng công ty Dược Việt Nam (Vinapharm)', '02438465139', N'95 Láng Hạ, Đống Đa, Hà Nội'),
    (5, N'Công ty TNHH Dược phẩm Zuellig Pharma', '02839102626', N'Lầu 10, Saigon Centre, 65 Lê Lợi, Quận 1, TP. Hồ Chí Minh');
    SET IDENTITY_INSERT NhaCungCap OFF;
END
GO

-- 3. Tạo lô thuốc nhập kho cho tất cả thuốc trong DanhMucThuoc
-- Đảm bảo ngày sản xuất và hạn sử dụng đồng bộ và số lượng nhập khớp tuyệt đối số lượng tồn
WITH CTE_Source AS (
    SELECT 
        'L' + MaThuoc AS MaLo,
        MaThuoc,
        (ABS(CHECKSUM(NEWID())) % 5) + 1 AS MaNCC,
        100 + (ABS(CHECKSUM(NEWID())) % 901) AS SoLuong,
        CAST((5 + (ABS(CHECKSUM(NEWID())) % 96)) * 500 AS decimal(18,2)) AS PriceIn,
        DATEADD(day, - (ABS(CHECKSUM(NEWID())) % 365), CAST(GETDATE() AS date)) AS MfgDate
    FROM DanhMucThuoc
)
INSERT INTO LoThuoc (MaLo, MaThuoc, MaNCC, SoLuongNhap, SoLuongTon, GiaNhap, GiaBan, NgaySanXuat, HanSuDung)
SELECT 
    MaLo,
    MaThuoc,
    MaNCC,
    SoLuong AS SoLuongNhap,
    SoLuong AS SoLuongTon,
    PriceIn AS GiaNhap,
    CAST(ROUND(PriceIn * 1.25 / 1000.0, 0) * 1000.0 AS decimal(18,2)) AS GiaBan,
    MfgDate AS NgaySanXuat,
    DATEADD(year, 2, MfgDate) AS HanSuDung
FROM CTE_Source;
GO

PRINT 'Seeded lots for all medicines in DanhMucThuoc successfully.';
GO
