import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";
import {Browser} from "@/components/browser.tsx";

function getBrowserName(userAgent: string) {
    const ua = userAgent.toLowerCase();
    if (ua.includes("chrome") && !ua.includes("edge")) return "Chrome";
    if (ua.includes("firefox")) return "Firefox";
    if (ua.includes("safari") && !ua.includes("chrome")) return "Safari";
    if (ua.includes("edge") || ua.includes("edg/")) return "Edge";
    return "Unknown";
}

function shortenUserAgent(ua: string, maxLength = 50) {
    return ua.length > maxLength ? ua.slice(0, maxLength) + "…" : ua;
}

export function UserAgentInfo({userAgent}: { userAgent: string }) {
    const browser = getBrowserName(userAgent);
    const shortUA = shortenUserAgent(userAgent);

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="flex items-center gap-2 whitespace-nowrap">
                        <Browser browser={browser || "Unknown"} />
                        <span className="cursor-default font-medium">{browser}</span>
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p className="text-sm">{shortUA}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
