import { useState } from "react";
import type { AnemData } from "@/App";

const BASE = import.meta.env.BASE_URL;

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let valid = true;
    setNinError("");
    setNniError("");
    setApiError("");

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

      const data = await res.json() as { valid?: boolean; data?: AnemData; error?: string; code?: string };

      if (!res.ok || !data.valid) {
        setApiError(data.error ?? "المعلومات المدخلة غير صحيحة أو غير مسجلة في وكالة التشغيل");
        return;
      }

      localStorage.setItem("minhati_nin", nin);
      localStorage.setItem("minhati_nni", nni);
      localStorage.setItem("minhati_anem_data", JSON.stringify(data.data ?? {}));
      onLogin(nin, nni, data.data ?? {});
    } catch {
      setApiError("تعذر الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت والمحاولة مجدداً.");
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
          <p className="text-muted-foreground mt-2 text-sm">متابعة ملف التشغيل الوطني — ANEM</p>
        </div>

        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-7 shadow-2xl">
          <h3 className="text-lg font-bold text-foreground mb-5 text-right">تسجيل الدخول</h3>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {apiError && (
              <div className="bg-destructive/10 border border-destructive/25 rounded-xl p-4 text-right">
                <p className="text-destructive text-sm font-medium leading-relaxed">{apiError}</p>
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
                  if (ninError) setNinError("");
                  if (apiError) setApiError("");
                }}
                placeholder="أدخل 18 رقماً"
                className={`w-full px-4 py-3 rounded-xl bg-white/5 border text-foreground placeholder-muted-foreground/50 text-right font-mono text-base tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${ninError ? "border-destructive/50" : "border-white/15"}`}
              />
              <div className="flex items-center justify-between">
                {ninError ? <p className="text-destructive text-xs">{ninError}</p> : <span />}
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
                  if (nniError) setNniError("");
                  if (apiError) setApiError("");
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
              ) : (
                "تسجيل الدخول والتحقق"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-muted-foreground/50 text-xs mt-5">
          أداة مساعدة غير رسمية · للمتابعة فقط · البيانات لا تُخزَّن
        </p>
      </div>
    </div>
  );
}
