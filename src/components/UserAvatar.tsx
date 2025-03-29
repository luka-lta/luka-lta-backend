import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar.tsx";
import {splitAvatarUrl} from "@/lib/utils.ts";

interface UserAvatarProps {
    avatar: string;
    alt: string;
    className?: string;
}

function UserAvatar({ avatar, className, alt }: UserAvatarProps) {
    return (
        <Avatar className={className}>
            <AvatarImage src={splitAvatarUrl(avatar)} alt={alt}/>
            <AvatarFallback><strong>?</strong></AvatarFallback>
        </Avatar>
    );
}

export default UserAvatar;