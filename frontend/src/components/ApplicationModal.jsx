import { useEffect, useRef, useState } from 'react';
import { api } from '../api/client.js';
import { EMPTY_FORM, STATUSES } from '../constants.js';

// Riduce lo screenshot (max 1600px, JPEG) così il caricamento resta leggero.
function imageToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, 1600 / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Immagine non leggibile.'));
    };
    img.src = url;
  });
}

function toForm(application) {
  if (!application) return EMPTY_FORM;
  return {
    company: application.company ?? '',
    role: application.role ?? '',
    url: application.url ?? '',
    status: application.status ?? 'WISHLIST',
    appliedAt: application.appliedAt ?? '',
    notes: application.notes ?? '',
    jobDescription: application.jobDescription ?? '',
  };
}

// Il backend vuole null (non stringa vuota) per i campi opzionali lasciati vuoti.
function toPayload(form) {
  const clean = (value) => (value.trim() === '' ? null : value.trim());
  return {
    company: form.company.trim(),
    role: form.role.trim(),
    url: clean(form.url),
    status: form.status,
    appliedAt: form.appliedAt || null,
    notes: clean(form.notes),
    jobDescription: clean(form.jobDescription),
  };
}

export default function ApplicationModal({ application, onSave, onDelete, onClose }) {
  const dialogRef = useRef(null);
  const [form, setForm] = useState(() => toForm(application));
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState('');
  const [image, setImage] = useState(null); // screenshot come data URL

  const isEdit = Boolean(application);

  // <dialog> nativo: gestisce da solo focus, tasto Esc e sfondo.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog.open) dialog.showModal();
    return () => dialog.close();
  }, []);

  function update(field) {
    return (event) => {
      setForm((current) => ({ ...current, [field]: event.target.value }));
      // l'errore del campo sparisce appena si ricomincia a scrivere
      setFieldErrors((current) => ({ ...current, [field]: undefined }));
    };
  }

  async function attachImage(file) {
    if (!file || !file.type.startsWith('image/')) return;
    setExtractError('');
    try {
      setImage(await imageToDataUrl(file));
    } catch (err) {
      setExtractError(err.message);
    }
  }

  // Ctrl+V di uno screenshot in qualsiasi punto della finestra
  function handlePaste(event) {
    const file = [...event.clipboardData.files].find((f) => f.type.startsWith('image/'));
    if (file) {
      event.preventDefault();
      attachImage(file);
    }
  }

  // Legge il testo dell'annuncio e compila i campi ancora vuoti: non sovrascrive ciò che hai scritto.
  async function fillFromText() {
    setExtractError('');
    setExtracting(true);
    try {
      const { company, role, summary } = await api.extractApplication(form.jobDescription, image);
      setForm((current) => ({
        ...current,
        company: current.company.trim() || company || '',
        role: current.role.trim() || role || '',
        notes: current.notes.trim() || summary || '',
      }));
      setFieldErrors({});
    } catch (err) {
      setExtractError(err.message);
    } finally {
      setExtracting(false);
    }
  }

  async function run(action) {
    setError('');
    setFieldErrors({});
    setBusy(true);
    try {
      await action(); // in caso di successo il genitore chiude la finestra
    } catch (err) {
      setError(err.message);
      setFieldErrors(err.fields ?? {});
      setBusy(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    const local = {};
    if (!form.company.trim()) local.company = "Scrivi il nome dell'azienda.";
    if (!form.role.trim()) local.role = 'Scrivi il ruolo.';
    if (Object.keys(local).length > 0) {
      setFieldErrors(local);
      return;
    }
    run(() => onSave(toPayload(form)));
  }

  return (
    <dialog
      ref={dialogRef}
      className="modal"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onPaste={handlePaste}
      onMouseDown={(event) => {
        // pressione sullo sfondo (fuori dal contenuto) = chiudi
        if (event.target === dialogRef.current) onClose();
      }}
    >
      <form className="modal__body" onSubmit={handleSubmit} noValidate>
        <h2 className="modal__title">{isEdit ? 'Modifica candidatura' : 'Nuova candidatura'}</h2>

        <div className="modal__grid">
          <label className="field">
            <span className="field__label">Azienda</span>
            <input className="field__input" value={form.company} onChange={update('company')} autoFocus />
            {fieldErrors.company && <span className="field__error">{fieldErrors.company}</span>}
          </label>

          <label className="field">
            <span className="field__label">Ruolo</span>
            <input className="field__input" value={form.role} onChange={update('role')} />
            {fieldErrors.role && <span className="field__error">{fieldErrors.role}</span>}
          </label>

          <label className="field">
            <span className="field__label">Fase</span>
            <select className="field__input" value={form.status} onChange={update('status')}>
              {STATUSES.map((status) => (
                <option key={status.id} value={status.id}>
                  {status.label}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span className="field__label">Data di invio</span>
            <input className="field__input" type="date" value={form.appliedAt} onChange={update('appliedAt')} />
          </label>
        </div>

        <label className="field">
          <span className="field__label">Link all'annuncio</span>
          <input
            className="field__input"
            type="url"
            placeholder="https://"
            value={form.url}
            onChange={update('url')}
          />
          {isEdit && application.url && (
            <a className="field__hint link" href={application.url} target="_blank" rel="noreferrer">
              Apri l'annuncio
            </a>
          )}
        </label>

        <label className="field">
          <span className="field__label">Note</span>
          <textarea className="field__input" rows={3} value={form.notes} onChange={update('notes')} />
        </label>

        <label className="field">
          <span className="field__label">Testo dell'annuncio</span>
          <textarea
            className="field__input"
            rows={5}
            value={form.jobDescription}
            onChange={update('jobDescription')}
          />
          <span className="field__hint">
            Incolla qui l'annuncio, oppure carica uno screenshot (anche con Ctrl+V), poi premi il
            pulsante: azienda, ruolo e riassunto si compilano da soli.
          </span>
          {image ? (
            <span className="shot">
              <img className="shot__img" src={image} alt="Screenshot dell'annuncio" />
              <button className="link" type="button" onClick={() => setImage(null)}>
                Rimuovi screenshot
              </button>
            </span>
          ) : (
            <input
              className="field__input"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              aria-label="Carica uno screenshot dell'annuncio"
              onChange={(event) => {
                attachImage(event.target.files[0]);
                event.target.value = '';
              }}
            />
          )}
          <button
            className="btn btn--ai"
            type="button"
            onClick={fillFromText}
            disabled={extracting || busy || (form.jobDescription.trim() === '' && !image)}
          >
            {extracting ? "Leggo l'annuncio…" : "Compila dall'annuncio"}
          </button>
          {extractError && <span className="field__error">{extractError}</span>}
        </label>

        {isEdit && application.aiAnalysis && (
          <div className="modal__analysis">
            <h3 className="field__label">Analisi AI</h3>
            <p>{application.aiAnalysis}</p>
          </div>
        )}

        {error && (
          <p className="alert" role="alert">
            {error}
          </p>
        )}

        <footer className="modal__actions">
          {isEdit &&
            (confirmDelete ? (
              <span className="modal__confirm">
                Eliminarla davvero?
                <button className="btn btn--danger" type="button" disabled={busy} onClick={() => run(onDelete)}>
                  Elimina
                </button>
                <button className="btn" type="button" disabled={busy} onClick={() => setConfirmDelete(false)}>
                  No
                </button>
              </span>
            ) : (
              <button className="btn btn--quiet-danger" type="button" onClick={() => setConfirmDelete(true)}>
                Elimina
              </button>
            ))}
          <span className="modal__spacer" />
          <button className="btn" type="button" onClick={onClose} disabled={busy}>
            Annulla
          </button>
          <button className="btn btn--primary" type="submit" disabled={busy}>
            {busy ? 'Salvo…' : isEdit ? 'Salva modifiche' : 'Aggiungi'}
          </button>
        </footer>
      </form>
    </dialog>
  );
}
