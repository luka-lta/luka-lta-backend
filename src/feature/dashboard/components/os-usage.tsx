import {Progress} from "@/components/ui/progress"
import { osUsage} from "@/feature/dashboard/data"
import {OperatingSystem} from "@/components/operating-system.tsx";

function OsUsage() {
    return (
        <div className="space-y-2.5">
            {osUsage.map((browser) => (
                <div key={browser.os} className="space-y-0.5">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <OperatingSystem os={browser.os}/>
                            <span className="text-sm font-medium">{browser.os}</span>
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

export default OsUsage
