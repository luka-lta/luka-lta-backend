/**
 * Platzhalter-Daten für die Business-Widgets, die (noch) nicht aus der
 * App-Registry ableitbar sind: monatliche Umsatz-Historie und offene
 * Rechnungen sind konzeptionell unabhängig von einzelnen Apps.
 */

export interface MonthlyRevenueEntry {
    month: string; // "Apr", "Mai", ...
    clientProjects: number;
    appStore: number;
    trackspire: number;
}

export interface OpenInvoice {
    id: string;
    client: string;
    amount: number;
    dueDate: string; // YYYY-MM-DD
}

export interface TrackspireMonthlyMrr {
    month: string;
    mrr: number;
}

export const monthlyRevenue: MonthlyRevenueEntry[] = [
    { month: "Apr", clientProjects: 1800, appStore: 420, trackspire: 650 },
    { month: "Mai", clientProjects: 2200, appStore: 380, trackspire: 780 },
    { month: "Jun", clientProjects: 1500, appStore: 510, trackspire: 890 },
    { month: "Jul", clientProjects: 2600, appStore: 460, trackspire: 1020 },
    { month: "Aug", clientProjects: 1900, appStore: 590, trackspire: 1150 },
    { month: "Sep", clientProjects: 2400, appStore: 640, trackspire: 1310 },
];

export const openInvoices: OpenInvoice[] = [
    { id: "inv-1", client: "Café Sonnenblick", amount: 850, dueDate: "2026-10-05" },
    { id: "inv-2", client: "Fitness Nord GmbH", amount: 1450, dueDate: "2026-10-12" },
    { id: "inv-3", client: "Atelier Weber", amount: 620, dueDate: "2026-09-28" },
];

export const trackspireMonthlyMrr: TrackspireMonthlyMrr[] = [
    { month: "Apr", mrr: 650 },
    { month: "Mai", mrr: 780 },
    { month: "Jun", mrr: 890 },
    { month: "Jul", mrr: 1020 },
    { month: "Aug", mrr: 1150 },
    { month: "Sep", mrr: 1310 },
];

export function totalRevenueThisMonth(): number {
    const current = monthlyRevenue[monthlyRevenue.length - 1];
    return current.clientProjects + current.appStore + current.trackspire;
}

export function totalOpenInvoiceAmount(): number {
    return openInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);
}
