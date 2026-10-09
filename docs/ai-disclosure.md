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
| **Claude** | Phân tích case study; gợi ý chọn luồng L4; soạn nháp câu phạm vi và User Story | Phiếu phạm vi buổi 2; `docs/srs.md` mục 1–3 | Đối chiếu với Bảng 2.1, Mục 6.1, Mục 7, Bảng 9.1, Bảng 10.1 của case study |
| **Claude** | Soạn nháp SRS 6 mục (FR1–FR9, US1–US7 kèm MoSCoW và tiêu chí Given–When–Then, NFR1–NFR4, quy tắc, bảng truy vết); rà soát và sửa lỗi (tách FR7 thành FR7/FR8, rút còn 7 User Story) | `docs/srs.md` | Đối chiếu với cấu trúc 6 mục, 4 lỗi phát biểu yêu cầu và checklist của buổi 3, buổi 4; các quy tắc tự suy ra (RB-01, RB-02, RB-03) ghi rõ nguồn "suy ra" |
| **Claude** | Vẽ Use Case Diagram (3 actor, 8 use case, 2 quan hệ include); soạn đặc tả UC3, UC6 | `docs/usecase.drawio`, `docs/usecase.puml`, `docs/srs.md` mục 7–8 | Mở file bằng app.diagrams.net và planttext.com để kiểm tra; đối chiếu 7 lỗi vẽ Use Case của buổi 4 |
| **Claude** | Soạn API contract: 6 endpoint, JSON mẫu, mã HTTP, bảng validation | `docs/api-contract.md` | Đối chiếu từng endpoint với FR, US trong `docs/srs.md` và quy tắc QT-07, QT-08, QT-14, QT-15 |
| **Claude** | Vẽ sơ đồ kiến trúc phân lớp; soạn câu lập luận lựa chọn kiến trúc gắn NFR | `docs/architecture.drawio`, `docs/design.md` mục 1 | Mở file bằng app.diagrams.net; đối chiếu nguyên tắc phụ thuộc một chiều của buổi 5 và NFR1–NFR4 |
| **Claude** | Thiết kế ERD 6 bảng, index; viết SQL DDL skeleton | `docs/erd.drawio`, `db/schema.sql`, `docs/design.md` mục 2 | Tự chạy `db/schema.sql` trên PostgreSQL 16 ở máy cá nhân: tạo được 11 bảng và 6 index, không lỗi; soi lại năm lỗi ERD và checklist A4 tài liệu tự học buổi 5 |
| **Claude** | Vẽ wireframe 3 màn hình; lập bảng đối chiếu trường trên màn hình với cột trong ERD | `docs/wireframes.drawio`, `docs/wireframe.png`, `docs/design.md` mục 3 | Mở file bằng app.diagrams.net; đối chiếu từng trường với ERD và luồng ngoại lệ của UC3, UC6 |
| **Claude** | Hướng dẫn cài Node.js, Git, PostgreSQL; mã mẫu smoke test `/health`; dựng cấu trúc repo, `.gitignore`, `.env.example`, README | `src/index.js`, `README.md`, `.gitignore`, `.env.example`, `package.json` | Tự cài và chạy lệnh kiểm tra phiên bản; tự chạy smoke test, `/health` trả về `{"status":"ok"}`; tự chạy `git status` trước khi commit |
| **Claude** | Gộp và định dạng báo cáo PDF; giải thích đáp án quiz buổi 3 | `BT1_2374802010577_TranQuocVuong.pdf`; quiz buổi 3 | Đọc lại toàn bộ báo cáo trước khi nộp; đối chiếu đáp án quiz với tài liệu buổi 3 |
| *--- không dùng ---* | *Các phần tự thực hiện* | Tạo tài khoản và repo GitHub, chạy PlantUML và xuất ảnh, chạy DDL trên máy cá nhân, commit và push | Tự thực hiện trên máy cá nhân |

*Ghi chú:*
- Nếu ở bài nộp này sinh viên **hoàn toàn không sử dụng bất kỳ công cụ AI nào**, hãy ghi rõ `Không sử dụng công cụ AI` vào bảng.

---

### III. CAM KẾT VỀ LIÊM CHÍNH HỌC THUẬT

> **"Tôi xác nhận đã đọc, hiểu và chịu trách nhiệm về toàn bộ nội dung nộp."**

* **Chữ ký / Họ tên sinh viên:** Trần Quốc Vương  
* **Ngày khai báo:** 10/10/2026
