// Wireframe 2 - Phan cong ky thuat vien cho phieu (UC3 kem UC2), va doi ky thuat vien (UC4).
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import { useAsync } from '../hooks/useAsync.js';
import { Empty, ErrorBox, Loading, DataState } from '../components/DataState.jsx';
import { CATEGORY_LABEL, LEVEL_LABEL, PRIORITY_LABEL, STATUS_LABEL, formatDateTime, label } from '../format.js';
import { fieldErrors } from '../errors.js';

export default function AssignPage() {
  const ticketId = Number(useParams().ticketId);
  const ticket = useAsync(() => api.getTicket(ticketId), [ticketId]);
  const [done, setDone] = useState(null);

  return (
    <section>
      <p><Link to="/tickets">‹ Về danh sách phiếu</Link></p>
      <h1>Phân công kỹ thuật viên</h1>
      <DataState state={ticket}>
        {(t) => (
          <>
            <TicketInfo t={t} />
            {done
              ? <Success done={done} />
              : <Chooser ticket={t} onDone={setDone} />}
          </>
        )}
      </DataState>
    </section>
  );
}

function TicketInfo({ t }) {
  return (
    <div className="box info">
      <p><strong>{t.ticketCode}</strong> · {label(STATUS_LABEL, t.status)}{t.isOverdue && <span className="tag">Quá hạn</span>}</p>
      <p>Khách hàng: {t.customerName} · {t.customerPhone} · Thiết bị: {t.deviceName}</p>
      <p>
        Nhóm sự cố: {t.category ? label(CATEGORY_LABEL, t.category) : <em className="warn">Chưa phân loại</em>} ·
        Ưu tiên: {label(PRIORITY_LABEL, t.priority)} · Hạn cam kết: {formatDateTime(t.dueDate)}
      </p>
      {t.technician && <p>Kỹ thuật viên hiện tại: <strong>{t.technician.fullName}</strong></p>}
    </div>
  );
}

function Success({ done }) {
  return (
    <div className="box success" role="status">
      <p><strong>{done.message}</strong></p>
      <p><Link className="button" to="/tickets">Về danh sách phiếu</Link></p>
    </div>
  );
}

function Chooser({ ticket, onDone }) {
  const reassign = ticket.status === 'DA_PHAN_CONG';
  const canChoose = ticket.status === 'MOI' || reassign;
  const sug = useAsync(
    () => (canChoose ? api.getSuggestions(ticket.ticketId) : Promise.resolve({ suggestions: [] })),
    [ticket.ticketId, canChoose],
    (d) => d.suggestions.length === 0,
  );
  const [selected, setSelected] = useState(null);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  if (!canChoose) {
    return <Empty title="Phiếu này không còn phân công được." hint={`Trạng thái hiện tại: ${label(STATUS_LABEL, ticket.status)}.`} />;
  }

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      if (reassign) {
        const r = await api.reassign(ticket.ticketId, selected, reason.trim());
        onDone({ message: `Đã đổi từ ${r.previousTechnician.fullName} sang ${r.technician.fullName}. Lý do đã được ghi lại.` });
      } else {
        const r = await api.assign(ticket.ticketId, selected);
        onDone({ message: `Đã phân công phiếu ${r.ticketCode} cho ${r.technician.fullName}.` });
      }
    } catch (err) {
      setError(err);
      setBusy(false);
    }
  }

  const fields = fieldErrors(error);
  return (
    <>
      <h2>{reassign ? 'Chọn kỹ thuật viên mới' : 'Kỹ thuật viên gợi ý'}</h2>
      <p className="muted">Chỉ hiện kỹ thuật viên cùng trung tâm, đang làm việc, tay nghề từ 3 trở lên với nhóm sự cố. Ít phiếu đang giữ xếp trước.</p>
      <DataState
        state={sug}
        empty={<Empty title="Không có kỹ thuật viên phù hợp tại trung tâm." hint="Quản lý có thể bổ sung kỹ năng cho kỹ thuật viên rồi quay lại." />}
      >
        {(data) => (
          <table>
            <thead><tr><th /><th>Kỹ thuật viên</th><th>Bậc</th><th>Tay nghề với nhóm {label(CATEGORY_LABEL, data.category)}</th><th>Số phiếu đang giữ</th></tr></thead>
            <tbody>
              {data.suggestions.map((s) => (
                <tr key={s.technicianId} className={selected === s.technicianId ? 'selected' : ''}>
                  <td><input type="radio" name="tech" aria-label={`Chọn ${s.fullName}`} checked={selected === s.technicianId} onChange={() => setSelected(s.technicianId)} /></td>
                  <td>{s.fullName}</td>
                  <td>{label(LEVEL_LABEL, s.level)}</td>
                  <td>{s.proficiency}/5</td>
                  <td>{s.openTicketCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </DataState>

      {reassign && (
        <label className="block">Lý do đổi kỹ thuật viên (bắt buộc, ít nhất 5 ký tự)
          <input value={reason} onChange={(e) => setReason(e.target.value)} maxLength={255} />
          {fields.reason && <span className="field-error">{fields.reason}</span>}
        </label>
      )}

      {error && <ErrorBox error={error} />}
      <button type="button" disabled={busy || selected === null || (reassign && reason.trim().length < 5)} onClick={submit}>
        {busy ? 'Đang lưu…' : reassign ? 'Đổi kỹ thuật viên' : 'Phân công'}
      </button>
    </>
  );
}
