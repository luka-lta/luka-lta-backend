import ContentSection from "@/feature/SelfOverview/components/content-section.tsx";
import ProfileForm from "@/feature/SelfOverview/profile/profile-form.tsx";
import {useSelfUser} from "@/feature/SelfOverview/hooks/useUserList.ts";

function SettingsProfile() {
    const [selfUser] = useSelfUser();

    if (selfUser.isLoading) {
        return <div>Loading...</div>;
    }

    if (selfUser.isError) {
        return <div>Error: {selfUser.error.message}</div>;
    }

    return (
        <ContentSection
            title='Profile'
            desc='This is how others will see you on the site.'
        >
            <ProfileForm user={selfUser.data?.user ?? undefined}/>
        </ContentSection>
    );
}

export default SettingsProfile;