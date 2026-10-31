// Wireframe 1 - Danh sach phieu (UC1). QUAN_LY: tab "Cho phan cong" (MOI) va "Da phan cong", co bo loc.
// Trang thai rong phan biet hai truong hop (de bai BT2): CHUA CO phieu nao va BO LOC khong ra ket qua.
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api/client.js';
import { useAsync } from '../hooks/useAsync.js';
import { Empty, DataState } from '../components/DataState.jsx';
import TicketTable from '../components/TicketTable.jsx';
import Pager from '../components/Pager.jsx';
import { PRIORITY_LABEL } from '../format.js';

const PAGE_SIZE = 10;

export default function TicketListPage() {
  const [params, setParams] = useSearchParams();
  const status = params.get('status') === 'DA_PHAN_CONG' ? 'DA_PHAN_CONG' : 'MOI';
  const q = params.get('q') || '';
  const priority = params.get('priority') || '';
  const [page, setPage] = useState(1);
  const [qInput, setQInput] = useState(q);
  const [pInput, setPInput] = useState(priority);
  const state = useAsync(() => api.listTickets({ status, page, pageSize: PAGE_SIZE, q, priority }),
    [status, page, q, priority], (d) => d.total === 0);

  const go = (next) => {
    setPage(1);
    const p = { ...(next.status === 'DA_PHAN_CONG' ? { status: 'DA_PHAN_CONG' } : {}), ...(next.q ? { q: next.q } : {}), ...(next.priority ? { priority: next.priority } : {}) };
    setParams(p);
  };
  const filtering = Boolean(q || priority);
  const clearFilter = () => { setQInput(''); setPInput(''); go({ status }); };
  const label = status === 'MOI' ? 'chờ phân công' : 'đã phân công';

  // Rong: totalAll = 0 -> chua co phieu nao; totalAll > 0 -> co phieu nhung bo loc loai het.
  const emptyView = state.data && state.data.totalAll > 0 ? (
    <Empty
      title={`Không có phiếu ${label} nào khớp bộ lọc${q ? ` "${q}"` : ''}${priority ? ` · ưu tiên ${PRIORITY_LABEL[priority]}` : ''}.`}
      hint={`Trung tâm vẫn có ${state.data.totalAll} phiếu ${label}. Thử từ khóa khác hoặc xóa bộ lọc.`}
    >
      <button type="button" onClick={clearFilter}>Xóa bộ lọc</button>
    </Empty>
  ) : (
    <Empty
      title={status === 'MOI' ? 'Chưa có phiếu nào chờ phân công.' : 'Chưa có phiếu nào được phân công.'}
      hint={status === 'MOI' ? 'Phiếu mới sẽ xuất hiện ở đây khi nhân viên tiếp nhận tạo xong.' : 'Hãy phân công phiếu ở tab "Chờ phân công".'}
    />
  );

  return (
    <section>
      <h1>{status === 'MOI' ? 'Phiếu chờ phân công' : 'Phiếu đã phân công'}</h1>
      <div className="tabs">
        <button type="button" className={status === 'MOI' ? 'active' : ''} onClick={() => go({ status: 'MOI', q, priority })}>Chờ phân công</button>
        <button type="button" className={status === 'DA_PHAN_CONG' ? 'active' : ''} onClick={() => go({ status: 'DA_PHAN_CONG', q, priority })}>Đã phân công</button>
      </div>
      <form className="filter" onSubmit={(e) => { e.preventDefault(); go({ status, q: qInput.trim(), priority: pInput }); }}>
        <input aria-label="Tìm theo mã phiếu hoặc tên khách" placeholder="Mã phiếu hoặc tên khách (không cần dấu)" value={qInput} maxLength={50} onChange={(e) => setQInput(e.target.value)} />
        <select aria-label="Mức ưu tiên" value={pInput} onChange={(e) => setPInput(e.target.value)}>
          <option value="">Mọi mức ưu tiên</option>
          {Object.entries(PRIORITY_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <button type="submit">Lọc</button>
        {filtering && <button type="button" className="secondary" onClick={clearFilter}>Xóa bộ lọc</button>}
      </form>
      <p className="muted">Sắp theo hạn cam kết, phiếu gần hạn nhất ở trên cùng. Chỉ hiện phiếu của trung tâm bạn.</p>
      <DataState state={state} empty={emptyView}>
        {(data) => (
          <>
            <p className="summary">
              <strong>{data.total}</strong> phiếu {label}{filtering ? ` khớp bộ lọc (trên tổng ${data.totalAll})` : ''}
              {' · '}<strong className={data.overdue > 0 ? 'warn' : ''}>{data.overdue}</strong> phiếu đã quá hạn cam kết
              {data.total > 0 && ` (${Math.round((data.overdue / data.total) * 100)}%)`}
            </p>
            <TicketTable
              items={data.items}
              showTechnician={status === 'DA_PHAN_CONG'}
              action={(t) => (
                <Link className="button" to={`/tickets/${t.ticketId}/assign`}>
                  {status === 'MOI' ? 'Phân công' : 'Đổi kỹ thuật viên'}
                </Link>
              )}
            />
            <Pager page={data.page} pageSize={data.pageSize} total={data.total} onChange={setPage} />
          </>
        )}
      </DataState>
    </section>
  );
}
