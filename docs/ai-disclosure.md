# BẢNG KHAI BÁO SỬ DỤNG CÔNG CỤ AI HỖ TRỢ
**Học phần:** Chuyên đề Tốt nghiệp 1 (Specialized Graduation Topic I)  
**Học kỳ:** HK1, Năm học 2026 – 2027  
**Bài nộp:** [x] Bài tập 1 (BT1)   [ ] Bài tập 2 (BT2)   [ ] Bài tập 3 (BT3)  
**Phạm vi khai báo:** BT1 – Thành phần 1 (SRS rút gọn) và Thành phần 2 (Use Case Diagram, đặc tả use case)

---

### I. THÔNG TIN SINH VIÊN
* **Họ và tên:** Trần Quốc Vương
* **Mã số sinh viên:** 2374802010577
* **Chuyên ngành (Track):** [x] SE   [ ] DA   [ ] AI
* **Luồng nghiệp vụ đã chọn:** L4 – Phân công kỹ thuật viên và lịch hẹn

---

### II. BẢNG KHAI BÁO CHI TIẾT

| Công cụ AI | Dùng vào việc gì | Áp dụng ở phần nào (File / Mục) | Đã kiểm chứng & Chỉnh sửa thế nào |
| :--- | :--- | :--- | :--- |
| **Claude** | Phân tích case study (actor, luồng, dữ liệu, quy tắc, trạng thái), gợi ý chọn luồng L4 và soạn nháp câu phạm vi, User Story | Phiếu phạm vi buổi 2; nền cho mục 1–3 của `srs.md` | Đối chiếu với Bảng 2.1, Mục 6.1, Mục 7, Bảng 9.1, Hình 6.2 và Bảng 10.1 của case study |
| **Claude** | Soạn nháp SRS rút gọn 6 mục: phạm vi và WON'T, vai trò, FR1–FR8, US1–US6 kèm MoSCoW và tiêu chí chấp nhận, NFR1–NFR4, quy tắc nghiệp vụ, bảng truy vết | `srs.md` – mục 1 đến 6 | Đối chiếu với cấu trúc 6 mục và checklist chấm BT1 của tài liệu buổi 3; các quy tắc tự suy ra (RB-01, RB-02, RB-03, vai trò Nhân viên tiếp nhận) được ghi rõ nguồn "suy ra" trong bài |
| **Claude** | Viết mã PlantUML cho Use Case Diagram (3 actor, 7 use case, 2 quan hệ include) | `docs/usecase.puml`, `docs/usecase-diagram.png`; `srs.md` – mục 7 | Tự chạy mã trên planttext.com, kiểm tra sơ đồ hiển thị đủ 3 actor, 7 use case, 2 quan hệ include và chữ tiếng Việt; tự xuất ảnh PNG |
| **Claude** | Soạn nháp đặc tả UC3 (Phân công kỹ thuật viên) và UC6 (Đặt lịch hẹn) gồm luồng chính và luồng ngoại lệ | `srs.md` – mục 8 | Đối chiếu với mẫu đặc tả UC2 trong tài liệu buổi 3 (điều kiện trước/sau, cách đánh số ngoại lệ 3a) |
| **Claude** | Rà soát `srs.md` theo 4 lỗi thường gặp và 7 tiêu chí SRS tốt của buổi 3 | `srs.md` – dòng FR7, bảng truy vết, đường dẫn ảnh, mục "Liên quan" của UC6 | Phát hiện và sửa 4 chỗ: tách FR7 thành FR7 và FR8 (lỗi hai yêu cầu trong một câu), cập nhật bảng truy vết, sửa đường dẫn ảnh sơ đồ, bổ sung FR8 vào UC6 |
| **Claude** | Giải thích đáp án quiz buổi 3 | Quiz Buổi 3 trên Elearning | Đối chiếu từng đáp án với tài liệu buổi 3 (IEEE 830 → ISO/IEC/IEEE 29148, bảng truy vết, MoSCoW, include/extend) |
| **Claude** | Hướng dẫn cài môi trường, cung cấp mã mẫu endpoint `/health`; dựng cấu trúc thư mục repo và soạn `.gitignore`, `.env.example`, `README.md` khung, `package.json` | `src/index.js`, `.gitignore`, `.env.example`, `README.md`, `package.json` | Tự cài Node.js, Git, PostgreSQL và chạy lệnh kiểm tra phiên bản; tự chạy smoke test, mở `/health` trả về `{"status":"ok"}`; tự chạy `git status` kiểm tra không có `node_modules/` trước khi commit |
| *--- không dùng ---* | *Các phần tự thực hiện* | Tạo repo GitHub, chạy PlantUML và xuất ảnh, commit và push | Tự thực hiện trên máy cá nhân |

*Ghi chú:*
- Nếu ở bài nộp này sinh viên **hoàn toàn không sử dụng bất kỳ công cụ AI nào**, hãy ghi rõ `Không sử dụng công cụ AI` vào bảng.

---

### III. CAM KẾT VỀ LIÊM CHÍNH HỌC THUẬT

> **"Tôi xác nhận đã đọc, hiểu và chịu trách nhiệm về toàn bộ nội dung nộp."**

* **Chữ ký / Họ tên sinh viên:** Trần Quốc Vương  
* **Ngày khai báo:** 03/10/2026
