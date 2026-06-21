# Деплой qanda.online — self-host на одном VPS (Docker Compose + Nginx + Let's Encrypt)

Одна Docker-образ-сборка → **два окружения** на одном сервере:

| Окружение | Домен | Контейнер | Хост-порт | env-файл |
| --- | --- | --- | --- | --- |
| **PROD** | `qanda.online`, `www.qanda.online` | `app-prod` | `127.0.0.1:3001` | `deploy/.env.prod` |
| **STAGING** | `staging.qanda.online` | `app-staging` | `127.0.0.1:3002` | `deploy/.env.staging` |

База — общий **Supabase Cloud** для обоих окружений (пока). `NEXT_PUBLIC_*` инлайнятся в бандл при сборке (build args); серверные секреты подставляются в рантайме через `env_file`. Один и тот же образ `qanda:latest` обслуживает оба окружения — отличаются только рантайм-`SITE_URL` (см. `lib/env.ts`, который предпочитает `SITE_URL` над build-time `NEXT_PUBLIC_SITE_URL`).

```
Браузер ──HTTPS──► Nginx (host) ──┬─► app-prod    127.0.0.1:3001  (qanda.online)
                                  └─► app-staging 127.0.0.1:3002  (staging.qanda.online)
                                        │
                                        └──► Supabase Cloud (БД, Auth, Realtime)
```

---

## (a) DNS — у регистратора (reg.ru)

Создай три **A-записи**, все указывают на IP твоего VPS:

```
qanda.online           A   <VPS_IP>
www.qanda.online       A   <VPS_IP>
staging.qanda.online   A   <VPS_IP>
```

Дождись распространения (`dig +short qanda.online` должен вернуть IP) — TLS выпускается только после этого.

## (b) Подготовка сервера (один раз)

На свежем Ubuntu 22/24, под root:

```bash
# забрать только bootstrap-скрипт (или сначала склонировать репо — шаг c)
sudo bash deploy/setup-server.sh
```

Скрипт идемпотентен (можно перезапускать). Он ставит Docker Engine + compose-плагин, Nginx, certbot; создаёт 2G swap, если RAM < 2GB; открывает порты 80/443/SSH в ufw; создаёт `/opt/qanda`.

## (c) Клонировать репозиторий

```bash
sudo git clone <repo-url> /opt/qanda
cd /opt/qanda
```

## (d) Файлы окружения (секреты, НЕ в git)

```bash
cp deploy/.env.prod.example    deploy/.env.prod
cp deploy/.env.staging.example deploy/.env.staging
nano deploy/.env.prod      # и deploy/.env.staging
```

Заполни в обоих:

- `NEXT_PUBLIC_SUPABASE_URL` — Project URL из Supabase (**Project Settings → API**)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — anon / publishable ключ
- `SUPABASE_SERVICE_ROLE_KEY` — service_role ключ (секрет, только сервер)
- `ANON_SECRET` — `openssl rand -base64 48`
- `SITE_URL` — уже проставлен: `https://qanda.online` (prod) / `https://staging.qanda.online` (staging)
- `UPSTASH_REDIS_REST_URL` / `_TOKEN` — опционально (rate-limit; без них — no-op)

## (e) Собрать образ и поднять оба контейнера

Сборке `app-prod` нужны `NEXT_PUBLIC_*` как build-args — отдаём их из shell-окружения (значения берём из prod-файла):

```bash
set -a; source deploy/.env.prod; set +a     # экспортировать NEXT_PUBLIC_* для build args
docker compose build app-prod                # печёт qanda:latest (prod public values)
docker compose up -d                         # запускает app-prod (3001) и app-staging (3002)

docker compose ps
curl -s http://127.0.0.1:3001/api/health     # {"ok":true,...}
curl -s http://127.0.0.1:3002/api/health     # {"ok":true,...}
```

> `app-staging` использует тот же образ `qanda:latest` — отдельной сборки нет.

## (f) Nginx

```bash
sudo cp deploy/nginx/qanda.conf /etc/nginx/sites-available/qanda.conf
sudo ln -sf /etc/nginx/sites-available/qanda.conf /etc/nginx/sites-enabled/qanda.conf
sudo rm -f /etc/nginx/sites-enabled/default      # убрать дефолтный сайт, если есть
sudo nginx -t && sudo systemctl reload nginx
```

## (g) TLS (Let's Encrypt)

```bash
sudo certbot --nginx -d qanda.online -d www.qanda.online -d staging.qanda.online
```

certbot сам перепишет `qanda.conf`: добавит 443-listeners, пути сертификатов и редирект HTTP→HTTPS. Автопродление ставится в cron/systemd-timer автоматически.

## (h) Проверка

```bash
curl -I https://qanda.online            # 200, HTTPS
curl -I https://www.qanda.online        # редирект/200 на apex
curl -I https://staging.qanda.online    # 200, HTTPS
curl -s  https://qanda.online/api/health
```

Открой `https://qanda.online` в браузере — должна грузиться «Есть вопросы».

> В Supabase (**Authentication → URL Configuration**) добавь Site URL `https://qanda.online` и redirect `https://qanda.online/auth/callback` (и staging-аналоги, если используешь там вход).

## (i) CI / авто-деплой и промоут в прод

`.github/workflows/deploy.yml`:

- **push в `main`** → job `gate` (typecheck · lint · test · build), затем `deploy-staging`: по SSH `git pull --ff-only && docker compose build app-prod && docker compose up -d app-staging`. То есть main всегда выкатывается на **staging**.
- **promote в PROD** — вручную: **Actions → Deploy → Run workflow**, input `promote = true`. Job `promote-prod` по SSH делает `docker compose up -d app-prod` (переиспользует уже собранный образ).

Настрой в репозитории (**Settings → Secrets and variables → Actions**):

- **Secrets:** `SSH_HOST`, `SSH_USER`, `SSH_KEY` (приватный ключ, чей публичный лежит в `~/.ssh/authorized_keys` на сервере).
- **Variables:** `DEPLOY_ENABLED=true` (пока не выставлен — деплой-джобы no-op).

## (j) Откат (rollback)

Образ тегается `qanda:latest`, поэтому держи запасной тег перед сборкой:

```bash
cd /opt/qanda

# до пересборки — пометить текущий рабочий образ
docker tag qanda:latest qanda:prev

# если новый релиз сломан — вернуть прошлый образ
docker tag qanda:prev qanda:latest
docker compose up -d app-prod          # (или app-staging)

# либо откатить код и пересобрать
git log --oneline -5
git checkout <good-sha>
set -a; source deploy/.env.prod; set +a
docker compose build app-prod && docker compose up -d
```

Проверка после отката: `curl -s https://qanda.online/api/health`.

---

## Переменные окружения

| Переменная | Где | Назначение |
| --- | --- | --- |
| `SITE_URL` | runtime | абсолютный базовый URL окружения (предпочитается над build-time) |
| `NEXT_PUBLIC_SUPABASE_URL` | build + runtime | URL проекта Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | build + runtime | публичный anon-ключ (RLS как `anon`) |
| `SUPABASE_SERVICE_ROLE_KEY` | **runtime, секрет** | записи в обход RLS (только сервер) |
| `NEXT_PUBLIC_SITE_URL` | build | дефолтный URL, зашитый в бандл (перебивается `SITE_URL`) |
| `ANON_SECRET` | **runtime, секрет** | подпись анонимных токенов участников |
| `UPSTASH_REDIS_REST_URL/TOKEN` | runtime, опц. | rate-limit (без них — no-op) |

## Обновление миграций

Новые `supabase/migrations/*.sql` применяй вручную (SQL Editor) — изменения схемы требуют подтверждения человеком (см. `AGENTS.md`).
