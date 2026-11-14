# JobTrack Frontend

Bacheca kanban per le candidature di lavoro. React 19 + Vite, drag & drop con `@hello-pangea/dnd`.
Si collega al backend `jobtrack-backend`.

## Avvio

```bash
npm install
npm run dev        # http://localhost:5173
```

Il backend deve girare su `http://localhost:8080`. Per un altro indirizzo copia `.env.example`
in `.env` e cambia `VITE_API_URL`.

## Cosa fa

- Registrazione e accesso (JWT salvato nel localStorage, uscita automatica se il token scade)
- Bacheca a cinque colonne: Da inviare, Inviate, Colloquio, Offerta, Chiuse
- Trascinamento tra colonne con aggiornamento ottimistico e ripristino se il server rifiuta
- Creazione, modifica ed eliminazione da una finestra di dialogo
- Ricerca per azienda o ruolo
- Utilizzabile da telefono e da tastiera

## Struttura

```
src/
  api/client.js              chiamate al backend e gestione sessione
  context/AuthContext.jsx    stato di autenticazione
  pages/AuthPage.jsx         accesso e registrazione
  pages/BoardPage.jsx        bacheca: dati, ricerca, drag & drop
  components/Column.jsx
  components/ApplicationCard.jsx
  components/ApplicationModal.jsx
  constants.js               fasi e form vuoto
  styles.css
```

## Build

```bash
npm run build      # output in dist/
```
