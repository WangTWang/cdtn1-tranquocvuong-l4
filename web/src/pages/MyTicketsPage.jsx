// E5 - Ky thuat vien xem cac phieu duoc gan cho minh.
import { api } from '../api/client.js';
import { useAsync } from '../hooks/useAsync.js';
import { Empty, DataState } from '../components/DataState.jsx';
import TicketTable from '../components/TicketTable.jsx';

export default function MyTicketsPage() {
  const state = useAsync(() => api.myTickets(), [], (d) => d.total === 0);
  return (
    <section>
      <h1>Phiếu của tôi</h1>
      <p className="muted">Các phiếu được giao cho bạn, sắp theo hạn cam kết. Số điện thoại khách hiển thị dạng che.</p>
      <DataState state={state} empty={<Empty title="Bạn chưa được giao phiếu nào." hint="Khi quản lý phân công, phiếu sẽ hiện ở đây." />}>
        {(data) => <TicketTable items={data.items} />}
      </DataState>
    </section>
  );
}
