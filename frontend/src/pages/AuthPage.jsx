import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { STATUSES } from '../constants.js';

export default function AuthPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const isRegister = mode === 'register';

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setFieldErrors({});
    setLoading(true);
    try {
      await (isRegister ? register(email, password) : login(email, password));
    } catch (err) {
      setError(err.message);
      setFieldErrors(err.fields ?? {});
      setLoading(false);
    }
  }

  function switchMode() {
    setMode(isRegister ? 'login' : 'register');
    setError('');
    setFieldErrors({});
  }

  return (
    <main className="auth">
      <section className="auth__intro">
        <p className="brand">JobTrack</p>
        <h1 className="auth__title">Ogni candidatura al suo posto, dall'annuncio all'offerta.</h1>
        <ol className="auth__stages" aria-label="Le fasi di una candidatura">
          {STATUSES.map((status) => (
            <li key={status.id} className="auth__stage" data-status={status.id}>
              {status.label}
            </li>
          ))}
        </ol>
      </section>

      <section className="auth__panel">
        <h2 className="auth__heading">{isRegister ? 'Crea il tuo account' : 'Accedi'}</h2>

        <form onSubmit={handleSubmit} noValidate>
          <label className="field">
            <span className="field__label">Email</span>
            <input
              className="field__input"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {fieldErrors.email && <span className="field__error">{fieldErrors.email}</span>}
          </label>

          <label className="field">
            <span className="field__label">Password</span>
            <input
              className="field__input"
              type="password"
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {isRegister && !fieldErrors.password && (
              <span className="field__hint">Almeno 8 caratteri.</span>
            )}
            {fieldErrors.password && <span className="field__error">{fieldErrors.password}</span>}
          </label>

          {error && (
            <p className="alert" role="alert">
              {error}
            </p>
          )}

          <button className="btn btn--primary btn--block" type="submit" disabled={loading}>
            {loading ? 'Attendi…' : isRegister ? 'Crea account' : 'Accedi'}
          </button>
        </form>

        <p className="auth__switch">
          {isRegister ? 'Hai già un account?' : 'Non hai un account?'}{' '}
          <button className="link" type="button" onClick={switchMode}>
            {isRegister ? 'Accedi' : 'Crea account'}
          </button>
        </p>
      </section>
    </main>
  );
}
