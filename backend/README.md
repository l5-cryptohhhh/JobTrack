# JobTrack Backend

API REST per tracciare le candidature di lavoro. Spring Boot 3, Java 21, PostgreSQL, JWT.

## Avvio

```bash
docker compose up -d          # avvia PostgreSQL su localhost:5432
mvn spring-boot:run
```

L'API gira su `http://localhost:8080`.

## Variabili d'ambiente (tutte opzionali in locale)

| Variabile     | Default                                   |
|---------------|-------------------------------------------|
| `DB_URL`      | `jdbc:postgresql://localhost:5432/jobtrack` |
| `DB_USER`     | `jobtrack`                                |
| `DB_PASSWORD` | `jobtrack`                                |
| `JWT_SECRET`  | valore di sviluppo, **da cambiare in produzione** (min. 32 caratteri) |
| `CORS_ORIGIN` | `http://localhost:5173`                   |

## Endpoint

| Metodo | Percorso                          | Auth | Descrizione                  |
|--------|-----------------------------------|------|------------------------------|
| POST   | `/api/auth/register`              | no   | Registra e restituisce il JWT |
| POST   | `/api/auth/login`                 | no   | Login, restituisce il JWT    |
| GET    | `/api/applications?status=APPLIED`| sì   | Lista (filtro opzionale)     |
| GET    | `/api/applications/{id}`          | sì   | Dettaglio                    |
| POST   | `/api/applications`               | sì   | Crea                         |
| PUT    | `/api/applications/{id}`          | sì   | Modifica                     |
| PATCH  | `/api/applications/{id}/status`   | sì   | Cambia solo lo stato         |
| DELETE | `/api/applications/{id}`          | sì   | Elimina                      |

Header per le rotte protette: `Authorization: Bearer <token>`.

Stati: `WISHLIST`, `APPLIED`, `INTERVIEW`, `OFFER`, `REJECTED`.

## Prova rapida

```bash
TOKEN=$(curl -s -X POST localhost:8080/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"me@example.com","password":"password123"}' | jq -r .token)

curl -s -X POST localhost:8080/api/applications \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"company":"Acme","role":"Full Stack Developer","status":"APPLIED"}'
```

## Test

```bash
mvn test    # usa H2 in memoria, non serve Docker
```
