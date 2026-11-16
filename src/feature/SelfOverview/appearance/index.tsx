import ContentSection from '@/feature/SelfOverview/components/content-section.tsx'
import AppearanceForm from '@/feature/SelfOverview/appearance/appearance-form.tsx'

function SettingsAppearance() {
    return (
        <ContentSection
            title='Darstellung'
            desc='Farbschema und Schrift des Dashboards. Änderungen gelten sofort auf diesem Gerät.'
        >
            <AppearanceForm />
        </ContentSection>
    )
}

export default SettingsAppearance
