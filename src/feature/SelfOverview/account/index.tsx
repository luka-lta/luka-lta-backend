import ContentSection from '@/feature/SelfOverview/components/content-section.tsx'
import PasswordOverview from '@/feature/SelfOverview/components/PasswordOverview.tsx'

function SettingsAccount() {
    return (
        <ContentSection
            title='Passwort ändern'
            desc='Wähle ein neues Passwort für deinen Zugang. Danach gilt es bei der nächsten Anmeldung.'
        >
            <PasswordOverview />
        </ContentSection>
    )
}

export default SettingsAccount
