import { isAxiosError } from "axios";

/** The backend's JSON error responses carry the real message in `data.error` (see `ErrorResult::toArray()`) — axios's own `error.message` is just the generic HTTP status text. */
export function getApiErrorMessage(error: unknown): string {
    if (isAxiosError(error)) {
        const data = error.response?.data as { error?: string } | undefined;
        if (data?.error) return data.error;
    }
    if (error instanceof Error) return error.message;
    return "Unbekannter Fehler.";
}
