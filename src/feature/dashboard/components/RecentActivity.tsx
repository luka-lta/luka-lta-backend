import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Empty, EmptyMedia, EmptyTitle } from "@/components/ui/empty.tsx";
import { TimeCell } from "@/components/TimeCell.tsx";
import { BookOpen, ListTree } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils.ts";
import type { BlogPostType } from "@/feature/blog/schema/BlogSchema.ts";
import type { LinkItemTypeSchema } from "@/feature/linktree/schema/LinktreeSchema.ts";

interface ActivityItem {
    id: string;
    icon: typeof BookOpen;
    className: string;
    title: string;
    description: string;
    timestamp: string;
    href: string;
}

interface RecentActivityProps {
    posts: BlogPostType[];
    links: LinkItemTypeSchema[];
}

export function RecentActivity({ posts, links }: RecentActivityProps) {
    const postItems: ActivityItem[] = posts.map((post) => ({
        id: `post-${post.blogId}`,
        icon: BookOpen,
        className: "text-emerald-500 bg-emerald-500/10",
        title: post.title,
        description: post.isPublished ? "Published" : "Saved as draft",
        timestamp: post.updatedAt ?? post.createdAt,
        href: `/dashboard/blog`,
    }));

    const linkItems: ActivityItem[] = links.map((link) => ({
        id: `link-${link.id}`,
        icon: ListTree,
        className: "text-sky-500 bg-sky-500/10",
        title: link.displayname,
        description: link.isActive ? "Link added" : "Link deactivated",
        timestamp: link.createdOn,
        href: `/dashboard/linktree`,
    }));

    const items = [...postItems, ...linkItems]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 6);

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-base">Recent activity</CardTitle>
            </CardHeader>
            <CardContent>
                {items.length === 0 ? (
                    <Empty className="border-0 py-8">
                        <EmptyMedia variant="icon">
                            <BookOpen />
                        </EmptyMedia>
                        <EmptyTitle>No recent activity yet</EmptyTitle>
                    </Empty>
                ) : (
                    <ul className="space-y-1">
                        {items.map((item) => {
                            const Icon = item.icon;
                            return (
                                <li key={item.id}>
                                    <Link
                                        to={item.href}
                                        className="flex items-start gap-3 rounded-md p-2 -mx-2 hover:bg-muted/50 transition-colors"
                                    >
                                        <div className={cn("rounded-md p-1.5 shrink-0", item.className)}>
                                            <Icon className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{item.title}</p>
                                            <p className="text-sm text-muted-foreground">{item.description}</p>
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
