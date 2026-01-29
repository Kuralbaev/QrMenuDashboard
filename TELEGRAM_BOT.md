# Telegram Bot для LUNIQ Dashboard

Telegram бот для открытия Mini App приложения.

## Установка

Зависимости уже установлены. Если нужно переустановить:

```bash
pnpm install
```

## Настройка

1. **Настройте URL Mini App** в файле `telegram.js`:
   ```javascript
   const MINI_APP_URL = process.env.MINI_APP_URL || 'https://your-domain.com';
   ```

2. **Или используйте переменную окружения**:
   ```bash
   export MINI_APP_URL=https://your-domain.com
   ```

## Запуск бота

```bash
pnpm run telegram
```

Или напрямую:

```bash
node telegram.js
```

## Команды бота

- `/start` - Начать работу с ботом и открыть Mini App
- `/help` - Показать список доступных команд
- `/app` - Открыть приложение

## Настройка Mini App URL

### Для разработки (локально)

Используйте ngrok или другой туннель:

1. Установите ngrok: https://ngrok.com/
2. Запустите ваш dev сервер: `pnpm run dev`
3. В другом терминале запустите ngrok:
   ```bash
   ngrok http 5173
   ```
4. Скопируйте HTTPS URL из ngrok (например: `https://abc123.ngrok.io`)
5. Установите переменную окружения:
   ```bash
   export MINI_APP_URL=https://abc123.ngrok.io
   ```
6. Запустите бота: `pnpm run telegram`

### Для продакшена

1. Задеплойте ваше приложение на сервер с HTTPS
2. Установите переменную окружения с вашим доменом:
   ```bash
   export MINI_APP_URL=https://your-production-domain.com
   ```
3. Запустите бота на сервере

## Настройка бота в BotFather

1. Откройте [@BotFather](https://t.me/botfather) в Telegram
2. Отправьте команду `/newbot` или `/setmenubutton`
3. Выберите вашего бота
4. Отправьте команду `/setmenubutton`
5. Выберите вашего бота
6. Отправьте текст кнопки (например: "Открыть приложение")
7. Отправьте URL вашего Mini App (например: `https://your-domain.com`)

## Требования

- Node.js 16+
- Telegram Bot Token (уже настроен в коде)
- HTTPS URL для Mini App (обязательно для работы Mini App)

## Примечания

- Mini App требует HTTPS соединение
- URL должен быть доступен из интернета
- Для локальной разработки используйте туннель (ngrok, localtunnel и т.д.)
