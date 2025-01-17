import {TodoTypeSchema} from "@/shemas/TodoSchema.ts";

export const tasks: TodoTypeSchema[] = [
    {
        id: 1,
        ownerId: 1,
        title: "Implement authentication",
        description: "Develop and integrate authentication system with JWT",
        status: "in-progress",
        priority: "high",
        dueDate: "2025-01-20",
        createdAt: "2025-01-01T08:00:00Z",
        updatedAt: "2025-01-10T12:30:00Z"
    },
    {
        id: 2,
        ownerId: 2,
        title: "Design database schema",
        description: "Create an optimized relational database schema for the application",
        status: "todo",
        priority: "high",
        dueDate: "2025-01-25",
        createdAt: "2025-01-02T10:15:00Z",
        updatedAt: "2025-01-02T10:15:00Z"
    },
    {
        id: 3,
        ownerId: 3,
        title: "Setup CI/CD pipeline",
        description: "Configure GitHub Actions for automated testing and deployment",
        status: "in-progress",
        priority: "medium",
        dueDate: "2025-02-01",
        createdAt: "2025-01-03T14:45:00Z",
        updatedAt: "2025-01-09T09:20:00Z"
    },
    {
        id: 4,
        ownerId: 1,
        title: "Optimize API performance",
        description: "Analyze slow API endpoints and implement optimizations",
        status: "todo",
        priority: "high",
        dueDate: "2025-01-30",
        createdAt: "2025-01-04T16:00:00Z",
        updatedAt: "2025-01-04T16:00:00Z"
    },
    {
        id: 5,
        ownerId: 4,
        title: "Write unit tests",
        description: "Ensure high code coverage with Jest and PHPUnit tests",
        status: "in-progress",
        priority: "medium",
        dueDate: "2025-02-05",
        createdAt: "2025-01-05T09:10:00Z",
        updatedAt: "2025-01-11T11:30:00Z"
    },
    {
        id: 6,
        ownerId: 2,
        title: "Refactor frontend components",
        description: "Improve reusability and performance of React components",
        status: "todo",
        priority: "low",
        dueDate: "2025-02-10",
        createdAt: "2025-01-06T12:00:00Z",
        updatedAt: "2025-01-06T12:00:00Z"
    },
    {
        id: 7,
        ownerId: 3,
        title: "Setup monitoring tools",
        description: "Integrate Prometheus and Grafana for application monitoring",
        status: "done",
        priority: "medium",
        dueDate: "2025-01-15",
        createdAt: "2025-01-07T08:30:00Z",
        updatedAt: "2025-01-15T14:00:00Z"
    },
    {
        id: 8,
        ownerId: 4,
        title: "Improve security measures",
        description: "Implement OAuth2, rate limiting, and security headers",
        status: "todo",
        priority: "high",
        dueDate: "2025-02-20",
        createdAt: "2025-01-08T15:20:00Z",
        updatedAt: "2025-01-08T15:20:00Z"
    }
];