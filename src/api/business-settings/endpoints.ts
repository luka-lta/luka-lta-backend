import api, { apiForm } from "@/api/axios.ts";
import {
  businessSettingsResultSchema,
  type BusinessSettings,
  type BusinessSettingsInput,
} from "@/feature/business-settings/schema/businessSettings.ts";

export async function getBusinessSettings(): Promise<BusinessSettings | null> {
  const response = await api.get("/business/settings");
  return businessSettingsResultSchema.parse(response.data.data).settings;
}

export async function saveBusinessSettings(data: BusinessSettingsInput): Promise<BusinessSettings | null> {
  const response = await api.put("/business/settings", data);
  return businessSettingsResultSchema.parse(response.data.data).settings;
}

export async function uploadBusinessLogo(file: File): Promise<BusinessSettings | null> {
  const formData = new FormData();
  formData.append("file", file);
  const response = await apiForm.post("/business/settings/logo", formData);
  return businessSettingsResultSchema.parse(response.data.data).settings;
}
