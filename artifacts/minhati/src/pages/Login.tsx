import { useState } from "react";

const BASE = import.meta.env.BASE_URL;

const MOCK_ANEM_DATA = {
  eligible: true,
  validInput: true,
  demandeurId: 99999,
  detailsAllocation: {
    nomAr: "قرطوفة",
    prenomAr: "جمال الدين",
    intituleAlemAr: "وكالة التشغيل - وهران",
    etat: 1,
    motifAr: null,
  },
  controls: [
    { name: "التسجيل في وكالة التشغيل", result: true },
    { name: "عدم وجود نشاط مهني", result: true },
    { name: "صلاحية الوثائق", result: true },
    { name: "الاستحقاق الزمني", result: true },
  ],
};

interface AnemData {
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
  const [loading, setLoading] = useState(false);
  const [showMock, setShowMock] = useState(false);
  const [apiDetails, setApiDetails] = useState<string | null>(null);

  const validateAndSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let valid = true;

    setNinError("");
    setNniError("");
    setApiError("");
    setApiDetails(null);

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

        if (data.code === "TIMEOUT" || data.code === "CONNECTION_FAILED") {
          setShowMock(true);
          setApiDetails(`رمز الخطأ: ${data.code ?? "UNKNOWN"}`);
        }
        return;
      }

      localStorage.setItem("minhati_nin", nin);
      localStorage.setItem("minhati_nni", nni);
      localStorage.setItem("minhati_anem_data", JSON.stringify(data.data ?? {}));

      onLogin(nin, nni, data.data ?? {});
    } catch {
      setApiError("تعذر الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت.");
      setShowMock(true);
    } finally {
      setLoading(false);
    }
  };

  const handleMockLogin = () => {
    const mockNin = nin || "000000000000000001";
    const mockNni = nni || "MOCK-NNI";
    localStorage.setItem("minhati_nin", mockNin);
    localStorage.setItem("minhati_nni", mockNni);
    localStorage.setItem("minhati_anem_data", JSON.stringify(MOCK_ANEM_DATA));
    onLogin(mockNin, mockNni, MOCK_ANEM_DATA);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-primary/10">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">مرحباً بك في</h1>
          <h2 className="text-4xl font-extrabold text-primary tracking-wide">منهاتي</h2>
          <p className="text-muted-foreground mt-3 text-sm">سجّل دخولك لمتابعة ملفك الوظيفي</p>
        </div>

        <div className="bg-card border border-card-border rounded-xl p-8 shadow-xl">
          <form onSubmit={validateAndSubmit} className="space-y-6" noValidate>

            {apiError && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 text-right space-y-2">
                <div className="flex items-start gap-3">
                  <p className="text-destructive text-sm font-medium leading-relaxed flex-1">{apiError}</p>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                {apiDetails && (
                  <p className="text-muted-foreground text-xs font-mono text-right">{apiDetails}</p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-foreground" htmlFor="nin">
                رقم التعريف الوطني (NIN)
              </label>
              <input
                id="nin"
                type="text"
                inputMode="numeric"
                pattern="\d{18}"
                maxLength={18}
                value={nin}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  setNin(val);
                  if (ninError) setNinError("");
                  if (apiError) { setApiError(""); setShowMock(false); setApiDetails(null); }
                }}
                placeholder="أدخل 18 رقماً"
                className={`w-full px-4 py-3 rounded-lg bg-background border text-foreground placeholder-muted-foreground text-right font-mono text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-150 ${
                  ninError ? "border-destructive focus:ring-destructive" : "border-input"
                }`}
              />
              {ninError && (
                <p className="text-destructive text-sm font-medium text-right">{ninError}</p>
              )}
              <p className="text-muted-foreground text-xs text-right">{nin.length}/18 رقم</p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-foreground" htmlFor="nni">
                رقم الوسيط (NNI / Wassit)
              </label>
              <input
                id="nni"
                type="text"
                value={nni}
                onChange={(e) => {
                  setNni(e.target.value);
                  if (nniError) setNniError("");
                  if (apiError) { setApiError(""); setShowMock(false); setApiDetails(null); }
                }}
                placeholder="أدخل رقم الوسيط"
                className={`w-full px-4 py-3 rounded-lg bg-background border text-foreground placeholder-muted-foreground text-right focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-150 ${
                  nniError ? "border-destructive focus:ring-destructive" : "border-input"
                }`}
              />
              {nniError && (
                <p className="text-destructive text-sm font-medium text-right">{nniError}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 bg-primary text-primary-foreground font-bold text-lg rounded-lg hover:opacity-90 active:opacity-80 transition-all duration-150 shadow-lg shadow-primary/30 mt-2 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  جاري التحقق من البيانات...
                </>
              ) : (
                "تسجيل الدخول"
              )}
            </button>
          </form>

          {showMock && (
            <div className="mt-5 pt-5 border-t border-border">
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 text-right mb-3">
                <p className="text-amber-400 text-xs font-mono mb-1">وضع المطوّر — DEV MODE</p>
                <p className="text-amber-300/80 text-xs leading-relaxed">
                  خادم وكالة التشغيل لا يمكن الوصول إليه من هذه البيئة (IP Blocked / Timeout). يمكنك استخدام البيانات التجريبية لمتابعة الاختبار.
                </p>
              </div>
              <button
                onClick={handleMockLogin}
                className="w-full py-3 px-6 bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold rounded-lg hover:bg-amber-500/30 transition-all duration-150 flex items-center justify-center gap-2 text-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                دخول تجريبي — قرطوفة جمال الدين
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-muted-foreground text-xs mt-6">
          هذه الأداة غير رسمية — للمساعدة في متابعة ملفك الوظيفي فقط
        </p>
      </div>
    </div>
  );
}
