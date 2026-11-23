import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { FormDialog } from "@/components/dialogs/form-dialog.tsx";
import { TextInput } from "@/components/form/TextInput.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { useCreateCustomer, useUpdateCustomer } from "@/api/customers/hooks.ts";
import { getApiErrorMessage } from "@/lib/apiError.ts";
import {
  customerFormSchema,
  type Customer,
  type CustomerFormValues,
  type CustomerInput,
} from "@/feature/customers/schema/customer.ts";

interface Props {
  /** null = neuen Kunden anlegen. */
  customer: Customer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function toNullable(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function buildDefaultValues(customer: Customer | null): CustomerFormValues {
  return {
    companyName: customer?.companyName ?? "",
    contactName: customer?.contactName ?? "",
    street: customer?.street ?? "",
    postalCode: customer?.postalCode ?? "",
    city: customer?.city ?? "",
    country: customer?.country ?? "DE",
    email: customer?.email ?? "",
    vatId: customer?.vatId ?? "",
    notes: customer?.notes ?? "",
  };
}

function buildInput(values: CustomerFormValues): CustomerInput {
  return {
    companyName: toNullable(values.companyName),
    contactName: toNullable(values.contactName),
    street: values.street,
    postalCode: values.postalCode,
    city: values.city,
    country: toNullable(values.country),
    email: toNullable(values.email),
    vatId: toNullable(values.vatId),
    notes: toNullable(values.notes),
  };
}

/** Anlegen/Bearbeiten eines Kunden. Wird nur bei geöffnetem Dialog gemountet (frischer Formularzustand). */
export function CustomerFormDialog({ customer, open, onOpenChange }: Props) {
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: buildDefaultValues(customer),
  });
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();
  const isSaving = createCustomer.isPending || updateCustomer.isPending;

  function handleSuccess(message: string) {
    toast.success(message);
    onOpenChange(false);
  }

  function handleError(error: unknown) {
    toast.error(getApiErrorMessage(error));
  }

  const handleSubmit = form.handleSubmit((values) => {
    const data = buildInput(values);
    if (customer === null) {
      createCustomer.mutate(data, { onSuccess: () => handleSuccess("Kunde angelegt"), onError: handleError });
      return;
    }
    updateCustomer.mutate(
      { customerId: customer.customerId, data },
      { onSuccess: () => handleSuccess("Kunde gespeichert"), onError: handleError },
    );
  });

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={customer === null ? "Kunde anlegen" : "Kunde bearbeiten"}
      description="Firma oder Ansprechpartner genügt als Name. Die Anschrift ist Pflicht."
      onSubmit={handleSubmit}
      submitLabel="Speichern"
      isSubmitting={isSaving}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput form={form} id="customer-company" name="companyName" label="Firma" optional />
        <TextInput form={form} id="customer-contact" name="contactName" label="Ansprechpartner" optional />
      </div>
      <TextInput form={form} id="customer-street" name="street" label="Straße und Hausnummer" autoComplete="off" />
      <div className="grid gap-4 sm:grid-cols-[8rem_1fr_6rem]">
        <TextInput form={form} id="customer-postal" name="postalCode" label="PLZ" autoComplete="off" />
        <TextInput form={form} id="customer-city" name="city" label="Ort" autoComplete="off" />
        <TextInput form={form} id="customer-country" name="country" label="Land" placeholder="DE" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput form={form} id="customer-email" name="email" type="email" label="E-Mail" optional />
        <TextInput form={form} id="customer-vat" name="vatId" label="USt-IdNr." optional />
      </div>
      <div className="space-y-2">
        <Label htmlFor="customer-notes">
          Notizen<span className="ml-1 font-normal text-muted-foreground">(optional)</span>
        </Label>
        <Textarea id="customer-notes" rows={3} {...form.register("notes")} />
        {form.formState.errors.notes && (
          <p className="text-xs font-medium text-destructive">{form.formState.errors.notes.message}</p>
        )}
      </div>
    </FormDialog>
  );
}
