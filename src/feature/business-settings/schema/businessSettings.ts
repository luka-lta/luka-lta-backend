import { z } from "zod";

export const businessSettingsSchema = z.object({
  companyName: z.string(),
  ownerName: z.string(),
  street: z.string(),
  postalCode: z.string(),
  city: z.string(),
  email: z.string(),
  phone: z.string().nullable(),
  taxNumber: z.string(),
  bankName: z.string(),
  iban: z.string(),
  bic: z.string().nullable(),
  defaultPaymentTermDays: z.number(),
  footerText: z.string().nullable(),
  hasLogo: z.boolean(),
});

/** `settings` ist null, solange noch keine Firmendaten gespeichert wurden. */
export const businessSettingsResultSchema = z.object({
  settings: businessSettingsSchema.nullable(),
});

export type BusinessSettings = z.infer<typeof businessSettingsSchema>;

/** Obergrenze des Zahlungsziels in Tagen (wie API). */
const MAX_PAYMENT_TERM_DAYS = 365;

export const businessSettingsFormSchema = z.object({
  companyName: z.string().trim().min(1, "Firmenname ist erforderlich").max(150, "Höchstens 150 Zeichen"),
  ownerName: z.string().trim().min(1, "Inhaber ist erforderlich").max(150, "Höchstens 150 Zeichen"),
  street: z.string().trim().min(1, "Straße ist erforderlich").max(150, "Höchstens 150 Zeichen"),
  postalCode: z.string().trim().min(1, "PLZ ist erforderlich").max(20, "Höchstens 20 Zeichen"),
  city: z.string().trim().min(1, "Ort ist erforderlich").max(100, "Höchstens 100 Zeichen"),
  email: z
    .string()
    .trim()
    .min(1, "E-Mail ist erforderlich")
    .max(255, "Höchstens 255 Zeichen")
    .email("Ungültige E-Mail-Adresse"),
  phone: z.string().trim().max(50, "Höchstens 50 Zeichen"),
  taxNumber: z.string().trim().min(1, "Steuernummer ist erforderlich").max(50, "Höchstens 50 Zeichen"),
  bankName: z.string().trim().min(1, "Bank ist erforderlich").max(100, "Höchstens 100 Zeichen"),
  iban: z
    .string()
    .trim()
    .min(1, "IBAN ist erforderlich")
    .max(50, "Höchstens 50 Zeichen")
    .refine(
      (value) => /^[A-Z]{2}[0-9]{2}[A-Z0-9]{11,30}$/.test(value.replace(/\s+/g, "").toUpperCase()),
      "Keine gültige IBAN",
    ),
  bic: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || /^[A-Z0-9]{8}([A-Z0-9]{3})?$/.test(value.replace(/\s+/g, "").toUpperCase()),
      "BIC hat 8 oder 11 Zeichen",
    ),
  defaultPaymentTermDays: z
    .string()
    .trim()
    .regex(/^\d+$/, "Ganze Zahl in Tagen")
    .refine((value) => Number(value) <= MAX_PAYMENT_TERM_DAYS, `Höchstens ${MAX_PAYMENT_TERM_DAYS} Tage`),
  footerText: z.string().max(10000, "Höchstens 10000 Zeichen"),
});

export type BusinessSettingsFormValues = z.infer<typeof businessSettingsFormSchema>;

/** Request-Body für PUT /business/settings. */
export interface BusinessSettingsInput {
  companyName: string;
  ownerName: string;
  street: string;
  postalCode: string;
  city: string;
  email: string;
  phone: string | null;
  taxNumber: string;
  bankName: string;
  iban: string;
  bic: string | null;
  defaultPaymentTermDays: number;
  footerText: string | null;
}
