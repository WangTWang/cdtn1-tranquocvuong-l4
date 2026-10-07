# BẢNG KHAI BÁO SỬ DỤNG CÔNG CỤ AI HỖ TRỢ
**Học phần:** Chuyên đề Tốt nghiệp 1 (Specialized Graduation Topic I)  
**Học kỳ:** HK1, Năm học 2026 – 2027  
**Bài nộp:** [x] Bài tập 1 (BT1)   [ ] Bài tập 2 (BT2)   [ ] Bài tập 3 (BT3)  
**Phạm vi khai báo:** BT1 – đủ 5 thành phần (SRS rút gọn; Use Case Diagram và đặc tả use case; sơ đồ kiến trúc; mô hình dữ liệu; wireframe) và mẫu đặc tả track SE (API contract)

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
| **Claude** | Soạn nháp SRS rút gọn 6 mục: phạm vi và WON'T, vai trò, FR1–FR10, US1–US8 kèm MoSCoW và tiêu chí chấp nhận, NFR1–NFR4, quy tắc nghiệp vụ, bảng truy vết | `srs.md` – mục 1 đến 6 | Đối chiếu với cấu trúc 6 mục và checklist chấm BT1 của tài liệu buổi 3; các quy tắc tự suy ra (RB-01, RB-02, RB-03, vai trò Nhân viên tiếp nhận) được ghi rõ nguồn "suy ra" trong bài |
| **Claude** | Viết mã PlantUML cho Use Case Diagram (3 actor, 9 use case, 2 quan hệ include) và sinh ảnh PNG | `docs/usecase.puml`, `docs/usecase-diagram.png`; `srs.md` – mục 7 | Tự chạy mã trên planttext.com với bản 7 use case, kiểm tra sơ đồ hiển thị đủ actor, use case, quan hệ include và chữ tiếng Việt; bản 9 use case đã xem lại ảnh trên GitHub |
| **Claude** | Soạn nháp đặc tả UC3 (Phân công kỹ thuật viên) và UC6 (Đặt lịch hẹn) gồm luồng chính và luồng ngoại lệ | `srs.md` – mục 8 | Đối chiếu với mẫu đặc tả UC2 trong tài liệu buổi 3 (điều kiện trước/sau, cách đánh số ngoại lệ 3a) |
| **Claude** | Rà soát `srs.md` theo 4 lỗi thường gặp và 7 tiêu chí SRS tốt của buổi 3 | `srs.md` – dòng FR7, bảng truy vết, đường dẫn ảnh, mục "Liên quan" của UC6 | Phát hiện và sửa 4 chỗ: tách FR7 thành FR7 và FR8 (lỗi hai yêu cầu trong một câu), cập nhật bảng truy vết, sửa đường dẫn ảnh sơ đồ, bổ sung FR8 vào UC6 |
| **Claude** | Bổ sung US7, US8 (FR9, FR10, UC8, UC9), viết tiêu chí chấp nhận Given–When–Then cho US1, điền cột Test case của bảng truy vết | `docs/srs.md` – mục 3, 6, 7 | Đối chiếu với checklist 10 mục của buổi 4 (≥ 8 story, mỗi story MUST ≥ 2 tiêu chí, có tiêu chí ngoại lệ, bảng truy vết không ô trống) |
| **Claude** | Tạo file sơ đồ Use Case dạng draw.io kèm chú thích và đặc tả UC3 | `docs/usecase.drawio` | Mở file bằng app.diagrams.net để kiểm tra hiển thị; đối chiếu 7 lỗi thường gặp khi vẽ Use Case Diagram của buổi 4 |
| **Claude** | Soạn API contract: 6 endpoint, request/response JSON mẫu, mã trạng thái HTTP, bảng validation, bảng truy vết endpoint về User Story | `docs/api-contract.md` | Đối chiếu từng endpoint với FR, US trong `docs/srs.md` và quy tắc QT-07, QT-08, QT-14, QT-15 của case study |
| **Claude** | Vẽ sơ đồ kiến trúc phân lớp và soạn 5 câu lập luận lựa chọn kiến trúc gắn với NFR | `docs/architecture.drawio`, `docs/design.md` – mục 1 | Mở file bằng app.diagrams.net để kiểm tra; đối chiếu 4 lớp và nguyên tắc phụ thuộc một chiều với slide buổi 5; đối chiếu từng câu lập luận với NFR1–NFR4 trong `docs/srs.md` |
| **Claude** | Thiết kế ERD 6 bảng, bảng index, giải thích chuẩn hóa và viết SQL DDL skeleton | `docs/erd.drawio`, `db/schema.sql`, `docs/design.md` – mục 2 | Tự chạy `db/schema.sql` trên PostgreSQL 16 ở máy cá nhân, tạo được 11 bảng và 6 index không lỗi; soi lại năm lỗi ERD và checklist A4 của tài liệu tự học buổi 5 |
| **Claude** | Vẽ wireframe 3 màn hình và lập bảng đối chiếu trường trên màn hình với cột trong ERD | `docs/wireframes.drawio`, `docs/design.md` – mục 3 | Mở file bằng app.diagrams.net; đối chiếu từng trường với ERD và với luồng ngoại lệ của UC3, UC6 |
| **Claude** | Lập bảng rà soát 11 mục kiểm chứng và bảng đối chiếu thuật ngữ; gộp tài liệu thành file nộp | `docs/design.md` – mục 4; file PDF nộp BT1 | Đọc lại toàn bộ file PDF trước khi nộp |
| **Claude** | Giải thích đáp án quiz buổi 3 | Quiz Buổi 3 trên Elearning | Đối chiếu từng đáp án với tài liệu buổi 3 (IEEE 830 → ISO/IEC/IEEE 29148, bảng truy vết, MoSCoW, include/extend) |
| **Claude** | Hướng dẫn cài môi trường, cung cấp mã mẫu endpoint `/health`; dựng cấu trúc thư mục repo và soạn `.gitignore`, `.env.example`, `README.md` khung, `package.json` | `src/index.js`, `.gitignore`, `.env.example`, `README.md`, `package.json` | Tự cài Node.js, Git, PostgreSQL và chạy lệnh kiểm tra phiên bản; tự chạy smoke test, mở `/health` trả về `{"status":"ok"}`; tự chạy `git status` kiểm tra không có `node_modules/` trước khi commit |
| *--- không dùng ---* | *Các phần tự thực hiện* | Tạo repo GitHub, chạy PlantUML và xuất ảnh, commit và push | Tự thực hiện trên máy cá nhân |

*Ghi chú:*
- Nếu ở bài nộp này sinh viên **hoàn toàn không sử dụng bất kỳ công cụ AI nào**, hãy ghi rõ `Không sử dụng công cụ AI` vào bảng.

---

### III. CAM KẾT VỀ LIÊM CHÍNH HỌC THUẬT

> **"Tôi xác nhận đã đọc, hiểu và chịu trách nhiệm về toàn bộ nội dung nộp."**

* **Chữ ký / Họ tên sinh viên:** Trần Quốc Vương  
* **Ngày khai báo:** 07/10/2026
