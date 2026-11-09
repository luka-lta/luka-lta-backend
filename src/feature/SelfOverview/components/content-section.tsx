import type { ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface ContentSectionProps {
    title: string
    desc: ReactNode
    children: ReactNode
}

/** Ein Einstellungsbereich: Card mit Titel, Beschreibung und Formular. */
export default function ContentSection({ title, desc, children }: ContentSectionProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{desc}</CardDescription>
            </CardHeader>
            <CardContent>{children}</CardContent>
        </Card>
    )
}
