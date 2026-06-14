# Cẩm Nang Học Tập: Tìm hiểu React & Tailwind CSS
*(Dành riêng cho báo cáo và phản biện đồ án phòng khám)*

Tài liệu này giải thích chi tiết, khoa học nhưng cực kỳ dễ hiểu về các khái niệm cốt lõi trong **React** và **Tailwind CSS** mà thầy cô thường xuyên hỏi khi duyệt đồ án tốt nghiệp.

---

## PHẦN I: TÌM HIỂU VỀ REACT

React là một thư viện JavaScript mã nguồn mở được phát triển bởi Facebook (Meta) chuyên dùng để xây dựng giao diện người dùng (UI) dạng **Single Page Application (SPA)** - ứng dụng trang đơn chạy mượt mà không cần tải lại toàn bộ trang web.

### 1. Component (Thành phần giao diện)
* **Định nghĩa:** Component là các khối gạch xây dựng nên giao diện. Mỗi Component là một hàm JavaScript độc lập, tự quản lý giao diện (JSX) và logic của riêng nó.
* **Cách hoạt động:** Các component có thể lồng vào nhau tạo thành một "cây component" (Component Tree).
* **Ví dụ trong dự án của bạn:**
  * Component lớn: Trang tiếp đón `TiepDon.jsx`, trang khám bệnh `KhamBenh.jsx`.
  * Component con bên trong: `<ArrowLeft size={16} />` (nút quay lại từ thư viện lucide-react).
* **Lợi ích:** Dễ bảo trì (lỗi ở đâu sửa ở component đó), dễ tái sử dụng (viết một lần dùng nhiều nơi) và code rất sạch sẽ.

---

### 2. Props (Thuộc tính truyền dữ liệu)
* **Định nghĩa:** **Props** (viết tắt của Properties) là cách các component truyền dữ liệu cho nhau theo chiều **từ cha xuống con** (một chiều duy nhất).
* **Đặc điểm:** Props là **chỉ đọc (Read-only)**, component con nhận được props không thể tự ý sửa đổi giá trị của nó.
* **Ví dụ trong dự án của bạn:**
  * Component `ProtectedRoute` nhận vào component con thông qua prop tên là `{ children }`:
    ```jsx
    export function ProtectedRoute({ children }) { ... }
    ```
    Khi gọi trong `App.jsx`: `<ProtectedRoute><Home /></ProtectedRoute>`, component `<Home />` chính là `children` được truyền xuống dạng props.

---

### 3. State Management (Quản lý trạng thái dữ liệu)
Trạng thái (State) là "trái tim" tạo nên sự sống của React. Khác với biến thông thường, khi State thay đổi, React sẽ **tự động vẽ lại (re-render)** giao diện hiển thị dữ liệu mới.

#### 3.1. Local State (Trạng thái nội bộ - `useState`)
* **Khái niệm:** Dùng để quản lý dữ liệu riêng tư của một component.
* **Ví dụ trong dự án:** Trong [TiepDon.jsx](file:///d:/LuanVan_QuanLyPhongKham/PhongKhamFrontend/src/pages/TiepDon.jsx):
  ```javascript
  const [formData, setFormData] = useState({ sdt: '', hoTen: '' });
  ```
  Khi bạn gõ số điện thoại vào ô nhập liệu, hàm `setFormData` được gọi để cập nhật `formData.sdt`. Trạng thái thay đổi làm ô nhập liệu hiển thị đúng chữ bạn vừa gõ.

#### 3.2. Side Effects (Tác vụ phụ - `useEffect`)
* **Khái niệm:** Dùng để xử lý các tác vụ nằm ngoài luồng render thông thường của React như: tải dữ liệu ban đầu, lắng nghe phím tắt, ghi log...
* **Ví dụ trong dự án:** Lắng nghe phím tắt `F4` để lưu tiếp nhận:
  ```javascript
  useEffect(() => {
    const handleKeyDown = (e) => { if (e.key === 'F4') handleSave(); };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown); // Cleanup
  }, [formData]);
  ```

#### 3.3. Global State (Trạng thái toàn cục - React Context API)
* **Khái niệm:** Khi dự án lớn, việc truyền props từ cha xuống con quá nhiều cấp (gọi là Prop Drilling) sẽ gây rối code. **Context API** ra đời để lưu trữ dữ liệu tập trung ở một nơi, giúp tất cả các component con dù nằm sâu thế nào vẫn lấy trực tiếp được dữ liệu mà không cần qua trung gian.
* **Ví dụ trong dự án:** Bộ thông báo Toast trong [ToastContext.jsx](file:///d:/LuanVan_QuanLyPhongKham/PhongKhamFrontend/src/utils/ToastContext.jsx):
  * Cả hệ thống chỉ có một `ToastProvider` bọc ngoài cùng ở `App.jsx`.
  * Nhờ đó, bất kỳ trang nào (ví dụ trang Khám bệnh, Tiếp đón, Thanh toán) chỉ cần gọi Hook `const { showSuccess } = useToast();` là có thể hiển thị thông báo popup lên màn hình ngay lập tức.

---

## PHẦN II: TÌM HIỂU VỀ CSS LIBRARIES (TAILWIND CSS V3)

Tailwind CSS là một thư viện CSS theo trường phái **Utility-First** (ưu tiên các class tiện ích nhỏ).

### 1. Sự khác biệt giữa CSS truyền thống và Tailwind CSS
* **CSS truyền thống (hoặc CSS inline style cũ):** Bạn phải tự đặt tên class (như `.btn-submit`), sau đó viết các thuộc tính CSS dài dòng ở file `.css` hoặc tạo đối tượng `styles = { submitBtn: { padding: '10px', backgroundColor: 'blue' } }`.
* **Tailwind CSS:** Cung cấp sẵn hàng nghìn class viết tắt tương ứng với từng thuộc tính CSS nhỏ. Bạn chỉ cần ghép các class này trực tiếp vào thuộc tính `className` của thẻ HTML.
  * *Ví dụ:* Muốn làm một khối flexbox, căn giữa, nền trắng, bo góc, bóng đổ:
    * **Tailwind:** `<div className="flex justify-center items-center bg-white rounded-lg shadow">`

---

### 2. Các class Tailwind thông dụng bạn đã dùng trong dự án
Khi thầy cô chỉ vào code hỏi các class này có nghĩa là gì, hãy trả lời tự tin:
* **Layout (Bố cục):**
  * `flex`, `flex-col` (flex direction: column), `justify-between` (căn cách đều hai đầu), `items-center` (căn giữa theo chiều dọc).
  * `grid`, `grid-cols-2` (chia làm 2 cột bằng nhau), `gap-4` (khoảng cách giữa các ô là 16px/1rem).
* **Sizing (Kích thước):**
  * `h-screen` (chiều cao full màn hình thiết bị - 100vh), `w-full` (rộng 100%).
  * `h-9` (cao 36px), `pl-3` (padding-left khoảng 12px).
* **Color & Border (Màu sắc và viền):**
  * `bg-white` (nền trắng), `text-slate-500` (chữ màu xám vừa).
  * `bg-[var(--primary-light)]` (sử dụng màu biến CSS động của dự án).
  * `border`, `border-slate-200` (viền mảnh màu xám nhạt).
* **Effects & Transitions (Hiệu ứng):**
  * `shadow-sm` (bóng đổ nhẹ tạo chiều nổi).
  * `hover:-translate-y-px` (khi di chuột qua sẽ nhấc nhẹ lên 1px tạo cảm giác tương tác sinh động).
  * `transition-all duration-200` (mượt mà hiệu ứng trong 0.2 giây).

---

### 3. Tại sao đồ án của bạn lại dùng Tailwind CSS v3? (Ưu điểm)
1. **Rút gọn code tối đa:** Không cần viết biến `styles` dài dòng ở cuối file JSX nữa, giúp tổng số dòng code của 15 trang giảm đi tới **1.300 dòng**.
2. **Tải trang siêu tốc (Performance):** Tailwind hoạt động theo cơ chế quét mã nguồn thực tế. Công cụ build (Vite) sẽ chỉ nén những class nào bạn thực sự viết trong code vào file CSS cuối cùng, loại bỏ hoàn toàn CSS thừa, giúp file CSS đóng gói cực kỳ nhẹ (chỉ ~44KB).
3. **Phát triển thần tốc:** Bác sĩ hay nhân viên tiếp tiếp nhận cần căn chỉnh lại nút bấm rộng ra một tí, chỉ cần sửa class `px-4` thành `px-6` trực tiếp trên HTML mà không phải nhảy lên nhảy xuống tìm file CSS.
4. **Trải nghiệm nhất quán:** Tailwind định nghĩa sẵn các khoảng cách (spacing) và bảng màu chuẩn giúp giao diện ứng dụng đồng bộ, chuẩn thẩm mỹ hiện đại.
