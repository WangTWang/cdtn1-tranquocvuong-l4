// Wireframe 3 - Dat lich hen giao - nhan may (UC6 kem UC7: kiem tra trung lich).
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import { useAsync } from '../hooks/useAsync.js';
import { Empty, ErrorBox, DataState } from '../components/DataState.jsx';
import { STATUS_LABEL, TYPE_LABEL, formatDateTime, isoToLocalInput, label, localInputToIso } from '../format.js';
import { fieldErrors } from '../errors.js';

export default function AppointmentPage() {
  const ticketId = Number(useParams().ticketId);
  const ticket = useAsync(() => api.getTicket(ticketId), [ticketId]);
  const list = useAsync(() => api.listAppointments(ticketId), [ticketId], (d) => d.length === 0);

  return (
    <section>
      <p><Link to="/appointments">‹ Về danh sách phiếu</Link></p>
      <h1>Đặt lịch hẹn giao – nhận máy</h1>
      <DataState state={ticket}>
        {(t) => (
          <>
            <div className="box info">
              <p><strong>{t.ticketCode}</strong> · {label(STATUS_LABEL, t.status)}</p>
              <p>Khách hàng: {t.customerName} · {t.customerPhone}</p>
              <p>Kỹ thuật viên phụ trách: <strong>{t.technician ? t.technician.fullName : 'chưa phân công'}</strong></p>
            </div>
            {t.technician
              ? <Form ticketId={ticketId} onSaved={list.reload} />
              : <Empty title="Phiếu chưa có kỹ thuật viên." hint="Cần quản lý phân công trước khi đặt lịch hẹn." />}
          </>
        )}
      </DataState>

      <h2>Lịch hẹn đã có của phiếu</h2>
      <DataState state={list} empty={<Empty title="Phiếu này chưa có lịch hẹn nào." />}>
        {(items) => (
          <table>
            <thead><tr><th>Loại</th><th>Bắt đầu</th><th>Kết thúc</th><th>Ghi chú</th><th>Trạng thái</th><th /></tr></thead>
            <tbody>
              {items.map((a) => (
                <tr key={a.appointmentId} className={a.cancelledAt ? 'cancelled' : ''}>
                  <td>{label(TYPE_LABEL, a.type)}</td><td>{formatDateTime(a.startAt)}</td><td>{formatDateTime(a.endAt)}</td>
                  <td>{a.note || '—'}</td><td>{a.cancelledAt ? 'Đã hủy' : 'Còn hiệu lực'}</td>
                  <td>{!a.cancelledAt && <CancelButton id={a.appointmentId} onDone={list.reload} />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </DataState>
    </section>
  );
}

// Huy lich: loi (mat ket noi, het phien...) phai HIEN RA cho nguoi dung, khong nuot di (BUG-004).
function CancelButton({ id, onDone }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  async function cancel() {
    setBusy(true);
    setError(null);
    try {
      await api.cancelAppointment(id);
      onDone();
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <button type="button" disabled={busy} onClick={cancel}>{busy ? 'Đang hủy…' : 'Hủy lịch'}</button>
      {error && <ErrorBox error={error} />}
    </>
  );
}

function Form({ ticketId, onSaved }) {
  const [type, setType] = useState('GIAO');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setSaved(null);
    try {
      const a = await api.createAppointment(ticketId, {
        type,
        startAt: start ? localInputToIso(start) : '',
        endAt: end ? localInputToIso(end) : '',
        note: note.trim() || null,
      });
      setSaved(a);
      onSaved();
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }

  // UC6 luong 3a: bi trung lich -> goi y gio trong gan nhat, giu nguyen do dai khung gio.
  const conflict = error && error.code === 'APPOINTMENT_CONFLICT' ? error.details[0] : null;
  function useNextFree() {
    const duration = new Date(`${end}:00+07:00`) - new Date(`${start}:00+07:00`);
    const nextIso = conflict.nextFreeSlotStartAt;
    const nextEnd = new Date(new Date(nextIso).getTime() + duration + 7 * 3600 * 1000).toISOString().slice(0, 16);
    setStart(isoToLocalInput(nextIso));
    setEnd(nextEnd);
    setError(null);
  }

  const fields = fieldErrors(error);
  return (
    <form onSubmit={submit} className="box" noValidate>
      <h2>Thông tin lịch hẹn</h2>
      <label>Loại lịch hẹn
        <select value={type} onChange={(e) => setType(e.target.value)}>
          {Object.entries(TYPE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </label>
      <label>Bắt đầu (giờ Việt Nam)
        <input type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} />
        {fields.startAt && <span className="field-error">{fields.startAt}</span>}
      </label>
      <label>Kết thúc (cùng ngày, sau giờ bắt đầu)
        <input type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} />
        {fields.endAt && <span className="field-error">{fields.endAt}</span>}
      </label>
      <label>Ghi chú (không bắt buộc)
        <input value={note} maxLength={255} onChange={(e) => setNote(e.target.value)} />
      </label>

      {error && <ErrorBox error={error} />}
      {conflict && (
        <p>Giờ trống gần nhất: <strong>{formatDateTime(conflict.nextFreeSlotStartAt)}</strong>{' '}
          <button type="button" onClick={useNextFree}>Dùng giờ này</button></p>
      )}
      {saved && (
        <div className="box success" role="status">
          <strong>Đã lưu lịch hẹn</strong> {label(TYPE_LABEL, saved.type)}: {formatDateTime(saved.startAt)} – {formatDateTime(saved.endAt)}.
        </div>
      )}
      <button type="submit" disabled={busy}>{busy ? 'Đang lưu…' : 'Lưu lịch hẹn'}</button>
    </form>
  );
}
