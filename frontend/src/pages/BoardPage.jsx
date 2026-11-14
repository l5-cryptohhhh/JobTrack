import { useEffect, useMemo, useState } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { STATUSES } from '../constants.js';
import Column from '../components/Column.jsx';
import ApplicationModal from '../components/ApplicationModal.jsx';

function matches(application, query) {
  if (!query) return true;
  const text = `${application.company} ${application.role}`.toLowerCase();
  return text.includes(query);
}

export default function BoardPage() {
  const { user, logout } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  // null = chiuso, { application: null } = nuova, { application } = modifica
  const [modal, setModal] = useState(null);

  const query = search.trim().toLowerCase();

  useEffect(() => {
    let cancelled = false;
    api
      .listApplications()
      .then((data) => !cancelled && setApplications(data))
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const columns = useMemo(() => {
    const grouped = Object.fromEntries(STATUSES.map((s) => [s.id, []]));
    for (const application of applications) {
      if (matches(application, query)) grouped[application.status]?.push(application);
    }
    return grouped;
  }, [applications, query]);

  async function handleDragEnd({ destination, source, draggableId }) {
    // L'ordine dentro una colonna non viene salvato: conta solo il cambio di colonna.
    if (!destination || destination.droppableId === source.droppableId) return;

    const id = Number(draggableId);
    const newStatus = destination.droppableId;
    const previous = applications;

    // Aggiornamento ottimistico: la card si sposta subito, poi si conferma col server.
    setApplications((list) => {
      const item = list.find((a) => a.id === id);
      if (!item) return list;
      const rest = list.filter((a) => a.id !== id);
      const moved = { ...item, status: newStatus };
      const target = rest.filter((a) => a.status === newStatus && matches(a, query));
      const before = target[destination.index];
      if (!before) return [...rest, moved];
      const index = rest.indexOf(before);
      return [...rest.slice(0, index), moved, ...rest.slice(index)];
    });

    try {
      const updated = await api.updateStatus(id, newStatus);
      setApplications((list) => list.map((a) => (a.id === id ? updated : a)));
      setError('');
    } catch (err) {
      setApplications(previous); // il server ha rifiutato: si torna indietro
      setError(`Spostamento non salvato. ${err.message}`);
    }
  }

  async function handleSave(data) {
    const editing = modal.application;
    if (editing) {
      const updated = await api.updateApplication(editing.id, data);
      setApplications((list) => list.map((a) => (a.id === updated.id ? updated : a)));
    } else {
      const created = await api.createApplication(data);
      setApplications((list) => [created, ...list]);
    }
    setModal(null);
  }

  async function handleDelete() {
    const { id } = modal.application;
    await api.deleteApplication(id);
    setApplications((list) => list.filter((a) => a.id !== id));
    setModal(null);
  }

  const isEmpty = !loading && !error && applications.length === 0;

  return (
    <div className="board-page">
      <header className="topbar">
        <p className="brand">JobTrack</p>
        <input
          className="topbar__search"
          type="search"
          placeholder="Cerca azienda o ruolo"
          aria-label="Cerca azienda o ruolo"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn btn--primary" type="button" onClick={() => setModal({ application: null })}>
          Nuova candidatura
        </button>
        <div className="topbar__user">
          <span className="topbar__email">{user.email}</span>
          <button className="link" type="button" onClick={logout}>
            Esci
          </button>
        </div>
      </header>

      {error && (
        <p className="alert alert--banner" role="alert">
          {error}
        </p>
      )}

      {isEmpty && (
        <p className="board-page__welcome">
          Non hai ancora candidature. Aggiungi la prima con «Nuova candidatura», poi trascinala tra
          le colonne man mano che va avanti.
        </p>
      )}

      {loading ? (
        <p className="board-page__status">Carico le tue candidature…</p>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <main className="board">
            {STATUSES.map((status) => (
              <Column
                key={status.id}
                status={status}
                applications={columns[status.id]}
                filtered={Boolean(query)}
                onOpen={(application) => setModal({ application })}
              />
            ))}
          </main>
        </DragDropContext>
      )}

      {modal && (
        <ApplicationModal
          application={modal.application}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
