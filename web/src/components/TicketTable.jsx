import { CATEGORY_LABEL, PRIORITY_LABEL, STATUS_LABEL, formatDateTime, label } from '../format.js';

// Bang phieu dung chung cho cac man hinh. `action` ve nut thao tac ngay tren dong (nguyen tac 4 buoi 9).
export default function TicketTable({ items, action, showTechnician = false }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Mã phiếu</th><th>Khách hàng</th><th>Số điện thoại</th><th>Thiết bị</th><th>Nhóm sự cố</th>
          <th>Ưu tiên</th><th>Hạn cam kết</th><th>Trạng thái</th>
          {showTechnician && <th>Kỹ thuật viên</th>}
          {action && <th />}
        </tr>
      </thead>
      <tbody>
        {items.map((t) => (
          <tr key={t.ticketId} className={t.isOverdue ? 'overdue' : ''}>
            <td>{t.ticketCode}</td>
            <td>{t.customerName}</td>
            <td>{t.customerPhone}</td>
            <td>{t.deviceName}</td>
            <td>{t.category ? label(CATEGORY_LABEL, t.category) : <em className="warn">Chưa phân loại</em>}</td>
            <td>{label(PRIORITY_LABEL, t.priority)}</td>
            <td>{formatDateTime(t.dueDate)}{t.isOverdue && <span className="tag">Quá hạn</span>}</td>
            <td>{label(STATUS_LABEL, t.status)}</td>
            {showTechnician && <td>{t.technician ? t.technician.fullName : '—'}</td>}
            {action && <td>{action(t)}</td>}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
