import {LinkItemTypeSchema} from "@/feature/linktree/schema/LinktreeSchema.ts";

interface LinkDetailsProps {
    link: LinkItemTypeSchema;
}

function LinkDetails({link}: LinkDetailsProps) {
    const getTimeAgo = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

        if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
        if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`
        if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`
        return `${Math.floor(diffInSeconds / 31536000)} years ago`
    }

    return (
        <>
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-500">Informations</h2>
            </div>
            <h1 className="text-xl font-bold mt-2">{link.displayname || "Linktree Detail"}</h1>
            <p className="mt-2">Linktree ID: {link.id}</p>
            <div className="mt-4">
                <p>Created: {getTimeAgo(link.createdOn)}</p>
                <p>Status: {link.isActive ? "Active" : "Inactive"}</p>
            </div>
        </>
    );
}

export default LinkDetails;