import {
    Boxes,
    Cloud,
    Container as ContainerIcon,
    Database,
    Globe,
    HardDrive,
    LucideIcon,
    MonitorCog,
    Network,
    Radar,
    Router,
    Server,
    Shield,
    Waypoints,
} from "lucide-react";
import type { NodeStatus } from "./types.ts";

export type NodeCategory = "infrastructure" | "network" | "service";

interface NodeTypeConfig {
    icon: LucideIcon;
    label: string;
    category: NodeCategory;
}

/**
 * The single place a node `type` maps to how it's drawn. Add a new type here and
 * every part of the map (icon, filters, legend) picks it up automatically — nothing
 * else needs to change. A type not listed falls back to CATEGORY_FALLBACK below,
 * so unknown/custom types still render sensibly.
 */
export const NODE_TYPE_CONFIG: Record<string, NodeTypeConfig> = {
    server: { icon: Server, label: "Server", category: "infrastructure" },
    "raspberry-pi": { icon: Server, label: "Raspberry Pi", category: "infrastructure" },
    vm: { icon: Server, label: "VM", category: "infrastructure" },
    nas: { icon: HardDrive, label: "NAS", category: "infrastructure" },
    router: { icon: Router, label: "Router", category: "infrastructure" },
    internet: { icon: Globe, label: "Internet", category: "infrastructure" },
    cloudflare: { icon: Cloud, label: "Cloudflare", category: "infrastructure" },

    "docker-network": { icon: Network, label: "Docker Network", category: "network" },
    vlan: { icon: Network, label: "VLAN", category: "network" },
    subnet: { icon: Network, label: "Subnet", category: "network" },

    "reverse-proxy": { icon: Waypoints, label: "Reverse Proxy", category: "service" },
    dns: { icon: Radar, label: "DNS", category: "service" },
    monitoring: { icon: MonitorCog, label: "Monitoring", category: "service" },
    database: { icon: Database, label: "Database", category: "service" },
    storage: { icon: HardDrive, label: "Storage", category: "service" },
    application: { icon: Boxes, label: "Application", category: "service" },
    container: { icon: ContainerIcon, label: "Container", category: "service" },
};

const CATEGORY_FALLBACK: Record<NodeCategory, NodeTypeConfig> = {
    infrastructure: { icon: Server, label: "Infrastructure", category: "infrastructure" },
    network: { icon: Network, label: "Network", category: "network" },
    service: { icon: Shield, label: "Service", category: "service" },
};

export function getNodeTypeConfig(type: string): NodeTypeConfig {
    return NODE_TYPE_CONFIG[type] ?? { ...CATEGORY_FALLBACK.service, label: type };
}

export const NODE_CATEGORIES: NodeCategory[] = ["infrastructure", "network", "service"];

export const STATUS_CONFIG: Record<NodeStatus, { label: string; dotClass: string; ringClass: string }> = {
    healthy: { label: "Healthy", dotClass: "bg-emerald-500", ringClass: "ring-emerald-500/30" },
    warning: { label: "Warning", dotClass: "bg-amber-500", ringClass: "ring-amber-500/30" },
    offline: { label: "Offline", dotClass: "bg-rose-500", ringClass: "ring-rose-500/30" },
    unknown: { label: "Unknown", dotClass: "bg-muted-foreground", ringClass: "ring-border" },
};

export const EDGE_RELATION_LABEL: Record<string, string> = {
    routes_to: "routes to",
    depends_on: "depends on",
    connects_to: "connects to",
    hosted_on: "hosted on",
    exposes: "exposes",
};
