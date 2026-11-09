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
    { label: 'Blogbeitrag schreiben', description: 'Neuen Entwurf im Editor öffnen', icon: FilePlus2, to: '/dashboard/blog/create' },
    { label: 'Link anlegen', description: 'Eintrag für die Link-Seite', icon: Link2, to: withCreateIntent('/dashboard/linktree') },
    { label: 'Projekt anlegen', description: 'Neues Portfolio-Projekt', icon: FolderPlus, to: withCreateIntent('/dashboard/projects') },
    { label: 'Benutzer anlegen', description: 'Zugang für das Dashboard', icon: UserPlus, to: withCreateIntent('/dashboard/users') },
    { label: 'API-Key erstellen', description: 'Schlüssel für eine Origin', icon: KeyRound, to: withCreateIntent('/dashboard/api-keys') },
]
