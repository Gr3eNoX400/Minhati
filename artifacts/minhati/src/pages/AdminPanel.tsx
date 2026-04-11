import { useState, useEffect, useCallback } from "react";

const BASE = import.meta.env.BASE_URL;

interface Stats {
  totalVerified: number;
  telegramLinked: number;
  uptime: number;
  memoryMB: number;
  nodeVersion: string;
  timestamp: string;
}

interface UserRow {
  nin: string;
  nni: string | null;
  telegramLinked: boolean;
  registeredAt: string;
}

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const parts = [];
  if (d > 0) parts.push(`${d}ي`);
  if (h > 0) parts.push(`${h}س`);
  parts.push(`${m}د`);
  return parts.join(" ");
}

export default function AdminPanel() {
  const [token, setToken] = useState(() => localStorage.getItem("minhati_admin_token") ?? "");
  const [authed, setAuthed] = useState(false);
  const [tokenInput, setTokenInput] = useState("");
  const [authError, setAuthError] = useState("");
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchData = useCallback(async (t: string) => {
    setLoading(true);
    try {
      const [statsRes, usersRes] = await Promise.all([
        fetch(`${BASE}api/admin/stats`, { headers: { "x-admin-token": t } }),
        fetch(`${BASE}api/admin/users`, { headers: { "x-admin-token": t } }),
      ]);

      if (statsRes.status === 401) {
        setAuthed(false);
        setAuthError("رمز الوصول غير صحيح");
        localStorage.removeItem("minhati_admin_token");
        return;
      }

      if (statsRes.ok && usersRes.ok) {
        const s = await statsRes.json() as Stats;
        const u = await usersRes.json() as { users: UserRow[] };
        setStats(s);
        setUsers(u.users);
        setLastRefresh(new Date());
        setAuthed(true);
      }
    } catch {
      setAuthError("تعذر الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      void fetchData(token);
    }
  }, [token, fetchData]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    if (!tokenInput.trim()) return;
    localStorage.setItem("minhati_admin_token", tokenInput.trim());
    setToken(tokenInput.trim());
  };

  const handleRefresh = () => { void fetchData(token); };

  const handleLogout = () => {
    localStorage.removeItem("minhati_admin_token");
    setToken("");
    setAuthed(false);
    setStats(null);
    setUsers([]);
  };

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden" dir="rtl">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[20%] w-80 h-80 bg-primary/8 rounded-full blur-3xl" />
        </div>
        <div className="w-full max-w-sm relative z-10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h1 className="text-2xl font-extrabold text-foreground">لوحة الإدارة</h1>
            <p className="text-muted-foreground text-sm mt-1">منهاتي — Admin Dashboard</p>
          </div>
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
            <form onSubmit={handleAuth} className="space-y-4">
              {authError && (
                <div className="bg-destructive/10 border border-destructive/25 rounded-xl p-3 text-right">
                  <p className="text-destructive text-sm">{authError}</p>
                </div>
              )}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-foreground/90 text-right">رمز الوصول (Admin Token)</label>
                <input
                  type="password"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="أدخل رمز الوصول"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-foreground placeholder-muted-foreground/40 text-right focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-mono"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 transition-all"
              >
                دخول
              </button>
            </form>
            <p className="text-center text-muted-foreground/40 text-xs mt-4">
              الرمز الافتراضي: <span className="font-mono">minhati-admin-2024</span>
            </p>
          </div>
          <div className="text-center mt-4">
            <a href="/" className="text-muted-foreground/50 text-xs hover:text-muted-foreground transition-colors">← العودة للتطبيق</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden" dir="rtl">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-72 h-72 bg-primary/8 rounded-full blur-3xl" />
      </div>

      <header className="relative z-20 border-b border-white/10 bg-white/5 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={handleLogout} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-muted-foreground text-xs hover:bg-white/10 transition-all">تسجيل الخروج</button>
            <button onClick={handleRefresh} disabled={loading} className="px-3 py-1.5 rounded-lg bg-primary/15 border border-primary/25 text-primary text-xs font-semibold hover:bg-primary/25 transition-all disabled:opacity-50 flex items-center gap-1.5">
              {loading && <div className="w-3 h-3 border border-primary/40 border-t-primary rounded-full animate-spin" />}
              تحديث
            </button>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-foreground font-bold">لوحة الإدارة — منهاتي</span>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto px-4 py-6 space-y-6">
        {lastRefresh && (
          <p className="text-muted-foreground/50 text-xs text-left">
            آخر تحديث: {lastRefresh.toLocaleTimeString("ar-DZ")}
          </p>
        )}

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "إجمالي المستخدمين", value: stats.totalVerified, color: "text-primary", icon: "👥" },
              { label: "مرتبطين بتيليغرام", value: stats.telegramLinked, color: "text-[#2ca5e0]", icon: "💬" },
              { label: "وقت التشغيل", value: formatUptime(stats.uptime), color: "text-green-400", icon: "⏱" },
              { label: "الذاكرة المستخدمة", value: `${stats.memoryMB} MB`, color: "text-orange-400", icon: "🧠" },
            ].map((item, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-right">
                <div className="text-2xl mb-2">{item.icon}</div>
                <p className={`text-2xl font-extrabold ${item.color}`}>{item.value}</p>
                <p className="text-muted-foreground/60 text-xs mt-1">{item.label}</p>
              </div>
            ))}
          </div>
        )}

        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
            <span className="text-muted-foreground/60 text-sm">{users.length} مستخدم</span>
            <span className="text-foreground font-bold">المستخدمون المسجلون</span>
          </div>

          {users.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-muted-foreground/50 text-sm">لا يوجد مستخدمون مسجلون بعد</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="px-5 py-3 text-muted-foreground/60 font-medium text-xs">تاريخ التسجيل</th>
                    <th className="px-5 py-3 text-muted-foreground/60 font-medium text-xs">تيليغرام</th>
                    <th className="px-5 py-3 text-muted-foreground/60 font-medium text-xs">NNI</th>
                    <th className="px-5 py-3 text-muted-foreground/60 font-medium text-xs">NIN</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={i} className={`border-b border-white/5 ${i % 2 === 0 ? "" : "bg-white/[0.02]"}`}>
                      <td className="px-5 py-3 text-muted-foreground/60 text-xs">
                        {new Date(u.registeredAt).toLocaleDateString("ar-DZ")}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-bold ${u.telegramLinked ? "text-[#2ca5e0]" : "text-muted-foreground/40"}`}>
                          {u.telegramLinked ? "✓ مرتبط" : "—"}
                        </span>
                      </td>
                      <td className="px-5 py-3 font-mono text-muted-foreground/60 text-xs">{u.nni ?? "—"}</td>
                      <td className="px-5 py-3 font-mono text-foreground text-xs">{u.nin}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {stats && (
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 text-right space-y-2">
            <p className="text-sm font-bold text-foreground mb-3">معلومات النظام</p>
            {[
              { label: "إصدار Node.js", value: stats.nodeVersion },
              { label: "وقت الخادم (UTC)", value: new Date(stats.timestamp).toLocaleString("ar-DZ") },
              { label: "بوت تيليغرام", value: "@Minhatiibot" },
            ].map((row, i) => (
              <div key={i} className="flex items-center justify-between border-t border-white/5 pt-2">
                <span className="text-foreground text-sm font-mono">{row.value}</span>
                <span className="text-muted-foreground/60 text-xs">{row.label}</span>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
