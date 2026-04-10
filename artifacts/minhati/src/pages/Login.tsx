import { useState } from "react";

interface LoginProps {
  onLogin: (nin: string, nni: string) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [nin, setNin] = useState("");
  const [nni, setNni] = useState("");
  const [ninError, setNinError] = useState("");
  const [nniError, setNniError] = useState("");

  const validateAndSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let valid = true;

    setNinError("");
    setNniError("");

    if (!/^\d{18}$/.test(nin)) {
      setNinError("رقم التعريف الوطني يجب أن يتكون من 18 رقماً بالضبط");
      valid = false;
    }

    if (!nni.trim()) {
      setNniError("رقم الوسيط مطلوب");
      valid = false;
    }

    if (valid) {
      localStorage.setItem("minhati_nin", nin);
      localStorage.setItem("minhati_nni", nni);
      onLogin(nin, nni);
    }
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
                }}
                placeholder="أدخل 18 رقماً"
                className={`w-full px-4 py-3 rounded-lg bg-background border text-foreground placeholder-muted-foreground text-right font-mono text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-150 ${
                  ninError ? "border-destructive focus:ring-destructive" : "border-input"
                }`}
              />
              {ninError && (
                <p className="text-destructive text-sm font-medium flex items-center gap-1 justify-end">
                  <span>{ninError}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </p>
              )}
              <p className="text-muted-foreground text-xs text-right">
                {nin.length}/18 رقم
              </p>
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
                }}
                placeholder="أدخل رقم الوسيط"
                className={`w-full px-4 py-3 rounded-lg bg-background border text-foreground placeholder-muted-foreground text-right focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-150 ${
                  nniError ? "border-destructive focus:ring-destructive" : "border-input"
                }`}
              />
              {nniError && (
                <p className="text-destructive text-sm font-medium flex items-center gap-1 justify-end">
                  <span>{nniError}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 px-6 bg-primary text-primary-foreground font-bold text-lg rounded-lg hover:opacity-90 active:opacity-80 transition-all duration-150 shadow-lg shadow-primary/30 mt-2"
            >
              تسجيل الدخول
            </button>
          </form>
        </div>

        <p className="text-center text-muted-foreground text-xs mt-6">
          هذه الأداة غير رسمية — للمساعدة في متابعة ملفك الوظيفي فقط
        </p>
      </div>
    </div>
  );
}
