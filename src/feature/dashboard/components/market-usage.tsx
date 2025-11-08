import {Progress} from "@/components/ui/progress"
import {marketUsage} from "@/feature/dashboard/data"
import Flag from "react-flagkit";

function MarketUsage() {
    return (
        <div className="space-y-2.5">
            {marketUsage.map((browser) => (
                <div key={browser.market} className="space-y-0.5">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Flag className='w-4 h-4' country={browser.market}/>
                            <span className="text-sm font-medium">{browser.market}</span>
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

export default MarketUsage
