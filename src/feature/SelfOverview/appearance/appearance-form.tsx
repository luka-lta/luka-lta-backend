import { Monitor, Moon, Sun, type LucideIcon } from 'lucide-react'
import { toast } from 'sonner'
import { fonts } from '@/config/fonts.ts'
import { useTheme } from '@/context/theme-context.tsx'
import { useFont } from '@/context/font-context.tsx'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils.ts'

type ThemeOption = 'light' | 'dark' | 'system'
type FontOption = (typeof fonts)[number]

const THEME_OPTIONS: { value: ThemeOption; label: string; icon: LucideIcon }[] = [
    { value: 'light', label: 'Hell', icon: Sun },
    { value: 'dark', label: 'Dunkel', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
]

const FONT_LABELS: Record<FontOption, string> = {
    inter: 'Inter',
    manrope: 'Manrope',
    sora: 'Sora',
    system: 'Systemschrift',
}

const FONT_CLASS: Record<FontOption, string> = {
    inter: 'font-inter',
    manrope: 'font-manrope',
    sora: 'font-sora',
    system: 'font-system',
}

function isThemeOption(value: string): value is ThemeOption {
    return value === 'light' || value === 'dark' || value === 'system'
}

function isFontOption(value: string): value is FontOption {
    return (fonts as readonly string[]).includes(value)
}

/** Miniatur des Dashboards; nutzt die echten Tokens des jeweiligen Themes. */
function ThemePreview({ mode }: { mode: 'light' | 'dark' }) {
    return (
        <div className={cn(mode, 'rounded-md bg-background p-2 text-foreground')} aria-hidden='true'>
            <div className='flex gap-1.5'>
                <div className='w-1/4 space-y-1 rounded-sm bg-muted p-1.5'>
                    <div className='h-1.5 rounded-full bg-primary' />
                    <div className='h-1.5 rounded-full bg-muted-foreground/40' />
                    <div className='h-1.5 rounded-full bg-muted-foreground/40' />
                </div>
                <div className='flex-1 space-y-1.5'>
                    <div className='rounded-sm border bg-card p-1.5'>
                        <div className='h-1.5 w-2/3 rounded-full bg-foreground/70' />
                        <div className='mt-1 h-1.5 w-1/2 rounded-full bg-muted-foreground/40' />
                    </div>
                    <div className='rounded-sm border bg-card p-1.5'>
                        <div className='h-1.5 w-1/2 rounded-full bg-foreground/70' />
                        <div className='mt-1 h-1.5 w-3/4 rounded-full bg-muted-foreground/40' />
                    </div>
                </div>
            </div>
        </div>
    )
}

const optionCardClass =
    'flex cursor-pointer flex-col gap-2 rounded-lg border bg-card p-2 shadow-xs transition-colors duration-fast hover:bg-accent/50 ' +
    'has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:ring-1 has-[[data-state=checked]]:ring-primary ' +
    'has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring'

/** Darstellung: Änderungen gelten sofort und werden im Browser gespeichert. */
function AppearanceForm() {
    const { font, setFont } = useFont()
    const { theme, setTheme } = useTheme()

    const handleTheme = (value: string) => {
        if (!isThemeOption(value) || value === theme) return
        setTheme(value)
        toast.success('Darstellung gespeichert')
    }

    const handleFont = (value: string) => {
        if (!isFontOption(value) || value === font) return
        setFont(value)
        toast.success('Schrift gespeichert')
    }

    return (
        <div className='space-y-8'>
            <fieldset className='space-y-3'>
                <legend className='text-sm font-medium'>Farbschema</legend>
                <p className='text-sm text-muted-foreground'>
                    „System“ folgt der Einstellung deines Betriebssystems.
                </p>
                <RadioGroup
                    value={theme}
                    onValueChange={handleTheme}
                    className='grid grid-cols-1 gap-3 sm:grid-cols-3'
                    aria-label='Farbschema'
                >
                    {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
                        <Label key={value} htmlFor={`theme-${value}`} className={optionCardClass}>
                            <RadioGroupItem id={`theme-${value}`} value={value} className='sr-only' />
                            {value === 'system' ? (
                                <div className='grid grid-cols-2 overflow-hidden rounded-md' aria-hidden='true'>
                                    <div className='light bg-background p-2'>
                                        <div className='h-12 rounded-sm border bg-card' />
                                    </div>
                                    <div className='dark bg-background p-2'>
                                        <div className='h-12 rounded-sm border bg-card' />
                                    </div>
                                </div>
                            ) : (
                                <ThemePreview mode={value} />
                            )}
                            <span className='flex items-center gap-2 px-1 pb-1 text-sm font-normal'>
                                <Icon className='size-4 text-muted-foreground' aria-hidden='true' />
                                {label}
                            </span>
                        </Label>
                    ))}
                </RadioGroup>
            </fieldset>

            <fieldset className='space-y-3'>
                <legend className='text-sm font-medium'>Schrift</legend>
                <p className='text-sm text-muted-foreground'>Wird für die gesamte Oberfläche verwendet.</p>
                <RadioGroup
                    value={font}
                    onValueChange={handleFont}
                    className='grid grid-cols-2 gap-3 sm:grid-cols-4'
                    aria-label='Schrift'
                >
                    {fonts.map((value) => (
                        <Label key={value} htmlFor={`font-${value}`} className={cn(optionCardClass, 'p-3')}>
                            <RadioGroupItem id={`font-${value}`} value={value} className='sr-only' />
                            <span className={cn(FONT_CLASS[value], 'text-2xl font-semibold')} aria-hidden='true'>
                                Aa
                            </span>
                            <span className='text-sm font-normal'>{FONT_LABELS[value]}</span>
                        </Label>
                    ))}
                </RadioGroup>
            </fieldset>
        </div>
    )
}

export default AppearanceForm
