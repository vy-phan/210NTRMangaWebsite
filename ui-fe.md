# Web đọc truyện: Logic và UI (bản gọn, không code)

Dùng cho dự án React + TypeScript + Tailwind. Bố cục lấy cảm hứng từ các web đọc truyện kiểu SuicaoDex (menu: Thư viện, Lịch sử đọc, Tìm kiếm nâng cao, Mới cập nhật, Truyện mới, Thể loại, Truyện ngẫu nhiên). Màu sắc và chi tiết dưới đây là thiết kế riêng, không sao chép từ trang gốc.

---

## 1. Hướng thiết kế

- **Người dùng:** độc giả Việt, đa số đọc trên điện thoại.
- **Việc chính:** tìm truyện nhanh và đọc tiếp đúng chỗ đang dở.
- **Bìa truyện là nhân vật chính.** Giao diện xung quanh yên tĩnh, bìa không đổ bóng, chỉ hiện viền màu nhấn khi hover hoặc focus.
- **Một điểm nhấn duy nhất:** dải "Đọc tiếp" ở đầu trang chủ, bìa có thanh tiến độ đọc. Các phần còn lại giữ gọn.
- **Không đổ bóng chung cho mọi thẻ.** Phân tầng bằng viền mảnh và màu nền.
- **Chuyển động chỉ để phản hồi thao tác** (mở ngăn kéo, ẩn/hiện thanh công cụ trình đọc). Không hiệu ứng trượt-mờ cho từng section. Tôn trọng `prefers-reduced-motion`.
- **Mobile trước:** vùng chạm tối thiểu 44px, chừa vùng an toàn (tai thỏ, thanh home), dùng `dvh` thay `vh`.

## 2. Màu, chữ, bo góc

| Tên | Sáng | Tối | Dùng cho |
|---|---|---|---|
| bg | `#F7F7FB` | `#0E1018` | nền trang |
| surface | `#FFFFFF` | `#161926` | thẻ, ngăn kéo, header |
| surface-2 | `#EEF0F7` | `#1F2334` | ô nhập, chip, skeleton |
| line | `#DFE2EE` | `#2A2F44` | viền mảnh |
| ink | `#14172B` | `#ECEEF8` | chữ chính |
| ink-muted | `#646A84` | `#949AB2` | chữ phụ, thời gian, nhãn |
| accent | `#E8466C` | `#FF5E82` | nút chính, đang chọn, tiến độ đọc |
| rind | `#249668` | `#3EC48F` | hoàn thành, chương mới |
| danger | `#D63E3E` | `#FF6B6B` | loại trừ, xóa |

- **Chữ:** Be Vietnam Pro cho nội dung và giao diện; Bricolage Grotesque cho tiêu đề lớn. Viết câu bình thường, không viết hoa toàn bộ nhãn.
- **Bo góc có thứ bậc:** bìa 10px, nút và ô nhập 12px, ngăn kéo 20px, chip bo tròn hoàn toàn.
- **Trình đọc luôn nền tối** (`#0B0C10`) dù app đang ở theme sáng, để ảnh truyện không bị chói.
- **Theme:** Sáng, Tối, Theo hệ thống. Lưu lựa chọn và áp dụng trước khi trang vẽ để không bị nháy.

## 3. Responsive

**Điểm ngắt chính: 1024px.**

| | Dưới 1024px (mobile, tablet) | Từ 1024px (desktop) |
|---|---|---|
| Điều hướng | Header gọn (logo, tìm kiếm, theme) và thanh 5 tab dưới đáy: Trang chủ, Tìm kiếm, Thư viện, Lịch sử, Cài đặt | Header đầy đủ: logo, 5 mục menu, ô tìm kiếm (Ctrl K), Thư viện, Lịch sử, theme. Không có thanh dưới |
| Bộ lọc tìm kiếm | Ngăn kéo trượt từ dưới lên | Cột cố định bên trái |
| Trang chủ | 1 cột | 2 cột: danh sách cập nhật bên trái, thể loại nhanh và truyện mới bên phải |
| Hộp thoại | Bottom sheet | Hộp giữa màn hình, rộng tối đa 560px |

**Lưới thẻ truyện:** tự chia cột theo bề rộng tối thiểu của thẻ (không cố định số cột). Bề rộng tối thiểu: 104px (mobile), 124px (từ 640px), 148px (từ 1024px), 164px (từ 1536px). Mobile thường ra 3 cột.

**Header:** dính trên cùng, nền hơi trong suốt và mờ. Cao 56px (mobile), 64px (desktop). Nội dung trang cuối cùng phải chừa chỗ cho thanh dưới.

## 4. Các trang

### Trang chủ
Thứ tự từ trên xuống:
1. **Đọc tiếp:** dải cuộn ngang các truyện trong lịch sử (tối đa 14). Mỗi thẻ gồm bìa có thanh tiến độ ở đáy, tên truyện một dòng, "Chương X, trang a/b". Bấm vào mở thẳng chương và trang đang đọc. **Chưa có lịch sử thì ẩn cả dải.**
2. **Mới cập nhật:** danh sách dòng. Mỗi dòng gồm bìa nhỏ bên trái, tên truyện, 3 chương mới nhất (mỗi chương một dòng bấm được, kèm thời gian tương đối bên phải). Có nút "Xem tất cả".
3. **Thể loại:** các chip, bấm vào ra kết quả lọc theo thể loại đó.
4. **Truyện mới:** 6 bìa, có nút "Xem tất cả".

Đang tải thì hiện skeleton đúng kích thước của dòng hoặc thẻ.

### Mới cập nhật, Truyện mới
Danh sách cuộn vô hạn: khi cuộn gần chạm cuối (còn khoảng 600px) thì tải trang tiếp theo. Dùng `UpdateRow` cho Mới cập nhật và lưới bìa cho Truyện mới. Hết dữ liệu thì dừng, không hiện nút.

### Thể loại
Toàn bộ thể loại dưới dạng chip lớn, nhóm theo nhóm nếu dữ liệu có. Bấm một chip đi tới trang tìm kiếm đã lọc sẵn thể loại đó.

### Tìm kiếm nâng cao
- Ô nhập tên truyện, chọn sắp xếp (Mới cập nhật, Mới đăng, Theo dõi nhiều, Đánh giá cao, Tên A-Z).
- **Thể loại 3 trạng thái:** chạm lần 1 = phải có, chạm lần 2 = loại trừ (chip đỏ, gạch ngang), chạm lần 3 = bỏ chọn.
- Tình trạng: Đang tiến hành, Hoàn thành, Tạm ngưng, Đã hủy (chọn nhiều).
- Nút "Xóa bộ lọc".
- **Toàn bộ bộ lọc nằm trên URL** để chia sẻ được và bấm Back không mất.
- Nhập tên truyện có chờ khoảng 300ms sau khi ngừng gõ mới gọi tìm.
- Khi đổi bộ lọc, giữ kết quả cũ trên màn hình cho tới khi có kết quả mới (đỡ nháy).
- Mobile: nút "Bộ lọc" kèm số lượng bộ lọc đang bật. Rỗng: "Không có truyện nào khớp. Thử bỏ bớt bộ lọc."

### Chi tiết truyện
- **Đầu trang:** bìa, tên (font tiêu đề), tác giả, năm, tình trạng, chip thể loại, mô tả thu gọn (có "Xem thêm"). Nền là bìa làm mờ rất nhẹ.
- **Nút chính:**
  - Nếu có lịch sử: "Đọc tiếp Chương X" (vào đúng trang đã lưu).
  - Chưa có: "Đọc từ đầu" (chương có số nhỏ nhất).
  - Kèm nút "Theo dõi" (bật/tắt).
- **Mobile:** khi cuộn qua khỏi nút chính, hiện một thanh dính phía trên thanh tab dưới chứa nút "Đọc tiếp".
- **Danh sách chương:**
  - Tiêu đề kèm tổng số chương.
  - Ô lọc theo số chương, nút đổi thứ tự (Mới trước, Cũ trước).
  - Mỗi dòng cao tối thiểu 48px: "Chương X" và tiêu đề phụ, nhóm dịch (ẩn trên mobile), thời gian tương đối.
  - **Chương đã đọc hiển thị mờ hơn.**
  - Truyện trên khoảng 300 chương mà cuộn giật thì chỉ vẽ các dòng đang nhìn thấy.

### Thư viện
- Lấy từ danh sách theo dõi. Có thanh chip lọc theo trạng thái: Đang đọc, Sẽ đọc, Đã đọc xong, Bỏ dở.
- Hiển thị bằng lưới bìa.
- Rỗng: "Chưa theo dõi truyện nào. Bấm Theo dõi ở trang truyện để lưu vào đây." kèm nút tới Tìm kiếm.

### Lịch sử đọc
- Gom theo ngày: Hôm nay, Hôm qua, Cũ hơn.
- Mỗi dòng: bìa nhỏ, tên truyện, "Chương X, trang a/b", nút "Tiếp tục", nút xóa từng mục.
- Nút "Xóa toàn bộ lịch sử" phải có bước xác nhận.

### Truyện ngẫu nhiên
Gọi lấy một truyện ngẫu nhiên rồi chuyển hướng sang trang truyện, thay thế mục lịch sử trình duyệt (bấm Back không quay lại trang trống). Trong lúc chờ hiện "Đang chọn một truyện cho bạn…".

### Cài đặt
Giao diện (Sáng, Tối, Theo hệ thống), mặc định của trình đọc, nút "Xóa dữ liệu trên máy" (lịch sử và thư viện, có xác nhận).

## 5. Trình đọc

Trang riêng, toàn màn hình, **không có header và thanh tab dưới của app.**

### Hai chế độ
- **Cuộn dọc (mặc định, hợp webtoon):** các trang xếp thành một cột liền nhau, căn giữa, độ rộng tối đa chỉnh được (mặc định 860px).
- **Lật trang:** mỗi lần một trang. Có thêm chiều đọc (trái sang phải hoặc phải sang trái) và cách vừa khung (vừa rộng, vừa cao, kích thước gốc).

### Thanh công cụ
- **Thanh trên:** nút quay về trang truyện, tên truyện, số chương, nút cài đặt.
- **Thanh dưới:** thanh tiến độ mảnh, nút "Chương trước", "trang hiện tại / tổng số trang", nút "Chương sau". Nút bị vô hiệu khi không có chương đó.
- **Cuộn dọc:** thanh tự ẩn khi cuộn xuống, hiện lại khi cuộn lên. Chạm vào ảnh để bật/tắt thủ công.
- **Lật trang:** chạm vùng giữa để bật/tắt.

### Điều khiển lật trang
- **Chạm màn hình chia 3 vùng:** 30% trái, 40% giữa, 30% phải.
  - Vùng giữa: bật/tắt thanh công cụ.
  - Vùng phải: trang kế. Vùng trái: trang trước.
  - Đọc phải sang trái thì **đảo ngược** hai vùng bên.
- **Vuốt ngang** trên 50px (và ngang nhiều hơn dọc) để chuyển trang, cũng đảo theo chiều đọc. Sau khi vuốt thì bỏ qua cú "click" đi kèm để không nhảy hai trang.
- **Bàn phím:** mũi tên trái/phải đổi nghĩa theo chiều đọc; Space hoặc PageDown tiến, PageUp lùi; `[` và `]` chương trước/sau; `M` ẩn/hiện thanh công cụ. Không bắt phím khi đang gõ trong ô nhập.
- Lật hết trang cuối thì sang màn hình "Hết chương". Lùi ở trang đầu thì sang chương trước, tiến ở màn hình hết chương thì sang chương sau.

### Tải ảnh
- **Cuộn dọc:** 3 ảnh đầu tải ngay, các ảnh còn lại tải lười. Mỗi trang giữ chỗ theo tỉ lệ ảnh (nếu API cho biết kích thước) để trang không nhảy khi ảnh về; ảnh tải xong thì bỏ khung giữ chỗ.
- **Lật trang:** tải trước N trang kế tiếp (mặc định 3).

### Theo dõi trang đang đọc
- **Cuộn dọc:** trang đang đọc là trang nằm ở giữa màn hình (dải quan sát hẹp ở giữa, chọn trang chiếm nhiều nhất).
- **Lật trang:** trang hiện tại chính là vị trí đang hiển thị.

### Lưu tiến độ
- Sau **600ms** không đổi trang thì lưu vào lịch sử: truyện, chương, số trang, tổng số trang.
- Khi tới **2 trang cuối** thì đánh dấu chương là đã đọc.
- Màn hình "Hết chương" tính là trang cuối, không được lưu số trang vượt tổng.
- **Khôi phục:** mở lại chương đang dở thì tự cuộn hoặc nhảy tới trang đã lưu. Chỉ làm một lần khi vào chương.
- Đổi chương thì **reset toàn bộ trạng thái trình đọc** (trang, thanh công cụ) và lấy trang đã lưu của chương mới nếu có.

### Cuối chương
Thẻ ở giữa: "Hết chương X", nút "Chương tiếp theo" (nổi bật), nút "Về trang truyện". Nếu là chương mới nhất: "Đây là chương mới nhất."

### Cài đặt trình đọc (ngăn kéo)
- Kiểu đọc: Cuộn dọc, Lật trang.
- Khi lật trang: Chiều đọc, Vừa khung.
- Khi cuộn dọc: Độ rộng tối đa (480 đến 1200px), Khoảng cách giữa các trang (0 đến 40px).
- Lưu lại cho lần sau.

### Lỗi và tải
- Đang tải chương: khối skeleton giữa màn hình.
- Lỗi: "Không tải được chương này. Kiểm tra mạng rồi thử lại." kèm nút "Tải lại".

## 6. Dữ liệu lưu trên máy (localStorage)

Dùng một kho dùng chung (ví dụ Zustand có lưu trữ) để mọi component cập nhật ngay trong cùng tab.

**Lịch sử đọc**
- Mỗi truyện chỉ có **một mục**, mục mới nhất đứng đầu. Đọc lại truyện cũ thì đẩy mục đó lên đầu, không tạo bản trùng.
- Lưu: id truyện, tên, bìa, id chương, nhãn chương, trang hiện tại, tổng trang, thời điểm.
- Giới hạn khoảng 300 mục, cũ nhất bị bỏ.
- Có thêm danh sách **chương đã đọc theo từng truyện** để làm mờ trong danh sách chương.
- Xóa một truyện thì xóa cả mục lịch sử lẫn danh sách chương đã đọc của truyện đó.

**Thư viện**
- Bấm "Theo dõi" bật/tắt. Mặc định trạng thái "Đang đọc", đổi được sang Sẽ đọc, Đã đọc xong, Bỏ dở.
- Lưu kèm id, tên, bìa của truyện để hiện được ngay không cần gọi API.

**Cài đặt**
- Theme, và các thiết lập trình đọc (kiểu đọc, chiều đọc, vừa khung, khoảng cách, độ rộng tối đa, số trang tải trước).

Đặt tên khóa có số phiên bản (ví dụ `...:v1`) để sau này đổi cấu trúc dữ liệu không làm hỏng dữ liệu cũ.

## 7. Lấy dữ liệu

- Tách lớp lấy dữ liệu thành một giao diện chung (danh sách mới cập nhật, truyện mới, tìm kiếm, chi tiết truyện, danh sách chương, trang của chương, thể loại, ngẫu nhiên). Đổi nguồn dữ liệu không ảnh hưởng giao diện.
- Danh sách phân trang theo con trỏ (cursor), trả về dữ liệu và con trỏ kế tiếp (null khi hết).
- Dữ liệu trang của chương trả kèm: thông tin chương, thông tin truyện, danh sách ảnh (có kích thước nếu có), id chương trước, id chương sau. Nhờ vậy trình đọc không cần gọi thêm để biết chương kế.
- Bộ nhớ đệm: danh sách giữ "còn mới" khoảng 1 phút; trang của chương khoảng 10 phút; thể loại giữ lâu.
- Nếu nguồn chặn CORS, gọi qua một proxy phía máy chủ của bạn, không gọi thẳng từ trình duyệt.

## 8. Nội dung chữ trong giao diện (tiếng Việt)

- Nút nói rõ việc sẽ xảy ra: "Đọc tiếp Chương 12", "Theo dõi", "Xóa bộ lọc", "Tải lại". Không dùng "Gửi" hay "OK" chung chung.
- Một hành động giữ một tên xuyên suốt (nút "Theo dõi" thì thông báo cũng là "Đã theo dõi").
- Lỗi nói rõ chuyện gì xảy ra và cách xử lý, không xin lỗi dài dòng.
- Trạng thái rỗng là lời mời làm việc tiếp theo, có nút đi tới.
- Thời gian tương đối: vừa xong, X phút trước, X giờ trước, X ngày trước, X tháng trước, X năm trước.
- Đường dẫn truyện có tên không dấu: bỏ dấu, đổi "đ" thành "d", chữ thường, nối bằng gạch ngang (ví dụ `/manga/123/thieu-nien-hoi-ay`). Id vẫn là phần quyết định, tên chỉ để đọc cho đẹp.

## 9. Tiếp cận và hiệu năng

**Tiếp cận**
- Nút chỉ có biểu tượng đều có nhãn đọc được (`aria-label`).
- Vòng focus luôn nhìn thấy khi dùng bàn phím.
- Ngăn kéo: đóng bằng Esc, khóa cuộn nền khi mở, có vai trò hộp thoại. Nếu cần chặt hơn thì dùng thư viện dialog có sẵn bẫy focus.
- Tương phản chữ phụ trên nền thẻ tối thiểu 4.5:1 ở cả hai theme.
- Hiệu ứng hover chỉ áp dụng trên thiết bị có chuột, trên cảm ứng không để trạng thái "dính" sau khi chạm.
- Tắt hoặc rút ngắn chuyển động khi người dùng bật giảm chuyển động.

**Hiệu năng**
- Ảnh bìa luôn có tỉ lệ cố định 2:3 để không giật bố cục; tải lười trừ vài ảnh đầu.
- Dùng ảnh nhỏ cho thẻ, ảnh lớn cho trang chi tiết nếu CDN hỗ trợ nhiều kích thước.
- Tách mã theo trang, đặc biệt trình đọc, để trang chủ tải nhanh.
- Danh sách dài thì chỉ vẽ phần đang thấy.

**Kiểm tra ở các độ rộng:** 360, 390, 768, 1024, 1280, 1536px; xoay ngang điện thoại ở trình đọc; thanh địa chỉ co giãn trên iOS Safari.

## 10. Thứ tự làm đề xuất

1. Nền: theme, header, thanh tab dưới, khung trang.
2. Thẻ truyện, dòng cập nhật, trang chủ (chưa cần Đọc tiếp).
3. Kho lưu trên máy (lịch sử, thư viện, cài đặt).
4. Trang chi tiết truyện và danh sách chương.
5. Trình đọc cuộn dọc, rồi lật trang, rồi cài đặt trình đọc. Gắn lưu tiến độ và khôi phục.
6. Dải "Đọc tiếp" trên trang chủ.
7. Tìm kiếm nâng cao và lọc trên URL, rồi Thể loại.
8. Thư viện, Lịch sử, Ngẫu nhiên, Cài đặt.
9. Trạng thái rỗng, lỗi, skeleton; kiểm tra tiếp cận và các độ rộng màn hình.

**Làm sau:** đăng nhập và đồng bộ giữa các thiết bị, bình luận, thông báo chương mới, chế độ đọc hai trang trên màn hình rộng, đọc offline (PWA), gợi ý theo lịch sử đọc.