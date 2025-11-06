import {Progress} from "@/components/ui/progress"
import {browserUsage} from "@/feature/dashboard/data"
import {Browser} from "@/components/browser"

function BrowserUsage() {
    return (
        <div className="space-y-2.5">
            {browserUsage.map((browser) => (
                <div key={browser.browser} className="space-y-0.5">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Browser browser={browser.browser}/>
                            <span className="text-sm font-medium">{browser.browser}</span>
                        </div>

                        <span className="text-sm font-semibold tabular-nums">
                          {browser.amount}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Progress value={browser.percentage}/>
                        <span className="text-muted-foreground text-xs font-medium tabular-nums">
                          {browser.percentage}%
                        </span>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default BrowserUsage
