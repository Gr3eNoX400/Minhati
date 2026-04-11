import { Router } from "express";
import axios from "axios";
import https from "https";

const router = Router();

const BROWSER_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Referer": "https://minha.anem.dz/",
  "Origin": "https://minha.anem.dz",
  "Accept": "application/json, text/plain, */*",
  "Accept-Language": "ar,en-US;q=0.9,en;q=0.8",
  "Connection": "keep-alive",
};

const httpsAgent = new https.Agent({ rejectUnauthorized: false });
const ANEM_TIMEOUT = 30000;
const ANEM_BASE = "https://ac-controle.anem.dz/AllocationChomage/api";
const MINHA_BASE = "https://minha.anem.dz/api";

router.post("/verify-anem", async (req, res) => {
  const { nin, nni } = req.body as { nin?: string; nni?: string };

  if (!nin || nin.length !== 18) {
    res.status(400).json({ error: "رقم التعريف الوطني يجب أن يكون 18 رقماً" });
    return;
  }
  if (!nni || !nni.trim()) {
    res.status(400).json({ error: "رقم الوسيط مطلوب" });
    return;
  }

  const url = `${ANEM_BASE}/validateCandidate/query`;
  req.log?.info({ url, nni }, "[ANEM] Validating candidate");

  try {
    const response = await axios.get(url, {
      params: { wassitNumber: nni, identityDocNumber: nin },
      headers: BROWSER_HEADERS,
      httpsAgent,
      timeout: ANEM_TIMEOUT,
    });

    req.log?.info({ status: response.status }, "[ANEM] Response received");
    const data = response.data as Record<string, unknown>;

    const hasData =
      data &&
      (data["demandeurId"] !== undefined ||
        data["validInput"] === true ||
        data["eligible"] !== undefined ||
        data["detailsAllocation"] !== undefined);

    if (!hasData) {
      res.status(400).json({ error: "المعلومات المدخلة غير صحيحة أو غير مسجلة في وكالة التشغيل" });
      return;
    }

    res.json({ valid: true, data });
  } catch (err) {
    if (axios.isAxiosError(err)) {
      if (err.response?.status === 404 || err.response?.status === 400) {
        res.status(400).json({ error: "المعلومات المدخلة غير صحيحة أو غير مسجلة في وكالة التشغيل" });
        return;
      }
      if (err.code === "ECONNABORTED" || err.message.includes("timeout")) {
        req.log?.warn("[ANEM] Connection timeout");
        res.status(503).json({ error: "انتهت مهلة الاتصال بخادم وكالة التشغيل. يرجى المحاولة لاحقاً.", code: "TIMEOUT" });
        return;
      }
      req.log?.error({ code: err.code, message: err.message }, "[ANEM] Connection failed");
      res.status(502).json({ error: "تعذر الاتصال بخادم وكالة التشغيل. يرجى المحاولة لاحقاً.", code: "CONNECTION_FAILED" });
      return;
    }
    req.log?.error({ err }, "[ANEM] Unexpected error");
    res.status(500).json({ error: "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى." });
  }
});

router.post("/anem/renew-allocation", async (req, res) => {
  const { nin, nni } = req.body as { nin?: string; nni?: string };

  if (!nin || !nni) {
    res.status(400).json({ error: "بيانات غير مكتملة" });
    return;
  }

  const url = `${MINHA_BASE}/demandeur/renouvellement`;
  req.log?.info({ url }, "[ANEM] Renewal request");

  try {
    const response = await axios.post(url, { nin, nni }, {
      headers: { ...BROWSER_HEADERS, "Content-Type": "application/json" },
      httpsAgent,
      timeout: ANEM_TIMEOUT,
    });
    res.json({ success: true, data: response.data });
  } catch (err) {
    if (axios.isAxiosError(err)) {
      if (err.response) {
        res.status(err.response.status).json({ error: "رفض خادم وكالة التشغيل الطلب", details: err.response.data });
        return;
      }
      res.status(503).json({ error: "تعذر الاتصال بخادم وكالة التشغيل", code: err.code ?? "CONNECTION_FAILED" });
      return;
    }
    res.status(500).json({ error: "حدث خطأ غير متوقع" });
  }
});

router.post("/anem/update-phone", async (req, res) => {
  const { nin, nni, phone } = req.body as { nin?: string; nni?: string; phone?: string };

  if (!nin || !nni || !phone) {
    res.status(400).json({ error: "بيانات غير مكتملة" });
    return;
  }
  if (!/^(05|06|07)\d{8}$/.test(phone)) {
    res.status(400).json({ error: "رقم الهاتف غير صحيح. يجب أن يبدأ بـ 05، 06، أو 07 ويتكون من 10 أرقام." });
    return;
  }

  const url = `${MINHA_BASE}/demandeur/updatePhone`;
  req.log?.info({ url }, "[ANEM] Phone update request");

  try {
    const response = await axios.post(url, { nin, nni, newPhone: phone }, {
      headers: { ...BROWSER_HEADERS, "Content-Type": "application/json" },
      httpsAgent,
      timeout: ANEM_TIMEOUT,
    });
    res.json({ success: true, data: response.data });
  } catch (err) {
    if (axios.isAxiosError(err)) {
      if (err.response) {
        res.status(err.response.status).json({ error: "رفض خادم وكالة التشغيل الطلب", details: err.response.data });
        return;
      }
      res.status(503).json({ error: "تعذر الاتصال بخادم وكالة التشغيل", code: err.code ?? "CONNECTION_FAILED" });
      return;
    }
    res.status(500).json({ error: "حدث خطأ غير متوقع" });
  }
});

export default router;
