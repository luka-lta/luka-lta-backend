import { Link } from 'react-router-dom'
import { FileQuestion } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageContainer } from '@/components/layout/page'
import { EmptyState } from '@/components/feedback/empty-state'

/** Unbekannte Route innerhalb des Dashboards; Sidebar und Header bleiben stehen. */
export default function NotFoundPage() {
    return (
        <PageContainer title='Seite nicht gefunden'>
            <EmptyState
                icon={FileQuestion}
                title='Seite nicht gefunden'
                description='Diese Adresse gibt es im Dashboard nicht. Nutze die Navigation links oder geh zur Übersicht.'
                action={
                    <Button asChild>
                        <Link to='/dashboard'>Zur Übersicht</Link>
                    </Button>
                }
                className='py-20'
            />
        </PageContainer>
    )
}
