# Docker Deployment - Home Inventory System

Dieses Dokument beschreibt, wie Sie das Home Inventory System mit Docker betreiben.

## Voraussetzungen

- Docker Engine 20.10+
- Docker Compose 2.0+

## Schnellstart

### 1. Projekt starten

```bash
# Alle Container bauen und starten
docker-compose up -d

# Logs anzeigen
docker-compose logs -f

# Status prüfen
docker-compose ps
```

### 2. Anwendung öffnen

Die Anwendung ist verfügbar unter: **http://localhost**

Standard-Login:
- **Benutzername**: `admin`
- **Passwort**: `admin`

### 3. Projekt stoppen

```bash
# Container stoppen
docker-compose stop

# Container stoppen und entfernen
docker-compose down

# Container, Volumes und Images entfernen (VORSICHT: Löscht alle Daten!)
docker-compose down -v --rmi all
```

## Architektur

Die Anwendung besteht aus zwei Containern:

### Backend Container (`backend`)
- **Image**: PHP 8.2 mit Apache
- **Port**: Intern 80 (nicht direkt zugänglich)
- **Datenbank**: SQLite in `/var/www/html/data/`
- **Uploads**: `/var/www/html/uploads/`

### Frontend Container (`frontend`)
- **Image**: nginx:alpine
- **Port**: 80 (öffentlich zugänglich)
- **Funktion**:
  - Serviert Angular App
  - Proxyt API-Anfragen an Backend
  - Proxyt Upload-Anfragen an Backend

## Volumes

Persistente Daten werden in folgenden Verzeichnissen gespeichert:

```
./data/          # SQLite Datenbank
./uploads/       # Hochgeladene Bilder und Datenblätter
  ├── images/
  └── datasheets/
```

Diese Verzeichnisse werden automatisch erstellt und als Docker Volumes gemountet.

## Netzwerk

Beide Container sind im `app-network` verbunden:
- Frontend kann Backend über `http://backend:80` erreichen
- Externe Clients greifen nur auf Frontend zu (Port 80)

## Konfiguration

### Umgebungsvariablen

Backend-Container unterstützt folgende Environment-Variablen in `docker-compose.yml`:

```yaml
environment:
  - PHP_DISPLAY_ERRORS=Off
  - PHP_ERROR_REPORTING=E_ALL
```

### API-URLs

Die API-URLs werden automatisch konfiguriert:
- **Development** (lokaler XAMPP): `http://localhost:9000/api`
- **Production** (Docker): `/api` (proxyed durch nginx)

## Development mit Docker

Für Development können Sie den Backend-Code live mounten:

1. Kommentieren Sie diese Zeile in `docker-compose.yml` ein:
   ```yaml
   # - ./backend:/var/www/html
   ```

2. Container neu starten:
   ```bash
   docker-compose down
   docker-compose up -d
   ```

Änderungen am Backend-Code werden sofort sichtbar (PHP).
Änderungen am Frontend erfordern einen Rebuild des Containers.

## Troubleshooting

### Container starten nicht

```bash
# Logs prüfen
docker-compose logs backend
docker-compose logs frontend

# Container neu bauen
docker-compose build --no-cache
docker-compose up -d
```

### Datenbank-Fehler

```bash
# In Backend-Container einloggen
docker-compose exec backend bash

# Datenbank prüfen
ls -la /var/www/html/data/
sqlite3 /var/www/html/data/database.db ".tables"

# Berechtigungen prüfen
ls -la /var/www/html/data/
```

### Frontend zeigt API-Fehler

1. Prüfen Sie, ob Backend läuft:
   ```bash
   docker-compose ps backend
   ```

2. Testen Sie Backend direkt:
   ```bash
   docker-compose exec backend curl http://localhost/api/categories
   ```

3. Prüfen Sie nginx-Logs:
   ```bash
   docker-compose logs frontend
   ```

### Port 80 ist bereits belegt

Ändern Sie den Port in `docker-compose.yml`:

```yaml
services:
  frontend:
    ports:
      - "8080:80"  # Ändere 80 auf 8080
```

Dann auf http://localhost:8080 zugreifen.

## Produktion

### Sicherheit

Für Production-Deployment:

1. **Ändern Sie das Admin-Passwort** nach dem ersten Login

2. **HTTPS aktivieren**: Verwenden Sie einen Reverse Proxy wie nginx oder Traefik:
   ```yaml
   services:
     frontend:
       labels:
         - "traefik.enable=true"
         - "traefik.http.routers.inventory.rule=Host(`inventory.example.com`)"
         - "traefik.http.routers.inventory.tls=true"
   ```

3. **Backups**: Sichern Sie regelmäßig `./data/` und `./uploads/`

4. **Resource Limits**: Setzen Sie Memory/CPU Limits:
   ```yaml
   services:
     backend:
       deploy:
         resources:
           limits:
             cpus: '0.5'
             memory: 512M
   ```

### Updates

```bash
# Repository aktualisieren
git pull

# Container neu bauen
docker-compose build --no-cache

# Mit neuen Images starten
docker-compose up -d

# Alte Images aufräumen
docker image prune -f
```

## Backup & Restore

### Backup erstellen

```bash
# Datenbank und Uploads sichern
tar -czf backup-$(date +%Y%m%d).tar.gz data/ uploads/
```

### Restore

```bash
# Backup entpacken
tar -xzf backup-20250104.tar.gz

# Container neu starten
docker-compose restart
```

## Performance-Optimierung

1. **nginx Caching**: Bereits konfiguriert in `nginx.conf`

2. **Gzip Compression**: Bereits aktiviert in `nginx.conf`

3. **PHP OPcache**: Kann in Backend Dockerfile aktiviert werden:
   ```dockerfile
   RUN docker-php-ext-install opcache
   ```

## Support

Bei Problemen:
1. Prüfen Sie die Logs: `docker-compose logs`
2. Prüfen Sie Container-Status: `docker-compose ps`
3. Prüfen Sie Health-Checks: `docker inspect <container_id>`
