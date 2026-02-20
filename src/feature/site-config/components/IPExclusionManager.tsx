"use client";

import { Minus, Plus } from "lucide-react";
import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {validateIPPattern} from "@/lib/ipValidation.ts";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {FetchWrapper} from "@/lib/fetchWrapper.ts";
import {toast} from "sonner";

interface IPExclusionManagerProps {
    siteId: number,
    excludedIPsData: string[];
    disabled?: boolean;
}

export function IPExclusionManager({ siteId, excludedIPsData, disabled = false }: IPExclusionManagerProps) {
    const queryClient = useQueryClient();

    const [ipList, setIpList] = useState<string[]>([]);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Initialize IP list when data is loaded
    React.useEffect(() => {
        if (excludedIPsData) {
            setIpList(excludedIPsData.length > 0 ? excludedIPsData : [""]);
            setHasUnsavedChanges(false);
        }
    }, [excludedIPsData]);

    const addIPField = () => {
        setIpList([...ipList, ""]);
        setHasUnsavedChanges(true);
    };

    const removeIPField = (index: number) => {
        if (ipList.length > 1) {
            const newList = ipList.filter((_, i) => i !== index);
            setIpList(newList);
            setHasUnsavedChanges(true);
        }
    };

    const updateIPField = (index: number, value: string) => {
        const newList = [...ipList];
        newList[index] = value;
        setIpList(newList);
        setHasUnsavedChanges(true);
    };

    const handleSave = useMutation({
        mutationFn: async (ips: string[]) => {
            const fetchWrapper = new FetchWrapper(FetchWrapper.baseUrl);
            await fetchWrapper.post(`/site/${siteId}/tracking-config`, {
                excludedIps: ips
            })
        },
        onSuccess: () => {
            toast.success('IPs excluded successfully!')
        },
        onError: (error) => {
            toast.error('Failed to exclude IPs');
            console.error(error);
        },
        onSettled: () => {
            setTimeout(() => {
                queryClient.invalidateQueries({
                    queryKey: ['site', 'configuration'],
                });
            }, 500)
        }
    })

    const onSave = () => {
        const filteredIPs = ipList.filter(ip => ip.trim() !== "");
        const invalidIPs: string[] = [];
        const validationErrors: string[] = [];

        filteredIPs.forEach(ip => {
            const validation = validateIPPattern(ip);
            if (!validation.valid) {
                invalidIPs.push(ip);
                if (validation.error) {
                    validationErrors.push(`${ip}: ${validation.error}`);
                }
            }
        });

        if (invalidIPs.length > 0) {
            const errorMessage =
                validationErrors.length > 0
                    ? `Invalid IP patterns:\n${validationErrors.join("\n")}`
                    : `Invalid IP patterns: ${invalidIPs.join(", ")}`;

            toast.error(errorMessage);
            return;
        }

        handleSave.mutate(filteredIPs);
    };

    const handleReset = () => {
        if (excludedIPsData) {
            setIpList(excludedIPsData.length > 0 ? excludedIPsData : [""]);
        } else {
            setIpList([""]);
        }
        setHasUnsavedChanges(false);
    };

    return (
        <div className="space-y-4">
            <div>
                <Label className="text-sm font-medium text-foreground block">IP Exclusions</Label>
                <p className="text-xs text-muted-foreground mt-1">
                    Exclude traffic from specific IP addresses or ranges. Supports single IPs (192.168.1.1), CIDR notation
                    (192.168.1.0/24), and ranges (192.168.1.1-192.168.1.10).
                </p>
            </div>

            <div className="space-y-2">
                {ipList.map((ip, index) => (
                    <div key={index} className="flex items-center space-x-2">
                        <Input
                            value={ip}
                            onChange={e => updateIPField(index, e.target.value)}
                            placeholder="e.g., 192.168.1.1 or 10.0.0.0/24"
                            disabled={disabled}
                            className={!validateIPPattern(ip).valid && ip.trim() !== "" ? "border-red-500" : ""}
                        />
                        {ipList.length > 1 && (
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => removeIPField(index)}
                                disabled={disabled}
                                className="shrink-0"
                            >
                                <Minus className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                ))}
            </div>

            <div className="flex items-center space-x-2">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addIPField}
                    disabled={disabled || ipList.length >= 100}
                    className="flex items-center space-x-1"
                >
                    <Plus className="h-4 w-4" />
                    <span>Add IP</span>
                </Button>

                {ipList.length >= 100 && (
                    <span className="text-xs text-muted-foreground">Maximum 100 IP exclusions allowed</span>
                )}
            </div>

            {hasUnsavedChanges && (
                <div className="flex items-center space-x-2 pt-2">
                    <Button onClick={onSave} disabled={disabled} size="sm">
                       {handleSave.isPending ? "Saving..." : "Save Changes"} {'Save Changes'}
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handleReset}
                        disabled={disabled || handleSave.isPending}
                        size="sm"
                    >
                        Reset
                    </Button>
                </div>
            )}
        </div>
    );
}