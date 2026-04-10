import { useEffect, useState } from "react";

interface DisclaimerModalProps {
  onAccept: () => void;
}

export default function DisclaimerModal({ onAccept }: DisclaimerModalProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem("minhati_disclaimer_accepted");
    if (!accepted) {
      setVisible(true);
    } else {
      onAccept();
    }
  }, [onAccept]);

  const handleAccept = () => {
    localStorage.setItem("minhati_disclaimer_accepted", "true");
    setVisible(false);
    onAccept();
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-card border border-card-border rounded-xl shadow-2xl max-w-md w-full p-8 text-right animate-in fade-in zoom-in-95 duration-300">
        <div className="flex items-center justify-end gap-3 mb-6">
          <h2 className="text-2xl font-bold text-foreground">إخلاء المسؤولية</h2>
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        <div className="space-y-4 mb-8 text-muted-foreground leading-relaxed">
          <p className="text-base">
            هذا التطبيق هو <span className="text-primary font-semibold">أداة مساعدة غير رسمية</span> ولا ينتمي إلى أي جهة حكومية رسمية.
          </p>
          <p className="text-base">
            تهدف هذه الأداة إلى تسهيل متابعة ملف التوظيف الخاص بك عبر إشعارات تلقرام. المعلومات المقدمة هي للإطلاع فقط.
          </p>
          <p className="text-base">
            لا يتحمل المطورون أي مسؤولية عن صحة المعلومات المعروضة أو استخدامها بطريقة غير مشروعة.
          </p>
          <p className="text-sm text-muted-foreground/70 border-t border-border pt-4">
            باستمرارك في استخدام التطبيق، فأنت تقر بأنك قرأت وفهمت هذا الإخلاء وتوافق على شروطه.
          </p>
        </div>

        <button
          onClick={handleAccept}
          className="w-full py-3 px-6 bg-primary text-primary-foreground font-bold text-lg rounded-lg hover:opacity-90 active:opacity-80 transition-all duration-150 shadow-lg shadow-primary/30"
        >
          أوافق وأتابع
        </button>
      </div>
    </div>
  );
}
