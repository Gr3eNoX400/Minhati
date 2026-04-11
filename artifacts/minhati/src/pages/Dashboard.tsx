import { useState, useEffect } from "react";
import type { AnemData } from "@/App";

const BASE = import.meta.env.BASE_URL;

interface DashboardProps {
  nin: string;
  nni: string;
  anemData?: AnemData | null;
  telegramLinked?: boolean;
}

type Tab = "home" | "notifications" | "profile";

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl ${className}`}>
      {children}
    </div>
  );
}

function StatusBadge({ anemData }: { anemData?: AnemData | null }) {
  if (!anemData) return null;
  const { eligible, detailsAllocation } = anemData;
  if (eligible === true && detailsAllocation?.etat === 2) {
    return (
      <div className="flex items-center gap-1.5 bg-orange-500/15 border border-orange-500/30 text-orange-400 rounded-full px-2.5 py-0.5 text-xs font-bold">
        <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
        معلقة
      </div>
    );
  }
  if (eligible === false) {
    return (
      <div className="flex items-center gap-1.5 bg-red-500/15 border border-red-500/30 text-red-400 rounded-full px-2.5 py-0.5 text-xs font-bold">
        <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
        مرفوض
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5 bg-green-500/15 border border-green-500/30 text-green-400 rounded-full px-2.5 py-0.5 text-xs font-bold">
      <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
      مؤهل
    </div>
  );
}

function StatusCard({ anemData }: { anemData?: AnemData | null }) {
  if (!anemData) return null;
  const { eligible, detailsAllocation, controls } = anemData;

  if (eligible === true && detailsAllocation?.etat === 2) {
    return (
      <GlassCard className="p-5 border-orange-500/25">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.834-1.964-.834-2.732 0L3.27 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div className="flex-1 text-right">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-orange-400/60 font-mono">SUSPENDED</span>
              <span className="text-xl font-extrabold text-orange-400">المنحة معلقة</span>
            </div>
            {detailsAllocation?.motifAr && (
              <div className="bg-orange-500/10 rounded-xl px-4 py-2.5 text-right">
                <p className="text-orange-300/70 text-xs mb-0.5">سبب التعليق</p>
                <p className="text-orange-200 text-sm font-semibold">{detailsAllocation.motifAr}</p>
              </div>
            )}
          </div>
        </div>
      </GlassCard>
    );
  }

  if (eligible === false) {
    const failed = controls?.find((c) => c.result === false);
    return (
      <GlassCard className="p-5 border-red-500/25">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <div className="flex-1 text-right">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-red-400/60 font-mono">REJECTED</span>
              <span className="text-xl font-extrabold text-destructive">ملف مرفوض</span>
            </div>
            {failed?.name && (
              <div className="bg-red-500/10 rounded-xl px-4 py-2.5">
                <p className="text-red-300/70 text-xs mb-0.5">سبب الرفض</p>
                <p className="text-red-200 text-sm font-semibold">{failed.name}</p>
              </div>
            )}
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-5 border-green-500/25">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="flex-1 text-right">
          <p className="text-xl font-extrabold text-green-400">مؤهل ومقبول</p>
          <p className="text-green-300/60 text-sm mt-0.5">ملفك مقبول ومستوفٍ لجميع الشروط</p>
        </div>
      </div>
    </GlassCard>
  );
}

function CcpCard() {
  const [ccp, setCcp] = useState(() => localStorage.getItem("minhati_ccp") ?? "");
  const [payDay, setPayDay] = useState<string | null>(null);

  const computePayDay = (val: string) => {
    const cleaned = val.replace(/\D/g, "");
    if (!cleaned) { setPayDay(null); return; }
    const last = parseInt(cleaned.slice(-1), 10);
    if ([0, 1, 2, 3].includes(last)) setPayDay("26");
    else if ([4, 5, 6].includes(last)) setPayDay("27");
    else setPayDay("28");
  };

  const handleChange = (val: string) => {
    const cleaned = val.replace(/\D/g, "").slice(0, 10);
    setCcp(cleaned);
    localStorage.setItem("minhati_ccp", cleaned);
    computePayDay(cleaned);
  };

  useEffect(() => { if (ccp) computePayDay(ccp); }, []);

  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        </div>
        <h3 className="text-sm font-bold text-foreground">معلومات الصب (CCP)</h3>
      </div>
      <div className="space-y-3">
        <div>
          <label className="block text-xs text-muted-foreground text-right mb-1.5">
            رقم الحساب البريدي — آخر 10 أرقام
          </label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={10}
            value={ccp}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="مثال: 0012345678"
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-foreground placeholder-muted-foreground/40 text-right font-mono tracking-widest text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
          />
          <p className="text-muted-foreground/50 text-xs text-right mt-1">{ccp.length}/10</p>
        </div>
        {payDay && (
          <div className="bg-primary/10 border border-primary/25 rounded-xl px-4 py-3 text-right">
            <p className="text-muted-foreground/60 text-xs mb-1">تاريخ صب منحتك المتوقع</p>
            <p className="text-primary font-extrabold text-2xl">{payDay} من كل شهر</p>
            <p className="text-muted-foreground/50 text-xs mt-1">بناءً على الرقم الأخير من حسابك البريدي</p>
          </div>
        )}
      </div>
    </GlassCard>
  );
}

function RenewButton({ nin, nni }: { nin: string; nni: string }) {
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [msg, setMsg] = useState("");

  const handle = async () => {
    if (state === "loading") return;
    setState("loading");
    setMsg("");
    try {
      const res = await fetch(`${BASE}api/anem/renew-allocation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nin, nni }),
      });
      const data = await res.json() as { success?: boolean; error?: string };
      if (res.ok && data.success) {
        setState("success");
        setMsg("تم إرسال طلب تجديد المنحة بنجاح");
      } else {
        setState("error");
        setMsg(data.error ?? "فشل الطلب. يرجى المحاولة لاحقاً.");
      }
    } catch {
      setState("error");
      setMsg("تعذر الاتصال بالخادم. يرجى المحاولة لاحقاً.");
    }
    setTimeout(() => { setState("idle"); setMsg(""); }, 6000);
  };

  return (
    <div className="flex-1">
      <button
        onClick={handle}
        disabled={state === "loading"}
        className={`w-full flex flex-col items-center justify-center gap-2 border rounded-2xl p-5 transition-all active:scale-[.97] disabled:opacity-60 ${state === "success" ? "bg-green-500/10 border-green-500/25" : state === "error" ? "bg-red-500/10 border-red-500/25" : "bg-white/5 hover:bg-white/10 border-white/10"}`}
      >
        {state === "loading" ? (
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        ) : state === "success" ? (
          <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        ) : state === "error" ? (
          <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
            </svg>
          </div>
        ) : (
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
        )}
        <span className={`text-xs font-bold text-center leading-tight ${state === "success" ? "text-green-400" : state === "error" ? "text-destructive" : "text-foreground"}`}>
          {state === "loading" ? "جاري الإرسال..." : state === "success" ? "تم الإرسال!" : state === "error" ? "فشل الطلب" : "تجديد المنحة"}
        </span>
      </button>
      {msg && (
        <p className={`text-xs mt-2 text-center leading-tight ${state === "success" ? "text-green-400/80" : "text-destructive/80"}`}>{msg}</p>
      )}
    </div>
  );
}

function UpdatePhoneButton({ nin, nni }: { nin: string; nni: string }) {
  const [state, setState] = useState<"idle" | "input" | "loading" | "success" | "error">("idle");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [msg, setMsg] = useState("");

  const startInput = () => { setState("input"); setPhone(""); setPhoneError(""); setMsg(""); };

  const submit = async () => {
    if (!/^(05|06|07)\d{8}$/.test(phone)) {
      setPhoneError("يجب أن يبدأ بـ 05/06/07 ويتكون من 10 أرقام");
      return;
    }
    setState("loading");
    try {
      const res = await fetch(`${BASE}api/anem/update-phone`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nin, nni, phone }),
      });
      const data = await res.json() as { success?: boolean; error?: string };
      if (res.ok && data.success) {
        setState("success");
        setMsg("تم تحديث رقم الهاتف بنجاح");
      } else {
        setState("error");
        setMsg(data.error ?? "فشل الطلب. يرجى المحاولة لاحقاً.");
      }
    } catch {
      setState("error");
      setMsg("تعذر الاتصال بالخادم.");
    }
    setTimeout(() => { setState("idle"); setPhone(""); setMsg(""); }, 6000);
  };

  if (state === "input") {
    return (
      <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
        <p className="text-right text-sm font-bold text-foreground">رقم الهاتف الجديد</p>
        <input
          type="tel"
          inputMode="numeric"
          maxLength={10}
          value={phone}
          onChange={(e) => { setPhone(e.target.value.replace(/\D/g, "")); setPhoneError(""); }}
          placeholder="05xxxxxxxx"
          className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-foreground text-center font-mono tracking-widest text-base focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        {phoneError && <p className="text-destructive text-xs text-center">{phoneError}</p>}
        <div className="flex gap-2">
          <button onClick={() => setState("idle")} className="flex-1 py-2 rounded-xl border border-white/10 text-muted-foreground text-xs font-semibold hover:bg-white/5 transition-all">إلغاء</button>
          <button onClick={submit} className="flex-1 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition-all">تأكيد</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <button
        onClick={state === "idle" ? startInput : undefined}
        disabled={state === "loading"}
        className={`w-full flex flex-col items-center justify-center gap-2 border rounded-2xl p-5 transition-all active:scale-[.97] disabled:opacity-60 ${state === "success" ? "bg-green-500/10 border-green-500/25" : state === "error" ? "bg-red-500/10 border-red-500/25" : "bg-white/5 hover:bg-white/10 border-white/10"}`}
      >
        {state === "loading" ? (
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        ) : state === "success" ? (
          <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        ) : state === "error" ? (
          <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
            </svg>
          </div>
        ) : (
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
        )}
        <span className={`text-xs font-bold text-center leading-tight ${state === "success" ? "text-green-400" : state === "error" ? "text-destructive" : "text-foreground"}`}>
          {state === "loading" ? "جاري التحديث..." : state === "success" ? "تم التحديث!" : state === "error" ? "فشل الطلب" : "تغيير رقم الهاتف"}
        </span>
      </button>
      {msg && (
        <p className={`text-xs mt-2 text-center leading-tight ${state === "success" ? "text-green-400/80" : "text-destructive/80"}`}>{msg}</p>
      )}
    </div>
  );
}

function NotifyToggle({ nin, telegramLinked }: { nin: string; telegramLinked?: boolean }) {
  const [enabled, setEnabled] = useState(() => localStorage.getItem("minhati_notify") === "true");
  const [sending, setSending] = useState(false);

  const toggle = async () => {
    if (!telegramLinked) return;
    const next = !enabled;
    setEnabled(next);
    localStorage.setItem("minhati_notify", next ? "true" : "false");

    if (next) {
      setSending(true);
      try {
        await fetch(`${BASE}api/auth/notify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nin, message: `تنبيه: تم تفعيل مراقبة حالة منحتك — NIN: ${nin.slice(0, 4)}****${nin.slice(14)}` }),
        });
      } catch { /* silent */ } finally { setSending(false); }
    }
  };

  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between">
        <button
          onClick={toggle}
          disabled={!telegramLinked || sending}
          className={`relative w-12 h-6 rounded-full transition-all duration-300 focus:outline-none disabled:opacity-40 ${enabled ? "bg-primary" : "bg-white/15"}`}
          aria-label="تبديل التنبيهات"
        >
          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${enabled ? "right-1" : "left-1"}`} />
        </button>
        <div className="text-right">
          <p className="text-sm font-bold text-foreground">تنبيهات تيليغرام</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {telegramLinked
              ? (enabled ? "مفعّل — ستتلقى إشعارات فورية" : "اضغط لتفعيل الإشعارات")
              : "يجب ربط تيليغرام أولاً من الشاشة السابقة"}
          </p>
        </div>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${enabled ? "bg-[#2ca5e0]/20" : "bg-white/5"}`}>
          {sending
            ? <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            : (
              <svg viewBox="0 0 24 24" className={`w-5 h-5 ${enabled ? "text-[#2ca5e0]" : "text-muted-foreground/40"}`} fill="currentColor">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
            )}
        </div>
      </div>
    </GlassCard>
  );
}

function ControlsList({ controls }: { controls?: Array<{ name?: string; result?: boolean }> }) {
  if (!controls?.length) return null;
  return (
    <GlassCard className="overflow-hidden">
      <div className="px-5 pt-4 pb-2 flex items-center justify-between">
        <span className="text-xs text-muted-foreground/60">نتائج المراقبة</span>
        <span className="text-sm font-bold text-foreground">نقاط التحقق</span>
      </div>
      {controls.map((c, i) => (
        <div key={i} className={`flex items-center justify-between px-5 py-3 border-t border-white/5 ${c.result === false ? "bg-red-500/5" : ""}`}>
          <div className="flex-shrink-0">
            {c.result === true
              ? <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              : <div className="w-6 h-6 rounded-full bg-destructive/20 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
            }
          </div>
          <span className={`text-sm ${c.result === false ? "text-destructive font-medium" : "text-foreground"}`}>
            {c.name ?? `نقطة ${i + 1}`}
          </span>
        </div>
      ))}
    </GlassCard>
  );
}

export default function Dashboard({ nin, nni, anemData, telegramLinked }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const details = anemData?.detailsAllocation;
  const fullName = [details?.prenomAr, details?.nomAr].filter(Boolean).join(" ") || "مستخدم";
  const maskedNin = nin ? `${nin.slice(0, 4)} **** **** ${nin.slice(14)}` : "";

  const handleLogout = () => {
    ["minhati_nin","minhati_nni","minhati_verified","minhati_anem_data","minhati_notify","minhati_ccp"].forEach(k => localStorage.removeItem(k));
    window.location.reload();
  };

  const navItems: { key: Tab; label: string; icon: React.ReactNode }[] = [
    {
      key: "home", label: "الرئيسية",
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
    },
    {
      key: "notifications", label: "التنبيهات",
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>,
    },
    {
      key: "profile", label: "الملف الشخصي",
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-15%] right-[-10%] w-96 h-96 bg-primary/8 rounded-full blur-3xl" />
        <div className="absolute bottom-[5%] left-[-5%] w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <header className="relative z-20">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={handleLogout} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all" title="تسجيل الخروج">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <StatusBadge anemData={anemData} />
            <span className="text-xl font-extrabold text-primary">منهاتي</span>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-28 relative z-10">
        <div className="max-w-lg mx-auto px-4 space-y-4 py-2">

          {activeTab === "home" && (
            <>
              <GlassCard className="p-5">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground/50">
                    {telegramLinked
                      ? <span className="flex items-center gap-1.5 text-green-400"><div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />تيليغرام مفعّل</span>
                      : "بدون تنبيهات"}
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-extrabold text-foreground">{fullName}</p>
                    {details?.intituleAlemAr && <p className="text-muted-foreground text-sm mt-0.5">{details.intituleAlemAr}</p>}
                    {maskedNin && <p className="text-muted-foreground/40 text-xs font-mono mt-1">{maskedNin}</p>}
                  </div>
                </div>
              </GlassCard>

              <div>
                <p className="text-xs text-muted-foreground/60 text-right mb-2 px-1">حالة الملف</p>
                <StatusCard anemData={anemData} />
              </div>

              <NotifyToggle nin={nin} telegramLinked={telegramLinked} />

              <div>
                <p className="text-xs text-muted-foreground/60 text-right mb-2 px-1">الإجراءات</p>
                <div className="flex gap-3">
                  <RenewButton nin={nin} nni={nni} />
                  <UpdatePhoneButton nin={nin} nni={nni} />
                </div>
              </div>

              <ControlsList controls={anemData?.controls} />
            </>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-4">
              <GlassCard className="p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-muted-foreground/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <p className="text-foreground font-bold mb-1">لا توجد إشعارات جديدة</p>
                <p className="text-muted-foreground/50 text-sm leading-relaxed">ستظهر هنا الإشعارات الواردة من تيليغرام وتحديثات الملف</p>
              </GlassCard>
              {telegramLinked ? (
                <GlassCard className="p-5">
                  <div className="flex items-start gap-3 text-right">
                    <div className="w-9 h-9 rounded-xl bg-[#2ca5e0]/15 flex items-center justify-center flex-shrink-0">
                      <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#2ca5e0]" fill="currentColor">
                        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">@Minhatiibot مرتبط</p>
                      <p className="text-xs text-muted-foreground/60 mt-0.5 leading-relaxed">ستصلك الإشعارات مباشرةً على تيليغرام عند أي تغيير في حالة ملفك</p>
                    </div>
                  </div>
                </GlassCard>
              ) : (
                <GlassCard className="p-5 border-primary/15">
                  <div className="text-right space-y-2">
                    <p className="text-sm font-bold text-foreground">لم يتم ربط تيليغرام</p>
                    <p className="text-xs text-muted-foreground/60 leading-relaxed">لتفعيل الإشعارات، قم بتسجيل الخروج وإعادة الدخول مع إتمام خطوة ربط تيليغرام</p>
                  </div>
                </GlassCard>
              )}
            </div>
          )}

          {activeTab === "profile" && (
            <div className="space-y-4">
              <GlassCard className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/15 border border-primary/20 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-extrabold text-foreground">{fullName}</p>
                    <StatusBadge anemData={anemData} />
                  </div>
                </div>
                <div className="space-y-3 pt-3 border-t border-white/10">
                  {details?.intituleAlemAr && (
                    <div className="flex items-center justify-between">
                      <span className="text-foreground text-sm font-medium">{details.intituleAlemAr}</span>
                      <span className="text-muted-foreground/60 text-xs">الوكالة</span>
                    </div>
                  )}
                  {maskedNin && (
                    <div className="flex items-center justify-between">
                      <span className="text-foreground text-sm font-mono">{maskedNin}</span>
                      <span className="text-muted-foreground/60 text-xs">رقم NIN</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-semibold ${telegramLinked ? "text-green-400" : "text-muted-foreground/60"}`}>
                      {telegramLinked ? "مرتبط ✓" : "غير مرتبط"}
                    </span>
                    <span className="text-muted-foreground/60 text-xs">تيليغرام</span>
                  </div>
                </div>
              </GlassCard>

              <CcpCard />

              <GlassCard className="p-5 border-destructive/15">
                <div className="flex items-center justify-between">
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 rounded-xl bg-destructive/10 border border-destructive/25 text-destructive text-sm font-bold hover:bg-destructive/20 transition-all"
                  >
                    تسجيل الخروج
                  </button>
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">تسجيل الخروج</p>
                    <p className="text-xs text-muted-foreground/60">مسح جميع البيانات المحلية</p>
                  </div>
                </div>
              </GlassCard>
            </div>
          )}
        </div>
      </main>

      <nav className="fixed bottom-0 inset-x-0 z-30">
        <div className="bg-background/85 backdrop-blur-xl border-t border-white/10 max-w-lg mx-auto">
          <div className="flex items-center">
            {navItems.map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex-1 flex flex-col items-center gap-1 py-3.5 transition-all ${activeTab === key ? "text-primary" : "text-muted-foreground/50 hover:text-muted-foreground"}`}
              >
                <div className={`transition-transform ${activeTab === key ? "scale-110" : ""}`}>{icon}</div>
                <span className="text-xs font-semibold leading-tight text-center">{label}</span>
                {activeTab === key && <div className="w-1 h-1 rounded-full bg-primary" />}
              </button>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
}
