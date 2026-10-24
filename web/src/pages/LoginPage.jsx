import { useState } from 'react';
import { useAuth } from '../auth.jsx';
import { describeError, fieldErrors } from '../errors.js';

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(username.trim(), password);      // thanh cong: App tu chuyen sang trang chinh cua vai tro
    } catch (err) {
      setError(err);
      setBusy(false);
    }
  }

  const fields = fieldErrors(error);
  const msg = error && error.code !== 'VALIDATION_ERROR' ? describeError(error) : null;
  return (
    <div className="login">
      <h1>Đăng nhập</h1>
      <p className="muted">Smart CRM Mekong Mobile – hệ thống bảo hành</p>
      <form onSubmit={submit} noValidate>
        <label>Tên đăng nhập
          <input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" autoFocus />
          {fields.username && <span className="field-error">{fields.username}</span>}
        </label>
        <label>Mật khẩu
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
          {fields.password && <span className="field-error">{fields.password}</span>}
        </label>
        {msg && (
          <div className="box error" role="alert">
            <p><strong>{msg.what}</strong></p>
            {msg.hint && <p>{msg.hint}</p>}
          </div>
        )}
        <button type="submit" disabled={busy}>{busy ? 'Đang đăng nhập…' : 'Đăng nhập'}</button>
      </form>
    </div>
  );
}
