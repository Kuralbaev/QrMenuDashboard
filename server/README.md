## Сводка GA4 через API

Клиентское приложение не может безопасно вызывать Google Analytics Data API с секретным ключом. Этот небольшой сервер делает один отчёт `runReport` и отдаёт JSON для дашборда.

### Шаги

1. В [Google Cloud Console](https://console.cloud.google.com/) включите API **Google Analytics Data API**.
2. Создайте **сервисный аккаунт**, скачайте JSON ключ.
3. В [Google Analytics](https://analytics.google.com/) → **Администратор** → ресурс → **Управление доступом к ресурсу** добавьте email сервисного аккаунта с ролью **Читатель** (Viewer).
4. Числовой **ID ресурса** возьмите там же: Администратор → ресурс → **Сведения о ресурсе** (не Measurement ID вида `G-…`).

### Переменные окружения (рядом с `pnpm ga-server`)

| Переменная | Описание |
|------------|-----------|
| `GA4_PROPERTY_ID` | Обязательно. Числовой ID ресурса. |
| `GOOGLE_APPLICATION_CREDENTIALS` | Обязательно. Абсолютный путь к JSON ключу (**не коммить** в репозиторий; см. `.gitignore` для `server/*.json`). |
| `GA_SERVER_PORT` | По умолчанию `8787`. |
| `GA_SUMMARY_SECRET` | Если задан, клиент должен слать заголовок `x-ga-summary-secret` с тем же значением. |
| `GA_CORS_ORIGIN` | По умолчанию `*`. Для продакшена лучше указать свой домен. |

Фронт: в `.env` задайте `VITE_GA_SUMMARY_URL` (полный URL или путь через прокси Vite, см. `.env.example`) и при необходимости `VITE_GA_SUMMARY_SECRET`.

### Интеграция в основной backend

Вы можете повторить логику `runReport` на своём `admin`-API и отдавать тот же JSON по пути из `VITE_GA_SUMMARY_API_PATH` с обычной авторизацией Bearer — тогда отдельный `ga-server` не нужен.
