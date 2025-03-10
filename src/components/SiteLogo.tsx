import {Origami} from "lucide-react"
import {Link} from "react-router-dom"
import {cn} from "@/lib/utils"
import {useSidebar} from "@/components/ui/sidebar"
import {useAuthenticatedUserStore} from "@/feature/login/hooks/useAuthenticatedStore.ts";

interface SiteLogoProps {
    className?: string
    collapsed?: boolean
}

export default function SiteLogo({className, collapsed: collapsedProp}: SiteLogoProps) {
    const {isAuthenticated} = useAuthenticatedUserStore();

    const sidebarContext = (() => {
        try {
            return useSidebar()
        } catch {
            return null
        }
    })()

    const isCollapsed = collapsedProp ?? sidebarContext?.state === "collapsed"

    return (
        <Link to={isAuthenticated() ? "/dashboard" : "/"} className={className}>
            <div className="flex items-center justify-center">
                <Origami className="h-8 w-8 shrink-0"/>
                <span
                    className={cn(
                        "ml-2 text-2xl font-bold transition-all duration-200",
                        isCollapsed && "w-0 opacity-0 hidden"
                    )}
                >
          luka-lta.dev
        </span>
            </div>
        </Link>
    )
}

