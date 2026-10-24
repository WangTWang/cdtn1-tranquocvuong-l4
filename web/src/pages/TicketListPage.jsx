// Wireframe 1 - Danh sach phieu (UC1). QUAN_LY: tab "Cho phan cong" (MOI) va "Da phan cong".
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api/client.js';
import { useAsync } from '../hooks/useAsync.js';
import { Empty, DataState } from '../components/DataState.jsx';
import TicketTable from '../components/TicketTable.jsx';
import Pager from '../components/Pager.jsx';

const PAGE_SIZE = 10;

export default function TicketListPage() {
  const [params, setParams] = useSearchParams();
  const status = params.get('status') === 'DA_PHAN_CONG' ? 'DA_PHAN_CONG' : 'MOI';
  const [page, setPage] = useState(1);
  const state = useAsync(() => api.listTickets({ status, page, pageSize: PAGE_SIZE }), [status, page], (d) => d.total === 0);

  const choose = (s) => { setPage(1); setParams(s === 'MOI' ? {} : { status: s }); };

  return (
    <section>
      <h1>{status === 'MOI' ? 'Phiếu chờ phân công' : 'Phiếu đã phân công'}</h1>
      <div className="tabs">
        <button type="button" className={status === 'MOI' ? 'active' : ''} onClick={() => choose('MOI')}>Chờ phân công</button>
        <button type="button" className={status === 'DA_PHAN_CONG' ? 'active' : ''} onClick={() => choose('DA_PHAN_CONG')}>Đã phân công</button>
      </div>
      <p className="muted">Sắp theo hạn cam kết, phiếu gần hạn nhất ở trên cùng. Chỉ hiện phiếu của trung tâm bạn.</p>
      <DataState
        state={state}
        empty={(
          <Empty
            title={status === 'MOI' ? 'Không có phiếu nào đang chờ phân công.' : 'Chưa có phiếu nào được phân công.'}
            hint={status === 'MOI' ? 'Phiếu mới sẽ xuất hiện ở đây khi nhân viên tiếp nhận tạo xong.' : 'Hãy phân công phiếu ở tab "Chờ phân công".'}
          />
        )}
      >
        {(data) => (
          <>
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
