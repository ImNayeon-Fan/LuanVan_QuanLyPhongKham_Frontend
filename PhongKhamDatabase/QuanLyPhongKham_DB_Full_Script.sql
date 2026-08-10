USE [master]
GO
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'QuanLyPhongKham_DB')
BEGIN
    CREATE DATABASE [QuanLyPhongKham_DB]
END
GO
USE [QuanLyPhongKham_DB]
GO
/****** Object:  Table [dbo].[BenhNhan]    Script Date: 8/10/2026 11:21:09 PM ******/
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
/****** Object:  Table [dbo].[ChiTietDichVuYTe]    Script Date: 8/10/2026 11:21:09 PM ******/
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
/****** Object:  Table [dbo].[ChiTietDonThuoc]    Script Date: 8/10/2026 11:21:09 PM ******/
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
/****** Object:  Table [dbo].[ChiTietDonThuoc_Lo]    Script Date: 8/10/2026 11:21:09 PM ******/
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
/****** Object:  Table [dbo].[ChiTietPhieuKhamICD]    Script Date: 8/10/2026 11:21:09 PM ******/
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
/****** Object:  Table [dbo].[ChiTietVatTu_Lo]    Script Date: 8/10/2026 11:21:09 PM ******/
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
/****** Object:  Table [dbo].[ChiTietVatTuPhieuKham]    Script Date: 8/10/2026 11:21:09 PM ******/
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
/****** Object:  Table [dbo].[DanhMucICD]    Script Date: 8/10/2026 11:21:09 PM ******/
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
/****** Object:  Table [dbo].[DanhMucKhoa]    Script Date: 8/10/2026 11:21:09 PM ******/
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
/****** Object:  Table [dbo].[DanhMucThuoc]    Script Date: 8/10/2026 11:21:09 PM ******/
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
/****** Object:  Table [dbo].[DanhMucVatTu]    Script Date: 8/10/2026 11:21:09 PM ******/
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
/****** Object:  Table [dbo].[DatLichKham]    Script Date: 8/10/2026 11:21:09 PM ******/
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
/****** Object:  Table [dbo].[DichVuYTe]    Script Date: 8/10/2026 11:21:09 PM ******/
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
/****** Object:  Table [dbo].[DonThuoc]    Script Date: 8/10/2026 11:21:09 PM ******/
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
/****** Object:  Table [dbo].[HoaDon]    Script Date: 8/10/2026 11:21:09 PM ******/
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
/****** Object:  Table [dbo].[LichLamViec]    Script Date: 8/10/2026 11:21:09 PM ******/
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
/****** Object:  Table [dbo].[LoThuoc]    Script Date: 8/10/2026 11:21:09 PM ******/
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
/****** Object:  Table [dbo].[LoVatTu]    Script Date: 8/10/2026 11:21:09 PM ******/
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
/****** Object:  Table [dbo].[NhaCungCap]    Script Date: 8/10/2026 11:21:09 PM ******/
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
/****** Object:  Table [dbo].[NhanVien]    Script Date: 8/10/2026 11:21:09 PM ******/
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
/****** Object:  Table [dbo].[PhieuKham]    Script Date: 8/10/2026 11:21:09 PM ******/
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
/****** Object:  Table [dbo].[Roles]    Script Date: 8/10/2026 11:21:09 PM ******/
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
/****** Object:  Table [dbo].[Users]    Script Date: 8/10/2026 11:21:09 PM ******/
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
INSERT [dbo].[BenhNhan] ([MaBN], [HoTen], [NgaySinh], [GioiTinh], [SDT], [DiaChi], [TienSuBenh]) VALUES (N'BN260703001', N'PHAN NHỰT PHÁT', CAST(N'2007-09-12' AS Date), N'Nam', N'0896431456', N'abc', N'abc')
GO
INSERT [dbo].[BenhNhan] ([MaBN], [HoTen], [NgaySinh], [GioiTinh], [SDT], [DiaChi], [TienSuBenh]) VALUES (N'BN260711001', N'MAI XUÂN TEST', CAST(N'2002-03-18' AS Date), N'Nam', N'0896451157', N'A105/28 Nguyễn Thần Hiến Phường Chợ Lớn', N'không có')
GO
INSERT [dbo].[BenhNhan] ([MaBN], [HoTen], [NgaySinh], [GioiTinh], [SDT], [DiaChi], [TienSuBenh]) VALUES (N'BN260711002', N'MAI XUÂN KIÊN', CAST(N'2004-02-14' AS Date), N'Nữ', N'0896458713', N'A105/28 Nguyễn Thần Hiến Phường Diên Hồng', N'không có')
GO
INSERT [dbo].[BenhNhan] ([MaBN], [HoTen], [NgaySinh], [GioiTinh], [SDT], [DiaChi], [TienSuBenh]) VALUES (N'BN260714001', N'MAI XUÂN KIÊN', CAST(N'2003-03-18' AS Date), N'Nam', N'0896421137', N'test', N'test')
GO
INSERT [dbo].[BenhNhan] ([MaBN], [HoTen], [NgaySinh], [GioiTinh], [SDT], [DiaChi], [TienSuBenh]) VALUES (N'BN260719001', N'test', CAST(N'1998-03-20' AS Date), N'Nam', N'0896456789', N'test', N'test')
GO
INSERT [dbo].[BenhNhan] ([MaBN], [HoTen], [NgaySinh], [GioiTinh], [SDT], [DiaChi], [TienSuBenh]) VALUES (N'BN260723001', N'Mai Xuân Hiên', CAST(N'2002-02-12' AS Date), N'Nam', N'0896456123', N'a105 Nhật Tảo', N'không có')
GO
INSERT [dbo].[BenhNhan] ([MaBN], [HoTen], [NgaySinh], [GioiTinh], [SDT], [DiaChi], [TienSuBenh]) VALUES (N'BN260723002', N'MAI XUÂN HIÊN 2', CAST(N'2002-02-12' AS Date), N'Nam', N'0896123456', N'a12 Nhật Tảo', N'Không có')
GO
INSERT [dbo].[BenhNhan] ([MaBN], [HoTen], [NgaySinh], [GioiTinh], [SDT], [DiaChi], [TienSuBenh]) VALUES (N'BN260724001', N'TESTER', CAST(N'2002-02-12' AS Date), N'Nam', N'0896321159', N'test lọ', N'test lọ')
GO
INSERT [dbo].[BenhNhan] ([MaBN], [HoTen], [NgaySinh], [GioiTinh], [SDT], [DiaChi], [TienSuBenh]) VALUES (N'BN260724002', N'TESTER 2', CAST(N'2002-02-12' AS Date), N'Nam', N'0896546123', N'tester', N'tester')
GO
INSERT [dbo].[BenhNhan] ([MaBN], [HoTen], [NgaySinh], [GioiTinh], [SDT], [DiaChi], [TienSuBenh]) VALUES (N'BN260806001', N'testtt', CAST(N'2003-03-18' AS Date), N'Nam', N'0896523123', N'test', N'test')
GO
INSERT [dbo].[ChiTietDichVuYTe] ([MaDV], [TenDV], [GiaTien], [TrangThai]) VALUES (N'DV001', N'Siêu âm ổ bụng tổng quát', CAST(64000.00 AS Decimal(18, 2)), 1)
GO
INSERT [dbo].[ChiTietDichVuYTe] ([MaDV], [TenDV], [GiaTien], [TrangThai]) VALUES (N'DV002', N'Siêu âm tim màu', CAST(156000.00 AS Decimal(18, 2)), 1)
GO
INSERT [dbo].[ChiTietDichVuYTe] ([MaDV], [TenDV], [GiaTien], [TrangThai]) VALUES (N'DV003', N'Siêu âm tuyến giáp', CAST(141000.00 AS Decimal(18, 2)), 1)
GO
INSERT [dbo].[ChiTietDichVuYTe] ([MaDV], [TenDV], [GiaTien], [TrangThai]) VALUES (N'DV004', N'Siêu âm tuyến vú hai bên', CAST(43000.00 AS Decimal(18, 2)), 1)
GO
INSERT [dbo].[ChiTietDichVuYTe] ([MaDV], [TenDV], [GiaTien], [TrangThai]) VALUES (N'DV005', N'Siêu âm mạch máu chi dưới', CAST(156000.00 AS Decimal(18, 2)), 1)
GO
INSERT [dbo].[ChiTietDichVuYTe] ([MaDV], [TenDV], [GiaTien], [TrangThai]) VALUES (N'DV006', N'Siêu âm thai 4D', CAST(60000.00 AS Decimal(18, 2)), 1)
GO
INSERT [dbo].[ChiTietDichVuYTe] ([MaDV], [TenDV], [GiaTien], [TrangThai]) VALUES (N'DV007', N'Siêu âm khớp gối', CAST(86000.00 AS Decimal(18, 2)), 1)
GO
INSERT [dbo].[ChiTietDichVuYTe] ([MaDV], [TenDV], [GiaTien], [TrangThai]) VALUES (N'DV008', N'X-quang ngực thẳng kỹ thuật số', CAST(92000.00 AS Decimal(18, 2)), 1)
GO
INSERT [dbo].[ChiTietDichVuYTe] ([MaDV], [TenDV], [GiaTien], [TrangThai]) VALUES (N'DV009', N'X-quang cột sống thắt lưng thẳng nghiêng', CAST(83000.00 AS Decimal(18, 2)), 1)
GO
INSERT [dbo].[ChiTietDichVuYTe] ([MaDV], [TenDV], [GiaTien], [TrangThai]) VALUES (N'DV010', N'X-quang xương đùi thẳng nghiêng', CAST(39000.00 AS Decimal(18, 2)), 1)
GO
INSERT [dbo].[ChiTietDichVuYTe] ([MaDV], [TenDV], [GiaTien], [TrangThai]) VALUES (N'DV011', N'X-quang khớp gối thẳng nghiêng', CAST(192000.00 AS Decimal(18, 2)), 1)
GO
INSERT [dbo].[ChiTietDichVuYTe] ([MaDV], [TenDV], [GiaTien], [TrangThai]) VALUES (N'DV012', N'X-quang sọ thẳng nghiêng', CAST(113000.00 AS Decimal(18, 2)), 1)
GO
INSERT [dbo].[ChiTietDichVuYTe] ([MaDV], [TenDV], [GiaTien], [TrangThai]) VALUES (N'DV013', N'X-quang xoang tư thế Blondeau Hirtz', CAST(104000.00 AS Decimal(18, 2)), 1)
GO
INSERT [dbo].[ChiTietDichVuYTe] ([MaDV], [TenDV], [GiaTien], [TrangThai]) VALUES (N'DV014', N'Nội soi tai mũi họng ống cứng', CAST(110000.00 AS Decimal(18, 2)), 1)
GO
INSERT [dbo].[ChiTietDichVuYTe] ([MaDV], [TenDV], [GiaTien], [TrangThai]) VALUES (N'DV015', N'Nội soi dạ dày tá tràng không gây mê', CAST(78000.00 AS Decimal(18, 2)), 1)
GO
INSERT [dbo].[ChiTietDichVuYTe] ([MaDV], [TenDV], [GiaTien], [TrangThai]) VALUES (N'DV016', N'Nội soi dạ dày tá tràng có gây mê', CAST(157000.00 AS Decimal(18, 2)), 1)
GO
INSERT [dbo].[ChiTietDichVuYTe] ([MaDV], [TenDV], [GiaTien], [TrangThai]) VALUES (N'DV017', N'Nội soi đại trực tràng có gây mê', CAST(133000.00 AS Decimal(18, 2)), 1)
GO
INSERT [dbo].[ChiTietDichVuYTe] ([MaDV], [TenDV], [GiaTien], [TrangThai]) VALUES (N'DV018', N'Điện tâm đồ (ECG) 12 cần', CAST(60000.00 AS Decimal(18, 2)), 1)
GO
INSERT [dbo].[ChiTietDichVuYTe] ([MaDV], [TenDV], [GiaTien], [TrangThai]) VALUES (N'DV019', N'Điện não đồ (EEG) kỹ thuật số', CAST(170000.00 AS Decimal(18, 2)), 1)
GO
INSERT [dbo].[ChiTietDichVuYTe] ([MaDV], [TenDV], [GiaTien], [TrangThai]) VALUES (N'DV020', N'Điện cơ đồ (EMG)', CAST(65000.00 AS Decimal(18, 2)), 1)
GO
INSERT [dbo].[ChiTietDichVuYTe] ([MaDV], [TenDV], [GiaTien], [TrangThai]) VALUES (N'DV021', N'Xét nghiệm công thức máu toàn bộ (24 chỉ số)', CAST(109000.00 AS Decimal(18, 2)), 1)
GO
INSERT [dbo].[ChiTietDichVuYTe] ([MaDV], [TenDV], [GiaTien], [TrangThai]) VALUES (N'DV022', N'Xét nghiệm đường huyết lúc đói (Glucose)', CAST(39000.00 AS Decimal(18, 2)), 1)
GO
INSERT [dbo].[ChiTietDichVuYTe] ([MaDV], [TenDV], [GiaTien], [TrangThai]) VALUES (N'DV023', N'Xét nghiệm HbA1c (Đường trung bình 3 tháng)', CAST(56000.00 AS Decimal(18, 2)), 1)
GO
INSERT [dbo].[ChiTietDichVuYTe] ([MaDV], [TenDV], [GiaTien], [TrangThai]) VALUES (N'DV024', N'Xét nghiệm chức năng gan AST (SGOT)', CAST(35000.00 AS Decimal(18, 2)), 1)
GO
INSERT [dbo].[ChiTietDichVuYTe] ([MaDV], [TenDV], [GiaTien], [TrangThai]) VALUES (N'DV025', N'Xét nghiệm chức năng gan ALT (SGPT)', CAST(135000.00 AS Decimal(18, 2)), 1)
GO
INSERT [dbo].[ChiTietDichVuYTe] ([MaDV], [TenDV], [GiaTien], [TrangThai]) VALUES (N'DV026', N'Xét nghiệm chức năng gan GGT', CAST(85000.00 AS Decimal(18, 2)), 1)
GO
INSERT [dbo].[ChiTietDichVuYTe] ([MaDV], [TenDV], [GiaTien], [TrangThai]) VALUES (N'DV027', N'Xét nghiệm Bilirubin toàn phần', CAST(55000.00 AS Decimal(18, 2)), 1)
GO
INSERT [dbo].[ChiTietDichVuYTe] ([MaDV], [TenDV], [GiaTien], [TrangThai]) VALUES (N'DV028', N'Xét nghiệm chức năng thận Ure', CAST(116000.00 AS Decimal(18, 2)), 1)
GO
INSERT [dbo].[ChiTietDichVuYTe] ([MaDV], [TenDV], [GiaTien], [TrangThai]) VALUES (N'DV029', N'Xét nghiệm chức năng thận Creatinin', CAST(42000.00 AS Decimal(18, 2)), 1)
GO
INSERT [dbo].[ChiTietDichVuYTe] ([MaDV], [TenDV], [GiaTien], [TrangThai]) VALUES (N'DV030', N'Xét nghiệm Acid Uric (Chẩn đoán Gút)', CAST(66000.00 AS Decimal(18, 2)), 1)
GO
INSERT [dbo].[ChiTietDichVuYTe] ([MaDV], [TenDV], [GiaTien], [TrangThai]) VALUES (N'DV031', N'Xét nghiệm Mỡ máu Cholesterol toàn phần', CAST(115000.00 AS Decimal(18, 2)), 1)
GO
INSERT [dbo].[ChiTietDichVuYTe] ([MaDV], [TenDV], [GiaTien], [TrangThai]) VALUES (N'DV032', N'Xét nghiệm Mỡ máu Triglyceride', CAST(115000.00 AS Decimal(18, 2)), 1)
GO
INSERT [dbo].[ChiTietDichVuYTe] ([MaDV], [TenDV], [GiaTien], [TrangThai]) VALUES (N'DV033', N'Xét nghiệm Mỡ máu HDL-Cholesterol', CAST(92000.00 AS Decimal(18, 2)), 1)
GO
INSERT [dbo].[ChiTietDichVuYTe] ([MaDV], [TenDV], [GiaTien], [TrangThai]) VALUES (N'DV034', N'Xét nghiệm Mỡ máu LDL-Cholesterol', CAST(141000.00 AS Decimal(18, 2)), 1)
GO
INSERT [dbo].[ChiTietDichVuYTe] ([MaDV], [TenDV], [GiaTien], [TrangThai]) VALUES (N'DV035', N'Xét nghiệm nước tiểu toàn bộ (10 thông số)', CAST(195000.00 AS Decimal(18, 2)), 1)
GO
INSERT [dbo].[ChiTietDichVuYTe] ([MaDV], [TenDV], [GiaTien], [TrangThai]) VALUES (N'DV036', N'Xét nghiệm nước tiểu vi thể', CAST(179000.00 AS Decimal(18, 2)), 1)
GO
INSERT [dbo].[ChiTietDichVuYTe] ([MaDV], [TenDV], [GiaTien], [TrangThai]) VALUES (N'DV037', N'Xét nghiệm viêm gan B HBsAg test nhanh', CAST(57000.00 AS Decimal(18, 2)), 1)
GO
INSERT [dbo].[ChiTietDichVuYTe] ([MaDV], [TenDV], [GiaTien], [TrangThai]) VALUES (N'DV038', N'Xét nghiệm viêm gan B HBsAg định lượng', CAST(132000.00 AS Decimal(18, 2)), 1)
GO
INSERT [dbo].[ChiTietDichVuYTe] ([MaDV], [TenDV], [GiaTien], [TrangThai]) VALUES (N'DV039', N'Xét nghiệm kháng thể viêm gan B Anti-HBs', CAST(183000.00 AS Decimal(18, 2)), 1)
GO
INSERT [dbo].[ChiTietDichVuYTe] ([MaDV], [TenDV], [GiaTien], [TrangThai]) VALUES (N'DV040', N'Xét nghiệm viêm gan C Anti-HCV test nhanh', CAST(38000.00 AS Decimal(18, 2)), 1)
GO
INSERT [dbo].[ChiTietDichVuYTe] ([MaDV], [TenDV], [GiaTien], [TrangThai]) VALUES (N'DV041', N'Xét nghiệm HIV test nhanh', CAST(57000.00 AS Decimal(18, 2)), 1)
GO
INSERT [dbo].[ChiTietDichVuYTe] ([MaDV], [TenDV], [GiaTien], [TrangThai]) VALUES (N'DV042', N'Xét nghiệm Giang mai Syphilis test nhanh', CAST(130000.00 AS Decimal(18, 2)), 1)
GO
INSERT [dbo].[ChiTietDichVuYTe] ([MaDV], [TenDV], [GiaTien], [TrangThai]) VALUES (N'DV043', N'Xét nghiệm chức năng tuyến giáp TSH', CAST(181000.00 AS Decimal(18, 2)), 1)
GO
INSERT [dbo].[ChiTietDichVuYTe] ([MaDV], [TenDV], [GiaTien], [TrangThai]) VALUES (N'DV044', N'Xét nghiệm chức năng tuyến giáp Free T3', CAST(56000.00 AS Decimal(18, 2)), 1)
GO
INSERT [dbo].[ChiTietDichVuYTe] ([MaDV], [TenDV], [GiaTien], [TrangThai]) VALUES (N'DV045', N'Xét nghiệm chức năng tuyến giáp Free T4', CAST(170000.00 AS Decimal(18, 2)), 1)
GO
INSERT [dbo].[ChiTietDichVuYTe] ([MaDV], [TenDV], [GiaTien], [TrangThai]) VALUES (N'DV046', N'Xét nghiệm định lượng Calci huyết thanh', CAST(184000.00 AS Decimal(18, 2)), 1)
GO
INSERT [dbo].[ChiTietDichVuYTe] ([MaDV], [TenDV], [GiaTien], [TrangThai]) VALUES (N'DV047', N'Xét nghiệm định lượng Sắt huyết thanh', CAST(93000.00 AS Decimal(18, 2)), 1)
GO
INSERT [dbo].[ChiTietDichVuYTe] ([MaDV], [TenDV], [GiaTien], [TrangThai]) VALUES (N'DV048', N'Test nhanh Helicobacter pylori (Hp) qua hơi thở', CAST(161000.00 AS Decimal(18, 2)), 1)
GO
INSERT [dbo].[ChiTietDichVuYTe] ([MaDV], [TenDV], [GiaTien], [TrangThai]) VALUES (N'DV049', N'Test nhanh HP qua phân', CAST(109000.00 AS Decimal(18, 2)), 1)
GO
INSERT [dbo].[ChiTietDichVuYTe] ([MaDV], [TenDV], [GiaTien], [TrangThai]) VALUES (N'DV050', N'Xét nghiệm đông máu đông cầm máu (PT/APTT)', CAST(67000.00 AS Decimal(18, 2)), 1)
GO
INSERT [dbo].[ChiTietDichVuYTe] ([MaDV], [TenDV], [GiaTien], [TrangThai]) VALUES (N'DV051', N'siêu âm tim 00001', CAST(2000000.00 AS Decimal(18, 2)), 1)
GO
INSERT [dbo].[ChiTietDonThuoc] ([MaDonThuoc], [MaThuoc], [SoLuong], [CachDung], [TrangThaiPhatThuoc]) VALUES (N'DT260709001', N'TH001', 1, N'Ngày uống 2 lần, mỗi lần 1 viên', 0)
GO
INSERT [dbo].[ChiTietDonThuoc] ([MaDonThuoc], [MaThuoc], [SoLuong], [CachDung], [TrangThaiPhatThuoc]) VALUES (N'DT260711001', N'TH001', 1, N'Ngày uống 2 lần, mỗi lần 1 viên', 0)
GO
INSERT [dbo].[ChiTietDonThuoc] ([MaDonThuoc], [MaThuoc], [SoLuong], [CachDung], [TrangThaiPhatThuoc]) VALUES (N'DT260711001', N'TH002', 1, N'Ngày uống 2 lần, mỗi lần 1 viên', 0)
GO
INSERT [dbo].[ChiTietDonThuoc] ([MaDonThuoc], [MaThuoc], [SoLuong], [CachDung], [TrangThaiPhatThuoc]) VALUES (N'DT260714001', N'TH004', 1, N'Ngày uống 2 lần, mỗi lần 1 viên', 0)
GO
INSERT [dbo].[ChiTietDonThuoc] ([MaDonThuoc], [MaThuoc], [SoLuong], [CachDung], [TrangThaiPhatThuoc]) VALUES (N'DT260714001', N'TH005', 1, N'Ngày uống 2 lần, mỗi lần 1 viên', 0)
GO
INSERT [dbo].[ChiTietDonThuoc] ([MaDonThuoc], [MaThuoc], [SoLuong], [CachDung], [TrangThaiPhatThuoc]) VALUES (N'DT260714001', N'TH009', 1, N'Ngày uống 2 lần, mỗi lần 1 viên', 0)
GO
INSERT [dbo].[ChiTietDonThuoc] ([MaDonThuoc], [MaThuoc], [SoLuong], [CachDung], [TrangThaiPhatThuoc]) VALUES (N'DT260723001', N'TH004', 15, N'Ngày uống 2 lần, mỗi lần 1 viên', 0)
GO
INSERT [dbo].[ChiTietDonThuoc] ([MaDonThuoc], [MaThuoc], [SoLuong], [CachDung], [TrangThaiPhatThuoc]) VALUES (N'DT260723001', N'TH005', 1, N'Ngày uống 2 lần, mỗi lần 1 viên', 0)
GO
INSERT [dbo].[ChiTietDonThuoc] ([MaDonThuoc], [MaThuoc], [SoLuong], [CachDung], [TrangThaiPhatThuoc]) VALUES (N'DT260724001', N'TH003', 1, N'uống sáng', 0)
GO
INSERT [dbo].[ChiTietDonThuoc] ([MaDonThuoc], [MaThuoc], [SoLuong], [CachDung], [TrangThaiPhatThuoc]) VALUES (N'DT260724001', N'TH004', 1, N'uống chiều', 0)
GO
INSERT [dbo].[ChiTietDonThuoc] ([MaDonThuoc], [MaThuoc], [SoLuong], [CachDung], [TrangThaiPhatThuoc]) VALUES (N'DT260806001', N'TH003', 12, N'sáng 6 viên chiều 6 viên', 0)
GO
INSERT [dbo].[ChiTietDonThuoc_Lo] ([MaDonThuoc], [MaThuoc], [MaLo], [SoLuongTru]) VALUES (N'DT260724001', N'TH003', N'LTH003', 1)
GO
INSERT [dbo].[ChiTietDonThuoc_Lo] ([MaDonThuoc], [MaThuoc], [MaLo], [SoLuongTru]) VALUES (N'DT260724001', N'TH004', N'LTH004', 1)
GO
INSERT [dbo].[ChiTietDonThuoc_Lo] ([MaDonThuoc], [MaThuoc], [MaLo], [SoLuongTru]) VALUES (N'DT260806001', N'TH003', N'LTH003', 12)
GO
INSERT [dbo].[ChiTietPhieuKhamICD] ([MaPhieu], [MaICD]) VALUES (N'PK_260703_001', N'A46')
GO
INSERT [dbo].[ChiTietPhieuKhamICD] ([MaPhieu], [MaICD]) VALUES (N'PK_260703_001', N'B01.9')
GO
INSERT [dbo].[ChiTietPhieuKhamICD] ([MaPhieu], [MaICD]) VALUES (N'PK_260711_001', N'G44.2')
GO
INSERT [dbo].[ChiTietPhieuKhamICD] ([MaPhieu], [MaICD]) VALUES (N'PK_260711_002', N'B26.9')
GO
INSERT [dbo].[ChiTietPhieuKhamICD] ([MaPhieu], [MaICD]) VALUES (N'PK_260714_002', N'A46')
GO
INSERT [dbo].[ChiTietPhieuKhamICD] ([MaPhieu], [MaICD]) VALUES (N'PK_260723_001', N'A46')
GO
INSERT [dbo].[ChiTietPhieuKhamICD] ([MaPhieu], [MaICD]) VALUES (N'PK_260723_002', N'G43.9')
GO
INSERT [dbo].[ChiTietPhieuKhamICD] ([MaPhieu], [MaICD]) VALUES (N'PK_260724_001', N'B35.1')
GO
INSERT [dbo].[ChiTietPhieuKhamICD] ([MaPhieu], [MaICD]) VALUES (N'PK_260724_002', N'A46')
GO
INSERT [dbo].[ChiTietPhieuKhamICD] ([MaPhieu], [MaICD]) VALUES (N'PK_260806_001', N'B02.9')
GO
INSERT [dbo].[ChiTietVatTu_Lo] ([MaPhieu], [MaVatTu], [MaLo], [SoLuongTru]) VALUES (N'PK_260724_001', N'VT015', N'LVT26015', 1)
GO
INSERT [dbo].[ChiTietVatTu_Lo] ([MaPhieu], [MaVatTu], [MaLo], [SoLuongTru]) VALUES (N'PK_260806_001', N'VT015', N'LVT26015', 1)
GO
INSERT [dbo].[ChiTietVatTuPhieuKham] ([MaPhieu], [MaVatTu], [SoLuong], [DonGia]) VALUES (N'PK_260724_001', N'VT015', 1, CAST(2500.00 AS Decimal(18, 2)))
GO
INSERT [dbo].[ChiTietVatTuPhieuKham] ([MaPhieu], [MaVatTu], [SoLuong], [DonGia]) VALUES (N'PK_260806_001', N'VT015', 1, CAST(2500.00 AS Decimal(18, 2)))
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'A46', N'Bệnh hồng ban (Erysipelas)')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'B00.9', N'Nhiễm Herpes simplex, không xác định')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'B01.9', N'Thủy đậu không có biến chứng')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'B02.9', N'Zona thần kinh không có biến chứng')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'B05.9', N'Sởi không có biến chứng')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'B07', N'Mụn cóc do virus (Warts)')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'B08.2', N'Sốt phát ban cấp tính (Roseola)')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'B08.4', N'Bệnh tay chân miệng do virus')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'B26.9', N'Quai bị không có biến chứng')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'B35.0', N'Nấm râu và nấm da đầu')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'B35.1', N'Nấm móng')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'B35.3', N'Nấm bàn chân')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'B35.4', N'Nấm thân')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'B35.9', N'Nấm da, không xác định')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'B36.0', N'Bệnh lang ben')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'B37.0', N'Viêm miệng do nấm Candida (tưa miệng)')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'B37.3', N'Viêm âm hộ và âm đạo do nấm Candida')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'B37.9', N'Nhiễm nấm Candida, không xác định')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'B86', N'Bệnh ghẻ (Scabies)')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'E03.9', N'Suy giáp, không xác định')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'E04.0', N'Bướu cổ giáp đơn thuần không độc')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'E04.1', N'Nhân đơn thùy giáp lành tính')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'E04.2', N'Bướu cổ đa nhân không độc')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'E05.0', N'Nhiễm độc giáp kèm bướu cổ lan tỏa (Basedow)')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'E05.9', N'Cường giáp (nhiễm độc giáp), không xác định')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'E06.3', N'Viêm tuyến giáp tự miễn (Hashimoto)')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'E11.2', N'Đái tháo đường typ 2 có biến chứng thận')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'E11.3', N'Đái tháo đường typ 2 có biến chứng mắt')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'E11.4', N'Đái tháo đường typ 2 có biến chứng thần kinh')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'E11.5', N'Đái tháo đường typ 2 có biến chứng tuần hoàn ngoại vi')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'E11.9', N'Đái tháo đường typ 2 không có biến chứng')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'E55.9', N'Thiếu Vitamin D, không xác định')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'E56.9', N'Thiếu Vitamin, không xác định')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'E66.9', N'Béo phì, không xác định')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'E78.0', N'Tăng cholesterol máu đơn thuần')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'E78.1', N'Tăng glyceride máu đơn thuần')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'E78.2', N'Tăng lipid máu hỗn hợp')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'E78.4', N'Tăng lipid máu khác')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'E78.5', N'Tăng lipid máu, không xác định')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'E79.0', N'Tăng acid uric máu không có triệu chứng')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'E86', N'Mất nước / Giảm thể tích tuần hoàn')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'G40.9', N'Động kinh, không xác định')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'G43.9', N'Đau nửa đầu (Migraine), không xác định')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'G44.2', N'Đau đầu căng cơ')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'G47.0', N'Rối loạn giấc ngủ (Mất ngủ kéo dài)')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'G50.0', N'Đau dây thần kinh sinh ba (dây V)')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'G51.0', N'Liệt mặt ngoại biên (Liệt Bell, dây VII)')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'G54.0', N'Rối loạn đám rối cánh tay')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'G56.0', N'Hội chứng ống cổ tay')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'G57.3', N'Liệt thần kinh hông khoeo ngoài')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'G62.9', N'Bệnh đa dây thần kinh, không xác định')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'H00.0', N'Lẹo mi mắt (Hordeolum)')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'H00.1', N'Chắp mi mắt (Chalazion)')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'H01.0', N'Viêm bờ mi')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'H10.1', N'Viêm kết mạc dị ứng cấp')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'H10.9', N'Viêm kết mạc, không xác định')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'H16.9', N'Viêm giác mạc, không xác định')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'H25.9', N'Đục thủy tinh thể tuổi già, không xác định')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'H35.9', N'Bệnh võng mạc, không xác định')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'H52.0', N'Viễn thị')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'H52.1', N'Cận thị')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'H52.2', N'Loạn thị')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'H60.9', N'Viêm tai ngoài, không xác định')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'H61.2', N'Nút ráy tai')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'H65.0', N'Viêm tai giữa thanh dịch cấp')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'H65.1', N'Viêm tai giữa cấp khác không mủ')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'H65.9', N'Viêm tai giữa không mủ, không xác định')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'H66.0', N'Viêm tai giữa cấp mủ')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'H66.3', N'Viêm tai giữa mạn mủ')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'H66.9', N'Viêm tai giữa mủ, không xác định')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'H90.3', N'Điếc tiếp nhận giác quan hai bên')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'H93.1', N'Ù tai')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'I10', N'Tăng huyết áp vô căn (nguyên phát)')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'I11.9', N'Bệnh tim do tăng huyết áp không có suy tim')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'I15.9', N'Tăng huyết áp thứ phát, không xác định')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'I20.0', N'Đau thắt ngực không ổn định')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'I20.9', N'Đau thắt ngực ổn định')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'I25.1', N'Bệnh tim do xơ vữa động mạch')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'I25.9', N'Bệnh tim thiếu máu cục bộ mạn tính')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'I34.0', N'Hở van hai lá phi thực tổn')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'I35.1', N'Hở van động mạch chủ lành tính')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'I47.1', N'Nhịp nhanh kịch phát trên thất')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'I48', N'Rung nhĩ và cuồng nhĩ')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'I49.9', N'Loạn nhịp tim, không xác định')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'I50.0', N'Suy tim sung huyết')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'I50.9', N'Suy tim, không xác định')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'I67.2', N'Xơ vữa động mạch não')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'I67.9', N'Bệnh mạch máu não, không xác định')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'I73.9', N'Bệnh mạch máu ngoại vi, không xác định')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'I87.2', N'Suy tĩnh mạch chi dưới (mạn tính)')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'I95.9', N'Hạ huyết áp, không xác định')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'J00', N'Viêm mũi họng cấp (Cảm thường)')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'J01.0', N'Viêm xoang hàm cấp')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'J01.1', N'Viêm xoang trán cấp')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'J01.2', N'Viêm xoang sàng cấp')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'J01.3', N'Viêm xoang bướm cấp')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'J01.4', N'Viêm toàn xoang cấp')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'J01.9', N'Viêm xoang cấp, không xác định')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'J02.0', N'Viêm họng cấp do liên cầu khuẩn')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'J02.9', N'Viêm họng cấp, không xác định')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'J03.0', N'Viêm amidan cấp do liên cầu khuẩn')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'J03.9', N'Viêm amidan cấp, không xác định')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'J04.0', N'Viêm thanh quản cấp')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'J04.1', N'Viêm khí quản cấp')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'J04.2', N'Viêm thanh khí quản cấp')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'J06.0', N'Viêm thanh quản và họng cấp')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'J06.9', N'Viêm đường hô hấp trên cấp, không xác định')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'J15.9', N'Viêm phổi do vi khuẩn, không xác định')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'J18.0', N'Phế quản phế viêm, không xác định')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'J18.9', N'Viêm phổi, không xác định')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'J20.9', N'Viêm phế quản cấp, không xác định')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'J21.9', N'Viêm tiểu phế quản cấp, không xác định')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'J30.0', N'Viêm mũi vận mạch')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'J30.1', N'Viêm mũi dị ứng do phấn hoa')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'J30.2', N'Viêm mũi dị ứng theo mùa khác')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'J30.3', N'Viêm mũi dị ứng quanh năm khác')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'J30.4', N'Viêm mũi dị ứng, không xác định')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'J31.0', N'Viêm mũi mạn tính')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'J31.1', N'Viêm mũi họng mạn tính')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'J31.2', N'Viêm họng mạn tính')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'J32.0', N'Viêm xoang hàm mạn tính')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'J32.1', N'Viêm xoang trán mạn tính')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'J32.4', N'Viêm xoang sàng mạn tính')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'J32.9', N'Viêm xoang mạn tính, không xác định')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'J35.0', N'Viêm amidan mạn tính')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'J35.1', N'Phì đại amidan')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'J35.2', N'Phì đại V.A')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'J37.0', N'Viêm thanh quản mạn tính')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'J40', N'Viêm phế quản không xác định cấp hay mạn')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'J42', N'Viêm phế quản mạn tính không xác định')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'J44.9', N'Bệnh phổi tắc nghẽn mạn tính (COPD)')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'J45.0', N'Hen dị ứng chủ yếu')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'J45.1', N'Hen không dị ứng')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'J45.9', N'Hen phế quản, không xác định')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'K20', N'Viêm thực quản')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'K21.0', N'Trào ngược dạ dày - thực quản có viêm thực quản')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'K21.9', N'Trào ngược dạ dày - thực quản không viêm thực quản')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'K25.9', N'Loét dạ dày, không xác định cấp hay mạn')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'K26.9', N'Loét tá tràng, không xác định cấp hay mạn')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'K27.9', N'Loét dạ dày tá tràng, không xác định')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'K29.0', N'Viêm dạ dày cấp tính xuất huyết')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'K29.1', N'Viêm dạ dày cấp khác')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'K29.3', N'Viêm dạ dày nông mạn tính')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'K29.4', N'Viêm dạ dày teo mạn tính')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'K29.5', N'Viêm dạ dày hang vị mạn tính')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'K29.6', N'Viêm dạ dày khác')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'K29.7', N'Viêm dạ dày, không xác định')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'K29.8', N'Viêm tá tràng')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'K29.9', N'Viêm dạ dạ tá tràng, không xác định')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'K30', N'Khó tiêu chức năng (Rối loạn tiêu hóa)')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'K52.9', N'Viêm dạ dày ruột và viêm đại tràng không nhiễm trùng')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'K58.0', N'Hội chứng ruột kích thích có tiêu chảy')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'K58.1', N'Hội chứng ruột kích thích có táo bón')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'K58.9', N'Hội chứng ruột kích thích không tiêu chảy')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'K59.0', N'Táo bón chức năng')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'K59.1', N'Tiêu chảy chức năng')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'K76.0', N'Gan thoái hóa mỡ (Gan nhiễm mỡ lành tính)')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'K76.9', N'Bệnh gan, không xác định')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'K80.2', N'Sỏi túi mật không có viêm túi mật')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'K81.9', N'Viêm túi mật, không xác định')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'L01.0', N'Chốc lở')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'L02.9', N'Áp xe da, mụn nhọt, không xác định vị trí')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'L03.9', N'Viêm mô tế bào, không xác định')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'L20.9', N'Viêm da cơ địa (Eczema), không xác định')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'L21.9', N'Viêm da tiết bã, không xác định')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'L23.9', N'Viêm da tiếp xúc dị ứng, không xác định')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'L24.9', N'Viêm da tiếp xúc kích ứng, không xác định')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'L30.9', N'Viêm da, không xác định')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'L40.9', N'Vảy nến, không xác định')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'L50.0', N'Mày đay dị ứng')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'L50.9', N'Mày đay, không xác định')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'L70.0', N'Mụn trứng cá thông thường')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'L70.9', N'Bệnh trứng cá, không xác định')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'L71.9', N'Bệnh trứng cá đỏ (Rosacea), không xác định')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'L73.2', N'Viêm tuyến mồ hôi mủ')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'L74.3', N'Rôm sảy, không xác định')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'L80', N'Bệnh bạch biến')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'L98.9', N'Rối loạn da và mô dưới da, không xác định')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'M10.9', N'Bệnh gút (Gout), không xác định')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'M13.9', N'Viêm khớp, không xác định')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'M15.0', N'Thoái hóa đa khớp nguyên phát')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'M17.0', N'Thoái hóa khớp gối hai bên nguyên phát')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'M17.9', N'Thoái hóa khớp gối, không xác định')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'M19.9', N'Thoái hóa khớp khác, không xác định')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'M25.5', N'Đau khớp chi')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'M35.3', N'Đau đa cơ do thấp khớp')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'M47.8', N'Thoái hóa cột sống khác')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'M47.9', N'Thoái hóa cột sống, không xác định')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'M54.1', N'Bệnh rễ thần kinh cột sống')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'M54.2', N'Đau cột sống cổ')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'M54.5', N'Đau lưng vùng thấp (Đau thắt lưng)')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'M54.6', N'Đau cột sống ngực')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'M54.9', N'Đau lưng, không xác định')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'M79.1', N'Đau cơ')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'M79.2', N'Viêm dây thần kinh không xác định')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'M79.7', N'Hội chứng đau xơ cơ (Fibromyalgia)')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'M81.9', N'Loãng xương, không xác định có gãy xương bệnh lý')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'N20.0', N'Sỏi thận')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'N20.1', N'Sỏi niệu quản')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'N30.0', N'Viêm bàng quang cấp')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'N30.9', N'Viêm bàng quang mạn, không xác định')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'N39.0', N'Nhiễm trùng đường tiết niệu, không xác định vị trí')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'N40', N'Phì đại lành tính tuyến tiền liệt')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'N60.9', N'Loạn sản tuyến vú lành tính, không xác định')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'N72', N'Viêm cổ tử cung')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'N76.0', N'Viêm âm đạo cấp')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'N76.1', N'Viêm âm đạo bán cấp và mạn tính')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'N91.2', N'Vô kinh, không xác định')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'N92.6', N'Kinh nguyệt không đều, không xác định')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'N95.1', N'Các trạng thái mãn kinh và tiền mãn kinh')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'R04.0', N'Chảy máu cam (Epistaxis)')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'R04.2', N'Ho ra máu')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'R05', N'Ho khan / Ho có đờm')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'R06.0', N'Khó thở')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'R07.0', N'Đau họng')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'R07.9', N'Đau ngực, không xác định')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'R10.0', N'Đau bụng cấp')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'R10.4', N'Đau bụng khác và đau bụng không xác định')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'R11', N'Buồn nôn và nôn')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'R19.7', N'Tiêu chảy, không xác định')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'R21', N'Phát ban và các biểu hiện da không đặc hiệu khác')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'R30.0', N'Tiểu buốt')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'R30.9', N'Tiểu khó, không xác định')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'R31', N'Tiểu máu không xác định')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'R42', N'Chóng mặt và choáng váng')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'R50.9', N'Sốt không rõ nguyên nhân')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'R51', N'Đau đầu (nhức đầu)')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'R52', N'Đau đớn không phân loại nơi khác')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'R53', N'Mệt mỏi và suy nhược cơ thể')
GO
INSERT [dbo].[DanhMucICD] ([MaICD], [TenBenh]) VALUES (N'R59.9', N'Hạch phì đại, không xác định')
GO
INSERT [dbo].[DanhMucKhoa] ([MaKhoa], [TenKhoa]) VALUES (N'KHOA03', N'Nhi khoa')
GO
INSERT [dbo].[DanhMucKhoa] ([MaKhoa], [TenKhoa]) VALUES (N'KHOA01', N'Nội tổng quát')
GO
INSERT [dbo].[DanhMucKhoa] ([MaKhoa], [TenKhoa]) VALUES (N'KHOA04', N'Tai Mũi Họng')
GO
INSERT [dbo].[DanhMucKhoa] ([MaKhoa], [TenKhoa]) VALUES (N'KHOA02', N'Tim mạch')
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH001', N'Paracetamol 500mg', N'Paracetamol', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH002', N'Amoxicillin 500mg', N'Amoxicillin trihydrate', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH003', N'Ibuprofen 400mg', N'Ibuprofen', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH004', N'Cephalexin 500mg', N'Cephalexin', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH005', N'Hapacol 250mg', N'Paracetamol', N'Gói', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH006', N'Decolgen Forte', N'Paracetamol + Chlorpheniramine + Phenylephrine', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH007', N'Panadol Extra', N'Paracetamol + Caffeine', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH008', N'Cefuroxime 500mg', N'Cefuroxime axetil', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH009', N'Azithromycin 500mg', N'Azithromycin dihydrate', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH010', N'Metformin 850mg', N'Metformin hydrochloride', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH011', N'Gliclazide 60mg', N'Gliclazide', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH012', N'Amlodipine 5mg', N'Amlodipine besylate', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH013', N'Losartan 50mg', N'Losartan potassium', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH014', N'Atorvastatin 10mg', N'Atorvastatin calcium', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH015', N'Rosuvastatin 10mg', N'Rosuvastatin calcium', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH016', N'Salbutamol 2mg', N'Salbutamol sulfate', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH017', N'Ventolin Nebules 2.5mg', N'Salbutamol', N'Ống', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH018', N'Berodual Inhaler', N'Ipratropium + Fenoterol', N'Chai', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH019', N'Omeprazole 20mg', N'Omeprazole', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH020', N'Esomeprazole 40mg', N'Esomeprazole magnesium', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH021', N'Pantoprazole 40mg', N'Pantoprazole sodium', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH022', N'Gaviscon Dual Action', N'Sodium alginate + Calcium carbonate', N'Gói', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH023', N'Phosphalugel', N'Aluminium phosphate', N'Gói', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH024', N'Maalox', N'Aluminium hydroxide + Magnesium hydroxide', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH025', N'Domperidone 10mg', N'Domperidone maleate', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH026', N'Metoclopramide 10mg', N'Metoclopramide', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH027', N'Ondansetron 8mg', N'Ondansetron', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH028', N'Smecta', N'Dioctahedral smectite', N'Gói', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH029', N'Loperamide 2mg', N'Loperamide hydrochloride', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH030', N'Oresol 245', N'Glucose + Natri clorid + Kali clorid', N'Gói', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH031', N'Duphalac', N'Lactulose', N'Gói', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH032', N'Sorbitol 5g', N'Sorbitol', N'Gói', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH033', N'Bisacodyl 5mg', N'Bisacodyl', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH034', N'Spasmo-Canulase', N'Dimethylpolysiloxane + Pancreatin', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH035', N'Buscopan 10mg', N'Hyoscine butylbromide', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH036', N'Mebeverine 135mg', N'Mebeverine hydrochloride', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH037', N'Enterogermina 2B', N'Bacillus clausii spores', N'Ống', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH038', N'Lactomin Plus', N'Lactobacillus acidophilus + Bifidobacterium', N'Gói', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH039', N'Loratadine 10mg', N'Loratadine', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH040', N'Cetirizine 10mg', N'Cetirizine dihydrochloride', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH041', N'Fexofenadine 180mg', N'Fexofenadine hydrochloride', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH042', N'Singulair 10mg', N'Montelukast sodium', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH043', N'Methylprednisolone 16mg', N'Methylprednisolone', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH044', N'Prednisolone 5mg', N'Prednisolone', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH045', N'Dexamethasone 0.5mg', N'Dexamethasone', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH046', N'Meloxicam 7.5mg', N'Meloxicam', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH047', N'Celecoxib 200mg', N'Celecoxib', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH048', N'Diclofenac 50mg', N'Diclofenac sodium', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH049', N'Voltaren Emulgel 20g', N'Diclofenac diethylamine', N'Tuýp', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH050', N'Salonpas Pain Relief Patch', N'Methyl salicylate + L-menthol', N'Hộp', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH051', N'Glucosamine 1500mg', N'Glucosamine sulfate', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH052', N'Alendronate 70mg', N'Alendronate sodium', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH053', N'Captopril 25mg', N'Captopril', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH054', N'Enalapril 5mg', N'Enalapril maleate', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH055', N'Bisoprolol 5mg', N'Bisoprolol fumarate', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH056', N'Metoprolol 50mg', N'Metoprolol succinate', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH057', N'Nebivolol 5mg', N'Nebivolol hydrochloride', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH058', N'Nitroglycerin 2.6mg', N'Nitroglycerin', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH059', N'Vastarel MR 35mg', N'Trimetazidine dihydrochloride', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH060', N'Spironolactone 25mg', N'Spironolactone', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH061', N'Furosemide 40mg', N'Furosemide', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH062', N'Hydrochlorothiazide 25mg', N'Hydrochlorothiazide', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH063', N'Ginkgo Biloba 120mg', N'Ginkgo biloba extract', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH064', N'Piracetam 800mg', N'Piracetam', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH065', N'Betahistine 16mg', N'Betahistine dihydrochloride', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH066', N'Acetly-DL-Leucine 500mg', N'Acetyl-DL-Leucine', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH067', N'Tanganil 500mg', N'Acetyl-DL-Leucine', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH068', N'Citicoline 500mg', N'Citicoline sodium', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH069', N'Cerebrolysin 5ml', N'Cerebrolysin concentrate', N'Ống', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH070', N'Neurobion', N'Vitamin B1 + B6 + B12', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH071', N'Vitamin C 500mg', N'Acid ascorbic', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH072', N'Vitamin E 400IU', N'Alpha tocopheryl acetate', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH073', N'Calcium Corbiere 10ml', N'Calcium glucoheptonate + Vitamin C', N'Ống', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH074', N'Zinc 15mg', N'Kẽm gluconat', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH075', N'Iron-Folic Acid', N'Sắt fumarat + Acid folic', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH076', N'Eugica Green', N'Eucalyptol + Menthol + Tinh dầu tràm', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH077', N'Acemuc 200mg', N'Acetylcysteine', N'Gói', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH078', N'Exomuc 200mg', N'Acetylcysteine', N'Gói', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH079', N'Bromhexin 8mg', N'Bromhexin hydrochloride', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH080', N'Ambroxol 30mg', N'Ambroxol hydrochloride', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH081', N'Prospan Syrup 100ml', N'Ivy leaf extract', N'Chai', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH082', N'Dextromethorphan 15mg', N'Dextromethorphan hydrobromide', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH083', N'Terpin Codein', N'Terpin hydrat + Codein', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH084', N'Augmentin 625mg', N'Amoxicillin + Acid clavulanic', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH085', N'Clarithromycin 500mg', N'Clarithromycin', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH086', N'Levofloxacin 500mg', N'Levofloxacin', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH087', N'Ciprofloxacin 500mg', N'Ciprofloxacin hydrochloride', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH088', N'Moxifloxacin 400mg', N'Moxifloxacin', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH089', N'Metronidazole 250mg', N'Metronidazole', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH090', N'Tinidazole 500mg', N'Tinidazole', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH091', N'Clindamycin 300mg', N'Clindamycin hydrochloride', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH092', N'Erythromycin 250mg', N'Erythromycin stearate', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH093', N'Ketoconazole Cream 5g', N'Ketoconazole', N'Tuýp', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH094', N'Terbinafine Cream 10g', N'Terbinafine hydrochloride', N'Tuýp', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH095', N'Fluconazole 150mg', N'Fluconazole', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH096', N'Itraconazole 100mg', N'Itraconazole', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH097', N'Acyclovir 400mg', N'Acyclovir', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH098', N'Acyclovir Cream 5g', N'Acyclovir', N'Tuýp', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH099', N'Betadine Antiseptic 125ml', N'Povidone-iodine', N'Chai', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH100', N'Povidine 10% 20ml', N'Povidone-iodine', N'Chai', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH101', N'Kamistad-Gel N 10g', N'Lidocaine + Hoa cúc', N'Tuýp', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH102', N'Oracortia 1g', N'Triamcinolone acetonide', N'Gói', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH103', N'Salonpas Gel 30g', N'Methyl salicylate + L-menthol', N'Tuýp', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH104', N'Deep Heat Rub 30g', N'Methyl salicylate + Menthol', N'Tuýp', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH105', N'Hiruscar Gel 5g', N'Mucopolysaccharide polysulphate', N'Tuýp', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH106', N'Contractubex 10g', N'Extractum cepae + Heparin + Allantoin', N'Tuýp', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH107', N'Silkron Cream 10g', N'Clotrimazole + Betamethasone + Gentamicin', N'Tuýp', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH108', N'Gentrisone Cream 10g', N'Clotrimazole + Betamethasone + Gentamicin', N'Tuýp', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH109', N'Bepanthen Balm 30g', N'Dexpanthenol', N'Tuýp', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH110', N'Phenergan Cream 10g', N'Promethazine', N'Tuýp', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH111', N'Eumovate Cream 5g', N'Clobetasone butyrate', N'Tuýp', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH112', N'Fucidin Ointment 5g', N'Fusidic acid', N'Tuýp', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH113', N'Fucicort Cream 5g', N'Fusidic acid + Betamethasone', N'Tuýp', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH114', N'Flucinar Ointment 15g', N'Fluocinolone acetonide', N'Tuýp', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH115', N'Cortibion Cream 5g', N'Dexamethasone acetate', N'Tuýp', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH116', N'Kedermfa Cream 5g', N'Ketoconazole + Neomycin + Mỡ trăn', N'Tuýp', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH117', N'Aspirin 81mg', N'Acetylsalicylic acid', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH118', N'Clopidogrel 75mg', N'Clopidogrel bisulfate', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH119', N'Gobil 80mg', N'Ginkgo biloba', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH120', N'Tanakan 40mg', N'Ginkgo biloba extract', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH121', N'Nootropyl 800mg', N'Piracetam', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH122', N'Enervon-C', N'Vitamin C + B-complex', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH123', N'Obimin Multivitamin', N'Multivitamins + Minerals', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH124', N'Elevit Pregnancy', N'Multivitamins + Folic Acid', N'Hộp', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH125', N'Glucophage 500mg', N'Metformin', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH126', N'Diamicron MR 60mg', N'Gliclazide', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH127', N'Lipitor 10mg', N'Atorvastatin', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH128', N'Crestor 10mg', N'Rosuvastatin', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH129', N'Zocor 10mg', N'Simvastatin', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH130', N'Plavix 75mg', N'Clopidogrel', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH131', N'Adalat LA 30mg', N'Nifedipine', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH132', N'Coveram 5mg/5mg', N'Perindopril + Amlodipine', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH133', N'Exforge 5mg/80mg', N'Amlodipine + Valsartan', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH134', N'Concor 5mg', N'Bisoprolol', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH135', N'Imdur 60mg', N'Isosorbide-5-mononitrate', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH136', N'Cordarone 200mg', N'Amiodarone hydrochloride', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH137', N'Digoxin 0.25mg', N'Digoxin', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH138', N'Daflon 500mg', N'Micronized purified flavonoid fraction', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH139', N'Rutin-C', N'Rutin + Vitamin C', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH140', N'Ginkor Fort', N'Ginkgo biloba + Heptaminol + Troxerutin', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH141', N'Reparil 20mg', N'Aescin', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH142', N'Alphachymotrypsin Chophar', N'Chymotrypsin', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH143', N'Katrypsin', N'Chymotrypsin', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH144', N'Lysozyme 90mg', N'Lysozyme hydrochloride', N'Viên', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH145', N'Decumar Gel 20g', N'Curcumin nano + Centella extract', N'Tuýp', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH146', N'Klenzit MS Gel 15g', N'Adapalene', N'Tuýp', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH147', N'Klenzit C Gel 15g', N'Adapalene + Clindamycin', N'Tuýp', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH148', N'Megaduo Gel 15g', N'Azelaic acid', N'Tuýp', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH149', N'Derma Forte Gel 15g', N'Azelaic acid + Vitamin C + E', N'Tuýp', 1)
GO
INSERT [dbo].[DanhMucThuoc] ([MaThuoc], [TenThuoc], [HoatChat], [DonViTinh], [IsActive]) VALUES (N'TH150', N'Differin Gel 0.1% 30g', N'Adapalene', N'Tuýp', 1)
GO
INSERT [dbo].[DanhMucVatTu] ([MaVatTu], [TenVatTu], [QuyCach], [DonViTinh], [IsActive]) VALUES (N'VT001', N'Găng tay y tế không bột (Size M)', N'Hộp 100 cái', N'Hộp', 1)
GO
INSERT [dbo].[DanhMucVatTu] ([MaVatTu], [TenVatTu], [QuyCach], [DonViTinh], [IsActive]) VALUES (N'VT002', N'Băng thun cuộn y tế', N'Cuộn 10cm x 5m', N'Cuộn', 1)
GO
INSERT [dbo].[DanhMucVatTu] ([MaVatTu], [TenVatTu], [QuyCach], [DonViTinh], [IsActive]) VALUES (N'VT003', N'Kim tiêm dùng một lần 5ml', N'Hộp 100 cây (Vinahankook)', N'Hộp', 1)
GO
INSERT [dbo].[DanhMucVatTu] ([MaVatTu], [TenVatTu], [QuyCach], [DonViTinh], [IsActive]) VALUES (N'VT004', N'Bông gòn y tế kháng khuẩn', N'Gói 500g', N'Gói', 1)
GO
INSERT [dbo].[DanhMucVatTu] ([MaVatTu], [TenVatTu], [QuyCach], [DonViTinh], [IsActive]) VALUES (N'VT005', N'Cồn sát trùng 70 độ', N'Chai 500ml', N'Chai', 1)
GO
INSERT [dbo].[DanhMucVatTu] ([MaVatTu], [TenVatTu], [QuyCach], [DonViTinh], [IsActive]) VALUES (N'VT006', N'Khẩu trang y tế 4 lớp', N'Hộp 50 cái', N'Hộp', 1)
GO
INSERT [dbo].[DanhMucVatTu] ([MaVatTu], [TenVatTu], [QuyCach], [DonViTinh], [IsActive]) VALUES (N'VT007', N'Kim tiêm dùng một lần 3ml', N'Hộp 100 cây (Vinahankook)', N'Hộp', 1)
GO
INSERT [dbo].[DanhMucVatTu] ([MaVatTu], [TenVatTu], [QuyCach], [DonViTinh], [IsActive]) VALUES (N'VT008', N'Nước muối sinh lý NaCl 0.9%', N'Chai 500ml', N'Chai', 1)
GO
INSERT [dbo].[DanhMucVatTu] ([MaVatTu], [TenVatTu], [QuyCach], [DonViTinh], [IsActive]) VALUES (N'VT009', N'Băng cá nhân vô trùng Urgosteril', N'Hộp 50 miếng', N'Hộp', 1)
GO
INSERT [dbo].[DanhMucVatTu] ([MaVatTu], [TenVatTu], [QuyCach], [DonViTinh], [IsActive]) VALUES (N'VT010', N'Gạc phẫu thuật tiệt trùng', N'Gói 10 miếng (8x10cm)', N'Gói', 1)
GO
INSERT [dbo].[DanhMucVatTu] ([MaVatTu], [TenVatTu], [QuyCach], [DonViTinh], [IsActive]) VALUES (N'VT011', N'Dây truyền dịch vô trùng', N'Bịch 1 bộ', N'Bộ', 1)
GO
INSERT [dbo].[DanhMucVatTu] ([MaVatTu], [TenVatTu], [QuyCach], [DonViTinh], [IsActive]) VALUES (N'VT012', N'Que đè lưỡi gỗ tiệt trùng', N'Hộp 100 cái', N'Hộp', 1)
GO
INSERT [dbo].[DanhMucVatTu] ([MaVatTu], [TenVatTu], [QuyCach], [DonViTinh], [IsActive]) VALUES (N'VT013', N'Chỉ khâu phẫu thuật tự tiêu 3/0', N'Hộp 12 tép (Vycril)', N'Hộp', 1)
GO
INSERT [dbo].[DanhMucVatTu] ([MaVatTu], [TenVatTu], [QuyCach], [DonViTinh], [IsActive]) VALUES (N'VT014', N'Cồn đỏ Povidine 10%', N'Chai 90ml', N'Chai', 1)
GO
INSERT [dbo].[DanhMucVatTu] ([MaVatTu], [TenVatTu], [QuyCach], [DonViTinh], [IsActive]) VALUES (N'VT015', N'Bơm tiêm dùng một lần 10ml', N'Hộp 100 cây (Vinahankook)', N'Hộp', 1)
GO
INSERT [dbo].[DanhMucVatTu] ([MaVatTu], [TenVatTu], [QuyCach], [DonViTinh], [IsActive]) VALUES (N'VT016', N'Băng keo cuộn giấy y tế', N'Cuộn 2.5cm x 5m', N'Cuộn', 1)
GO
INSERT [dbo].[DanhMucVatTu] ([MaVatTu], [TenVatTu], [QuyCach], [DonViTinh], [IsActive]) VALUES (N'VT017', N'Khăn ướt cồn Alcohol Pads', N'Hộp 100 miếng', N'Hộp', 1)
GO
INSERT [dbo].[DanhMucVatTu] ([MaVatTu], [TenVatTu], [QuyCach], [DonViTinh], [IsActive]) VALUES (N'VT018', N'Ống lấy máu chân không EDTA', N'Khay 100 ống (xanh dương)', N'Khay', 1)
GO
INSERT [dbo].[DanhMucVatTu] ([MaVatTu], [TenVatTu], [QuyCach], [DonViTinh], [IsActive]) VALUES (N'VT019', N'Ống lấy máu chân không Serum', N'Khay 100 ống (đỏ)', N'Khay', 1)
GO
INSERT [dbo].[DanhMucVatTu] ([MaVatTu], [TenVatTu], [QuyCach], [DonViTinh], [IsActive]) VALUES (N'VT020', N'Que thử thai nhanh (Quickstrip)', N'Hộp 1 cái', N'Hộp', 1)
GO
INSERT [dbo].[DanhMucVatTu] ([MaVatTu], [TenVatTu], [QuyCach], [DonViTinh], [IsActive]) VALUES (N'VT021', N'Gel siêu âm y tế', N'Bình 5 lít', N'Bình', 1)
GO
INSERT [dbo].[DanhMucVatTu] ([MaVatTu], [TenVatTu], [QuyCach], [DonViTinh], [IsActive]) VALUES (N'VT022', N'Mũ phẫu thuật con sâu', N'Bịch 100 cái', N'Bịch', 1)
GO
INSERT [dbo].[DanhMucVatTu] ([MaVatTu], [TenVatTu], [QuyCach], [DonViTinh], [IsActive]) VALUES (N'VT023', N'Tấm lót y tế chống thấm', N'Gói 10 miếng (60x90cm)', N'Gói', 1)
GO
INSERT [dbo].[DanhMucVatTu] ([MaVatTu], [TenVatTu], [QuyCach], [DonViTinh], [IsActive]) VALUES (N'VT024', N'Ống thông tiểu Foley 2 nhánh', N'Sợi', N'Sợi', 1)
GO
INSERT [dbo].[DanhMucVatTu] ([MaVatTu], [TenVatTu], [QuyCach], [DonViTinh], [IsActive]) VALUES (N'VT025', N'Kim cánh bướm lấy máu 23G', N'Hộp 100 cái', N'Hộp', 1)
GO
INSERT [dbo].[DanhMucVatTu] ([MaVatTu], [TenVatTu], [QuyCach], [DonViTinh], [IsActive]) VALUES (N'VT026', N'Nhiệt kế điện tử hồng ngoại', N'Cái (Microlife)', N'Cái', 1)
GO
INSERT [dbo].[DanhMucVatTu] ([MaVatTu], [TenVatTu], [QuyCach], [DonViTinh], [IsActive]) VALUES (N'VT027', N'Dung dịch sát khuẩn tay nhanh', N'Chai 500ml (vòi nhấn)', N'Chai', 1)
GO
INSERT [dbo].[DanhMucVatTu] ([MaVatTu], [TenVatTu], [QuyCach], [DonViTinh], [IsActive]) VALUES (N'VT028', N'Băng cuộn y tế (băng gạc)', N'Cuộn 0.08m x 2m', N'Cuộn', 1)
GO
INSERT [dbo].[DanhMucVatTu] ([MaVatTu], [TenVatTu], [QuyCach], [DonViTinh], [IsActive]) VALUES (N'VT029', N'Kim châm cứu tiệt trùng', N'Hộp 100 cây (Khánh Phong)', N'Hộp', 1)
GO
INSERT [dbo].[DanhMucVatTu] ([MaVatTu], [TenVatTu], [QuyCach], [DonViTinh], [IsActive]) VALUES (N'VT030', N'Túi đựng rác thải y tế lây nhiễm', N'Xấp 1kg (màu vàng)', N'Xấp', 1)
GO
SET IDENTITY_INSERT [dbo].[DatLichKham] ON 

GO
INSERT [dbo].[DatLichKham] ([MaDatLich], [HoTenKhach], [SDT], [NgayHen], [YeuCauKham], [TrangThai], [MaNV], [CaHen]) VALUES (2, N'Mai Xuân Hiên', N'0896456123', CAST(N'2026-07-24' AS Date), N'đau đầu###Nam|12/02/2002|a105 Nhật Tảo|không có', N'DaTiepNhan', N'NV003', N'Sang')
GO
INSERT [dbo].[DatLichKham] ([MaDatLich], [HoTenKhach], [SDT], [NgayHen], [YeuCauKham], [TrangThai], [MaNV], [CaHen]) VALUES (3, N'test', N'0896587423', CAST(N'2026-07-25' AS Date), N'test###Nam|18/02/2000|teest|test', N'ChoXacNhan', N'NV007', N'Sang')
GO
INSERT [dbo].[DatLichKham] ([MaDatLich], [HoTenKhach], [SDT], [NgayHen], [YeuCauKham], [TrangThai], [MaNV], [CaHen]) VALUES (4, N'Mai Xuân Phát', N'0896456216', CAST(N'2026-08-07' AS Date), N'dau bụng###Nam|18/03/2003|a105 Nhật Tảo|test', N'ChoXacNhan', N'NV003', N'Sang')
GO
INSERT [dbo].[DatLichKham] ([MaDatLich], [HoTenKhach], [SDT], [NgayHen], [YeuCauKham], [TrangThai], [MaNV], [CaHen]) VALUES (5, N'testtt', N'0896523123', CAST(N'2026-08-06' AS Date), N'test###Nam|18/03/2003|test|test', N'DaTiepNhan', N'NV003', N'Chieu')
GO
SET IDENTITY_INSERT [dbo].[DatLichKham] OFF
GO
SET IDENTITY_INSERT [dbo].[DichVuYTe] ON 

GO
INSERT [dbo].[DichVuYTe] ([MaChiTiet], [MaPhieu], [MaDV], [KetQua], [TrangThaiDichVu]) VALUES (1, N'PK_260703_001', N'DV001', NULL, 1)
GO
INSERT [dbo].[DichVuYTe] ([MaChiTiet], [MaPhieu], [MaDV], [KetQua], [TrangThaiDichVu]) VALUES (2, N'PK_260703_001', N'DV002', NULL, 1)
GO
INSERT [dbo].[DichVuYTe] ([MaChiTiet], [MaPhieu], [MaDV], [KetQua], [TrangThaiDichVu]) VALUES (3, N'PK_260703_001', N'DV003', NULL, 1)
GO
INSERT [dbo].[DichVuYTe] ([MaChiTiet], [MaPhieu], [MaDV], [KetQua], [TrangThaiDichVu]) VALUES (4, N'PK_260711_001', N'DV001', NULL, 1)
GO
INSERT [dbo].[DichVuYTe] ([MaChiTiet], [MaPhieu], [MaDV], [KetQua], [TrangThaiDichVu]) VALUES (5, N'PK_260711_001', N'DV002', NULL, 1)
GO
INSERT [dbo].[DichVuYTe] ([MaChiTiet], [MaPhieu], [MaDV], [KetQua], [TrangThaiDichVu]) VALUES (20, N'PK_260714_002', N'DV003', NULL, 1)
GO
INSERT [dbo].[DichVuYTe] ([MaChiTiet], [MaPhieu], [MaDV], [KetQua], [TrangThaiDichVu]) VALUES (21, N'PK_260723_002', N'DV003', NULL, 1)
GO
INSERT [dbo].[DichVuYTe] ([MaChiTiet], [MaPhieu], [MaDV], [KetQua], [TrangThaiDichVu]) VALUES (22, N'PK_260723_002', N'DV014', NULL, 1)
GO
INSERT [dbo].[DichVuYTe] ([MaChiTiet], [MaPhieu], [MaDV], [KetQua], [TrangThaiDichVu]) VALUES (23, N'PK_260723_001', N'DV003', NULL, 1)
GO
INSERT [dbo].[DichVuYTe] ([MaChiTiet], [MaPhieu], [MaDV], [KetQua], [TrangThaiDichVu]) VALUES (24, N'PK_260723_001', N'DV005', NULL, 1)
GO
INSERT [dbo].[DichVuYTe] ([MaChiTiet], [MaPhieu], [MaDV], [KetQua], [TrangThaiDichVu]) VALUES (25, N'PK_260723_001', N'DV040', NULL, 1)
GO
INSERT [dbo].[DichVuYTe] ([MaChiTiet], [MaPhieu], [MaDV], [KetQua], [TrangThaiDichVu]) VALUES (26, N'PK_260723_001', N'DV051', NULL, 1)
GO
INSERT [dbo].[DichVuYTe] ([MaChiTiet], [MaPhieu], [MaDV], [KetQua], [TrangThaiDichVu]) VALUES (28, N'PK_260724_001', N'DV004', NULL, 1)
GO
INSERT [dbo].[DichVuYTe] ([MaChiTiet], [MaPhieu], [MaDV], [KetQua], [TrangThaiDichVu]) VALUES (29, N'PK_260724_002', N'DV003', NULL, 1)
GO
INSERT [dbo].[DichVuYTe] ([MaChiTiet], [MaPhieu], [MaDV], [KetQua], [TrangThaiDichVu]) VALUES (30, N'PK_260724_002', N'DV004', NULL, 1)
GO
INSERT [dbo].[DichVuYTe] ([MaChiTiet], [MaPhieu], [MaDV], [KetQua], [TrangThaiDichVu]) VALUES (31, N'PK_260806_001', N'DV003', NULL, 1)
GO
SET IDENTITY_INSERT [dbo].[DichVuYTe] OFF
GO
INSERT [dbo].[DonThuoc] ([MaDonThuoc], [MaPhieu], [NgayKeDon], [LoiDan]) VALUES (N'DT260709001', N'PK_260703_001', CAST(N'2026-07-09T21:36:06.063' AS DateTime), N'đi ngủ sớm')
GO
INSERT [dbo].[DonThuoc] ([MaDonThuoc], [MaPhieu], [NgayKeDon], [LoiDan]) VALUES (N'DT260711001', N'PK_260711_001', CAST(N'2026-07-11T10:19:33.903' AS DateTime), N'test')
GO
INSERT [dbo].[DonThuoc] ([MaDonThuoc], [MaPhieu], [NgayKeDon], [LoiDan]) VALUES (N'DT260714001', N'PK_260714_002', CAST(N'2026-07-14T19:18:48.420' AS DateTime), N'không có gì test thôi')
GO
INSERT [dbo].[DonThuoc] ([MaDonThuoc], [MaPhieu], [NgayKeDon], [LoiDan]) VALUES (N'DT260723001', N'PK_260723_002', CAST(N'2026-07-23T10:16:19.217' AS DateTime), N'test')
GO
INSERT [dbo].[DonThuoc] ([MaDonThuoc], [MaPhieu], [NgayKeDon], [LoiDan]) VALUES (N'DT260723002', N'PK_260723_001', CAST(N'2026-07-23T12:03:25.393' AS DateTime), N'test')
GO
INSERT [dbo].[DonThuoc] ([MaDonThuoc], [MaPhieu], [NgayKeDon], [LoiDan]) VALUES (N'DT260724001', N'PK_260724_001', CAST(N'2026-07-24T15:46:32.263' AS DateTime), N'haha')
GO
INSERT [dbo].[DonThuoc] ([MaDonThuoc], [MaPhieu], [NgayKeDon], [LoiDan]) VALUES (N'DT260806001', N'PK_260806_001', CAST(N'2026-08-06T20:24:42.533' AS DateTime), N'test kết luận')
GO
INSERT [dbo].[HoaDon] ([MaHoaDon], [MaPhieu], [NgayThanhToan], [TongTienDichVu], [TongTienThuoc], [ThanhTien], [TrangThaiThanhToan], [MaNV], [TongTienVatTu], [PhuongThucTT]) VALUES (N'HD260717554', N'PK_260703_001', CAST(N'2026-07-17T00:46:13.130' AS DateTime), CAST(361000.00 AS Decimal(18, 2)), CAST(88000.00 AS Decimal(18, 2)), CAST(449000.00 AS Decimal(18, 2)), 1, N'NV001', CAST(0.00 AS Decimal(18, 2)), N'Tiền mặt')
GO
INSERT [dbo].[HoaDon] ([MaHoaDon], [MaPhieu], [NgayThanhToan], [TongTienDichVu], [TongTienThuoc], [ThanhTien], [TrangThaiThanhToan], [MaNV], [TongTienVatTu], [PhuongThucTT]) VALUES (N'HD260723183', N'PK_260723_002', CAST(N'2026-07-23T10:22:41.150' AS DateTime), CAST(251000.00 AS Decimal(18, 2)), CAST(1626000.00 AS Decimal(18, 2)), CAST(1877000.00 AS Decimal(18, 2)), 1, N'NV012', CAST(0.00 AS Decimal(18, 2)), N'Tiền mặt')
GO
INSERT [dbo].[HoaDon] ([MaHoaDon], [MaPhieu], [NgayThanhToan], [TongTienDichVu], [TongTienThuoc], [ThanhTien], [TrangThaiThanhToan], [MaNV], [TongTienVatTu], [PhuongThucTT]) VALUES (N'HD260723608', N'PK_260723_001', CAST(N'2026-07-23T12:24:59.577' AS DateTime), CAST(2335000.00 AS Decimal(18, 2)), CAST(0.00 AS Decimal(18, 2)), CAST(2335000.00 AS Decimal(18, 2)), 1, N'NV012', CAST(0.00 AS Decimal(18, 2)), N'Tiền mặt')
GO
INSERT [dbo].[HoaDon] ([MaHoaDon], [MaPhieu], [NgayThanhToan], [TongTienDichVu], [TongTienThuoc], [ThanhTien], [TrangThaiThanhToan], [MaNV], [TongTienVatTu], [PhuongThucTT]) VALUES (N'HD260806693', N'PK_260806_001', CAST(N'2026-08-06T20:26:12.927' AS DateTime), CAST(141000.00 AS Decimal(18, 2)), CAST(3456000.00 AS Decimal(18, 2)), CAST(3599500.00 AS Decimal(18, 2)), 1, N'NV012', CAST(2500.00 AS Decimal(18, 2)), N'Tiền mặt')
GO
SET IDENTITY_INSERT [dbo].[LichLamViec] ON 

GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (26, N'NV003', CAST(N'2026-07-20' AS Date), N'Sang', NULL, NULL, CAST(N'2026-07-23T09:52:19.563' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (27, N'NV006', CAST(N'2026-07-20' AS Date), N'Chieu', NULL, NULL, CAST(N'2026-07-23T09:52:19.567' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (28, N'NV008', CAST(N'2026-07-20' AS Date), N'Sang', NULL, NULL, CAST(N'2026-07-23T09:52:19.567' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (29, N'NV010', CAST(N'2026-07-20' AS Date), N'Chieu', NULL, NULL, CAST(N'2026-07-23T09:52:19.567' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (30, N'NV005', CAST(N'2026-07-21' AS Date), N'Chieu', NULL, NULL, CAST(N'2026-07-23T09:52:19.567' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (31, N'NV007', CAST(N'2026-07-21' AS Date), N'Sang', NULL, NULL, CAST(N'2026-07-23T09:52:19.567' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (32, N'NV009', CAST(N'2026-07-21' AS Date), N'Chieu', NULL, NULL, CAST(N'2026-07-23T09:52:19.567' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (33, N'NV011', CAST(N'2026-07-21' AS Date), N'Sang', NULL, NULL, CAST(N'2026-07-23T09:52:19.570' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (34, N'NV003', CAST(N'2026-07-22' AS Date), N'Sang', NULL, NULL, CAST(N'2026-07-23T09:52:19.570' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (35, N'NV006', CAST(N'2026-07-22' AS Date), N'Chieu', NULL, NULL, CAST(N'2026-07-23T09:52:19.570' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (36, N'NV008', CAST(N'2026-07-22' AS Date), N'Sang', NULL, NULL, CAST(N'2026-07-23T09:52:19.570' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (37, N'NV010', CAST(N'2026-07-22' AS Date), N'Chieu', NULL, NULL, CAST(N'2026-07-23T09:52:19.570' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (38, N'NV005', CAST(N'2026-07-23' AS Date), N'Chieu', NULL, NULL, CAST(N'2026-07-23T09:52:19.570' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (39, N'NV007', CAST(N'2026-07-23' AS Date), N'Sang', NULL, NULL, CAST(N'2026-07-23T09:52:19.570' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (40, N'NV009', CAST(N'2026-07-23' AS Date), N'Chieu', NULL, NULL, CAST(N'2026-07-23T09:52:19.570' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (41, N'NV011', CAST(N'2026-07-23' AS Date), N'Sang', NULL, NULL, CAST(N'2026-07-23T09:52:19.570' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (42, N'NV003', CAST(N'2026-07-24' AS Date), N'Sang', NULL, NULL, CAST(N'2026-07-23T09:52:19.570' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (43, N'NV006', CAST(N'2026-07-24' AS Date), N'Chieu', NULL, NULL, CAST(N'2026-07-23T09:52:19.570' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (44, N'NV008', CAST(N'2026-07-24' AS Date), N'Sang', NULL, NULL, CAST(N'2026-07-23T09:52:19.570' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (45, N'NV010', CAST(N'2026-07-24' AS Date), N'Chieu', NULL, NULL, CAST(N'2026-07-23T09:52:19.570' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (46, N'NV005', CAST(N'2026-07-25' AS Date), N'Chieu', NULL, NULL, CAST(N'2026-07-23T09:52:19.570' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (47, N'NV007', CAST(N'2026-07-25' AS Date), N'Sang', NULL, NULL, CAST(N'2026-07-23T09:52:19.570' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (48, N'NV009', CAST(N'2026-07-25' AS Date), N'Chieu', NULL, NULL, CAST(N'2026-07-23T09:52:19.570' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (49, N'NV011', CAST(N'2026-07-25' AS Date), N'Sang', NULL, NULL, CAST(N'2026-07-23T09:52:19.570' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (106, N'NV003', CAST(N'2026-08-03' AS Date), N'Sang', NULL, N'Khám Nội tổng quát', CAST(N'2026-08-06T18:55:58.027' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (107, N'NV006', CAST(N'2026-08-03' AS Date), N'Sang', NULL, N'Khám Tim mạch', CAST(N'2026-08-06T18:55:58.027' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (108, N'NV008', CAST(N'2026-08-03' AS Date), N'Sang', NULL, N'Khám Nhi khoa', CAST(N'2026-08-06T18:55:58.027' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (109, N'NV010', CAST(N'2026-08-03' AS Date), N'Sang', NULL, N'Khám Tai Mũi Họng', CAST(N'2026-08-06T18:55:58.027' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (110, N'NV005', CAST(N'2026-08-03' AS Date), N'Chieu', NULL, N'Khám Nội tổng quát', CAST(N'2026-08-06T18:55:58.027' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (111, N'NV007', CAST(N'2026-08-03' AS Date), N'Chieu', NULL, N'Khám Tim mạch', CAST(N'2026-08-06T18:55:58.027' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (112, N'NV009', CAST(N'2026-08-03' AS Date), N'Chieu', NULL, N'Khám Nhi khoa', CAST(N'2026-08-06T18:55:58.027' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (113, N'NV011', CAST(N'2026-08-03' AS Date), N'Chieu', NULL, N'Khám Tai Mũi Họng', CAST(N'2026-08-06T18:55:58.027' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (114, N'NV005', CAST(N'2026-08-04' AS Date), N'Sang', NULL, N'Khám Nội tổng quát', CAST(N'2026-08-06T18:55:58.027' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (115, N'NV007', CAST(N'2026-08-04' AS Date), N'Sang', NULL, N'Khám Tim mạch', CAST(N'2026-08-06T18:55:58.027' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (116, N'NV009', CAST(N'2026-08-04' AS Date), N'Sang', NULL, N'Khám Nhi khoa', CAST(N'2026-08-06T18:55:58.027' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (117, N'NV011', CAST(N'2026-08-04' AS Date), N'Sang', NULL, N'Khám Tai Mũi Họng', CAST(N'2026-08-06T18:55:58.027' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (118, N'NV003', CAST(N'2026-08-04' AS Date), N'Chieu', NULL, N'Khám Nội tổng quát', CAST(N'2026-08-06T18:55:58.027' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (119, N'NV006', CAST(N'2026-08-04' AS Date), N'Chieu', NULL, N'Khám Tim mạch', CAST(N'2026-08-06T18:55:58.027' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (120, N'NV008', CAST(N'2026-08-04' AS Date), N'Chieu', NULL, N'Khám Nhi khoa', CAST(N'2026-08-06T18:55:58.027' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (121, N'NV010', CAST(N'2026-08-04' AS Date), N'Chieu', NULL, N'Khám Tai Mũi Họng', CAST(N'2026-08-06T18:55:58.027' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (122, N'NV003', CAST(N'2026-08-05' AS Date), N'Sang', NULL, N'Khám Nội tổng quát', CAST(N'2026-08-06T18:55:58.027' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (123, N'NV006', CAST(N'2026-08-05' AS Date), N'Sang', NULL, N'Khám Tim mạch', CAST(N'2026-08-06T18:55:58.027' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (124, N'NV008', CAST(N'2026-08-05' AS Date), N'Sang', NULL, N'Khám Nhi khoa', CAST(N'2026-08-06T18:55:58.027' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (125, N'NV010', CAST(N'2026-08-05' AS Date), N'Sang', NULL, N'Khám Tai Mũi Họng', CAST(N'2026-08-06T18:55:58.027' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (126, N'NV005', CAST(N'2026-08-05' AS Date), N'Chieu', NULL, N'Khám Nội tổng quát', CAST(N'2026-08-06T18:55:58.027' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (127, N'NV007', CAST(N'2026-08-05' AS Date), N'Chieu', NULL, N'Khám Tim mạch', CAST(N'2026-08-06T18:55:58.027' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (128, N'NV009', CAST(N'2026-08-05' AS Date), N'Chieu', NULL, N'Khám Nhi khoa', CAST(N'2026-08-06T18:55:58.027' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (129, N'NV011', CAST(N'2026-08-05' AS Date), N'Chieu', NULL, N'Khám Tai Mũi Họng', CAST(N'2026-08-06T18:55:58.027' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (130, N'NV005', CAST(N'2026-08-06' AS Date), N'Sang', NULL, N'Khám Nội tổng quát', CAST(N'2026-08-06T18:55:58.027' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (131, N'NV007', CAST(N'2026-08-06' AS Date), N'Sang', NULL, N'Khám Tim mạch', CAST(N'2026-08-06T18:55:58.027' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (132, N'NV009', CAST(N'2026-08-06' AS Date), N'Sang', NULL, N'Khám Nhi khoa', CAST(N'2026-08-06T18:55:58.027' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (133, N'NV011', CAST(N'2026-08-06' AS Date), N'Sang', NULL, N'Khám Tai Mũi Họng', CAST(N'2026-08-06T18:55:58.027' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (134, N'NV003', CAST(N'2026-08-06' AS Date), N'Chieu', NULL, N'Khám Nội tổng quát', CAST(N'2026-08-06T18:55:58.027' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (135, N'NV006', CAST(N'2026-08-06' AS Date), N'Chieu', NULL, N'Khám Tim mạch', CAST(N'2026-08-06T18:55:58.027' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (136, N'NV008', CAST(N'2026-08-06' AS Date), N'Chieu', NULL, N'Khám Nhi khoa', CAST(N'2026-08-06T18:55:58.027' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (137, N'NV010', CAST(N'2026-08-06' AS Date), N'Chieu', NULL, N'Khám Tai Mũi Họng', CAST(N'2026-08-06T18:55:58.027' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (138, N'NV003', CAST(N'2026-08-07' AS Date), N'Sang', NULL, N'Khám Nội tổng quát', CAST(N'2026-08-06T18:55:58.027' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (139, N'NV006', CAST(N'2026-08-07' AS Date), N'Sang', NULL, N'Khám Tim mạch', CAST(N'2026-08-06T18:55:58.027' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (140, N'NV008', CAST(N'2026-08-07' AS Date), N'Sang', NULL, N'Khám Nhi khoa', CAST(N'2026-08-06T18:55:58.027' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (141, N'NV010', CAST(N'2026-08-07' AS Date), N'Sang', NULL, N'Khám Tai Mũi Họng', CAST(N'2026-08-06T18:55:58.027' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (142, N'NV005', CAST(N'2026-08-07' AS Date), N'Chieu', NULL, N'Khám Nội tổng quát', CAST(N'2026-08-06T18:55:58.027' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (143, N'NV007', CAST(N'2026-08-07' AS Date), N'Chieu', NULL, N'Khám Tim mạch', CAST(N'2026-08-06T18:55:58.027' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (144, N'NV009', CAST(N'2026-08-07' AS Date), N'Chieu', NULL, N'Khám Nhi khoa', CAST(N'2026-08-06T18:55:58.027' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (145, N'NV011', CAST(N'2026-08-07' AS Date), N'Chieu', NULL, N'Khám Tai Mũi Họng', CAST(N'2026-08-06T18:55:58.027' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (146, N'NV005', CAST(N'2026-08-08' AS Date), N'Sang', NULL, N'Khám Nội tổng quát', CAST(N'2026-08-06T18:55:58.027' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (147, N'NV007', CAST(N'2026-08-08' AS Date), N'Sang', NULL, N'Khám Tim mạch', CAST(N'2026-08-06T18:55:58.027' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (148, N'NV009', CAST(N'2026-08-08' AS Date), N'Sang', NULL, N'Khám Nhi khoa', CAST(N'2026-08-06T18:55:58.027' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (149, N'NV011', CAST(N'2026-08-08' AS Date), N'Sang', NULL, N'Khám Tai Mũi Họng', CAST(N'2026-08-06T18:55:58.027' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (150, N'NV003', CAST(N'2026-08-08' AS Date), N'Chieu', NULL, N'Khám Nội tổng quát', CAST(N'2026-08-06T18:55:58.027' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (151, N'NV006', CAST(N'2026-08-08' AS Date), N'Chieu', NULL, N'Khám Tim mạch', CAST(N'2026-08-06T18:55:58.027' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (152, N'NV008', CAST(N'2026-08-08' AS Date), N'Chieu', NULL, N'Khám Nhi khoa', CAST(N'2026-08-06T18:55:58.027' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (153, N'NV010', CAST(N'2026-08-08' AS Date), N'Chieu', NULL, N'Khám Tai Mũi Họng', CAST(N'2026-08-06T18:55:58.027' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (154, N'NV003', CAST(N'2026-08-09' AS Date), N'Sang', NULL, N'Khám Nội tổng quát', CAST(N'2026-08-06T18:55:58.027' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (155, N'NV006', CAST(N'2026-08-09' AS Date), N'Sang', NULL, N'Khám Tim mạch', CAST(N'2026-08-06T18:55:58.027' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (156, N'NV008', CAST(N'2026-08-09' AS Date), N'Sang', NULL, N'Khám Nhi khoa', CAST(N'2026-08-06T18:55:58.027' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (157, N'NV010', CAST(N'2026-08-09' AS Date), N'Sang', NULL, N'Khám Tai Mũi Họng', CAST(N'2026-08-06T18:55:58.027' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (158, N'NV005', CAST(N'2026-08-09' AS Date), N'Chieu', NULL, N'Khám Nội tổng quát', CAST(N'2026-08-06T18:55:58.027' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (159, N'NV007', CAST(N'2026-08-09' AS Date), N'Chieu', NULL, N'Khám Tim mạch', CAST(N'2026-08-06T18:55:58.027' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (160, N'NV009', CAST(N'2026-08-09' AS Date), N'Chieu', NULL, N'Khám Nhi khoa', CAST(N'2026-08-06T18:55:58.027' AS DateTime))
GO
INSERT [dbo].[LichLamViec] ([MaLich], [MaNV], [NgayLamViec], [CaLamViec], [PhongKham], [GhiChu], [NgayDangKy]) VALUES (161, N'NV011', CAST(N'2026-08-09' AS Date), N'Chieu', NULL, N'Khám Tai Mũi Họng', CAST(N'2026-08-06T18:55:58.027' AS DateTime))
GO
SET IDENTITY_INSERT [dbo].[LichLamViec] OFF
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH001', N'TH001', 4, 968, 966, CAST(35000.00 AS Decimal(18, 2)), CAST(44000.00 AS Decimal(18, 2)), CAST(N'2026-02-13' AS Date), CAST(N'2028-02-13' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH002', N'TH002', 2, 427, 425, CAST(18500.00 AS Decimal(18, 2)), CAST(23000.00 AS Decimal(18, 2)), CAST(N'2026-02-17' AS Date), CAST(N'2028-02-17' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH003', N'TH003', 3, 190, 177, CAST(6500.00 AS Decimal(18, 2)), CAST(8000.00 AS Decimal(18, 2)), CAST(N'2025-08-10' AS Date), CAST(N'2027-08-10' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH004', N'TH004', 4, 827, 794, CAST(42500.00 AS Decimal(18, 2)), CAST(53000.00 AS Decimal(18, 2)), CAST(N'2026-02-17' AS Date), CAST(N'2028-02-17' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH005', N'TH005', 3, 284, 280, CAST(14000.00 AS Decimal(18, 2)), CAST(18000.00 AS Decimal(18, 2)), CAST(N'2025-10-24' AS Date), CAST(N'2027-10-24' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH006', N'TH006', 4, 178, 178, CAST(33500.00 AS Decimal(18, 2)), CAST(42000.00 AS Decimal(18, 2)), CAST(N'2026-06-01' AS Date), CAST(N'2028-06-01' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH007', N'TH007', 4, 184, 184, CAST(6500.00 AS Decimal(18, 2)), CAST(8000.00 AS Decimal(18, 2)), CAST(N'2025-11-19' AS Date), CAST(N'2027-11-19' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH008', N'TH008', 5, 139, 139, CAST(35500.00 AS Decimal(18, 2)), CAST(44000.00 AS Decimal(18, 2)), CAST(N'2026-03-01' AS Date), CAST(N'2028-03-01' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH009', N'TH009', 3, 599, 597, CAST(34500.00 AS Decimal(18, 2)), CAST(43000.00 AS Decimal(18, 2)), CAST(N'2025-09-24' AS Date), CAST(N'2027-09-24' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH010', N'TH010', 5, 657, 657, CAST(29000.00 AS Decimal(18, 2)), CAST(36000.00 AS Decimal(18, 2)), CAST(N'2026-06-05' AS Date), CAST(N'2028-06-05' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH011', N'TH011', 3, 268, 268, CAST(8000.00 AS Decimal(18, 2)), CAST(10000.00 AS Decimal(18, 2)), CAST(N'2025-07-03' AS Date), CAST(N'2027-07-03' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH012', N'TH012', 3, 513, 513, CAST(4500.00 AS Decimal(18, 2)), CAST(6000.00 AS Decimal(18, 2)), CAST(N'2026-05-26' AS Date), CAST(N'2028-05-26' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH013', N'TH013', 1, 314, 314, CAST(46500.00 AS Decimal(18, 2)), CAST(58000.00 AS Decimal(18, 2)), CAST(N'2026-05-20' AS Date), CAST(N'2028-05-20' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH014', N'TH014', 2, 283, 283, CAST(12000.00 AS Decimal(18, 2)), CAST(15000.00 AS Decimal(18, 2)), CAST(N'2026-01-06' AS Date), CAST(N'2028-01-06' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH015', N'TH015', 1, 982, 982, CAST(17500.00 AS Decimal(18, 2)), CAST(22000.00 AS Decimal(18, 2)), CAST(N'2025-12-03' AS Date), CAST(N'2027-12-03' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH016', N'TH016', 5, 525, 525, CAST(14500.00 AS Decimal(18, 2)), CAST(18000.00 AS Decimal(18, 2)), CAST(N'2026-03-15' AS Date), CAST(N'2028-03-15' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH017', N'TH017', 1, 798, 798, CAST(6000.00 AS Decimal(18, 2)), CAST(8000.00 AS Decimal(18, 2)), CAST(N'2026-04-23' AS Date), CAST(N'2028-04-23' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH018', N'TH018', 4, 803, 803, CAST(15000.00 AS Decimal(18, 2)), CAST(19000.00 AS Decimal(18, 2)), CAST(N'2025-11-17' AS Date), CAST(N'2027-11-17' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH019', N'TH019', 4, 286, 286, CAST(34000.00 AS Decimal(18, 2)), CAST(43000.00 AS Decimal(18, 2)), CAST(N'2025-06-30' AS Date), CAST(N'2027-06-30' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH020', N'TH020', 3, 529, 529, CAST(34000.00 AS Decimal(18, 2)), CAST(43000.00 AS Decimal(18, 2)), CAST(N'2026-06-03' AS Date), CAST(N'2028-06-03' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH021', N'TH021', 4, 769, 769, CAST(12000.00 AS Decimal(18, 2)), CAST(15000.00 AS Decimal(18, 2)), CAST(N'2026-05-18' AS Date), CAST(N'2028-05-18' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH022', N'TH022', 3, 339, 339, CAST(13000.00 AS Decimal(18, 2)), CAST(16000.00 AS Decimal(18, 2)), CAST(N'2026-06-16' AS Date), CAST(N'2028-06-16' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH023', N'TH023', 5, 276, 276, CAST(31500.00 AS Decimal(18, 2)), CAST(39000.00 AS Decimal(18, 2)), CAST(N'2026-01-21' AS Date), CAST(N'2028-01-21' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH024', N'TH024', 1, 315, 315, CAST(7000.00 AS Decimal(18, 2)), CAST(9000.00 AS Decimal(18, 2)), CAST(N'2025-09-15' AS Date), CAST(N'2027-09-15' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH025', N'TH025', 3, 806, 806, CAST(8500.00 AS Decimal(18, 2)), CAST(11000.00 AS Decimal(18, 2)), CAST(N'2025-11-25' AS Date), CAST(N'2027-11-25' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH026', N'TH026', 2, 658, 658, CAST(48500.00 AS Decimal(18, 2)), CAST(61000.00 AS Decimal(18, 2)), CAST(N'2025-06-27' AS Date), CAST(N'2027-06-27' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH027', N'TH027', 1, 873, 873, CAST(49500.00 AS Decimal(18, 2)), CAST(62000.00 AS Decimal(18, 2)), CAST(N'2026-03-28' AS Date), CAST(N'2028-03-28' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH028', N'TH028', 4, 830, 830, CAST(7000.00 AS Decimal(18, 2)), CAST(9000.00 AS Decimal(18, 2)), CAST(N'2025-11-25' AS Date), CAST(N'2027-11-25' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH029', N'TH029', 5, 340, 340, CAST(49000.00 AS Decimal(18, 2)), CAST(61000.00 AS Decimal(18, 2)), CAST(N'2025-10-07' AS Date), CAST(N'2027-10-07' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH030', N'TH030', 5, 680, 680, CAST(26000.00 AS Decimal(18, 2)), CAST(33000.00 AS Decimal(18, 2)), CAST(N'2025-09-01' AS Date), CAST(N'2027-09-01' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH031', N'TH031', 3, 132, 132, CAST(48000.00 AS Decimal(18, 2)), CAST(60000.00 AS Decimal(18, 2)), CAST(N'2026-01-24' AS Date), CAST(N'2028-01-24' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH032', N'TH032', 4, 840, 840, CAST(17500.00 AS Decimal(18, 2)), CAST(22000.00 AS Decimal(18, 2)), CAST(N'2026-04-15' AS Date), CAST(N'2028-04-15' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH033', N'TH033', 2, 836, 836, CAST(47000.00 AS Decimal(18, 2)), CAST(59000.00 AS Decimal(18, 2)), CAST(N'2026-03-18' AS Date), CAST(N'2028-03-18' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH034', N'TH034', 1, 918, 918, CAST(7500.00 AS Decimal(18, 2)), CAST(9000.00 AS Decimal(18, 2)), CAST(N'2026-06-10' AS Date), CAST(N'2028-06-10' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH035', N'TH035', 4, 971, 971, CAST(21000.00 AS Decimal(18, 2)), CAST(26000.00 AS Decimal(18, 2)), CAST(N'2026-05-15' AS Date), CAST(N'2028-05-15' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH036', N'TH036', 4, 930, 930, CAST(11500.00 AS Decimal(18, 2)), CAST(14000.00 AS Decimal(18, 2)), CAST(N'2026-06-20' AS Date), CAST(N'2028-06-20' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH037', N'TH037', 1, 773, 773, CAST(44500.00 AS Decimal(18, 2)), CAST(56000.00 AS Decimal(18, 2)), CAST(N'2025-08-04' AS Date), CAST(N'2027-08-04' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH038', N'TH038', 2, 786, 786, CAST(41000.00 AS Decimal(18, 2)), CAST(51000.00 AS Decimal(18, 2)), CAST(N'2025-12-03' AS Date), CAST(N'2027-12-03' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH039', N'TH039', 5, 247, 247, CAST(12000.00 AS Decimal(18, 2)), CAST(15000.00 AS Decimal(18, 2)), CAST(N'2026-02-17' AS Date), CAST(N'2028-02-17' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH040', N'TH040', 3, 980, 980, CAST(15000.00 AS Decimal(18, 2)), CAST(19000.00 AS Decimal(18, 2)), CAST(N'2026-01-10' AS Date), CAST(N'2028-01-10' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH041', N'TH041', 3, 867, 867, CAST(37500.00 AS Decimal(18, 2)), CAST(47000.00 AS Decimal(18, 2)), CAST(N'2026-05-22' AS Date), CAST(N'2028-05-22' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH042', N'TH042', 4, 239, 239, CAST(31000.00 AS Decimal(18, 2)), CAST(39000.00 AS Decimal(18, 2)), CAST(N'2025-07-27' AS Date), CAST(N'2027-07-27' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH043', N'TH043', 5, 956, 956, CAST(44000.00 AS Decimal(18, 2)), CAST(55000.00 AS Decimal(18, 2)), CAST(N'2025-12-10' AS Date), CAST(N'2027-12-10' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH044', N'TH044', 4, 269, 269, CAST(8500.00 AS Decimal(18, 2)), CAST(11000.00 AS Decimal(18, 2)), CAST(N'2025-06-29' AS Date), CAST(N'2027-06-29' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH045', N'TH045', 2, 148, 148, CAST(29500.00 AS Decimal(18, 2)), CAST(37000.00 AS Decimal(18, 2)), CAST(N'2026-04-18' AS Date), CAST(N'2028-04-18' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH046', N'TH046', 1, 743, 743, CAST(20500.00 AS Decimal(18, 2)), CAST(26000.00 AS Decimal(18, 2)), CAST(N'2025-07-04' AS Date), CAST(N'2027-07-04' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH047', N'TH047', 2, 706, 706, CAST(47000.00 AS Decimal(18, 2)), CAST(59000.00 AS Decimal(18, 2)), CAST(N'2026-04-17' AS Date), CAST(N'2028-04-17' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH048', N'TH048', 4, 285, 285, CAST(18500.00 AS Decimal(18, 2)), CAST(23000.00 AS Decimal(18, 2)), CAST(N'2025-08-05' AS Date), CAST(N'2027-08-05' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH049', N'TH049', 2, 437, 437, CAST(25000.00 AS Decimal(18, 2)), CAST(31000.00 AS Decimal(18, 2)), CAST(N'2025-12-18' AS Date), CAST(N'2027-12-18' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH050', N'TH050', 1, 890, 890, CAST(13000.00 AS Decimal(18, 2)), CAST(16000.00 AS Decimal(18, 2)), CAST(N'2025-09-09' AS Date), CAST(N'2027-09-09' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH051', N'TH051', 1, 327, 327, CAST(14500.00 AS Decimal(18, 2)), CAST(18000.00 AS Decimal(18, 2)), CAST(N'2026-01-19' AS Date), CAST(N'2028-01-19' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH052', N'TH052', 5, 386, 386, CAST(33000.00 AS Decimal(18, 2)), CAST(41000.00 AS Decimal(18, 2)), CAST(N'2026-06-10' AS Date), CAST(N'2028-06-10' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH053', N'TH053', 5, 180, 180, CAST(8000.00 AS Decimal(18, 2)), CAST(10000.00 AS Decimal(18, 2)), CAST(N'2026-01-29' AS Date), CAST(N'2028-01-29' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH054', N'TH054', 3, 569, 569, CAST(10500.00 AS Decimal(18, 2)), CAST(13000.00 AS Decimal(18, 2)), CAST(N'2025-11-24' AS Date), CAST(N'2027-11-24' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH055', N'TH055', 2, 281, 281, CAST(18000.00 AS Decimal(18, 2)), CAST(23000.00 AS Decimal(18, 2)), CAST(N'2025-10-20' AS Date), CAST(N'2027-10-20' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH056', N'TH056', 4, 772, 772, CAST(20500.00 AS Decimal(18, 2)), CAST(26000.00 AS Decimal(18, 2)), CAST(N'2026-06-24' AS Date), CAST(N'2028-06-24' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH057', N'TH057', 1, 359, 359, CAST(17500.00 AS Decimal(18, 2)), CAST(22000.00 AS Decimal(18, 2)), CAST(N'2025-12-03' AS Date), CAST(N'2027-12-03' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH058', N'TH058', 1, 746, 746, CAST(41500.00 AS Decimal(18, 2)), CAST(52000.00 AS Decimal(18, 2)), CAST(N'2026-05-29' AS Date), CAST(N'2028-05-29' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH059', N'TH059', 3, 332, 332, CAST(6500.00 AS Decimal(18, 2)), CAST(8000.00 AS Decimal(18, 2)), CAST(N'2025-11-01' AS Date), CAST(N'2027-11-01' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH060', N'TH060', 3, 284, 284, CAST(13500.00 AS Decimal(18, 2)), CAST(17000.00 AS Decimal(18, 2)), CAST(N'2026-01-14' AS Date), CAST(N'2028-01-14' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH061', N'TH061', 2, 852, 852, CAST(46000.00 AS Decimal(18, 2)), CAST(58000.00 AS Decimal(18, 2)), CAST(N'2026-05-19' AS Date), CAST(N'2028-05-19' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH062', N'TH062', 3, 585, 585, CAST(6000.00 AS Decimal(18, 2)), CAST(8000.00 AS Decimal(18, 2)), CAST(N'2025-08-10' AS Date), CAST(N'2027-08-10' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH063', N'TH063', 5, 582, 582, CAST(34000.00 AS Decimal(18, 2)), CAST(43000.00 AS Decimal(18, 2)), CAST(N'2026-05-10' AS Date), CAST(N'2028-05-10' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH064', N'TH064', 2, 276, 276, CAST(44000.00 AS Decimal(18, 2)), CAST(55000.00 AS Decimal(18, 2)), CAST(N'2026-04-04' AS Date), CAST(N'2028-04-04' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH065', N'TH065', 1, 276, 276, CAST(7500.00 AS Decimal(18, 2)), CAST(9000.00 AS Decimal(18, 2)), CAST(N'2026-04-05' AS Date), CAST(N'2028-04-05' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH066', N'TH066', 2, 804, 804, CAST(9000.00 AS Decimal(18, 2)), CAST(11000.00 AS Decimal(18, 2)), CAST(N'2026-06-24' AS Date), CAST(N'2028-06-24' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH067', N'TH067', 1, 827, 827, CAST(32000.00 AS Decimal(18, 2)), CAST(40000.00 AS Decimal(18, 2)), CAST(N'2025-10-10' AS Date), CAST(N'2027-10-10' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH068', N'TH068', 2, 270, 270, CAST(41500.00 AS Decimal(18, 2)), CAST(52000.00 AS Decimal(18, 2)), CAST(N'2025-08-28' AS Date), CAST(N'2027-08-28' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH069', N'TH069', 1, 824, 824, CAST(49500.00 AS Decimal(18, 2)), CAST(62000.00 AS Decimal(18, 2)), CAST(N'2026-03-30' AS Date), CAST(N'2028-03-30' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH070', N'TH070', 1, 468, 468, CAST(9500.00 AS Decimal(18, 2)), CAST(12000.00 AS Decimal(18, 2)), CAST(N'2026-05-02' AS Date), CAST(N'2028-05-02' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH071', N'TH071', 4, 1000, 1000, CAST(12500.00 AS Decimal(18, 2)), CAST(16000.00 AS Decimal(18, 2)), CAST(N'2025-10-18' AS Date), CAST(N'2027-10-18' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH072', N'TH072', 3, 471, 471, CAST(21000.00 AS Decimal(18, 2)), CAST(26000.00 AS Decimal(18, 2)), CAST(N'2026-01-07' AS Date), CAST(N'2028-01-07' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH073', N'TH073', 1, 756, 756, CAST(42500.00 AS Decimal(18, 2)), CAST(53000.00 AS Decimal(18, 2)), CAST(N'2026-04-13' AS Date), CAST(N'2028-04-13' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH074', N'TH074', 1, 480, 480, CAST(22500.00 AS Decimal(18, 2)), CAST(28000.00 AS Decimal(18, 2)), CAST(N'2026-03-19' AS Date), CAST(N'2028-03-19' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH075', N'TH075', 4, 380, 380, CAST(47000.00 AS Decimal(18, 2)), CAST(59000.00 AS Decimal(18, 2)), CAST(N'2025-11-20' AS Date), CAST(N'2027-11-20' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH076', N'TH076', 4, 198, 198, CAST(5000.00 AS Decimal(18, 2)), CAST(6000.00 AS Decimal(18, 2)), CAST(N'2025-12-22' AS Date), CAST(N'2027-12-22' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH077', N'TH077', 4, 847, 847, CAST(12500.00 AS Decimal(18, 2)), CAST(16000.00 AS Decimal(18, 2)), CAST(N'2026-03-08' AS Date), CAST(N'2028-03-08' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH078', N'TH078', 2, 247, 247, CAST(21500.00 AS Decimal(18, 2)), CAST(27000.00 AS Decimal(18, 2)), CAST(N'2026-01-31' AS Date), CAST(N'2028-01-31' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH079', N'TH079', 2, 177, 177, CAST(29500.00 AS Decimal(18, 2)), CAST(37000.00 AS Decimal(18, 2)), CAST(N'2025-10-04' AS Date), CAST(N'2027-10-04' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH080', N'TH080', 4, 195, 195, CAST(31000.00 AS Decimal(18, 2)), CAST(39000.00 AS Decimal(18, 2)), CAST(N'2026-01-05' AS Date), CAST(N'2028-01-05' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH081', N'TH081', 2, 856, 856, CAST(23000.00 AS Decimal(18, 2)), CAST(29000.00 AS Decimal(18, 2)), CAST(N'2026-05-11' AS Date), CAST(N'2028-05-11' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH082', N'TH082', 2, 495, 495, CAST(16500.00 AS Decimal(18, 2)), CAST(21000.00 AS Decimal(18, 2)), CAST(N'2026-03-26' AS Date), CAST(N'2028-03-26' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH083', N'TH083', 3, 769, 769, CAST(6000.00 AS Decimal(18, 2)), CAST(8000.00 AS Decimal(18, 2)), CAST(N'2026-06-10' AS Date), CAST(N'2028-06-10' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH084', N'TH084', 4, 473, 473, CAST(4000.00 AS Decimal(18, 2)), CAST(5000.00 AS Decimal(18, 2)), CAST(N'2025-10-23' AS Date), CAST(N'2027-10-23' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH085', N'TH085', 4, 788, 788, CAST(3000.00 AS Decimal(18, 2)), CAST(4000.00 AS Decimal(18, 2)), CAST(N'2025-12-06' AS Date), CAST(N'2027-12-06' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH086', N'TH086', 3, 882, 882, CAST(12500.00 AS Decimal(18, 2)), CAST(16000.00 AS Decimal(18, 2)), CAST(N'2026-04-17' AS Date), CAST(N'2028-04-17' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH087', N'TH087', 3, 114, 114, CAST(15500.00 AS Decimal(18, 2)), CAST(19000.00 AS Decimal(18, 2)), CAST(N'2026-01-31' AS Date), CAST(N'2028-01-31' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH088', N'TH088', 5, 438, 438, CAST(16500.00 AS Decimal(18, 2)), CAST(21000.00 AS Decimal(18, 2)), CAST(N'2026-06-02' AS Date), CAST(N'2028-06-02' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH089', N'TH089', 3, 502, 502, CAST(17500.00 AS Decimal(18, 2)), CAST(22000.00 AS Decimal(18, 2)), CAST(N'2025-07-30' AS Date), CAST(N'2027-07-30' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH090', N'TH090', 1, 897, 897, CAST(4500.00 AS Decimal(18, 2)), CAST(6000.00 AS Decimal(18, 2)), CAST(N'2026-04-15' AS Date), CAST(N'2028-04-15' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH091', N'TH091', 5, 301, 301, CAST(35000.00 AS Decimal(18, 2)), CAST(44000.00 AS Decimal(18, 2)), CAST(N'2026-06-16' AS Date), CAST(N'2028-06-16' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH092', N'TH092', 4, 717, 717, CAST(24000.00 AS Decimal(18, 2)), CAST(30000.00 AS Decimal(18, 2)), CAST(N'2025-08-01' AS Date), CAST(N'2027-08-01' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH093', N'TH093', 3, 179, 179, CAST(13500.00 AS Decimal(18, 2)), CAST(17000.00 AS Decimal(18, 2)), CAST(N'2026-04-01' AS Date), CAST(N'2028-04-01' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH094', N'TH094', 1, 410, 410, CAST(10000.00 AS Decimal(18, 2)), CAST(13000.00 AS Decimal(18, 2)), CAST(N'2025-09-21' AS Date), CAST(N'2027-09-21' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH095', N'TH095', 3, 503, 503, CAST(7000.00 AS Decimal(18, 2)), CAST(9000.00 AS Decimal(18, 2)), CAST(N'2025-10-29' AS Date), CAST(N'2027-10-29' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH096', N'TH096', 4, 938, 938, CAST(13500.00 AS Decimal(18, 2)), CAST(17000.00 AS Decimal(18, 2)), CAST(N'2026-04-07' AS Date), CAST(N'2028-04-07' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH097', N'TH097', 1, 470, 470, CAST(41500.00 AS Decimal(18, 2)), CAST(52000.00 AS Decimal(18, 2)), CAST(N'2026-01-05' AS Date), CAST(N'2028-01-05' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH098', N'TH098', 3, 967, 967, CAST(39000.00 AS Decimal(18, 2)), CAST(49000.00 AS Decimal(18, 2)), CAST(N'2025-09-30' AS Date), CAST(N'2027-09-30' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH099', N'TH099', 4, 201, 201, CAST(10000.00 AS Decimal(18, 2)), CAST(13000.00 AS Decimal(18, 2)), CAST(N'2025-08-18' AS Date), CAST(N'2027-08-18' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH100', N'TH100', 4, 449, 449, CAST(43000.00 AS Decimal(18, 2)), CAST(54000.00 AS Decimal(18, 2)), CAST(N'2026-01-23' AS Date), CAST(N'2028-01-23' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH101', N'TH101', 1, 473, 473, CAST(36500.00 AS Decimal(18, 2)), CAST(46000.00 AS Decimal(18, 2)), CAST(N'2025-10-19' AS Date), CAST(N'2027-10-19' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH102', N'TH102', 1, 945, 945, CAST(44500.00 AS Decimal(18, 2)), CAST(56000.00 AS Decimal(18, 2)), CAST(N'2026-03-16' AS Date), CAST(N'2028-03-16' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH103', N'TH103', 5, 609, 609, CAST(45500.00 AS Decimal(18, 2)), CAST(57000.00 AS Decimal(18, 2)), CAST(N'2026-03-11' AS Date), CAST(N'2028-03-11' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH104', N'TH104', 4, 952, 952, CAST(18500.00 AS Decimal(18, 2)), CAST(23000.00 AS Decimal(18, 2)), CAST(N'2025-12-14' AS Date), CAST(N'2027-12-14' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH105', N'TH105', 1, 632, 632, CAST(24500.00 AS Decimal(18, 2)), CAST(31000.00 AS Decimal(18, 2)), CAST(N'2025-09-12' AS Date), CAST(N'2027-09-12' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH106', N'TH106', 4, 832, 832, CAST(20500.00 AS Decimal(18, 2)), CAST(26000.00 AS Decimal(18, 2)), CAST(N'2026-02-14' AS Date), CAST(N'2028-02-14' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH107', N'TH107', 4, 789, 789, CAST(3000.00 AS Decimal(18, 2)), CAST(4000.00 AS Decimal(18, 2)), CAST(N'2026-05-29' AS Date), CAST(N'2028-05-29' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH108', N'TH108', 2, 559, 559, CAST(40500.00 AS Decimal(18, 2)), CAST(51000.00 AS Decimal(18, 2)), CAST(N'2026-05-10' AS Date), CAST(N'2028-05-10' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH109', N'TH109', 4, 832, 832, CAST(23500.00 AS Decimal(18, 2)), CAST(29000.00 AS Decimal(18, 2)), CAST(N'2025-08-12' AS Date), CAST(N'2027-08-12' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH110', N'TH110', 3, 444, 444, CAST(47000.00 AS Decimal(18, 2)), CAST(59000.00 AS Decimal(18, 2)), CAST(N'2026-03-29' AS Date), CAST(N'2028-03-29' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH111', N'TH111', 2, 238, 238, CAST(24000.00 AS Decimal(18, 2)), CAST(30000.00 AS Decimal(18, 2)), CAST(N'2025-12-11' AS Date), CAST(N'2027-12-11' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH112', N'TH112', 1, 525, 525, CAST(14500.00 AS Decimal(18, 2)), CAST(18000.00 AS Decimal(18, 2)), CAST(N'2025-07-09' AS Date), CAST(N'2027-07-09' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH113', N'TH113', 4, 289, 289, CAST(12500.00 AS Decimal(18, 2)), CAST(16000.00 AS Decimal(18, 2)), CAST(N'2026-03-13' AS Date), CAST(N'2028-03-13' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH114', N'TH114', 5, 846, 846, CAST(19000.00 AS Decimal(18, 2)), CAST(24000.00 AS Decimal(18, 2)), CAST(N'2025-07-25' AS Date), CAST(N'2027-07-25' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH115', N'TH115', 2, 267, 267, CAST(42000.00 AS Decimal(18, 2)), CAST(53000.00 AS Decimal(18, 2)), CAST(N'2025-09-24' AS Date), CAST(N'2027-09-24' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH116', N'TH116', 5, 780, 780, CAST(50000.00 AS Decimal(18, 2)), CAST(63000.00 AS Decimal(18, 2)), CAST(N'2025-11-29' AS Date), CAST(N'2027-11-29' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH117', N'TH117', 2, 597, 597, CAST(42500.00 AS Decimal(18, 2)), CAST(53000.00 AS Decimal(18, 2)), CAST(N'2025-09-05' AS Date), CAST(N'2027-09-05' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH118', N'TH118', 3, 491, 491, CAST(46500.00 AS Decimal(18, 2)), CAST(58000.00 AS Decimal(18, 2)), CAST(N'2026-02-14' AS Date), CAST(N'2028-02-14' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH119', N'TH119', 1, 886, 886, CAST(29500.00 AS Decimal(18, 2)), CAST(37000.00 AS Decimal(18, 2)), CAST(N'2026-04-24' AS Date), CAST(N'2028-04-24' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH120', N'TH120', 1, 977, 977, CAST(25500.00 AS Decimal(18, 2)), CAST(32000.00 AS Decimal(18, 2)), CAST(N'2025-10-09' AS Date), CAST(N'2027-10-09' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH121', N'TH121', 2, 463, 463, CAST(15500.00 AS Decimal(18, 2)), CAST(19000.00 AS Decimal(18, 2)), CAST(N'2026-02-01' AS Date), CAST(N'2028-02-01' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH122', N'TH122', 3, 260, 260, CAST(43500.00 AS Decimal(18, 2)), CAST(54000.00 AS Decimal(18, 2)), CAST(N'2025-10-16' AS Date), CAST(N'2027-10-16' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH123', N'TH123', 2, 771, 771, CAST(17500.00 AS Decimal(18, 2)), CAST(22000.00 AS Decimal(18, 2)), CAST(N'2025-07-22' AS Date), CAST(N'2027-07-22' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH124', N'TH124', 3, 233, 233, CAST(9000.00 AS Decimal(18, 2)), CAST(11000.00 AS Decimal(18, 2)), CAST(N'2025-07-30' AS Date), CAST(N'2027-07-30' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH125', N'TH125', 5, 342, 342, CAST(44000.00 AS Decimal(18, 2)), CAST(55000.00 AS Decimal(18, 2)), CAST(N'2026-01-14' AS Date), CAST(N'2028-01-14' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH126', N'TH126', 2, 929, 929, CAST(9000.00 AS Decimal(18, 2)), CAST(11000.00 AS Decimal(18, 2)), CAST(N'2025-10-07' AS Date), CAST(N'2027-10-07' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH127', N'TH127', 4, 219, 219, CAST(6500.00 AS Decimal(18, 2)), CAST(8000.00 AS Decimal(18, 2)), CAST(N'2025-09-18' AS Date), CAST(N'2027-09-18' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH128', N'TH128', 5, 572, 572, CAST(25500.00 AS Decimal(18, 2)), CAST(32000.00 AS Decimal(18, 2)), CAST(N'2026-05-02' AS Date), CAST(N'2028-05-02' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH129', N'TH129', 2, 373, 373, CAST(4500.00 AS Decimal(18, 2)), CAST(6000.00 AS Decimal(18, 2)), CAST(N'2026-04-07' AS Date), CAST(N'2028-04-07' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH130', N'TH130', 4, 238, 238, CAST(45000.00 AS Decimal(18, 2)), CAST(56000.00 AS Decimal(18, 2)), CAST(N'2025-10-29' AS Date), CAST(N'2027-10-29' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH131', N'TH131', 3, 431, 431, CAST(21500.00 AS Decimal(18, 2)), CAST(27000.00 AS Decimal(18, 2)), CAST(N'2025-11-29' AS Date), CAST(N'2027-11-29' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH132', N'TH132', 1, 990, 990, CAST(43500.00 AS Decimal(18, 2)), CAST(54000.00 AS Decimal(18, 2)), CAST(N'2025-11-18' AS Date), CAST(N'2027-11-18' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH133', N'TH133', 3, 179, 179, CAST(3000.00 AS Decimal(18, 2)), CAST(4000.00 AS Decimal(18, 2)), CAST(N'2026-01-29' AS Date), CAST(N'2028-01-29' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH134', N'TH134', 4, 127, 127, CAST(17500.00 AS Decimal(18, 2)), CAST(22000.00 AS Decimal(18, 2)), CAST(N'2025-11-06' AS Date), CAST(N'2027-11-06' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH135', N'TH135', 3, 337, 337, CAST(45000.00 AS Decimal(18, 2)), CAST(56000.00 AS Decimal(18, 2)), CAST(N'2026-06-14' AS Date), CAST(N'2028-06-14' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH136', N'TH136', 4, 529, 529, CAST(26500.00 AS Decimal(18, 2)), CAST(33000.00 AS Decimal(18, 2)), CAST(N'2026-02-19' AS Date), CAST(N'2028-02-19' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH137', N'TH137', 4, 356, 356, CAST(9500.00 AS Decimal(18, 2)), CAST(12000.00 AS Decimal(18, 2)), CAST(N'2025-07-18' AS Date), CAST(N'2027-07-18' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH138', N'TH138', 2, 678, 678, CAST(37500.00 AS Decimal(18, 2)), CAST(47000.00 AS Decimal(18, 2)), CAST(N'2026-06-01' AS Date), CAST(N'2028-06-01' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH139', N'TH139', 5, 915, 915, CAST(19000.00 AS Decimal(18, 2)), CAST(24000.00 AS Decimal(18, 2)), CAST(N'2025-08-01' AS Date), CAST(N'2027-08-01' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH140', N'TH140', 1, 123, 123, CAST(17000.00 AS Decimal(18, 2)), CAST(21000.00 AS Decimal(18, 2)), CAST(N'2025-08-21' AS Date), CAST(N'2027-08-21' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH141', N'TH141', 3, 127, 127, CAST(34000.00 AS Decimal(18, 2)), CAST(43000.00 AS Decimal(18, 2)), CAST(N'2025-09-27' AS Date), CAST(N'2027-09-27' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH142', N'TH142', 1, 827, 827, CAST(29500.00 AS Decimal(18, 2)), CAST(37000.00 AS Decimal(18, 2)), CAST(N'2025-07-30' AS Date), CAST(N'2027-07-30' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH143', N'TH143', 4, 142, 142, CAST(6000.00 AS Decimal(18, 2)), CAST(8000.00 AS Decimal(18, 2)), CAST(N'2026-04-03' AS Date), CAST(N'2028-04-03' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH144', N'TH144', 3, 566, 566, CAST(36500.00 AS Decimal(18, 2)), CAST(46000.00 AS Decimal(18, 2)), CAST(N'2026-05-05' AS Date), CAST(N'2028-05-05' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH145', N'TH145', 5, 481, 481, CAST(23000.00 AS Decimal(18, 2)), CAST(29000.00 AS Decimal(18, 2)), CAST(N'2025-09-18' AS Date), CAST(N'2027-09-18' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH146', N'TH146', 3, 290, 290, CAST(38500.00 AS Decimal(18, 2)), CAST(48000.00 AS Decimal(18, 2)), CAST(N'2025-07-19' AS Date), CAST(N'2027-07-19' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH147', N'TH147', 3, 686, 686, CAST(14500.00 AS Decimal(18, 2)), CAST(18000.00 AS Decimal(18, 2)), CAST(N'2026-04-02' AS Date), CAST(N'2028-04-02' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH148', N'TH148', 4, 546, 546, CAST(8000.00 AS Decimal(18, 2)), CAST(10000.00 AS Decimal(18, 2)), CAST(N'2026-05-17' AS Date), CAST(N'2028-05-17' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH149', N'TH149', 2, 859, 859, CAST(11000.00 AS Decimal(18, 2)), CAST(14000.00 AS Decimal(18, 2)), CAST(N'2026-06-13' AS Date), CAST(N'2028-06-13' AS Date))
GO
INSERT [dbo].[LoThuoc] ([MaLo], [MaThuoc], [MaNCC], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LTH150', N'TH150', 1, 842, 842, CAST(20000.00 AS Decimal(18, 2)), CAST(25000.00 AS Decimal(18, 2)), CAST(N'2026-02-10' AS Date), CAST(N'2028-02-10' AS Date))
GO
INSERT [dbo].[LoVatTu] ([MaLo], [MaVatTu], [MaNcc], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LVT26001', N'VT001', 1, 2000, 1800, CAST(1500.00 AS Decimal(18, 2)), CAST(3000.00 AS Decimal(18, 2)), CAST(N'2026-01-05' AS Date), CAST(N'2029-01-05' AS Date))
GO
INSERT [dbo].[LoVatTu] ([MaLo], [MaVatTu], [MaNcc], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LVT26002', N'VT002', 2, 1000, 900, CAST(2500.00 AS Decimal(18, 2)), CAST(5000.00 AS Decimal(18, 2)), CAST(N'2026-02-10' AS Date), CAST(N'2029-02-10' AS Date))
GO
INSERT [dbo].[LoVatTu] ([MaLo], [MaVatTu], [MaNcc], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LVT26003', N'VT003', 3, 500, 450, CAST(8000.00 AS Decimal(18, 2)), CAST(15000.00 AS Decimal(18, 2)), CAST(N'2026-03-15' AS Date), CAST(N'2028-03-15' AS Date))
GO
INSERT [dbo].[LoVatTu] ([MaLo], [MaVatTu], [MaNcc], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LVT26004', N'VT004', 4, 3000, 2800, CAST(500.00 AS Decimal(18, 2)), CAST(1000.00 AS Decimal(18, 2)), CAST(N'2026-01-20' AS Date), CAST(N'2029-01-20' AS Date))
GO
INSERT [dbo].[LoVatTu] ([MaLo], [MaVatTu], [MaNcc], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LVT26005', N'VT005', 5, 1500, 1400, CAST(4000.00 AS Decimal(18, 2)), CAST(8000.00 AS Decimal(18, 2)), CAST(N'2026-02-25' AS Date), CAST(N'2029-02-25' AS Date))
GO
INSERT [dbo].[LoVatTu] ([MaLo], [MaVatTu], [MaNcc], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LVT26006', N'VT006', 1, 800, 750, CAST(12000.00 AS Decimal(18, 2)), CAST(20000.00 AS Decimal(18, 2)), CAST(N'2026-03-10' AS Date), CAST(N'2028-03-10' AS Date))
GO
INSERT [dbo].[LoVatTu] ([MaLo], [MaVatTu], [MaNcc], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LVT26007', N'VT007', 2, 5000, 4800, CAST(300.00 AS Decimal(18, 2)), CAST(600.00 AS Decimal(18, 2)), CAST(N'2026-01-15' AS Date), CAST(N'2029-01-15' AS Date))
GO
INSERT [dbo].[LoVatTu] ([MaLo], [MaVatTu], [MaNcc], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LVT26008', N'VT008', 3, 1200, 1100, CAST(6000.00 AS Decimal(18, 2)), CAST(10000.00 AS Decimal(18, 2)), CAST(N'2026-02-18' AS Date), CAST(N'2028-02-18' AS Date))
GO
INSERT [dbo].[LoVatTu] ([MaLo], [MaVatTu], [MaNcc], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LVT26009', N'VT009', 4, 600, 550, CAST(15000.00 AS Decimal(18, 2)), CAST(25000.00 AS Decimal(18, 2)), CAST(N'2026-03-05' AS Date), CAST(N'2027-03-05' AS Date))
GO
INSERT [dbo].[LoVatTu] ([MaLo], [MaVatTu], [MaNcc], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LVT26010', N'VT010', 5, 2500, 2400, CAST(1000.00 AS Decimal(18, 2)), CAST(2000.00 AS Decimal(18, 2)), CAST(N'2026-01-30' AS Date), CAST(N'2029-01-30' AS Date))
GO
INSERT [dbo].[LoVatTu] ([MaLo], [MaVatTu], [MaNcc], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LVT26011', N'VT011', 1, 400, 380, CAST(25000.00 AS Decimal(18, 2)), CAST(45000.00 AS Decimal(18, 2)), CAST(N'2026-02-12' AS Date), CAST(N'2029-02-12' AS Date))
GO
INSERT [dbo].[LoVatTu] ([MaLo], [MaVatTu], [MaNcc], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LVT26012', N'VT012', 2, 1000, 950, CAST(3500.00 AS Decimal(18, 2)), CAST(7000.00 AS Decimal(18, 2)), CAST(N'2026-03-01' AS Date), CAST(N'2028-03-01' AS Date))
GO
INSERT [dbo].[LoVatTu] ([MaLo], [MaVatTu], [MaNcc], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LVT26013', N'VT013', 3, 300, 280, CAST(45000.00 AS Decimal(18, 2)), CAST(75000.00 AS Decimal(18, 2)), CAST(N'2026-01-25' AS Date), CAST(N'2029-01-25' AS Date))
GO
INSERT [dbo].[LoVatTu] ([MaLo], [MaVatTu], [MaNcc], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LVT26014', N'VT014', 4, 800, 750, CAST(8000.00 AS Decimal(18, 2)), CAST(14000.00 AS Decimal(18, 2)), CAST(N'2026-02-20' AS Date), CAST(N'2028-02-20' AS Date))
GO
INSERT [dbo].[LoVatTu] ([MaLo], [MaVatTu], [MaNcc], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LVT26015', N'VT015', 5, 2000, 1898, CAST(1200.00 AS Decimal(18, 2)), CAST(2500.00 AS Decimal(18, 2)), CAST(N'2026-03-02' AS Date), CAST(N'2029-03-02' AS Date))
GO
INSERT [dbo].[LoVatTu] ([MaLo], [MaVatTu], [MaNcc], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LVT26016', N'VT016', 1, 1000, 920, CAST(5000.00 AS Decimal(18, 2)), CAST(10000.00 AS Decimal(18, 2)), CAST(N'2026-01-08' AS Date), CAST(N'2029-01-08' AS Date))
GO
INSERT [dbo].[LoVatTu] ([MaLo], [MaVatTu], [MaNcc], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LVT26017', N'VT017', 2, 1500, 1450, CAST(4500.00 AS Decimal(18, 2)), CAST(9000.00 AS Decimal(18, 2)), CAST(N'2026-02-14' AS Date), CAST(N'2028-02-14' AS Date))
GO
INSERT [dbo].[LoVatTu] ([MaLo], [MaVatTu], [MaNcc], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LVT26018', N'VT018', 3, 2000, 1950, CAST(3000.00 AS Decimal(18, 2)), CAST(6000.00 AS Decimal(18, 2)), CAST(N'2026-03-08' AS Date), CAST(N'2029-03-08' AS Date))
GO
INSERT [dbo].[LoVatTu] ([MaLo], [MaVatTu], [MaNcc], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LVT26019', N'VT019', 4, 2000, 1920, CAST(3000.00 AS Decimal(18, 2)), CAST(6000.00 AS Decimal(18, 2)), CAST(N'2026-03-08' AS Date), CAST(N'2029-03-08' AS Date))
GO
INSERT [dbo].[LoVatTu] ([MaLo], [MaVatTu], [MaNcc], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LVT26020', N'VT020', 5, 1000, 980, CAST(7000.00 AS Decimal(18, 2)), CAST(12000.00 AS Decimal(18, 2)), CAST(N'2026-01-12' AS Date), CAST(N'2029-01-12' AS Date))
GO
INSERT [dbo].[LoVatTu] ([MaLo], [MaVatTu], [MaNcc], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LVT26021', N'VT021', 1, 500, 480, CAST(15000.00 AS Decimal(18, 2)), CAST(25000.00 AS Decimal(18, 2)), CAST(N'2026-02-22' AS Date), CAST(N'2028-02-22' AS Date))
GO
INSERT [dbo].[LoVatTu] ([MaLo], [MaVatTu], [MaNcc], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LVT26022', N'VT022', 2, 3000, 2900, CAST(800.00 AS Decimal(18, 2)), CAST(1500.00 AS Decimal(18, 2)), CAST(N'2026-03-12' AS Date), CAST(N'2029-03-12' AS Date))
GO
INSERT [dbo].[LoVatTu] ([MaLo], [MaVatTu], [MaNcc], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LVT26023', N'VT023', 3, 1000, 960, CAST(4000.00 AS Decimal(18, 2)), CAST(8000.00 AS Decimal(18, 2)), CAST(N'2026-01-18' AS Date), CAST(N'2029-01-18' AS Date))
GO
INSERT [dbo].[LoVatTu] ([MaLo], [MaVatTu], [MaNcc], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LVT26024', N'VT024', 4, 300, 290, CAST(30000.00 AS Decimal(18, 2)), CAST(50000.00 AS Decimal(18, 2)), CAST(N'2026-02-26' AS Date), CAST(N'2028-02-26' AS Date))
GO
INSERT [dbo].[LoVatTu] ([MaLo], [MaVatTu], [MaNcc], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LVT26025', N'VT025', 5, 1200, 1150, CAST(6000.00 AS Decimal(18, 2)), CAST(11000.00 AS Decimal(18, 2)), CAST(N'2026-03-18' AS Date), CAST(N'2029-03-18' AS Date))
GO
INSERT [dbo].[LoVatTu] ([MaLo], [MaVatTu], [MaNcc], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LVT26026', N'VT026', 1, 100, 95, CAST(150000.00 AS Decimal(18, 2)), CAST(250000.00 AS Decimal(18, 2)), CAST(N'2026-01-22' AS Date), CAST(N'2029-01-22' AS Date))
GO
INSERT [dbo].[LoVatTu] ([MaLo], [MaVatTu], [MaNcc], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LVT26027', N'VT027', 2, 800, 780, CAST(20000.00 AS Decimal(18, 2)), CAST(35000.00 AS Decimal(18, 2)), CAST(N'2026-02-28' AS Date), CAST(N'2028-02-28' AS Date))
GO
INSERT [dbo].[LoVatTu] ([MaLo], [MaVatTu], [MaNcc], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LVT26028', N'VT028', 3, 2500, 2400, CAST(1500.00 AS Decimal(18, 2)), CAST(3000.00 AS Decimal(18, 2)), CAST(N'2026-03-22' AS Date), CAST(N'2029-03-22' AS Date))
GO
INSERT [dbo].[LoVatTu] ([MaLo], [MaVatTu], [MaNcc], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LVT26029', N'VT029', 4, 500, 480, CAST(12000.00 AS Decimal(18, 2)), CAST(22000.00 AS Decimal(18, 2)), CAST(N'2026-01-28' AS Date), CAST(N'2029-01-28' AS Date))
GO
INSERT [dbo].[LoVatTu] ([MaLo], [MaVatTu], [MaNcc], [SoLuongNhap], [SoLuongTon], [GiaNhap], [GiaBan], [NgaySanXuat], [HanSuDung]) VALUES (N'LVT26030', N'VT030', 5, 4000, 3850, CAST(400.00 AS Decimal(18, 2)), CAST(800.00 AS Decimal(18, 2)), CAST(N'2026-02-15' AS Date), CAST(N'2029-02-15' AS Date))
GO
SET IDENTITY_INSERT [dbo].[NhaCungCap] ON 

GO
INSERT [dbo].[NhaCungCap] ([MaNCC], [TenNCC], [SDT], [DiaChi]) VALUES (1, N'Công ty Cổ phần Dược Hậu Giang (DHG)', N'02923891433', N'288 Nguyễn Văn Cừ, P. An Hòa, Q. Ninh Kiều, Cần Thơ')
GO
INSERT [dbo].[NhaCungCap] ([MaNCC], [TenNCC], [SDT], [DiaChi]) VALUES (2, N'Công ty Cổ phần Dược phẩm OPC', N'02839601057', N'1017 Hồng Bàng, Phường 12, Quận 6, TP. Hồ Chí Minh')
GO
INSERT [dbo].[NhaCungCap] ([MaNCC], [TenNCC], [SDT], [DiaChi]) VALUES (3, N'Công ty Cổ phần Traphaco', N'18006612', N'75 Yên Ninh, Ba Đình, Hà Nội')
GO
INSERT [dbo].[NhaCungCap] ([MaNCC], [TenNCC], [SDT], [DiaChi]) VALUES (4, N'Tổng công ty Dược Việt Nam (Vinapharm)', N'02438465139', N'95 Láng Hạ, Đống Đa, Hà Nội')
GO
INSERT [dbo].[NhaCungCap] ([MaNCC], [TenNCC], [SDT], [DiaChi]) VALUES (5, N'Công ty TNHH Dược phẩm Zuellig Pharma', N'02839102626', N'Lầu 10, Saigon Centre, 65 Lê Lợi, Quận 1, TP. Hồ Chí Minh')
GO
SET IDENTITY_INSERT [dbo].[NhaCungCap] OFF
GO
INSERT [dbo].[NhanVien] ([MaNV], [UserID], [HoTen], [ChuyenMon], [SDT], [Email], [MaKhoa]) VALUES (N'NV001', 1, N'Mai Xuân Phát', NULL, N'0896421137', N'mxp1803MaiXuanPhat@gmail.com', NULL)
GO
INSERT [dbo].[NhanVien] ([MaNV], [UserID], [HoTen], [ChuyenMon], [SDT], [Email], [MaKhoa]) VALUES (N'NV002', 2, N'Phan Nhựt Hào', NULL, N'0941646475', N'Haopn9@gmail.com', NULL)
GO
INSERT [dbo].[NhanVien] ([MaNV], [UserID], [HoTen], [ChuyenMon], [SDT], [Email], [MaKhoa]) VALUES (N'NV003', 3, N'Mai Xuân Phúc', N'Nội tổng quát', N'0896413471', N'maixuanphuc@gmail.com', N'KHOA01')
GO
INSERT [dbo].[NhanVien] ([MaNV], [UserID], [HoTen], [ChuyenMon], [SDT], [Email], [MaKhoa]) VALUES (N'NV004', 4, N'Lễ Tân', NULL, N'0896451157', N'letan@gmail.com', NULL)
GO
INSERT [dbo].[NhanVien] ([MaNV], [UserID], [HoTen], [ChuyenMon], [SDT], [Email], [MaKhoa]) VALUES (N'NV005', 5, N'BS. CK1. Nguyễn Thị Bình', N'Nội tổng quát', N'0901000005', N'bs.nguyenthibinh@phongkham.vn', N'KHOA01')
GO
INSERT [dbo].[NhanVien] ([MaNV], [UserID], [HoTen], [ChuyenMon], [SDT], [Email], [MaKhoa]) VALUES (N'NV006', 6, N'BS. CK1. Trịnh Văn Châu', N'Tim mạch', N'0901000006', N'bs.trinhvanchau@phongkham.vn', N'KHOA02')
GO
INSERT [dbo].[NhanVien] ([MaNV], [UserID], [HoTen], [ChuyenMon], [SDT], [Email], [MaKhoa]) VALUES (N'NV007', 7, N'BS. CK2. Lê Thị Cúc', N'Tim mạch', N'0901000007', N'bs.lethicuc@phongkham.vn', N'KHOA02')
GO
INSERT [dbo].[NhanVien] ([MaNV], [UserID], [HoTen], [ChuyenMon], [SDT], [Email], [MaKhoa]) VALUES (N'NV008', 8, N'BS. Trần Văn Dung', N'Nhi khoa', N'0901000008', N'bs.tranvandung@phongkham.vn', N'KHOA03')
GO
INSERT [dbo].[NhanVien] ([MaNV], [UserID], [HoTen], [ChuyenMon], [SDT], [Email], [MaKhoa]) VALUES (N'NV009', 9, N'BS. CK1. Phạm Thị Em', N'Nhi khoa', N'0901000009', N'bs.phamthiem@phongkham.vn', N'KHOA03')
GO
INSERT [dbo].[NhanVien] ([MaNV], [UserID], [HoTen], [ChuyenMon], [SDT], [Email], [MaKhoa]) VALUES (N'NV010', 10, N'BS. CK1. Hoàng Văn Giang', N'Tai Mũi Họng', N'0901000010', N'bs.hoangvangiang@phongkham.vn', N'KHOA04')
GO
INSERT [dbo].[NhanVien] ([MaNV], [UserID], [HoTen], [ChuyenMon], [SDT], [Email], [MaKhoa]) VALUES (N'NV011', 11, N'BS. CK2. Đỗ Thị Hương', N'Tai Mũi Họng', N'0901000011', N'bs.dothihuong@phongkham.vn', N'KHOA04')
GO
INSERT [dbo].[NhanVien] ([MaNV], [UserID], [HoTen], [ChuyenMon], [SDT], [Email], [MaKhoa]) VALUES (N'NV012', 12, N'Phạm Thị Thu Ngân', NULL, N'0901000012', N'thungan@phongkham.vn', NULL)
GO
INSERT [dbo].[NhanVien] ([MaNV], [UserID], [HoTen], [ChuyenMon], [SDT], [Email], [MaKhoa]) VALUES (N'NV013', 13, N'Lê Văn Khoa', NULL, N'0901000013', N'quanlykho@phongkham.vn', NULL)
GO
INSERT [dbo].[PhieuKham] ([MaPhieu], [MaBN], [NgayKham], [Mach], [NhietDo], [HuyetAp], [CanNang], [ChieuCao], [KetLuan], [TrangThaiKham], [LyDoKham], [MaNV]) VALUES (N'PK_260703_001', N'BN260703001', CAST(N'2026-07-03T21:54:40.230' AS DateTime), 65, 37, N'125/87', 80, 183, N'đau đầu chóng mặt ù tai', 3, N'abc', N'NV001')
GO
INSERT [dbo].[PhieuKham] ([MaPhieu], [MaBN], [NgayKham], [Mach], [NhietDo], [HuyetAp], [CanNang], [ChieuCao], [KetLuan], [TrangThaiKham], [LyDoKham], [MaNV]) VALUES (N'PK_260711_001', N'BN260711001', CAST(N'2026-07-11T09:22:51.787' AS DateTime), 65, 37, N'120/65', 88, 173, N'test', 3, N'đau đầu', N'NV003')
GO
INSERT [dbo].[PhieuKham] ([MaPhieu], [MaBN], [NgayKham], [Mach], [NhietDo], [HuyetAp], [CanNang], [ChieuCao], [KetLuan], [TrangThaiKham], [LyDoKham], [MaNV]) VALUES (N'PK_260711_002', N'BN260711002', CAST(N'2026-07-11T10:45:01.010' AS DateTime), NULL, NULL, NULL, NULL, NULL, NULL, 0, N'test 2', N'NV004')
GO
INSERT [dbo].[PhieuKham] ([MaPhieu], [MaBN], [NgayKham], [Mach], [NhietDo], [HuyetAp], [CanNang], [ChieuCao], [KetLuan], [TrangThaiKham], [LyDoKham], [MaNV]) VALUES (N'PK_260714_001', N'BN260714001', CAST(N'2026-07-14T15:30:15.150' AS DateTime), NULL, NULL, NULL, NULL, NULL, NULL, 0, N'test', N'NV003')
GO
INSERT [dbo].[PhieuKham] ([MaPhieu], [MaBN], [NgayKham], [Mach], [NhietDo], [HuyetAp], [CanNang], [ChieuCao], [KetLuan], [TrangThaiKham], [LyDoKham], [MaNV]) VALUES (N'PK_260714_002', N'BN260711001', CAST(N'2026-07-14T19:04:53.503' AS DateTime), 60, 37, N'119/13', 67, 156, N'mệt', 3, N'test 2', N'NV003')
GO
INSERT [dbo].[PhieuKham] ([MaPhieu], [MaBN], [NgayKham], [Mach], [NhietDo], [HuyetAp], [CanNang], [ChieuCao], [KetLuan], [TrangThaiKham], [LyDoKham], [MaNV]) VALUES (N'PK_260719_001', N'BN260719001', CAST(N'2026-07-19T20:08:19.153' AS DateTime), NULL, NULL, NULL, NULL, NULL, NULL, 0, N'mệt###Nam|20/03/1998|test|test', N'NV003')
GO
INSERT [dbo].[PhieuKham] ([MaPhieu], [MaBN], [NgayKham], [Mach], [NhietDo], [HuyetAp], [CanNang], [ChieuCao], [KetLuan], [TrangThaiKham], [LyDoKham], [MaNV]) VALUES (N'PK_260723_001', N'BN260723001', CAST(N'2026-07-23T10:04:50.563' AS DateTime), 170, 38, N'120/45', 80, 171, N'test', 3, N'đau đầu###Nam|12/02/2002|a105 Nhật Tảo|không có', N'NV003')
GO
INSERT [dbo].[PhieuKham] ([MaPhieu], [MaBN], [NgayKham], [Mach], [NhietDo], [HuyetAp], [CanNang], [ChieuCao], [KetLuan], [TrangThaiKham], [LyDoKham], [MaNV]) VALUES (N'PK_260723_002', N'BN260723002', CAST(N'2026-07-23T10:06:07.293' AS DateTime), 120, 37.5, N'120/60', 80, 171, N'test', 3, N'đau đầu chóng mặt', N'NV003')
GO
INSERT [dbo].[PhieuKham] ([MaPhieu], [MaBN], [NgayKham], [Mach], [NhietDo], [HuyetAp], [CanNang], [ChieuCao], [KetLuan], [TrangThaiKham], [LyDoKham], [MaNV]) VALUES (N'PK_260723_003', N'BN260723001', CAST(N'2026-07-23T12:29:44.377' AS DateTime), NULL, NULL, NULL, NULL, NULL, NULL, 0, N'test khám lần 2', N'NV005')
GO
INSERT [dbo].[PhieuKham] ([MaPhieu], [MaBN], [NgayKham], [Mach], [NhietDo], [HuyetAp], [CanNang], [ChieuCao], [KetLuan], [TrangThaiKham], [LyDoKham], [MaNV]) VALUES (N'PK_260724_001', N'BN260724001', CAST(N'2026-07-24T15:32:44.177' AS DateTime), 120, 38, N'150/50', 80, 171, N'ung thư vú', 3, N'test lọ', N'NV003')
GO
INSERT [dbo].[PhieuKham] ([MaPhieu], [MaBN], [NgayKham], [Mach], [NhietDo], [HuyetAp], [CanNang], [ChieuCao], [KetLuan], [TrangThaiKham], [LyDoKham], [MaNV]) VALUES (N'PK_260724_002', N'BN260724002', CAST(N'2026-07-24T16:03:16.440' AS DateTime), 120, 38, N'150/45', 45, 171, NULL, 1, N'tester', N'NV003')
GO
INSERT [dbo].[PhieuKham] ([MaPhieu], [MaBN], [NgayKham], [Mach], [NhietDo], [HuyetAp], [CanNang], [ChieuCao], [KetLuan], [TrangThaiKham], [LyDoKham], [MaNV]) VALUES (N'PK_260806_001', N'BN260806001', CAST(N'2026-08-06T13:30:00.000' AS DateTime), 120, 38, N'120/45', 80, 171, N'test', 3, N'test###Nam|18/03/2003|test|test', N'NV003')
GO
SET IDENTITY_INSERT [dbo].[Roles] ON 

GO
INSERT [dbo].[Roles] ([RoleID], [RoleName]) VALUES (1, N'Admin')
GO
INSERT [dbo].[Roles] ([RoleID], [RoleName]) VALUES (2, N'BacSi')
GO
INSERT [dbo].[Roles] ([RoleID], [RoleName]) VALUES (3, N'LeTan')
GO
INSERT [dbo].[Roles] ([RoleID], [RoleName]) VALUES (5, N'QuanLyKho')
GO
INSERT [dbo].[Roles] ([RoleID], [RoleName]) VALUES (4, N'ThuNgan')
GO
SET IDENTITY_INSERT [dbo].[Roles] OFF
GO
SET IDENTITY_INSERT [dbo].[Users] ON 

GO
INSERT [dbo].[Users] ([UserID], [Username], [PasswordHash], [RoleID], [IsActive]) VALUES (1, N'mxp1803MaiXuanPhat@gmail.com', N'$2a$11$TD6WIku3g.4GX/27.VjjD.EIMzgo/gk6SashP21uKuqt.LpjTT3my', 1, 1)
GO
INSERT [dbo].[Users] ([UserID], [Username], [PasswordHash], [RoleID], [IsActive]) VALUES (2, N'Haopn9@gmail.com', N'$2a$11$fonzOMTtEEkJzBDgcUMMKOV03ttIZjk9AFuU3cGbe4opDFMD3bxSq', 1, 1)
GO
INSERT [dbo].[Users] ([UserID], [Username], [PasswordHash], [RoleID], [IsActive]) VALUES (3, N'maixuanphuc@gmail.com', N'$2a$11$6R6leHQ/3nknu25VYCeQV.SwW7zqBFwP8qMicx35P98B0WugSSda.', 2, 1)
GO
INSERT [dbo].[Users] ([UserID], [Username], [PasswordHash], [RoleID], [IsActive]) VALUES (4, N'letan@gmail.com', N'$2a$11$ZG4ynbs7JPHjPYmxhz2wXeunfqOGfzhsiUQ9hJnu7PtqprVOlzum2', 3, 1)
GO
INSERT [dbo].[Users] ([UserID], [Username], [PasswordHash], [RoleID], [IsActive]) VALUES (5, N'bs.nguyenthibinh@phongkham.vn', N'$2a$11$k4U5kRMwZN3LDZWgzffGTeW9YrzORXdIhb.Oz8lYnVjVzZdwa7v5K', 2, 1)
GO
INSERT [dbo].[Users] ([UserID], [Username], [PasswordHash], [RoleID], [IsActive]) VALUES (6, N'bs.trinhvanchau@phongkham.vn', N'$2a$11$k4U5kRMwZN3LDZWgzffGTeW9YrzORXdIhb.Oz8lYnVjVzZdwa7v5K', 2, 1)
GO
INSERT [dbo].[Users] ([UserID], [Username], [PasswordHash], [RoleID], [IsActive]) VALUES (7, N'bs.lethicuc@phongkham.vn', N'$2a$11$k4U5kRMwZN3LDZWgzffGTeW9YrzORXdIhb.Oz8lYnVjVzZdwa7v5K', 2, 1)
GO
INSERT [dbo].[Users] ([UserID], [Username], [PasswordHash], [RoleID], [IsActive]) VALUES (8, N'bs.tranvandung@phongkham.vn', N'$2a$11$k4U5kRMwZN3LDZWgzffGTeW9YrzORXdIhb.Oz8lYnVjVzZdwa7v5K', 2, 1)
GO
INSERT [dbo].[Users] ([UserID], [Username], [PasswordHash], [RoleID], [IsActive]) VALUES (9, N'bs.phamthiem@phongkham.vn', N'$2a$11$k4U5kRMwZN3LDZWgzffGTeW9YrzORXdIhb.Oz8lYnVjVzZdwa7v5K', 2, 1)
GO
INSERT [dbo].[Users] ([UserID], [Username], [PasswordHash], [RoleID], [IsActive]) VALUES (10, N'bs.hoangvangiang@phongkham.vn', N'$2a$11$k4U5kRMwZN3LDZWgzffGTeW9YrzORXdIhb.Oz8lYnVjVzZdwa7v5K', 2, 1)
GO
INSERT [dbo].[Users] ([UserID], [Username], [PasswordHash], [RoleID], [IsActive]) VALUES (11, N'bs.dothihuong@phongkham.vn', N'$2a$11$k4U5kRMwZN3LDZWgzffGTeW9YrzORXdIhb.Oz8lYnVjVzZdwa7v5K', 2, 1)
GO
INSERT [dbo].[Users] ([UserID], [Username], [PasswordHash], [RoleID], [IsActive]) VALUES (12, N'thungan@phongkham.vn', N'$2a$11$k4U5kRMwZN3LDZWgzffGTeW9YrzORXdIhb.Oz8lYnVjVzZdwa7v5K', 4, 1)
GO
INSERT [dbo].[Users] ([UserID], [Username], [PasswordHash], [RoleID], [IsActive]) VALUES (13, N'quanlykho@phongkham.vn', N'$2a$11$k4U5kRMwZN3LDZWgzffGTeW9YrzORXdIhb.Oz8lYnVjVzZdwa7v5K', 5, 1)
GO
INSERT [dbo].[Users] ([UserID], [Username], [PasswordHash], [RoleID], [IsActive]) VALUES (14, N'nguyenvanan', N'$2a$11$k4U5kRMwZN3LDZWgzffGTeW9YrzORXdIhb.Oz8lYnVjVzZdwa7v5K', 2, 1)
GO
INSERT [dbo].[Users] ([UserID], [Username], [PasswordHash], [RoleID], [IsActive]) VALUES (15, N'tranthibinh', N'$2a$11$k4U5kRMwZN3LDZWgzffGTeW9YrzORXdIhb.Oz8lYnVjVzZdwa7v5K', 2, 1)
GO
INSERT [dbo].[Users] ([UserID], [Username], [PasswordHash], [RoleID], [IsActive]) VALUES (16, N'phamminhcuong', N'$2a$11$k4U5kRMwZN3LDZWgzffGTeW9YrzORXdIhb.Oz8lYnVjVzZdwa7v5K', 2, 1)
GO
INSERT [dbo].[Users] ([UserID], [Username], [PasswordHash], [RoleID], [IsActive]) VALUES (17, N'lehoainam', N'$2a$11$k4U5kRMwZN3LDZWgzffGTeW9YrzORXdIhb.Oz8lYnVjVzZdwa7v5K', 2, 1)
GO
INSERT [dbo].[Users] ([UserID], [Username], [PasswordHash], [RoleID], [IsActive]) VALUES (18, N'dohainam', N'$2a$11$k4U5kRMwZN3LDZWgzffGTeW9YrzORXdIhb.Oz8lYnVjVzZdwa7v5K', 2, 1)
GO
INSERT [dbo].[Users] ([UserID], [Username], [PasswordHash], [RoleID], [IsActive]) VALUES (19, N'vuthihuong', N'$2a$11$k4U5kRMwZN3LDZWgzffGTeW9YrzORXdIhb.Oz8lYnVjVzZdwa7v5K', 2, 1)
GO
INSERT [dbo].[Users] ([UserID], [Username], [PasswordHash], [RoleID], [IsActive]) VALUES (20, N'nguyenhoanglong', N'$2a$11$k4U5kRMwZN3LDZWgzffGTeW9YrzORXdIhb.Oz8lYnVjVzZdwa7v5K', 2, 1)
GO
INSERT [dbo].[Users] ([UserID], [Username], [PasswordHash], [RoleID], [IsActive]) VALUES (21, N'hoangbichngoc', N'$2a$11$k4U5kRMwZN3LDZWgzffGTeW9YrzORXdIhb.Oz8lYnVjVzZdwa7v5K', 2, 1)
GO
SET IDENTITY_INSERT [dbo].[Users] OFF
GO
SET ANSI_PADDING ON

GO
/****** Object:  Index [UQ__DanhMucK__AAD3615840AEBE5D]    Script Date: 8/10/2026 11:21:10 PM ******/
ALTER TABLE [dbo].[DanhMucKhoa] ADD UNIQUE NONCLUSTERED 
(
	[TenKhoa] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON

GO
/****** Object:  Index [UQ_LichLamViec_BacSi_Ngay_Ca]    Script Date: 8/10/2026 11:21:10 PM ******/
ALTER TABLE [dbo].[LichLamViec] ADD  CONSTRAINT [UQ_LichLamViec_BacSi_Ngay_Ca] UNIQUE NONCLUSTERED 
(
	[MaNV] ASC,
	[NgayLamViec] ASC,
	[CaLamViec] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [UQ__NhanVien__1788CCAD06CD0FBA]    Script Date: 8/10/2026 11:21:10 PM ******/
ALTER TABLE [dbo].[NhanVien] ADD UNIQUE NONCLUSTERED 
(
	[UserID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON

GO
/****** Object:  Index [UQ__Roles__8A2B6160C015B4BC]    Script Date: 8/10/2026 11:21:10 PM ******/
ALTER TABLE [dbo].[Roles] ADD UNIQUE NONCLUSTERED 
(
	[RoleName] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON

GO
/****** Object:  Index [UQ__Users__536C85E4F3EDCB1B]    Script Date: 8/10/2026 11:21:10 PM ******/
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
