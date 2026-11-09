import ContentSection from "@/feature/SelfOverview/components/content-section.tsx";
import ProfileForm from "@/feature/SelfOverview/profile/profile-form.tsx";
import { useSelfUser } from "@/api/self/hooks.ts";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { ErrorState } from "@/components/feedback/error-state.tsx";

function SettingsProfile() {
    const [selfUser] = useSelfUser();

    if (selfUser.isPending) {
        return <Skeleton className="h-96 rounded-xl" aria-label="Wird geladen" />;
    }

    if (selfUser.isError) {
        return <ErrorState title="Profil konnte nicht geladen werden" error={selfUser.error} onRetry={() => selfUser.refetch()} />;
    }

    return (
        <ContentSection title="Profil" desc="Name, E-Mail und Avatar deines Kontos.">
            <ProfileForm user={selfUser.data?.user ?? undefined} />
        </ContentSection>
    );
}

export default SettingsProfile;
