import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select.tsx";
import { NODE_TYPE_CONFIG } from "@/feature/homelab/topology/constants.ts";
import { useCreateTopologyNode } from "@/api/homelab/topologyHooks.ts";
import { useContainers, useHosts } from "@/api/homelab/hooks.ts";
import { getApiErrorMessage } from "@/lib/apiError.ts";
import type { CreateTopologyNodeInput } from "@/api/homelab/topologyEndpoints.ts";
import type { InfraNodeData } from "@/feature/homelab/topology/types.ts";

interface CreateNodeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    nodes: InfraNodeData[];
}

type NodeRefInput = NonNullable<CreateTopologyNodeInput["ref"]>;

interface RefOption {
    value: string;
    label: string;
    hostName: string;
    ref: NodeRefInput;
    defaultName: string;
    defaultType: string;
}

const UNLINKED = "none";

function refKey(hostId: string, serviceKey: string | null): string {
    return serviceKey === null ? `host|${hostId}` : `service|${hostId}|${serviceKey}`;
}

function CreateNodeDialog({ open, onOpenChange, nodes }: CreateNodeDialogProps) {
    const [type, setType] = useState("internet");
    const [name, setName] = useState("");
    const [linked, setLinked] = useState(UNLINKED);
    const createNode = useCreateTopologyNode();
    const hosts = useHosts();
    const containers = useContainers();

    // Each host/service can be linked by at most one node — hide the ones already on the map.
    const refOptions = useMemo(() => {
        const taken = new Set(
            nodes.flatMap((node) => (node.ref ? [refKey(node.ref.hostId, node.ref.serviceKey)] : [])),
        );
        const hostName = new Map((hosts.data ?? []).map((host) => [host.id, host.name]));

        const options: RefOption[] = [];
        for (const host of hosts.data ?? []) {
            options.push({
                value: refKey(host.id, null),
                label: host.name,
                hostName: host.name,
                ref: { type: "host", hostId: host.id },
                defaultName: host.name,
                defaultType: "server",
            });
        }
        for (const container of containers.data ?? []) {
            const value = refKey(container.hostId, container.serviceKey);
            if (options.some((option) => option.value === value)) continue;
            options.push({
                value,
                label: container.serviceKey,
                hostName: hostName.get(container.hostId) ?? container.hostId,
                ref: { type: "service", hostId: container.hostId, serviceKey: container.serviceKey },
                defaultName: container.name,
                defaultType: "application",
            });
        }

        return options.filter((option) => !taken.has(option.value));
    }, [nodes, hosts.data, containers.data]);

    const optionsByHost = useMemo(() => {
        const groups = new Map<string, RefOption[]>();
        for (const option of refOptions) {
            groups.set(option.hostName, [...(groups.get(option.hostName) ?? []), option]);
        }
        return [...groups.entries()];
    }, [refOptions]);

    const selectedRef = refOptions.find((option) => option.value === linked);

    function handleLinkedChange(value: string) {
        setLinked(value);
        const option = refOptions.find((candidate) => candidate.value === value);
        if (!option) return;
        if (!name.trim()) setName(option.defaultName);
        setType(option.defaultType);
    }

    function reset() {
        setName("");
        setType("internet");
        setLinked(UNLINKED);
    }

    function handleSubmit() {
        if (!name.trim()) return;

        createNode.mutate(
            { type, name: name.trim(), status: selectedRef ? "unknown" : "healthy", ref: selectedRef?.ref },
            {
                onSuccess: () => {
                    toast.success("Node created.");
                    reset();
                    onOpenChange(false);
                },
                onError: (error) => toast.error(getApiErrorMessage(error)),
            },
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add node</DialogTitle>
                    <DialogDescription>
                        Link it to a host or service to show its live status, or leave it unlinked for things
                        like Internet, Cloudflare or a domain.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label>Linked to</Label>
                        <Select value={linked} onValueChange={handleLinkedChange}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={UNLINKED}>Not linked</SelectItem>
                                {optionsByHost.map(([hostName, options]) => (
                                    <SelectGroup key={hostName}>
                                        <SelectLabel>{hostName}</SelectLabel>
                                        {options.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.ref.type === "host" ? "Host itself" : option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="node-name">Name</Label>
                        <Input id="node-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Internet" />
                    </div>
                    <div className="grid gap-2">
                        <Label>Type</Label>
                        <Select value={type} onValueChange={setType}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(NODE_TYPE_CONFIG).map(([key, config]) => (
                                    <SelectItem key={key} value={key}>
                                        {config.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button className="w-full" onClick={handleSubmit} disabled={createNode.isPending || !name.trim()}>
                        Add node
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default CreateNodeDialog;
