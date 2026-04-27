const TelegramBot = require('node-telegram-bot-api');
const mineflayer = require('mineflayer');
const axios = require('axios');
const express = require('express');

// === المعلومات الخاصة بك ===
const BOT_TOKEN = '7727782261:AAGB_rGpclD59UGwB9RxyZTh8PGXjzI8oKg';
const ADMIN_ID  = 1255909521;
const API_KEY   = 'ptlc_3uKPO5PiG5CXlPwsKnNB15y98Q75KVpCjW0UCeUVnRM';
const SERVER_ID = '62a15848-3684-442a-b55a-d8cbf5105e62';
const PANEL_URL = 'https://panel.magmanode.com';

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// دالة التحكم بالسيرفر
const controlMagma = async (action) => {
    try {
        const response = await axios.post(`${PANEL_URL}/api/client/servers/${SERVER_ID}/power`, 
            { signal: action }, 
            { headers: { 'Authorization': `Bearer ${API_KEY}`, 'Accept': 'application/json' } }
        );
        return response.status === 204;
    } catch (e) {
        console.error("API Error:", e.message);
        return false;
    }
};

// دالة تشغيل بوت الماينكرافت (Anti-AFK)
const initMinecraftBot = () => {
    console.log('🔄 محاولة دخول البوت للسيرفر...');
    const mcBot = mineflayer.createBot({
        host: 'gold.magmanode.com',
        port: 27891,
        username: 'BalaBot',
        version: '1.21.1'
    });

    mcBot.on('login', () => {
        console.log('✅ BalaBot دخل للسيرفر!');
        bot.sendMessage(ADMIN_ID, "✅ يوسف، البوت دخل للسيرفر وهسه هو أونلاين.");
    });

    mcBot.on('spawn', () => {
        // حركات Anti-AFK
        setInterval(() => {
            if (mcBot.entity) {
                mcBot.setControlState('jump', true);
                setTimeout(() => mcBot.setControlState('jump', false), 500);
            }
        }, 30000);
    });

    mcBot.on('error', (err) => console.log('خطأ في البوت:', err.message));

    // أهم جزء: إذا السيرفر طفى أو البوت طردوه
    mcBot.on('end', async () => {
        console.log('⚠️ البوت انفصل! السيرفر غالباً طفى.');
        bot.sendMessage(ADMIN_ID, "⚠️ يوسف، السيرفر طفى! دا أحاول أشغله تلقائياً هسه.. خليك مرتاح.");

        // محاولة تشغيل السيرفر عن طريق الـ API
        const started = await controlMagma('start');
        
        if (started) {
            bot.sendMessage(ADMIN_ID, "🚀 أمر التشغيل وصل للسيرفر بنجاح. راح أنتظر دقيقتين وأرجع أدخل البوت.");
            // ننتظر دقيقتين حتى يشتغل السيرفر بالكامل
            setTimeout(initMinecraftBot, 120000); 
        } else {
            bot.sendMessage(ADMIN_ID, "❌ يوسف، صارت مشكلة بالـ API وما گدرت أشغل السيرفر. لازم تدخل أنت تشوف اللوحة! ⛔");
        }
    });
};

// تشغيل البوت لأول مرة
initMinecraftBot();

// أوامر التليجرام اليدوية (للطوارئ)
bot.onText(/\/status/, (msg) => {
    if (msg.from.id === ADMIN_ID) bot.sendMessage(ADMIN_ID, "🤖 البوت شغال ودا يراقب السيرفر ٢٤ ساعة.");
});

// إعداد Railway Web Service
const app = express();
app.get('/', (req, res) => res.send('Bala Unified Bot is Active!'));
app.listen(process.env.PORT || 3000);
