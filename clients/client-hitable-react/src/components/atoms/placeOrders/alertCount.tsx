'use client'

import { memo, useEffect, useRef, useState } from "react";
import { useLiteStore } from "@/components/store/useLiteStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff, ShoppingCart } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useFilters } from "@/components/store/useFilters";
import { useOrderStore } from "@/components/store/useOrderData";

const MemoAlertCount = () => {
    const { onlineCount, offlineCount, cartCount, seSelectedNavItem } = useLiteStore((s) => ({
        onlineCount: s.onlineCount,
        offlineCount: s.offlineCount,
        cartCount: s.cartCount,
        seSelectedNavItem: s.setSelectedNavItem,
    }));
    const { setOpenOrderModal } = useOrderStore()
    const { setPayFilter } = useFilters();
    const { businessId } = useParams()
    const navigate = useNavigate()

    const goToAlerts = (alert: string) => {
        if (alert === "Online") {
            seSelectedNavItem("payments")
            setPayFilter("ONLINE")
            setOpenOrderModal(false)
            return navigate(`/${businessId}/alerts`)
        }
        if (alert === "Offline") {
            seSelectedNavItem("payments")
            setPayFilter("OFFLINE")
            setOpenOrderModal(false)
            return navigate(`/${businessId}/alerts`)
        }
        if (alert === "Cart") {
            seSelectedNavItem("cart")
            setOpenOrderModal(false)
            return navigate(`/${businessId}/alerts`)
        }
    }

    return (
        <div className="w-full max-w-4xl p-4 mx-auto mt-[5.25rem] md:mt-[8rem]">
            <h2 className="mb-6 text-2xl font-bold text-center">Alert Summary</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <AlertCard
                    title="Online"
                    count={onlineCount}
                    icon={<Wifi className="w-6 h-6 text-green-500" />}
                    onClick={() => goToAlerts("Online")}
                />
                <AlertCard
                    title="Offline"
                    count={offlineCount}
                    icon={<WifiOff className="w-6 h-6 text-red-500" />}
                    onClick={() => goToAlerts("Offline")}
                />
                <AlertCard
                    title="Cart"
                    count={cartCount}
                    icon={<ShoppingCart className="w-6 h-6 text-blue-500" />}
                    onClick={() => goToAlerts("Cart")}
                />
            </div>
        </div>
    );
};

interface AlertCardProps {
    title: string;
    count: number;
    icon: React.ReactNode;
    onClick?: () => void;
}

const AlertCard = ({ title, count, icon, onClick }: AlertCardProps) => {
    const prevCount = useRef<number>(count);
    const [isHighlighted, setIsHighlighted] = useState(false);
    const isCountIncreased = count > prevCount.current;

    useEffect(() => {
        if (isCountIncreased) {
            setIsHighlighted(true);

            const timeout = setTimeout(() => {
                setIsHighlighted(false);
            }, 10000);

            return () => clearTimeout(timeout);
        }

        prevCount.current = count;
    }, [count, isCountIncreased]);

    return (
        <Card
            onClick={onClick}
            className={`transition-all duration-300 ${isHighlighted ? "bg-red-100" : ""
                }`}
        >
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{count}</div>
                <Badge variant={count > 0 ? "default" : "secondary"} className="mt-2">
                    {count > 0 ? "Active" : "No alerts"}
                </Badge>
            </CardContent>
        </Card>
    );
};

const AlertCount = memo(MemoAlertCount);
export default AlertCount;
