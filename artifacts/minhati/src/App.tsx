import { useState, useEffect, useCallback } from "react";
import DisclaimerModal from "@/pages/DisclaimerModal";
import Login from "@/pages/Login";
import TelegramVerification from "@/pages/TelegramVerification";
import Dashboard from "@/pages/Dashboard";
import AdminPanel from "@/pages/AdminPanel";

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

type AppScreen = "disclaimer" | "login" | "telegram" | "dashboard" | "admin";

function App() {
  const [screen, setScreen] = useState<AppScreen>("disclaimer");
  const [nin, setNin] = useState("");
  const [nni, setNni] = useState("");
  const [anemData, setAnemData] = useState<AnemData | null>(null);
  const [telegramLinked, setTelegramLinked] = useState(false);

  const loadSavedState = useCallback(() => {
    const savedNin = localStorage.getItem("minhati_nin");
    const savedNni = localStorage.getItem("minhati_nni");
    const verified = localStorage.getItem("minhati_verified");
    const rawAnem = localStorage.getItem("minhati_anem_data");
    const savedAnem: AnemData | null = rawAnem ? (JSON.parse(rawAnem) as AnemData) : null;

    if (savedNin) setNin(savedNin);
    if (savedNni) setNni(savedNni);
    if (savedAnem) setAnemData(savedAnem);

    return { savedNin, verified, savedAnem };
  }, []);

  useEffect(() => {
    if (window.location.hash === "#admin") {
      setScreen("admin");
      return;
    }

    const disclaimerAccepted = localStorage.getItem("minhati_disclaimer_accepted");
    if (!disclaimerAccepted) {
      setScreen("disclaimer");
      return;
    }

    const { savedNin, verified, savedAnem } = loadSavedState();

    if (verified === "telegram" && savedNin) {
      setTelegramLinked(true);
      setScreen("dashboard");
      return;
    }

    if (verified === "skipped" && savedNin) {
      setTelegramLinked(false);
      setScreen("dashboard");
      return;
    }

    if (savedNin && savedAnem) {
      setScreen("telegram");
      return;
    }

    setScreen("login");
  }, [loadSavedState]);

  const handleDisclaimerAccepted = useCallback(() => {
    const { savedNin, verified, savedAnem } = loadSavedState();

    if (verified === "telegram" && savedNin) {
      setTelegramLinked(true);
      setScreen("dashboard");
    } else if (verified === "skipped" && savedNin) {
      setTelegramLinked(false);
      setScreen("dashboard");
    } else if (savedNin && savedAnem) {
      setScreen("telegram");
    } else {
      setScreen("login");
    }
  }, [loadSavedState]);

  const handleLogin = useCallback((loginNin: string, loginNni: string, data: AnemData) => {
    setNin(loginNin);
    setNni(loginNni);
    setAnemData(data);
    setScreen("telegram");
  }, []);

  const handleVerified = useCallback(() => {
    localStorage.setItem("minhati_verified", "telegram");
    setTelegramLinked(true);
    setScreen("dashboard");
  }, []);

  const handleSkip = useCallback(() => {
    localStorage.setItem("minhati_verified", "skipped");
    setTelegramLinked(false);
    setScreen("dashboard");
  }, []);

  return (
    <div className="min-h-screen bg-background" dir="rtl" lang="ar">
      {screen === "disclaimer" && <DisclaimerModal onAccept={handleDisclaimerAccepted} />}
      {screen === "login" && <Login onLogin={handleLogin} />}
      {screen === "telegram" && nin && (
        <TelegramVerification nin={nin} nni={nni} onVerified={handleVerified} onSkip={handleSkip} />
      )}
      {screen === "dashboard" && <Dashboard nin={nin} nni={nni} anemData={anemData} telegramLinked={telegramLinked} />}
      {screen === "admin" && <AdminPanel />}
    </div>
  );
}

export default App;
