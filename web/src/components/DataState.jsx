import { describeError } from '../errors.js';

// DataState: boc moi man hinh co du lieu, hien du 3 trang thai (buoi 9, muc 2):
//   dang tai (khung xuong giu bo cuc) · rong (cau giai thich + goi y) · loi (chuyen gi + lam gi tiep + nut Thu lai).
export function Loading({ rows = 4 }) {
  return (
    <div className="skeleton" aria-busy="true" aria-label="Đang tải dữ liệu">
      {Array.from({ length: rows }, (_, i) => <div key={i} className="skeleton-row" />)}
      <p className="muted">Đang tải dữ liệu…</p>
    </div>
  );
}

export function Empty({ title, hint, children }) {
  return (
    <div className="box empty">
      <p><strong>{title}</strong></p>
      {hint && <p className="muted">{hint}</p>}
      {children}
    </div>
  );
}

export function ErrorBox({ error, onRetry }) {
  const { what, why, hint } = describeError(error);
  return (
    <div className="box error" role="alert">
      <p><strong>{what}</strong> {why}</p>
      {hint && <p>{hint}</p>}
      {onRetry && <button type="button" onClick={onRetry}>Thử lại</button>}
    </div>
  );
}

// Cach dung: <DataState state={useAsync(...)} empty={<Empty .../>}>{(data) => ...}</DataState>
export function DataState({ state, empty, children }) {
  if (state.status === 'loading') return <Loading />;
  if (state.status === 'error') return <ErrorBox error={state.error} onRetry={state.reload} />;
  if (state.status === 'empty') return empty;
  return children(state.data);
}
