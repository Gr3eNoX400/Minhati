interface DetailsAllocation {
  nomAr?: string;
  prenomAr?: string;
  intituleAlemAr?: string;
  etat?: number;
  motifAr?: string;
}

interface AnemControl {
  name?: string;
  result?: boolean;
}

interface AnemData {
  eligible?: boolean;
  detailsAllocation?: DetailsAllocation;
  controls?: AnemControl[];
  [key: string]: unknown;
}

interface DashboardProps {
  nin: string;
  anemData?: AnemData | null;
  telegramLinked?: boolean;
}

function StatusCard({ anemData }: { anemData?: AnemData | null }) {
  if (!anemData) {
    return (
      <div className="bg-card border border-card-border rounded-xl p-6 text-right">
        <p className="text-muted-foreground text-sm">لا توجد بيانات متاحة</p>
      </div>
    );
  }

  const { eligible, detailsAllocation, controls } = anemData;

  if (eligible === true && detailsAllocation?.etat === 2) {
    return (
      <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-6 text-right">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.834-1.964-.834-2.732 0L3.27 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-orange-400/70 font-mono">SUSPENDED</span>
              <span className="text-lg font-bold text-orange-400">المنحة معلقة</span>
            </div>
            {detailsAllocation?.motifAr && (
              <p className="text-orange-300/80 text-sm leading-relaxed">
                <span className="font-semibold text-orange-300">السبب: </span>
                {detailsAllocation.motifAr}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (eligible === false) {
    const failedControl = controls?.find((c) => c.result === false);
    return (
      <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-6 text-right">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-destructive/20 flex items-center justify-center flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-destructive/70 font-mono">REJECTED</span>
              <span className="text-lg font-bold text-destructive">مرفوض</span>
            </div>
            {failedControl?.name && (
              <p className="text-red-300/80 text-sm leading-relaxed">
                <span className="font-semibold text-red-300">سبب الرفض: </span>
                {failedControl.name}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (eligible === true) {
    return (
      <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 text-right">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-green-400/70 font-mono">ELIGIBLE</span>
              <span className="text-lg font-bold text-green-400">مؤهل ومقبول</span>
            </div>
            <p className="text-green-300/80 text-sm">ملفك مقبول ومستوفٍ لجميع الشروط</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-card-border rounded-xl p-6 text-right">
      <p className="text-muted-foreground text-sm">جاري تحليل البيانات...</p>
    </div>
  );
}

export default function Dashboard({ nin, anemData, telegramLinked }: DashboardProps) {
  const details = anemData?.detailsAllocation;

  const fullName = [details?.prenomAr, details?.nomAr].filter(Boolean).join(" ") || null;
  const agency = details?.intituleAlemAr || null;

  const maskedNin = nin ? `${nin.slice(0, 4)}${"*".repeat(10)}${nin.slice(14)}` : "";

  const handleLogout = () => {
    localStorage.removeItem("minhati_nin");
    localStorage.removeItem("minhati_nni");
    localStorage.removeItem("minhati_verified");
    localStorage.removeItem("minhati_anem_data");
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
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

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div className="bg-card border border-card-border rounded-xl p-6 text-right">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 flex-shrink-0">
              {telegramLinked ? (
                <div className="flex items-center gap-1.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full px-3 py-1 text-xs font-medium">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  تيليغرام مفعّل
                </div>
              ) : (
                <div className="flex items-center gap-1.5 bg-muted/50 text-muted-foreground border border-border rounded-full px-3 py-1 text-xs font-medium">
                  بدون تنبيهات
                </div>
              )}
            </div>
            <div>
              {fullName && (
                <h1 className="text-2xl font-extrabold text-foreground mb-1">{fullName}</h1>
              )}
              {!fullName && (
                <h1 className="text-2xl font-extrabold text-foreground mb-1">مرحباً بك في لوحة التحكم</h1>
              )}
              {agency && (
                <p className="text-muted-foreground text-sm">{agency}</p>
              )}
              {maskedNin && (
                <p className="text-muted-foreground/50 text-xs font-mono mt-1">NIN: {maskedNin}</p>
              )}
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 text-right">حالة الملف</h2>
          <StatusCard anemData={anemData} />
        </div>

        {anemData?.controls && anemData.controls.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground mb-3 text-right">نتائج المراقبة</h2>
            <div className="bg-card border border-card-border rounded-xl overflow-hidden">
              {(anemData.controls as AnemControl[]).map((control, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between px-5 py-3.5 text-right border-b border-border last:border-0 ${
                    control.result === false ? "bg-destructive/5" : ""
                  }`}
                >
                  <div className="flex-shrink-0">
                    {control.result === true ? (
                      <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    ) : control.result === false ? (
                      <div className="w-6 h-6 rounded-full bg-destructive/20 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-muted-foreground/50" />
                      </div>
                    )}
                  </div>
                  <span className={`text-sm ${control.result === false ? "text-destructive font-medium" : "text-foreground"}`}>
                    {control.name ?? `مراقبة ${i + 1}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-card border border-card-border rounded-xl p-5 text-right">
          <p className="text-muted-foreground text-xs leading-relaxed">
            هذه الأداة غير رسمية. البيانات مجلوبة من واجهة برمجة وكالة التشغيل مباشرةً. ستُضاف المزيد من الميزات في المراحل القادمة.
          </p>
        </div>
      </main>
    </div>
  );
}
