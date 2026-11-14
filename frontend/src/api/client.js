const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';
const STORAGE_KEY = 'jobtrack.session';

// ---- Sessione (token + email) salvata nel localStorage ----

export function loadSession() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

export function saveSession(session) {
  try {
    if (session) localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // localStorage non disponibile (es. navigazione privata): la sessione resta solo in memoria
  }
}

let token = loadSession()?.token ?? null;
let onSessionExpired = () => {};

export function setToken(value) {
  token = value;
}

/** L'AuthContext registra qui cosa fare quando il backend rifiuta il token. */
export function setSessionExpiredHandler(handler) {
  onSessionExpired = handler;
}

// ---- Richieste ----

export class ApiError extends Error {
  constructor(status, message, fields = {}) {
    super(message);
    this.status = status;
    this.fields = fields; // errori di validazione per campo: { company: "..." }
  }
}

const FALLBACK_MESSAGES = {
  400: 'Dati non validi.',
  401: 'Sessione scaduta. Accedi di nuovo.',
  404: 'Elemento non trovato.',
  409: 'Esiste già.',
  502: 'Il servizio AI non ha risposto. Riprova.',
  503: 'Analisi AI non disponibile.',
};

async function request(path, { method = 'GET', body } = {}) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(BASE_URL + path, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, 'Server non raggiungibile. Controlla che il backend sia avviato.');
  }

  if (response.status === 204) return null;

  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    // risposta non JSON: usiamo il messaggio di riserva
  }

  if (!response.ok) {
    // 401 con un token presente = token scaduto o non valido -> si torna al login
    if (response.status === 401 && token) onSessionExpired();
    const message =
      data?.detail ?? FALLBACK_MESSAGES[response.status] ?? `Errore del server (${response.status}).`;
    throw new ApiError(response.status, message, data?.errors);
  }
  return data;
}

export const api = {
  register: (email, password) =>
    request('/api/auth/register', { method: 'POST', body: { email, password } }),
  login: (email, password) =>
    request('/api/auth/login', { method: 'POST', body: { email, password } }),

  extractApplication: (text, image) =>
    request('/api/applications/extract', { method: 'POST', body: { text: text || null, image: image || null } }),
  listApplications: () => request('/api/applications'),
  createApplication: (data) => request('/api/applications', { method: 'POST', body: data }),
  updateApplication: (id, data) => request(`/api/applications/${id}`, { method: 'PUT', body: data }),
  updateStatus: (id, status) =>
    request(`/api/applications/${id}/status`, { method: 'PATCH', body: { status } }),
  deleteApplication: (id) => request(`/api/applications/${id}`, { method: 'DELETE' }),
};
