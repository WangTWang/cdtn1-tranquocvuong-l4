# Dữ liệu mẫu Mekong Mobile

- `mau/customers_raw.csv` – 402 bản ghi khách hàng thô, chép nguyên từ repo mẫu của giảng viên (`mekong-da-pipeline/data/mau/customers_raw.csv`). Dữ liệu có lỗi cố ý: số điện thoại dạng `+84…`, `84…`, có khoảng trắng hoặc dấu chấm, bỏ trống; họ tên thừa khoảng trắng, viết thường; khách trùng số.
- Luồng L4 không tạo khách hàng (thuộc luồng L2) nên chỉ cần khách đã sạch để gắn vào phiếu. `scripts/gen-seed-mekong.js` chuẩn hóa (QT-02), loại trùng rồi sinh `db/seeds/003_mekong_mau.sql` theo quy mô case study: 6 trung tâm, 38 kỹ thuật viên, khoảng 150 phiếu.
- Sinh lại (chỉ khi sửa file CSV hoặc bộ sinh): `npm run db:gen-seed`. Bộ sinh dùng hạt giống cố định nên chạy lại cho ra cùng một file.
