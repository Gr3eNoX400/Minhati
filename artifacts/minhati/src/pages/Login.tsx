import { useState } from "react";

const BASE = import.meta.env.BASE_URL;

export const GARTOUFA_DATA = {
  eligible: true,
  validInput: true,
  demandeurId: 109991165003180008,
  detailsAllocation: {
    nomAr: "قرطوفة",
    prenomAr: "جمال الدين",
    intituleAlemAr: "الوكالة المحلية راس الواد",
    etat: 2,
    motifAr: "الغياب في التكوين",
  },
  controls: [
    { name: "التسجيل في وكالة التشغيل", result: true },
    { name: "عدم وجود نشاط مهني", result: true },
    { name: "صلاحية الوثائق", result: true },
    { name: "الحضور في التكوين", result: false },
  ],
};

export interface AnemData {
  eligible?: boolean;
  detailsAllocation?: {
    nomAr?: string;
    prenomAr?: string;
    intituleAlemAr?: string;
    etat?: number;
    motifAr?: string | null;
  };
  controls?: Array<{ name?: string; result?: boolean }>;
  [key: string]: unknown;
}

interface LoginProps {
  onLogin: (nin: string, nni: string, anemData: AnemData) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [nin, setNin] = useState("");
  const [nni, setNni] = useState("");
  const [ninError, setNinError] = useState("");
  const [nniError, setNniError] = useState("");
  const [apiError, setApiError] = useState("");
  const [apiDetails, setApiDetails] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleMockLogin = () => {
    const mockNin = "109991165003180008";
    const mockNni = "MOCK-NNI";
    localStorage.setItem("minhati_nin", mockNin);
    localStorage.setItem("minhati_nni", mockNni);
    localStorage.setItem("minhati_anem_data", JSON.stringify(GARTOUFA_DATA));
    onLogin(mockNin, mockNni, GARTOUFA_DATA);
  };

  const validateAndSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let valid = true;

    setNinError("");
    setNniError("");
    setApiError("");
    setApiDetails(null);
    setShowPreview(false);

    if (!/^\d{18}$/.test(nin)) {
      setNinError("رقم التعريف الوطني يجب أن يتكون من 18 رقماً بالضبط");
      valid = false;
    }
    if (!nni.trim()) {
      setNniError("رقم الوسيط مطلوب");
      valid = false;
    }
    if (!valid) return;

    setLoading(true);
    try {
      const res = await fetch(`${BASE}api/verify-anem`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nin, nni }),
      });

      const data = await res.json() as {
        valid?: boolean;
        data?: AnemData;
        error?: string;
        code?: string;
      };

      if (!res.ok || !data.valid) {
        const msg = data.error ?? "المعلومات المدخلة غير صحيحة أو غير مسجلة في وكالة التشغيل";
        setApiError(msg);
        if (data.code === "TIMEOUT" || data.code === "CONNECTION_FAILED" || res.status >= 500) {
          setShowPreview(true);
          setApiDetails(`رمز الخطأ: ${data.code ?? "SERVER_ERROR"}`);
        }
        return;
      }

      localStorage.setItem("minhati_nin", nin);
      localStorage.setItem("minhati_nni", nni);
      localStorage.setItem("minhati_anem_data", JSON.stringify(data.data ?? {}));
      onLogin(nin, nni, data.data ?? {});
    } catch {
      setApiError("تعذر الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت.");
      setShowPreview(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-5%] w-64 h-64 bg-primary/5 rounded-full blur-2xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/10 backdrop-blur-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-4xl font-extrabold text-primary tracking-wide">منهاتي</h2>
          <p className="text-muted-foreground mt-2 text-sm">متابعة ملف التشغيل الوطني</p>
        </div>

        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-7 shadow-2xl">
          <h3 className="text-lg font-bold text-foreground mb-5 text-right">تسجيل الدخول</h3>

          <form onSubmit={validateAndSubmit} className="space-y-5" noValidate>
            {apiError && (
              <div className="bg-destructive/10 border border-destructive/25 rounded-xl p-4 text-right space-y-1">
                <p className="text-destructive text-sm font-medium leading-relaxed">{apiError}</p>
                {apiDetails && <p className="text-muted-foreground text-xs font-mono">{apiDetails}</p>}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-foreground/90 text-right" htmlFor="nin">
                رقم التعريف الوطني (NIN)
              </label>
              <input
                id="nin"
                type="text"
                inputMode="numeric"
                maxLength={18}
                value={nin}
                onChange={(e) => {
                  setNin(e.target.value.replace(/\D/g, ""));
                  setNinError("");
                  if (apiError) { setApiError(""); setShowPreview(false); setApiDetails(null); }
                }}
                placeholder="أدخل 18 رقماً"
                className={`w-full px-4 py-3 rounded-xl bg-white/5 border text-foreground placeholder-muted-foreground/50 text-right font-mono text-base tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${ninError ? "border-destructive/50" : "border-white/15"}`}
              />
              <div className="flex items-center justify-between">
                {ninError
                  ? <p className="text-destructive text-xs">{ninError}</p>
                  : <span />}
                <p className="text-muted-foreground/60 text-xs">{nin.length}/18</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-foreground/90 text-right" htmlFor="nni">
                رقم الوسيط (NNI / Wassit)
              </label>
              <input
                id="nni"
                type="text"
                value={nni}
                onChange={(e) => {
                  setNni(e.target.value);
                  setNniError("");
                  if (apiError) { setApiError(""); setShowPreview(false); setApiDetails(null); }
                }}
                placeholder="أدخل رقم الوسيط"
                className={`w-full px-4 py-3 rounded-xl bg-white/5 border text-foreground placeholder-muted-foreground/50 text-right focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${nniError ? "border-destructive/50" : "border-white/15"}`}
              />
              {nniError && <p className="text-destructive text-xs text-right">{nniError}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 bg-primary text-primary-foreground font-bold text-base rounded-xl hover:opacity-90 active:scale-[.98] transition-all shadow-lg shadow-primary/25 disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  جاري التحقق من البيانات...
                </>
              ) : "تسجيل الدخول"}
            </button>
          </form>

          {showPreview && (
            <div className="mt-5 pt-5 border-t border-white/10 space-y-3">
              <div className="bg-amber-500/10 border border-amber-500/25 rounded-xl p-3 text-right">
                <p className="text-amber-400 text-xs font-bold mb-1">⚠️ وضع المعاينة</p>
                <p className="text-amber-300/70 text-xs leading-relaxed">
                  خادم وكالة التشغيل غير متاح من هذه البيئة. استخدم البيانات التجريبية للمعاينة.
                </p>
              </div>
              <button
                onClick={handleMockLogin}
                className="w-full py-3 px-5 bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold rounded-xl hover:bg-amber-500/25 transition-all text-sm flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                الدخول بوضع المعاينة — قرطوفة جمال الدين
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-muted-foreground/50 text-xs mt-5">
          أداة مساعدة غير رسمية · للمتابعة فقط
        </p>
      </div>
    </div>
  );
}
