import {FieldPath, FieldValues, UseFormReturn} from "react-hook-form";
import {Label} from "@/components/ui/label.tsx";
import {cn} from "@/lib/utils.ts";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover.tsx";
import {Button} from "@/components/ui/button.tsx";
import {CalendarIcon} from "lucide-react";
import {format} from "date-fns";
import {Calendar} from "@/components/ui/calendar.tsx";

type CalendarInputProps<TFieldValues extends FieldValues> = {
    name: FieldPath<TFieldValues>
    id: string,
    label: string,
    placeholder?: string,
    form: UseFormReturn<TFieldValues>,
}

export const CalendarInput = <TFieldValues extends FieldValues>({
                                                                form,
                                                                name,
                                                                label,
                                                                placeholder,
                                                                id,
                                                            }: CalendarInputProps<TFieldValues>) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {register, getFieldState, formState: {errors: _ } } = form;
    const {error} = getFieldState(name);

    return (
        <div className="flex flex-col items-start gap-2">
            <Label
                htmlFor={id}
                className={cn('text-right', {'text-red-500': error})}
            >
                {label}
            </Label>

            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        id="apikey-expiry-create-form"
                        variant="outline"
                        className={cn(
                            "w-full justify-start text-left font-normal",
                            !form.watch(name) && "text-muted-foreground",
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4"/>
                        {form.watch(name) ? (
                            format(form.watch(name) as Date, "PPP")
                        ) : (
                            <span>{placeholder}</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        {...register(name)}
                        mode="single"
                        selected={form.watch(name) || undefined}
                        // @ts-ignore
                        onSelect={(date) => form.setValue(name, date)}
                        initialFocus
                        disabled={(date) => date < new Date()}
                    />
                </PopoverContent>
            </Popover>
            {error && <span className="text-red-500 col-span-3">{error.message}</span>}
        </div>
    );
}