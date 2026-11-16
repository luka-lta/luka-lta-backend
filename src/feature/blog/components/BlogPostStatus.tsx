import { StatusBadge } from '@/components/feedback/status-badge'

export function BlogPostStatus({ published }: { published: boolean }) {
    return <StatusBadge tone={published ? 'success' : 'neutral'}>{published ? 'Veröffentlicht' : 'Entwurf'}</StatusBadge>
}
