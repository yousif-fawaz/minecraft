const TelegramBot = require('node-telegram-bot-api');
const mineflayer = require('mineflayer');
const axios = require('axios');
const express = require('express');

// === معلومات يوسف ===
const BOT_TOKEN = '7727782261:AAGB_rGpclD59UGwB9RxyZTh8PGXjzI8oKg';
const ADMIN_ID  = 1255909521;
const API_KEY   = 'ptlc_3uKPO5PiG5CXlPwsKnNB15y98Q75KVpCjW0UCeUVnRM';
const SERVER_ID = '62a15848-3684-442a-b55a-d8cbf5105e62';
const PANEL_URL = 'https://panel.magmanode.com';

const bot = new TelegramBot(BOT_TOKEN, { polling: true });
let mcBot;

// --- 1. دالة التحكم بالسيرفر عبر الـ API ---
const controlMagma = async (action) => {
    try {
        const response = await axios.post(`${PANEL_URL}/api/client/servers/${SERVER_ID}/power`, 
            { signal: action }, 
            { headers: { 'Authorization': `Bearer ${API_KEY}`, 'Accept': 'application/json' } }
        );
        return response.status === 204;
    } catch (e) {
        console.error("خطأ في الـ API:", e.message);
        return false;
    }
};

// --- 2. دالة تشغيل بوت الماينكرافت (Anti-AFK) ---
const initMinecraftBot = () => {
    console.log('🔄 محاولة دخول BalaBot للسيرفر...');
    mcBot = mineflayer.createBot({
        host: 'gold.magmanode.com',
        port: 27891,
        username: 'BalaBot',
        version: '1.21.1'
    });

    mcBot.on('login', () => {
        console.log('✅ BalaBot صار جوه!');
        bot.sendMessage(ADMIN_ID, "✅ يوسف، البوت دخل للسيرفر وهسه هو أونلاين.");
    });

    mcBot.on('spawn', () => {
        // حركات عشوائية كل 30 ثانية
        setInterval(() => {
            if (mcBot.entity) {
                mcBot.setControlState('jump', true);
                setTimeout(() => mcBot.setControlState('jump', false), 500);
            }
        }, 30000);
    });

    mcBot.on('end', async () => {
        console.log('⚠️ البوت انفصل!');
        bot.sendMessage(ADMIN_ID, "⚠️ يوسف، البوت فصل! السيرفر غالباً طفى.. دا أحاول أشغله تلقائياً.");

        const started = await controlMagma('start');
        if (started) {
            bot.sendMessage(ADMIN_ID, "🚀 دزيت أمر التشغيل.. راح أنتظر دقيقتين وأرجع أدخل البوت.");
            setTimeout(initMinecraftBot, 120000); // ينتظر دقيقتين
        } else {
            bot.sendMessage(ADMIN_ID, "❌ يوسف، السيرفر ما قبل يشتغل تلقائياً، لازم تشيكه يدوياً!");
        }
    });

    mcBot.on('error', (err) => console.log('Error:', err.message));
};

// --- 3. أوامر التليجرام اليدوية ---
bot.onText(/\/start/, (msg) => {
    if (msg.from.id !== ADMIN_ID) return;
    const opts = {
        reply_markup: {
            keyboard: [['🚀 تشغيل السيرفر', '🛑 إطفاء السيرفر'], ['🔄 إعادة تشغيل']],
            resize_keyboard: true
        }
    };
    bot.sendMessage(ADMIN_ID, "هلا يوسف! شلون أساعدك بسيرفر بالة اليوم؟", opts);
});

bot.on('message', async (msg) => {
    if (msg.from.id !== ADMIN_ID) return;
    if (msg.text === '🚀 تشغيل السيرفر') {
        bot.sendMessage(ADMIN_ID, "⏳ جاري التشغيل يدوياً...");
        await controlMagma('start');
    }
    // تگدر تضيف الـ stop والـ restart هنا بنفس الطريقة
});

// تشغيل البوت لأول مرة
initMinecraftBot();

// كود ضروري لـ Railway حتى ما يطفي الـ App
const app = express();
app.get('/', (req, res) => res.send('Bala Bot is Live!'));
app.listen(process.env.PORT || 3000);
