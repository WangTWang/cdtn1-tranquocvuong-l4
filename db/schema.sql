-- =====================================================================
-- schema.sql · PostgreSQL 16 · DDL skeleton
-- He thong Smart CRM - Mekong Mobile
-- Luong L4: Phan cong ky thuat vien va lich hen
-- Sinh vien: Tran Quoc Vuong - 2374802010577 - Track SE
--
-- Cach chay:  psql -U postgres -d phan_cong_ktv -f db/schema.sql
-- Ma QT-xx, RB-xx, FRx, NFRx trong ghi chu la ma trong docs/srs.md.
-- =====================================================================

-- ---------------------------------------------------------------------
-- PHAN 1. BANG PHU TRO DUNG CHUNG (muc toi thieu cho luong L4)
-- customer, device va viec tao ticket thuoc luong L2; L4 chi doc.
-- ---------------------------------------------------------------------

CREATE TABLE service_center (
    center_id    BIGSERIAL     PRIMARY KEY,
    center_name  VARCHAR(120)  NOT NULL UNIQUE
);

CREATE TABLE issue_category (
    category_id    SERIAL       PRIMARY KEY,
    -- MAN_HINH, PIN, SAC, PHAN_MEM, NUOC_VAO, KHAC
    category_name  VARCHAR(60)  NOT NULL UNIQUE
);

CREATE TABLE employee (
    employee_id  BIGSERIAL     PRIMARY KEY,
    full_name    VARCHAR(120)  NOT NULL,
    role         VARCHAR(20)   NOT NULL
                   CHECK (role IN ('QUAN_LY', 'KY_THUAT_VIEN', 'TIEP_NHAN')),
    center_id    BIGINT        NOT NULL REFERENCES service_center(center_id)   -- QT-14
);

CREATE TABLE customer (
    customer_id  BIGSERIAL     PRIMARY KEY,
    full_name    VARCHAR(120)  NOT NULL,
    phone        VARCHAR(20)   NOT NULL UNIQUE      -- hien thi dang che theo QT-15
);

CREATE TABLE device (
    device_id    BIGSERIAL     PRIMARY KEY,
    customer_id  BIGINT        NOT NULL REFERENCES customer(customer_id),
    serial_no    VARCHAR(50)   NOT NULL UNIQUE,
    model_name   VARCHAR(120)  NOT NULL
);

-- ---------------------------------------------------------------------
-- PHAN 2. SAU BANG COT LOI CUA LUONG L4
-- ---------------------------------------------------------------------

-- Ky thuat vien: phuc vu FR2 (goi y), FR3, FR5
CREATE TABLE technician (
    technician_id  BIGSERIAL    PRIMARY KEY,
    employee_id    BIGINT       NOT NULL UNIQUE REFERENCES employee(employee_id),
    -- QT-08: cung trung tam
    center_id      BIGINT       NOT NULL REFERENCES service_center(center_id),
    level          VARCHAR(10)  NOT NULL
                     CHECK (level IN ('SO_CAP', 'TRUNG_CAP', 'CAO_CAP')),
    is_active      BOOLEAN      NOT NULL DEFAULT true
);

-- Tay nghe cua ky thuat vien theo nhom su co: phuc vu FR2, QT-08
CREATE TABLE technician_skill (
    technician_id  BIGINT    NOT NULL REFERENCES technician(technician_id),
    category_id    INT       NOT NULL REFERENCES issue_category(category_id),
    proficiency    SMALLINT  NOT NULL CHECK (proficiency BETWEEN 1 AND 5),
    PRIMARY KEY (technician_id, category_id)
);

-- Phieu bao hanh: phuc vu FR1, FR3, FR4, FR6 (chi giu cac cot luong L4 can)
CREATE TABLE ticket (
    ticket_id      BIGSERIAL    PRIMARY KEY,
    ticket_code    VARCHAR(20)  NOT NULL UNIQUE,              -- dang BH-000123/2026
    customer_id    BIGINT       NOT NULL REFERENCES customer(customer_id),
    device_id      BIGINT       NOT NULL REFERENCES device(device_id),
    center_id      BIGINT       NOT NULL REFERENCES service_center(center_id),   -- QT-14
    -- NULL = chua phan loai
    category_id    INT          REFERENCES issue_category(category_id),
    -- NULL = chua phan cong (QT-07)
    technician_id  BIGINT       REFERENCES technician(technician_id),
    priority       VARCHAR(12)  NOT NULL
                     CHECK (priority IN ('CAO', 'TRUNG_BINH', 'THAP')),
    status         VARCHAR(20)  NOT NULL DEFAULT 'MOI'
                     CHECK (status IN ('MOI', 'DA_PHAN_CONG', 'DANG_XU_LY', 'CHO_LINH_KIEN',
                                       -- QT-06, Hinh 6.2
                                       'HOAN_TAT', 'DA_DONG', 'DA_HUY')),
    received_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
    -- han cam ket, sinh theo QT-04
    due_date       TIMESTAMPTZ  NOT NULL,
    -- RB-01: phieu MOI chua co ky thuat vien; phieu da phan cong / dang xu ly phai co
    CONSTRAINT chk_ticket_status_technician CHECK (
        (status = 'MOI' AND technician_id IS NULL)
        OR (status IN ('DA_PHAN_CONG', 'DANG_XU_LY') AND technician_id IS NOT NULL)
        OR status NOT IN ('MOI', 'DA_PHAN_CONG', 'DANG_XU_LY')
    ),
    CONSTRAINT chk_ticket_due_after_received CHECK (due_date >= received_at)
);

-- Lich su chuyen trang thai phieu: QT-06 (moi lan chuyen deu ghi lai)
CREATE TABLE ticket_status_log (
    log_id       BIGSERIAL     PRIMARY KEY,
    ticket_id    BIGINT        NOT NULL REFERENCES ticket(ticket_id),
    from_status  VARCHAR(20),                                -- NULL o lan ghi dau tien
    to_status    VARCHAR(20)   NOT NULL,
    changed_at   TIMESTAMPTZ   NOT NULL DEFAULT now(),
    changed_by   BIGINT        NOT NULL REFERENCES employee(employee_id),
    note         VARCHAR(255),
    CONSTRAINT chk_status_log_changed CHECK (from_status IS NULL OR from_status <> to_status)
);

-- Lich su phan cong va doi ky thuat vien: FR3, FR5, QT-07
CREATE TABLE ticket_assignment_log (
    assignment_id       BIGSERIAL     PRIMARY KEY,
    ticket_id           BIGINT        NOT NULL REFERENCES ticket(ticket_id),
    -- NULL = lan phan cong dau
    from_technician_id  BIGINT        REFERENCES technician(technician_id),
    to_technician_id    BIGINT        NOT NULL REFERENCES technician(technician_id),
    reason              VARCHAR(255),
    changed_by          BIGINT        NOT NULL REFERENCES employee(employee_id),
    changed_at          TIMESTAMPTZ   NOT NULL DEFAULT now(),
    -- QT-07: doi ky thuat vien phai ghi ly do (toi thieu 5 ky tu)
    CONSTRAINT chk_assignment_reason CHECK (
        from_technician_id IS NULL
        OR (reason IS NOT NULL AND length(trim(reason)) >= 5)
    ),
    CONSTRAINT chk_assignment_different CHECK (
        from_technician_id IS NULL OR from_technician_id <> to_technician_id
    )
);

-- Lich hen giao - nhan may: FR7, FR8, FR10
CREATE TABLE appointment (
    appointment_id  BIGSERIAL     PRIMARY KEY,
    ticket_id       BIGINT        NOT NULL REFERENCES ticket(ticket_id),
    technician_id   BIGINT        NOT NULL REFERENCES technician(technician_id),
    type            VARCHAR(5)    NOT NULL CHECK (type IN ('GIAO', 'NHAN')),
    start_at        TIMESTAMPTZ   NOT NULL,
    end_at          TIMESTAMPTZ   NOT NULL,
    note            VARCHAR(255),
    created_by      BIGINT        NOT NULL REFERENCES employee(employee_id),
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),
    -- QT-13: khong xoa vat ly, chi danh dau huy
    cancelled_at    TIMESTAMPTZ,
    CONSTRAINT chk_appointment_end_after_start CHECK (end_at > start_at)      -- RB-03
    -- RB-02 (khong trung lich cung ky thuat vien) duoc kiem o AppointmentService
    -- trong cung transaction voi lenh INSERT; index idx_appt_tech_start ho tro truy van nay.
);

-- ---------------------------------------------------------------------
-- PHAN 3. INDEX - moi index phuc vu mot truy van cu the
-- ---------------------------------------------------------------------

-- FR1 + NFR1: danh sach phieu MOI cua mot trung tam, sap theo han cam ket
-- (duoi 2 giay voi 10.000 phieu)
CREATE INDEX idx_ticket_center_status_due ON ticket (center_id, status, due_date);

-- FR6: phieu duoc gan cua mot ky thuat vien theo han cam ket; FR2: dem so phieu dang giu
CREATE INDEX idx_ticket_tech_status_due ON ticket (technician_id, status, due_date);

-- FR2 + QT-08: loc ky thuat vien co tay nghe >= 3 voi mot nhom su co
CREATE INDEX idx_skill_category_prof ON technician_skill (category_id, proficiency);

-- FR8: kiem tra trung lich cua mot ky thuat vien; FR10: lich hen cua toi theo ngay
CREATE INDEX idx_appt_tech_start ON appointment (technician_id, start_at);

-- QT-06: xem lich su trang thai cua mot phieu
CREATE INDEX idx_status_log_ticket ON ticket_status_log (ticket_id, changed_at);

-- FR5 + QT-07: truy vet cac lan doi ky thuat vien cua mot phieu
CREATE INDEX idx_assign_log_ticket ON ticket_assignment_log (ticket_id, changed_at);
