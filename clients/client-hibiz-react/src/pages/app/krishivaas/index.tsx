import { useState, useMemo, useCallback, memo } from "react";
import { FileText, BarChart2, Shuffle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import logo from "@/assets/krishivaas/logo.svg";
import krishivaasBanner from "@/assets/krishivaas/krishivaas-agri.jpg";
import WhatsApp from "@/components/krishivaas/whatsapp-interface";

const Icons = {
    Template: () => <FileText className="w-5 h-5" />,
    Analytics: () => <BarChart2 className="w-5 h-5" />,
    Flow: () => <Shuffle className="w-5 h-5" />,
};

const quickActions = [
    { key: "Template" as const, icon: Icons.Template, label: "Manage Template", color: "bg-blue-500", description: "Design engaging WhatsApp message templates" },
    { key: "Analytics" as const, icon: Icons.Analytics, label: "View Analytics", color: "bg-green-500", description: "Track performance and engagement metrics" },
    { key: "Flow" as const, icon: Icons.Flow, label: "Manage Flow", color: "bg-orange-500", description: "Build automated conversation workflows" },
];

type PanelKey = typeof quickActions[number]["key"] | null;

function TemplatePanel() {
    return (
        <WhatsApp />
    );
}
function AnalyticsPanel() {
    return (
        <WhatsApp />
    );
}
function FlowPanel() {
    return (
        <div className="rounded-xl border bg-white p-5 shadow-sm">
            <h3 className="text-xl font-semibold mb-2">Flow Designer</h3>
            <p className="text-gray-600">Build automated conversation workflows…</p>
        </div>
    );
}

const PanelByKey: Record<Exclude<PanelKey, null>, React.FC> = {
    Template: TemplatePanel,
    Analytics: AnalyticsPanel,
    Flow: FlowPanel,
};

const MemoKrishivaasDashboard: React.FC = () => {
    const memoizedQuickActions = useMemo(() => quickActions, []);
    const [active, setActive] = useState<PanelKey>(null);

    const handleQuickAction = useCallback((key: PanelKey) => {
        setActive((prev) => (prev === key ? null : key));
    }, []);

    const ActivePanel = active ? PanelByKey[active] : null;

    return (
        <section className="min-h-screen bg-[#ffefe2] p-6">
            {ActivePanel ? (
                <article className="relative">
                    <ActivePanel />
                </article>
            ) : <>
                <header className="md:flex mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <img src={logo} alt="logo" className="size-20 bg-card p-2 rounded-xl" />
                    <section className="flex-1 text-center">
                        <h2 className="inter my-2 text-4xl font-bold text-[#0c4baa]">Welcome to Lukupz</h2>
                        <p className="poppins-regular mx-auto max-w-4xl text-lg text-[#0c4baa]/70">
                            Generate WhatsApp templates, analyze campaigns, or build automated flows
                        </p>
                    </section>
                </header>
                <section className="bg-[#ffefe2]">

                    <section className="mx-auto max-w-7xl px-4 py-8 pb-[5rem] sm:px-6 lg:px-8 ">
                        <img
                            src={krishivaasBanner}
                            alt="krishivaasBanner"
                            className="h-72 w-full rounded-xl object-cover object-top"
                        />

                        <article className="my-12 grid grid-cols-1 gap-6 md:grid-cols-3">
                            {memoizedQuickActions.map((action) => (
                                <Card
                                    key={action.key}
                                    className={cn(
                                        "bg-card group cursor-pointer border-0 transition-all duration-300",
                                        active === action.key ? "ring-2 ring-[#0c4baa]" : ""
                                    )}
                                    onClick={() => handleQuickAction(action.key)}
                                >
                                    <CardHeader className="pb-2">
                                        <div
                                            className={cn(
                                                "mb-4 flex h-12 w-12 items-center justify-center rounded-xl text-white transition-transform duration-300 group-hover:scale-110",
                                                action.color
                                            )}
                                        >
                                            <action.icon />
                                        </div>
                                        <CardTitle className="inter text-lg font-semibold text-gray-900">
                                            {action.label}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="poppins-regular text-sm text-gray-600">{action.description}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </article>

                    </section>
                </section>
            </>}
        </section>
    );
};

const KrishivaasDashboard = memo(MemoKrishivaasDashboard);
export default KrishivaasDashboard;
