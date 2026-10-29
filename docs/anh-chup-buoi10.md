# Ảnh chụp chạy toàn luồng – buổi 10

Chạy ngày 24/10/2026 trên máy cá nhân (Windows, Chrome), `npm start` ở cổng 3000, dữ liệu mẫu Mekong Mobile (`npm run db:reset`). Luồng chính: quản lý đăng nhập → danh sách phiếu chờ phân công → gợi ý kỹ thuật viên → phân công → nhân viên tiếp nhận chọn phiếu → đặt lịch hẹn → kiểm tra trùng lịch.

| # | Màn hình | Ảnh | Kiểm chứng |
|---|---|---|---|
| 1 | Đăng nhập | [buoi10-1-dang-nhap.png](img/buoi10-1-dang-nhap.png) | E0 – đăng nhập bằng tài khoản nhân viên (TD-09) |
| 2 | Danh sách phiếu chờ phân công (Wireframe 1), tài khoản `tram` | [buoi10-2-danh-sach-phieu.png](img/buoi10-2-danh-sach-phieu.png) | E1 – sắp theo hạn cam kết, đánh dấu quá hạn, phiếu chưa phân loại; quản lý thấy số điện thoại đầy đủ |
| 3 | Gợi ý kỹ thuật viên cho phiếu BH-000118/2026 (Wireframe 2) | [buoi10-3-goi-y-ky-thuat-vien.png](img/buoi10-3-goi-y-ky-thuat-vien.png) | E2 – chỉ kỹ thuật viên tay nghề ≥ 3 với nhóm Pin, ít phiếu đang giữ xếp trước (QT-08) |
| 4 | Phân công thành công | [buoi10-4-phan-cong-thanh-cong.png](img/buoi10-4-phan-cong-thanh-cong.png) | E3 – phân công phiếu BH-000118/2026 cho Bùi Hữu Tài |
| 5 | Nhân viên tiếp nhận chọn phiếu đã phân công, tài khoản `lan` | [buoi10-5-tiep-nhan-chon-phieu.png](img/buoi10-5-tiep-nhan-chon-phieu.png) | E1 – số điện thoại dạng che `091****678` (QT-15); BH-000118 đã có kỹ thuật viên Bùi Hữu Tài |
| 6 | Form đặt lịch hẹn (Wireframe 3), phiếu chưa có lịch | [buoi10-6-form-dat-lich.png](img/buoi10-6-form-dat-lich.png) | Trạng thái RỖNG của `DataState`: "Phiếu này chưa có lịch hẹn nào." |
| 7 | Đặt lịch trùng giờ | [buoi10-7-trung-lich.png](img/buoi10-7-trung-lich.png) | E6 – lịch 10:00–10:30 lưu thành công; lịch 10:15–10:45 bị từ chối (RB-02), gợi ý giờ trống 10:30 kèm nút "Dùng giờ này" |

**Lỗi phát hiện khi chụp ảnh 4:** khung thông tin phiếu vẫn ghi "Mới" sau khi phân công xong vì trang không tải lại phiếu. Đã sửa ở `web/src/pages/AssignPage.jsx` (commit `fix(web)`): sau khi lưu, trang tải lại phiếu nên hiện đúng "Đã phân công" và kỹ thuật viên mới.
