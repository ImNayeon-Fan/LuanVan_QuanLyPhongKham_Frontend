-- Script seeding 50 dịch vụ y tế cận lâm sàng phổ biến
USE QuanLyPhongKham_DB;
GO

-- Xóa dữ liệu cũ để tránh trùng lặp nếu chạy lại script
DELETE FROM DichVuYTe;
GO

INSERT INTO DichVuYTe (MaDV, MaLoaiDV, TenDV, GiaTien, TrangThai) VALUES
('DV001', NULL, N'Siêu âm ổ bụng tổng quát', 150000.00, 1),
('DV002', NULL, N'Siêu âm tim màu', 350000.00, 1),
('DV003', NULL, N'Siêu âm tuyến giáp', 120000.00, 1),
('DV004', NULL, N'Siêu âm tuyến vú hai bên', 150000.00, 1),
('DV005', NULL, N'Siêu âm mạch máu chi dưới', 250000.00, 1),
('DV006', NULL, N'Siêu âm thai 4D', 400000.00, 1),
('DV007', NULL, N'Siêu âm khớp gối', 180000.00, 1),
('DV008', NULL, N'X-quang ngực thẳng kỹ thuật số', 120000.00, 1),
('DV009', NULL, N'X-quang cột sống thắt lưng thẳng nghiêng', 200000.00, 1),
('DV010', NULL, N'X-quang xương đùi thẳng nghiêng', 150000.00, 1),
('DV011', NULL, N'X-quang khớp gối thẳng nghiêng', 150000.00, 1),
('DV012', NULL, N'X-quang sọ thẳng nghiêng', 180000.00, 1),
('DV013', NULL, N'X-quang xoang tư thế Blondeau Hirtz', 150000.00, 1),
('DV014', NULL, N'Nội soi tai mũi họng ống cứng', 200000.00, 1),
('DV015', NULL, N'Nội soi dạ dày tá tràng không gây mê', 450000.00, 1),
('DV016', NULL, N'Nội soi dạ dày tá tràng có gây mê', 900000.00, 1),
('DV017', NULL, N'Nội soi đại trực tràng có gây mê', 1200000.00, 1),
('DV018', NULL, N'Điện tâm đồ (ECG) 12 cần', 80000.00, 1),
('DV019', NULL, N'Điện não đồ (EEG) kỹ thuật số', 250000.00, 1),
('DV020', NULL, N'Điện cơ đồ (EMG)', 300000.00, 1),
('DV021', NULL, N'Xét nghiệm công thức máu toàn bộ (24 chỉ số)', 90000.00, 1),
('DV022', NULL, N'Xét nghiệm đường huyết lúc đói (Glucose)', 40000.00, 1),
('DV023', NULL, N'Xét nghiệm HbA1c (Đường trung bình 3 tháng)', 150000.00, 1),
('DV024', NULL, N'Xét nghiệm chức năng gan AST (SGOT)', 40000.00, 1),
('DV025', NULL, N'Xét nghiệm chức năng gan ALT (SGPT)', 40000.00, 1),
('DV026', NULL, N'Xét nghiệm chức năng gan GGT', 50000.00, 1),
('DV027', NULL, N'Xét nghiệm Bilirubin toàn phần', 40000.00, 1),
('DV028', NULL, N'Xét nghiệm chức năng thận Ure', 40000.00, 1),
('DV029', NULL, N'Xét nghiệm chức năng thận Creatinin', 40000.00, 1),
('DV030', NULL, N'Xét nghiệm Acid Uric (Chẩn đoán Gút)', 50000.00, 1),
('DV031', NULL, N'Xét nghiệm Mỡ máu Cholesterol toàn phần', 45000.00, 1),
('DV032', NULL, N'Xét nghiệm Mỡ máu Triglyceride', 45000.00, 1),
('DV033', NULL, N'Xét nghiệm Mỡ máu HDL-Cholesterol', 45000.00, 1),
('DV034', NULL, N'Xét nghiệm Mỡ máu LDL-Cholesterol', 45000.00, 1),
('DV035', NULL, N'Xét nghiệm nước tiểu toàn bộ (10 thông số)', 50000.00, 1),
('DV036', NULL, N'Xét nghiệm nước tiểu vi thể', 60000.00, 1),
('DV037', NULL, N'Xét nghiệm viêm gan B HBsAg test nhanh', 80000.00, 1),
('DV038', NULL, N'Xét nghiệm viêm gan B HBsAg định lượng', 200000.00, 1),
('DV039', NULL, N'Xét nghiệm kháng thể viêm gan B Anti-HBs', 150000.00, 1),
('DV040', NULL, N'Xét nghiệm viêm gan C Anti-HCV test nhanh', 100000.00, 1),
('DV041', NULL, N'Xét nghiệm HIV test nhanh', 100000.00, 1),
('DV042', NULL, N'Xét nghiệm Giang mai Syphilis test nhanh', 90000.00, 1),
('DV043', NULL, N'Xét nghiệm chức năng tuyến giáp TSH', 120000.00, 1),
('DV044', NULL, N'Xét nghiệm chức năng tuyến giáp Free T3', 120000.00, 1),
('DV045', NULL, N'Xét nghiệm chức năng tuyến giáp Free T4', 120000.00, 1),
('DV046', NULL, N'Xét nghiệm định lượng Calci huyết thanh', 50000.00, 1),
('DV047', NULL, N'Xét nghiệm định lượng Sắt huyết thanh', 80000.00, 1),
('DV048', NULL, N'Test nhanh Helicobacter pylori (Hp) qua hơi thở', 600000.00, 1),
('DV049', NULL, N'Test nhanh HP qua phân', 200000.00, 1),
('DV050', NULL, N'Xét nghiệm đông máu đông cầm máu (PT/APTT)', 120000.00, 1);
GO

PRINT 'Seeded 50 CLS services successfully.';
GO
