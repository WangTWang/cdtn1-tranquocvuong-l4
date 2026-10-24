// Tiep nhan chon phieu da phan cong de dat lich hen.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { useAsync } from '../hooks/useAsync.js';
import { Empty, DataState } from '../components/DataState.jsx';
import TicketTable from '../components/TicketTable.jsx';
import Pager from '../components/Pager.jsx';

const PAGE_SIZE = 10;

export default function AppointmentListPage() {
  const [page, setPage] = useState(1);
  const state = useAsync(() => api.listTickets({ status: 'DA_PHAN_CONG', page, pageSize: PAGE_SIZE }), [page], (d) => d.total === 0);
  return (
    <section>
      <h1>Chọn phiếu để đặt lịch hẹn</h1>
      <p className="muted">Chỉ phiếu đã có kỹ thuật viên mới đặt được lịch giao – nhận máy. Số điện thoại hiển thị dạng che.</p>
      <DataState state={state} empty={<Empty title="Chưa có phiếu nào đã phân công." hint="Nhờ quản lý trung tâm phân công kỹ thuật viên cho phiếu trước." />}>
        {(data) => (
          <>
            <TicketTable items={data.items} showTechnician action={(t) => <Link className="button" to={`/tickets/${t.ticketId}/appointment`}>Đặt lịch hẹn</Link>} />
            <Pager page={data.page} pageSize={data.pageSize} total={data.total} onChange={setPage} />
          </>
        )}
      </DataState>
    </section>
  );
}
