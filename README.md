# site-web-vc

Site public VolunSys-UY1 (calcul volontaire) -- stack Django + Next.js.

## Structure

```
site-backend/   API Django (stats, guide installation, mission)
site-frontend/  Interface Next.js (accueil, volontaire, a-propos, badges)
```

## URLs production

| Service | URL |
|---------|-----|
| Site public | https://vc-uy.npe-techs.com |
| Manager | https://manager-vc-uy.npe-techs.com |
| Coordinateur | https://coordinator-vc-uy.npe-techs.com |

## Developpement local

### Backend (port 8003)

```bash
cd site-backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
export DJANGO_DEBUG=True
export DJANGO_SECRET_KEY=dev-secret
export COORDINATOR_API_URL=http://localhost:8001/api
python manage.py runserver 0.0.0.0:8003
```

### Frontend (port 3010)

```bash
cd site-frontend
npm install
export NEXT_PUBLIC_API_URL=http://localhost:8003/api
export NEXT_PUBLIC_MANAGER_URL=https://manager-vc-uy.npe-techs.com
npm run dev
```

Ouvrir http://localhost:3010

## Variables d'environnement

### Backend (`site-backend`)

| Variable | Description |
|----------|-------------|
| `DJANGO_SECRET_KEY` | Cle secrete Django |
| `DJANGO_DEBUG` | `False` en production |
| `DJANGO_ALLOWED_HOSTS` | Domaines autorises |
| `COORDINATOR_API_URL` | URL API coordinateur |
| `COORDINATOR_REDIS_HOST` | Hote proxy Redis volontaires |
| `REDIS_PROXY_PORT` | Port proxy (6380) |

### Frontend (`site-frontend`)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | URL API site |
| `NEXT_PUBLIC_MANAGER_URL` | URL application Manager |
| `NEXT_PUBLIC_COORDINATOR_URL` | URL coordinateur |
| `NEXT_PUBLIC_VOLUNTEER_REPO` | Depot GitHub volontaire |

## Deploiement Docker

Les Dockerfiles de production se trouvent dans le monorepo VC-UY :

- `deploy/docker/site-backend.Dockerfile`
- `deploy/docker/site-frontend.Dockerfile`
- `deploy/nginx/vc-uy.conf`

Le deploiement complet utilise `deploy/docker-compose.prod.yml` sur le VPS.

## Pages

| Route | Description |
|-------|-------------|
| `/` | Accueil -- boutons Manager et guide volontaire |
| `/volontaire` | Guide d'installation complet (Linux, Windows) |
| `/a-propos` | Contexte recherche Master 2, UY1 |
| `/badges` | Gamification et micro-recompenses frugales |

## API

| Endpoint | Description |
|----------|-------------|
| `GET /api/health/` | Sante du service |
| `GET /api/stats/` | Statistiques publiques |
| `GET /api/install-guide/` | Guide installation volontaire |
| `GET /api/mission/` | Contexte et objectifs recherche |

## Licence

Projet academique -- Universite de Yaounde I.
