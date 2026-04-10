import { Router } from "express";
import axios from "axios";
import https from "https";

const router = Router();

const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Referer": "https://minha.anem.dz/",
  "Origin": "https://minha.anem.dz",
  "Accept": "application/json, text/plain, */*",
  "Accept-Language": "ar,en-US;q=0.9,en;q=0.8",
  "Connection": "keep-alive",
};

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

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

  const url = `https://ac-controle.anem.dz/AllocationChomage/api/validateCandidate/query`;

  console.log(`[ANEM] Attempting request to: ${url}`);
  console.log(`[ANEM] Params: wassitNumber=${nni}, identityDocNumber=${nin.slice(0, 4)}****`);

  try {
    const response = await axios.get(url, {
      params: {
        wassitNumber: nni,
        identityDocNumber: nin,
      },
      headers: BROWSER_HEADERS,
      httpsAgent,
      timeout: 20000,
    });

    console.log(`[ANEM] Response status: ${response.status}`);
    console.log(`[ANEM] Response data:`, JSON.stringify(response.data));

    const data = response.data as Record<string, unknown>;

    const hasData =
      data &&
      (data["demandeurId"] !== undefined ||
        data["validInput"] === true ||
        data["eligible"] !== undefined ||
        data["detailsAllocation"] !== undefined);

    if (!hasData) {
      console.log(`[ANEM] Response has no recognizable data fields`);
      res.status(400).json({
        error: "المعلومات المدخلة غير صحيحة أو غير مسجلة في وكالة التشغيل",
      });
      return;
    }

    res.json({ valid: true, data });
  } catch (err) {
    if (axios.isAxiosError(err)) {
      console.log(`[ANEM] Axios error code: ${err.code}`);
      console.log(`[ANEM] Axios error message: ${err.message}`);
      if (err.response) {
        console.log(`[ANEM] HTTP status: ${err.response.status}`);
        console.log(`[ANEM] Response data:`, JSON.stringify(err.response.data));
        console.log(`[ANEM] Response headers:`, JSON.stringify(err.response.headers));
      } else {
        console.log(`[ANEM] No HTTP response — likely network/firewall block or DNS failure`);
      }

      if (err.response?.status === 404 || err.response?.status === 400) {
        res.status(400).json({
          error: "المعلومات المدخلة غير صحيحة أو غير مسجلة في وكالة التشغيل",
        });
        return;
      }

      if (err.code === "ECONNABORTED" || err.message.includes("timeout")) {
        req.log?.warn("ANEM API timeout — server may be blocking this IP");
        res.status(503).json({
          error: "تعذر الاتصال بخادم وكالة التشغيل (انتهت مهلة الاتصال). يرجى المحاولة لاحقاً.",
          code: "TIMEOUT",
        });
        return;
      }

      req.log?.error({ err: err.message }, "ANEM API error");
      res.status(502).json({
        error: "تعذر الاتصال بخادم وكالة التشغيل. يرجى المحاولة لاحقاً.",
        code: "CONNECTION_FAILED",
      });
      return;
    }
    console.log(`[ANEM] Unknown error:`, err);
    req.log?.error({ err }, "Unexpected error in verify-anem");
    res.status(502).json({ error: "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى." });
  }
});

export default router;
