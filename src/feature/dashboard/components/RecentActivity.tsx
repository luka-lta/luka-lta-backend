import { Link } from "react-router-dom";
import { BookOpen, History, Link2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { TimeCell } from "@/components/TimeCell.tsx";
import { EmptyState } from "@/components/feedback/empty-state.tsx";
import type { BlogPostType } from "@/feature/blog/schema/BlogSchema.ts";
import type { LinkItemTypeSchema } from "@/feature/linktree/schema/LinktreeSchema.ts";
import { parseSqlUtc } from "@/lib/dateTimeUtils.ts";

interface ActivityItem {
    id: string;
    icon: typeof BookOpen;
    title: string;
    description: string;
    timestamp: string;
    href: string;
}

interface RecentActivityProps {
    posts: BlogPostType[];
    links: LinkItemTypeSchema[];
    loading?: boolean;
}

const LIMIT = 6;

export function RecentActivity({ posts, links, loading }: RecentActivityProps) {
    const items: ActivityItem[] = [
        ...posts.map((post) => ({
            id: `post-${post.blogId}`,
            icon: BookOpen,
            title: post.title,
            description: post.updatedAt ? "Beitrag bearbeitet" : post.isPublished ? "Beitrag veröffentlicht" : "Entwurf angelegt",
            timestamp: post.updatedAt ?? post.createdAt,
            href: `/dashboard/blog/${post.blogId}`,
        })),
        ...links.map((link) => ({
            id: `link-${link.id}`,
            icon: Link2,
            title: link.displayname,
            description: link.deactivated ? "Link deaktiviert" : "Link angelegt",
            timestamp: link.createdOn,
            href: `/dashboard/linktree/${link.id}`,
        })),
    ]
        .sort((a, b) => parseSqlUtc(b.timestamp).toMillis() - parseSqlUtc(a.timestamp).toMillis())
        .slice(0, LIMIT);

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle>Letzte Aktivität</CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="space-y-3" aria-busy="true" aria-label="Wird geladen">
                        {Array.from({ length: 4 }, (_, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <Skeleton className="size-8 rounded-lg" />
                                <div className="flex-1 space-y-1.5">
                                    <Skeleton className="h-4 w-1/2" />
                                    <Skeleton className="h-3 w-1/4" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : items.length === 0 ? (
                    <EmptyState variant="plain" className="py-8" icon={History} title="Noch keine Aktivität" description="Neue Beiträge und Links erscheinen hier." />
                ) : (
                    <ul className="-mx-2 space-y-0.5">
                        {items.map((item) => {
                            const Icon = item.icon;
                            return (
                                <li key={item.id}>
                                    <Link
                                        to={item.href}
                                        className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors duration-fast hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    >
                                        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                            <Icon className="size-4" aria-hidden />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium">{item.title}</p>
                                            <p className="text-xs text-muted-foreground">{item.description}</p>
                                        </div>
                                        <TimeCell iso={item.timestamp} />
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </CardContent>
        </Card>
    );
}
