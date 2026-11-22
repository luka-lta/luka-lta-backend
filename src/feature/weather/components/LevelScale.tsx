import { cn } from "@/lib/utils.ts";
import type { ScaleLevel } from "@/feature/weather/weatherData.ts";

interface LevelScaleProps {
    levels: ScaleLevel[];
    activeIndex: number;
    label: string;
}

/** Segmented band scale: the band the value falls into is filled, the others stay quiet. */
export function LevelScale({ levels, activeIndex, label }: LevelScaleProps) {
    return (
        <div role="img" aria-label={`${label}: ${levels[activeIndex].label}`}>
            <div className="flex gap-1">
                {levels.map((level, index) => (
                    <span
                        key={level.label}
                        className={cn(
                            "h-1.5 flex-1 rounded-full transition-colors duration-300",
                            index < activeIndex && "bg-warning/35",
                            index === activeIndex && "bg-warning",
                            index > activeIndex && "bg-muted",
                        )}
                    />
                ))}
            </div>
            <div className="mt-1.5 flex justify-between text-[11px] tabular-nums text-muted-foreground" aria-hidden>
                <span>{levels[0].from}</span>
                <span>{levels[levels.length - 1].from}+</span>
            </div>
        </div>
    );
}
