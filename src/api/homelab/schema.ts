import { z } from "zod";

export const MetricPointSchema = z.object({
    timestamp: z.string(),
    value: z.number(),
});

export const HostSchema = z.object({
    id: z.string(),
    name: z.string(),
    nodeType: z.string(),
    cpuUsagePercent: z.number(),
    memoryUsagePercent: z.number(),
    memoryUsedGb: z.number(),
    memoryTotalGb: z.number(),
    diskUsagePercent: z.number(),
    diskUsedGb: z.number(),
    diskTotalGb: z.number(),
    loadAverage: z.tuple([z.number(), z.number(), z.number()]),
    temperatureCelsius: z.number().nullable(),
    uptimeSeconds: z.number(),
});

export const RestartEventSchema = z.object({
    timestamp: z.string(),
    reason: z.string(),
});

export const HealthCheckEventSchema = z.object({
    timestamp: z.string(),
    status: z.enum(["healthy", "warning", "unhealthy", "none"]),
    message: z.string(),
});

export const LogLineSchema = z.object({
    timestamp: z.string(),
    level: z.enum(["info", "warn", "error"]),
    message: z.string(),
});

export const ContainerSchema = z.object({
    id: z.string(),
    name: z.string(),
    image: z.string(),
    status: z.enum(["running", "stopped", "warning", "unhealthy"]),
    healthStatus: z.enum(["healthy", "warning", "unhealthy", "none"]),
    hostId: z.string(),
    uptimeSeconds: z.number().nullable(),
    cpuUsagePercent: z.number(),
    memoryUsedMb: z.number(),
    memoryLimitMb: z.number(),
    networkInMbps: z.number(),
    networkOutMbps: z.number(),
    restartCount: z.number(),
    lastHealthCheck: z.string().nullable(),
    ports: z.array(z.string()),
    volumes: z.array(z.string()),
    environment: z.record(z.string(), z.string()),
    networks: z.array(z.string()),
    labels: z.record(z.string(), z.string()),
    nodeRole: z.string().nullable(),
    cpuHistory: z.array(MetricPointSchema),
    memoryHistory: z.array(MetricPointSchema),
    restartHistory: z.array(RestartEventSchema),
    healthCheckHistory: z.array(HealthCheckEventSchema),
    logs: z.array(LogLineSchema),
});

export const AlertSchema = z.object({
    id: z.string(),
    severity: z.enum(["critical", "warning", "info"]),
    title: z.string(),
    description: z.string(),
    timestamp: z.string(),
    containerId: z.string().nullable().optional(),
    hostId: z.string().nullable().optional(),
});

export const EventSchema = z.object({
    id: z.number(),
    type: z.string(),
    severity: z.enum(["critical", "warning", "info"]),
    title: z.string(),
    description: z.string(),
    containerId: z.string().nullable(),
    hostId: z.string().nullable(),
    metadata: z.record(z.string(), z.unknown()),
    occurredAt: z.string(),
});

export const hostListSchema = z.object({ hosts: z.array(HostSchema) });
export const hostMetricsSchema = z.object({ metrics: z.array(MetricPointSchema) });
export const containerListSchema = z.object({ containers: z.array(ContainerSchema) });
export const containerDetailSchema = z.object({ container: ContainerSchema });
export const alertListSchema = z.object({ alerts: z.array(AlertSchema) });
export const eventListSchema = z.object({ events: z.array(EventSchema) });
