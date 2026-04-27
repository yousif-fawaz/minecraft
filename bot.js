import telebot
import requests
from telebot import types

# === معلومات يوسف المحدثة ===
BOT_TOKEN = "7727782261:AAGB_rGpclD59UGwB9RxyZTh8PGXjzI8oKg"
ADMIN_ID  = 1255909521
API_KEY   = "ptlc_3uKPO5PiG5CXlPwsKnNB15y98Q75KVpCjW0UCeUVnRM"
SERVER_ID = "62a15848-3684-442a-b55a-d8cbf5105e62"
PANEL_URL = "https://panel.magmanode.com"

bot = telebot.TeleBot(BOT_TOKEN)

def control_magma(action):
    url = f"{PANEL_URL}/api/client/servers/{SERVER_ID}/power"
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }
    data = {"signal": action}
    try:
        response = requests.post(url, json=data, headers=headers)
        # لوحة Pterodactyl ترجع 204 إذا نجح الطلب
        return response.status_code == 204
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

@bot.message_handler(commands=['start'])
def send_welcome(message):
    if message.from_user.id == ADMIN_ID:
        markup = types.ReplyKeyboardMarkup(row_width=2, resize_keyboard=True)
        btn1 = types.KeyboardButton('🚀 تشغيل السيرفر')
        btn2 = types.KeyboardButton('🛑 إطفاء السيرفر')
        btn3 = types.KeyboardButton('🔄 إعادة تشغيل')
        markup.add(btn1, btn2, btn3)
        bot.reply_to(message, "هلا يوسف! البوت الجديد شغال لوز، شتريد نسوي بالسيرفر؟", reply_markup=markup)
    else:
        bot.reply_to(message, "هذا البوت مخصص لـ يوسف فقط. ⛔")

@bot.message_handler(func=lambda message: True)
def handle_messages(message):
    if message.from_user.id != ADMIN_ID: return

    if message.text == '🚀 تشغيل السيرفر':
        bot.send_message(ADMIN_ID, "⏳ جاري تشغيل سيرفر ماگما نود...")
        if control_magma("start"):
            bot.send_message(ADMIN_ID, "✅ تم! السيرفر هسه دا يشتغل.")
        else:
            bot.send_message(ADMIN_ID, "❌ صار خلل بالـ API، اتأكد من اللوحة.")

    elif message.text == '🛑 إطفاء السيرفر':
        if control_magma("stop"):
            bot.send_message(ADMIN_ID, "🛑 تم إرسال أمر الإطفاء.")

    elif message.text == '🔄 إعادة تشغيل':
        if control_magma("restart"):
            bot.send_message(ADMIN_ID, "🔄 جاري إعادة التشغيل...")

print("🤖 بوت Bala Control شغال بالتوكن الجديد...")
bot.infinity_polling()
