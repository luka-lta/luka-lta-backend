import {
    Boxes,
    Code2,
    CreditCard,
    Database,
    Globe,
    LineChart,
    type LucideIcon,
    Rocket,
    Server,
    ShoppingBag,
    Smartphone,
} from "lucide-react";
import type { AppIconKey } from "@/api/apps/schema";

export const APP_ICON_OPTIONS: Record<AppIconKey, LucideIcon> = {
    smartphone: Smartphone,
    globe: Globe,
    server: Server,
    boxes: Boxes,
    rocket: Rocket,
    creditCard: CreditCard,
    code: Code2,
    database: Database,
    shoppingBag: ShoppingBag,
    lineChart: LineChart,
};

export function getAppIcon(key: AppIconKey): LucideIcon {
    return APP_ICON_OPTIONS[key] ?? Boxes;
}
