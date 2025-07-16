import {ScrollArea} from "@/components/ui/scroll-area.tsx";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table.tsx"
import {Badge} from "@/components/ui/badge.tsx"

interface AuditLogEntry {
    id: string
    action: string
    user: string
    timestamp: string
    details: string
}

// Sample audit log data
const auditLogData: AuditLogEntry[] = [
    {id: "1", action: "Link", user: "john@example.com", timestamp: "2023-04-01 10:30:00", details: "Changed link URL"},
    {
        id: "2",
        action: "Create",
        user: "jane@example.com",
        timestamp: "2023-04-01 11:15:00",
        details: "Created new user account",
    },
    {
        id: "3",
        action: "Update",
        user: "admin@example.com",
        timestamp: "2023-04-01 14:45:00",
        details: "Updated system settings",
    },
    {
        id: "4",
        action: "Delete",
        user: "jane@example.com",
        timestamp: "2023-04-02 09:00:00",
        details: "Deleted old records",
    },
    {id: "5", action: "Logout", user: "john@example.com", timestamp: "2023-04-02 17:30:00", details: "User logged out"},
    {
        id: "6",
        action: "Login",
        user: "alice@example.com",
        timestamp: "2023-04-03 08:00:00",
        details: "Successful login",
    },
    {
        id: "7",
        action: "Update",
        user: "bob@example.com",
        timestamp: "2023-04-03 10:30:00",
        details: "Updated profile information",
    },
    {
        id: "8",
        action: "Create",
        user: "charlie@example.com",
        timestamp: "2023-04-03 14:00:00",
        details: "Created new project",
    },
    {
        id: "9",
        action: "Delete",
        user: "david@example.com",
        timestamp: "2023-04-04 09:15:00",
        details: "Deleted unused resources",
    },
    {id: "10", action: "Logout", user: "eve@example.com", timestamp: "2023-04-04 18:00:00", details: "User logged out"},
]

function AuditLog() {


    return (
        <ScrollArea className="space-y-8 rounded-md max-h-[400px] overflow-y-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">Action</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Details</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {auditLogData.map((entry) => (
                        <TableRow key={entry.id}>
                            <TableCell>
                                <Badge variant={getBadgeVariant(entry.action)}>{entry.action}</Badge>
                            </TableCell>
                            <TableCell>{entry.user}</TableCell>
                            <TableCell>{entry.timestamp}</TableCell>
                            <TableCell>{entry.details}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </ScrollArea>
    );
}

function getBadgeVariant(action: string): "default" | "secondary" | "destructive" | "outline" {
    switch (action.toLowerCase()) {
        case "login":
        case "create":
            return "default"
        case "update":
            return "secondary"
        case "link":
            return "secondary"
        case "delete":
            return "destructive"
        default:
            return "outline"
    }
}

export default AuditLog;