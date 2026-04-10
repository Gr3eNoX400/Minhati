import { Router } from "express";
import axios from "axios";

const router = Router();

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

  try {
    const url = `https://ac-controle.anem.dz/AllocationChomage/api/validateCandidate/query`;
    const response = await axios.get(url, {
      params: {
        wassitNumber: nni,
        identityDocNumber: nin,
      },
      headers: {
        Referer: "https://minha.anem.dz/",
        Accept: "application/json",
      },
      timeout: 15000,
    });

    const data = response.data as Record<string, unknown>;

    const hasData =
      data &&
      (data["demandeurId"] !== undefined ||
        data["validInput"] === true ||
        data["eligible"] !== undefined ||
        data["detailsAllocation"] !== undefined);

    if (!hasData) {
      res.status(400).json({
        error:
          "المعلومات المدخلة غير صحيحة أو غير مسجلة في وكالة التشغيل",
      });
      return;
    }

    res.json({ valid: true, data });
  } catch (err) {
    if (axios.isAxiosError(err)) {
      if (err.response?.status === 404 || err.response?.status === 400) {
        res.status(400).json({
          error:
            "المعلومات المدخلة غير صحيحة أو غير مسجلة في وكالة التشغيل",
        });
        return;
      }
      req.log?.error({ err: err.message }, "ANEM API error");
      res.status(502).json({ error: "تعذر الاتصال بخادم وكالة التشغيل. يرجى المحاولة لاحقاً." });
      return;
    }
    req.log?.error({ err }, "Unexpected error in verify-anem");
    res.status(502).json({ error: "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى." });
  }
});

export default router;
