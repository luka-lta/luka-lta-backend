import { z } from "zod";

export const customerSchema = z.object({
  customerId: z.string(),
  companyName: z.string().nullable(),
  contactName: z.string().nullable(),
  street: z.string(),
  postalCode: z.string(),
  city: z.string(),
  country: z.string(),
  email: z.string().nullable(),
  vatId: z.string().nullable(),
  notes: z.string().nullable(),
  archivedAt: z.string().nullable(),
  displayName: z.string(),
});

export const customerListSchema = z.object({
  customers: z.array(customerSchema),
});

export const customerResultSchema = z.object({
  customer: customerSchema,
});

export type Customer = z.infer<typeof customerSchema>;

/** Länge laut API: Firma/Ansprechpartner/Straße 150, PLZ 20, Ort 100, E-Mail 255, USt-IdNr. 30, Notizen 10000. */
export const customerFormSchema = z
  .object({
    companyName: z.string().trim().max(150, "Höchstens 150 Zeichen"),
    contactName: z.string().trim().max(150, "Höchstens 150 Zeichen"),
    street: z.string().trim().min(1, "Straße ist erforderlich").max(150, "Höchstens 150 Zeichen"),
    postalCode: z.string().trim().min(1, "PLZ ist erforderlich").max(20, "Höchstens 20 Zeichen"),
    city: z.string().trim().min(1, "Ort ist erforderlich").max(100, "Höchstens 100 Zeichen"),
    country: z
      .string()
      .trim()
      .regex(/^[A-Z]{2}$/, "Zwei Großbuchstaben, z. B. DE")
      .or(z.literal("")),
    email: z.string().trim().max(255, "Höchstens 255 Zeichen").email("Ungültige E-Mail-Adresse").or(z.literal("")),
    vatId: z.string().trim().max(30, "Höchstens 30 Zeichen"),
    notes: z.string().max(10000, "Höchstens 10000 Zeichen"),
  })
  .refine((values) => values.companyName !== "" || values.contactName !== "", {
    message: "Firma oder Ansprechpartner ist erforderlich",
    path: ["companyName"],
  });

export type CustomerFormValues = z.infer<typeof customerFormSchema>;

/** Request-Body für POST/PATCH /customers (leere Optionalfelder als null). */
export interface CustomerInput {
  companyName: string | null;
  contactName: string | null;
  street: string;
  postalCode: string;
  city: string;
  country: string | null;
  email: string | null;
  vatId: string | null;
  notes: string | null;
}
