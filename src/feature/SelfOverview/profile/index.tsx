import ContentSection from "@/feature/SelfOverview/components/content-section.tsx";
import ProfileForm from "@/feature/SelfOverview/profile/profile-form.tsx";
import {useSelfUser} from "@/api/self/hooks.ts";
import {Spinner} from "@/components/ui/kibo-ui/spinner/index.tsx";

function SettingsProfile() {
    const [selfUser] = useSelfUser();

    if (selfUser.isLoading) {
        return (
            <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
                <Spinner size={16} />
                Loading...
            </div>
        );
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