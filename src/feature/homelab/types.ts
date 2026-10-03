export type ContainerStatus = "running" | "stopped" | "warning" | "unhealthy";
export type HealthStatus = "healthy" | "warning" | "unhealthy" | "none";
export type AlertSeverity = "critical" | "warning" | "info";

export interface MetricPoint {
    timestamp: string;
    value: number;
}

export interface HostMetrics {
    cpu: MetricPoint[];
    memory: MetricPoint[];
    disk: MetricPoint[];
    networkIn: MetricPoint[];
    networkOut: MetricPoint[];
}

export interface Host {
    id: string;
    name: string;
    nodeType: string;
    cpuUsagePercent: number;
    memoryUsagePercent: number;
    memoryUsedGb: number;
    memoryTotalGb: number;
    diskUsagePercent: number;
    diskUsedGb: number;
    diskTotalGb: number;
    loadAverage: [number, number, number];
    temperatureCelsius: number | null;
    uptimeSeconds: number;
    metrics: HostMetrics;
}

export interface RestartEvent {
    timestamp: string;
    reason: string;
}

export interface HealthCheckEvent {
    timestamp: string;
    status: HealthStatus;
    message: string;
}

export interface LogLine {
    timestamp: string;
    level: "info" | "warn" | "error";
    message: string;
}

export interface Container {
    id: string;
    name: string;
    image: string;
    status: ContainerStatus;
    healthStatus: HealthStatus;
    hostId: string;
    uptimeSeconds: number | null;
    cpuUsagePercent: number;
    memoryUsedMb: number;
    memoryLimitMb: number;
    networkInMbps: number;
    networkOutMbps: number;
    restartCount: number;
    lastHealthCheck: string | null;
    ports: string[];
    volumes: string[];
    environment: Record<string, string>;
    networks: string[];
    labels: Record<string, string>;
    nodeRole: string | null;
    cpuHistory: MetricPoint[];
    memoryHistory: MetricPoint[];
    restartHistory: RestartEvent[];
    healthCheckHistory: HealthCheckEvent[];
    logs: LogLine[];
}

export interface Event {
    id: number;
    type: string;
    severity: AlertSeverity;
    title: string;
    description: string;
    containerId: string | null;
    hostId: string | null;
    metadata: Record<string, unknown>;
    occurredAt: string;
}

export interface Alert {
    id: string;
    severity: AlertSeverity;
    title: string;
    description: string;
    timestamp: string;
    containerId?: string | null;
    hostId?: string | null;
}
