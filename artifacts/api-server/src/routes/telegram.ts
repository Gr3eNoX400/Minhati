import { Router } from "express";
import TelegramBot from "node-telegram-bot-api";

const router = Router();

const BOT_TOKEN = "7868322102:AAG936fNG9XHX3w1NtbHLqxb6g0S7jL4jX4";

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

interface UserRecord {
  nin: string;
  nni: string;
  code: string;
  chatId?: string;
  verified: boolean;
  createdAt: number;
}

const pendingVerifications = new Map<string, UserRecord>();
const verifiedUsers = new Map<string, UserRecord>();

bot.on("message", async (msg) => {
  const text = msg.text?.trim() ?? "";
  const chatId = String(msg.chat.id);

  if (/^\d{6}$/.test(text)) {
    let found: UserRecord | undefined;
    let foundCode = "";

    for (const [code, record] of pendingVerifications.entries()) {
      if (code === text) {
        found = record;
        foundCode = code;
        break;
      }
    }

    if (found) {
      found.chatId = chatId;
      found.verified = true;
      verifiedUsers.set(found.nin, found);
      pendingVerifications.delete(foundCode);

      await bot.sendMessage(chatId, "تم تفعيل التنبيهات بنجاح! ✅");
    } else {
      await bot.sendMessage(chatId, "الرمز غير صحيح أو منتهي الصلاحية. يرجى المحاولة مرة أخرى.");
    }
  }
});

router.post("/generate-code", (req, res) => {
  const { nin, nni } = req.body as { nin?: string; nni?: string };

  if (!nin || nin.length !== 18) {
    res.status(400).json({ error: "رقم التعريف الوطني يجب أن يكون 18 رقماً" });
    return;
  }

  if (!nni) {
    res.status(400).json({ error: "رقم الوسيط مطلوب" });
    return;
  }

  const code = String(Math.floor(100000 + Math.random() * 900000));

  const record: UserRecord = {
    nin,
    nni,
    code,
    verified: false,
    createdAt: Date.now(),
  };

  pendingVerifications.set(code, record);

  setTimeout(() => {
    pendingVerifications.delete(code);
  }, 10 * 60 * 1000);

  res.json({ code, message: "تم إنشاء رمز التحقق بنجاح" });
});

router.get("/verify-status", (req, res) => {
  const nin = req.query["nin"] as string;

  if (!nin) {
    res.status(400).json({ error: "رقم التعريف الوطني مطلوب" });
    return;
  }

  const record = verifiedUsers.get(nin);

  if (record) {
    res.json({ verified: true, chatId: record.chatId ?? null });
  } else {
    res.json({ verified: false, chatId: null });
  }
});

export default router;
