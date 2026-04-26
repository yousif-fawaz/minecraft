const mineflayer = require('mineflayer')

const botArgs = {
    host: '911gt3rs-Ozwe.aternos.me', // حط الأيبي مالتك هنا
    port: 50978,
    username: 'BalaBot',
    version: '1.21.11' 
}

const initBot = () => {
    console.log('🚀 ديحاول يدخل للسيرفر بنسخة 1.21.11...');
    const bot = mineflayer.createBot(botArgs)

    bot.on('login', () => {
        console.log('✅ دخلنا! البوت هسه بالسيرفر.');
    })

    bot.on('spawn', () => {
        console.log('🏃 بدت حركات الـ Anti-AFK.. البوت ديتحرك هسه.');
        
        setInterval(() => {
            if (bot.entity) {
                const actions = ['forward', 'back', 'left', 'right'];
                const randomAction = actions[Math.floor(Math.random() * actions.length)];
                
                bot.setControlState(randomAction, true);
                setTimeout(() => bot.setControlState(randomAction, false), 1000);
                
                bot.setControlState('jump', true);
                setTimeout(() => bot.setControlState('jump', false), 500);
                
                bot.look(Math.random() * 6, 0);
            }
        }, 15000);
    })

    bot.on('error', (err) => {
        console.log('❌ صار خطأ: ' + err.message);
    })

    bot.on('end', () => {
        console.log('⚠️ البوت انفصل، راح يرجع يحاول بعد 30 ثانية...');
        setTimeout(initBot, 30000);
    })
}

initBot();