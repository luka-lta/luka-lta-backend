import ContentSection from "@/feature/SelfOverview/components/content-section.tsx";
import AppearanceForm from "@/feature/SelfOverview/appearance/appearance-form.tsx";

function SettingsAppearance() {
    return (
        <ContentSection title={'Appearance'} desc='Customize the appearance of the app. Automatically switch between day
          and night themes.'
        >
            <AppearanceForm/>
        </ContentSection>
    );
}

export default SettingsAppearance;