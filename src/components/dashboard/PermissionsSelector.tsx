import {Label} from "@/components/ui/label.tsx";
import {MultiSelect} from "@/components/ui/multi-select.tsx";
import {FieldValues, UseFormReturn} from "react-hook-form";
import {useEffect, useState} from "react";
import {FetchWrapper} from "@/lib/fetchWrapper.ts";
import {useAuthenticatedUserStore} from "@/feature/login/hooks/useAuthenticatedStore.ts";

type PermissionsSelectorProps<TFieldValues extends FieldValues> = {
    form: UseFormReturn<TFieldValues>
}


export const PermissionsSelector = <TFieldValues extends FieldValues>({
                                                                          form
                                                                      }: PermissionsSelectorProps<TFieldValues>) => {
    const [permissions, setPermissions] = useState<{ value: string; label: string }[]>([]);

    useEffect(() => {
            const {jwt} = useAuthenticatedUserStore.getState();

            fetch(FetchWrapper.baseUrl + '/permissions/', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': jwt ?? '',
                }
            })
                .then(response => response.json())
                .then(data => {
                    setPermissions(
                        data.data.permissions.map((permission: { permissionId: number; name: string }) => ({
                            value: permission.permissionId.toString(),
                            label: permission.name
                        }))
                    );
                })
                .catch(error => console.error("Fehler beim Laden der Berechtigungen:", error));
        }, []
    );

    return (
        <div className="flex flex-col items-start gap-2">
            <div className="flex items-center gap-2">
                <Label htmlFor="apikey-permissions-create-form" className="text-sm font-medium cursor-pointer">
                    Active Status
                </Label>
            </div>
            <MultiSelect
                id="apikey-permissions-create-form"
                options={permissions}
                onValueChange={(value) => {
                    const numberValues = value.map(v => parseInt(v, 10));
                    // @ts-ignore
                    form.setValue("permissions", numberValues);
                }}
                placeholder={"Select Permissions"}
            />
        </div>
    );
}
