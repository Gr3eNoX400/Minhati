interface DashboardProps {
  nin: string;
}

export default function Dashboard({ nin }: DashboardProps) {
  const handleLogout = () => {
    localStorage.removeItem("minhati_nin");
    localStorage.removeItem("minhati_nni");
    localStorage.removeItem("minhati_verified");
    window.location.reload();
  };

  const maskedNin = nin ? `${nin.slice(0, 4)}${"*".repeat(10)}${nin.slice(14)}` : "";

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={handleLogout}
            className="text-muted-foreground hover:text-foreground text-sm transition-colors flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            خروج
          </button>
          <div className="flex items-center gap-3">
            <span className="text-xl font-extrabold text-primary">منهاتي</span>
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full px-4 py-2 text-sm font-medium mb-6">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            التنبيهات مفعّلة عبر تيليغرام
          </div>
          <h1 className="text-4xl font-extrabold text-foreground mb-3">
            مرحباً بك في لوحة التحكم
          </h1>
          <p className="text-muted-foreground text-lg">
            ملفك الوظيفي تحت المراقبة — ستصلك تنبيهات فورية عند أي تحديث
          </p>
          {maskedNin && (
            <p className="text-muted-foreground/60 text-sm mt-2 font-mono">
              NIN: {maskedNin}
            </p>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-3 mb-10">
          {[
            {
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ),
              label: "الحالة",
              value: "مفعّل",
              color: "text-green-400",
              bg: "bg-green-500/10",
            },
            {
              icon: (
                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
              ),
              label: "تيليغرام",
              value: "مرتبط",
              color: "text-[#2ca5e0]",
              bg: "bg-[#2ca5e0]/10",
            },
            {
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              ),
              label: "التنبيهات",
              value: "نشطة",
              color: "text-primary",
              bg: "bg-primary/10",
            },
          ].map((item, i) => (
            <div key={i} className="bg-card border border-card-border rounded-xl p-6 text-right">
              <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center mb-4 mr-auto ${item.color}`}>
                {item.icon}
              </div>
              <p className="text-muted-foreground text-sm mb-1">{item.label}</p>
              <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-card border border-card-border rounded-xl p-8 text-right">
          <h2 className="text-xl font-bold text-foreground mb-2">الميزات القادمة</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            سيتم إضافة عرض تفاصيل ملف التوظيف، حالة الطلب، وتاريخ التحديثات في المراحل القادمة من تطوير التطبيق.
          </p>
        </div>
      </main>
    </div>
  );
}
