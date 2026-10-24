import { useCallback, useEffect, useState } from 'react';

// Ba trang thai cua moi man hinh co du lieu: loading | empty | error (+ ready).
// loader: ham tra Promise; isEmpty: ham quyet dinh du lieu co coi la rong khong.
export function useAsync(loader, deps, isEmpty = () => false) {
  const [state, setState] = useState({ status: 'loading', data: null, error: null });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let alive = true;
    setState((s) => ({ ...s, status: 'loading', error: null }));
    loader()
      .then((data) => alive && setState({ status: isEmpty(data) ? 'empty' : 'ready', data, error: null }))
      .catch((error) => alive && setState({ status: 'error', data: null, error }));
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { ...state, reload };
}
