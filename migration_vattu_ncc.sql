USE QuanLyPhongKham_DB;
GO

-- 1. Thêm cột DonGia vào bảng DanhMucVatTu nếu chưa tồn tại để lưu đơn giá bán mặc định của vật tư
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('DanhMucVatTu') AND name = 'DonGia')
BEGIN
    ALTER TABLE DanhMucVatTu ADD DonGia DECIMAL(18, 2) NULL;
    PRINT 'Da them cot DonGia vao bang DanhMucVatTu';
END
GO

-- 2. Thêm cột MaNcc vào bảng DanhMucVatTu nếu chưa tồn tại và tạo khóa ngoại liên kết tới NhaCungCap(MaNcc)
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('DanhMucVatTu') AND name = 'MaNcc')
BEGIN
    ALTER TABLE DanhMucVatTu ADD MaNcc INT NULL;
    PRINT 'Da them cot MaNcc vao bang DanhMucVatTu';

    -- Tạo khóa ngoại liên kết tới NhaCungCap(MaNcc)
    ALTER TABLE DanhMucVatTu 
    ADD CONSTRAINT FK_DanhMucVatTu_NhaCungCap 
    FOREIGN KEY (MaNcc) REFERENCES NhaCungCap(MaNcc)
    ON DELETE SET NULL;
    PRINT 'Da tao khoa ngoai FK_DanhMucVatTu_NhaCungCap';
END
GO

-- 3. Thêm cột TongTienVatTu vào bảng HoaDon nếu chưa tồn tại để cộng dồn chi phí vật tư khi thanh toán
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('HoaDon') AND name = 'TongTienVatTu')
BEGIN
    ALTER TABLE HoaDon ADD TongTienVatTu DECIMAL(18, 2) NULL;
    PRINT 'Da them cot TongTienVatTu vao bang HoaDon';
END
GO
