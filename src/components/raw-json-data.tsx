import { CopyButton } from "@/components/CopyButton.tsx";

interface JsonProps<T> {
    jsonData: T;
}

/** Rohdaten-Ansicht für Debugging (z. B. Tab „JSON“ in Detail-Sheets). */
const RawJsonData = <T,>({ jsonData }: JsonProps<T>) => {
    const json = JSON.stringify(jsonData, null, 2);
    return (
        <div className="relative rounded-lg border bg-muted/40">
            <CopyButton value={json} size={14} className="absolute right-2 top-2" />
            <pre className="max-h-[60svh] overflow-auto p-4 pr-10 font-mono text-xs leading-relaxed">{json}</pre>
        </div>
    );
}

export default RawJsonData;
