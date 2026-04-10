import { useEffect, useState, useCallback } from "react";

const BASE = import.meta.env.BASE_URL;

interface TelegramVerificationProps {
  nin: string;
  nni: string;
  onVerified: () => void;
}

export default function TelegramVerification({ nin, nni, onVerified }: TelegramVerificationProps) {
  const [code, setCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  const generateCode = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE}api/auth/generate-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nin, nni }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? "خطأ في الاتصال بالخادم");
      }
      const data = await res.json() as { code: string };
      setCode(data.code);
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  }, [nin, nni]);

  useEffect(() => {
    generateCode();
  }, [generateCode]);

  useEffect(() => {
    if (!code) return;

    const interval = setInterval(async () => {
      setChecking(true);
      try {
        const res = await fetch(`${BASE}api/auth/verify-status?nin=${encodeURIComponent(nin)}`);
        if (res.ok) {
          const data = await res.json() as { verified: boolean };
          if (data.verified) {
            clearInterval(interval);
            onVerified();
          }
        }
      } catch {
        // silent — keep polling
      } finally {
        setChecking(false);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [code, nin, onVerified]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-[#2ca5e0]/10 border-2 border-[#2ca5e0]/30 flex items-center justify-center mx-auto mb-5 shadow-lg">
            <svg viewBox="0 0 24 24" className="w-10 h-10 text-[#2ca5e0]" fill="currentColor">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">ربط حساب تيليغرام</h1>
          <p className="text-muted-foreground text-sm">خطوة أخيرة لتفعيل التنبيهات الآنية</p>
        </div>

        <div className="bg-card border border-card-border rounded-xl p-8 shadow-xl">
          {loading && (
            <div className="text-center py-8">
              <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">جاري إنشاء رمز التحقق...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-6">
              <p className="text-destructive mb-4">{error}</p>
              <button
                onClick={generateCode}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                إعادة المحاولة
              </button>
            </div>
          )}

          {code && !loading && (
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                  أرسل هذا الرمز إلى البوت
                  <a
                    href="https://t.me/Minhatiibot"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary font-bold mx-1 hover:underline"
                  >
                    @Minhatiibot
                  </a>
                  على تيليغرام لتفعيل التنبيهات:
                </p>

                <div className="bg-background border-2 border-primary/40 rounded-xl p-6 mb-4 relative overflow-hidden">
                  <div className="absolute inset-0 bg-primary/5" />
                  <p className="text-5xl font-mono font-extrabold text-primary tracking-[0.3em] relative">
                    {code}
                  </p>
                </div>

                <p className="text-muted-foreground text-xs">
                  هذا الرمز صالح لمدة 10 دقائق
                </p>
              </div>

              <div className="border-t border-border pt-5">
                <a
                  href="https://t.me/Minhatiibot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 w-full py-3 px-6 bg-[#2ca5e0] text-white font-bold rounded-lg hover:opacity-90 transition-opacity shadow-lg"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                  فتح تيليغرام والإرسال
                </a>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-muted-foreground text-xs">
                  {checking ? (
                    <>
                      <div className="w-3 h-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                      <span>جاري الانتظار...</span>
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span>التحقق تلقائي — لا حاجة لأي إجراء</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
