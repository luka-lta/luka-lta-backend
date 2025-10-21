import {Label} from "@/components/ui/label.tsx";
import {MultiSelect} from "@/components/ui/multi-select.tsx";
import {FieldValues, UseFormReturn} from "react-hook-form";
import {useEffect, useState} from "react";
import {dummyProviders} from "@/feature/notifications/schema/notificationDummys.ts";

type Props<TFieldValues extends FieldValues> = {
    form: UseFormReturn<TFieldValues>
}


export const ProviderSelector = <TFieldValues extends FieldValues>({
                                                                          form
                                                                      }: Props<TFieldValues>) => {
    const [providers, setProviders] = useState<{ value: string; label: string }[]>([]);

    useEffect(() => {
/*            const {jwt} = useAuthenticatedUserStore.getState();

            fetch(FetchWrapper.baseUrl + '/providers/', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': jwt ?? '',
                }
            })
                .then(response => response.json())
                .then(data => {
                    setProviders(
                        data.data.permissions.map((permission: { permissionId: number; name: string }) => ({
                            value: permission.permissionId.toString(),
                            label: permission.name
                        }))
                    );
                })
                .catch(error => console.error("Fehler beim Laden der Berechtigungen:", error));*/
                setProviders(dummyProviders.map((provider) => ({
                    value: provider.id.toString(),
                    label: provider.name
                })))
    }, []);

    return (
        <div className="flex flex-col items-start gap-2">
            <div className="flex items-center gap-2">
                <Label htmlFor="apikey-permissions-create-form" className="text-sm font-medium cursor-pointer">
                    Provider
                </Label>
            </div>
            <MultiSelect
                id="provider-notification-create-form"
                options={providers}
                onValueChange={(value) => {
                    const numberValues = value.map(v => parseInt(v, 10));
                    // @ts-ignore
                    form.setValue("providers", numberValues);
                }}
                placeholder={"Select Provider"}
            />
        </div>
    );
}
