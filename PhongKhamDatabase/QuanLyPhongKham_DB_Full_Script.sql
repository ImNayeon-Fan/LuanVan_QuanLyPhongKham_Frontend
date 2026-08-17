USE [master]
GO
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'QuanLyPhongKham_DB')
BEGIN
    CREATE DATABASE [QuanLyPhongKham_DB]
END
GO
USE [QuanLyPhongKham_DB]
GO
/****** Object:  Table [dbo].[BenhNhan]    Script Date: 8/17/2026 9:29:10 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[BenhNhan](
	[MaBN] [varchar](20) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[HoTen] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[NgaySinh] [date] NULL,
	[GioiTinh] [nvarchar](10) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[SDT] [varchar](15) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[DiaChi] [nvarchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[TienSuBenh] [nvarchar](max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
PRIMARY KEY CLUSTERED 
(
	[MaBN] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

GO
/****** Object:  Table [dbo].[ChiTietDichVuYTe]    Script Date: 8/17/2026 9:29:10 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ChiTietDichVuYTe](
	[MaDV] [varchar](20) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[TenDV] [nvarchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[GiaTien] [decimal](18, 2) NOT NULL,
	[TrangThai] [bit] NULL,
PRIMARY KEY CLUSTERED 
(
	[MaDV] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]

GO
/****** Object:  Table [dbo].[ChiTietDonThuoc]    Script Date: 8/17/2026 9:29:10 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ChiTietDonThuoc](
	[MaDonThuoc] [varchar](20) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[MaThuoc] [varchar](20) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[SoLuong] [int] NULL,
	[CachDung] [nvarchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[TrangThaiPhatThuoc] [bit] NULL,
PRIMARY KEY CLUSTERED 
(
	[MaDonThuoc] ASC,
	[MaThuoc] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]

GO
/****** Object:  Table [dbo].[ChiTietDonThuoc_Lo]    Script Date: 8/17/2026 9:29:10 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ChiTietDonThuoc_Lo](
	[MaDonThuoc] [varchar](20) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[MaThuoc] [varchar](20) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[MaLo] [varchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[SoLuongTru] [int] NOT NULL,
 CONSTRAINT [PK_ChiTietDonThuoc_Lo] PRIMARY KEY CLUSTERED 
(
	[MaDonThuoc] ASC,
	[MaThuoc] ASC,
	[MaLo] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]

GO
/****** Object:  Table [dbo].[ChiTietPhieuKhamICD]    Script Date: 8/17/2026 9:29:10 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ChiTietPhieuKhamICD](
	[MaPhieu] [varchar](20) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[MaICD] [varchar](20) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[MaPhieu] ASC,
	[MaICD] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]

GO
/****** Object:  Table [dbo].[ChiTietVatTu_Lo]    Script Date: 8/17/2026 9:29:10 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ChiTietVatTu_Lo](
	[MaPhieu] [varchar](20) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[MaVatTu] [varchar](20) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[MaLo] [varchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[SoLuongTru] [int] NOT NULL,
 CONSTRAINT [PK_ChiTietVatTu_Lo] PRIMARY KEY CLUSTERED 
(
	[MaPhieu] ASC,
	[MaVatTu] ASC,
	[MaLo] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]

GO
/****** Object:  Table [dbo].[ChiTietVatTuPhieuKham]    Script Date: 8/17/2026 9:29:10 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ChiTietVatTuPhieuKham](
	[MaPhieu] [varchar](20) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[MaVatTu] [varchar](20) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[SoLuong] [int] NOT NULL,
	[DonGia] [decimal](18, 2) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[MaPhieu] ASC,
	[MaVatTu] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]

GO
/****** Object:  Table [dbo].[DanhMucICD]    Script Date: 8/17/2026 9:29:10 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[DanhMucICD](
	[MaICD] [varchar](20) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[TenBenh] [nvarchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[MaICD] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]

GO
/****** Object:  Table [dbo].[DanhMucKhoa]    Script Date: 8/17/2026 9:29:10 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[DanhMucKhoa](
	[MaKhoa] [varchar](20) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[TenKhoa] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[MaKhoa] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]

GO
/****** Object:  Table [dbo].[DanhMucThuoc]    Script Date: 8/17/2026 9:29:10 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[DanhMucThuoc](
	[MaThuoc] [varchar](20) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[TenThuoc] [nvarchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[HoatChat] [nvarchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[DonViTinh] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[IsActive] [bit] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[MaThuoc] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]

GO
/****** Object:  Table [dbo].[DanhMucVatTu]    Script Date: 8/17/2026 9:29:10 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[DanhMucVatTu](
	[MaVatTu] [varchar](20) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[TenVatTu] [nvarchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[QuyCach] [nvarchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[DonViTinh] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[IsActive] [bit] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[MaVatTu] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]

GO
/****** Object:  Table [dbo].[DatLichKham]    Script Date: 8/17/2026 9:29:10 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[DatLichKham](
	[MaDatLich] [int] IDENTITY(1,1) NOT NULL,
	[HoTenKhach] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[SDT] [varchar](15) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[NgayHen] [date] NULL,
	[YeuCauKham] [nvarchar](max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[TrangThai] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[MaNV] [varchar](20) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[CaHen] [varchar](10) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
PRIMARY KEY CLUSTERED 
(
	[MaDatLich] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

GO
/****** Object:  Table [dbo].[DichVuYTe]    Script Date: 8/17/2026 9:29:10 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[DichVuYTe](
	[MaChiTiet] [int] IDENTITY(1,1) NOT NULL,
	[MaPhieu] [varchar](20) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[MaDV] [varchar](20) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[KetQua] [nvarchar](max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[TrangThaiDichVu] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[MaChiTiet] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

GO
/****** Object:  Table [dbo].[DonThuoc]    Script Date: 8/17/2026 9:29:10 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[DonThuoc](
	[MaDonThuoc] [varchar](20) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[MaPhieu] [varchar](20) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[NgayKeDon] [datetime] NULL,
	[LoiDan] [nvarchar](max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
PRIMARY KEY CLUSTERED 
(
	[MaDonThuoc] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

GO
/****** Object:  Table [dbo].[HoaDon]    Script Date: 8/17/2026 9:29:10 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[HoaDon](
	[MaHoaDon] [varchar](20) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[MaPhieu] [varchar](20) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[NgayThanhToan] [datetime] NULL,
	[TongTienDichVu] [decimal](18, 2) NULL,
	[TongTienThuoc] [decimal](18, 2) NULL,
	[ThanhTien] [decimal](18, 2) NOT NULL,
	[TrangThaiThanhToan] [bit] NULL,
	[MaNV] [varchar](20) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[TongTienVatTu] [decimal](18, 2) NULL,
	[PhuongThucTT] [nvarchar](20) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
PRIMARY KEY CLUSTERED 
(
	[MaHoaDon] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]

GO
/****** Object:  Table [dbo].[LichLamViec]    Script Date: 8/17/2026 9:29:10 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[LichLamViec](
	[MaLich] [int] IDENTITY(1,1) NOT NULL,
	[MaNV] [varchar](20) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[NgayLamViec] [date] NOT NULL,
	[CaLamViec] [varchar](10) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[PhongKham] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[GhiChu] [nvarchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[NgayDangKy] [datetime] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[MaLich] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]

GO
/****** Object:  Table [dbo].[LoThuoc]    Script Date: 8/17/2026 9:29:10 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[LoThuoc](
	[MaLo] [varchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[MaThuoc] [varchar](20) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[MaNCC] [int] NULL,
	[SoLuongNhap] [int] NULL,
	[SoLuongTon] [int] NULL,
	[GiaNhap] [decimal](18, 2) NULL,
	[GiaBan] [decimal](18, 2) NULL,
	[NgaySanXuat] [date] NULL,
	[HanSuDung] [date] NULL,
PRIMARY KEY CLUSTERED 
(
	[MaLo] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]

GO
/****** Object:  Table [dbo].[LoVatTu]    Script Date: 8/17/2026 9:29:10 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[LoVatTu](
	[MaLo] [varchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[MaVatTu] [varchar](20) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[MaNcc] [int] NOT NULL,
	[SoLuongNhap] [int] NOT NULL,
	[SoLuongTon] [int] NOT NULL,
	[GiaNhap] [decimal](18, 2) NOT NULL,
	[GiaBan] [decimal](18, 2) NOT NULL,
	[NgaySanXuat] [date] NULL,
	[HanSuDung] [date] NOT NULL,
 CONSTRAINT [PK_LoVatTu] PRIMARY KEY CLUSTERED 
(
	[MaLo] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]

GO
/****** Object:  Table [dbo].[NhaCungCap]    Script Date: 8/17/2026 9:29:10 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[NhaCungCap](
	[MaNCC] [int] IDENTITY(1,1) NOT NULL,
	[TenNCC] [nvarchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[SDT] [varchar](15) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[DiaChi] [nvarchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
PRIMARY KEY CLUSTERED 
(
	[MaNCC] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]

GO
/****** Object:  Table [dbo].[NhanVien]    Script Date: 8/17/2026 9:29:10 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[NhanVien](
	[MaNV] [varchar](20) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[UserID] [int] NULL,
	[HoTen] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[ChuyenMon] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[SDT] [varchar](15) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[Email] [varchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[MaKhoa] [varchar](20) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
PRIMARY KEY CLUSTERED 
(
	[MaNV] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]

GO
/****** Object:  Table [dbo].[PhieuKham]    Script Date: 8/17/2026 9:29:10 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[PhieuKham](
	[MaPhieu] [varchar](20) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[MaBN] [varchar](20) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[NgayKham] [datetime] NULL,
	[Mach] [int] NULL,
	[NhietDo] [float] NULL,
	[HuyetAp] [varchar](20) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[CanNang] [float] NULL,
	[ChieuCao] [float] NULL,
	[KetLuan] [nvarchar](max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[TrangThaiKham] [int] NULL,
	[LyDoKham] [nvarchar](max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[MaNV] [varchar](20) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
PRIMARY KEY CLUSTERED 
(
	[MaPhieu] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

GO
/****** Object:  Table [dbo].[Roles]    Script Date: 8/17/2026 9:29:10 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Roles](
	[RoleID] [int] IDENTITY(1,1) NOT NULL,
	[RoleName] [varchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[RoleID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]

GO
/****** Object:  Table [dbo].[Users]    Script Date: 8/17/2026 9:29:10 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Users](
	[UserID] [int] IDENTITY(1,1) NOT NULL,
	[Username] [varchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[PasswordHash] [varchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[RoleID] [int] NULL,
	[IsActive] [bit] NULL,
PRIMARY KEY CLUSTERED 
(
	[UserID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]

GO
INSERT [dbo].[ChiTietDichVuYTe] ([MaDV], [TenDV], [GiaTien], [TrangThai]) VALUES (N'DV001', N'Kham tong quat', CAST(150000.00 AS Decimal(18, 2)), 1)
GO
INSERT [dbo].[ChiTietDichVuYTe] ([MaDV], [TenDV], [GiaTien], [TrangThai]) VALUES (N'DV002', N'Sieu am bung tong quat', CAST(250000.00 AS Decimal(18, 2)), 1)
GO
INSERT [dbo].[ChiTietDichVuYTe] ([MaDV], [TenDV], [GiaTien], [TrangThai]) VALUES (N'DV003', N'Xet nghiem cong thuc mau', CAST(120000.00 AS Decimal(18, 2)), 1)
GO
INSERT [dbo].[ChiTietDichVuYTe] ([MaDV], [TenDV], [GiaTien], [TrangThai]) VALUES (N'DV004', N'Chup X-quang nguc thang', CAST(200000.00 AS Decimal(18, 2)), 1)
GO
INSERT [dbo].[ChiTietDichVuYTe] ([MaDV], [TenDV], [GiaTien], [TrangThai]) VALUES (N'DV005', N'Do dien tim (ECG)', CAST(100000.00 AS Decimal(18, 2)), 1)
GO
INSERT [dbo].[ChiTietDichVuYTe] ([MaDV], [TenDV], [GiaTien], [TrangThai]) VALUES (N'DV006', N'Noi soi Tai Mui Hong', CAST(180000.00 AS Decimal(18, 2)), 1)
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'A09', N'Tieu chay va viem da day ruot nghi do nhiem trung')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'E11', N'Dai thao duong type 2')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'I10', N'Tang huyet ap vo can (nguyen phat)')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'J00', N'Viem mui hong cap (cam lanh thong thuong)')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'J45', N'Hen phe quan')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'K29.7', N'Viem da day, khong xac dinh')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'M54.5', N'Dau that lung')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'N39.0', N'Nhiem khuan duong tiet nieu, vi tri khong xac dinh')
GO
INSERT [dbo].[DanhMucKhoa] ([MaKhoa], [TenKhoa]) VALUES (N'KH02', N'Ngoai tong quat')
GO
INSERT [dbo].[DanhMucKhoa] ([MaKhoa], [TenKhoa]) VALUES (N'KH03', N'Nhi khoa')
GO
INSERT [dbo].[DanhMucKhoa] ([MaKhoa], [TenKhoa]) VALUES (N'KH01', N'Noi tong quat')
GO
INSERT [dbo].[DanhMucKhoa] ([MaKhoa], [TenKhoa]) VALUES (N'KH04', N'San phu khoa')
GO
INSERT [dbo].[DanhMucKhoa] ([MaKhoa], [TenKhoa]) VALUES (N'KH05', N'Tai Mui Hong')
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH001', N'Paracetamol 500mg', N'Paracetamol', N'Vien', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH002', N'Amoxicillin 500mg', N'Amoxicillin', N'Vien', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH003', N'Vitamin C 500mg', N'Ascorbic acid', N'Vien', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH004', N'Omeprazole 20mg', N'Omeprazole', N'Vien', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH005', N'Cetirizine 10mg', N'Cetirizine', N'Vien', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH006', N'Salbutamol xit', N'Salbutamol', N'Chai', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH007', N'Metformin 500mg', N'Metformin', N'Vien', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH008', N'Amlodipine 5mg', N'Amlodipine', N'Vien', 1)
GO
INSERT [dbo].[DanhMucVatTu] ([MaVatTu], [TenVatTu], [QuyCach], [DonViTinh], [IsActive]) VALUES (N'VT001', N'Bom kim tiem 5ml', N'Hop 100 cai', N'Cai', 1)
GO
INSERT [dbo].[DanhMucVatTu] ([MaVatTu], [TenVatTu], [QuyCach], [DonViTinh], [IsActive]) VALUES (N'VT002', N'Bang gac y te', N'Cuon 5m', N'Cuon', 1)
GO
INSERT [dbo].[DanhMucVatTu] ([MaVatTu], [TenVatTu], [QuyCach], [DonViTinh], [IsActive]) VALUES (N'VT003', N'Gang tay y te', N'Hop 100 cai', N'Doi', 1)
GO
INSERT [dbo].[DanhMucVatTu] ([MaVatTu], [TenVatTu], [QuyCach], [DonViTinh], [IsActive]) VALUES (N'VT004', N'Bong y te', N'Goi 500g', N'Goi', 1)
GO
INSERT [dbo].[DanhMucVatTu] ([MaVatTu], [TenVatTu], [QuyCach], [DonViTinh], [IsActive]) VALUES (N'VT005', N'Khau trang y te', N'Hop 50 cai', N'Cai', 1)
GO
INSERT [dbo].[DanhMucVatTu] ([MaVatTu], [TenVatTu], [QuyCach], [DonViTinh], [IsActive]) VALUES (N'VT006', N'Con sat trung 90 do', N'Chai 500ml', N'Chai', 1)
GO
SET IDENTITY_INSERT [dbo].[LichLamViec] ON 

GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (1, N'NV002', CAST(N'2026-08-17' AS Date), N'Sang', N'Phong 101', N'KhÃ¡m Ná»™i tá»•ng quÃ¡t', CAST(N'2026-08-15T00:00:00.000' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (2, N'NV003', CAST(N'2026-08-17' AS Date), N'Chieu', N'Phong 102', N'KhÃ¡m Ngoáº¡i tá»•ng quÃ¡t', CAST(N'2026-08-15T00:00:00.000' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (3, N'NV004', CAST(N'2026-08-17' AS Date), N'Sang', N'Phong 103', N'KhÃ¡m Nhi khoa', CAST(N'2026-08-15T00:00:00.000' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (4, N'NV009', CAST(N'2026-08-17' AS Date), N'Chieu', N'Phong 104', N'KhÃ¡m Sáº£n phá»¥ khoa', CAST(N'2026-08-15T00:00:00.000' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (5, N'NV010', CAST(N'2026-08-17' AS Date), N'Sang', N'Phong 105', N'KhÃ¡m Tai MÅ©i Há»ng', CAST(N'2026-08-15T00:00:00.000' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (6, N'NV002', CAST(N'2026-08-18' AS Date), N'Chieu', N'Phong 101', N'KhÃ¡m Ná»™i tá»•ng quÃ¡t', CAST(N'2026-08-15T00:00:00.000' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (7, N'NV003', CAST(N'2026-08-18' AS Date), N'Sang', N'Phong 102', N'KhÃ¡m Ngoáº¡i tá»•ng quÃ¡t', CAST(N'2026-08-15T00:00:00.000' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (8, N'NV004', CAST(N'2026-08-18' AS Date), N'Chieu', N'Phong 103', N'KhÃ¡m Nhi khoa', CAST(N'2026-08-15T00:00:00.000' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (9, N'NV009', CAST(N'2026-08-18' AS Date), N'Sang', N'Phong 104', N'KhÃ¡m Sáº£n phá»¥ khoa', CAST(N'2026-08-15T00:00:00.000' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (10, N'NV010', CAST(N'2026-08-18' AS Date), N'Chieu', N'Phong 105', N'KhÃ¡m Tai MÅ©i Há»ng', CAST(N'2026-08-15T00:00:00.000' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (11, N'NV002', CAST(N'2026-08-19' AS Date), N'Sang', N'Phong 101', N'KhÃ¡m Ná»™i tá»•ng quÃ¡t', CAST(N'2026-08-15T00:00:00.000' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (12, N'NV003', CAST(N'2026-08-19' AS Date), N'Chieu', N'Phong 102', N'KhÃ¡m Ngoáº¡i tá»•ng quÃ¡t', CAST(N'2026-08-15T00:00:00.000' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (13, N'NV004', CAST(N'2026-08-19' AS Date), N'Sang', N'Phong 103', N'KhÃ¡m Nhi khoa', CAST(N'2026-08-15T00:00:00.000' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (14, N'NV009', CAST(N'2026-08-19' AS Date), N'Chieu', N'Phong 104', N'KhÃ¡m Sáº£n phá»¥ khoa', CAST(N'2026-08-15T00:00:00.000' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (15, N'NV010', CAST(N'2026-08-19' AS Date), N'Sang', N'Phong 105', N'KhÃ¡m Tai MÅ©i Há»ng', CAST(N'2026-08-15T00:00:00.000' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (16, N'NV002', CAST(N'2026-08-20' AS Date), N'Chieu', N'Phong 101', N'KhÃ¡m Ná»™i tá»•ng quÃ¡t', CAST(N'2026-08-15T00:00:00.000' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (17, N'NV003', CAST(N'2026-08-20' AS Date), N'Sang', N'Phong 102', N'KhÃ¡m Ngoáº¡i tá»•ng quÃ¡t', CAST(N'2026-08-15T00:00:00.000' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (18, N'NV004', CAST(N'2026-08-20' AS Date), N'Chieu', N'Phong 103', N'KhÃ¡m Nhi khoa', CAST(N'2026-08-15T00:00:00.000' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (19, N'NV009', CAST(N'2026-08-20' AS Date), N'Sang', N'Phong 104', N'KhÃ¡m Sáº£n phá»¥ khoa', CAST(N'2026-08-15T00:00:00.000' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (20, N'NV010', CAST(N'2026-08-20' AS Date), N'Chieu', N'Phong 105', N'KhÃ¡m Tai MÅ©i Há»ng', CAST(N'2026-08-15T00:00:00.000' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (21, N'NV002', CAST(N'2026-08-21' AS Date), N'Sang', N'Phong 101', N'KhÃ¡m Ná»™i tá»•ng quÃ¡t', CAST(N'2026-08-15T00:00:00.000' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (22, N'NV003', CAST(N'2026-08-21' AS Date), N'Chieu', N'Phong 102', N'KhÃ¡m Ngoáº¡i tá»•ng quÃ¡t', CAST(N'2026-08-15T00:00:00.000' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (23, N'NV004', CAST(N'2026-08-21' AS Date), N'Sang', N'Phong 103', N'KhÃ¡m Nhi khoa', CAST(N'2026-08-15T00:00:00.000' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (24, N'NV009', CAST(N'2026-08-21' AS Date), N'Chieu', N'Phong 104', N'KhÃ¡m Sáº£n phá»¥ khoa', CAST(N'2026-08-15T00:00:00.000' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (25, N'NV010', CAST(N'2026-08-21' AS Date), N'Sang', N'Phong 105', N'KhÃ¡m Tai MÅ©i Há»ng', CAST(N'2026-08-15T00:00:00.000' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (26, N'NV002', CAST(N'2026-08-22' AS Date), N'Chieu', N'Phong 101', N'KhÃ¡m Ná»™i tá»•ng quÃ¡t', CAST(N'2026-08-15T00:00:00.000' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (27, N'NV003', CAST(N'2026-08-22' AS Date), N'Sang', N'Phong 102', N'KhÃ¡m Ngoáº¡i tá»•ng quÃ¡t', CAST(N'2026-08-15T00:00:00.000' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (28, N'NV004', CAST(N'2026-08-22' AS Date), N'Chieu', N'Phong 103', N'KhÃ¡m Nhi khoa', CAST(N'2026-08-15T00:00:00.000' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (29, N'NV009', CAST(N'2026-08-22' AS Date), N'Sang', N'Phong 104', N'KhÃ¡m Sáº£n phá»¥ khoa', CAST(N'2026-08-15T00:00:00.000' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (30, N'NV010', CAST(N'2026-08-22' AS Date), N'Chieu', N'Phong 105', N'KhÃ¡m Tai MÅ©i Há»ng', CAST(N'2026-08-15T00:00:00.000' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (31, N'NV002', CAST(N'2026-08-23' AS Date), N'Sang', N'Phong 101', N'KhÃ¡m Trá»±c Nháº­t', CAST(N'2026-08-15T00:00:00.000' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (32, N'NV003', CAST(N'2026-08-23' AS Date), N'Chieu', N'Phong 102', N'KhÃ¡m Trá»±c Nháº­t', CAST(N'2026-08-15T00:00:00.000' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (33, N'NV004', CAST(N'2026-08-23' AS Date), N'Sang', N'Phong 103', N'KhÃ¡m Trá»±c Nháº­t', CAST(N'2026-08-15T00:00:00.000' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (34, N'NV009', CAST(N'2026-08-23' AS Date), N'Chieu', N'Phong 104', N'KhÃ¡m Trá»±c Nháº­t', CAST(N'2026-08-15T00:00:00.000' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (35, N'NV010', CAST(N'2026-08-23' AS Date), N'Sang', N'Phong 105', N'KhÃ¡m Trá»±c Nháº­t', CAST(N'2026-08-15T00:00:00.000' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (36, N'NV002', CAST(N'2026-08-24' AS Date), N'Sang', N'Phong 101', N'KhÃ¡m Ná»™i tá»•ng quÃ¡t', CAST(N'2026-08-15T00:00:00.000' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (37, N'NV003', CAST(N'2026-08-24' AS Date), N'Chieu', N'Phong 102', N'KhÃ¡m Ngoáº¡i tá»•ng quÃ¡t', CAST(N'2026-08-15T00:00:00.000' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (38, N'NV004', CAST(N'2026-08-24' AS Date), N'Sang', N'Phong 103', N'KhÃ¡m Nhi khoa', CAST(N'2026-08-15T00:00:00.000' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (39, N'NV009', CAST(N'2026-08-24' AS Date), N'Chieu', N'Phong 104', N'KhÃ¡m Sáº£n phá»¥ khoa', CAST(N'2026-08-15T00:00:00.000' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (40, N'NV010', CAST(N'2026-08-24' AS Date), N'Sang', N'Phong 105', N'KhÃ¡m Tai MÅ©i Há»ng', CAST(N'2026-08-15T00:00:00.000' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (41, N'NV002', CAST(N'2026-08-25' AS Date), N'Chieu', N'Phong 101', N'KhÃ¡m Ná»™i tá»•ng quÃ¡t', CAST(N'2026-08-15T00:00:00.000' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (42, N'NV003', CAST(N'2026-08-25' AS Date), N'Sang', N'Phong 102', N'KhÃ¡m Ngoáº¡i tá»•ng quÃ¡t', CAST(N'2026-08-15T00:00:00.000' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (43, N'NV004', CAST(N'2026-08-25' AS Date), N'Chieu', N'Phong 103', N'KhÃ¡m Nhi khoa', CAST(N'2026-08-15T00:00:00.000' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (44, N'NV009', CAST(N'2026-08-25' AS Date), N'Sang', N'Phong 104', N'KhÃ¡m Sáº£n phá»¥ khoa', CAST(N'2026-08-15T00:00:00.000' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (45, N'NV010', CAST(N'2026-08-25' AS Date), N'Chieu', N'Phong 105', N'KhÃ¡m Tai MÅ©i Há»ng', CAST(N'2026-08-15T00:00:00.000' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (46, N'NV002', CAST(N'2026-08-26' AS Date), N'Sang', N'Phong 101', N'KhÃ¡m Ná»™i tá»•ng quÃ¡t', CAST(N'2026-08-15T00:00:00.000' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (47, N'NV003', CAST(N'2026-08-26' AS Date), N'Chieu', N'Phong 102', N'KhÃ¡m Ngoáº¡i tá»•ng quÃ¡t', CAST(N'2026-08-15T00:00:00.000' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (48, N'NV004', CAST(N'2026-08-26' AS Date), N'Sang', N'Phong 103', N'KhÃ¡m Nhi khoa', CAST(N'2026-08-15T00:00:00.000' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (49, N'NV009', CAST(N'2026-08-26' AS Date), N'Chieu', N'Phong 104', N'KhÃ¡m Sáº£n phá»¥ khoa', CAST(N'2026-08-15T00:00:00.000' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (50, N'NV010', CAST(N'2026-08-26' AS Date), N'Sang', N'Phong 105', N'KhÃ¡m Tai MÅ©i Há»ng', CAST(N'2026-08-15T00:00:00.000' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (51, N'NV002', CAST(N'2026-08-27' AS Date), N'Chieu', N'Phong 101', N'KhÃ¡m Ná»™i tá»•ng quÃ¡t', CAST(N'2026-08-15T00:00:00.000' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (52, N'NV003', CAST(N'2026-08-27' AS Date), N'Sang', N'Phong 102', N'KhÃ¡m Ngoáº¡i tá»•ng quÃ¡t', CAST(N'2026-08-15T00:00:00.000' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (53, N'NV004', CAST(N'2026-08-27' AS Date), N'Chieu', N'Phong 103', N'KhÃ¡m Nhi khoa', CAST(N'2026-08-15T00:00:00.000' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (54, N'NV009', CAST(N'2026-08-27' AS Date), N'Sang', N'Phong 104', N'KhÃ¡m Sáº£n phá»¥ khoa', CAST(N'2026-08-15T00:00:00.000' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (55, N'NV010', CAST(N'2026-08-27' AS Date), N'Chieu', N'Phong 105', N'KhÃ¡m Tai MÅ©i Há»ng', CAST(N'2026-08-15T00:00:00.000' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (56, N'NV002', CAST(N'2026-08-28' AS Date), N'Sang', N'Phong 101', N'KhÃ¡m Ná»™i tá»•ng quÃ¡t', CAST(N'2026-08-15T00:00:00.000' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (57, N'NV003', CAST(N'2026-08-28' AS Date), N'Chieu', N'Phong 102', N'KhÃ¡m Ngoáº¡i tá»•ng quÃ¡t', CAST(N'2026-08-15T00:00:00.000' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (58, N'NV004', CAST(N'2026-08-28' AS Date), N'Sang', N'Phong 103', N'KhÃ¡m Nhi khoa', CAST(N'2026-08-15T00:00:00.000' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (59, N'NV009', CAST(N'2026-08-28' AS Date), N'Chieu', N'Phong 104', N'KhÃ¡m Sáº£n phá»¥ khoa', CAST(N'2026-08-15T00:00:00.000' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (60, N'NV010', CAST(N'2026-08-28' AS Date), N'Sang', N'Phong 105', N'KhÃ¡m Tai MÅ©i Há»ng', CAST(N'2026-08-15T00:00:00.000' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (61, N'NV002', CAST(N'2026-08-29' AS Date), N'Chieu', N'Phong 101', N'KhÃ¡m Ná»™i tá»•ng quÃ¡t', CAST(N'2026-08-15T00:00:00.000' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (62, N'NV003', CAST(N'2026-08-29' AS Date), N'Sang', N'Phong 102', N'KhÃ¡m Ngoáº¡i tá»•ng quÃ¡t', CAST(N'2026-08-15T00:00:00.000' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (63, N'NV004', CAST(N'2026-08-29' AS Date), N'Chieu', N'Phong 103', N'KhÃ¡m Nhi khoa', CAST(N'2026-08-15T00:00:00.000' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (64, N'NV009', CAST(N'2026-08-29' AS Date), N'Sang', N'Phong 104', N'KhÃ¡m Sáº£n phá»¥ khoa', CAST(N'2026-08-15T00:00:00.000' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (65, N'NV010', CAST(N'2026-08-29' AS Date), N'Chieu', N'Phong 105', N'KhÃ¡m Tai MÅ©i Há»ng', CAST(N'2026-08-15T00:00:00.000' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (66, N'NV002', CAST(N'2026-08-30' AS Date), N'Sang', N'Phong 101', N'KhÃ¡m Trá»±c Nháº­t', CAST(N'2026-08-15T00:00:00.000' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (67, N'NV003', CAST(N'2026-08-30' AS Date), N'Chieu', N'Phong 102', N'KhÃ¡m Trá»±c Nháº­t', CAST(N'2026-08-15T00:00:00.000' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (68, N'NV004', CAST(N'2026-08-30' AS Date), N'Sang', N'Phong 103', N'KhÃ¡m Trá»±c Nháº­t', CAST(N'2026-08-15T00:00:00.000' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (69, N'NV009', CAST(N'2026-08-30' AS Date), N'Chieu', N'Phong 104', N'KhÃ¡m Trá»±c Nháº­t', CAST(N'2026-08-15T00:00:00.000' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (70, N'NV010', CAST(N'2026-08-30' AS Date), N'Sang', N'Phong 105', N'KhÃ¡m Trá»±c Nháº­t', CAST(N'2026-08-15T00:00:00.000' AS DateTime))
GO
SET IDENTITY_INSERT [dbo].[LichLamViec] OFF
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LO-TH-001', N'TH001', 1, 1000, 990, CAST(500.00 AS Decimal(18, 2)), CAST(1000.00 AS Decimal(18, 2)), CAST(N'2026-01-10' AS Date), CAST(N'2028-01-10' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LO-TH-002', N'TH002', 2, 500, 486, CAST(1200.00 AS Decimal(18, 2)), CAST(2500.00 AS Decimal(18, 2)), CAST(N'2026-02-15' AS Date), CAST(N'2027-08-15' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LO-TH-003', N'TH003', 1, 800, 790, CAST(300.00 AS Decimal(18, 2)), CAST(700.00 AS Decimal(18, 2)), CAST(N'2026-03-01' AS Date), CAST(N'2028-03-01' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LO-TH-004', N'TH004', 3, 600, 586, CAST(800.00 AS Decimal(18, 2)), CAST(1800.00 AS Decimal(18, 2)), CAST(N'2026-01-20' AS Date), CAST(N'2027-12-20' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LO-TH-005', N'TH005', 2, 700, 700, CAST(400.00 AS Decimal(18, 2)), CAST(900.00 AS Decimal(18, 2)), CAST(N'2026-02-10' AS Date), CAST(N'2027-11-10' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LO-TH-006', N'TH006', 3, 300, 299, CAST(15000.00 AS Decimal(18, 2)), CAST(25000.00 AS Decimal(18, 2)), CAST(N'2026-04-01' AS Date), CAST(N'2027-10-01' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LO-TH-007', N'TH007', 5, 900, 870, CAST(600.00 AS Decimal(18, 2)), CAST(1400.00 AS Decimal(18, 2)), CAST(N'2026-01-05' AS Date), CAST(N'2028-01-05' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LO-TH-008', N'TH008', 5, 500, 470, CAST(900.00 AS Decimal(18, 2)), CAST(2000.00 AS Decimal(18, 2)), CAST(N'2026-03-15' AS Date), CAST(N'2028-03-15' AS Date))
GO
INSERT [dbo].[LoVatTu] ([MaLo], [MaVatTu], [MaNcc], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LO-VT-001', N'VT001', 4, 200, 197, CAST(50000.00 AS Decimal(18, 2)), CAST(70000.00 AS Decimal(18, 2)), CAST(N'2026-01-01' AS Date), CAST(N'2029-01-01' AS Date))
GO
INSERT [dbo].[LoVatTu] ([MaLo], [MaVatTu], [MaNcc], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LO-VT-002', N'VT002', 4, 300, 299, CAST(15000.00 AS Decimal(18, 2)), CAST(20000.00 AS Decimal(18, 2)), CAST(N'2026-02-01' AS Date), CAST(N'2028-02-01' AS Date))
GO
INSERT [dbo].[LoVatTu] ([MaLo], [MaVatTu], [MaNcc], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LO-VT-003', N'VT003', 3, 500, 497, CAST(80000.00 AS Decimal(18, 2)), CAST(100000.00 AS Decimal(18, 2)), CAST(N'2026-01-15' AS Date), CAST(N'2028-01-15' AS Date))
GO
INSERT [dbo].[LoVatTu] ([MaLo], [MaVatTu], [MaNcc], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LO-VT-004', N'VT004', 1, 400, 400, CAST(10000.00 AS Decimal(18, 2)), CAST(15000.00 AS Decimal(18, 2)), CAST(N'2026-03-01' AS Date), CAST(N'2029-03-01' AS Date))
GO
INSERT [dbo].[LoVatTu] ([MaLo], [MaVatTu], [MaNcc], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LO-VT-005', N'VT005', 3, 1000, 999, CAST(60000.00 AS Decimal(18, 2)), CAST(90000.00 AS Decimal(18, 2)), CAST(N'2026-02-20' AS Date), CAST(N'2027-02-20' AS Date))
GO
INSERT [dbo].[LoVatTu] ([MaLo], [MaVatTu], [MaNcc], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LO-VT-006', N'VT006', 5, 250, 249, CAST(25000.00 AS Decimal(18, 2)), CAST(35000.00 AS Decimal(18, 2)), CAST(N'2026-01-10' AS Date), CAST(N'2028-01-10' AS Date))
GO
SET IDENTITY_INSERT [dbo].[NhaCungCap] ON 

GO
INSERT [dbo].[NhaCungCap] ([MaNCC], [TenNCC], [SDT], [DiaChi]) VALUES (1, N'Cong ty CP Duoc Hau Giang', N'02923891433', N'288 Bis Nguyen Van Cu, Can Tho')
GO
INSERT [dbo].[NhaCungCap] ([MaNCC], [TenNCC], [SDT], [DiaChi]) VALUES (2, N'Cong ty CP Traphaco', N'02438533535', N'75 Yen Ninh, Ba Dinh, Ha Noi')
GO
INSERT [dbo].[NhaCungCap] ([MaNCC], [TenNCC], [SDT], [DiaChi]) VALUES (3, N'Cong ty TNHH Zuellig Pharma Viet Nam', N'02838223344', N'20 Truong Son, Tan Binh, TP.HCM')
GO
INSERT [dbo].[NhaCungCap] ([MaNCC], [TenNCC], [SDT], [DiaChi]) VALUES (4, N'Cong ty CP Thiet bi Y te Viet Nhat', N'02839252525', N'125 Cach Mang Thang 8, TP.HCM')
GO
INSERT [dbo].[NhaCungCap] ([MaNCC], [TenNCC], [SDT], [DiaChi]) VALUES (5, N'Cong ty CP Duoc pham Domesco', N'02773851270', N'66 Quoc lo 30, Dong Thap')
GO
SET IDENTITY_INSERT [dbo].[NhaCungCap] OFF
GO
INSERT [dbo].[NhanVien] ([MaNV], [UserID], [HoTen], [ChuyenMon], [SDT], [Email], [MaKhoa]) VALUES (N'NV001', 1, N'Tran Van Quan', N'Quan tri he thong', N'0900000001', N'mxp1803.admin@gmail.com', NULL)
GO
INSERT [dbo].[NhanVien] ([MaNV], [UserID], [HoTen], [ChuyenMon], [SDT], [Email], [MaKhoa]) VALUES (N'NV002', 2, N'Nguyen Van An', N'Noi tong quat', N'0900000002', N'mxp1803.bacsi1@gmail.com', N'KH01')
GO
INSERT [dbo].[NhanVien] ([MaNV], [UserID], [HoTen], [ChuyenMon], [SDT], [Email], [MaKhoa]) VALUES (N'NV003', 3, N'Le Thi Binh', N'Ngoai tong quat', N'0900000003', N'mxp1803.bacsi2@gmail.com', N'KH02')
GO
INSERT [dbo].[NhanVien] ([MaNV], [UserID], [HoTen], [ChuyenMon], [SDT], [Email], [MaKhoa]) VALUES (N'NV004', 4, N'Pham Minh Chau', N'Nhi khoa', N'0900000004', N'mxp1803.bacsi3@gmail.com', N'KH03')
GO
INSERT [dbo].[NhanVien] ([MaNV], [UserID], [HoTen], [ChuyenMon], [SDT], [Email], [MaKhoa]) VALUES (N'NV005', 5, N'Hoang Thi Duyen', N'Le tan', N'0900000005', N'mxp1803.letan1@gmail.com', NULL)
GO
INSERT [dbo].[NhanVien] ([MaNV], [UserID], [HoTen], [ChuyenMon], [SDT], [Email], [MaKhoa]) VALUES (N'NV006', 6, N'Vu Thi Hoa', N'Le tan', N'0900000006', N'mxp1803.letan2@gmail.com', NULL)
GO
INSERT [dbo].[NhanVien] ([MaNV], [UserID], [HoTen], [ChuyenMon], [SDT], [Email], [MaKhoa]) VALUES (N'NV007', 7, N'Dang Van Khoa', N'Thu ngan', N'0900000007', N'mxp1803.thungan1@gmail.com', NULL)
GO
INSERT [dbo].[NhanVien] ([MaNV], [UserID], [HoTen], [ChuyenMon], [SDT], [Email], [MaKhoa]) VALUES (N'NV008', 8, N'Bui Thi Lan', N'Quan ly kho thuoc', N'0900000008', N'mxp1803.quanlykho1@gmail.com', NULL)
GO
INSERT [dbo].[NhanVien] ([MaNV], [UserID], [HoTen], [ChuyenMon], [SDT], [Email], [MaKhoa]) VALUES (N'NV009', 9, N'Tran Hoai Nam', N'San phu khoa', N'0900000009', N'mxp1803.bacsi4@gmail.com', N'KH04')
GO
INSERT [dbo].[NhanVien] ([MaNV], [UserID], [HoTen], [ChuyenMon], [SDT], [Email], [MaKhoa]) VALUES (N'NV010', 10, N'Hoang Bich Ngoc', N'Tai Mui Hong', N'0900000010', N'mxp1803.bacsi5@gmail.com', N'KH05')
GO
SET IDENTITY_INSERT [dbo].[Roles] ON 

GO
INSERT [dbo].[Roles] ([RoleID], [RoleName]) VALUES (1, N'Admin')
GO
INSERT [dbo].[Roles] ([RoleID], [RoleName]) VALUES (2, N'BacSi')
GO
INSERT [dbo].[Roles] ([RoleID], [RoleName]) VALUES (3, N'LeTan')
GO
INSERT [dbo].[Roles] ([RoleID], [RoleName]) VALUES (5, N'QuanLyKhoThuoc')
GO
INSERT [dbo].[Roles] ([RoleID], [RoleName]) VALUES (4, N'ThuNgan')
GO
SET IDENTITY_INSERT [dbo].[Roles] OFF
GO
SET IDENTITY_INSERT [dbo].[Users] ON 

GO
INSERT [dbo].[Users] ([UserID], [Username], [PasswordHash], [RoleID], [IsActive]) VALUES (1, N'mxp1803.admin@gmail.com', N'$2a$11$iXOJctEK0HkgDUaLajgVSu3ySsIKkJD8gcecGdHrjm4/IyS7Xi8oi', 1, 1)
GO
INSERT [dbo].[Users] ([UserID], [Username], [PasswordHash], [RoleID], [IsActive]) VALUES (2, N'mxp1803.bacsi1@gmail.com', N'$2a$11$iXOJctEK0HkgDUaLajgVSu3ySsIKkJD8gcecGdHrjm4/IyS7Xi8oi', 2, 1)
GO
INSERT [dbo].[Users] ([UserID], [Username], [PasswordHash], [RoleID], [IsActive]) VALUES (3, N'mxp1803.bacsi2@gmail.com', N'$2a$11$iXOJctEK0HkgDUaLajgVSu3ySsIKkJD8gcecGdHrjm4/IyS7Xi8oi', 2, 1)
GO
INSERT [dbo].[Users] ([UserID], [Username], [PasswordHash], [RoleID], [IsActive]) VALUES (4, N'mxp1803.bacsi3@gmail.com', N'$2a$11$iXOJctEK0HkgDUaLajgVSu3ySsIKkJD8gcecGdHrjm4/IyS7Xi8oi', 2, 1)
GO
INSERT [dbo].[Users] ([UserID], [Username], [PasswordHash], [RoleID], [IsActive]) VALUES (5, N'mxp1803.letan1@gmail.com', N'$2a$11$iXOJctEK0HkgDUaLajgVSu3ySsIKkJD8gcecGdHrjm4/IyS7Xi8oi', 3, 1)
GO
INSERT [dbo].[Users] ([UserID], [Username], [PasswordHash], [RoleID], [IsActive]) VALUES (6, N'mxp1803.letan2@gmail.com', N'$2a$11$iXOJctEK0HkgDUaLajgVSu3ySsIKkJD8gcecGdHrjm4/IyS7Xi8oi', 3, 1)
GO
INSERT [dbo].[Users] ([UserID], [Username], [PasswordHash], [RoleID], [IsActive]) VALUES (7, N'mxp1803.thungan1@gmail.com', N'$2a$11$iXOJctEK0HkgDUaLajgVSu3ySsIKkJD8gcecGdHrjm4/IyS7Xi8oi', 4, 1)
GO
INSERT [dbo].[Users] ([UserID], [Username], [PasswordHash], [RoleID], [IsActive]) VALUES (8, N'mxp1803.quanlykho1@gmail.com', N'$2a$11$iXOJctEK0HkgDUaLajgVSu3ySsIKkJD8gcecGdHrjm4/IyS7Xi8oi', 5, 1)
GO
INSERT [dbo].[Users] ([UserID], [Username], [PasswordHash], [RoleID], [IsActive]) VALUES (9, N'mxp1803.bacsi4@gmail.com', N'$2a$11$iXOJctEK0HkgDUaLajgVSu3ySsIKkJD8gcecGdHrjm4/IyS7Xi8oi', 2, 1)
GO
INSERT [dbo].[Users] ([UserID], [Username], [PasswordHash], [RoleID], [IsActive]) VALUES (10, N'mxp1803.bacsi5@gmail.com', N'$2a$11$iXOJctEK0HkgDUaLajgVSu3ySsIKkJD8gcecGdHrjm4/IyS7Xi8oi', 2, 1)
GO
SET IDENTITY_INSERT [dbo].[Users] OFF
GO
SET ANSI_PADDING ON

GO
/****** Object:  Index [UQ__DanhMucK__AAD3615840AEBE5D]    Script Date: 8/17/2026 9:29:10 PM ******/
ALTER TABLE [dbo].[DanhMucKhoa] ADD UNIQUE NONCLUSTERED 
(
	[TenKhoa] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON

GO
/****** Object:  Index [UQ_LichLamViec_BacSi_Ngay_Ca]    Script Date: 8/17/2026 9:29:10 PM ******/
ALTER TABLE [dbo].[LichLamViec] ADD  CONSTRAINT [UQ_LichLamViec_BacSi_Ngay_Ca] UNIQUE NONCLUSTERED 
(
	[MaNV] ASC,
	[NgayLamViec] ASC,
	[CaLamViec] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [UQ__NhanVien__1788CCAD06CD0FBA]    Script Date: 8/17/2026 9:29:10 PM ******/
ALTER TABLE [dbo].[NhanVien] ADD UNIQUE NONCLUSTERED 
(
	[UserID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON

GO
/****** Object:  Index [UQ__Roles__8A2B6160C015B4BC]    Script Date: 8/17/2026 9:29:10 PM ******/
ALTER TABLE [dbo].[Roles] ADD UNIQUE NONCLUSTERED 
(
	[RoleName] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON

GO
/****** Object:  Index [UQ__Users__536C85E4F3EDCB1B]    Script Date: 8/17/2026 9:29:10 PM ******/
ALTER TABLE [dbo].[Users] ADD UNIQUE NONCLUSTERED 
(
	[Username] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
ALTER TABLE [dbo].[ChiTietDichVuYTe] ADD  DEFAULT ((1)) FOR [TrangThai]
GO
ALTER TABLE [dbo].[ChiTietDonThuoc] ADD  DEFAULT ((0)) FOR [TrangThaiPhatThuoc]
GO
ALTER TABLE [dbo].[DanhMucThuoc] ADD  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [dbo].[DanhMucVatTu] ADD  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [dbo].[DatLichKham] ADD  DEFAULT ('ChoXacNhan') FOR [TrangThai]
GO
ALTER TABLE [dbo].[DichVuYTe] ADD  DEFAULT ((0)) FOR [TrangThaiDichVu]
GO
ALTER TABLE [dbo].[DonThuoc] ADD  DEFAULT (getdate()) FOR [NgayKeDon]
GO
ALTER TABLE [dbo].[HoaDon] ADD  DEFAULT (getdate()) FOR [NgayThanhToan]
GO
ALTER TABLE [dbo].[HoaDon] ADD  DEFAULT ((0)) FOR [TongTienDichVu]
GO
ALTER TABLE [dbo].[HoaDon] ADD  DEFAULT ((0)) FOR [TongTienThuoc]
GO
ALTER TABLE [dbo].[HoaDon] ADD  DEFAULT ((0)) FOR [TrangThaiThanhToan]
GO
ALTER TABLE [dbo].[LichLamViec] ADD  DEFAULT (getdate()) FOR [NgayDangKy]
GO
ALTER TABLE [dbo].[PhieuKham] ADD  DEFAULT (getdate()) FOR [NgayKham]
GO
ALTER TABLE [dbo].[PhieuKham] ADD  DEFAULT ((0)) FOR [TrangThaiKham]
GO
ALTER TABLE [dbo].[Users] ADD  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [dbo].[ChiTietDonThuoc]  WITH CHECK ADD FOREIGN KEY([MaDonThuoc])
REFERENCES [dbo].[DonThuoc] ([MaDonThuoc])
GO
ALTER TABLE [dbo].[ChiTietDonThuoc]  WITH CHECK ADD FOREIGN KEY([MaThuoc])
REFERENCES [dbo].[DanhMucThuoc] ([MaThuoc])
GO
ALTER TABLE [dbo].[ChiTietDonThuoc_Lo]  WITH CHECK ADD  CONSTRAINT [FK_CTDTLo_ChiTietDonThuoc] FOREIGN KEY([MaDonThuoc], [MaThuoc])
REFERENCES [dbo].[ChiTietDonThuoc] ([MaDonThuoc], [MaThuoc])
GO
ALTER TABLE [dbo].[ChiTietDonThuoc_Lo] CHECK CONSTRAINT [FK_CTDTLo_ChiTietDonThuoc]
GO
ALTER TABLE [dbo].[ChiTietDonThuoc_Lo]  WITH CHECK ADD  CONSTRAINT [FK_CTDTLo_LoThuoc] FOREIGN KEY([MaLo])
REFERENCES [dbo].[LoThuoc] ([MaLo])
GO
ALTER TABLE [dbo].[ChiTietDonThuoc_Lo] CHECK CONSTRAINT [FK_CTDTLo_LoThuoc]
GO
ALTER TABLE [dbo].[ChiTietPhieuKhamICD]  WITH CHECK ADD FOREIGN KEY([MaICD])
REFERENCES [dbo].[DanhMucICD] ([MaICD])
GO
ALTER TABLE [dbo].[ChiTietPhieuKhamICD]  WITH CHECK ADD FOREIGN KEY([MaPhieu])
REFERENCES [dbo].[PhieuKham] ([MaPhieu])
GO
ALTER TABLE [dbo].[ChiTietVatTu_Lo]  WITH CHECK ADD  CONSTRAINT [FK_CTVTLo_ChiTietVatTu] FOREIGN KEY([MaPhieu], [MaVatTu])
REFERENCES [dbo].[ChiTietVatTuPhieuKham] ([MaPhieu], [MaVatTu])
GO
ALTER TABLE [dbo].[ChiTietVatTu_Lo] CHECK CONSTRAINT [FK_CTVTLo_ChiTietVatTu]
GO
ALTER TABLE [dbo].[ChiTietVatTu_Lo]  WITH CHECK ADD  CONSTRAINT [FK_CTVTLo_LoVatTu] FOREIGN KEY([MaLo])
REFERENCES [dbo].[LoVatTu] ([MaLo])
GO
ALTER TABLE [dbo].[ChiTietVatTu_Lo] CHECK CONSTRAINT [FK_CTVTLo_LoVatTu]
GO
ALTER TABLE [dbo].[ChiTietVatTuPhieuKham]  WITH CHECK ADD FOREIGN KEY([MaPhieu])
REFERENCES [dbo].[PhieuKham] ([MaPhieu])
GO
ALTER TABLE [dbo].[ChiTietVatTuPhieuKham]  WITH CHECK ADD FOREIGN KEY([MaVatTu])
REFERENCES [dbo].[DanhMucVatTu] ([MaVatTu])
GO
ALTER TABLE [dbo].[DatLichKham]  WITH CHECK ADD  CONSTRAINT [FK_DatLichKham_NhanVien] FOREIGN KEY([MaNV])
REFERENCES [dbo].[NhanVien] ([MaNV])
GO
ALTER TABLE [dbo].[DatLichKham] CHECK CONSTRAINT [FK_DatLichKham_NhanVien]
GO
ALTER TABLE [dbo].[DichVuYTe]  WITH CHECK ADD FOREIGN KEY([MaPhieu])
REFERENCES [dbo].[PhieuKham] ([MaPhieu])
GO
ALTER TABLE [dbo].[DichVuYTe]  WITH CHECK ADD  CONSTRAINT [FK_DichVuYTe_ChiTietDichVuYTe] FOREIGN KEY([MaDV])
REFERENCES [dbo].[ChiTietDichVuYTe] ([MaDV])
GO
ALTER TABLE [dbo].[DichVuYTe] CHECK CONSTRAINT [FK_DichVuYTe_ChiTietDichVuYTe]
GO
ALTER TABLE [dbo].[DonThuoc]  WITH CHECK ADD FOREIGN KEY([MaPhieu])
REFERENCES [dbo].[PhieuKham] ([MaPhieu])
GO
ALTER TABLE [dbo].[HoaDon]  WITH CHECK ADD FOREIGN KEY([MaNV])
REFERENCES [dbo].[NhanVien] ([MaNV])
GO
ALTER TABLE [dbo].[HoaDon]  WITH CHECK ADD FOREIGN KEY([MaPhieu])
REFERENCES [dbo].[PhieuKham] ([MaPhieu])
GO
ALTER TABLE [dbo].[LichLamViec]  WITH CHECK ADD  CONSTRAINT [FK_LichLamViec_NhanVien] FOREIGN KEY([MaNV])
REFERENCES [dbo].[NhanVien] ([MaNV])
GO
ALTER TABLE [dbo].[LichLamViec] CHECK CONSTRAINT [FK_LichLamViec_NhanVien]
GO
ALTER TABLE [dbo].[LoThuoc]  WITH CHECK ADD FOREIGN KEY([MaNCC])
REFERENCES [dbo].[NhaCungCap] ([MaNCC])
GO
ALTER TABLE [dbo].[LoThuoc]  WITH CHECK ADD FOREIGN KEY([MaThuoc])
REFERENCES [dbo].[DanhMucThuoc] ([MaThuoc])
GO
ALTER TABLE [dbo].[LoVatTu]  WITH CHECK ADD  CONSTRAINT [FK_LoVatTu_DanhMucVatTu] FOREIGN KEY([MaVatTu])
REFERENCES [dbo].[DanhMucVatTu] ([MaVatTu])
GO
ALTER TABLE [dbo].[LoVatTu] CHECK CONSTRAINT [FK_LoVatTu_DanhMucVatTu]
GO
ALTER TABLE [dbo].[LoVatTu]  WITH CHECK ADD  CONSTRAINT [FK_LoVatTu_NhaCungCap] FOREIGN KEY([MaNcc])
REFERENCES [dbo].[NhaCungCap] ([MaNCC])
GO
ALTER TABLE [dbo].[LoVatTu] CHECK CONSTRAINT [FK_LoVatTu_NhaCungCap]
GO
ALTER TABLE [dbo].[NhanVien]  WITH CHECK ADD FOREIGN KEY([MaKhoa])
REFERENCES [dbo].[DanhMucKhoa] ([MaKhoa])
GO
ALTER TABLE [dbo].[NhanVien]  WITH CHECK ADD FOREIGN KEY([UserID])
REFERENCES [dbo].[Users] ([UserID])
GO
ALTER TABLE [dbo].[PhieuKham]  WITH CHECK ADD FOREIGN KEY([MaBN])
REFERENCES [dbo].[BenhNhan] ([MaBN])
GO
ALTER TABLE [dbo].[PhieuKham]  WITH CHECK ADD FOREIGN KEY([MaNV])
REFERENCES [dbo].[NhanVien] ([MaNV])
GO
ALTER TABLE [dbo].[Users]  WITH CHECK ADD FOREIGN KEY([RoleID])
REFERENCES [dbo].[Roles] ([RoleID])
GO
ALTER TABLE [dbo].[DatLichKham]  WITH CHECK ADD  CONSTRAINT [CK_DatLichKham_Ca] CHECK  (([CaHen] IS NULL OR ([CaHen]='Chieu' OR [CaHen]='Sang')))
GO
ALTER TABLE [dbo].[DatLichKham] CHECK CONSTRAINT [CK_DatLichKham_Ca]
GO
ALTER TABLE [dbo].[DatLichKham]  WITH CHECK ADD  CONSTRAINT [CK_DatLichKham_TrangThai] CHECK  (([TrangThai]='DaHuy' OR [TrangThai]='DaTiepNhan' OR [TrangThai]='DaXacNhan' OR [TrangThai]='ChoXacNhan'))
GO
ALTER TABLE [dbo].[DatLichKham] CHECK CONSTRAINT [CK_DatLichKham_TrangThai]
GO
ALTER TABLE [dbo].[LichLamViec]  WITH CHECK ADD  CONSTRAINT [CK_LichLamViec_Ca] CHECK  (([CaLamViec]='Chieu' OR [CaLamViec]='Sang'))
GO
ALTER TABLE [dbo].[LichLamViec] CHECK CONSTRAINT [CK_LichLamViec_Ca]
GO
