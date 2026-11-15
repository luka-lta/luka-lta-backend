import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { FormDialog } from "@/components/dialogs/form-dialog.tsx";
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
                    toast.success("Knoten angelegt");
                    reset();
                    onOpenChange(false);
                },
                onError: (error) => toast.error(getApiErrorMessage(error)),
            },
        );
    }

    return (
        <FormDialog
            open={open}
            onOpenChange={onOpenChange}
            size="sm"
            title="Knoten hinzufügen"
            description="Mit einem Host oder Dienst verknüpfen, um dessen Live-Status zu zeigen – oder unverknüpft für Internet, Cloudflare oder eine Domain."
            onSubmit={(event) => {
                event.preventDefault();
                handleSubmit();
            }}
            submitLabel="Hinzufügen"
            isSubmitting={createNode.isPending}
            submitDisabled={!name.trim()}
        >
            <div className="space-y-2">
                <Label htmlFor="node-link">Verknüpft mit</Label>
                <Select value={linked} onValueChange={handleLinkedChange}>
                    <SelectTrigger id="node-link">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={UNLINKED}>Nicht verknüpft</SelectItem>
                        {optionsByHost.map(([hostName, options]) => (
                            <SelectGroup key={hostName}>
                                <SelectLabel>{hostName}</SelectLabel>
                                {options.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.ref.type === "host" ? "Host selbst" : option.label}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="node-name">Name</Label>
                <Input id="node-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="z. B. Internet" autoFocus />
            </div>
            <div className="space-y-2">
                <Label htmlFor="node-type">Typ</Label>
                <Select value={type} onValueChange={setType}>
                    <SelectTrigger id="node-type">
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
        </FormDialog>
    );
}

export default CreateNodeDialog;
