import TelegramBot from 'node-telegram-bot-api';

// Токен бота от BotFather
const token = process.env.TELEGRAM_BOT_TOKEN || '8515123101:AAEHagc4FptuobxOs0ereJ-6XHXx4OzVoqo';

// URL вашего Mini App (замените на ваш реальный URL)
// Для разработки можно использовать ngrok или другой туннель
// Для продакшена используйте ваш домен с HTTPS
const MINI_APP_URL = process.env.MINI_APP_URL || 'https://dashboard.luniq.net';

// Проверка токена
if (!token || token === 'YOUR_BOT_TOKEN') {
    console.error('❌ Ошибка: Токен бота не установлен!');
    console.error('Установите переменную окружения TELEGRAM_BOT_TOKEN или обновите токен в коде.');
    process.exit(1);
}

// Проверка формата токена (должен быть в формате: число:строка)
if (!/^\d+:[A-Za-z0-9_-]+$/.test(token)) {
    console.error('❌ Ошибка: Неверный формат токена!');
    console.error('Токен должен быть в формате: 123456789:ABCdefGHIjklMNOpqrsTUVwxyz');
    process.exit(1);
}

console.log('🔑 Токен бота загружен:', token.substring(0, 10) + '...');

// Создаем экземпляр бота
const bot = new TelegramBot(token, {
    polling: {
        interval: 1000,
        autoStart: false,
    }
});

// Обработчик ошибок polling
bot.on('polling_error', (error) => {
    console.error('❌ Polling error:', error.message);

    if (error.response && error.response.statusCode === 401) {
        console.error('\n❌ Ошибка авторизации (401 Unauthorized)');
        console.error('Возможные причины:');
        console.error('1. Токен бота неверный или истек');
        console.error('2. Токен был отозван в BotFather');
        console.error('3. Проверьте правильность токена в BotFather: @BotFather');
        console.error('\n💡 Решение:');
        console.error('1. Откройте @BotFather в Telegram');
        console.error('2. Отправьте команду /mybots');
        console.error('3. Выберите вашего бота');
        console.error('4. Нажмите "API Token"');
        console.error('5. Скопируйте новый токен и обновите его в коде или переменной окружения');
        console.error('\nТекущий токен:', token.substring(0, 10) + '...');
        process.exit(1);
    }

    // Для других ошибок продолжаем работу
    console.error('Продолжаем работу...');
});

// Обработчик команды /start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const firstName = msg.from.first_name || 'Пользователь';

    const welcomeMessage = `👋 Привет, ${firstName}!\n\n` +
        `Добро пожаловать в LUNIQ Dashboard!\n\n` +
        `Нажмите на кнопку ниже, чтобы открыть приложение:`;

    // Создаем кнопку для открытия Mini App
    const options = {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: '🚀 Открыть приложение',
                        web_app: { url: MINI_APP_URL }
                    }
                ]
            ]
        }
    };

    bot.sendMessage(chatId, welcomeMessage, options).catch((error) => {
        console.error('Ошибка при отправке сообщения:', error.message);
    });
});

// Обработчик команды /help
bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;

    const helpMessage = `📖 Доступные команды:\n\n` +
        `/start - Начать работу с ботом\n` +
        `/help - Показать это сообщение\n` +
        `/app - Открыть приложение`;

    bot.sendMessage(chatId, helpMessage).catch((error) => {
        console.error('Ошибка при отправке сообщения:', error.message);
    });
});

// Обработчик команды /app
bot.onText(/\/app/, (msg) => {
    const chatId = msg.chat.id;

    const options = {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: '🚀 Открыть приложение',
                        web_app: { url: MINI_APP_URL }
                    }
                ]
            ]
        }
    };

    bot.sendMessage(chatId, 'Нажмите на кнопку, чтобы открыть приложение:', options).catch((error) => {
        console.error('Ошибка при отправке сообщения:', error.message);
    });
});

// Обработчик callback_query (нажатие на кнопки)
bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;
    const data = query.data;

    if (data === 'open_app') {
        const options = {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: '🚀 Открыть приложение',
                            web_app: { url: MINI_APP_URL }
                        }
                    ]
                ]
            }
        };

        bot.sendMessage(chatId, 'Нажмите на кнопку, чтобы открыть приложение:', options).catch((error) => {
            console.error('Ошибка при отправке сообщения:', error.message);
        });
    }

    // Подтверждаем получение callback
    bot.answerCallbackQuery(query.id).catch((error) => {
        console.error('Ошибка при ответе на callback:', error.message);
    });
});

// Обработчик неизвестных сообщений
bot.on('message', (msg) => {
    const chatId = msg.chat.id;

    // Игнорируем команды (они обрабатываются отдельно)
    if (msg.text && msg.text.startsWith('/')) {
        return;
    }

    // Отвечаем на обычные сообщения
    const options = {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: '🚀 Открыть приложение',
                        web_app: { url: MINI_APP_URL }
                    }
                ]
            ]
        }
    };

    bot.sendMessage(
        chatId,
        'Используйте команду /start для начала работы или нажмите на кнопку ниже:',
        options
    ).catch((error) => {
        console.error('Ошибка при отправке сообщения:', error.message);
    });
});

// Запускаем polling вручную после проверки
console.log('🚀 Запуск бота...');
bot.startPolling().then(() => {
    console.log('✅ Telegram бот успешно запущен и готов к работе!');
    console.log(`📱 Mini App URL: ${MINI_APP_URL}`);
    console.log('💡 Используйте команду /start в Telegram для тестирования');
}).catch((error) => {
    console.error('❌ Ошибка при запуске polling:', error.message);
    if (error.response && error.response.statusCode === 401) {
        console.error('\n❌ Токен бота неверный! Проверьте токен в BotFather.');
        console.error('Текущий токен:', token.substring(0, 10) + '...');
        console.error('\n💡 Как получить новый токен:');
        console.error('1. Откройте @BotFather в Telegram');
        console.error('2. Отправьте команду /mybots');
        console.error('3. Выберите вашего бота');
        console.error('4. Нажмите "API Token"');
        console.error('5. Скопируйте новый токен');
    }
    process.exit(1);
});
