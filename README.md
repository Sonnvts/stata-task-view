# Stata Kinh Tế Lượng Task View

![Stata Task View](assets/images/ueh-fb-logo.png)

Nền tảng tra cứu tĩnh (Static Site) hướng dẫn thực hành kinh tế lượng bằng Stata. Cung cấp các công cụ so sánh lệnh, xác định gói thư viện thống kê tối ưu và cây quyết định (Decision Tree) giúp người dùng điều hướng hệ sinh thái Stata một cách tự tin.

**[🌐 Truy cập website trực tuyến](https://stata-task-view.netlify.app/)** *(Update lại link thực tế của bạn nếu khác).*

## 📖 Tính năng chính
- **So sánh 16+ lệnh tương đương nhau:** Đưa ra lý do nên dùng lệnh nào: VD `csdid` tốt hơn DID 2 chiều (TWFE), khi nào nên dùng `ivreg2` thay vì `ivregress`.
- **46+ Hướng dẫn thực hành:** Tài liệu tham khảo theo chuyên đề (Dữ liệu bảng, OLS, Machine Learning, Biến phụ thuộc giới hạn...).
- **Tìm kiếm Offline hiệu quả:** Tích hợp `Lunr.js` trên Front-end giúp tìm kiếm các lệnh thống kê nhanh chóng mà không cần Server/Database phụ trợ.
- **Cây quyết định tĩnh (Decision Tree):** Các bộ quy tắc được lập trình bằng JavaScript, dẫn dắt người dùng từ lúc xác định dữ liệu đến lúc xuất kết quả chuyên nghiệp.

## 🛠 Công nghệ chạy dự án

Dự án này là hoàn toàn *Tĩnh (Static site)*, sử dụng các công nghệ thuần (Vanilla) thân thiện, dễ đọc và dễ triển khai.

- **Frontend:** HTML5, CSS3 Variables, JavaScript (ES6+).
- **Styling UI:** [PicoCSS](https://picocss.com/) (Hệ thống CSS cực gọn nhẹ, giao diện Classless siêu tối giản, tương thích Dark Mode).
- **Database/Search Index:** Dữ liệu lệnh được lưu đệm dưới dạng JSON (trong `assets/js/data/`) phục vụ thư viện tìm kiếm tĩnh `Lunr.js`.
- **Hosting/Deployment:** Được cấu hình sẵn cấu trúc tĩnh để deploy siêu tốc bằng **Netlify** qua file `netlify.toml`.

## 🚀 Cài đặt & Khởi chạy (Local Development)

Dự án có thể chạy trực tiếp bằng cách mở các file `.html` trên trình duyệt bằng giao thức `file://` hoặc sử dụng một máy chủ tĩnh local (Live Server).

```bash
# 1. Clone repository
git clone https://github.com/YourUsername/stata-task-view.git

# 2. Truy cập thư mục
cd stata-task-view

# 3. Chạy local server (sử dụng Python/VsCode Live Server/NPX)
# Cách 1: Bằng Python 3
python -m http.server 8000

# Cách 2: NPM / NPX (hoặc extension Live Server trên VS Code)
npx serve .
```
Truy cập `http://localhost:8000` hoặc port tương ứng.

## 🗂️ Cấu trúc thư mục

```
/
├── assets/           # CSS, Scripts và Data JSON hỗ trợ Lunr.js.
├── categories/       # Các bài đăng phân loại theo lĩnh vực (OLS, Panel Data, DID...).
├── commands/         # File động (Template) xử lý URL Parameter để xem lệnh chi tiết.
├── comparisons/      # Các bài viết phân tích "Face-off" giữa 2 Stata Packages.
├── index.html        # Giao diện chính và danh sách gợi ý lộ trình nghiên cứu.
├── decision-tree.html# Cây logic chỉ định hướng đi giải quyết bài toán kinh tế lượng.
├── search.html       # Giao diện kết quả tìm kiếm (Powered by Lunr).
└── netlify.toml      # Config security headers và Cache headers khi đưa lên Netlify.
```

## 🤝 Đóng góp (Contributing)

Vì đây là dự án Web tĩnh phục vụ giáo dục, nếu bạn có kinh nghiệm sử dụng Stata hoặc tìm thấy lệnh hữu ích, bạn hoàn toàn có thể đóng góp. Mọi yêu cầu tạo Pull Request chỉnh sửa nội dung hoặc tối ưu CSS/JS đều được hoan nghênh.

---

*Hệ thống tài liệu gốc từ UEH. Dự án được review và tối ưu mã nguồn bởi Antigravity Agent.*
