import { FilePlus2, FolderPlus, KeyRound, Link2, UserPlus, type LucideIcon } from 'lucide-react'
import { withCreateIntent } from '@/hooks/useCreateIntent'

export interface QuickAction {
    label: string
    description: string
    icon: LucideIcon
    to: string
}

/** Häufige Anlegen-Aktionen; Übersicht und ⌘K-Menü nutzen dieselbe Liste. */
export const QUICK_ACTIONS: QuickAction[] = [
    { label: 'Beitrag schreiben', description: 'Entwurf im Editor', icon: FilePlus2, to: '/dashboard/blog/create' },
    { label: 'Link anlegen', description: 'Für die Link-Seite', icon: Link2, to: withCreateIntent('/dashboard/linktree') },
    { label: 'Projekt anlegen', description: 'Fürs Portfolio', icon: FolderPlus, to: withCreateIntent('/dashboard/projects') },
    { label: 'Benutzer anlegen', description: 'Dashboard-Zugang', icon: UserPlus, to: withCreateIntent('/dashboard/users') },
    { label: 'API-Key erstellen', description: 'Für eine Origin', icon: KeyRound, to: withCreateIntent('/dashboard/api-keys') },
]
