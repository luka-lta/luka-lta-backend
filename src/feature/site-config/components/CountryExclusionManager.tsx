"use client";

import { X } from "lucide-react";
import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { CountrySelector } from "./CountrySelector";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {FetchWrapper} from "@/lib/fetchWrapper.ts";
import {toast} from "sonner";

interface CountryExclusionManagerProps {
    siteId: number,
    excludedCountriesData: string[];
    disabled?: boolean;
}

export function CountryExclusionManager({ siteId, excludedCountriesData, disabled = false }: CountryExclusionManagerProps) {
    const queryClient = useQueryClient();

    const [countryList, setCountryList] = useState<string[]>([]);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    React.useEffect(() => {
        if (excludedCountriesData) {
            setCountryList(excludedCountriesData);
            setHasUnsavedChanges(false);
        }
    }, [excludedCountriesData]);

    const addCountry = (countryCode: string) => {
        if (!countryList.includes(countryCode)) {
            setCountryList([...countryList, countryCode]);
            setHasUnsavedChanges(true);
        }
    };

    const removeCountry = (countryCode: string) => {
        setCountryList(countryList.filter(c => c !== countryCode));
        setHasUnsavedChanges(true);
    };

    const handleSave = useMutation({
        mutationFn: async () => {
            const fetchWrapper = new FetchWrapper(FetchWrapper.baseUrl);
            await fetchWrapper.post(`/site/${siteId}/tracking-config`, {
                excludedCountries: countryList
            })
        },
        onSuccess: () => {
            toast.success('Countries excluded successfully!')
        },
        onError: (error) => {
            toast.error('Failed to exclude countries');
            console.log(error);
        },
        onSettled: () => {
            setTimeout(() => {
                queryClient.invalidateQueries({
                    queryKey: ['site', 'configuration'],
                });
            }, 500)
        }
    })

    const handleReset = () => {
        if (excludedCountriesData) {
            setCountryList(excludedCountriesData);
        } else {
            setCountryList([]);
        }
        setHasUnsavedChanges(false);
    };

    return (
        <div className="space-y-4">
            <div>
                <Label className="text-sm font-medium text-foreground block">Country Exclusions</Label>
                <p className="text-xs text-muted-foreground mt-1">
                    Exclude traffic from specific countries. Events from these countries will not be tracked in your analytics.
                </p>
            </div>

            <CountrySelector onSelect={addCountry} selectedCountries={countryList} disabled={disabled} />

            {countryList.length > 0 && (
                <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Excluded Countries ({countryList.length})</Label>
                    <div className="flex flex-wrap gap-2">
                        {countryList.map(countryCode => (
                            <div
                                key={countryCode}
                                className="flex items-center space-x-1 px-3 py-1 bg-secondary text-secondary-foreground rounded-md text-sm"
                            >
                                <span>{countryCode}</span>
                                <button
                                    type="button"
                                    onClick={() => removeCountry(countryCode)}
                                    disabled={disabled}
                                    className="ml-1 hover:text-destructive disabled:opacity-50"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {hasUnsavedChanges && (
                <div className="flex items-center space-x-2 pt-2">
                    <Button
                        onClick={() => handleSave.mutate()}
                        disabled={disabled || handleSave.isPending}
                        size="sm"
                    >
                        {handleSave.isPending ? "Saving..." : "Save Changes"}
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