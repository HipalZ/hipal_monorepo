import { useState, Suspense, lazy } from "react";
import Footer from "@/components/atoms/footer";
import Loader from "@/components/atoms/loader";

const Zones = lazy(() => import("@/components/templates/zone"));
const Setting = lazy(() => import("@/components/templates/setting"));
const SalesReport = lazy(() => import("@/components/templates/sales"));
const Bill = lazy(() => import("@/components/templates/bills"));

export type ICurrentView = "zone" | "sale" | "setting" | "bills";

function Start() {
  const [currentView, setCurrentView] = useState<ICurrentView>("zone");

  const renderCurrentView = () => {
    switch (currentView) {
      case "sale":
        return <SalesReport setCurrentView={setCurrentView} />;
      case "setting":
        return <Setting setCurrentView={setCurrentView} />;
      case "bills":
        return <Bill setCurrentView={setCurrentView} />;
      case "zone":
        return <Zones setCurrentView={setCurrentView} />;
      default:
        return <Zones setCurrentView={setCurrentView} />;
    }
  };

  return (
    <div>
      <Suspense fallback={<Loader />}>
        {renderCurrentView()}
      </Suspense>
      <Footer currentView={currentView} setCurrentView={setCurrentView} />
    </div>
  );
}

export default Start;
