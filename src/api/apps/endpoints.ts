import { AppEntitySchema, type AppEntity, type AppInput } from "@/api/apps/schema";
import { getAppById, insertApp, listApps, removeAppById, updateAppById } from "@/api/apps/mockStore";

/**
 * Mock latency so loading states behave like a real network call.
 * This whole file is the ONLY place that needs to change when a real
 * backend exists - hooks.ts and the UI stay untouched.
 */
function delay(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchAppList(): Promise<AppEntity[]> {
	await delay(300);
	return listApps().map((app) => AppEntitySchema.parse(app));
}

export async function fetchApp(id: string): Promise<AppEntity> {
	await delay(200);
	const app = getAppById(id);
	if (!app) throw new Error(`App not found: ${id}`);
	return AppEntitySchema.parse(app);
}

export async function createApp(input: AppInput): Promise<AppEntity> {
	await delay(300);
	return AppEntitySchema.parse(insertApp(input));
}

export async function updateApp(id: string, input: AppInput): Promise<AppEntity> {
	await delay(300);
	const updated = updateAppById(id, input);
	if (!updated) throw new Error(`App not found: ${id}`);
	return AppEntitySchema.parse(updated);
}

export async function deleteApp(id: string): Promise<void> {
	await delay(300);
	const removed = removeAppById(id);
	if (!removed) throw new Error(`App not found: ${id}`);
}
