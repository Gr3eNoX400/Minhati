import { useState, useEffect, useCallback } from "react";
import DisclaimerModal from "@/pages/DisclaimerModal";
import Login from "@/pages/Login";
import TelegramVerification from "@/pages/TelegramVerification";
import Dashboard from "@/pages/Dashboard";

type AppScreen = "disclaimer" | "login" | "telegram" | "dashboard";

function App() {
  const [screen, setScreen] = useState<AppScreen>("disclaimer");
  const [nin, setNin] = useState("");
  const [nni, setNni] = useState("");

  useEffect(() => {
    const disclaimerAccepted = localStorage.getItem("minhati_disclaimer_accepted");
    const savedNin = localStorage.getItem("minhati_nin");
    const savedNni = localStorage.getItem("minhati_nni");
    const verified = localStorage.getItem("minhati_verified");

    if (!disclaimerAccepted) {
      setScreen("disclaimer");
      return;
    }

    if (verified === "true" && savedNin) {
      setNin(savedNin);
      setNni(savedNni ?? "");
      setScreen("dashboard");
      return;
    }

    if (savedNin) {
      setNin(savedNin);
      setNni(savedNni ?? "");
      setScreen("telegram");
      return;
    }

    setScreen("login");
  }, []);

  const handleDisclaimerAccepted = useCallback(() => {
    const savedNin = localStorage.getItem("minhati_nin");
    const verified = localStorage.getItem("minhati_verified");

    if (verified === "true" && savedNin) {
      setNin(savedNin);
      setNni(localStorage.getItem("minhati_nni") ?? "");
      setScreen("dashboard");
    } else if (savedNin) {
      setNin(savedNin);
      setNni(localStorage.getItem("minhati_nni") ?? "");
      setScreen("telegram");
    } else {
      setScreen("login");
    }
  }, []);

  const handleLogin = useCallback((loginNin: string, loginNni: string) => {
    setNin(loginNin);
    setNni(loginNni);
    setScreen("telegram");
  }, []);

  const handleVerified = useCallback(() => {
    localStorage.setItem("minhati_verified", "true");
    setScreen("dashboard");
  }, []);

  return (
    <div className="min-h-screen bg-background" dir="rtl" lang="ar">
      {screen === "disclaimer" && (
        <DisclaimerModal onAccept={handleDisclaimerAccepted} />
      )}

      {screen === "login" && (
        <Login onLogin={handleLogin} />
      )}

      {screen === "telegram" && nin && (
        <TelegramVerification
          nin={nin}
          nni={nni}
          onVerified={handleVerified}
        />
      )}

      {screen === "dashboard" && (
        <Dashboard nin={nin} />
      )}
    </div>
  );
}

export default App;
